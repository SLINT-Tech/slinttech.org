import type { Context } from '@netlify/functions';
import { db } from '../../src/db';
import { mentorMenteeRelationships, userProfiles } from '../../src/db/schema';
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

    const url = new URL(req.url);
    const menteeId = url.searchParams.get('menteeId');

    if (!menteeId) {
      return new Response(JSON.stringify({ error: 'Mentee ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const relationships = await db
      .select({
        id: mentorMenteeRelationships.id,
        mentorId: mentorMenteeRelationships.mentorId,
        courseName: mentorMenteeRelationships.courseName,
        mentorFullName: userProfiles.fullName,
        mentorSpecialization: userProfiles.specialization,
        mentorCareerPath: userProfiles.careerPath
      })
      .from(mentorMenteeRelationships)
      .leftJoin(userProfiles, eq(mentorMenteeRelationships.mentorId, userProfiles.id))
      .where(eq(mentorMenteeRelationships.menteeId, menteeId));

    const assignments = relationships.map(rel => ({
      id: rel.id,
      mentor: rel.mentorId,
      courseName: rel.courseName,
      mentorName: rel.mentorFullName || 'Unknown Mentor'
    }));

    return new Response(JSON.stringify({
      assignments
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Error fetching mentor assignments:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch mentor assignments',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
