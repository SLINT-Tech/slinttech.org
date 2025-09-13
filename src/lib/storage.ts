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
  
  // Extract the file path from the full URL if it's a complete Supabase URL
  let filePath = contractUrl;
  
  if (contractUrl.startsWith('http')) {
    // Extract the file path from the full Supabase storage URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/contracts/user_id/filename.pdf
    const urlParts = contractUrl.split('/storage/v1/object/public/contracts/');
    if (urlParts.length > 1) {
      filePath = urlParts[1];
    } else {
      // If URL doesn't match expected format, try direct access
      return contractUrl;
    }
  }
  
  // Get the signed URL for private bucket access
  try {
    const { data, error } = supabase.storage
      .from('contracts')
      .createSignedUrl(filePath, 3600); // 1 hour expiry
    
    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error in getContractDownloadUrl:', error);
    // Fallback to public URL attempt
    const { data } = supabase.storage
    .from('contracts')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
};

// Check if contracts bucket exists
export const checkContractsBucket = async () => {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      return false;
    }
    
    return data?.some(bucket => bucket.name === 'contracts') || false;
  } catch (error) {
    console.error('Error checking contracts bucket:', error);
    return false;
  }
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