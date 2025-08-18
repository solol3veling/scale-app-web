import { useState, useEffect, useMemo } from 'react';
import { 
  PlatformValidator, 
  PostMetadataValidationRequest, 
  PostMetadataValidationResponse,
  Platform,
  MediaValidationItemImpl 
} from '@/types/validator/platformvalidator';
import { SocialAccount } from '@/types/api';
import { MediaItem } from '@/types/api';

export interface PostValidationContext {
  content: string;
  media: MediaItem[];
  selectedAccounts: SocialAccount[];
}

export interface ValidationState {
  isValidating: boolean;
  result: PostMetadataValidationResponse | null;
  hasErrors: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;
  platformStatuses: Map<Platform, 'valid' | 'warning' | 'error'>;
}

export function usePostValidation(context: PostValidationContext) {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    result: null,
    hasErrors: false,
    hasWarnings: false,
    errorCount: 0,
    warningCount: 0,
    platformStatuses: new Map(),
  });

  const validator = useMemo(() => new PlatformValidator(), []);

  // Convert MediaItem to MediaValidationItem
  const convertMediaItems = (mediaItems: MediaItem[]) => {
    return mediaItems.map(item => {
      // Extract file extension from URL for type detection
      const getTypeFromUrl = (url: string) => {
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
            return item.type;
        }
      };

      // Estimate file size from URL (this would ideally come from the file upload)
      // For now, we'll use a placeholder or try to get it from the file object
      const estimateSize = (url: string, type: string) => {
        // This is a rough estimation - in real app, you'd get this from file upload
        if (type.startsWith('image/')) {
          return 2.5; // MB estimate for images
        } else if (type.startsWith('video/')) {
          return 15; // MB estimate for videos
        }
        return 1;
      };

      const mediaType = getTypeFromUrl(item.url);
      
      return new MediaValidationItemImpl(
        mediaType,
        estimateSize(item.url, mediaType),
        undefined, // width - would come from image metadata
        undefined, // height - would come from image metadata
        undefined  // duration - would come from video metadata
      );
    });
  };

  // Convert platform strings to Platform enum
  const convertToPlatforms = (accounts: SocialAccount[]): Platform[] => {
    return accounts.map(account => {
      const platformStr = account.platform.toUpperCase();
      return Platform[platformStr as keyof typeof Platform] || Platform.FACEBOOK;
    });
  };

  // Calculate validation state from result
  const calculateValidationState = (result: PostMetadataValidationResponse): Omit<ValidationState, 'isValidating' | 'result'> => {
    let errorCount = 0;
    let warningCount = 0;
    const platformStatuses = new Map<Platform, 'valid' | 'warning' | 'error'>();

    // Count issues and determine platform statuses
    result.platformResults.forEach((platformResult, platform) => {
      const errors = platformResult.issues.filter(issue => issue.severity === 'ERROR');
      const warnings = platformResult.issues.filter(issue => issue.severity === 'WARNING');
      
      errorCount += errors.length;
      warningCount += warnings.length;

      if (errors.length > 0) {
        platformStatuses.set(platform, 'error');
      } else if (warnings.length > 0) {
        platformStatuses.set(platform, 'warning');
      } else {
        platformStatuses.set(platform, 'valid');
      }
    });

    return {
      hasErrors: errorCount > 0,
      hasWarnings: warningCount > 0,
      errorCount,
      warningCount,
      platformStatuses,
    };
  };

  // Debounced validation effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (context.selectedAccounts.length === 0) {
        setValidationState(prev => ({
          ...prev,
          isValidating: false,
          result: null,
          hasErrors: false,
          hasWarnings: false,
          errorCount: 0,
          warningCount: 0,
          platformStatuses: new Map(),
        }));
        return;
      }

      setValidationState(prev => ({ ...prev, isValidating: true }));

      try {
        const platforms = convertToPlatforms(context.selectedAccounts);
        const mediaItems = convertMediaItems(context.media);
        
        const request: PostMetadataValidationRequest = {
          content: context.content || undefined,
          media: mediaItems.length > 0 ? mediaItems : undefined,
          platforms: platforms,
        };

        const result = validator.validatePostMetadata(request);
        const calculatedState = calculateValidationState(result);

        setValidationState({
          isValidating: false,
          result,
          ...calculatedState,
        });
      } catch (error) {
        console.error('Validation error:', error);
        setValidationState(prev => ({
          ...prev,
          isValidating: false,
          hasErrors: true,
          errorCount: 1,
        }));
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [context.content, context.media, context.selectedAccounts, validator]);

  // Helper functions for the component
  const getIssuesForPlatform = (platform: Platform) => {
    return validationState.result?.platformResults.get(platform)?.issues || [];
  };

  const getIssuesByType = (type: string) => {
    if (!validationState.result) return [];
    
    const allIssues = Array.from(validationState.result.platformResults.values())
      .flatMap(result => result.issues);
    
    return allIssues.filter(issue => issue.type === type);
  };

  const getTextValidationStatus = (): 'valid' | 'warning' | 'error' => {
    if (!validationState.result) return 'valid';
    
    const textIssues = getIssuesByType('TEXT_LENGTH').concat(
      getIssuesByType('TWITTER_BEST_PRACTICE')
    );
    
    if (textIssues.some(issue => issue.severity === 'ERROR')) return 'error';
    if (textIssues.some(issue => issue.severity === 'WARNING')) return 'warning';
    return 'valid';
  };

  const getMediaValidationStatus = (): 'valid' | 'warning' | 'error' => {
    if (!validationState.result) return 'valid';
    
    const mediaIssueTypes = [
      'IMAGE_COUNT', 'VIDEO_COUNT', 'UNSUPPORTED_IMAGE_TYPE', 
      'UNSUPPORTED_VIDEO_TYPE', 'IMAGE_SIZE_TOO_LARGE', 
      'VIDEO_SIZE_TOO_LARGE', 'INSTAGRAM_JPEG_ONLY'
    ];
    
    const mediaIssues = mediaIssueTypes.flatMap(type => getIssuesByType(type));
    
    if (mediaIssues.some(issue => issue.severity === 'ERROR')) return 'error';
    if (mediaIssues.some(issue => issue.severity === 'WARNING')) return 'warning';
    return 'valid';
  };

  return {
    ...validationState,
    getIssuesForPlatform,
    getIssuesByType,
    getTextValidationStatus,
    getMediaValidationStatus,
  };
}