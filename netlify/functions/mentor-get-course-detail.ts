import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { courses, lessons, tasks } from '../../src/db/schema';
import { eq, and } from 'drizzle-orm';

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

    if (!courseId) {
      return new Response(JSON.stringify({ error: 'courseId is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const mentorId = decoded.userId;

    const course = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.mentorId, mentorId)))
      .limit(1);

    if (course.length === 0) {
      return new Response(JSON.stringify({ error: 'Course not found or you do not have permission to view it' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const courseLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, courseId));

    const courseTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.courseId, courseId));

    const courseData = {
      id: course[0].id,
      name: course[0].name,
      duration: course[0].duration,
      description: course[0].description,
      status: course[0].status,
      enrolledMentees: course[0].enrolledMenteesCount || 0,
      createdAt: course[0].createdAt,
      lessons: courseLessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        link: lesson.link,
        createdAt: lesson.createdAt
      })),
      tasks: courseTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        status: task.status,
        frequency: task.frequency,
        requirements: task.requirements || [],
        createdAt: task.createdAt
      }))
    };

    return new Response(JSON.stringify({
      success: true,
      data: courseData
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Get course detail error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
