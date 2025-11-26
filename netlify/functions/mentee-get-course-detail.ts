import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { courseEnrollments, courses, lessons, lessonProgress, tasks, taskSubmissions, userProfiles } from '../../src/db/schema';
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
    const courseId = url.searchParams.get('courseId');
    const mentorId = url.searchParams.get('mentorId');

    if (!courseId || !mentorId) {
      return new Response(JSON.stringify({ error: 'Course ID and Mentor ID are required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const enrollmentResult = await db
      .select({
        enrollmentId: courseEnrollments.id,
        courseId: courses.id,
        courseName: courses.name,
        courseDescription: courses.description,
        courseDuration: courses.duration,
        mentorId: courses.mentorId,
        mentorName: userProfiles.fullName,
        mentorEmail: userProfiles.email,
        enrollmentStatus: courseEnrollments.status,
        progressPercentage: courseEnrollments.progressPercentage,
        enrolledAt: courseEnrollments.enrolledAt
      })
      .from(courseEnrollments)
      .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
      .leftJoin(userProfiles, eq(courses.mentorId, userProfiles.id))
      .where(and(
        eq(courseEnrollments.courseId, courseId),
        eq(courseEnrollments.menteeId, menteeId),
        eq(courses.mentorId, mentorId)
      ))
      .limit(1);

    if (!enrollmentResult.length) {
      return new Response(JSON.stringify({
        error: 'Access denied',
        message: 'You are not enrolled in this course or it does not exist'
      }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const enrollment = enrollmentResult[0];

    const lessonsResult = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        description: lessons.description,
        link: lessons.link,
        orderIndex: lessons.orderIndex,
        status: lessons.status,
        createdAt: lessons.createdAt,
        completed: lessonProgress.completed,
        completedAt: lessonProgress.completedAt
      })
      .from(lessons)
      .leftJoin(lessonProgress, and(
        eq(lessons.id, lessonProgress.lessonId),
        eq(lessonProgress.menteeId, menteeId)
      ))
      .where(eq(lessons.courseId, courseId))
      .orderBy(lessons.orderIndex);

    const tasksResult = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        deadline: tasks.deadline,
        status: tasks.status,
        orderIndex: tasks.orderIndex,
        createdAt: tasks.createdAt,
        submissionId: taskSubmissions.id,
        submissionLink: taskSubmissions.submissionLink,
        submissionNotes: taskSubmissions.submissionNotes,
        submissionStatus: taskSubmissions.status,
        mentorFeedback: taskSubmissions.mentorFeedback,
        submittedAt: taskSubmissions.submittedAt,
        reviewedAt: taskSubmissions.reviewedAt
      })
      .from(tasks)
      .leftJoin(taskSubmissions, and(
        eq(tasks.id, taskSubmissions.taskId),
        eq(taskSubmissions.menteeId, menteeId)
      ))
      .where(eq(tasks.courseId, courseId))
      .orderBy(tasks.orderIndex);

    const lessonsData = lessonsResult.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      link: lesson.link,
      orderIndex: lesson.orderIndex,
      status: lesson.status,
      completed: lesson.completed || false,
      completedAt: lesson.completedAt,
      createdAt: lesson.createdAt
    }));

    const tasksData = tasksResult.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      deadline: task.deadline,
      status: task.status,
      orderIndex: task.orderIndex,
      createdAt: task.createdAt,
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

    const stats = {
      totalLessons: lessonsData.length,
      completedLessons: lessonsData.filter(l => l.completed).length,
      totalTasks: tasksData.length,
      completedTasks: tasksData.filter(t => t.submission?.status === 'approved').length,
      pendingTasks: tasksData.filter(t => !t.submission).length,
      submittedTasks: tasksData.filter(t => t.submission && t.submission.status === 'submitted').length
    };

    return new Response(JSON.stringify({
      success: true,
      data: {
        course: {
          id: enrollment.courseId,
          name: enrollment.courseName,
          description: enrollment.courseDescription,
          duration: enrollment.courseDuration,
          progressPercentage: enrollment.progressPercentage || 0,
          enrolledAt: enrollment.enrolledAt,
          mentor: {
            id: enrollment.mentorId,
            name: enrollment.mentorName,
            email: enrollment.mentorEmail
          }
        },
        lessons: lessonsData,
        tasks: tasksData,
        stats
      }
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Get course detail error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
