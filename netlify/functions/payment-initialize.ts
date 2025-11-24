import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { userProfiles } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET!;

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

    const [user] = await db
      .select({
        id: userProfiles.id,
        email: userProfiles.email,
        fullName: userProfiles.fullName,
        role: userProfiles.role,
        status: userProfiles.status,
        membershipEnabled: userProfiles.membershipEnabled,
        membershipAmount: userProfiles.membershipAmount,
        membershipPaid: userProfiles.membershipPaid
      })
      .from(userProfiles)
      .where(eq(userProfiles.id, decoded.userId))
      .limit(1);

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (user.status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Account not approved' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!user.membershipEnabled) {
      return new Response(JSON.stringify({ error: 'Membership not required for this account' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (user.membershipPaid) {
      return new Response(JSON.stringify({ error: 'Membership already paid' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const membershipAmount = parseFloat(user.membershipAmount || '30.00');

    if (membershipAmount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid membership amount' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const paymentReference = `slint_${user.id}_${Date.now()}`;

    const amountInKobo = Math.round(membershipAmount * 100);

    return new Response(JSON.stringify({
      amount: amountInKobo,
      email: user.email,
      reference: paymentReference,
      metadata: {
        userId: user.id,
        fullName: user.fullName,
        role: user.role,
        membershipType: 'One-time Membership'
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Payment initialization error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
