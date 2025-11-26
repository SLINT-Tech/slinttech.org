import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { lessonProgress, lessons } from '../../src/db/schema';
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

    const menteeId = decoded.userId;
    const body = await req.json();
    const { lessonId } = body;

    if (!lessonId) {
      return new Response(JSON.stringify({ error: 'Lesson ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const lessonExists = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (!lessonExists.length) {
      return new Response(JSON.stringify({ error: 'Lesson not found' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const existing = await db
      .select({ id: lessonProgress.id })
      .from(lessonProgress)
      .where(and(
        eq(lessonProgress.lessonId, lessonId),
        eq(lessonProgress.menteeId, menteeId)
      ))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(lessonProgress)
        .set({
          completed: true,
          completedAt: new Date(),
          updatedAt: new Date()
        })
        .where(and(
          eq(lessonProgress.lessonId, lessonId),
          eq(lessonProgress.menteeId, menteeId)
        ));
    } else {
      await db.insert(lessonProgress).values({
        lessonId,
        menteeId,
        completed: true,
        completedAt: new Date()
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Lesson marked as complete'
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Complete lesson error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
