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
    const courseId = url.searchParams.get('courseId');
    const mentorId = decoded.userId;

    if (courseId) {
      const result = await db.execute(sql`
        SELECT
          up.id,
          up.full_name,
          up.email,
          up.profile_picture,
          mmr.status,
          CASE
            WHEN ce.mentee_id IS NOT NULL THEN true
            ELSE false
          END as is_enrolled
        FROM mentor_mentee_relationships mmr
        INNER JOIN user_profiles up ON mmr.mentee_id = up.id
        LEFT JOIN course_enrollments ce ON ce.mentee_id = up.id AND ce.course_id = ${courseId}
        WHERE mmr.mentor_id = ${mentorId}
          AND mmr.status = 'active'
        ORDER BY up.full_name ASC
      `);

      const mentees = result.rows.map((row: any) => ({
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        profilePicture: row.profile_picture,
        status: row.status,
        isEnrolled: row.is_enrolled
      }));

      return new Response(JSON.stringify({
        success: true,
        data: mentees
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    const result = await db.execute(sql`
      SELECT
        up.id,
        up.full_name,
        up.email,
        up.profile_picture,
        mmr.status
      FROM mentor_mentee_relationships mmr
      INNER JOIN user_profiles up ON mmr.mentee_id = up.id
      WHERE mmr.mentor_id = ${mentorId}
        AND mmr.status = 'active'
      ORDER BY up.full_name ASC
    `);

    const mentees = result.rows.map((row: any) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      profilePicture: row.profile_picture,
      status: row.status,
      isEnrolled: false
    }));

    return new Response(JSON.stringify({
      success: true,
      data: mentees
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Get assigned mentees error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
