import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { userProfiles } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET!;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export default async (req: Request, context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    let decoded: JWTPayload;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(req.url);
    const targetUserId = url.searchParams.get('userId');

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check authorization
    if (decoded.role !== 'Admin' && decoded.userId !== targetUserId) {
      return new Response(JSON.stringify({ error: 'Access denied. You can only download your own contract.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch the user's contract file URL
    const [user] = await db
      .select({
        contractFileUrl: userProfiles.contractFileUrl,
        fullName: userProfiles.fullName
      })
      .from(userProfiles)
      .where(eq(userProfiles.id, targetUserId))
      .limit(1);

    if (!user || !user.contractFileUrl) {
      return new Response(JSON.stringify({ error: 'Contract not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Original Cloudinary URL:', user.contractFileUrl);

    // Fetch the file directly from the stored URL using Basic Authentication
    // Cloudinary accepts Basic Auth for private resources
    const basicAuth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');

    const cloudinaryResponse = await fetch(user.contractFileUrl, {
      headers: {
        'Authorization': `Basic ${basicAuth}`
      }
    });

    console.log('Cloudinary response status:', cloudinaryResponse.status);

    if (!cloudinaryResponse.ok) {
      console.error('Cloudinary fetch failed:', cloudinaryResponse.status, cloudinaryResponse.statusText);

      // If Basic Auth fails, try without auth (in case files are public)
      const publicResponse = await fetch(user.contractFileUrl);

      if (!publicResponse.ok) {
        throw new Error(`Failed to fetch file from Cloudinary. Status: ${cloudinaryResponse.status}`);
      }

      // Use the public response
      const fileBuffer = await publicResponse.arrayBuffer();
      const sanitizedName = user.fullName
        ? user.fullName.replace(/[^a-zA-Z0-9]/g, '_')
        : 'user';
      const downloadFileName = `${sanitizedName}_contract.pdf`;

      return new Response(fileBuffer, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${downloadFileName}"`,
          'Content-Length': fileBuffer.byteLength.toString(),
        }
      });
    }

    // Get the file as a buffer
    const fileBuffer = await cloudinaryResponse.arrayBuffer();

    // Generate a clean filename
    const sanitizedName = user.fullName
      ? user.fullName.replace(/[^a-zA-Z0-9]/g, '_')
      : 'user';
    const downloadFileName = `${sanitizedName}_contract.pdf`;

    console.log('Successfully fetched file, size:', fileBuffer.byteLength);

    // Stream the file back to the client with proper headers
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${downloadFileName}"`,
        'Content-Length': fileBuffer.byteLength.toString(),
      }
    });

  } catch (error: any) {
    console.error('Download contract error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
