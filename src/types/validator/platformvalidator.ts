// Platform Validator for Real-time Content Validation
// Port of Java PlatformValidationService for frontend use

export enum Platform {
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER', 
  INSTAGRAM = 'INSTAGRAM',
  LINKEDIN = 'LINKEDIN',
  PINTEREST = 'PINTEREST',
  YOUTUBE = 'YOUTUBE'
}

export interface MediaValidationItem {
  type?: string;
  sizeMB: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  isImage(): boolean;
  isVideo(): boolean;
  getAspectRatio(): string;
  getSizeMB(): number;
}

export interface ValidationIssue {
  type: string;
  message: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: string;
}

export interface PlatformLimits {
  maxTextLength: number;
  maxImageCount: number;
  maxVideoCount: number;
  maxImageSizeMB: number;
  maxVideoSizeMB: number;
  supportedImageTypes: string[];
  supportedVideoTypes: string[];
  recommendedImageDimensions: ImageDimensions;
}

export interface ContentAnalysis {
  textLength: number;
  imageCount: number;
  videoCount: number;
  totalMediaSizeMB: number;
  mediaTypes: string[];
}

export interface PlatformValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  limits: PlatformLimits;
  analysis: ContentAnalysis;
}

export interface PostMetadataValidationRequest {
  content?: string;
  media?: MediaValidationItem[];
  platforms: Platform[];
}

export interface PostMetadataValidationResponse {
  overallValid: boolean;
  platformResults: Map<Platform, PlatformValidationResult>;
  generalWarnings: string[];
}

export class MediaValidationItemImpl implements MediaValidationItem {
  constructor(
    public type?: string,
    public sizeMB: number = 0,
    public width?: number,
    public height?: number,
    public durationSeconds?: number
  ) {}

  isImage(): boolean {
    return this.type?.startsWith('image/') ?? false;
  }

  isVideo(): boolean {
    return this.type?.startsWith('video/') ?? false;
  }

  getAspectRatio(): string {
    if (!this.width || !this.height) return 'unknown';
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(this.width, this.height);
    return `${this.width / divisor}:${this.height / divisor}`;
  }

  getSizeMB(): number {
    return this.sizeMB;
  }
}

export class PlatformValidator {
  
  validatePostMetadata(request: PostMetadataValidationRequest): PostMetadataValidationResponse {
    const platformResults = new Map<Platform, PlatformValidationResult>();
    const generalWarnings: string[] = [];
    let overallValid = true;

    for (const platform of request.platforms) {
      const result = this.validateForPlatform(request, platform);
      platformResults.set(platform, result);
      if (!result.valid) {
        overallValid = false;
      }
    }

    if (request.content && request.content.length > 2000) {
      generalWarnings.push('Content is very long and may not display well on mobile devices');
    }

    return {
      overallValid,
      platformResults,
      generalWarnings
    };
  }

