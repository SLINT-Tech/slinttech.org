import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { userProfiles } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET!;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async (req: Request, context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    let decoded: JWTPayload;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { reference } = body;

    if (!reference) {
      return new Response(JSON.stringify({ error: 'Payment reference is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Verifying payment with reference:', reference);

    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!paystackResponse.ok) {
      console.error('Paystack verification failed:', paystackResponse.status);
      return new Response(JSON.stringify({ error: 'Payment verification failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const paystackData = await paystackResponse.json();

    console.log('Paystack response:', JSON.stringify(paystackData, null, 2));

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return new Response(JSON.stringify({
        error: 'Payment not successful',
        paymentStatus: paystackData.data.status
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = paystackData.data.metadata?.userId || decoded.userId;

    const [user] = await db
      .select({
        id: userProfiles.id,
        membershipPaid: userProfiles.membershipPaid,
        role: userProfiles.role
      })
      .from(userProfiles)
      .where(eq(userProfiles.id, userId))
      .limit(1);

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (user.membershipPaid) {
      return new Response(JSON.stringify({
        message: 'Membership already paid',
        alreadyPaid: true
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    await db
      .update(userProfiles)
      .set({
        membershipPaid: true,
        paymentReference: reference,
        paymentDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(userProfiles.id, userId));

    console.log('Payment verified and membership updated for user:', userId);

    return new Response(JSON.stringify({
      message: 'Payment verified successfully',
      paymentDetails: {
        reference: reference,
        amount: paystackData.data.amount / 100,
        paidAt: paystackData.data.paid_at
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
