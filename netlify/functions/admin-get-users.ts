import type { Context } from '@netlify/functions';
import { db } from '../../src/db';
import { userProfiles } from '../../src/db/schema';
import { eq, ilike, or, sql, count, and } from 'drizzle-orm';
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

    if (decoded.role !== 'Admin') {
      return new Response(JSON.stringify({ error: 'Access denied. Admin privileges required.' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const body = await req.json();
    const {
      page = 1,
      perPage = 10,
      search = '',
      status = 'all',
      role = 'all',
      membershipCategory = 'all'
    } = body;

    const offset = (page - 1) * perPage;

    let whereConditions = [];

    if (search && search.trim()) {
      whereConditions.push(
        or(
          ilike(userProfiles.fullName, `%${search.trim()}%`),
          ilike(userProfiles.email, `%${search.trim()}%`)
        )
      );
    }

    if (status !== 'all') {
      whereConditions.push(eq(userProfiles.status, status));
    }

    if (role !== 'all') {
      whereConditions.push(eq(userProfiles.role, role));
    }

    if (membershipCategory !== 'all') {
      whereConditions.push(eq(userProfiles.membershipCategory, membershipCategory));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const usersQuery = db
      .select({
        id: userProfiles.id,
        email: userProfiles.email,
        fullName: userProfiles.fullName,
        membershipCategory: userProfiles.membershipCategory,
        careerPath: userProfiles.careerPath,
        role: userProfiles.role,
        status: userProfiles.status,
        specialization: userProfiles.specialization,
        contractFileUrl: userProfiles.contractFileUrl,
        membershipEnabled: userProfiles.membershipEnabled,
        membershipAmount: userProfiles.membershipAmount,
        membershipPaid: userProfiles.membershipPaid,
        paymentReference: userProfiles.paymentReference,
        paymentDate: userProfiles.paymentDate,
        discordLink: userProfiles.discordLink,
        createdAt: userProfiles.createdAt,
        updatedAt: userProfiles.updatedAt,
      })
      .from(userProfiles);

    if (whereClause) {
      usersQuery.where(whereClause);
    }

    const users = await usersQuery
      .orderBy(sql`${userProfiles.createdAt} DESC`)
      .limit(perPage)
      .offset(offset);

    const countQuery = db
      .select({ count: count() })
      .from(userProfiles);

    if (whereClause) {
      countQuery.where(whereClause);
    }

    const [{ count: totalCount }] = await countQuery;

    return new Response(JSON.stringify({
      users,
      totalCount,
      page,
      perPage,
      totalPages: Math.ceil(totalCount / perPage)
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
