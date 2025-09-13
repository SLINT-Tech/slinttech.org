import { supabase } from './supabase';

export interface ContractUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadContract = async (
  file: File, 
  userId: string
): Promise<ContractUploadResult> => {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    if (file.type !== 'application/pdf') {
      return { success: false, error: 'Only PDF files are allowed' };
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return { success: false, error: 'File size must be less than 5MB' };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${userId}/contract_${timestamp}.pdf`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { success: false, error: 'Failed to upload contract document' };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('contracts')
      .getPublicUrl(fileName);

    return {
      success: true,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Contract upload error:', error);
    return { success: false, error: 'Upload failed. Please try again.' };
  }
};

export const downloadContract = async (contractUrl: string, fileName: string) => {
  try {
    // Use window.open for reliable download
    const link = document.createElement('a');
    link.href = contractUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Trigger download
    link.click();
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('Failed to download contract');
  }
};

export const getContractDownloadUrl = (contractUrl: string) => {
  if (!contractUrl) return null;
  
  // If it's already a full URL, return as is
  if (contractUrl.startsWith('http')) {
    return contractUrl;
  }
  
  // If it's a storage path, get the public URL
  const { data } = supabase.storage
    .from('contracts')
    .getPublicUrl(contractUrl);
    
  return data.publicUrl;
};