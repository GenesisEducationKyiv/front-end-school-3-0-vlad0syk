import { useState } from 'react';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, onUpload: (file: File) => Promise<void>) => {
    if (!file) return;
    
    setUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return { uploading, uploadFile };
};
