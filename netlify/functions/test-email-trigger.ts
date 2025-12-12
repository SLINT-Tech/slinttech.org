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
    console.log('Test email trigger invoked');

    const siteUrl = process.env.URL || 'https://slinttech.netlify.app';
    const backgroundFunctionUrl = `${siteUrl}/.netlify/functions/test-email-background`;

    console.log('Invoking background function at:', backgroundFunctionUrl);

    const response = await fetch(backgroundFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Background function invocation failed:', errorText);
      throw new Error(`Background function failed: ${errorText}`);
    }

    const result = await response.json();
    console.log('Background function response:', result);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Test email background function triggered and completed',
        backgroundResponse: result,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error: any) {
    console.error('Test email trigger error:', error);
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to trigger test email',
        details: error.message
      })
    };
  }
};

export { handler };
