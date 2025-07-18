import { Cloudinary } from '@cloudinary/url-gen';
import {
  MediaService,
  MediaUploadProgress,
  MediaUploadResult,
  MediaUploadOptions,
  MediaOptimizationOptions,
} from './types';

export class CloudinaryMediaService implements MediaService {
  private cloudinary: Cloudinary;
  private uploadPreset: string;

  constructor(cloudName: string, uploadPreset: string) {
    this.cloudinary = new Cloudinary({
      cloud: {
        cloudName,
      },
    });
    this.uploadPreset = uploadPreset;
  }

  async upload(file: File, options?: MediaUploadOptions): Promise<MediaUploadResult> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      
      if (options?.folder) {
        formData.append('folder', options.folder);
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && options?.onProgress) {
          const progress = Math.round((e.loaded * 100) / e.total);
          options.onProgress({ progress });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            const mediaType = file.type.startsWith('image/') ? 'image' : 'video';

            const result: MediaUploadResult = {
              url: response.secure_url,
              type: mediaType,
            };

            options?.onProgress?.({
              progress: 100,
              url: result.url,
              type: result.type,
            });

            resolve(result);
          } catch (error) {
            const errorMsg = 'Failed to parse upload response';
            options?.onProgress?.({ progress: 0, error: errorMsg });
            reject(new Error(errorMsg));
          }
        } else {
          const errorMsg = `Upload failed with status ${xhr.status}`;
          options?.onProgress?.({ progress: 0, error: errorMsg });
          reject(new Error(errorMsg));
        }
      });

      xhr.addEventListener('error', () => {
        const errorMsg = 'Upload failed due to network error';
        options?.onProgress?.({ progress: 0, error: errorMsg });
        reject(new Error(errorMsg));
      });

      const cloudName = this.cloudinary.cloudinaryConfig.cloud.cloudName;
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/upload`);
      xhr.send(formData);
    });
  }

  getOptimizedUrl(publicId: string, options: MediaOptimizationOptions = {}): string {
    const {
      width = 300,
      height = 300,
      quality = 'auto',
      format = 'auto',
    } = options;

    let transformation = this.cloudinary
      .image(publicId)
      .resize(`w_${width},h_${height},c_fill`)
      .format(format);

    if (quality === 'auto') {
      transformation = transformation.quality('auto');
    } else {
      transformation = transformation.quality(quality);
    }

    return transformation.toURL();
  }

  async delete(publicId: string): Promise<void> {
    throw new Error('Delete functionality requires server-side implementation with Cloudinary admin API');
  }
}