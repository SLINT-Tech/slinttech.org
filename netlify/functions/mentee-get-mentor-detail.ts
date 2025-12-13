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
        assignedDate: mentorMenteeRelationships.assignedDate,
        notes: mentorMenteeRelationships.notes
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
        enrolledAt: courseEnrollments.enrolledAt
      })
      .from(courseEnrollments)
      .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
      .where(and(
        eq(courseEnrollments.menteeId, menteeId),
        eq(courses.mentorId, mentorId),
        eq(courseEnrollments.status, 'active')
      ));

    if (!enrolledCoursesResult.length) {
      const mentorDetail = {
        id: relationship.mentorId,
        relationshipId: relationship.relationshipId,
        fullName: relationship.mentorName,
        email: relationship.mentorEmail,
        specialization: relationship.mentorSpecialization,
        courseName: 'No courses assigned yet',
        courseDescription: 'Your mentor has not enrolled you in any courses yet. They will add you to courses once they create them.',
        duration: 'N/A',
        status: relationship.status,
        progressPercentage: 0,
        assignedDate: relationship.assignedDate,
        notes: relationship.notes,
        lessons: [],
        tasks: [],
        stats: {
          totalLessons: 0,
          completedLessons: 0,
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          submittedTasks: 0
        }
      };

      return new Response(JSON.stringify({
        success: true,
        data: mentorDetail
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    const coursesWithDetails = await Promise.all(
      enrolledCoursesResult.map(async (enrollment) => {
        const lessonsResult = await db
          .select({
            id: lessons.id,
            title: lessons.title,
            description: lessons.description,
            link: lessons.link,
            orderIndex: lessons.orderIndex,
            status: lessons.status,
            completedAt: lessonProgress.completedAt,
            completed: lessonProgress.completed,
            createdAt: lessons.createdAt
          })
          .from(lessons)
          .leftJoin(lessonProgress, and(
            eq(lessons.id, lessonProgress.lessonId),
            eq(lessonProgress.menteeId, menteeId)
          ))
          .where(eq(lessons.courseId, enrollment.courseId))
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
          .where(eq(tasks.courseId, enrollment.courseId))
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

        return {
          courseId: enrollment.courseId,
          courseName: enrollment.courseName,
          courseDescription: enrollment.courseDescription,
          duration: enrollment.courseDuration,
          progressPercentage: enrollment.progressPercentage,
          enrolledAt: enrollment.enrolledAt,
          lessons: lessonsData,
          tasks: tasksData,
          stats: {
            totalLessons: lessonsData.length,
            completedLessons: lessonsData.filter(l => l.completed).length,
            totalTasks: tasksData.length,
            completedTasks: tasksData.filter(t => t.submission?.status === 'approved').length,
            pendingTasks: tasksData.filter(t => !t.submission).length,
            submittedTasks: tasksData.filter(t => t.submission && t.submission.status === 'submitted').length
          }
        };
      })
    );

    const aggregateStats = coursesWithDetails.reduce((acc, course) => ({
      totalLessons: acc.totalLessons + course.stats.totalLessons,
      completedLessons: acc.completedLessons + course.stats.completedLessons,
      totalTasks: acc.totalTasks + course.stats.totalTasks,
      completedTasks: acc.completedTasks + course.stats.completedTasks,
      pendingTasks: acc.pendingTasks + course.stats.pendingTasks,
      submittedTasks: acc.submittedTasks + course.stats.submittedTasks
    }), {
      totalLessons: 0,
      completedLessons: 0,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      submittedTasks: 0
    });

    const allLessons = coursesWithDetails.flatMap(c => c.lessons).slice(0, 10);
    const allTasks = coursesWithDetails.flatMap(c => c.tasks).slice(0, 10);

    const primaryCourse = coursesWithDetails[0];

    const mentorDetail = {
      id: relationship.mentorId,
      relationshipId: relationship.relationshipId,
      fullName: relationship.mentorName,
      email: relationship.mentorEmail,
      specialization: relationship.mentorSpecialization,
      courseName: coursesWithDetails.length === 1
        ? primaryCourse.courseName
        : `${coursesWithDetails.length} Active Courses`,
      courseDescription: coursesWithDetails.length === 1
        ? primaryCourse.courseDescription
        : `You are enrolled in ${coursesWithDetails.length} courses with this mentor.`,
      duration: coursesWithDetails.length === 1
        ? primaryCourse.duration
        : 'Multiple',
      status: relationship.status,
      progressPercentage: coursesWithDetails.length > 0
        ? Math.round(coursesWithDetails.reduce((sum, c) => sum + (c.progressPercentage || 0), 0) / coursesWithDetails.length)
        : 0,
      assignedDate: relationship.assignedDate,
      notes: relationship.notes,
      lessons: allLessons,
      tasks: allTasks,
      stats: aggregateStats
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
