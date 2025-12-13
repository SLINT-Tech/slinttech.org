import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { courses } from '../../src/db/schema';
import { eq, desc } from 'drizzle-orm';

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

    const mentorId = decoded.userId;

    const mentorCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.mentorId, mentorId))
      .orderBy(desc(courses.createdAt));

    const totalCourses = mentorCourses.length;
    const activeCourses = mentorCourses.filter(c => c.status === 'active').length;
    const totalEnrollments = mentorCourses.reduce((sum, c) => sum + (c.enrolledMenteesCount || 0), 0);

    const formattedCourses = mentorCourses.map(course => ({
      id: course.id,
      name: course.name,
      duration: course.duration,
      description: course.description,
      status: course.status,
      enrolledMentees: course.enrolledMenteesCount || 0,
      createdAt: course.createdAt
    }));

    return new Response(JSON.stringify({
      success: true,
      data: {
        courses: formattedCourses,
        stats: {
          totalCourses,
          activeCourses,
          totalEnrollments
        }
      }
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Get mentor courses error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
