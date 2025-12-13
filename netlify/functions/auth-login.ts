import type { Context } from '@netlify/functions';
import { db } from '../../src/db';
import { userProfiles } from '../../src/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
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
      headers: corsHeaders
    });
  }

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const [user] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    // Check if user is a mentee (regular users)
    if (user.role !== 'Mentee') {
      return new Response(JSON.stringify({ error: 'Please use the appropriate login page for your account type.' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    const { passwordHash, ...userWithoutPassword } = user;

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    if (user.status === 'pending') {
      return new Response(JSON.stringify({
        error: 'Your account is pending approval',
        profile: userWithoutPassword,
        token
      }), {
        status: 403,
        headers: corsHeaders
      });
    }

    if (user.status === 'rejected') {
      return new Response(JSON.stringify({
        error: 'Your account has been rejected',
        profile: userWithoutPassword
      }), {
        status: 403,
        headers: corsHeaders
      });
    }

    if (user.status === 'suspended') {
      return new Response(JSON.stringify({
        error: 'Your account has been suspended',
        profile: userWithoutPassword
      }), {
        status: 403,
        headers: corsHeaders
      });
    }

    if (user.status === 'approved' && user.membershipEnabled && !user.membershipPaid) {
      return new Response(JSON.stringify({
        requiresPayment: true,
        token,
        profile: userWithoutPassword
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify({
      token,
      profile: userWithoutPassword
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
