import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { userProfiles, tasks, taskSubmissions, courses } from '../../src/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

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

    const mentorId = decoded.userId;

    const submissions = await db
      .select({
        id: taskSubmissions.id,
        taskId: tasks.id,
        taskTitle: tasks.title,
        taskDescription: tasks.description,
        taskRequirements: tasks.requirements,
        deadline: tasks.deadline,
        menteeId: userProfiles.id,
        menteeName: userProfiles.fullName,
        menteeEmail: userProfiles.email,
        courseId: courses.id,
        courseName: courses.name,
        submissionLink: taskSubmissions.submissionLink,
        submissionNotes: taskSubmissions.submissionNotes,
        submittedAt: taskSubmissions.submittedAt,
        status: taskSubmissions.status,
        mentorFeedback: taskSubmissions.mentorFeedback,
        reviewedAt: taskSubmissions.reviewedAt
      })
      .from(taskSubmissions)
      .innerJoin(tasks, eq(tasks.id, taskSubmissions.taskId))
      .innerJoin(userProfiles, eq(userProfiles.id, taskSubmissions.menteeId))
      .innerJoin(courses, eq(courses.id, tasks.courseId))
      .where(eq(tasks.mentorId, mentorId))
      .orderBy(desc(taskSubmissions.submittedAt));

    const pendingCount = submissions.filter(s => s.status === 'pending' || s.status === 'submitted').length;
    const approvedCount = submissions.filter(s => s.status === 'approved').length;
    const rejectedCount = submissions.filter(s => s.status === 'rejected').length;

    return new Response(JSON.stringify({
      success: true,
      data: {
        submissions: submissions.map(sub => ({
          id: sub.id,
          taskId: sub.taskId,
          taskTitle: sub.taskTitle,
          taskDescription: sub.taskDescription,
          taskRequirements: sub.taskRequirements,
          deadline: sub.deadline,
          menteeId: sub.menteeId,
          menteeName: sub.menteeName,
          menteeEmail: sub.menteeEmail,
          courseId: sub.courseId,
          courseName: sub.courseName,
          submissionLink: sub.submissionLink,
          submissionNotes: sub.submissionNotes,
          submittedAt: sub.submittedAt,
          status: sub.status,
          mentorFeedback: sub.mentorFeedback,
          reviewedAt: sub.reviewedAt
        })),
        stats: {
          total: submissions.length,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount
        }
      }
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Get mentor submissions error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
