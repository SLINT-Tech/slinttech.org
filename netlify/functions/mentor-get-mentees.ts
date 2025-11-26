import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { mentorMenteeRelationships, userProfiles } from '../../src/db/schema';
import { eq, desc } from 'drizzle-orm';

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

    const mentorId = decoded.userId;

    const menteesResult = await db
      .select({
        relationshipId: mentorMenteeRelationships.id,
        menteeId: mentorMenteeRelationships.menteeId,
        status: mentorMenteeRelationships.status,
        assignedDate: mentorMenteeRelationships.assignedDate,
        completionDate: mentorMenteeRelationships.completionDate,
        progressPercentage: mentorMenteeRelationships.progressPercentage,
        notes: mentorMenteeRelationships.notes,
        createdAt: mentorMenteeRelationships.createdAt,
        menteeFullName: userProfiles.fullName,
        menteeEmail: userProfiles.email,
        menteePhone: userProfiles.phoneNumber,
        menteeCareerPath: userProfiles.careerPath
      })
      .from(mentorMenteeRelationships)
      .innerJoin(userProfiles, eq(mentorMenteeRelationships.menteeId, userProfiles.id))
      .where(eq(mentorMenteeRelationships.mentorId, mentorId))
      .orderBy(desc(mentorMenteeRelationships.assignedDate));

    const mentees = menteesResult.map(m => ({
      id: m.relationshipId,
      menteeId: m.menteeId,
      fullName: m.menteeFullName,
      email: m.menteeEmail,
      phone: m.menteePhone,
      careerPath: m.menteeCareerPath,
      status: m.status,
      assignedDate: m.assignedDate,
      completionDate: m.completionDate,
      progressPercentage: m.progressPercentage || 0,
      notes: m.notes,
      createdAt: m.createdAt
    }));

    const totalMentees = mentees.length;
    const activeMentees = mentees.filter(m => m.status === 'active').length;
    const completedMentees = mentees.filter(m => m.status === 'completed').length;
    const avgProgress = totalMentees > 0
      ? Math.round(mentees.reduce((acc, m) => acc + m.progressPercentage, 0) / totalMentees)
      : 0;

    return new Response(JSON.stringify({
      success: true,
      data: {
        mentees,
        stats: {
          totalMentees,
          activeMentees,
          completedMentees,
          avgProgress
        }
      }
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Get mentees error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
