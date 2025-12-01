import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { tasks } from '../../src/db/schema';
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

interface UpdateTaskRequest {
  taskId: string;
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
      return new Response(JSON.stringify({ error: 'Only mentors can update tasks' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const body: UpdateTaskRequest = await req.json();
    const { taskId, title, description, requirements, deadline, frequency } = body;

    if (!taskId || !title || !description || !deadline || !frequency) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        details: 'taskId, title, description, deadline, and frequency are required'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const mentorId = decoded.userId;

    const existingTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.mentorId, mentorId)))
      .limit(1);

    if (existingTask.length === 0) {
      return new Response(JSON.stringify({ error: 'Task not found or you do not have permission' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const filteredRequirements = requirements.filter(req => req.trim() !== '');

    const updatedTask = await db
      .update(tasks)
      .set({
        title: title.trim(),
        description: description.trim(),
        requirements: filteredRequirements,
        deadline: new Date(deadline),
        frequency,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return new Response(JSON.stringify({
      success: true,
      data: updatedTask[0]
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Update task error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
