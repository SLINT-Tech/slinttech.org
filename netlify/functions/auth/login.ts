import type { Context } from '@netlify/functions';
import { db } from '../../../src/db';
import { userProfiles } from '../../../src/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { generateToken } from './utils';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const [user] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (user.status === 'pending') {
      return new Response(JSON.stringify({ error: 'Your account is pending approval' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (user.status === 'rejected') {
      return new Response(JSON.stringify({ error: 'Your account has been rejected' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (user.status === 'suspended') {
      return new Response(JSON.stringify({ error: 'Your account has been suspended' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return new Response(JSON.stringify({
      token,
      profile: userWithoutPassword
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