  private validateForPlatform(request: PostMetadataValidationRequest, platform: Platform): PlatformValidationResult {
    const issues: ValidationIssue[] = [];
    const limits = this.getPlatformLimits(platform);
    const analysis = this.analyzeContent(request);

    // Text length validation
    if (request.content && request.content.length > limits.maxTextLength) {
      issues.push({
        type: 'TEXT_LENGTH',
        message: `Text exceeds maximum length of ${limits.maxTextLength} characters for ${platform}`,
        severity: 'ERROR'
      });
    }

    // Media validation
    if (request.media) {
      const imageCount = request.media.filter(m => m.isImage()).length;
      const videoCount = request.media.filter(m => m.isVideo()).length;

      if (imageCount > limits.maxImageCount) {
        issues.push({
          type: 'IMAGE_COUNT',
          message: `Too many images (${imageCount}). Maximum allowed: ${limits.maxImageCount} for ${platform}`,
          severity: 'ERROR'
        });
      }

      if (videoCount > limits.maxVideoCount) {
        issues.push({
          type: 'VIDEO_COUNT',
          message: `Too many videos (${videoCount}). Maximum allowed: ${limits.maxVideoCount} for ${platform}`,
          severity: 'ERROR'
        });
      }

      // Individual media validation
      for (const media of request.media) {
        if (media.type) {
          const mediaType = media.type.toLowerCase();
          if (media.isImage() && !limits.supportedImageTypes.includes(mediaType)) {
            issues.push({
              type: 'UNSUPPORTED_IMAGE_TYPE',
              message: `Image type '${media.type}' is not supported by ${platform}`,
              severity: 'ERROR'
            });
          }
          if (media.isVideo() && !limits.supportedVideoTypes.includes(mediaType)) {
            issues.push({
              type: 'UNSUPPORTED_VIDEO_TYPE',
              message: `Video type '${media.type}' is not supported by ${platform}`,
              severity: 'ERROR'
            });
          }
        }

        if (media.isImage() && media.getSizeMB() > limits.maxImageSizeMB) {
          issues.push({
            type: 'IMAGE_SIZE_TOO_LARGE',
            message: `Image size ${media.getSizeMB().toFixed(1)}MB exceeds maximum of ${limits.maxImageSizeMB}MB for ${platform}`,
            severity: 'ERROR'
          });
        }

        if (media.isVideo() && media.getSizeMB() > limits.maxVideoSizeMB) {
          issues.push({
            type: 'VIDEO_SIZE_TOO_LARGE',
            message: `Video size ${media.getSizeMB().toFixed(1)}MB exceeds maximum of ${limits.maxVideoSizeMB}MB for ${platform}`,
            severity: 'ERROR'
          });
        }

        if (media.width && media.height) {
          this.validateDimensions(media, platform, limits, issues);
        }

        if (media.isVideo() && media.durationSeconds) {
          this.validateVideoDuration(media, platform, issues);
        }
      }
    }

    // Platform-specific validations
    switch (platform) {
      case Platform.TWITTER:
        if (request.content && request.content.length > 240) {
          issues.push({
            type: 'TWITTER_BEST_PRACTICE',
            message: 'Content is longer than 240 characters. Consider shortening for better engagement on Twitter',
            severity: 'WARNING'
          });
        }
        break;

      case Platform.INSTAGRAM:
        this.validateInstagramSpecificRules(request, issues);
        break;

      case Platform.FACEBOOK:
        this.validateFacebookSpecificRules(request, issues);
        break;
    }

    const isValid = !issues.some(issue => issue.severity === 'ERROR');
    return {
      valid: isValid,
      issues,
      limits,
      analysis
    };
  }

  private validateInstagramSpecificRules(request: PostMetadataValidationRequest, issues: ValidationIssue[]): void {
    if (!request.media || request.media.length === 0) {
      issues.push({
        type: 'INSTAGRAM_MEDIA_REQUIRED',
        message: 'Instagram posts require at least one image or video',
        severity: 'ERROR'
      });
      return;
    }

    // JPEG only validation for images
    for (const media of request.media) {
      if (media.isImage() && media.type?.toLowerCase() !== 'image/jpeg') {
        issues.push({
          type: 'INSTAGRAM_JPEG_ONLY',
          message: 'Instagram only supports JPEG images. Convert your image to JPEG format.',
          severity: 'ERROR'
        });
      }
    }

    // Carousel validation (multiple media)
    if (request.media.length > 1) {
      this.validateInstagramCarouselRules(request.media, issues);
    }

    // Video count validation for Instagram (stricter than other platforms)
    const videoCount = request.media.filter(m => m.isVideo()).length;
    if (videoCount > 1) {
      issues.push({
        type: 'INSTAGRAM_SINGLE_VIDEO',
        message: 'Instagram supports only one video per post. Use carousel for mixed content.',
        severity: 'ERROR'
      });
    }

    // Professional account requirement warning
    issues.push({
      type: 'INSTAGRAM_BUSINESS_REQUIRED',
      message: 'Instagram posting requires a Business or Creator account connected to a Facebook Page',
      severity: 'WARNING'
    });
  }

