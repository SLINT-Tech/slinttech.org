import { Handler } from '@netlify/functions';
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

const parseMultipartForm = (event: any): Promise<{ fields: Record<string, string>; file: FileData | null }> => {
  return new Promise((resolve, reject) => {
    const fields: Record<string, string> = {};
    let fileData: FileData | null = null;

    const busboy = Busboy({
      headers: {
        'content-type': event.headers['content-type'] || event.headers['Content-Type'],
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

    const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
    busboy.write(bodyBuffer);
    busboy.end();
  });
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: 'Method not allowed',
        details: 'Only POST requests are accepted'
      }),
    };
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Cloudinary configuration missing');
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Server configuration error',
        details: 'File upload service is not properly configured'
      }),
    };
  }

  try {
    let fields, file;
    try {
      const parseResult = await parseMultipartForm(event);
      fields = parseResult.fields;
      file = parseResult.file;
    } catch (parseError: any) {
      console.error('Form parsing error:', parseError);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid file upload',
          details: 'Unable to process the uploaded file. Please try again.'
        }),
      };
    }

    if (!file) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'No file provided',
          details: 'Please select a file to upload'
        }),
      };
    }

    const userId = fields.userId;
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing user ID',
          details: 'User identification is required for file upload'
        }),
      };
    }

    if (file.mimeType !== 'application/pdf') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid file type',
          details: 'Only PDF files are allowed. Please upload a PDF document.'
        }),
      };
    }

    const maxFileSize = 10 * 1024 * 1024;
    if (file.buffer.length > maxFileSize) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'File too large',
          details: 'File size must not exceed 10MB'
        }),
      };
    }

    if (file.buffer.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Empty file',
          details: 'The uploaded file appears to be empty'
        }),
      };
    }

    const bufferStream = Readable.from(file.buffer);

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'contract_files',
          resource_type: 'raw',
          public_id: `contract_${userId}_${Date.now()}`,
          format: 'pdf',
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      }),
    };
  } catch (error: any) {
    console.error('Upload error:', error);

    if (error.http_code === 401 || error.http_code === 403) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Upload service authentication failed',
          details: 'Unable to authenticate with file storage service. Please contact support.'
        }),
      };
    }

    if (error.http_code === 413) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'File too large',
          details: 'The uploaded file exceeds the maximum allowed size'
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Upload failed',
        details: error.message || 'Unable to upload file. Please try again later.'
      }),
    };
  }
};
