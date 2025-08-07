export interface MediaUploadProgress {
  progress: number;
  url?: string;
  type?: string;
  error?: string;
}

export interface MediaUploadResult {
  url: string;
  type: string;
}

export interface MediaUploadOptions {
  folder?: string;
  userId?: string;
  onProgress?: (progress: MediaUploadProgress) => void;
}

export interface MediaOptimizationOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}

export interface MediaService {
  upload(file: File, options?: MediaUploadOptions): Promise<MediaUploadResult>;
  getOptimizedUrl(publicId: string, options?: MediaOptimizationOptions): string;
  delete?(publicId: string): Promise<void>;
}