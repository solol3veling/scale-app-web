// Enhanced Post Validator that bridges the old validation system with the new comprehensive one
import { 
  PlatformValidator, 
  PostMetadataValidationRequest, 
  Platform,
  MediaValidationItemImpl,
  PostMetadataValidationResponse
} from '@/types/validator/platformvalidator';
import { SocialAccount, MediaItem } from '@/types/api';

// Legacy compatibility
import { ValidationMessage, PostValidationResult } from './postValidator';

export class EnhancedPostValidator {
  private static validator = new PlatformValidator();

  /**
   * Main validation method that returns the new comprehensive result
   */
  static validatePostComprehensive(
    content: string,
    media: MediaItem[],
    selectedAccounts: SocialAccount[]
  ): PostMetadataValidationResponse | null {
    if (selectedAccounts.length === 0) {
      return null;
    }

    const platforms = this.convertToPlatforms(selectedAccounts);
    const mediaItems = this.convertMediaItems(media);
    
    const request: PostMetadataValidationRequest = {
      content: content || undefined,
      media: mediaItems.length > 0 ? mediaItems : undefined,
      platforms: platforms,
    };

    return this.validator.validatePostMetadata(request);
  }

  /**
   * Legacy compatibility method - returns old format for existing code
   */
  static validatePost(
    content: string,
    media: MediaItem[],
    selectedAccounts: SocialAccount[]
  ): PostValidationResult {
    const comprehensiveResult = this.validatePostComprehensive(content, media, selectedAccounts);
    
    if (!comprehensiveResult) {
      return {
        isValid: false,
        messages: [{
          type: 'warning',
          field: 'accounts',
          message: 'No social accounts selected. Post will not be published.'
        }]
      };
    }

    // Convert new format to legacy format
    const messages: ValidationMessage[] = [];
    let isValid = comprehensiveResult.overallValid;

    // Convert platform-specific issues to legacy messages
    Array.from(comprehensiveResult.platformResults.entries()).forEach(([platform, result]) => {
      result.issues.forEach(issue => {
        const messageType = issue.severity === 'ERROR' ? 'error' : 
                          issue.severity === 'WARNING' ? 'warning' : 'success';
        
        const field = this.getFieldFromIssueType(issue.type);
        
        messages.push({
          type: messageType,
          field,
          message: issue.message,
          platform: platform.toString()
        });
      });
    });

    // Add general warnings
    comprehensiveResult.generalWarnings.forEach(warning => {
      messages.push({
        type: 'warning',
        field: 'general',
        message: warning
      });
    });

    // Add success message if valid
    if (isValid && selectedAccounts.length > 0) {
      messages.push({
        type: 'success',
        field: 'general',
        message: 'Post content meets all selected platform requirements.'
      });
    }

    return { isValid, messages };
  }

  /**
   * Quick validation check for a single platform
   */
  static validateForPlatform(
    content: string,
    media: MediaItem[],
    platform: Platform
  ) {
    const mediaItems = this.convertMediaItems(media);
    const request: PostMetadataValidationRequest = {
      content: content || undefined,
      media: mediaItems.length > 0 ? mediaItems : undefined,
      platforms: [platform],
    };

    return this.validator.validatePostMetadata(request);
  }

  /**
   * Get the most restrictive character limit among selected platforms
   */
  static getStrictestCharacterLimit(platforms: Platform[]): number {
    const limits = platforms.map(platform => {
      const result = this.validator.validatePostMetadata({
        content: '',
        platforms: [platform]
      });
      return result.platformResults.get(platform)?.limits.maxTextLength || 1000;
    });

    return Math.min(...limits);
  }

  /**
   * Check if media is compatible with all selected platforms
   */
  static isMediaCompatible(
    mediaItem: MediaItem,
    platforms: Platform[]
  ): { compatible: boolean; issues: string[] } {
    const media = this.convertMediaItems([mediaItem]);
    const issues: string[] = [];

    for (const platform of platforms) {
      const request: PostMetadataValidationRequest = {
        media: media,
        platforms: [platform],
      };

      const result = this.validator.validatePostMetadata(request);
      const platformResult = result.platformResults.get(platform);
      
      if (platformResult && !platformResult.valid) {
        const mediaIssues = platformResult.issues
          .filter(issue => issue.severity === 'ERROR')
          .map(issue => `${platform}: ${issue.message}`);
        issues.push(...mediaIssues);
      }
    }

    return {
      compatible: issues.length === 0,
      issues
    };
  }

  /**
   * Get character count status for text across all platforms
   */
  static getTextStatus(
    content: string,
    platforms: Platform[]
  ): 'valid' | 'warning' | 'error' {
    if (platforms.length === 0) return 'valid';

    const request: PostMetadataValidationRequest = {
      content,
      platforms,
    };

    const result = this.validator.validatePostMetadata(request);
    
    // Check if any platform has text length errors
    const hasErrors = Array.from(result.platformResults.values())
      .some(platformResult => 
        platformResult.issues.some(issue => 
          issue.type === 'TEXT_LENGTH' && issue.severity === 'ERROR'
        )
      );

    if (hasErrors) return 'error';

    // Check for warnings (like Twitter best practice)
    const hasWarnings = Array.from(result.platformResults.values())
      .some(platformResult => 
        platformResult.issues.some(issue => 
          issue.type.includes('TEXT') && issue.severity === 'WARNING'
        )
      );

    return hasWarnings ? 'warning' : 'valid';
  }

