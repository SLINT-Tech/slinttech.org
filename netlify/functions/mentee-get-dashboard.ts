import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { userProfiles, mentorMenteeRelationships, courseEnrollments, lessons, lessonProgress, tasks, taskSubmissions, announcements, courses } from '../../src/db/schema';
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

    const enrolledCoursesResult = await db
      .select({
        id: mentorMenteeRelationships.id,
        mentorId: mentorMenteeRelationships.mentorId,
        mentorName: userProfiles.fullName,
        mentorEmail: userProfiles.email,
        mentorSpecialization: userProfiles.specialization,
        courseId: courses.id,
        courseName: courses.name,
        duration: courses.duration,
        status: mentorMenteeRelationships.status,
        progressPercentage: courseEnrollments.progressPercentage,
        assignedDate: mentorMenteeRelationships.assignedDate,
        notes: mentorMenteeRelationships.notes
      })
      .from(mentorMenteeRelationships)
      .leftJoin(userProfiles, eq(mentorMenteeRelationships.mentorId, userProfiles.id))
      .leftJoin(courses, eq(courses.mentorId, mentorMenteeRelationships.mentorId))
      .leftJoin(courseEnrollments, and(
        eq(courseEnrollments.courseId, courses.id),
        eq(courseEnrollments.menteeId, menteeId)
      ))
      .where(eq(mentorMenteeRelationships.menteeId, menteeId));

    const enrolledCourseIds = enrolledCoursesResult
      .filter(r => r.courseId)
      .map(r => r.courseId);

    let lessonsData = {
      completed: 0,
      total: 0
    };

    let tasksData = {
      approved: 0,
      pending: 0,
      rejected: 0,
      total: 0
    };

    if (enrolledCourseIds.length > 0) {
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
        .where(sql`${lessons.courseId} = ANY(${enrolledCourseIds})`);

      const tasksProgressResult = await db
        .select({
          totalTasks: sql<number>`count(distinct ${tasks.id})`,
          approvedTasks: sql<number>`count(distinct case when ${taskSubmissions.status} = 'approved' then ${tasks.id} end)`,
          pendingTasks: sql<number>`count(distinct case when ${taskSubmissions.status} = 'pending' or ${taskSubmissions.status} = 'submitted' then ${tasks.id} end)`,
          rejectedTasks: sql<number>`count(distinct case when ${taskSubmissions.status} = 'rejected' then ${tasks.id} end)`
        })
        .from(tasks)
        .leftJoin(taskSubmissions, and(
          eq(tasks.id, taskSubmissions.taskId),
          eq(taskSubmissions.menteeId, menteeId)
        ))
        .where(sql`${tasks.courseId} = ANY(${enrolledCourseIds})`);

      lessonsData = {
        completed: Number(lessonsProgressResult[0]?.completedLessons || 0),
        total: Number(lessonsProgressResult[0]?.totalLessons || 0)
      };

      tasksData = {
        approved: Number(tasksProgressResult[0]?.approvedTasks || 0),
        pending: Number(tasksProgressResult[0]?.pendingTasks || 0),
        rejected: Number(tasksProgressResult[0]?.rejectedTasks || 0),
        total: Number(tasksProgressResult[0]?.totalTasks || 0)
      };
    }

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

    const mentorMap = new Map();
    enrolledCoursesResult.forEach(assignment => {
      if (!mentorMap.has(assignment.mentorId)) {
        mentorMap.set(assignment.mentorId, {
          id: assignment.id,
          mentor: `${assignment.mentorName} - ${assignment.mentorSpecialization || 'General Mentorship'}`,
          mentorName: assignment.mentorName,
          mentorEmail: assignment.mentorEmail,
          mentorSpecialization: assignment.mentorSpecialization,
          courseName: assignment.courseName || 'No courses yet',
          duration: assignment.duration || 'N/A',
          status: assignment.status,
          progressPercentage: assignment.progressPercentage || 0,
          assignedDate: assignment.assignedDate,
          notes: assignment.notes,
          courses: []
        });
      }

      if (assignment.courseId && assignment.courseName) {
        const mentor = mentorMap.get(assignment.mentorId);
        mentor.courses.push({
          id: assignment.courseId,
          name: assignment.courseName,
          duration: assignment.duration
        });
      }
    });

    const mentorAssignments = Array.from(mentorMap.values()).map(mentor => {
      if (mentor.courses.length > 1) {
        mentor.courseName = `${mentor.courses.length} Active Courses`;
        mentor.duration = 'Multiple';
      } else if (mentor.courses.length === 1) {
        mentor.courseName = mentor.courses[0].name;
        mentor.duration = mentor.courses[0].duration;
      }
      delete mentor.courses;
      return mentor;
    });

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
