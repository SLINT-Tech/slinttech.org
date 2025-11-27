import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { mentorMenteeRelationships, userProfiles, courseEnrollments } from '../../src/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

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
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    if (decoded.role !== 'Mentor') {
      return new Response(JSON.stringify({ error: 'Only mentors can access this endpoint' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const url = new URL(req.url);
    const courseId = url.searchParams.get('courseId');

    const mentorId = decoded.userId;

    const relationships = await db
      .select()
      .from(mentorMenteeRelationships)
      .where(
        and(
          eq(mentorMenteeRelationships.mentorId, mentorId),
          eq(mentorMenteeRelationships.status, 'active')
        )
      );

    if (relationships.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        data: []
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    const menteeIds = relationships.map(rel => rel.menteeId);

    const menteeProfiles = await db
      .select()
      .from(userProfiles)
      .where(inArray(userProfiles.id, menteeIds));

    if (courseId) {
      const enrolledMentees = await db
        .select()
        .from(courseEnrollments)
        .where(eq(courseEnrollments.courseId, courseId));

      const enrolledIds = enrolledMentees.map(e => e.menteeId);

      const allMenteesWithStatus = menteeProfiles.map(profile => ({
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        profilePicture: profile.profilePicture,
        status: 'active',
        isEnrolled: enrolledIds.includes(profile.id)
      }));

      return new Response(JSON.stringify({
        success: true,
        data: allMenteesWithStatus
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    const allMentees = menteeProfiles.map(profile => ({
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      profilePicture: profile.profilePicture,
      status: 'active',
      isEnrolled: false
    }));

    return new Response(JSON.stringify({
      success: true,
      data: allMentees
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Get assigned mentees error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
