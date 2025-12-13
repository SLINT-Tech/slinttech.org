import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { courses } from '../../src/db/schema';
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

interface UpdateStatusRequest {
  courseId: string;
  status: string;
}

export default async (req: Request, context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  if (req.method !== 'PUT') {
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
      return new Response(JSON.stringify({ error: 'Only mentors can update course status' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const body: UpdateStatusRequest = await req.json();
    const { courseId, status } = body;

    if (!courseId || !status) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        details: 'courseId and status are required'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const validStatuses = ['active', 'archived', 'ended'];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({
        error: 'Invalid status',
        details: 'Status must be one of: active, archived, ended'
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
      return new Response(JSON.stringify({ error: 'Course not found or you do not have permission to update it' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const updatedCourse = await db
      .update(courses)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(courses.id, courseId))
      .returning();

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: updatedCourse[0].id,
        status: updatedCourse[0].status,
        updatedAt: updatedCourse[0].updatedAt
      }
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Update course status error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
