import { S3Client, PutObjectCommand, DeleteObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import {
  MediaService,
  MediaUploadProgress,
  MediaUploadResult,
  MediaUploadOptions,
  MediaOptimizationOptions,
} from './types';
import { generateVideoThumbnailBlob } from '@/utils/videoThumbnail';

export class S3MediaService implements MediaService {
  private s3Client: S3Client;
  private bucket: string;
  private bucketCreated: boolean = false;

  constructor(config: {
    endpoint: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    forcePathStyle?: boolean;
    useSSL?: boolean;
  }) {
    this.bucket = config.bucket;
    this.s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: config.forcePathStyle !== false,
      tls: config.useSSL === true,
    });
  }

  private async ensureBucketExists(): Promise<void> {
    if (this.bucketCreated) return;

    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.bucketCreated = true;
    } catch (error) {
      try {
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.bucketCreated = true;
        console.log(`Bucket ${this.bucket} created successfully`);
      } catch (createError) {
        console.error('Failed to create bucket:', createError);
        throw new Error(`Failed to create bucket: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
      }
    }
  }

  async upload(file: File, options?: MediaUploadOptions): Promise<MediaUploadResult> {
    const timestamp = Date.now();
    
    if (options?.userId) {
      // User-specific upload: userId/userId_timestamp-filename
      const fileName = `${options.userId}_${timestamp}-${file.name}`;
      const key = `${options.userId}/${fileName}`;
      return this.performUpload(file, key, options);
    } else {
      // Fallback to folder-based upload if no userId
      const fileName = `${timestamp}-${file.name}`;
      const key = options?.folder ? `${options.folder}/${fileName}` : fileName;
      return this.performUpload(file, key, options);
    }
  }

  private async performUpload(file: File, key: string, options?: MediaUploadOptions): Promise<MediaUploadResult> {
    const mediaType = file.type.startsWith('image/') ? 'image' : 'video';

    try {
      options?.onProgress?.({ progress: 10 });

      // Ensure bucket exists
      await this.ensureBucketExists();

      options?.onProgress?.({ progress: 20 });

      const fileBuffer = await file.arrayBuffer();
      
      // Upload main file
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: file.type,
      });

      options?.onProgress?.({ progress: 40 });

      await this.s3Client.send(command);

      const url = this.getPublicUrl(key);

      const result: MediaUploadResult = {
        url,
        type: mediaType,
      };

      // If it's a video, also upload thumbnail
      if (mediaType === 'video') {
        try {
          options?.onProgress?.({ progress: 60 });

          // Generate thumbnail
          const thumbnailBlob = await generateVideoThumbnailBlob(file, 300, 300, 0.5);
          
          // Create thumbnail key (same name but with .jpg extension)
          const thumbnailKey = key.replace(/\.[^/.]+$/, '.jpg');
          
          const thumbnailBuffer = await thumbnailBlob.arrayBuffer();
          
          const thumbnailCommand = new PutObjectCommand({
            Bucket: this.bucket,
            Key: thumbnailKey,
            Body: thumbnailBuffer,
            ContentType: 'image/jpeg',
          });

          options?.onProgress?.({ progress: 80 });

          await this.s3Client.send(thumbnailCommand);

          options?.onProgress?.({ progress: 90 });
        } catch (thumbnailError) {
          console.warn('Failed to upload video thumbnail:', thumbnailError);
          // Don't fail the entire upload if thumbnail fails
        }
      }

      options?.onProgress?.({ progress: 100 });

      return result;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      options?.onProgress?.({ progress: 0, error: errorMsg });
      throw new Error(errorMsg);
    }
  }

  private getPublicUrl(key: string): string {
    const endpoint = import.meta.env.VITE_S3_ENDPOINT || 'http://localhost:9000';
    const useSSL = import.meta.env.VITE_S3_USE_SSL === 'true';
    const protocol = useSSL ? 'https' : 'http';
    
    // For MinIO with path-style URLs
    return `${protocol}://${endpoint.replace(/^https?:\/\//, '')}/${this.bucket}/${key}`;
  }

  getOptimizedUrl(publicId: string, options: MediaOptimizationOptions = {}): string {
    // S3/MinIO doesn't have built-in image optimization like Cloudinary
    // For now, just return the original URL
    // In production, you might want to use a service like CloudFront with image optimization
    return publicId;
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      
      await this.s3Client.send(command);
    } catch (error) {
      throw new Error(`Failed to delete object: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}