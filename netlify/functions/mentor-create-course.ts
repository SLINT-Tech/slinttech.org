import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { courses } from '../../src/db/schema';

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

interface CreateCourseRequest {
  name: string;
  duration: string;
  description: string;
}

export default async (req: Request, context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  if (req.method !== 'POST') {
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
      return new Response(JSON.stringify({ error: 'Only mentors can create courses' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const body: CreateCourseRequest = await req.json();
    const { name, duration, description } = body;

    if (!name || !duration || !description) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        details: 'name, duration, and description are required'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (name.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Course name cannot be empty' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (description.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Course description cannot be empty' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const mentorId = decoded.userId;

    const newCourse = await db
      .insert(courses)
      .values({
        mentorId,
        name: name.trim(),
        duration: duration.trim(),
        description: description.trim(),
        status: 'active',
        enrolledMenteesCount: 0
      })
      .returning();

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: newCourse[0].id,
        mentorId: newCourse[0].mentorId,
        name: newCourse[0].name,
        duration: newCourse[0].duration,
        description: newCourse[0].description,
        status: newCourse[0].status,
        enrolledMenteesCount: newCourse[0].enrolledMenteesCount,
        createdAt: newCourse[0].createdAt,
        updatedAt: newCourse[0].updatedAt
      }
    }), {
      status: 201,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Create course error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
