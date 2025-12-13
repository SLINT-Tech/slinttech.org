import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { tasks, taskSubmissions, courses, userProfiles, courseEnrollments } from '../../src/db/schema';
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
    const url = new URL(req.url);
    const taskId = url.searchParams.get('taskId');

    if (!taskId) {
      return new Response(JSON.stringify({ error: 'Task ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const taskResult = await db
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
      .innerJoin(courseEnrollments, and(
        eq(courseEnrollments.courseId, courses.id),
        eq(courseEnrollments.menteeId, menteeId)
      ))
      .innerJoin(userProfiles, eq(tasks.mentorId, userProfiles.id))
      .leftJoin(taskSubmissions, and(
        eq(taskSubmissions.taskId, tasks.id),
        eq(taskSubmissions.menteeId, menteeId)
      ))
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!taskResult.length) {
      return new Response(JSON.stringify({
        error: 'Task not found or you are not enrolled in this course'
      }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const task = taskResult[0];

    let requirements = [];
    if (task.requirements) {
      if (Array.isArray(task.requirements)) {
        if (task.requirements.length === 1 && typeof task.requirements[0] === 'string' && task.requirements[0].startsWith('{')) {
          try {
            const parsed = task.requirements[0].replace(/^\{/, '[').replace(/\}$/, ']').replace(/\\"/g, '"');
            requirements = JSON.parse(parsed);
          } catch (e) {
            requirements = task.requirements;
          }
        } else {
          requirements = task.requirements;
        }
      } else if (typeof task.requirements === 'string') {
        try {
          const parsed = task.requirements.replace(/^\{/, '[').replace(/\}$/, ']').replace(/\\"/g, '"');
          requirements = JSON.parse(parsed);
        } catch (e) {
          requirements = [];
        }
      }
    }

    const taskData = {
      id: task.taskId,
      title: task.title,
      description: task.description,
      requirements,
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
    };

    return new Response(JSON.stringify({
      success: true,
      data: taskData
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Get task detail error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
