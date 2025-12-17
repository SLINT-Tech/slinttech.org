import { Queue } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';

export type EmailType = 
  | 'account-awaiting-approval'
  | 'application-status-update'
  | 'payment-success'
  | 'course-enrollment'
  | 'task-submission-mentor'
  | 'task-review-mentee'
  | 'direct-message'
  | 'admin-new-user-notification';

export interface EmailJobData {
  type: EmailType;
  to: { email: string; name: string };
  data: Record<string, any>;
  correlationId?: string;
}

// Create the email queue
const connection = createRedisConnection();

export const emailQueue = new Queue<EmailJobData>('email', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5 seconds initial delay
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 60 * 60, // Keep for 24 hours
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs for debugging
      age: 7 * 24 * 60 * 60, // Keep for 7 days
    },
  },
});

// Generate correlation ID for request tracking
function generateCorrelationId(): string {
  return `email_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Queue an email for background processing
 */
export async function queueEmail(params: Omit<EmailJobData, 'correlationId'>): Promise<string> {
  const correlationId = generateCorrelationId();
  
  const job = await emailQueue.add('send-email', {
    ...params,
    correlationId,
  }, {
    priority: getEmailPriority(params.type),
  });

  console.log(`[EMAIL_QUEUE] Job ${job.id} queued:`, {
    type: params.type,
    to: params.to.email,
    correlationId,
  });

  return correlationId;
}

/**
 * Get email priority based on type
 * Lower number = higher priority
 */
function getEmailPriority(type: EmailType): number {
  switch (type) {
    case 'payment-success':
      return 1; // Highest priority - payment confirmations
    case 'application-status-update':
      return 2; // High priority - status updates
    case 'account-awaiting-approval':
      return 3; // Medium-high - new registrations
    case 'task-submission-mentor':
    case 'task-review-mentee':
      return 4; // Medium priority - task notifications
    case 'course-enrollment':
      return 5; // Medium priority - course notifications
    case 'direct-message':
      return 6; // Lower priority - messages
    case 'admin-new-user-notification':
      return 7; // Lowest priority - admin notifications
    default:
      return 5;
  }
}

// Queue event listeners for logging
emailQueue.on('error', (err) => {
  console.error('[EMAIL_QUEUE] Queue error:', err);
});

export default emailQueue;

