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

    const baseUrl = process.env.URL || 'https://slinttech.netlify.app';
    const backgroundFunctionUrl = `${baseUrl}/.netlify/functions/test-email-background`;

    console.log('Invoking background function at:', backgroundFunctionUrl);

    fetch(backgroundFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString()
      })
    }).catch(error => {
      console.error('Background function invocation error:', error);
    });

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Test email background function triggered',
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
