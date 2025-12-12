import type { Handler } from '@netlify/functions';
import { queueEmail } from './utils/email-queue';

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

    const testEmail = process.env.TEST_EMAIL || 'test@example.com';

    const emailQueued = await queueEmail({
      type: 'account-awaiting-approval',
      to: {
        email: testEmail,
        name: 'Test User'
      },
      data: {
        userName: 'Test User',
        userEmail: testEmail,
        userRole: 'mentee',
        membershipCategory: 'professional'
      }
    });

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: emailQueued,
        message: emailQueued ? 'Test email queued successfully' : 'Failed to queue test email',
        testEmail,
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
        error: 'Failed to queue test email',
        details: error.message
      })
    };
  }
};

export { handler };
