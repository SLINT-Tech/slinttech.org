import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { taskSubmissions, tasks, courses, userProfiles } from '../../src/db/schema';
import { eq, and } from 'drizzle-orm';
import { queueEmail } from './utils/email-queue';

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

    const reviewDetails = await db
      .select({
        menteeId: taskSubmissions.menteeId,
        taskId: tasks.id,
        taskTitle: tasks.title,
        courseId: courses.id,
        courseName: courses.title,
        mentorId: courses.mentorId
      })
      .from(taskSubmissions)
      .innerJoin(tasks, eq(tasks.id, taskSubmissions.taskId))
      .innerJoin(courses, eq(courses.id, tasks.courseId))
      .where(eq(taskSubmissions.id, submissionId))
      .limit(1);

    if (reviewDetails.length > 0) {
      const [mentee] = await db
        .select({
          email: userProfiles.email,
          fullName: userProfiles.fullName
        })
        .from(userProfiles)
        .where(eq(userProfiles.id, reviewDetails[0].menteeId))
        .limit(1);

      const [mentor] = await db
        .select({
          fullName: userProfiles.fullName
        })
        .from(userProfiles)
        .where(eq(userProfiles.id, reviewDetails[0].mentorId))
        .limit(1);

      if (mentee && mentor) {
        const taskLink = `${process.env.APP_URL || 'https://slinttech.netlify.app'}/mentee/tasks/${reviewDetails[0].taskId}`;

        await queueEmail({
          type: 'task-review-mentee',
          to: { email: mentee.email, name: mentee.fullName },
          data: {
            menteeName: mentee.fullName,
            taskTitle: reviewDetails[0].taskTitle,
            courseName: reviewDetails[0].courseName,
            mentorName: mentor.fullName,
            reviewDate: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            feedback: feedback || undefined,
            taskLink,
            status: status
          }
        });
      }
    }

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
