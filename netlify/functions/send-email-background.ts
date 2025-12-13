import type { Context } from '@netlify/functions';
import { createBrevoService } from './utils/brevo-service';
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
  formatDate
} from './utils/email-templates';

interface EmailRequest {
  type: 'account-awaiting-approval' | 'application-status-update' | 'payment-success' |
        'course-enrollment' | 'task-submission-mentor' | 'task-review-mentee' | 'direct-message' |
        'admin-new-user-notification';
  to: { email: string; name: string };
  data: any;
  correlationId?: string;
}

// Generate correlation ID for request tracking
function generateCorrelationId(): string {
  return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default async (req: Request, context: Context) => {
  const startTime = Date.now();
  let correlationId: string | undefined;

  try {
    console.log('=== SEND EMAIL BACKGROUND FUNCTION START ===');
    console.log('[TIMESTAMP]', new Date().toISOString());
    console.log('[REQUEST] Method:', req.method);
    console.log('[REQUEST] Headers:', JSON.stringify(Object.fromEntries(req.headers.entries())));

    const body: EmailRequest = await req.json();
    correlationId = body.correlationId || generateCorrelationId();

    console.log(`[CORRELATION_ID] ${correlationId}`);
    console.log('[PAYLOAD] Email Request:', JSON.stringify({
      type: body.type,
      to: body.to?.email,
      toName: body.to?.name,
      dataKeys: body.data ? Object.keys(body.data) : [],
      hasData: !!body.data
    }));

    const { type, to, data } = body;

    // Validate required fields
    if (!type || !to || !data) {
      console.error(`[VALIDATION_ERROR] [${correlationId}] Missing required fields:`, {
        hasType: !!type,
        hasTo: !!to,
        hasData: !!data,
        toEmail: to?.email
      });

      return new Response(JSON.stringify({
        error: 'Missing required fields',
        correlationId
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`[VALIDATION_SUCCESS] [${correlationId}] All required fields present`);

    // Initialize Brevo service
    console.log(`[BREVO_INIT] [${correlationId}] Initializing Brevo service`);
    const brevoService = createBrevoService();
    console.log(`[BREVO_INIT_SUCCESS] [${correlationId}] Brevo service initialized`);

    let emailHtml: string;
    let subject: string;

    // Generate email content based on type
    console.log(`[TEMPLATE_RENDER] [${correlationId}] Rendering template for type: ${type}`);

    switch (type) {
      case 'account-awaiting-approval':
        emailHtml = renderAccountAwaitingApproval(data);
        subject = 'Welcome to SlintTech - Account Awaiting Approval';
        console.log(`[TEMPLATE_SUCCESS] [${correlationId}] Account awaiting approval template rendered`);
        break;

      case 'application-status-update':
        const statusData = getStatusEmailData(data.status);
        emailHtml = renderApplicationStatusUpdate({
          userName: data.userName,
          ...statusData
        });
        subject = `SlintTech Application Status: ${statusData.statusText}`;
        console.log(`[TEMPLATE_SUCCESS] [${correlationId}] Application status update template rendered for status: ${data.status}`);
        break;

      case 'payment-success':
        emailHtml = renderPaymentSuccess(data);
        subject = 'Payment Successful - SlintTech Membership Activated';
        console.log(`[TEMPLATE_SUCCESS] [${correlationId}] Payment success template rendered`);
        break;

      case 'course-enrollment':
        emailHtml = renderCourseEnrollment(data);
        subject = `You've Been Enrolled in ${data.courseTitle}`;
        console.log(`[TEMPLATE_SUCCESS] [${correlationId}] Course enrollment template rendered for: ${data.courseTitle}`);
        break;

      case 'task-submission-mentor':
        emailHtml = renderTaskSubmissionMentor(data);
        subject = `New Task Submission from ${data.menteeName}`;
        console.log(`[TEMPLATE_SUCCESS] [${correlationId}] Task submission notification template rendered`);
        break;

      case 'task-review-mentee':
        const reviewData = getTaskReviewEmailData(data.status);
        emailHtml = renderTaskReviewMentee({
          ...data,
          ...reviewData
        });
        subject = `Task Review: ${data.taskTitle} - ${reviewData.reviewStatus}`;
        console.log(`[TEMPLATE_SUCCESS] [${correlationId}] Task review template rendered with status: ${data.status}`);
        break;

      case 'direct-message':
        emailHtml = renderDirectMessage(data);
        subject = `New Message from ${data.mentorName}`;
        console.log(`[TEMPLATE_SUCCESS] [${correlationId}] Direct message template rendered`);
        break;

      case 'admin-new-user-notification':
        emailHtml = renderAdminNewUserNotification(data);
        subject = `New ${data.userRole} Registration - ${data.userName}`;
        console.log(`[TEMPLATE_SUCCESS] [${correlationId}] Admin notification template rendered`);
        break;

      default:
        console.error(`[TEMPLATE_ERROR] [${correlationId}] Invalid email type: ${type}`);
        return new Response(JSON.stringify({
          error: 'Invalid email type',
          type,
          correlationId
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    console.log(`[EMAIL_SEND] [${correlationId}] Sending email via Brevo:`, JSON.stringify({
      type,
      to: to.email,
      toName: to.name,
      subject,
      htmlLength: emailHtml.length
    }));

    const sendStartTime = Date.now();
    await brevoService.sendEmail({
      to: [to],
      subject,
      htmlContent: emailHtml
    });
    const sendDuration = Date.now() - sendStartTime;

    console.log(`[EMAIL_SUCCESS] [${correlationId}] Email sent successfully:`, JSON.stringify({
      type,
      recipient: to.email,
      subject,
      sendDurationMs: sendDuration
    }));

    const totalDuration = Date.now() - startTime;
    console.log(`[PERFORMANCE] [${correlationId}] Total execution time: ${totalDuration}ms`);
    console.log(`=== SEND EMAIL BACKGROUND FUNCTION SUCCESS [${correlationId}] ===`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      type,
      recipient: to.email,
      correlationId,
      durationMs: totalDuration
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    const totalDuration = Date.now() - startTime;

    console.error(`=== SEND EMAIL BACKGROUND FUNCTION ERROR ${correlationId ? `[${correlationId}]` : ''} ===`);
    console.error(`[ERROR_TIMESTAMP] ${new Date().toISOString()}`);
    console.error('[ERROR_TYPE]', error.name || 'Unknown');
    console.error('[ERROR_MESSAGE]', error.message);
    console.error('[ERROR_STACK]', error.stack);
    console.error(`[ERROR_DURATION] ${totalDuration}ms`);

    // Categorize error type
    let errorCategory = 'UNKNOWN_ERROR';
    if (error.message?.includes('Brevo') || error.message?.includes('API')) {
      errorCategory = 'BREVO_API_ERROR';
    } else if (error.message?.includes('JSON')) {
      errorCategory = 'JSON_PARSE_ERROR';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorCategory = 'NETWORK_ERROR';
    }

    console.error('[ERROR_CATEGORY]', errorCategory);

    return new Response(JSON.stringify({
      error: 'Failed to send email',
      details: error.message,
      category: errorCategory,
      correlationId,
      durationMs: totalDuration,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
