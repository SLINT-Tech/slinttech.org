export interface EmailRequest {
  type: 'account-awaiting-approval' | 'application-status-update' | 'payment-success' |
        'course-enrollment' | 'task-submission-mentor' | 'task-review-mentee' | 'direct-message' |
        'admin-new-user-notification';
  to: { email: string; name: string };
  data: any;
  correlationId?: string;
}

// Generate correlation ID for request tracking
function generateCorrelationId(): string {
  return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const queueEmail = async (emailRequest: EmailRequest): Promise<boolean> => {
  const startTime = Date.now();
  const correlationId = emailRequest.correlationId || generateCorrelationId();

  try {
    console.log('=== EMAIL QUEUE START ===');
    console.log(`[CORRELATION_ID] ${correlationId}`);
    console.log('[TIMESTAMP]', new Date().toISOString());
    console.log('[QUEUE_REQUEST] Email request:', JSON.stringify({
      type: emailRequest.type,
      to: emailRequest.to.email,
      toName: emailRequest.to.name,
      dataKeys: Object.keys(emailRequest.data),
      hasData: !!emailRequest.data
    }));

    const siteUrl = process.env.URL || process.env.DEPLOY_URL || process.env.SITE_URL || 'https://slinttech.netlify.app';
    const backgroundFunctionUrl = `${siteUrl}/.netlify/functions/send-email-background`;

    console.log(`[ENV_URLS] [${correlationId}]`, JSON.stringify({
      URL: process.env.URL,
      DEPLOY_URL: process.env.DEPLOY_URL,
      SITE_URL: process.env.SITE_URL,
      finalUrl: backgroundFunctionUrl
    }));

    console.log(`[FETCH_START] [${correlationId}] Calling background function:`, backgroundFunctionUrl);

    const fetchStartTime = Date.now();

    // Add correlationId to request payload
    const requestPayload = {
      ...emailRequest,
      correlationId
    };

    const response = await fetch(backgroundFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    const fetchDuration = Date.now() - fetchStartTime;

    console.log(`[FETCH_COMPLETE] [${correlationId}] Response received in ${fetchDuration}ms`);
    console.log(`[RESPONSE_STATUS] [${correlationId}]`, response.status);
    console.log(`[RESPONSE_HEADERS] [${correlationId}]`, JSON.stringify(Object.fromEntries(response.headers.entries())));

    const responseText = await response.text();
    console.log(`[RESPONSE_BODY] [${correlationId}]`, responseText || '(empty)');

    // Background functions typically return 202 (Accepted) status
    if (response.status === 202 || response.ok) {
      let backgroundResponse = null;
      if (responseText) {
        try {
          backgroundResponse = JSON.parse(responseText);
          console.log(`[RESPONSE_PARSED] [${correlationId}]`, JSON.stringify(backgroundResponse));
        } catch (e) {
          console.log(`[RESPONSE_NOT_JSON] [${correlationId}] Response is not JSON (expected for background functions)`);
        }
      }

      const totalDuration = Date.now() - startTime;
      console.log(`[PERFORMANCE] [${correlationId}] Total queue time: ${totalDuration}ms`);
      console.log(`=== EMAIL QUEUED SUCCESSFULLY [${correlationId}] ===`);
      return true;
    } else {
      console.error(`[QUEUE_FAILED] [${correlationId}] Background function returned error:`, JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        error: responseText,
        type: emailRequest.type,
        to: emailRequest.to.email
      }));

      const totalDuration = Date.now() - startTime;
      console.error(`[PERFORMANCE] [${correlationId}] Failed after ${totalDuration}ms`);
      console.log(`=== EMAIL QUEUE FAILED [${correlationId}] ===`);
      return false;
    }
  } catch (error: any) {
    const totalDuration = Date.now() - startTime;

    console.error(`=== EMAIL QUEUE ERROR [${correlationId}] ===`);
    console.error(`[ERROR_TIMESTAMP] ${new Date().toISOString()}`);
    console.error(`[ERROR_TYPE] [${correlationId}]`, error.name || 'Unknown');
    console.error(`[ERROR_MESSAGE] [${correlationId}]`, error.message);
    console.error(`[ERROR_STACK] [${correlationId}]`, error.stack);
    console.error(`[ERROR_DURATION] [${correlationId}] ${totalDuration}ms`);
    console.error(`[ERROR_CONTEXT] [${correlationId}]`, JSON.stringify({
      type: emailRequest.type,
      to: emailRequest.to?.email
    }));

    return false;
  }
};
