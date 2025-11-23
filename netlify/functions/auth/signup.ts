import type { Context } from '@netlify/functions';
import { db } from '../../../src/db';
import { userProfiles } from '../../../src/db/schema';
import bcrypt from 'bcryptjs';
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
    const { email, password, fullName, membershipCategory, careerPath, specialization, role } = body;

    if (!email || !password || !fullName || !membershipCategory) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const existingUser = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(userProfiles)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        membershipCategory,
        careerPath: careerPath || null,
        specialization: specialization || null,
        role: role || 'Mentee',
        status: 'pending',
        membershipEnabled: false,
        membershipPaid: false,
      })
      .returning();

    return new Response(JSON.stringify({
      message: 'Account created successfully. Please wait for admin approval.',
      userId: newUser.id
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
