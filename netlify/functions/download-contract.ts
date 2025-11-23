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

// Helper function to generate Cloudinary authenticated URL
function generateAuthenticatedUrl(publicId: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const crypto = require('crypto');

  // Create signature for authenticated URL
  const stringToSign = `timestamp=${timestamp}&${publicId}${CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  // Build authenticated URL
  const authenticatedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}?api_key=${CLOUDINARY_API_KEY}&timestamp=${timestamp}&signature=${signature}`;

  return authenticatedUrl;
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
    // URL format: https://res.cloudinary.com/{cloud_name}/raw/upload/v{version}/{folder}/{filename}.pdf
    const urlParts = user.contractFileUrl.split('/');
    const fileNameWithExt = urlParts[urlParts.length - 1];

    // Find the version part and extract everything after it (that's the public_id with extension)
    const versionIndex = urlParts.findIndex(part => part.startsWith('v') && /^v\d+$/.test(part));
    if (versionIndex === -1) {
      throw new Error('Invalid Cloudinary URL format');
    }

    // Get public_id (everything after version, including folder structure)
    const publicIdWithExt = urlParts.slice(versionIndex + 1).join('/');

    console.log('Original URL:', user.contractFileUrl);
    console.log('Public ID with extension:', publicIdWithExt);

    // Fetch the file from Cloudinary using authenticated URL
    const authenticatedUrl = generateAuthenticatedUrl(publicIdWithExt);

    console.log('Fetching from Cloudinary...');
    const cloudinaryResponse = await fetch(authenticatedUrl);

    if (!cloudinaryResponse.ok) {
      console.error('Cloudinary fetch failed:', cloudinaryResponse.status, cloudinaryResponse.statusText);
      throw new Error(`Failed to fetch file from Cloudinary: ${cloudinaryResponse.statusText}`);
    }

    // Get the file as a blob
    const fileBuffer = await cloudinaryResponse.arrayBuffer();

    // Generate a clean filename
    const sanitizedName = user.fullName
      ? user.fullName.replace(/[^a-zA-Z0-9]/g, '_')
      : 'user';
    const downloadFileName = `${sanitizedName}_contract.pdf`;

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
