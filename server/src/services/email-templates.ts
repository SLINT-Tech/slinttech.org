import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface TemplateData {
  [key: string]: string | boolean | undefined;
}

const loadTemplate = (templateName: string): string => {
  // Try multiple possible paths for template location
  const possiblePaths = [
    // Relative to this file in src/services/
    join(__dirname, '..', 'templates', `${templateName}.html`),
    // Relative to dist/services/ after build
    join(__dirname, '..', '..', 'templates', `${templateName}.html`),
    // From project root
    join(process.cwd(), 'templates', `${templateName}.html`),
    // From server/templates
    join(process.cwd(), 'server', 'templates', `${templateName}.html`),
  ];

  for (const templatePath of possiblePaths) {
    if (existsSync(templatePath)) {
      return readFileSync(templatePath, 'utf-8');
    }
  }

  throw new Error(`Template not found: ${templateName}. Tried paths: ${possiblePaths.join(', ')}`);
};

const renderTemplate = (template: string, data: TemplateData): string => {
  let rendered = template;

  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, String(value || ''));
  }

  rendered = rendered.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, condition, content) => {
    return data[condition] ? content : '';
  });

  return rendered;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getAppUrl = (): string => {
  return process.env.APP_URL || 'https://slinttech.netlify.app';
};

interface AccountAwaitingApprovalData {
  userName: string;
  userEmail: string;
  userRole: string;
  membershipCategory: string;
  loginLink: string;
}

export const renderAccountAwaitingApproval = (data: AccountAwaitingApprovalData): string => {
  const template = loadTemplate('account-awaiting-approval');
  return renderTemplate(template, { ...data, appUrl: getAppUrl() });
};

interface ApplicationStatusData {
  userName: string;
  statusText: string;
  statusColor: string;
  statusMessage: string;
  showCommunityLinks?: boolean;
  loginLink?: string;
}

export const renderApplicationStatusUpdate = (data: ApplicationStatusData): string => {
  const template = loadTemplate('application-status-update');
  return renderTemplate(template, { ...data, appUrl: getAppUrl() });
};

interface PaymentSuccessData {
  userName: string;
  paymentReference: string;
  amount: string;
  paymentDate: string;
  dashboardLink: string;
}

export const renderPaymentSuccess = (data: PaymentSuccessData): string => {
  const template = loadTemplate('payment-success');
  return renderTemplate(template, { ...data, appUrl: getAppUrl() });
};

interface CourseEnrollmentData {
  menteeName: string;
  courseTitle: string;
  courseDescription: string;
  courseDuration: string;
  courseLevel: string;
  mentorName: string;
  courseLink: string;
}

export const renderCourseEnrollment = (data: CourseEnrollmentData): string => {
  const template = loadTemplate('course-enrollment');
  return renderTemplate(template, { ...data, appUrl: getAppUrl() });
};

interface TaskSubmissionMentorData {
  mentorName: string;
  menteeName: string;
  taskTitle: string;
  courseName: string;
  submissionDate: string;
  submissionContent?: string;
  reviewLink: string;
}

export const renderTaskSubmissionMentor = (data: TaskSubmissionMentorData): string => {
  const template = loadTemplate('task-submission-mentor');
  return renderTemplate(template, { ...data, appUrl: getAppUrl() });
};

interface TaskReviewMenteeData {
  menteeName: string;
  reviewStatus: string;
  statusColor: string;
  taskTitle: string;
  courseName: string;
  mentorName: string;
  reviewDate: string;
  score?: string;
  feedback?: string;
  messageBackgroundColor: string;
  messageBorderColor: string;
  messageTextColor: string;
  nextStepsMessage: string;
  taskLink: string;
}

export const renderTaskReviewMentee = (data: TaskReviewMenteeData): string => {
  const template = loadTemplate('task-review-mentee');
  return renderTemplate(template, { ...data, appUrl: getAppUrl() });
};

interface DirectMessageData {
  menteeName: string;
  mentorName: string;
  mentorEmail: string;
  messageDate: string;
  messageContent: string;
}

export const renderDirectMessage = (data: DirectMessageData): string => {
  const template = loadTemplate('direct-message');
  return renderTemplate(template, { ...data, appUrl: getAppUrl() });
};

interface AdminNewUserNotificationData {
  userName: string;
  userEmail: string;
  userRole: string;
  membershipCategory: string;
  careerPath?: string;
  specialization?: string;
  registrationDate: string;
  adminDashboardLink: string;
}

export const renderAdminNewUserNotification = (data: AdminNewUserNotificationData): string => {
  const template = loadTemplate('admin-new-user-notification');
  return renderTemplate(template, { ...data, appUrl: getAppUrl() });
};

export const getStatusEmailData = (status: string) => {
  const appUrl = getAppUrl();
  
  switch (status) {
    case 'approved':
      return {
        statusText: 'Application Approved!',
        statusColor: '#4CAF50',
        statusMessage: `<p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
          Congratulations! Your application has been approved. You now have full access to the SlintTech platform.
        </p>`,
        showCommunityLinks: true,
        loginLink: `${appUrl}/login`
      };
    case 'rejected':
      return {
        statusText: 'Application Not Approved',
        statusColor: '#f44336',
        statusMessage: `<p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
          We regret to inform you that your application has not been approved at this time. If you believe this is an error or would like more information, please contact our support team.
        </p>`,
        showCommunityLinks: false
      };
    case 'suspended':
      return {
        statusText: 'Account Suspended',
        statusColor: '#FF9800',
        statusMessage: `<p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
          Your account has been temporarily suspended. Please contact our support team for more information.
        </p>`,
        showCommunityLinks: false
      };
    default:
      return {
        statusText: 'Status Updated',
        statusColor: '#2196F3',
        statusMessage: `<p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
          Your application status has been updated. Please log in to view more details.
        </p>`,
        showCommunityLinks: false
      };
  }
};

export const getTaskReviewEmailData = (status: string) => {
  if (status === 'approved') {
    return {
      reviewStatus: 'APPROVED',
      statusColor: '#4CAF50',
      messageBackgroundColor: '#E8F5E9',
      messageBorderColor: '#4CAF50',
      messageTextColor: '#2E7D32',
      nextStepsMessage: 'Great work! Your submission has been approved. Continue to the next task to keep progressing in your learning journey.'
    };
  } else {
    return {
      reviewStatus: 'NEEDS REVISION',
      statusColor: '#f44336',
      messageBackgroundColor: '#FFEBEE',
      messageBorderColor: '#f44336',
      messageTextColor: '#C62828',
      nextStepsMessage: 'Your submission needs some revisions. Please review the feedback from your mentor and resubmit your work.'
    };
  }
};

