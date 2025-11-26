import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { tasks, taskSubmissions, courses, userProfiles } from '../../src/db/schema';
import { eq, and, desc } from 'drizzle-orm';

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

    const menteeId = decoded.userId;

    const tasksResult = await db
      .select({
        taskId: tasks.id,
        title: tasks.title,
        description: tasks.description,
        requirements: tasks.requirements,
        deadline: tasks.deadline,
        taskStatus: tasks.status,
        createdAt: tasks.createdAt,
        courseId: courses.id,
        courseName: courses.name,
        mentorId: userProfiles.id,
        mentorName: userProfiles.fullName,
        submissionId: taskSubmissions.id,
        submissionLink: taskSubmissions.submissionLink,
        submissionNotes: taskSubmissions.submissionNotes,
        submissionStatus: taskSubmissions.status,
        mentorFeedback: taskSubmissions.mentorFeedback,
        submittedAt: taskSubmissions.submittedAt,
        reviewedAt: taskSubmissions.reviewedAt
      })
      .from(tasks)
      .innerJoin(courses, eq(tasks.courseId, courses.id))
      .innerJoin(userProfiles, eq(tasks.mentorId, userProfiles.id))
      .leftJoin(taskSubmissions, and(
        eq(taskSubmissions.taskId, tasks.id),
        eq(taskSubmissions.menteeId, menteeId)
      ))
      .where(eq(tasks.status, 'active'))
      .orderBy(desc(tasks.createdAt));

    const tasksData = tasksResult.map(task => ({
      id: task.taskId,
      title: task.title,
      description: task.description,
      requirements: task.requirements,
      deadline: task.deadline,
      status: task.taskStatus,
      createdAt: task.createdAt,
      course: {
        id: task.courseId,
        name: task.courseName
      },
      mentor: {
        id: task.mentorId,
        name: task.mentorName
      },
      submission: task.submissionId ? {
        id: task.submissionId,
        submissionLink: task.submissionLink,
        submissionNotes: task.submissionNotes,
        status: task.submissionStatus,
        mentorFeedback: task.mentorFeedback,
        submittedAt: task.submittedAt,
        reviewedAt: task.reviewedAt
      } : null
    }));

    return new Response(JSON.stringify({
      success: true,
      data: {
        tasks: tasksData
      }
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Get tasks error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
