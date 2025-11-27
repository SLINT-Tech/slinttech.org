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

    const enrolledCoursesResultRaw = await db.execute<{
      course_id: string;
      course_name: string;
      course_description: string;
      course_duration: string;
      enrollment_status: string;
      progress_percentage: number;
      enrolled_at: Date;
      completed_at: Date | null;
    }>(sql`
      SELECT
        c.id as course_id,
        c.name as course_name,
        c.description as course_description,
        c.duration as course_duration,
        ce.status as enrollment_status,
        ce.progress_percentage,
        ce.enrolled_at,
        ce.completed_at
      FROM courses c
      INNER JOIN course_enrollments ce ON ce.course_id = c.id
      WHERE c.mentor_id = ${mentorId}
        AND ce.mentee_id = ${menteeId}
    `);

    const enrolledCoursesResult = enrolledCoursesResultRaw.rows || enrolledCoursesResultRaw;

    const coursesWithDetails = await Promise.all(
      enrolledCoursesResult.map(async (enrollment) => {
        const lessonsResultRaw = await db.execute<{
          lesson_id: string;
          completed: boolean | null;
        }>(sql`
          SELECT
            l.id as lesson_id,
            lp.completed
          FROM lessons l
          LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.mentee_id = ${menteeId}
          WHERE l.course_id = ${enrollment.course_id}
        `);

        const tasksResultRaw = await db.execute<{
          task_id: string;
          submission_status: string | null;
        }>(sql`
          SELECT
            t.id as task_id,
            ts.status as submission_status
          FROM tasks t
          LEFT JOIN task_submissions ts ON t.id = ts.task_id AND ts.mentee_id = ${menteeId}
          WHERE t.course_id = ${enrollment.course_id}
        `);

        const lessonsResult = lessonsResultRaw.rows || lessonsResultRaw;
        const tasksResult = tasksResultRaw.rows || tasksResultRaw;

        const totalLessons = lessonsResult.length;
        const completedLessons = lessonsResult.filter(l => l.completed).length;
        const totalTasks = tasksResult.length;
        const approvedTasks = tasksResult.filter(t => t.submission_status === 'approved').length;
        const pendingTasks = tasksResult.filter(t => !t.submission_status).length;
        const submittedTasks = tasksResult.filter(t => t.submission_status === 'submitted').length;

        return {
          courseId: enrollment.course_id,
          courseName: enrollment.course_name,
          courseDescription: enrollment.course_description,
          duration: enrollment.course_duration,
          enrollmentStatus: enrollment.enrollment_status,
          progressPercentage: enrollment.progress_percentage || 0,
          enrolledAt: enrollment.enrolled_at,
          completedAt: enrollment.completed_at,
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
