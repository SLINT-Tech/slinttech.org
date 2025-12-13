import type { Handler } from '@netlify/functions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    console.log('=== TEST EMAIL TRIGGER START ===');

    const testEmail = 'sadosap473@roastic.com';

    const siteUrl = process.env.URL || process.env.DEPLOY_URL || process.env.SITE_URL || 'https://slinttech.netlify.app';
    const backgroundFunctionUrl = `${siteUrl}/.netlify/functions/test-email-background`;

    console.log('Environment URLs:', {
      URL: process.env.URL,
      DEPLOY_URL: process.env.DEPLOY_URL,
      SITE_URL: process.env.SITE_URL,
      finalUrl: backgroundFunctionUrl
    });

    console.log('Calling test-email-background function at:', backgroundFunctionUrl);

    const response = await fetch(backgroundFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        testEmail,
        timestamp: new Date().toISOString()
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const responseData = await response.json();
      console.log('Background function response:', responseData);
      console.log('=== TEST EMAIL QUEUED SUCCESSFULLY ===');

      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          message: 'Test email queued successfully',
          testEmail,
          backgroundResponse: responseData,
          timestamp: new Date().toISOString()
        })
      };
    } else {
      const errorText = await response.text();
      console.error('Failed to call background function:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      console.log('=== TEST EMAIL QUEUE FAILED ===');

      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          message: 'Failed to queue test email',
          testEmail,
          error: errorText,
          status: response.status,
          timestamp: new Date().toISOString()
        })
      };
    }

  } catch (error: any) {
    console.error('=== TEST EMAIL TRIGGER ERROR ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to trigger test email',
        details: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    };
  }
};

export { handler };
