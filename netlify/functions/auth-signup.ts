import type { Context } from '@netlify/functions';
import { db } from '../../src/db';
import { userProfiles } from '../../src/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { queueEmail } from './utils/email-queue';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long' };
  }
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' };
  }
  return { valid: true };
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

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

    const { email, password, fullName, membershipCategory, careerPath, specialization, role } = body;

    if (!email || !password || !fullName || !membershipCategory) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        details: 'Email, password, full name, and membership category are required'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!validateEmail(email)) {
      return new Response(JSON.stringify({
        error: 'Invalid email format',
        details: 'Please provide a valid email address'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return new Response(JSON.stringify({
        error: 'Invalid password',
        details: passwordValidation.error
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (fullName.length < 2 || fullName.length > 100) {
      return new Response(JSON.stringify({
        error: 'Invalid full name',
        details: 'Full name must be between 2 and 100 characters'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const validCategories = ['Student', 'Professional', 'Volunteer'];
    if (!validCategories.includes(membershipCategory)) {
      return new Response(JSON.stringify({
        error: 'Invalid membership category',
        details: 'Please select a valid membership category'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const validRoles = ['Mentee', 'Mentor'];
    const userRole = role || 'Mentee';
    if (!validRoles.includes(userRole)) {
      return new Response(JSON.stringify({
        error: 'Invalid role',
        details: 'Role must be either Mentee or Mentor'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedFullName = sanitizeInput(fullName);

    let existingUser;
    try {
      existingUser = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.email, sanitizedEmail))
        .limit(1);
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return new Response(JSON.stringify({
        error: 'Database error',
        details: 'Unable to check existing users. Please try again later.'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    if (existingUser.length > 0) {
      return new Response(JSON.stringify({
        error: 'Email already registered',
        details: 'This email is already associated with an account. Please use a different email or try logging in.'
      }), {
        status: 409,
        headers: corsHeaders
      });
    }

    let passwordHash;
    try {
      passwordHash = await bcrypt.hash(password, 10);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      return new Response(JSON.stringify({
        error: 'Password processing failed',
        details: 'Unable to secure your password. Please try again.'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    let newUser;
    try {
      [newUser] = await db
        .insert(userProfiles)
        .values({
          email: sanitizedEmail,
          passwordHash,
          fullName: sanitizedFullName,
          membershipCategory,
          careerPath: careerPath ? sanitizeInput(careerPath) : null,
          specialization: specialization ? sanitizeInput(specialization) : null,
          role: userRole,
          status: 'pending',
          membershipEnabled: false,
          membershipPaid: false,
        })
        .returning();
    } catch (insertError: any) {
      console.error('User creation error:', insertError);

      if (insertError.code === '23505') {
        return new Response(JSON.stringify({
          error: 'Email already registered',
          details: 'This email is already in use. Please use a different email.'
        }), {
          status: 409,
          headers: corsHeaders
        });
      }

      return new Response(JSON.stringify({
        error: 'Account creation failed',
        details: 'Unable to create your account. Please try again later.'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    queueEmail({
      type: 'account-awaiting-approval',
      to: { email: newUser.email, name: newUser.fullName },
      data: {
        userName: newUser.fullName,
        userEmail: newUser.email,
        userRole: newUser.role,
        membershipCategory: newUser.membershipCategory
      }
    });

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@slinttech.com';
    queueEmail({
      type: 'admin-new-user-notification',
      to: { email: adminEmail, name: 'Admin' },
      data: {
        userName: newUser.fullName,
        userEmail: newUser.email,
        userRole: newUser.role,
        membershipCategory: newUser.membershipCategory,
        careerPath: newUser.careerPath || undefined,
        specialization: newUser.specialization || undefined,
        registrationDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        adminDashboardLink: `${process.env.VITE_APP_URL || 'https://slinttech.netlify.app'}/admin`
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Account created successfully',
      userId: newUser.id
    }), {
      status: 201,
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Unexpected signup error:', error);
    return new Response(JSON.stringify({
      error: 'Server error',
      details: 'An unexpected error occurred. Please try again later.'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
