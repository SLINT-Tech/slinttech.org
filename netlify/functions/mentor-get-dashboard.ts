import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { userProfiles, mentorMenteeRelationships, courses, taskSubmissions } from '../../src/db/schema';
import { eq, and, count, desc } from 'drizzle-orm';

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

    const mentorId = decoded.userId;

    const totalMenteesResult = await db
      .select({ count: count() })
      .from(mentorMenteeRelationships)
      .where(eq(mentorMenteeRelationships.mentorId, mentorId));

    const totalMentees = totalMenteesResult[0]?.count || 0;

    const activeMenteesResult = await db
      .select({ count: count() })
      .from(mentorMenteeRelationships)
      .where(and(
        eq(mentorMenteeRelationships.mentorId, mentorId),
        eq(mentorMenteeRelationships.status, 'active')
      ));

    const activeMentees = activeMenteesResult[0]?.count || 0;

    const totalCoursesResult = await db
      .select({ count: count() })
      .from(courses)
      .where(and(
        eq(courses.mentorId, mentorId),
        eq(courses.status, 'active')
      ));

    const totalCourses = totalCoursesResult[0]?.count || 0;

    const pendingSubmissionsResult = await db
      .select({ count: count() })
      .from(taskSubmissions)
      .innerJoin(courses, eq(courses.id, taskSubmissions.taskId))
      .where(and(
        eq(courses.mentorId, mentorId),
        eq(taskSubmissions.status, 'submitted')
      ));

    const pendingSubmissions = pendingSubmissionsResult[0]?.count || 0;

    const recentCourses = await db
      .select({
        id: courses.id,
        name: courses.name,
        duration: courses.duration,
        description: courses.description,
        enrolledMenteesCount: courses.enrolledMenteesCount,
        createdAt: courses.createdAt,
        status: courses.status
      })
      .from(courses)
      .where(and(
        eq(courses.mentorId, mentorId),
        eq(courses.status, 'active')
      ))
      .orderBy(desc(courses.createdAt))
      .limit(10);

    return new Response(JSON.stringify({
      success: true,
      data: {
        stats: {
          totalMentees,
          activeMentees,
          totalCourses,
          pendingSubmissions
        },
        recentCourses: recentCourses.map(course => ({
          id: course.id,
          name: course.name,
          duration: course.duration,
          description: course.description,
          enrolledMentees: course.enrolledMenteesCount || 0,
          createdAt: course.createdAt,
          status: course.status
        }))
      }
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Get mentor dashboard error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
