import type { Context } from '@netlify/functions';
import { db } from '../../src/db';
import { mentorMenteeRelationships } from '../../src/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

interface MentorAssignment {
  id?: string;
  mentor: string;
}

interface UpdateMentorAssignmentsRequest {
  menteeId: string;
  assignments: MentorAssignment[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export default async (req: Request, context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  if (req.method !== 'PUT') {
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
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    if (decoded.role !== 'Admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const body: UpdateMentorAssignmentsRequest = await req.json();
    const { menteeId, assignments } = body;

    if (!menteeId) {
      return new Response(JSON.stringify({ error: 'Mentee ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Get existing assignments
    const existingAssignments = await db
      .select({
        id: mentorMenteeRelationships.id,
        mentorId: mentorMenteeRelationships.mentorId
      })
      .from(mentorMenteeRelationships)
      .where(eq(mentorMenteeRelationships.menteeId, menteeId));

    const existingIds = existingAssignments.map(a => a.id);
    const newAssignmentIds = assignments.filter(a => a.id).map(a => a.id!);

    // Delete removed assignments
    const toDelete = existingIds.filter(id => !newAssignmentIds.includes(id));
    if (toDelete.length > 0) {
      await db
        .delete(mentorMenteeRelationships)
        .where(inArray(mentorMenteeRelationships.id, toDelete));
    }

    // Add new assignments
    const newAssignments = assignments.filter(a => !a.id);
    if (newAssignments.length > 0) {
      const assignmentsToInsert = newAssignments.map(assignment => ({
        mentorId: assignment.mentor,
        menteeId: menteeId,
        status: 'active',
        progressPercentage: 0
      }));

      await db
        .insert(mentorMenteeRelationships)
        .values(assignmentsToInsert);
    }

    // Update existing assignments
    for (const assignment of assignments.filter(a => a.id)) {
      await db
        .update(mentorMenteeRelationships)
        .set({
          mentorId: assignment.mentor,
          updatedAt: new Date()
        })
        .where(eq(mentorMenteeRelationships.id, assignment.id!));
    }

    return new Response(JSON.stringify({
      message: 'Mentor assignments updated successfully'
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Error updating mentor assignments:', error);
    return new Response(JSON.stringify({
      error: 'Failed to update mentor assignments',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
