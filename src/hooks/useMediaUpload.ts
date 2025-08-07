import { useState, useCallback } from 'react';
import { uploadToCloudinary, CloudinaryUploadProgress } from '@/lib/cloudinary';
import { MediaItem } from '@/types/api';

export interface MediaUploadState {
  isUploading: boolean;
  progress: number;
  error?: string;
  uploadedFile?: MediaItem;
}

export interface MediaUploadItem extends MediaItem {
  id: string;
  uploadState: MediaUploadState;
}

export const useMediaUpload = (userId?: string) => {
  const [mediaItems, setMediaItems] = useState<MediaUploadItem[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const uploadFiles = useCallback(async (files: File[]) => {
    const newItems: MediaUploadItem[] = files.map((file) => ({
      id: generateId(),
      url: URL.createObjectURL(file), // Temporary URL for preview
      type: file.type.startsWith('image/') ? 'image' : 'video',
      uploadState: {
        isUploading: true,
        progress: 0,
      },
    }));

    // Add items to state immediately for UI feedback
    setMediaItems(prev => [...prev, ...newItems]);

    // Upload each file
    newItems.forEach(async (item, index) => {
      const file = files[index];
      
      try {
        const result = await uploadToCloudinary(file, (progress: CloudinaryUploadProgress) => {
          setMediaItems(prev => 
            prev.map(prevItem => 
              prevItem.id === item.id 
                ? {
                    ...prevItem,
                    uploadState: {
                      isUploading: progress.progress < 100,
                      progress: progress.progress,
                      error: progress.error,
                    },
                    // Update URL once upload is complete
                    url: progress.url || prevItem.url,
                    type: progress.type || prevItem.type,
                  }
                : prevItem
            )
          );
        }, userId);

        // Final update with the uploaded URL
        setMediaItems(prev => 
          prev.map(prevItem => 
            prevItem.id === item.id 
              ? {
                  ...prevItem,
                  url: result.url,
                  type: result.type,
                  uploadState: {
                    isUploading: false,
                    progress: 100,
                  },
                  uploadedFile: {
                    url: result.url,
                    type: result.type,
                  },
                }
              : prevItem
          )
        );
      } catch (error) {
        setMediaItems(prev => 
          prev.map(prevItem => 
            prevItem.id === item.id 
              ? {
                  ...prevItem,
                  uploadState: {
                    isUploading: false,
                    progress: 0,
                    error: error instanceof Error ? error.message : 'Upload failed',
                  },
                }
              : prevItem
          )
        );
      }
    });
  }, [userId]);

  const removeMediaItem = useCallback((id: string) => {
    setMediaItems(prev => {
      const item = prev.find(item => item.id === id);
      if (item && item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
      return prev.filter(item => item.id !== id);
    });
  }, []);

  const clearAllMedia = useCallback(() => {
    mediaItems.forEach(item => {
      if (item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
    });
    setMediaItems([]);
  }, [mediaItems]);

  const getUploadedMedia = useCallback((): MediaItem[] => {
    return mediaItems
      .filter(item => item.uploadedFile)
      .map(item => item.uploadedFile!);
  }, [mediaItems]);

  const isAnyUploading = mediaItems.some(item => item.uploadState.isUploading);
  const hasErrors = mediaItems.some(item => item.uploadState.error);

  return {
    mediaItems,
    uploadFiles,
    removeMediaItem,
    clearAllMedia,
    getUploadedMedia,
    isAnyUploading,
    hasErrors,
  };
};