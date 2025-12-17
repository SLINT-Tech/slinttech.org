import { apiUpload } from './api';

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Upload a contract file to Azure Blob Storage via the backend API
 */
export const uploadContract = async (
  file: File,
  userId: string
): Promise<UploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    const response = await apiUpload('/upload-contract', formData);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url,
      publicId: data.publicId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to upload file',
    };
  }
};


