import 'dotenv/config';
import { Worker, Job } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';
import { createBrevoService } from '../services/brevo.service.js';
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
} from '../services/email-templates.js';
import type { EmailJobData } from './email.queue.js';

const connection = createRedisConnection();
const brevoService = createBrevoService();

async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const startTime = Date.now();
  const { type, to, data, correlationId } = job.data;

  console.log(`[EMAIL_WORKER] Processing job ${job.id}:`, {
    type,
    to: to.email,
    correlationId,
    attempt: job.attemptsMade + 1,
  });

  let emailHtml: string;
  let subject: string;

  // Generate email content based on type
  switch (type) {
    case 'account-awaiting-approval':
      emailHtml = renderAccountAwaitingApproval(data as any);
      subject = 'Welcome to SlintTech - Account Awaiting Approval';
      break;

    case 'application-status-update':
      const statusData = getStatusEmailData(data.status);
      emailHtml = renderApplicationStatusUpdate({
        userName: data.userName,
        ...statusData
      });
      subject = `SlintTech Application Status: ${statusData.statusText}`;
      break;

    case 'payment-success':
      emailHtml = renderPaymentSuccess(data as any);
      subject = 'Payment Successful - SlintTech Membership Activated';
      break;

    case 'course-enrollment':
      emailHtml = renderCourseEnrollment(data as any);
      subject = `You've Been Enrolled in ${data.courseTitle}`;
      break;

    case 'task-submission-mentor':
      emailHtml = renderTaskSubmissionMentor(data as any);
      subject = `New Task Submission from ${data.menteeName}`;
      break;

    case 'task-review-mentee':
      const reviewData = getTaskReviewEmailData(data.status);
      emailHtml = renderTaskReviewMentee({
        ...data,
        ...reviewData
      } as any);
      subject = `Task Review: ${data.taskTitle} - ${reviewData.reviewStatus}`;
      break;

    case 'direct-message':
      emailHtml = renderDirectMessage(data as any);
      subject = `New Message from ${data.mentorName}`;
      break;

    case 'admin-new-user-notification':
      emailHtml = renderAdminNewUserNotification(data as any);
      subject = `New ${data.userRole} Registration - ${data.userName}`;
      break;

    default:
      throw new Error(`Invalid email type: ${type}`);
  }

  // Send the email
  await brevoService.sendEmail({
    to: [to],
    subject,
    htmlContent: emailHtml
  });

  const duration = Date.now() - startTime;
  console.log(`[EMAIL_WORKER] Job ${job.id} completed in ${duration}ms:`, {
    type,
    to: to.email,
    correlationId,
  });
}

// Create the worker
const worker = new Worker<EmailJobData>('email', processEmailJob, {
  connection,
  concurrency: 5, // Process 5 emails concurrently
  limiter: {
    max: 100, // Max 100 jobs per minute (Brevo rate limit consideration)
    duration: 60000,
  },
});

// Worker event listeners
worker.on('completed', (job) => {
  console.log(`[EMAIL_WORKER] ✅ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[EMAIL_WORKER] ❌ Job ${job?.id} failed:`, {
    error: err.message,
    type: job?.data.type,
    to: job?.data.to.email,
    attempts: job?.attemptsMade,
  });
});

worker.on('error', (err) => {
  console.error('[EMAIL_WORKER] Worker error:', err);
});

worker.on('stalled', (jobId) => {
  console.warn(`[EMAIL_WORKER] ⚠️ Job ${jobId} stalled`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`[EMAIL_WORKER] Received ${signal}. Closing worker...`);
  await worker.close();
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

console.log('🚀 Email worker started and listening for jobs...');

export default worker;

