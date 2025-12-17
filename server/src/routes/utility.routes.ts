import { Router, Request, Response } from 'express';
import { BlobServiceClient } from '@azure/storage-blob';
import Busboy from 'busboy';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { userProfiles } from '../db/schema.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

// Azure Blob Storage configuration
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'contracts';

// Initialize Azure Blob Service Client (lazy initialization)
let blobServiceClient: BlobServiceClient | null = null;

const getBlobServiceClient = () => {
  if (!blobServiceClient && AZURE_STORAGE_CONNECTION_STRING) {
    blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  }
  return blobServiceClient;
};

const getContainerClient = () => {
  const client = getBlobServiceClient();
  if (!client) {
    throw new Error('Azure Storage is not configured');
  }
  return client.getContainerClient(AZURE_STORAGE_CONTAINER_NAME);
};

interface FileData {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

// POST /api/upload-contract
router.post('/upload-contract', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  if (!AZURE_STORAGE_CONNECTION_STRING) {
    console.error('Azure Storage configuration missing');
    return res.status(500).json({
      error: 'Server configuration error',
      details: 'File upload service is not properly configured'
    });
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return res.status(400).json({
      error: 'Invalid content type',
      details: 'Request must be multipart/form-data'
    });
  }

  // Get raw body
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const buffer = Buffer.concat(chunks);

  let fields: Record<string, string> = {};
  let file: FileData | null = null;

  try {
    const parseResult = await new Promise<{ fields: Record<string, string>; file: FileData | null }>((resolve, reject) => {
      const parsedFields: Record<string, string> = {};
      let fileData: FileData | null = null;

      const busboy = Busboy({ headers: { 'content-type': contentType } });

      busboy.on('field', (fieldname, value) => {
        parsedFields[fieldname] = value;
      });

      busboy.on('file', (fieldname, fileStream, info) => {
        const { filename, mimeType } = info;
        const fileChunks: Buffer[] = [];

        fileStream.on('data', (chunk) => {
          fileChunks.push(chunk);
        });

        fileStream.on('end', () => {
          fileData = {
            buffer: Buffer.concat(fileChunks),
            filename,
            mimeType,
          };
        });
      });

      busboy.on('finish', () => {
        resolve({ fields: parsedFields, file: fileData });
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
    return res.status(400).json({
      error: 'Invalid file upload',
      details: 'Unable to process the uploaded file. Please try again.'
    });
  }

  if (!file) {
    return res.status(400).json({
      error: 'No file provided',
      details: 'Please select a file to upload'
    });
  }

  // SECURITY: Always use the authenticated user's ID from the JWT token.
  // Never accept userId from form data as it could allow uploading to other users' profiles.
  const userId = req.user!.userId;

  if (file.mimeType !== 'application/pdf') {
    return res.status(400).json({
      error: 'Invalid file type',
      details: 'Only PDF files are allowed. Please upload a PDF document.'
    });
  }

  const maxFileSize = 10 * 1024 * 1024;
  if (file.buffer.length > maxFileSize) {
    return res.status(400).json({
      error: 'File too large',
      details: 'File size must not exceed 10MB'
    });
  }

  if (file.buffer.length === 0) {
    return res.status(400).json({
      error: 'Empty file',
      details: 'The uploaded file appears to be empty'
    });
  }

  // Upload to Azure Blob Storage
  const containerClient = getContainerClient();
  const blobName = `contract_${userId}_${Date.now()}.pdf`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: {
      blobContentType: 'application/pdf',
      blobContentDisposition: `attachment; filename="${blobName}"`,
    },
  });

  const blobUrl = blockBlobClient.url;

  console.log('File uploaded to Azure Blob Storage:', blobUrl);

  res.status(200).json({
    success: true,
    url: blobUrl,
    blobName: blobName,
  });
}));

// GET /api/download-contract
router.get('/download-contract', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const targetUserId = req.query.userId as string;

  if (!targetUserId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Check authorization
  if (req.user!.role !== 'Admin' && req.user!.userId !== targetUserId) {
    return res.status(403).json({ error: 'Access denied. You can only download your own contract.' });
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
    return res.status(404).json({ error: 'Contract not found' });
  }

  console.log('Fetching contract from storage:', user.contractFileUrl);

  // Fetch the file from the stored URL (works for both Azure Blob and legacy Cloudinary URLs)
  const storageResponse = await fetch(user.contractFileUrl);

  if (!storageResponse.ok) {
    console.error('Storage fetch failed:', storageResponse.status, storageResponse.statusText);
    throw new Error(`Failed to fetch file from storage. Status: ${storageResponse.status}`);
  }

  // Get the file as a buffer
  const fileBuffer = await storageResponse.arrayBuffer();

  // Generate a clean filename
  const sanitizedName = user.fullName
    ? user.fullName.replace(/[^a-zA-Z0-9 ]/g, '_').trim()
    : 'user';
  const downloadFileName = `${sanitizedName}_contract.pdf`;

  console.log('Successfully fetched file, size:', fileBuffer.byteLength, 'filename:', downloadFileName);

  // Stream the file back to the client with proper headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
  res.setHeader('Content-Length', fileBuffer.byteLength.toString());
  res.setHeader('Cache-Control', 'no-cache');
  res.send(Buffer.from(fileBuffer));
}));

export default router;
