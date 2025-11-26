import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { taskSubmissions, tasks } from '../../src/db/schema';
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
    const { taskId, submissionLink, submissionNotes } = body;

    if (!taskId || !submissionLink) {
      return new Response(JSON.stringify({ error: 'Task ID and submission link are required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const taskExists = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!taskExists.length) {
      return new Response(JSON.stringify({ error: 'Task not found' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const existing = await db
      .select({ id: taskSubmissions.id })
      .from(taskSubmissions)
      .where(and(
        eq(taskSubmissions.taskId, taskId),
        eq(taskSubmissions.menteeId, menteeId)
      ))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(taskSubmissions)
        .set({
          submissionLink,
          submissionNotes: submissionNotes || null,
          status: 'submitted',
          submittedAt: new Date(),
          updatedAt: new Date()
        })
        .where(and(
          eq(taskSubmissions.taskId, taskId),
          eq(taskSubmissions.menteeId, menteeId)
        ));
    } else {
      await db.insert(taskSubmissions).values({
        taskId,
        menteeId,
        submissionLink,
        submissionNotes: submissionNotes || null,
        status: 'submitted',
        submittedAt: new Date()
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Task submitted successfully'
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Submit task error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
