export interface EmailRequest {
  type: 'account-awaiting-approval' | 'application-status-update' | 'payment-success' |
        'course-enrollment' | 'task-submission-mentor' | 'task-review-mentee' | 'direct-message' |
        'admin-new-user-notification';
  to: { email: string; name: string };
  data: any;
}

export const queueEmail = async (emailRequest: EmailRequest): Promise<boolean> => {
  try {
    console.log('=== EMAIL QUEUE START ===');
    console.log('Email request:', {
      type: emailRequest.type,
      to: emailRequest.to.email,
      dataKeys: Object.keys(emailRequest.data)
    });

    const siteUrl = process.env.URL || process.env.DEPLOY_URL || process.env.SITE_URL || 'https://slinttech.netlify.app';
    const backgroundFunctionUrl = `${siteUrl}/.netlify/functions/send-email-background`;

    console.log('Environment URLs:', {
      URL: process.env.URL,
      DEPLOY_URL: process.env.DEPLOY_URL,
      SITE_URL: process.env.SITE_URL,
      finalUrl: backgroundFunctionUrl
    });

    console.log('Making fetch request to:', backgroundFunctionUrl);

    const response = await fetch(backgroundFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailRequest)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const responseData = await response.json();
      console.log('Background function response:', responseData);
      console.log('=== EMAIL QUEUED SUCCESSFULLY ===');
      return true;
    } else {
      const errorText = await response.text();
      console.error('Failed to queue email:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      console.log('=== EMAIL QUEUE FAILED ===');
      return false;
    }
  } catch (error: any) {
    console.error('Error queueing email:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    console.log('=== EMAIL QUEUE ERROR ===');
    return false;
  }
};
