import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { courses, lessons } from '../../src/db/schema';
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

interface CreateLessonRequest {
  courseId: string;
  title: string;
  description: string;
  link: string;
}

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

    if (decoded.role !== 'Mentor') {
      return new Response(JSON.stringify({ error: 'Only mentors can create lessons' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const body: CreateLessonRequest = await req.json();
    const { courseId, title, description, link } = body;

    if (!courseId || !title || !link) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        details: 'courseId, title, and link are required'
      }), {
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
      return new Response(JSON.stringify({ error: 'Course not found or you do not have permission' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const newLesson = await db
      .insert(lessons)
      .values({
        courseId,
        mentorId,
        title: title.trim(),
        description: description?.trim() || '',
        link: link.trim()
      })
      .returning();

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: newLesson[0].id,
        courseId: newLesson[0].courseId,
        title: newLesson[0].title,
        description: newLesson[0].description,
        link: newLesson[0].link,
        createdAt: newLesson[0].createdAt
      }
    }), {
      status: 201,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Create lesson error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
