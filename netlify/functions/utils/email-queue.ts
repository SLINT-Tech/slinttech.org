export interface EmailRequest {
  type: 'account-awaiting-approval' | 'application-status-update' | 'payment-success' |
        'course-enrollment' | 'task-submission-mentor' | 'task-review-mentee' | 'direct-message' |
        'admin-new-user-notification';
  to: { email: string; name: string };
  data: any;
}

export const queueEmail = async (emailRequest: EmailRequest): Promise<boolean> => {
  try {
    console.log('Queueing email via background function:', {
      type: emailRequest.type,
      to: emailRequest.to.email
    });

    const siteUrl = process.env.URL || process.env.SITE_URL || 'http://localhost:8888';
    const backgroundFunctionUrl = `${siteUrl}/.netlify/functions/send-email-background`;

    const response = await fetch(backgroundFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailRequest)
    });

    if (response.ok) {
      console.log('Email queued successfully - background function invoked');
      return true;
    } else {
      const errorText = await response.text();
      console.error('Failed to queue email:', {
        status: response.status,
        error: errorText
      });
      return false;
    }
  } catch (error) {
    console.error('Error queueing email:', error);
    return false;
  }
};
