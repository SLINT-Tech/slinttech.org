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
}

export default async (req: Request, context: Context) => {
  try {
    const body: EmailRequest = await req.json();
    const { type, to, data } = body;

    if (!type || !to || !data) {
      console.error('Missing required fields for email:', { type, to: to?.email });
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400
      });
    }

    const brevoService = createBrevoService();
    let emailHtml: string;
    let subject: string;

    switch (type) {
      case 'account-awaiting-approval':
        emailHtml = renderAccountAwaitingApproval(data);
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
        emailHtml = renderPaymentSuccess(data);
        subject = 'Payment Successful - SlintTech Membership Activated';
        break;

      case 'course-enrollment':
        emailHtml = renderCourseEnrollment(data);
        subject = `You've Been Enrolled in ${data.courseTitle}`;
        break;

      case 'task-submission-mentor':
        emailHtml = renderTaskSubmissionMentor(data);
        subject = `New Task Submission from ${data.menteeName}`;
        break;

      case 'task-review-mentee':
        const reviewData = getTaskReviewEmailData(data.status);
        emailHtml = renderTaskReviewMentee({
          ...data,
          ...reviewData
        });
        subject = `Task Review: ${data.taskTitle} - ${reviewData.reviewStatus}`;
        break;

      case 'direct-message':
        emailHtml = renderDirectMessage(data);
        subject = `New Message from ${data.mentorName}`;
        break;

      case 'admin-new-user-notification':
        emailHtml = renderAdminNewUserNotification(data);
        subject = `New ${data.userRole} Registration - ${data.userName}`;
        break;

      default:
        console.error('Invalid email type:', type);
        return new Response(JSON.stringify({ error: 'Invalid email type' }), {
          status: 400
        });
    }

    await brevoService.sendEmail({
      to: [to],
      subject,
      htmlContent: emailHtml
    });

    console.log(`Email sent successfully: ${type} to ${to.email}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully'
    }), {
      status: 200
    });

  } catch (error: any) {
    console.error('Background email send error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to send email',
      details: error.message
    }), {
      status: 500
    });
  }
};
