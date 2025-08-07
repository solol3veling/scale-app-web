import { MediaServiceFactory, MediaUploadProgress } from '@/services/media';

export interface MediaUploadProgressType extends MediaUploadProgress {}

export const uploadToMedia = async (
    file: File,
    onProgress?: (progress: MediaUploadProgressType) => void,
    userId?: string
): Promise<{ url: string; type: string }> => {
    const mediaService = MediaServiceFactory.getInstance();
    return mediaService.upload(file, {
        userId,
        folder: userId ? undefined : 'social-media-posts', // Only use folder if no userId
        onProgress,
    });
};

export const getOptimizedImageUrl = (publicId: string, width: number = 300, height: number = 300) => {
    const mediaService = MediaServiceFactory.getInstance();
    return mediaService.getOptimizedUrl(publicId, { width, height });
};

// Keep backward compatibility
export const uploadToCloudinary = async (
    file: File,
    onProgress?: (progress: MediaUploadProgressType) => void,
    userId?: string
) => uploadToMedia(file, onProgress, userId);

export interface CloudinaryUploadProgress extends MediaUploadProgress {}
