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

    const mentorId = decoded.userId;
    const body = await req.json();
    const { submissionId, status, feedback } = body;

    if (!submissionId || !status) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        details: 'submissionId and status are required'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return new Response(JSON.stringify({
        error: 'Invalid status',
        details: 'Status must be either approved or rejected'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (status === 'rejected' && !feedback?.trim()) {
      return new Response(JSON.stringify({
        error: 'Feedback required',
        details: 'Feedback is required for rejected submissions'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const submission = await db
      .select({
        submissionId: taskSubmissions.id,
        taskId: taskSubmissions.taskId
      })
      .from(taskSubmissions)
      .innerJoin(tasks, eq(tasks.id, taskSubmissions.taskId))
      .where(and(
        eq(taskSubmissions.id, submissionId),
        eq(tasks.mentorId, mentorId)
      ))
      .limit(1);

    if (!submission || submission.length === 0) {
      return new Response(JSON.stringify({
        error: 'Submission not found or unauthorized'
      }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const updatedSubmission = await db
      .update(taskSubmissions)
      .set({
        status: status,
        mentorFeedback: feedback || null,
        reviewedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(taskSubmissions.id, submissionId))
      .returning();

    return new Response(JSON.stringify({
      success: true,
      message: `Submission ${status} successfully`,
      data: {
        submission: updatedSubmission[0]
      }
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Review submission error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
