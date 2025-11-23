import type { Context } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { userProfiles } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';

const JWT_SECRET = process.env.JWT_SECRET!;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    // Admins can download any contract
    // Regular users can only download their own contract
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

    // Extract public_id from Cloudinary URL
    // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/{type}/v{version}/{public_id}.{format}
    const urlParts = user.contractFileUrl.split('/');
    const fileNameWithExt = urlParts[urlParts.length - 1];
    const versionIndex = urlParts.findIndex(part => part.startsWith('v'));
    const publicIdParts = urlParts.slice(versionIndex + 1);
    const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // Remove extension

    // Generate a signed URL with short expiration (5 minutes)
    const signedUrl = cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'upload',
      sign_url: true,
      secure: true,
      flags: 'attachment',
      attachment: `${user.fullName || 'user'}_contract.pdf`
    });

    return new Response(JSON.stringify({
      downloadUrl: signedUrl,
      fileName: fileNameWithExt
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Download contract error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
