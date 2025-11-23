import type { Context } from '@netlify/functions';
import { db } from '../../src/db';
import { userProfiles } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET!;

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  membershipCategory: string;
  careerPath?: string;
  role: string;
  status?: string;
  membershipEnabled?: boolean;
  membershipAmount?: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    const token = authHeader.substring(7);
    let decoded: JWTPayload;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    if (decoded.role !== 'Admin') {
      return new Response(JSON.stringify({ error: 'Access denied. Admin privileges required.' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const body: CreateUserRequest = await req.json();
    const {
      fullName,
      email,
      password,
      membershipCategory,
      careerPath,
      role,
      status = 'pending',
      membershipEnabled = false,
      membershipAmount = 30
    } = body;

    if (!fullName || !email || !password || !membershipCategory || !role) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters long' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!['Admin', 'Mentor', 'Mentee'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Invalid role' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!['Student', 'Professional', 'Volunteer'].includes(membershipCategory)) {
      return new Response(JSON.stringify({ error: 'Invalid membership category' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const [existingUser] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.email, email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User with this email already exists' }), {
        status: 409,
        headers: corsHeaders
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(userProfiles)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        membershipCategory,
        careerPath: careerPath || null,
        role,
        status,
        specialization: role === 'Mentor' && careerPath ? careerPath : null,
        membershipEnabled: (role === 'Mentee' || role === 'Mentor') ? membershipEnabled : false,
        membershipAmount: membershipAmount.toString(),
        membershipPaid: (role === 'Mentee' || role === 'Mentor') ? !membershipEnabled : true,
      })
      .returning({
        id: userProfiles.id,
        email: userProfiles.email,
        fullName: userProfiles.fullName,
        role: userProfiles.role,
        membershipCategory: userProfiles.membershipCategory,
        status: userProfiles.status,
        createdAt: userProfiles.createdAt,
      });

    return new Response(JSON.stringify({
      message: 'User created successfully',
      user: newUser,
      temporaryPassword: password
    }), {
      status: 201,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
