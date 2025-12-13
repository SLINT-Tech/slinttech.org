import type { Context } from '@netlify/functions';
import { db } from '../../src/db';
import { userProfiles } from '../../src/db/schema';
import { eq, and } from 'drizzle-orm';
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

export default async (req: Request, context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  if (req.method !== 'GET') {
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
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    if (decoded.role !== 'Admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const mentors = await db
      .select({
        id: userProfiles.id,
        fullName: userProfiles.fullName,
        specialization: userProfiles.specialization,
        careerPath: userProfiles.careerPath
      })
      .from(userProfiles)
      .where(
        and(
          eq(userProfiles.role, 'Mentor'),
          eq(userProfiles.status, 'approved')
        )
      );

    const formattedMentors = mentors.map(mentor => ({
      id: mentor.id,
      full_name: mentor.fullName,
      specialization: mentor.specialization || mentor.careerPath
    }));

    return new Response(JSON.stringify({
      mentors: formattedMentors
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Error fetching mentors:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch mentors',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
