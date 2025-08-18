import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Info,
  X,
  MessageSquare,
  Image,
  Video,
  Clock
} from 'lucide-react';
import { 
  Platform, 
  ValidationIssue, 
  PostMetadataValidationResponse 
} from '@/types/validator/platformvalidator';
import { getPlatformConfig } from '@/utils/platform';
import { cn } from '@/lib/utils';

interface ValidationStackProps {
  validationResult: PostMetadataValidationResponse | null;
  isValidating: boolean;
  className?: string;
}

const severityConfig = {
  ERROR: {
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    badgeVariant: 'destructive' as const,
  },
  WARNING: {
    icon: AlertTriangle,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    badgeVariant: 'secondary' as const,
  },
  INFO: {
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    badgeVariant: 'outline' as const,
  },
};

const issueTypeIcons = {
  TEXT_LENGTH: MessageSquare,
  IMAGE_COUNT: Image,
  VIDEO_COUNT: Video,
  UNSUPPORTED_IMAGE_TYPE: Image,
  UNSUPPORTED_VIDEO_TYPE: Video,
  IMAGE_SIZE_TOO_LARGE: Image,
  VIDEO_SIZE_TOO_LARGE: Video,
  INSTAGRAM_JPEG_ONLY: Image,
  TWITTER_VIDEO_DURATION: Clock,
  INSTAGRAM_VIDEO_DURATION: Clock,
  FACEBOOK_VIDEO_DURATION: Clock,
  LINKEDIN_VIDEO_DURATION: Clock,
  default: AlertCircle,
};

export function ValidationStack({ validationResult, isValidating, className }: ValidationStackProps) {
  if (isValidating) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            <span className="text-sm">Validating post...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validationResult) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="h-4 w-4" />
            <span className="text-sm">Select accounts to see validation results</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allIssues = Array.from(validationResult.platformResults.entries())
    .flatMap(([platform, result]) => 
      result.issues.map(issue => ({ ...issue, platform }))
    );

  const groupedIssues = allIssues.reduce((acc, issue) => {
    if (!acc[issue.severity]) {
      acc[issue.severity] = [];
    }
    acc[issue.severity].push(issue);
    return acc;
  }, {} as Record<string, Array<ValidationIssue & { platform: Platform }>>);

  const errorCount = groupedIssues.ERROR?.length || 0;
  const warningCount = groupedIssues.WARNING?.length || 0;
  const infoCount = groupedIssues.INFO?.length || 0;

  const overallStatus = errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'valid';

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {overallStatus === 'valid' ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : overallStatus === 'warning' ? (
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <span className="font-medium text-sm">
              {overallStatus === 'valid' 
                ? 'Post is valid for all platforms' 
                : 'Validation Issues Found'
              }
            </span>
          </div>
          
          <div className="flex gap-2">
            {errorCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorCount} error{errorCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {infoCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {infoCount} info
              </Badge>
            )}
          </div>
        </div>

        {/* Platform Status Overview */}
        <div className="flex flex-wrap gap-2">
          {Array.from(validationResult.platformResults.entries()).map(([platform, result]) => {
            const platformConfig = getPlatformConfig(platform.toLowerCase());
            const PlatformIcon = platformConfig.icon;
            const hasErrors = result.issues.some(issue => issue.severity === 'ERROR');
            const hasWarnings = result.issues.some(issue => issue.severity === 'WARNING');
            
            return (
              <div
                key={platform}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-xs border",
                  hasErrors 
                    ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300"
                    : hasWarnings
                    ? "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-300"
                    : "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300"
                )}
              >
                <PlatformIcon className="h-3 w-3" />
                <span>{platformConfig.name}</span>
                {hasErrors ? (
                  <X className="h-3 w-3" />
                ) : (
                  <CheckCircle className="h-3 w-3" />
                )}
              </div>
            );
          })}
        </div>

        {/* Issues and Success Messages List */}
        <ScrollArea className="max-h-60">
          <div className="space-y-2">
            {/* Show Issues (errors, warnings, info) */}
            {allIssues.length > 0 && (['ERROR', 'WARNING', 'INFO'] as const).map(severity => {
              const issues = groupedIssues[severity] || [];
              if (issues.length === 0) return null;

              const config = severityConfig[severity];
              const SeverityIcon = config.icon;

              return (
                <div key={severity} className="space-y-2">
                  {issues.map((issue, index) => {
                    const platformConfig = getPlatformConfig(issue.platform.toLowerCase());
                    const PlatformIcon = platformConfig.icon;
                    const IssueTypeIcon = issueTypeIcons[issue.type as keyof typeof issueTypeIcons] || issueTypeIcons.default;

                    return (
                      <div
                        key={`${severity}-${index}`}
                        className={cn(
                          "p-3 rounded-lg border",
                          config.bgColor,
                          config.borderColor
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <SeverityIcon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", config.color)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <PlatformIcon className="h-3 w-3" />
                              <span className="text-xs font-medium text-muted-foreground">
                                {platformConfig.name}
                              </span>
                              <IssueTypeIcon className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <p className="text-xs leading-relaxed">{issue.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Show Success Messages when valid */}
            {overallStatus === 'valid' && validationResult && Array.from(validationResult.platformResults.entries()).map(([platform, result]) => {
              if (result.issues.length > 0) return null; // Skip platforms with issues
              
              const platformConfig = getPlatformConfig(platform.toLowerCase());
              const PlatformIcon = platformConfig.icon;

              return (
                <div
                  key={`success-${platform}`}
                  className="p-3 rounded-lg border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <PlatformIcon className="h-3 w-3" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {platformConfig.name}
                        </span>
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-xs leading-relaxed text-green-700 dark:text-green-300">
                        Content is valid and ready for posting
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Show general success messages when no platforms selected but content is valid */}
            {overallStatus === 'valid' && validationResult && validationResult.platformResults.size === 0 && (
              <>
                <div className="p-3 rounded-lg border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-3 w-3" />
                        <span className="text-xs font-medium text-muted-foreground">Text Content</span>
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-xs leading-relaxed text-green-700 dark:text-green-300">
                        Text content is ready - select accounts to validate platform-specific requirements
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Show success messages for valid media when no issues */}
            {(overallStatus === 'valid' || (allIssues.length === 0 && validationResult)) && validationResult && (
              <>
                {/* Success message for media when present and valid */}
                {validationResult.mediaMetadata && validationResult.mediaMetadata.length > 0 && 
                 !allIssues.some(issue => issue.type.includes('IMAGE') || issue.type.includes('VIDEO') || issue.type.includes('MEDIA')) && (
                  <div className="p-3 rounded-lg border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {validationResult.mediaMetadata.some(m => m.type === 'video') ? (
                            <Video className="h-3 w-3" />
                          ) : (
                            <Image className="h-3 w-3" />
                          )}
                          <span className="text-xs font-medium text-muted-foreground">
                            Media ({validationResult.mediaMetadata.length} {validationResult.mediaMetadata.length === 1 ? 'file' : 'files'})
                          </span>
                          <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-xs leading-relaxed text-green-700 dark:text-green-300">
                          All media files are compatible and within size limits
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* General Warnings */}
        {validationResult.generalWarnings.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">General Recommendations</h4>
            <div className="space-y-1">
              {validationResult.generalWarnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Info className="h-3 w-3 mt-0.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-muted-foreground">{warning}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}