  /**
   * Get media status across all platforms
   */
  static getMediaStatus(
    media: MediaItem[],
    platforms: Platform[]
  ): 'valid' | 'warning' | 'error' {
    if (platforms.length === 0 || media.length === 0) return 'valid';

    const mediaItems = this.convertMediaItems(media);
    const request: PostMetadataValidationRequest = {
      media: mediaItems,
      platforms,
    };

    const result = this.validator.validatePostMetadata(request);
    
    // Check for media-related errors
    const mediaIssueTypes = [
      'IMAGE_COUNT', 'VIDEO_COUNT', 'UNSUPPORTED_IMAGE_TYPE', 
      'UNSUPPORTED_VIDEO_TYPE', 'IMAGE_SIZE_TOO_LARGE', 
      'VIDEO_SIZE_TOO_LARGE', 'INSTAGRAM_JPEG_ONLY',
      'INSTAGRAM_MEDIA_REQUIRED'
    ];

    const hasErrors = Array.from(result.platformResults.values())
      .some(platformResult => 
        platformResult.issues.some(issue => 
          mediaIssueTypes.includes(issue.type) && issue.severity === 'ERROR'
        )
      );

    if (hasErrors) return 'error';

    const hasWarnings = Array.from(result.platformResults.values())
      .some(platformResult => 
        platformResult.issues.some(issue => 
          mediaIssueTypes.includes(issue.type) && issue.severity === 'WARNING'
        )
      );

    return hasWarnings ? 'warning' : 'valid';
  }

  /**
   * Convert platform strings from SocialAccount to Platform enum
   */
  static convertToPlatforms(accounts: SocialAccount[]): Platform[] {
    return accounts.map(account => {
      const platformStr = account.platform.toUpperCase();
      return Platform[platformStr as keyof typeof Platform] || Platform.FACEBOOK;
    });
  }

  /**
   * Convert MediaItem array to MediaValidationItem array
   */
  private static convertMediaItems(mediaItems: MediaItem[]) {
    return mediaItems.map(item => {
      const getTypeFromUrl = (url: string, fallbackType?: string) => {
        const extension = url.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'jpg':
          case 'jpeg':
            return 'image/jpeg';
          case 'png':
            return 'image/png';
          case 'gif':
            return 'image/gif';
          case 'webp':
            return 'image/webp';
          case 'mp4':
            return 'video/mp4';
          case 'mov':
            return 'video/mov';
          case 'avi':
            return 'video/avi';
          default:
            return fallbackType || 'image/jpeg';
        }
      };

      // Estimate file size (in real implementation, this would come from file upload)
      const estimateSize = (url: string, type: string) => {
        if (type.startsWith('image/')) {
          return 2.5; // MB estimate for images
        } else if (type.startsWith('video/')) {
          return 15; // MB estimate for videos
        }
        return 1;
      };

      const mediaType = getTypeFromUrl(item.url, item.type);
      
      return new MediaValidationItemImpl(
        mediaType,
        estimateSize(item.url, mediaType),
        undefined, // width - would come from image metadata in real implementation
        undefined, // height - would come from image metadata in real implementation
        undefined  // duration - would come from video metadata in real implementation
      );
    });
  }

  /**
   * Get real-time validation suggestions as user types
   */
  static getTypingSuggestions(
    content: string,
    platforms: Platform[]
  ): string[] {
    const suggestions: string[] = [];
    
    if (platforms.length === 0) {
      suggestions.push("Select platforms to see validation hints");
      return suggestions;
    }

    const strictestLimit = this.getStrictestCharacterLimit(platforms);
    const remaining = strictestLimit - content.length;

    if (remaining < 50 && remaining > 0) {
      suggestions.push(`${remaining} characters remaining for ${platforms.map(p => p.toLowerCase()).join(', ')}`);
    }

    if (content.length > strictestLimit) {
      suggestions.push(`Content exceeds character limit by ${content.length - strictestLimit} characters`);
    }

    // Platform-specific suggestions
    if (platforms.includes(Platform.INSTAGRAM) && !content.includes('#')) {
      suggestions.push("Consider adding hashtags for better Instagram engagement");
    }

    if (platforms.includes(Platform.TWITTER) && content.length > 240) {
      suggestions.push("Consider shortening for better Twitter engagement (current: " + content.length + " chars)");
    }

    return suggestions;
  }

  /**
   * Map issue types to form fields for legacy compatibility
   */
  private static getFieldFromIssueType(issueType: string): 'text' | 'media' | 'accounts' | 'general' {
    if (issueType.includes('TEXT')) return 'text';
    if (issueType.includes('IMAGE') || issueType.includes('VIDEO') || issueType.includes('MEDIA')) return 'media';
    if (issueType.includes('BUSINESS') || issueType.includes('PAGE')) return 'accounts';
    return 'general';
  }
}

// Export both for different use cases
export const enhancedPostValidator = EnhancedPostValidator;
export default EnhancedPostValidator;