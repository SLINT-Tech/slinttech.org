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
    link.style.display = 'none';
    
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

// Email notification service
export const sendSignupNotification = async (userData: {
  email: string;
  fullName: string;
  role: string;
  membershipCategory: string;
  careerPath: string;
}) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-signup-notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Failed to send notification email');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Email notification error:', error);
    // Don't throw error - email failure shouldn't block signup
    return { success: false, error: error.message };
  }
};