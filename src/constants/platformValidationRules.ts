
export interface TextRules {
    maxLength: number;
    // Add more text-specific rules if needed
}

export interface ImageRules {
    allowedFormats: string[]; // e.g., ['jpeg', 'png']
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    maxSizeKB: number;
    aspectRatios?: string[]; // e.g., ['1:1', '4:5', '1.91:1']
}

export interface VideoRules {
    allowedFormats: string[];
    maxLengthSeconds: number;
    maxSizeMB: number;
    // ... other video rules
}

export interface PlatformContentRules {
    text?: TextRules;
    image?: ImageRules;
    video?: VideoRules;
    maxMediaItems?: number;
    // Add other general platform rules
}

export interface PlatformValidationRules {
    [platform: string]: PlatformContentRules;
}

export const PLATFORM_VALIDATION_RULES: PlatformValidationRules = {
    INSTAGRAM: {
        text: { maxLength: 2200 },
        image: {
            allowedFormats: ['jpeg', 'png'],
            maxSizeKB: 5000, // 5MB
            aspectRatios: ['1:1', '4:5', '1.91:1']
        },
        video: {
            allowedFormats: ['mp4', 'mov'],
            maxLengthSeconds: 60,
            maxSizeMB: 100
        },
        maxMediaItems: 1
    },
    TWITTER: {
        text: { maxLength: 280 },
        image: {
            allowedFormats: ['jpeg', 'png', 'gif'],
            maxSizeKB: 5000
        },
        maxMediaItems: 4
    },
    FACEBOOK: {
        text: { maxLength: 63206 }, // Very high limit, practically unlimited for most posts
        image: {
            allowedFormats: ['jpeg', 'png', 'gif'],
            maxSizeKB: 30000 // 30MB
        },
        video: {
            allowedFormats: ['mp4', 'mov', 'avi', 'wmv'],
            maxLengthSeconds: 14400, // 240 minutes
            maxSizeMB: 4000 // 4GB
        },
        maxMediaItems: 10 // Can vary, but generally multiple images/videos
    },
    LINKEDIN: {
        text: { maxLength: 3000 },
        image: {
            allowedFormats: ['jpeg', 'png', 'gif'],
            maxSizeKB: 5000 // 5MB
        },
        video: {
            allowedFormats: ['mp4', 'mov'],
            maxLengthSeconds: 600, // 10 minutes
            maxSizeMB: 500 // 500MB
        },
        maxMediaItems: 1
    },
    // Add more platforms as needed
};
