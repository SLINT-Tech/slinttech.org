import { createBrevoService } from './brevo-service';
import {
  renderAccountAwaitingApproval,
  renderApplicationStatusUpdate,
  renderPaymentSuccess,
  renderCourseEnrollment,
  renderTaskSubmissionMentor,
  renderTaskReviewMentee,
  renderDirectMessage,
  renderAdminNewUserNotification
} from './email-templates';

interface EmailRequest {
  type: 'account-awaiting-approval' | 'application-status-update' | 'payment-success' |
        'course-enrollment' | 'task-submission-mentor' | 'task-review-mentee' | 'direct-message' |
        'admin-new-user-notification';
  to: { email: string; name: string };
  data: any;
}

const EMAIL_SUBJECTS: Record<EmailRequest['type'], string> = {
  'account-awaiting-approval': 'Welcome to SlintTech - Account Awaiting Approval',
  'application-status-update': 'SlintTech - Application Status Update',
  'payment-success': 'Payment Confirmation - SlintTech',
  'course-enrollment': 'Course Enrollment Confirmation - SlintTech',
  'task-submission-mentor': 'New Task Submission - SlintTech',
  'task-review-mentee': 'Task Review Complete - SlintTech',
  'direct-message': 'New Message from Your Mentor - SlintTech',
  'admin-new-user-notification': 'New User Registration - SlintTech Admin'
};

const renderEmailContent = (type: EmailRequest['type'], data: any): string => {
  switch (type) {
    case 'account-awaiting-approval':
      return renderAccountAwaitingApproval(data);
    case 'application-status-update':
      return renderApplicationStatusUpdate(data);
    case 'payment-success':
      return renderPaymentSuccess(data);
    case 'course-enrollment':
      return renderCourseEnrollment(data);
    case 'task-submission-mentor':
      return renderTaskSubmissionMentor(data);
    case 'task-review-mentee':
      return renderTaskReviewMentee(data);
    case 'direct-message':
      return renderDirectMessage(data);
    case 'admin-new-user-notification':
      return renderAdminNewUserNotification(data);
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
};

export const queueEmail = async (emailRequest: EmailRequest): Promise<boolean> => {
  try {
    console.log('Sending email directly:', {
      type: emailRequest.type,
      to: emailRequest.to.email
    });

    const brevoService = createBrevoService();
    const htmlContent = renderEmailContent(emailRequest.type, emailRequest.data);
    const subject = EMAIL_SUBJECTS[emailRequest.type];

    const success = await brevoService.sendEmailSafe({
      to: [emailRequest.to],
      subject,
      htmlContent
    });

    if (success) {
      console.log('Email sent successfully');
      return true;
    } else {
      console.error('Failed to send email');
      return false;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
