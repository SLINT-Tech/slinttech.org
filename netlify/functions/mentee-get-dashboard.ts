import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { userProfiles, mentorMenteeRelationships, lessons, lessonProgress, tasks, taskSubmissions, announcements, courses } from '../../src/db/schema';
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

    const mentorAssignmentsResult = await db
      .select({
        id: mentorMenteeRelationships.id,
        mentorId: mentorMenteeRelationships.mentorId,
        mentorName: userProfiles.fullName,
        mentorEmail: userProfiles.email,
        mentorSpecialization: userProfiles.specialization,
        courseName: mentorMenteeRelationships.courseName,
        status: mentorMenteeRelationships.status,
        progressPercentage: mentorMenteeRelationships.progressPercentage,
        assignedDate: mentorMenteeRelationships.assignedDate,
        notes: mentorMenteeRelationships.notes
      })
      .from(mentorMenteeRelationships)
      .leftJoin(userProfiles, eq(mentorMenteeRelationships.mentorId, userProfiles.id))
      .where(eq(mentorMenteeRelationships.menteeId, menteeId));

    const enrolledCoursesResult = await db
      .select({
        courseId: courses.id,
        courseName: courses.name,
        duration: courses.duration,
        description: courses.description,
        mentorId: courses.mentorId
      })
      .from(courses)
      .innerJoin(mentorMenteeRelationships, eq(courses.name, mentorMenteeRelationships.courseName))
      .where(eq(mentorMenteeRelationships.menteeId, menteeId));

    const coursesMap = new Map();
    enrolledCoursesResult.forEach(course => {
      coursesMap.set(course.courseName, course);
    });

    const lessonsProgressResult = await db
      .select({
        totalLessons: sql<number>`count(distinct ${lessons.id})`,
        completedLessons: sql<number>`count(distinct case when ${lessonProgress.completed} = true then ${lessons.id} end)`
      })
      .from(lessons)
      .leftJoin(lessonProgress, and(
        eq(lessons.id, lessonProgress.lessonId),
        eq(lessonProgress.menteeId, menteeId)
      ))
      .innerJoin(courses, eq(lessons.courseId, courses.id))
      .innerJoin(mentorMenteeRelationships, and(
        eq(courses.name, mentorMenteeRelationships.courseName),
        eq(mentorMenteeRelationships.menteeId, menteeId)
      ));

    const tasksProgressResult = await db
      .select({
        totalTasks: sql<number>`count(distinct ${tasks.id})`,
        approvedTasks: sql<number>`count(distinct case when ${taskSubmissions.status} = 'approved' then ${tasks.id} end)`,
        pendingTasks: sql<number>`count(distinct case when ${taskSubmissions.status} = 'pending' then ${tasks.id} end)`,
        rejectedTasks: sql<number>`count(distinct case when ${taskSubmissions.status} = 'rejected' then ${tasks.id} end)`
      })
      .from(tasks)
      .leftJoin(taskSubmissions, and(
        eq(tasks.id, taskSubmissions.taskId),
        eq(taskSubmissions.menteeId, menteeId)
      ))
      .innerJoin(courses, eq(tasks.courseId, courses.id))
      .innerJoin(mentorMenteeRelationships, and(
        eq(courses.name, mentorMenteeRelationships.courseName),
        eq(mentorMenteeRelationships.menteeId, menteeId)
      ));

    const announcementsResult = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        priority: announcements.priority,
        publishedAt: announcements.publishedAt,
        mentorId: announcements.mentorId
      })
      .from(announcements)
      .where(
        and(
          eq(announcements.published, true),
          sql`${announcements.targetAudience} IN ('all', 'mentees')`
        )
      )
      .orderBy(sql`${announcements.publishedAt} DESC`)
      .limit(10);

    const mentorAssignments = mentorAssignmentsResult.map(assignment => {
      const courseInfo = coursesMap.get(assignment.courseName);
      return {
        id: assignment.id,
        mentor: `${assignment.mentorName} - ${assignment.mentorSpecialization || 'General Mentorship'}`,
        mentorName: assignment.mentorName,
        mentorEmail: assignment.mentorEmail,
        mentorSpecialization: assignment.mentorSpecialization,
        courseName: assignment.courseName,
        duration: courseInfo?.duration || 'N/A',
        status: assignment.status,
        progressPercentage: assignment.progressPercentage,
        assignedDate: assignment.assignedDate,
        notes: assignment.notes
      };
    });

    const lessonsData = {
      completed: Number(lessonsProgressResult[0]?.completedLessons || 0),
      total: Number(lessonsProgressResult[0]?.totalLessons || 0)
    };

    const tasksData = {
      approved: Number(tasksProgressResult[0]?.approvedTasks || 0),
      pending: Number(tasksProgressResult[0]?.pendingTasks || 0),
      rejected: Number(tasksProgressResult[0]?.rejectedTasks || 0),
      total: Number(tasksProgressResult[0]?.totalTasks || 0)
    };

    const announcementsList = announcementsResult.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      message: announcement.content,
      date: announcement.publishedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      type: announcement.priority === 'high' ? 'warning' : 'info'
    }));

    return new Response(JSON.stringify({
      success: true,
      data: {
        mentorAssignments,
        lessonsData,
        tasksData,
        announcements: announcementsList
      }
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Get mentee dashboard error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
