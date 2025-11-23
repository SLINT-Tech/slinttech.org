import type { Context } from '@netlify/functions';
import { db } from '../../src/db';
import { userProfiles } from '../../src/db/schema';
import { eq, count, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
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

  if (req.method !== 'GET' && req.method !== 'POST') {
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

    if (decoded.role !== 'Admin') {
      return new Response(JSON.stringify({ error: 'Access denied. Admin privileges required.' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(userProfiles);

    const [approvedResult] = await db
      .select({ count: count() })
      .from(userProfiles)
      .where(eq(userProfiles.status, 'approved'));

    const [pendingResult] = await db
      .select({ count: count() })
      .from(userProfiles)
      .where(eq(userProfiles.status, 'pending'));

    const [rejectedResult] = await db
      .select({ count: count() })
      .from(userProfiles)
      .where(eq(userProfiles.status, 'rejected'));

    const [suspendedResult] = await db
      .select({ count: count() })
      .from(userProfiles)
      .where(eq(userProfiles.status, 'suspended'));

    const stats = {
      total: totalResult.count,
      approved: approvedResult.count,
      pending: pendingResult.count,
      rejected: rejectedResult.count,
      suspended: suspendedResult.count
    };

    return new Response(JSON.stringify({ stats }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
