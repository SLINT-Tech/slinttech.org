import { Queue } from "bullmq";
import { createRedisConnection, isClusterMode } from "../config/redis.js";
import { createBrevoService } from "../services/brevo.service.js";
import {
  renderAccountAwaitingApproval,
  renderApplicationStatusUpdate,
  renderPaymentSuccess,
  renderCourseEnrollment,
  renderTaskSubmissionMentor,
  renderTaskReviewMentee,
  renderDirectMessage,
  renderAdminNewUserNotification,
  getStatusEmailData,
  getTaskReviewEmailData,
} from "../services/email-templates.js";

export type EmailType =
  | "account-awaiting-approval"
  | "application-status-update"
  | "payment-success"
  | "course-enrollment"
  | "task-submission-mentor"
  | "task-review-mentee"
  | "direct-message"
  | "admin-new-user-notification";

export interface EmailJobData {
  type: EmailType;
  to: { email: string; name: string };
  data: Record<string, any>;
  correlationId?: string;
}

// Track Redis availability
let redisAvailable = false;
let emailQueue: Queue<EmailJobData> | null = null;

// Try to initialize Redis connection with timeout
const initRedis = async () => {
  const REDIS_URL = process.env.REDIS_URL;

  // Skip Redis if not configured
  if (!REDIS_URL) {
    console.log(
      "[EMAIL_QUEUE] Redis URL not configured - using direct email sending"
    );
    return;
  }

  try {
    const connection = createRedisConnection();
    const useCluster = isClusterMode();

    // Test connection with 10 second timeout (Azure can be slow)
    await Promise.race([
      new Promise<void>((resolve, reject) => {
        connection.once("ready", () => {
          redisAvailable = true;
          resolve();
        });
        connection.once("error", (err) => {
          reject(err);
        });
      }),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("Redis connection timeout")), 10000)
      ),
    ]);

    // For Redis Cluster (Azure Managed Redis), use hash tags to ensure
    // all queue keys are in the same hash slot
    // Queue name with hash tag: {email} ensures all keys go to same slot
    const queueName = useCluster ? "{email}" : "email";

    console.log(
      `[EMAIL_QUEUE] Creating queue "${queueName}" (cluster mode: ${useCluster})`
    );

    emailQueue = new Queue<EmailJobData>(queueName, {
      connection,
      // Use prefix with hash tag for cluster mode
      prefix: useCluster ? "{bull}" : "bull",
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: {
          count: 100,
          age: 24 * 60 * 60,
        },
        removeOnFail: {
          count: 500,
          age: 7 * 24 * 60 * 60,
        },
      },
    });

    console.log("[EMAIL_QUEUE] ✅ Redis connected - using queue for emails");
  } catch (error) {
    console.warn(
      "[EMAIL_QUEUE] ⚠️ Redis not available - using direct email sending:",
      error instanceof Error ? error.message : error
    );
    redisAvailable = false;
  }
};

// Initialize Redis (non-blocking)
initRedis().catch(console.error);

// Generate correlation ID for request tracking
function generateCorrelationId(): string {
  return `email_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Send email directly (fallback when Redis is unavailable)
 */
async function sendEmailDirect(params: EmailJobData): Promise<void> {
  const { type, to, data } = params;
  const brevoService = createBrevoService();

  let emailHtml: string;
  let subject: string;

  // Generate email content based on type
  switch (type) {
    case "account-awaiting-approval":
      emailHtml = renderAccountAwaitingApproval(data as any);
      subject = "Welcome to SlintTech - Account Awaiting Approval";
      break;

    case "application-status-update":
      const statusData = getStatusEmailData(data.status);
      emailHtml = renderApplicationStatusUpdate({
        userName: data.userName,
        ...statusData,
      });
      subject = `SlintTech Application Status: ${statusData.statusText}`;
      break;

    case "payment-success":
      emailHtml = renderPaymentSuccess(data as any);
      subject = "Payment Successful - SlintTech Membership Activated";
      break;

    case "course-enrollment":
      emailHtml = renderCourseEnrollment(data as any);
      subject = `You've Been Enrolled in ${data.courseTitle}`;
      break;

    case "task-submission-mentor":
      emailHtml = renderTaskSubmissionMentor(data as any);
      subject = `New Task Submission from ${data.menteeName}`;
      break;

    case "task-review-mentee":
      const reviewData = getTaskReviewEmailData(data.status);
      emailHtml = renderTaskReviewMentee({
        ...data,
        ...reviewData,
      } as any);
      subject = `Task Review: ${data.taskTitle} - ${reviewData.reviewStatus}`;
      break;

    case "direct-message":
      emailHtml = renderDirectMessage(data as any);
      subject = `New Message from ${data.mentorName}`;
      break;

    case "admin-new-user-notification":
      emailHtml = renderAdminNewUserNotification(data as any);
      subject = `New ${data.userRole} Registration - ${data.userName}`;
      break;

    default:
      throw new Error(`Invalid email type: ${type}`);
  }

  await brevoService.sendEmail({
    to: [to],
    subject,
    htmlContent: emailHtml,
  });

  console.log(`[EMAIL_DIRECT] Email sent:`, {
    type,
    to: to.email,
    correlationId: params.correlationId,
  });
}

/**
 * Queue an email for background processing
 * Falls back to direct sending if Redis is unavailable
 */
export async function queueEmail(
  params: Omit<EmailJobData, "correlationId">
): Promise<string> {
  const correlationId = generateCorrelationId();
  const jobData = { ...params, correlationId };

  // If Redis is available and queue exists, use the queue
  if (redisAvailable && emailQueue) {
    try {
      const job = await emailQueue.add("send-email", jobData, {
        priority: getEmailPriority(params.type),
      });

      console.log(`[EMAIL_QUEUE] Job ${job.id} queued:`, {
        type: params.type,
        to: params.to.email,
        correlationId,
      });

      return correlationId;
    } catch (error) {
      console.warn(
        "[EMAIL_QUEUE] Failed to queue email, falling back to direct send:",
        error
      );
    }
  }

  // Fallback: send email directly (non-blocking)
  sendEmailDirect(jobData).catch((error) => {
    console.error("[EMAIL_DIRECT] Failed to send email:", {
      type: params.type,
      to: params.to.email,
      error: error instanceof Error ? error.message : error,
    });
  });

  return correlationId;
}

/**
 * Get email priority based on type
 * Lower number = higher priority
 */
function getEmailPriority(type: EmailType): number {
  switch (type) {
    case "payment-success":
      return 1; // Highest priority - payment confirmations
    case "application-status-update":
      return 2; // High priority - status updates
    case "account-awaiting-approval":
      return 3; // Medium-high - new registrations
    case "task-submission-mentor":
    case "task-review-mentee":
      return 4; // Medium priority - task notifications
    case "course-enrollment":
      return 5; // Medium priority - course notifications
    case "direct-message":
      return 6; // Lower priority - messages
    case "admin-new-user-notification":
      return 7; // Lowest priority - admin notifications
    default:
      return 5;
  }
}

// Export the queue (may be null if Redis is not available)
export { emailQueue };
export default emailQueue;
