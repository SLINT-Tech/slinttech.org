import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { userProfiles, mentorMenteeRelationships, courses, lessons, lessonProgress, tasks, taskSubmissions } from '../../src/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

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
    const mentorId = url.searchParams.get('mentorId');

    if (!mentorId) {
      return new Response(JSON.stringify({ error: 'Mentor ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const relationshipResult = await db
      .select({
        relationshipId: mentorMenteeRelationships.id,
        mentorId: mentorMenteeRelationships.mentorId,
        courseName: mentorMenteeRelationships.courseName,
        status: mentorMenteeRelationships.status,
        progressPercentage: mentorMenteeRelationships.progressPercentage,
        assignedDate: mentorMenteeRelationships.assignedDate,
        notes: mentorMenteeRelationships.notes,
        mentorName: userProfiles.fullName,
        mentorEmail: userProfiles.email,
        mentorSpecialization: userProfiles.specialization
      })
      .from(mentorMenteeRelationships)
      .leftJoin(userProfiles, eq(mentorMenteeRelationships.mentorId, userProfiles.id))
      .where(
        and(
          eq(mentorMenteeRelationships.mentorId, mentorId),
          eq(mentorMenteeRelationships.menteeId, menteeId)
        )
      )
      .limit(1);

    if (!relationshipResult || relationshipResult.length === 0) {
      return new Response(JSON.stringify({ error: 'Mentor assignment not found' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const relationship = relationshipResult[0];

    const courseResult = await db
      .select({
        id: courses.id,
        name: courses.name,
        duration: courses.duration,
        description: courses.description,
        status: courses.status
      })
      .from(courses)
      .where(
        and(
          eq(courses.mentorId, mentorId),
          eq(courses.name, relationship.courseName)
        )
      )
      .limit(1);

    const course = courseResult[0];

    if (!course) {
      return new Response(JSON.stringify({
        error: 'Course not found',
        details: 'The assigned course does not exist or is not created by this mentor'
      }), {
        status: 404,
        headers: corsHeaders
      });
    }

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
      .leftJoin(
        lessonProgress,
        and(
          eq(lessons.id, lessonProgress.lessonId),
          eq(lessonProgress.menteeId, menteeId)
        )
      )
      .where(eq(lessons.courseId, course.id))
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
      .leftJoin(
        taskSubmissions,
        and(
          eq(tasks.id, taskSubmissions.taskId),
          eq(taskSubmissions.menteeId, menteeId)
        )
      )
      .where(eq(tasks.courseId, course.id))
      .orderBy(tasks.orderIndex);

    const mentorDetail = {
      id: relationship.mentorId,
      relationshipId: relationship.relationshipId,
      fullName: relationship.mentorName,
      email: relationship.mentorEmail,
      specialization: relationship.mentorSpecialization,
      courseName: relationship.courseName,
      courseDescription: course.description,
      duration: course.duration,
      status: relationship.status,
      progressPercentage: relationship.progressPercentage,
      assignedDate: relationship.assignedDate,
      notes: relationship.notes,
      lessons: lessonsResult.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        link: lesson.link,
        orderIndex: lesson.orderIndex,
        status: lesson.status,
        completed: lesson.completed || false,
        completedAt: lesson.completedAt,
        createdAt: lesson.createdAt
      })),
      tasks: tasksResult.map(task => ({
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
      })),
      stats: {
        totalLessons: lessonsResult.length,
        completedLessons: lessonsResult.filter(l => l.completed).length,
        totalTasks: tasksResult.length,
        completedTasks: tasksResult.filter(t => t.submissionStatus === 'approved').length,
        pendingTasks: tasksResult.filter(t => !t.submissionStatus || t.submissionStatus === 'pending').length,
        submittedTasks: tasksResult.filter(t => t.submissionStatus === 'submitted').length
      }
    };

    return new Response(JSON.stringify({
      success: true,
      data: mentorDetail
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Get mentor detail error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
