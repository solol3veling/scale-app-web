import { MediaService } from './types';
import { CloudinaryMediaService } from './cloudinary';

export type MediaProvider = 'cloudinary' | 's3';

export interface MediaServiceConfig {
    provider: MediaProvider;
    cloudinary?: {
        cloudName: string;
        uploadPreset: string;
    };
    s3?: {
        region: string;
        bucket: string;
        accessKeyId: string;
        secretAccessKey: string;
    };
}

class MediaServiceFactory {
    private static instance: MediaService | null = null;
    private static config: MediaServiceConfig | null = null;

    static configure(config: MediaServiceConfig): void {
        this.config = config;
        this.instance = null;
    }

    static getInstance(): MediaService {
        if (!this.config) {
            throw new Error('MediaService not configured. Call MediaServiceFactory.configure() first.');
        }

        if (!this.instance) {
            this.instance = this.createService(this.config);
        }

        return this.instance;
    }

    private static createService(config: MediaServiceConfig): MediaService {
        switch (config.provider) {
            case 'cloudinary':
                if (!config.cloudinary) {
                    throw new Error('Cloudinary configuration is required when using cloudinary provider');
                }
                return new CloudinaryMediaService(
                    config.cloudinary.cloudName,
                    config.cloudinary.uploadPreset
                );

            case 's3':
                throw new Error('S3 provider not implemented yet');

            default:
                throw new Error(`Unsupported media provider: ${config.provider}`);
        }
    }

    static reset(): void {
        this.instance = null;
        this.config = null;
    }
}

const getDefaultConfig = (): MediaServiceConfig => ({
    provider: 'cloudinary',
    cloudinary: {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
    },
});

if (!MediaServiceFactory['config']) {
    MediaServiceFactory.configure(getDefaultConfig());
}

export { MediaServiceFactory };
export * from './types';
export { CloudinaryMediaService } from './cloudinary';
