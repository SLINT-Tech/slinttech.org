import type { Context } from '@netlify/functions';
import { v2 as cloudinary } from 'cloudinary';
import Busboy from 'busboy';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface FileData {
  buffer: Buffer;
  filename: string;
  mimeType: string;
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
    return new Response(JSON.stringify({
      error: 'Method not allowed',
      details: 'Only POST requests are accepted'
    }), {
      status: 405,
      headers: corsHeaders
    });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Cloudinary configuration missing');
    return new Response(JSON.stringify({
      error: 'Server configuration error',
      details: 'File upload service is not properly configured'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({
        error: 'Invalid content type',
        details: 'Request must be multipart/form-data'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let fields, file;
    try {
      const parseResult = await new Promise<{ fields: Record<string, string>; file: FileData | null }>((resolve, reject) => {
        const fields: Record<string, string> = {};
        let fileData: FileData | null = null;

        const busboy = Busboy({
          headers: {
            'content-type': contentType
          }
        });

        busboy.on('field', (fieldname, value) => {
          fields[fieldname] = value;
        });

        busboy.on('file', (fieldname, file, info) => {
          const { filename, mimeType } = info;
          const chunks: Buffer[] = [];

          file.on('data', (chunk) => {
            chunks.push(chunk);
          });

          file.on('end', () => {
            fileData = {
              buffer: Buffer.concat(chunks),
              filename,
              mimeType,
            };
          });
        });

        busboy.on('finish', () => {
          resolve({ fields, file: fileData });
        });

        busboy.on('error', (error) => {
          reject(error);
        });

        busboy.write(buffer);
        busboy.end();
      });

      fields = parseResult.fields;
      file = parseResult.file;
    } catch (parseError: any) {
      console.error('Form parsing error:', parseError);
      return new Response(JSON.stringify({
        error: 'Invalid file upload',
        details: 'Unable to process the uploaded file. Please try again.'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!file) {
      return new Response(JSON.stringify({
        error: 'No file provided',
        details: 'Please select a file to upload'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const userId = fields.userId;
    if (!userId) {
      return new Response(JSON.stringify({
        error: 'Missing user ID',
        details: 'User identification is required for file upload'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (file.mimeType !== 'application/pdf') {
      return new Response(JSON.stringify({
        error: 'Invalid file type',
        details: 'Only PDF files are allowed. Please upload a PDF document.'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const maxFileSize = 10 * 1024 * 1024;
    if (file.buffer.length > maxFileSize) {
      return new Response(JSON.stringify({
        error: 'File too large',
        details: 'File size must not exceed 10MB'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (file.buffer.length === 0) {
      return new Response(JSON.stringify({
        error: 'Empty file',
        details: 'The uploaded file appears to be empty'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const bufferStream = Readable.from(file.buffer);

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'contract_files',
          resource_type: 'raw',
          public_id: `contract_${userId}_${Date.now()}.pdf`,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.on('error', (error) => {
        reject(error);
      });

      bufferStream.pipe(stream);
    });

    if (!result || !result.secure_url) {
      throw new Error('Upload completed but no URL was returned');
    }

    return new Response(JSON.stringify({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Upload error:', error);

    if (error.http_code === 401 || error.http_code === 403) {
      return new Response(JSON.stringify({
        error: 'Upload service authentication failed',
        details: 'Unable to authenticate with file storage service. Please contact support.'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    if (error.http_code === 413) {
      return new Response(JSON.stringify({
        error: 'File too large',
        details: 'The uploaded file exceeds the maximum allowed size'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify({
      error: 'Upload failed',
      details: error.message || 'Unable to upload file. Please try again later.'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
