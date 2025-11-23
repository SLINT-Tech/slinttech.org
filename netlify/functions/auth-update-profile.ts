import type { Context } from '@netlify/functions';
import { db } from '../../src/db';
import { userProfiles } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

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

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed',
      details: 'Only POST requests are accepted'
    }), {
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return new Response(JSON.stringify({
        error: 'Invalid request format',
        details: 'Request body must be valid JSON'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const { userId, contractFileUrl } = body;

    if (!userId || !contractFileUrl) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        details: 'User ID and contract file URL are required'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!contractFileUrl.startsWith('https://')) {
      return new Response(JSON.stringify({
        error: 'Invalid contract URL',
        details: 'Contract file URL must be a secure HTTPS URL'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    try {
      const result = await db
        .update(userProfiles)
        .set({
          contractFileUrl,
          updatedAt: new Date()
        })
        .where(eq(userProfiles.id, userId))
        .returning();

      if (result.length === 0) {
        return new Response(JSON.stringify({
          error: 'User not found',
          details: 'Unable to find user with the provided ID'
        }), {
          status: 404,
          headers: corsHeaders
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Profile updated successfully'
      }), {
        status: 200,
        headers: corsHeaders
      });
    } catch (dbError) {
      console.error('Database update error:', dbError);
      return new Response(JSON.stringify({
        error: 'Database error',
        details: 'Unable to update profile. Please try again later.'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  } catch (error: any) {
    console.error('Unexpected update profile error:', error);
    return new Response(JSON.stringify({
      error: 'Server error',
      details: 'An unexpected error occurred. Please try again later.'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
