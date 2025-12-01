import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { lessons } from '../../src/db/schema';
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

  if (req.method !== 'DELETE') {
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
      return new Response(JSON.stringify({ error: 'Only mentors can delete lessons' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const url = new URL(req.url);
    const lessonId = url.searchParams.get('lessonId');

    if (!lessonId) {
      return new Response(JSON.stringify({
        error: 'Missing required field',
        details: 'lessonId is required'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const mentorId = decoded.userId;

    const existingLesson = await db
      .select()
      .from(lessons)
      .where(and(eq(lessons.id, lessonId), eq(lessons.mentorId, mentorId)))
      .limit(1);

    if (existingLesson.length === 0) {
      return new Response(JSON.stringify({ error: 'Lesson not found or you do not have permission' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    await db
      .delete(lessons)
      .where(eq(lessons.id, lessonId));

    return new Response(JSON.stringify({
      success: true,
      message: 'Lesson deleted successfully'
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Delete lesson error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
