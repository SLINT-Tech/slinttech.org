import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { mentorMenteeRelationships, userProfiles, courseEnrollments } from '../../src/db/schema';
import { eq, and, notInArray } from 'drizzle-orm';

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
      .select({
        menteeId: mentorMenteeRelationships.menteeId,
        status: mentorMenteeRelationships.status,
        fullName: userProfiles.fullName,
        email: userProfiles.email,
        profilePicture: userProfiles.profilePicture
      })
      .from(mentorMenteeRelationships)
      .innerJoin(userProfiles, eq(mentorMenteeRelationships.menteeId, userProfiles.id))
      .where(
        and(
          eq(mentorMenteeRelationships.mentorId, mentorId),
          eq(mentorMenteeRelationships.status, 'active')
        )
      );

    if (courseId) {
      const enrolledMentees = await db
        .select({ menteeId: courseEnrollments.menteeId })
        .from(courseEnrollments)
        .where(eq(courseEnrollments.courseId, courseId));

      const enrolledIds = enrolledMentees.map(e => e.menteeId);

      const availableMentees = relationships
        .filter(rel => !enrolledIds.includes(rel.menteeId))
        .map(mentee => ({
          id: mentee.menteeId,
          fullName: mentee.fullName,
          email: mentee.email,
          profilePicture: mentee.profilePicture,
          status: mentee.status
        }));

      return new Response(JSON.stringify({
        success: true,
        data: availableMentees
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    const allMentees = relationships.map(mentee => ({
      id: mentee.menteeId,
      fullName: mentee.fullName,
      email: mentee.email,
      profilePicture: mentee.profilePicture,
      status: mentee.status
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