  private validateInstagramCarouselRules(media: MediaValidationItem[], issues: ValidationIssue[]): void {
    if (media.length > 10) {
      issues.push({
        type: 'INSTAGRAM_CAROUSEL_LIMIT',
        message: 'Instagram carousels support maximum 10 items',
        severity: 'ERROR'
      });
    }

    // First item determines aspect ratio for entire carousel
    const firstItem = media[0];
    if (firstItem.width && firstItem.height) {
      const firstAspectRatio = firstItem.getAspectRatio();
      issues.push({
        type: 'INSTAGRAM_CAROUSEL_INFO',
        message: `Carousel will crop all items to match first item's aspect ratio: ${firstAspectRatio}`,
        severity: 'WARNING'
      });
    }

    // Mixed content in carousel info
    const imageCount = media.filter(m => m.isImage()).length;
    const videoCount = media.filter(m => m.isVideo()).length;

    if (imageCount > 0 && videoCount > 0) {
      issues.push({
        type: 'INSTAGRAM_CAROUSEL_MIXED',
        message: `Carousel contains ${imageCount} images and ${videoCount} videos. Mixed content is supported.`,
        severity: 'INFO'
      });
    }
  }

  private validateFacebookSpecificRules(request: PostMetadataValidationRequest, issues: ValidationIssue[]): void {
    // Facebook specific validations
    if (request.media && request.media.length > 10) {
      issues.push({
        type: 'FACEBOOK_MEDIA_LIMIT',
        message: 'Facebook supports maximum 10 media items per post',
        severity: 'ERROR'
      });
    }

    // Facebook Pages requirement
    issues.push({
      type: 'FACEBOOK_PAGE_REQUIRED',
      message: 'Facebook posting requires admin access to a Facebook Page',
      severity: 'WARNING'
    });
  }

  private getPlatformLimits(platform: Platform): PlatformLimits {
    switch (platform) {
      case Platform.TWITTER:
        return {
          maxTextLength: 280,
          maxImageCount: 4,
          maxVideoCount: 1,
          maxImageSizeMB: 5,
          maxVideoSizeMB: 512,
          supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          supportedVideoTypes: ['video/mp4', 'video/mov'],
          recommendedImageDimensions: { width: 1200, height: 675, aspectRatio: '16:9' }
        };

      case Platform.INSTAGRAM:
        return {
          maxTextLength: 2200,
          maxImageCount: 10,  // Carousel support: up to 10 items
          maxVideoCount: 1,   // Only 1 video per post (not per carousel item)
          maxImageSizeMB: 30,
          maxVideoSizeMB: 1024,
          supportedImageTypes: ['image/jpeg'],  // JPEG ONLY!
          supportedVideoTypes: ['video/mp4', 'video/mov'],
          recommendedImageDimensions: { width: 1080, height: 1080, aspectRatio: '1:1' }
        };

      case Platform.FACEBOOK:
        return {
          maxTextLength: 63206,
          maxImageCount: 10,
          maxVideoCount: 1,
          maxImageSizeMB: 100,
          maxVideoSizeMB: 10240,
          supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'],
          supportedVideoTypes: ['video/mp4', 'video/mov', 'video/avi'],
          recommendedImageDimensions: { width: 1200, height: 628, aspectRatio: '1.91:1' }
        };

      case Platform.LINKEDIN:
        return {
          maxTextLength: 3000,
          maxImageCount: 9,
          maxVideoCount: 1,
          maxImageSizeMB: 100,
          maxVideoSizeMB: 5120,
          supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
          supportedVideoTypes: ['video/mp4', 'video/mov', 'video/wmv'],
          recommendedImageDimensions: { width: 1200, height: 627, aspectRatio: '1.91:1' }
        };

      default:
        // Generic limits
        return {
          maxTextLength: 1000,
          maxImageCount: 4,
          maxVideoCount: 1,
          maxImageSizeMB: 10,
          maxVideoSizeMB: 100,
          supportedImageTypes: ['image/jpeg', 'image/png'],
          supportedVideoTypes: ['video/mp4'],
          recommendedImageDimensions: { width: 1200, height: 630, aspectRatio: '1.9:1' }
        };
    }
  }

