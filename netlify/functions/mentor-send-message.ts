import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { userProfiles, mentorMenteeRelationships } from '../../src/db/schema';
import { eq, and } from 'drizzle-orm';
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

interface SendMessageRequest {
  menteeId: string;
  message: string;
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
      return new Response(JSON.stringify({ error: 'Only mentors can send messages' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const body: SendMessageRequest = await req.json();
    const { menteeId, message } = body;

    if (!menteeId || !message) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        details: 'menteeId and message are required'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!message.trim()) {
      return new Response(JSON.stringify({
        error: 'Invalid message',
        details: 'Message cannot be empty'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const mentorId = decoded.userId;

    const relationship = await db
      .select()
      .from(mentorMenteeRelationships)
      .where(
        and(
          eq(mentorMenteeRelationships.mentorId, mentorId),
          eq(mentorMenteeRelationships.menteeId, menteeId)
        )
      )
      .limit(1);

    if (relationship.length === 0) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        details: 'This mentee is not assigned to you'
      }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const [mentor] = await db
      .select({
        fullName: userProfiles.fullName
      })
      .from(userProfiles)
      .where(eq(userProfiles.id, mentorId))
      .limit(1);

    const [mentee] = await db
      .select({
        email: userProfiles.email,
        fullName: userProfiles.fullName
      })
      .from(userProfiles)
      .where(eq(userProfiles.id, menteeId))
      .limit(1);

    if (!mentor || !mentee) {
      return new Response(JSON.stringify({
        error: 'User not found'
      }), {
        status: 404,
        headers: corsHeaders
      });
    }

    await queueEmail({
      type: 'direct-message',
      to: { email: mentee.email, name: mentee.fullName },
      data: {
        menteeName: mentee.fullName,
        mentorName: mentor.fullName,
        mentorEmail: mentor.email,
        messageDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        messageContent: message.trim()
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Message sent successfully'
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Send message error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to send message',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
