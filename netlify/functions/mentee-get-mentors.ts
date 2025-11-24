import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { userProfiles, mentorMenteeRelationships, lessons, lessonProgress, tasks, taskSubmissions, courses } from '../../src/db/schema';
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
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const totalCountResult = await db
      .select({
        count: sql<number>`count(*)`
      })
      .from(mentorMenteeRelationships)
      .where(eq(mentorMenteeRelationships.menteeId, menteeId));

    const totalCount = Number(totalCountResult[0]?.count || 0);

    const mentorAssignmentsResult = await db
      .select({
        relationshipId: mentorMenteeRelationships.id,
        mentorId: mentorMenteeRelationships.mentorId,
        mentorName: userProfiles.fullName,
        mentorEmail: userProfiles.email,
        mentorPhone: userProfiles.phoneNumber,
        mentorSpecialization: userProfiles.specialization,
        courseName: mentorMenteeRelationships.courseName,
        status: mentorMenteeRelationships.status,
        progressPercentage: mentorMenteeRelationships.progressPercentage,
        assignedDate: mentorMenteeRelationships.assignedDate,
        notes: mentorMenteeRelationships.notes
      })
      .from(mentorMenteeRelationships)
      .leftJoin(userProfiles, eq(mentorMenteeRelationships.mentorId, userProfiles.id))
      .where(eq(mentorMenteeRelationships.menteeId, menteeId))
      .orderBy(desc(mentorMenteeRelationships.assignedDate))
      .limit(limit)
      .offset(offset);

    const mentorsWithProgress = await Promise.all(
      mentorAssignmentsResult.map(async (mentor) => {
        const courseResult = await db
          .select({
            id: courses.id,
            duration: courses.duration,
            description: courses.description
          })
          .from(courses)
          .where(eq(courses.name, mentor.courseName))
          .limit(1);

        const course = courseResult[0];

        if (!course) {
          return {
            id: mentor.mentorId,
            relationshipId: mentor.relationshipId,
            fullName: mentor.mentorName,
            email: mentor.mentorEmail,
            phone: mentor.mentorPhone,
            specialization: mentor.mentorSpecialization,
            courseName: mentor.courseName,
            duration: 'N/A',
            status: mentor.status,
            progressPercentage: mentor.progressPercentage,
            assignedDate: mentor.assignedDate,
            notes: mentor.notes,
            lessonsCount: 0,
            tasksCount: 0,
            completedLessons: 0,
            approvedTasks: 0
          };
        }

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
          .where(eq(lessons.courseId, course.id));

        const tasksProgressResult = await db
          .select({
            totalTasks: sql<number>`count(distinct ${tasks.id})`,
            approvedTasks: sql<number>`count(distinct case when ${taskSubmissions.status} = 'approved' then ${tasks.id} end)`
          })
          .from(tasks)
          .leftJoin(taskSubmissions, and(
            eq(tasks.id, taskSubmissions.taskId),
            eq(taskSubmissions.menteeId, menteeId)
          ))
          .where(eq(tasks.courseId, course.id));

        return {
          id: mentor.mentorId,
          relationshipId: mentor.relationshipId,
          fullName: mentor.mentorName,
          email: mentor.mentorEmail,
          phone: mentor.mentorPhone,
          specialization: mentor.mentorSpecialization,
          courseName: mentor.courseName,
          duration: course.duration,
          status: mentor.status,
          progressPercentage: mentor.progressPercentage,
          assignedDate: mentor.assignedDate,
          notes: mentor.notes,
          lessonsCount: Number(lessonsProgressResult[0]?.totalLessons || 0),
          tasksCount: Number(tasksProgressResult[0]?.totalTasks || 0),
          completedLessons: Number(lessonsProgressResult[0]?.completedLessons || 0),
          approvedTasks: Number(tasksProgressResult[0]?.approvedTasks || 0)
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limit);

    return new Response(JSON.stringify({
      success: true,
      data: {
        mentors: mentorsWithProgress,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Get mentee mentors error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
