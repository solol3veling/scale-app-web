import { MediaService } from './types';
import { CloudinaryMediaService } from './cloudinary';
import { S3MediaService } from './s3';

export type MediaProvider = 'cloudinary' | 's3';

export interface MediaServiceConfig {
    provider: MediaProvider;
    cloudinary?: {
        cloudName: string;
        uploadPreset: string;
    };
    s3?: {
        endpoint: string;
        region: string;
        bucket: string;
        accessKeyId: string;
        secretAccessKey: string;
        forcePathStyle?: boolean;
        useSSL?: boolean;
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
                if (!config.s3) {
                    throw new Error('S3 configuration is required when using s3 provider');
                }
                return new S3MediaService(config.s3);

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
    provider: 's3',
    s3: {
        endpoint: import.meta.env.VITE_S3_ENDPOINT || 'http://localhost:9000',
        region: import.meta.env.VITE_S3_REGION || 'us-east-1',
        bucket: import.meta.env.VITE_S3_BUCKET_NAME || 'scale-app',
        accessKeyId: import.meta.env.VITE_S3_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: import.meta.env.VITE_S3_SECRET_ACCESS_KEY || 'minioadmin',
        forcePathStyle: import.meta.env.VITE_S3_FORCE_PATH_STYLE === 'true',
        useSSL: import.meta.env.VITE_S3_USE_SSL === 'true',
    },
});

if (!MediaServiceFactory['config']) {
    MediaServiceFactory.configure(getDefaultConfig());
}

export { MediaServiceFactory };
export * from './types';
export { CloudinaryMediaService } from './cloudinary';
export { S3MediaService } from './s3';
