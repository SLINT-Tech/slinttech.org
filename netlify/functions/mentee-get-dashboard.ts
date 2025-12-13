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

    const enrolledCoursesResultRaw = await db.execute<{
      relationship_id: string;
      mentor_id: string;
      mentor_name: string;
      mentor_email: string;
      mentor_specialization: string | null;
      course_id: string | null;
      course_name: string | null;
      duration: string | null;
      status: string;
      progress_percentage: number | null;
      assigned_date: Date;
      notes: string | null;
    }>(sql`
      SELECT
        mmr.id as relationship_id,
        mmr.mentor_id,
        u.full_name as mentor_name,
        u.email as mentor_email,
        u.specialization as mentor_specialization,
        c.id as course_id,
        c.name as course_name,
        c.duration,
        mmr.status,
        ce.progress_percentage,
        mmr.assigned_date,
        mmr.notes
      FROM mentor_mentee_relationships mmr
      LEFT JOIN user_profiles u ON mmr.mentor_id = u.id
      LEFT JOIN courses c ON c.mentor_id = mmr.mentor_id
      LEFT JOIN course_enrollments ce ON ce.course_id = c.id AND ce.mentee_id = ${menteeId}
      WHERE mmr.mentee_id = ${menteeId}
    `);

    const enrolledCoursesResult = enrolledCoursesResultRaw.rows || enrolledCoursesResultRaw;

    const enrolledCourseIds = enrolledCoursesResult
      .filter(r => r.course_id)
      .map(r => r.course_id);

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
      const lessonsProgressResultRaw = await db.execute<{
        total_lessons: string;
        completed_lessons: string;
      }>(sql`
        SELECT
          COUNT(DISTINCT l.id) as total_lessons,
          COUNT(DISTINCT CASE WHEN lp.completed = true THEN l.id END) as completed_lessons
        FROM lessons l
        LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.mentee_id = ${menteeId}
        WHERE l.course_id = ANY(${sql.raw(`ARRAY[${enrolledCourseIds.map(id => `'${id}'`).join(',')}]::uuid[]`)})
      `);

      const tasksProgressResultRaw = await db.execute<{
        total_tasks: string;
        approved_tasks: string;
        pending_tasks: string;
        rejected_tasks: string;
      }>(sql`
        SELECT
          COUNT(DISTINCT t.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN ts.status = 'approved' THEN t.id END) as approved_tasks,
          COUNT(DISTINCT CASE WHEN ts.status IN ('pending', 'submitted') THEN t.id END) as pending_tasks,
          COUNT(DISTINCT CASE WHEN ts.status = 'rejected' THEN t.id END) as rejected_tasks
        FROM tasks t
        LEFT JOIN task_submissions ts ON t.id = ts.task_id AND ts.mentee_id = ${menteeId}
        WHERE t.course_id = ANY(${sql.raw(`ARRAY[${enrolledCourseIds.map(id => `'${id}'`).join(',')}]::uuid[]`)})
      `);

      const lessonsProgressResult = lessonsProgressResultRaw.rows || lessonsProgressResultRaw;
      const tasksProgressResult = tasksProgressResultRaw.rows || tasksProgressResultRaw;

      lessonsData = {
        completed: Number(lessonsProgressResult[0]?.completed_lessons || 0),
        total: Number(lessonsProgressResult[0]?.total_lessons || 0)
      };

      tasksData = {
        approved: Number(tasksProgressResult[0]?.approved_tasks || 0),
        pending: Number(tasksProgressResult[0]?.pending_tasks || 0),
        rejected: Number(tasksProgressResult[0]?.rejected_tasks || 0),
        total: Number(tasksProgressResult[0]?.total_tasks || 0)
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
      if (!mentorMap.has(assignment.mentor_id)) {
        mentorMap.set(assignment.mentor_id, {
          id: assignment.relationship_id,
          mentor: `${assignment.mentor_name} - ${assignment.mentor_specialization || 'General Mentorship'}`,
          mentorName: assignment.mentor_name,
          mentorEmail: assignment.mentor_email,
          mentorSpecialization: assignment.mentor_specialization,
          courseName: assignment.course_name || 'No courses yet',
          duration: assignment.duration || 'N/A',
          status: assignment.status,
          progressPercentage: assignment.progress_percentage || 0,
          assignedDate: assignment.assigned_date,
          notes: assignment.notes,
          courses: []
        });
      }

      if (assignment.course_id && assignment.course_name) {
        const mentor = mentorMap.get(assignment.mentor_id);
        mentor.courses.push({
          id: assignment.course_id,
          name: assignment.course_name,
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
