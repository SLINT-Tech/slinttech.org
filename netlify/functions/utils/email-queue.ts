interface EmailRequest {
  type: 'account-awaiting-approval' | 'application-status-update' | 'payment-success' |
        'course-enrollment' | 'task-submission-mentor' | 'task-review-mentee' | 'direct-message' |
        'admin-new-user-notification';
  to: { email: string; name: string };
  data: any;
}

export const queueEmail = async (emailRequest: EmailRequest): Promise<void> => {
  try {
    const response = await fetch('/.netlify/functions/send-email-background', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailRequest)
    });

    if (!response.ok) {
      console.error('Failed to queue email:', await response.text());
    }
  } catch (error) {
    console.error('Error queuing email:', error);
  }
};
