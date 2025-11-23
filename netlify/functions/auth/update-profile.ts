import type { Context } from '@netlify/functions';
import { db } from '../../../src/db';
import { userProfiles } from '../../../src/db/schema';
import { eq } from 'drizzle-orm';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { userId, contractFileUrl } = body;

    if (!userId || !contractFileUrl) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await db
      .update(userProfiles)
      .set({
        contractFileUrl,
        updatedAt: new Date()
      })
      .where(eq(userProfiles.id, userId));

    return new Response(JSON.stringify({
      message: 'Profile updated successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
