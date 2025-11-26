import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { userProfiles, mentorMenteeRelationships, courseEnrollments, courses, lessons, lessonProgress, tasks, taskSubmissions } from '../../src/db/schema';
import { eq, and, sql } from 'drizzle-orm';

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
        mentorName: userProfiles.fullName,
        mentorEmail: userProfiles.email,
        mentorSpecialization: userProfiles.specialization,
        status: mentorMenteeRelationships.status,
        assignedDate: mentorMenteeRelationships.assignedDate
      })
      .from(mentorMenteeRelationships)
      .leftJoin(userProfiles, eq(mentorMenteeRelationships.mentorId, userProfiles.id))
      .where(and(
        eq(mentorMenteeRelationships.mentorId, mentorId),
        eq(mentorMenteeRelationships.menteeId, menteeId)
      ))
      .limit(1);

    if (!relationshipResult.length) {
      return new Response(JSON.stringify({
        error: 'Access denied',
        message: 'This mentor is not assigned to you'
      }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const relationship = relationshipResult[0];

    const enrolledCoursesResult = await db
      .select({
        courseId: courses.id,
        courseName: courses.name,
        courseDescription: courses.description,
        courseDuration: courses.duration,
        enrollmentStatus: courseEnrollments.status,
        progressPercentage: courseEnrollments.progressPercentage,
        enrolledAt: courseEnrollments.enrolledAt,
        completedAt: courseEnrollments.completedAt
      })
      .from(courseEnrollments)
      .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
      .where(and(
        eq(courseEnrollments.menteeId, menteeId),
        eq(courses.mentorId, mentorId)
      ));

    const coursesWithDetails = await Promise.all(
      enrolledCoursesResult.map(async (enrollment) => {
        const lessonsResult = await db
          .select({
            id: lessons.id,
            completed: lessonProgress.completed
          })
          .from(lessons)
          .leftJoin(lessonProgress, and(
            eq(lessons.id, lessonProgress.lessonId),
            eq(lessonProgress.menteeId, menteeId)
          ))
          .where(eq(lessons.courseId, enrollment.courseId));

        const tasksResult = await db
          .select({
            id: tasks.id,
            submissionStatus: taskSubmissions.status
          })
          .from(tasks)
          .leftJoin(taskSubmissions, and(
            eq(tasks.id, taskSubmissions.taskId),
            eq(taskSubmissions.menteeId, menteeId)
          ))
          .where(eq(tasks.courseId, enrollment.courseId));

        const totalLessons = lessonsResult.length;
        const completedLessons = lessonsResult.filter(l => l.completed).length;
        const totalTasks = tasksResult.length;
        const approvedTasks = tasksResult.filter(t => t.submissionStatus === 'approved').length;
        const pendingTasks = tasksResult.filter(t => !t.submissionStatus).length;
        const submittedTasks = tasksResult.filter(t => t.submissionStatus === 'submitted').length;

        return {
          courseId: enrollment.courseId,
          courseName: enrollment.courseName,
          courseDescription: enrollment.courseDescription,
          duration: enrollment.courseDuration,
          enrollmentStatus: enrollment.enrollmentStatus,
          progressPercentage: enrollment.progressPercentage || 0,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
          stats: {
            totalLessons,
            completedLessons,
            totalTasks,
            approvedTasks,
            pendingTasks,
            submittedTasks
          }
        };
      })
    );

    return new Response(JSON.stringify({
      success: true,
      data: {
        mentor: {
          id: relationship.mentorId,
          fullName: relationship.mentorName,
          email: relationship.mentorEmail,
          specialization: relationship.mentorSpecialization,
          assignedDate: relationship.assignedDate
        },
        courses: coursesWithDetails
      }
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Get mentor courses error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
