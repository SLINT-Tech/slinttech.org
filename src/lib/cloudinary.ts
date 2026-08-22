import { apiUpload } from './api';

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export const uploadContractToCloudinary = async (
  file: File,
  userId: string
): Promise<UploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    const data = await apiUpload('/upload-contract', formData);

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
