import { PLATFORM_VALIDATION_RULES, PlatformValidationRules, TextRules, ImageRules, VideoRules } from '@/constants/platformValidationRules';

export interface ValidationMessage {
    type: 'success' | 'error' | 'warning';
    field: 'text' | 'media' | 'accounts' | 'general';
    message: string;
    platform?: string; // Optional: which platform this message applies to
}

export interface PostValidationResult {
    isValid: boolean;
    messages: ValidationMessage[];
}

// Assuming a MediaItem might look like this, including the File object for client-side checks
export interface MediaItem {
    id: string;
    url: string;
    type: 'image' | 'video';
    file?: File; // The actual File object for size/type checks before upload
    // Add other properties like width, height, duration if available
}

export interface PostContent {
    text: string;
    media: MediaItem[];
}

// Simplified SocialAccount interface for validation purposes
export interface SocialAccount {
    id: string;
    platform: string; // e.g., 'INSTAGRAM', 'TWITTER'
    displayName: string;
    // Add other relevant account properties
}

export function validatePost(
    postContent: PostContent,
    selectedAccounts: SocialAccount[],
    rules: PlatformValidationRules = PLATFORM_VALIDATION_RULES
): PostValidationResult {
    let isValid = true;
    const messages: ValidationMessage[] = [];

    if (selectedAccounts.length === 0) {
        messages.push({
            type: 'warning',
            field: 'accounts',
            message: 'No social accounts selected. Post will not be published.',
        });
        // We don't set isValid to false here, as it's a warning, not a blocking error.
    }

    selectedAccounts.forEach(account => {
        const platform = account.platform.toUpperCase();
        const platformRules = rules[platform];

        if (!platformRules) {
            messages.push({
                type: 'warning',
                field: 'accounts',
                message: `No validation rules found for platform: ${platform}.`,
                platform: platform,
            });
            return; // Skip validation for this platform if no rules are found
        }

        // 1. Text Validation
        if (platformRules.text) {
            const textRules: TextRules = platformRules.text;
            if (postContent.text.length > textRules.maxLength) {
                isValid = false;
                messages.push({
                    type: 'error',
                    field: 'text',
                    message: `Text exceeds ${platform} character limit (${textRules.maxLength}). Current: ${postContent.text.length}.`,
                    platform: platform,
                });
            } else if (postContent.text.length > 0) {
                messages.push({
                    type: 'success',
                    field: 'text',
                    message: `Text is within ${platform} character limit. Current: ${postContent.text.length}.`,
                    platform: platform,
                });
            }
        }

        // 2. Media Validation
        if (platformRules.maxMediaItems !== undefined) {
            if (postContent.media.length > platformRules.maxMediaItems) {
                isValid = false;
                messages.push({
                    type: 'error',
                    field: 'media',
                    message: `${platform} allows a maximum of ${platformRules.maxMediaItems} media items. Current: ${postContent.media.length}.`,
                    platform: platform,
                });
            } else if (postContent.media.length > 0) {
                messages.push({
                    type: 'success',
                    field: 'media',
                    message: `Number of media items is within ${platform} limits. Current: ${postContent.media.length}.`,
                    platform: platform,
                });
            }
        }

        postContent.media.forEach(mediaItem => {
            if (mediaItem.type === 'image' && platformRules.image) {
                const imageRules: ImageRules = platformRules.image;
                const fileType = mediaItem.file?.type || ''; // e.g., 'image/jpeg'
                const fileExtension = fileType.split('/')[1]; // e.g., 'jpeg'

                if (imageRules.allowedFormats && !imageRules.allowedFormats.includes(fileExtension)) {
                    isValid = false;
                    messages.push({
                        type: 'error',
                        field: 'media',
                        message: `Image format '${fileExtension}' is not allowed for ${platform}. Allowed: ${imageRules.allowedFormats.join(', ')}.`,
                        platform: platform,
                    });
                }

                if (mediaItem.file && imageRules.maxSizeKB) {
                    const fileSizeKB = mediaItem.file.size / 1024;
                    if (fileSizeKB > imageRules.maxSizeKB) {
                        isValid = false;
                        messages.push({
                            type: 'error',
                            field: 'media',
                            message: `Image size (${fileSizeKB.toFixed(2)} KB) exceeds ${platform} limit (${imageRules.maxSizeKB} KB).`,
                            platform: platform,
                        });
                    }
                }
                // Aspect ratio and dimensions would require image loading, which is more complex for real-time validation

            } else if (mediaItem.type === 'video' && platformRules.video) {
                const videoRules: VideoRules = platformRules.video;
                const fileType = mediaItem.file?.type || '';
                const fileExtension = fileType.split('/')[1];

                if (videoRules.allowedFormats && !videoRules.allowedFormats.includes(fileExtension)) {
                    isValid = false;
                    messages.push({
                        type: 'error',
                        field: 'media',
                        message: `Video format '${fileExtension}' is not allowed for ${platform}. Allowed: ${videoRules.allowedFormats.join(', ')}.`,
                        platform: platform,
                    });
                }

                if (mediaItem.file && videoRules.maxSizeMB) {
                    const fileSizeMB = mediaItem.file.size / (1024 * 1024);
                    if (fileSizeMB > videoRules.maxSizeMB) {
                        isValid = false;
                        messages.push({
                            type: 'error',
                            field: 'media',
                            message: `Video size (${fileSizeMB.toFixed(2)} MB) exceeds ${platform} limit (${videoRules.maxSizeMB} MB).`,
                            platform: platform,
                        });
                    }
                }
                // Video duration would require video loading, which is more complex for real-time validation
            }
        });
    });

    // Add a general success message if no errors and some accounts are selected
    if (isValid && messages.filter(m => m.type === 'error').length === 0 && selectedAccounts.length > 0) {
        messages.push({
            type: 'success',
            field: 'general',
            message: 'Post content meets all selected platform requirements.',
        });
    }

    return { isValid, messages };
}
