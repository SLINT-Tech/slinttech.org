import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { lessons, lessonProgress, courses, userProfiles } from '../../src/db/schema';
import { eq, and, or, like, desc } from 'drizzle-orm';

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

    const lessonsResult = await db
      .select({
        lessonId: lessons.id,
        title: lessons.title,
        description: lessons.description,
        link: lessons.link,
        orderIndex: lessons.orderIndex,
        status: lessons.status,
        createdAt: lessons.createdAt,
        courseId: courses.id,
        courseName: courses.name,
        mentorId: userProfiles.id,
        mentorName: userProfiles.fullName,
        completed: lessonProgress.completed,
        completedAt: lessonProgress.completedAt
      })
      .from(lessons)
      .innerJoin(courses, eq(lessons.courseId, courses.id))
      .innerJoin(userProfiles, eq(lessons.mentorId, userProfiles.id))
      .leftJoin(lessonProgress, and(
        eq(lessonProgress.lessonId, lessons.id),
        eq(lessonProgress.menteeId, menteeId)
      ))
      .where(eq(lessons.status, 'active'))
      .orderBy(desc(lessons.createdAt));

    const lessonsData = lessonsResult.map(lesson => ({
      id: lesson.lessonId,
      title: lesson.title,
      description: lesson.description,
      link: lesson.link,
      orderIndex: lesson.orderIndex,
      status: lesson.status,
      createdAt: lesson.createdAt,
      completed: lesson.completed || false,
      completedAt: lesson.completedAt,
      course: {
        id: lesson.courseId,
        name: lesson.courseName
      },
      mentor: {
        id: lesson.mentorId,
        name: lesson.mentorName
      }
    }));

    return new Response(JSON.stringify({
      success: true,
      data: {
        lessons: lessonsData
      }
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Get lessons error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
