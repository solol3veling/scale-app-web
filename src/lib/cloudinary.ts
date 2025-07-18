import { MediaServiceFactory, MediaUploadProgress } from '@/services/media';

export interface CloudinaryUploadProgress extends MediaUploadProgress {}

export const uploadToCloudinary = async (
    file: File,
    onProgress?: (progress: CloudinaryUploadProgress) => void
): Promise<{ url: string; type: string }> => {
    const mediaService = MediaServiceFactory.getInstance();
    return mediaService.upload(file, {
        folder: 'social-media-posts',
        onProgress,
    });
};

export const getOptimizedImageUrl = (publicId: string, width: number = 300, height: number = 300) => {
    const mediaService = MediaServiceFactory.getInstance();
    return mediaService.getOptimizedUrl(publicId, { width, height });
};
