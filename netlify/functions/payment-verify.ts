import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { userProfiles } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import { queueEmail } from './utils/email-queue';

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
        email: userProfiles.email,
        fullName: userProfiles.fullName,
        membershipPaid: userProfiles.membershipPaid,
        membershipAmount: userProfiles.membershipAmount,
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

    const expectedAmount = parseFloat(user.membershipAmount || '30.00');
    const expectedAmountInKobo = Math.round(expectedAmount * 100);
    const actualAmountPaid = paystackData.data.amount;

    console.log('Amount verification:', {
      expectedAmount,
      expectedAmountInKobo,
      actualAmountPaid,
      userId
    });

    if (actualAmountPaid !== expectedAmountInKobo) {
      console.error('Amount mismatch:', {
        expected: expectedAmountInKobo,
        actual: actualAmountPaid,
        difference: actualAmountPaid - expectedAmountInKobo
      });
      return new Response(JSON.stringify({
        error: 'Payment amount does not match membership fee',
        expectedAmount: expectedAmount,
        paidAmount: actualAmountPaid / 100
      }), {
        status: 400,
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

    queueEmail({
      type: 'payment-success',
      to: { email: user.email, name: user.fullName },
      data: {
        userName: user.fullName,
        paymentReference: reference,
        amount: `GHS ${(paystackData.data.amount / 100).toFixed(2)}`,
        paymentDate: new Date(paystackData.data.paid_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        dashboardLink: `${process.env.VITE_APP_URL || 'https://slinttech.netlify.app'}/${user.role.toLowerCase()}/dashboard`
      }
    });

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