  private analyzeContent(request: PostMetadataValidationRequest): ContentAnalysis {
    const textLength = request.content?.length ?? 0;

    if (!request.media) {
      return {
        textLength,
        imageCount: 0,
        videoCount: 0,
        totalMediaSizeMB: 0,
        mediaTypes: []
      };
    }

    const imageCount = request.media.filter(m => m.isImage()).length;
    const videoCount = request.media.filter(m => m.isVideo()).length;

    const mediaTypes = [...new Set(
      request.media
        .map(m => m.type)
        .filter((type): type is string => type != null)
    )];

    const totalSizeMB = request.media.reduce((sum, m) => sum + m.getSizeMB(), 0);

    return {
      textLength,
      imageCount,
      videoCount,
      totalMediaSizeMB,
      mediaTypes
    };
  }

  private validateDimensions(
    media: MediaValidationItem,
    platform: Platform,
    limits: PlatformLimits,
    issues: ValidationIssue[]
  ): void {
    const width = media.width!;
    const height = media.height!;
    const aspectRatio = media.getAspectRatio();

    switch (platform) {
      case Platform.INSTAGRAM:
        if (media.isImage() && !['1:1', '4:5', '9:16'].includes(aspectRatio)) {
          issues.push({
            type: 'INSTAGRAM_ASPECT_RATIO',
            message: `Instagram works best with 1:1 (square), 4:5 (portrait), or 9:16 (stories) aspect ratios. Current: ${aspectRatio}`,
            severity: 'WARNING'
          });
        }

        if (width < 320 || height < 320) {
          issues.push({
            type: 'INSTAGRAM_MIN_SIZE',
            message: 'Instagram images should be at least 320x320 pixels',
            severity: 'ERROR'
          });
        }
        break;

      case Platform.TWITTER:
        if (media.isImage() && (width < 1200 || height < 675)) {
          issues.push({
            type: 'TWITTER_RECOMMENDED_SIZE',
            message: 'For best results on Twitter, use images at least 1200x675 pixels (16:9 aspect ratio)',
            severity: 'WARNING'
          });
        }
        break;

      case Platform.FACEBOOK:
        if (media.isImage() && width < 1200) {
          issues.push({
            type: 'FACEBOOK_MIN_WIDTH',
            message: 'Facebook recommends images with width of at least 1200 pixels',
            severity: 'WARNING'
          });
        }
        break;
    }
  }

  private validateVideoDuration(media: MediaValidationItem, platform: Platform, issues: ValidationIssue[]): void {
    const duration = media.durationSeconds!;

    switch (platform) {
      case Platform.TWITTER:
        if (duration > 140) {
          issues.push({
            type: 'TWITTER_VIDEO_DURATION',
            message: `Twitter videos should be 140 seconds or less. Current: ${duration} seconds`,
            severity: 'ERROR'
          });
        }
        break;

      case Platform.INSTAGRAM:
        if (duration > 60) {
          issues.push({
            type: 'INSTAGRAM_VIDEO_DURATION',
            message: `Instagram feed videos should be 60 seconds or less. Current: ${duration} seconds`,
            severity: 'ERROR'
          });
        }
        break;

      case Platform.FACEBOOK:
        if (duration > 240 * 60) { // 240 minutes
          issues.push({
            type: 'FACEBOOK_VIDEO_DURATION',
            message: `Facebook videos should be 240 minutes or less. Current: ${duration} seconds`,
            severity: 'ERROR'
          });
        }
        break;

      case Platform.LINKEDIN:
        if (duration > 600) { // 10 minutes
          issues.push({
            type: 'LINKEDIN_VIDEO_DURATION',
            message: `LinkedIn videos should be 10 minutes or less. Current: ${duration} seconds`,
            severity: 'ERROR'
          });
        }
        break;
    }
  }
}

// Usage example:
// const validator = new PlatformValidator();
// const media = new MediaValidationItemImpl('image/jpeg', 2.5, 1080, 1080);
// const request: PostMetadataValidationRequest = {
//   content: 'Check out my new post!',
//   media: [media],
//   platforms: [Platform.INSTAGRAM, Platform.FACEBOOK]
// };
// const result = validator.validatePostMetadata(request);