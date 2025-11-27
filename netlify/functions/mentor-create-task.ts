import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { courses, tasks } from '../../src/db/schema';
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

interface CreateTaskRequest {
  courseId: string;
  title: string;
  description: string;
  requirements: string[];
  deadline: string;
  frequency: string;
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
      return new Response(JSON.stringify({ error: 'Only mentors can create tasks' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const body: CreateTaskRequest = await req.json();
    const { courseId, title, description, requirements, deadline, frequency } = body;

    if (!courseId || !title || !description || !deadline || !frequency) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        details: 'courseId, title, description, deadline, and frequency are required'
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

    const filteredRequirements = requirements.filter(req => req.trim() !== '');

    const newTask = await db
      .insert(tasks)
      .values({
        courseId,
        title: title.trim(),
        description: description.trim(),
        requirements: filteredRequirements,
        deadline: new Date(deadline),
        frequency,
        status: 'active'
      })
      .returning();

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: newTask[0].id,
        courseId: newTask[0].courseId,
        title: newTask[0].title,
        description: newTask[0].description,
        requirements: newTask[0].requirements,
        deadline: newTask[0].deadline,
        frequency: newTask[0].frequency,
        status: newTask[0].status,
        createdAt: newTask[0].createdAt
      }
    }), {
      status: 201,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Create task error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
