import type { Context } from '@netlify/functions';
import { db } from '../../src/db';
import { userProfiles } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createBrevoService } from './utils/brevo-service';
import { renderApplicationStatusUpdate, getStatusEmailData } from './utils/email-templates';

const JWT_SECRET = process.env.JWT_SECRET!;

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

interface UpdateUserRequest {
  userId: string;
  fullName?: string;
  email?: string;
  password?: string;
  membershipCategory?: string;
  careerPath?: string;
  role?: string;
  status?: string;
  communityLink?: string;
  membershipEnabled?: boolean;
  membershipAmount?: number;
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

    const body: UpdateUserRequest = await req.json();
    const {
      userId,
      fullName,
      email,
      password,
      membershipCategory,
      careerPath,
      role,
      status,
      communityLink,
      membershipEnabled,
      membershipAmount
    } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, userId))
      .limit(1);

    if (!existingUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const [emailExists] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.email, email.toLowerCase()))
        .limit(1);

      if (emailExists) {
        return new Response(JSON.stringify({ error: 'Email already exists' }), {
          status: 400,
          headers: corsHeaders
        });
      }
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date()
    };

    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (membershipCategory !== undefined) updateData.membershipCategory = membershipCategory;
    if (careerPath !== undefined) updateData.careerPath = careerPath;
    if (role !== undefined) {
      updateData.role = role;
      updateData.specialization = role === 'Mentor' && careerPath ? careerPath : null;
    }
    if (status !== undefined) updateData.status = status;
    if (communityLink !== undefined) updateData.communityLink = communityLink;
    if (membershipEnabled !== undefined) updateData.membershipEnabled = membershipEnabled;
    if (membershipAmount !== undefined) updateData.membershipAmount = membershipAmount.toString();

    // Hash password if provided
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updateData.passwordHash = passwordHash;
    }

    // Update user
    const [updatedUser] = await db
      .update(userProfiles)
      .set(updateData)
      .where(eq(userProfiles.id, userId))
      .returning({
        id: userProfiles.id,
        email: userProfiles.email,
        fullName: userProfiles.fullName,
        role: userProfiles.role,
        membershipCategory: userProfiles.membershipCategory,
        careerPath: userProfiles.careerPath,
        status: userProfiles.status,
        communityLink: userProfiles.communityLink,
        membershipEnabled: userProfiles.membershipEnabled,
        membershipAmount: userProfiles.membershipAmount,
        membershipPaid: userProfiles.membershipPaid
      });

    if (status !== undefined && status !== existingUser.status) {
      try {
        const brevoService = createBrevoService();
        const statusData = getStatusEmailData(status);
        const emailHtml = renderApplicationStatusUpdate({
          userName: updatedUser.fullName,
          ...statusData
        });

        await brevoService.sendEmailSafe({
          to: [{ email: updatedUser.email, name: updatedUser.fullName }],
          subject: `SlintTech Application Status: ${statusData.statusText}`,
          htmlContent: emailHtml
        });
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
      }
    }

    return new Response(JSON.stringify({
      message: 'User updated successfully',
      user: updatedUser
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Error updating user:', error);
    return new Response(JSON.stringify({
      error: 'Failed to update user',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
