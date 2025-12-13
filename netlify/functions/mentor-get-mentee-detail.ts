import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { sql } from 'drizzle-orm';

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

    if (decoded.role !== 'Mentor') {
      return new Response(JSON.stringify({ error: 'Only mentors can access this endpoint' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const url = new URL(req.url);
    const menteeId = url.searchParams.get('menteeId');

    if (!menteeId) {
      return new Response(JSON.stringify({ error: 'Mentee ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const mentorId = decoded.userId;

    const relationshipCheck = await db.execute(sql`
      SELECT 1
      FROM mentor_mentee_relationships
      WHERE mentor_id = ${mentorId}
        AND mentee_id = ${menteeId}
        AND status = 'active'
      LIMIT 1
    `);

    if (relationshipCheck.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'You do not have access to this mentee' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const menteeResult = await db.execute(sql`
      SELECT
        up.id,
        up.full_name,
        up.email,
        up.membership_category,
        up.career_path,
        up.status,
        up.contract_file_url,
        up.community_link,
        up.created_at,
        up.updated_at,
        mmr.progress_percentage,
        mmr.assigned_date,
        mmr.notes
      FROM user_profiles up
      INNER JOIN mentor_mentee_relationships mmr
        ON up.id = mmr.mentee_id
      WHERE up.id = ${menteeId}
        AND mmr.mentor_id = ${mentorId}
        AND up.role = 'Mentee'
      LIMIT 1
    `);

    if (menteeResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Mentee not found' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const menteeData = menteeResult.rows[0];

    const coursesResult = await db.execute(sql`
      SELECT
        c.id,
        c.name,
        c.duration,
        c.description,
        ce.status,
        ce.progress_percentage,
        ce.enrolled_at,
        ce.completed_at,
        COALESCE(lesson_stats.total_lessons, 0) as total_lessons,
        COALESCE(lesson_stats.completed_lessons, 0) as completed_lessons,
        COALESCE(task_stats.total_tasks, 0) as total_tasks,
        COALESCE(task_stats.approved_tasks, 0) as approved_tasks
      FROM course_enrollments ce
      INNER JOIN courses c ON ce.course_id = c.id
      LEFT JOIN (
        SELECT
          l.course_id,
          COUNT(*) as total_lessons,
          COUNT(lp.completed) FILTER (WHERE lp.completed = true) as completed_lessons
        FROM lessons l
        LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.mentee_id = ${menteeId}
        GROUP BY l.course_id
      ) lesson_stats ON c.id = lesson_stats.course_id
      LEFT JOIN (
        SELECT
          t.course_id,
          COUNT(*) as total_tasks,
          COUNT(ts.status) FILTER (WHERE ts.status = 'approved') as approved_tasks
        FROM tasks t
        LEFT JOIN task_submissions ts ON t.id = ts.task_id AND ts.mentee_id = ${menteeId}
        GROUP BY t.course_id
      ) task_stats ON c.id = task_stats.course_id
      WHERE ce.mentee_id = ${menteeId}
      ORDER BY ce.enrolled_at DESC
    `);

    const courses = coursesResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      duration: row.duration,
      description: row.description,
      status: row.status,
      progress: row.progress_percentage || 0,
      completedLessons: parseInt(row.completed_lessons) || 0,
      totalLessons: parseInt(row.total_lessons) || 0,
      approvedTasks: parseInt(row.approved_tasks) || 0,
      totalTasks: parseInt(row.total_tasks) || 0,
      enrolledDate: row.enrolled_at,
      completedAt: row.completed_at
    }));

    const menteeDetail = {
      id: menteeData.id,
      fullName: menteeData.full_name,
      email: menteeData.email,
      membershipCategory: menteeData.membership_category,
      careerPath: menteeData.career_path,
      status: menteeData.status,
      progress: menteeData.progress_percentage || 0,
      contractFileUrl: menteeData.contract_file_url,
      communityLink: menteeData.community_link,
      joinedDate: menteeData.assigned_date,
      lastActive: menteeData.updated_at,
      notes: menteeData.notes,
      courses: courses
    };

    return new Response(JSON.stringify({
      success: true,
      data: menteeDetail
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Get mentee detail error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
