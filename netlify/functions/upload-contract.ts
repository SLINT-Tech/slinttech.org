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
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { fields, file } = await parseMultipartForm(event);

    if (!file) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No file uploaded' }),
      };
    }

    const userId = fields.userId;
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID is required' }),
      };
    }

    if (file.mimeType !== 'application/pdf') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Only PDF files are allowed' }),
      };
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'contract_files',
        resource_type: 'raw',
        public_id: `contract_${userId}_${Date.now()}`,
        format: 'pdf',
      },
      (error, result) => {
        if (error) {
          throw error;
        }
        return result;
      }
    );

    const bufferStream = Readable.from(file.buffer);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      uploadStream.on('finish', () => {
        resolve(uploadStream);
      });

      uploadStream.on('error', (error) => {
        reject(error);
      });

      bufferStream.pipe(uploadStream);
    });

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

      bufferStream.pipe(stream);
    });

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
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Failed to upload file to Cloudinary'
      }),
    };
  }
};
