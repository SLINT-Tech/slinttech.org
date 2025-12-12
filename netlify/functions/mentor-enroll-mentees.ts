import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { courses, courseEnrollments, mentorMenteeRelationships, userProfiles } from '../../src/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { queueEmail } from './utils/email-queue';

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

interface EnrollMenteesRequest {
  courseId: string;
  menteeIds: string[];
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
      return new Response(JSON.stringify({ error: 'Only mentors can enroll mentees' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const body: EnrollMenteesRequest = await req.json();
    const { courseId, menteeIds } = body;

    if (!courseId || !menteeIds || menteeIds.length === 0) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        details: 'courseId and menteeIds are required'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const mentorId = decoded.userId;

    const course = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.mentorId, mentorId)))
      .limit(1);

    if (course.length === 0) {
      return new Response(JSON.stringify({ error: 'Course not found or you do not have permission' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const relationships = await db
      .select()
      .from(mentorMenteeRelationships)
      .where(
        and(
          eq(mentorMenteeRelationships.mentorId, mentorId),
          inArray(mentorMenteeRelationships.menteeId, menteeIds)
        )
      );

    if (relationships.length !== menteeIds.length) {
      return new Response(JSON.stringify({ error: 'Some mentees are not assigned to you' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const existingEnrollments = await db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.courseId, courseId),
          inArray(courseEnrollments.menteeId, menteeIds)
        )
      );

    const alreadyEnrolledIds = existingEnrollments.map(e => e.menteeId);
    const newMenteeIds = menteeIds.filter(id => !alreadyEnrolledIds.includes(id));

    if (newMenteeIds.length === 0) {
      return new Response(JSON.stringify({
        error: 'All selected mentees are already enrolled in this course'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const enrollmentValues = newMenteeIds.map(menteeId => ({
      courseId,
      menteeId,
      status: 'active',
      progressPercentage: 0
    }));

    const newEnrollments = await db
      .insert(courseEnrollments)
      .values(enrollmentValues)
      .returning();

    const updatedCourse = await db
      .update(courses)
      .set({
        enrolledMenteesCount: course[0].enrolledMenteesCount + newMenteeIds.length,
        updatedAt: new Date()
      })
      .where(eq(courses.id, courseId))
      .returning();

    const [mentor] = await db
      .select({ fullName: userProfiles.fullName })
      .from(userProfiles)
      .where(eq(userProfiles.id, mentorId))
      .limit(1);

    const mentees = await db
      .select({
        id: userProfiles.id,
        email: userProfiles.email,
        fullName: userProfiles.fullName
      })
      .from(userProfiles)
      .where(inArray(userProfiles.id, newMenteeIds));

    const courseLink = `${process.env.VITE_APP_URL || 'https://slinttech.netlify.app'}/mentee/courses/${courseId}`;

    for (const mentee of mentees) {
      queueEmail({
        type: 'course-enrollment',
        to: { email: mentee.email, name: mentee.fullName },
        data: {
          menteeName: mentee.fullName,
          courseTitle: course[0].title,
          courseDescription: course[0].description || 'No description available',
          courseDuration: course[0].duration || 'Self-paced',
          courseLevel: course[0].level || 'Intermediate',
          mentorName: mentor.fullName,
          courseLink
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        enrolledCount: newMenteeIds.length,
        totalEnrolled: updatedCourse[0].enrolledMenteesCount,
        alreadyEnrolledCount: alreadyEnrolledIds.length
      }
    }), {
      status: 201,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Enroll mentees error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
