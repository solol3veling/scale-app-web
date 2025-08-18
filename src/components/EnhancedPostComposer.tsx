// Enhanced PostComposer with Real-time Validation System
// This shows how to integrate the new validation system with your existing PostComposer

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MediaItem, CreatePostData, SocialAccount } from "@/types/api";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useSocialAccounts } from "@/hooks/api/useSocialAccounts";
import { usePostValidation } from "@/hooks/usePostValidation";
import { EnhancedPostValidator } from "@/utils/enhancedPostValidator";
import { ValidationStack } from "@/components/validation/ValidationStack";
import { 
  TextValidationWrapper, 
  MediaValidationWrapper,
  ValidationOverlay 
} from "@/components/validation/ValidationOverlay";
import { cn } from "@/lib/utils";

interface EnhancedPostComposerProps {
  className?: string;
  onPostCreated?: () => void;
}

export function EnhancedPostComposer({ className, onPostCreated }: EnhancedPostComposerProps) {
  // Existing state
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get social accounts
  const { data: allAccounts = [] } = useSocialAccounts();
  const selectedAccounts = allAccounts.filter(account => 
    selectedAccountIds.includes(account.id)
  );

  // Real-time validation
  const validation = usePostValidation({
    content,
    media,
    selectedAccounts,
  });

  // Get validation status for visual overlays
  const textStatus = validation.getTextValidationStatus();
  const mediaStatus = validation.getMediaValidationStatus();

  // Character limit for selected platforms
  const platforms = EnhancedPostValidator.convertToPlatforms(selectedAccounts);
  const characterLimit = platforms.length > 0 
    ? EnhancedPostValidator.getStrictestCharacterLimit(platforms)
    : 280; // Default to Twitter limit

  // Real-time suggestions
  const suggestions = EnhancedPostValidator.getTypingSuggestions(content, platforms);

  const handleSubmit = async () => {
    if (!validation.result?.overallValid) {
      return; // Block submission if validation fails
    }

    setIsSubmitting(true);
    try {
      // Your existing post creation logic here
      console.log("Creating post...", { content, media, selectedAccountIds });
      onPostCreated?.();
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Composer Card */}
      <Card>
        <CardHeader>
          <CardTitle>Create Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Account Selection */}
          <div className="space-y-3">
            <Label>Select Accounts</Label>
            <ValidationOverlay 
              status={selectedAccounts.length === 0 ? 'error' : 'valid'}
              showOverlay={selectedAccounts.length === 0}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allAccounts.map((account) => {
                  const isSelected = selectedAccountIds.includes(account.id);
                  const platformStatus = validation.platformStatuses.get(
                    EnhancedPostValidator.convertToPlatforms([account])[0]
                  );
                  
                  return (
                    <div
                      key={account.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all",
                        isSelected
                          ? platformStatus === 'error'
                            ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
                            : platformStatus === 'warning'
                            ? "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800"
                            : "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                          : "bg-background border-input hover:bg-accent"
                      )}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedAccountIds(prev => prev.filter(id => id !== account.id));
                        } else {
                          setSelectedAccountIds(prev => [...prev, account.id]);
                        }
                      }}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border-2 flex items-center justify-center",
                        isSelected 
                          ? "bg-primary border-primary"
                          : "border-input"
                      )}>
                        {isSelected && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-1">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-semibold">
                            {account.platform.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {account.displayName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {account.handle}
                          </p>
                        </div>
                      </div>

                      {/* Platform status indicator */}
                      {isSelected && platformStatus && (
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          platformStatus === 'error' ? 'bg-red-500' :
                          platformStatus === 'warning' ? 'bg-orange-500' :
                          'bg-green-500'
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>
            </ValidationOverlay>
          </div>

          {/* Content Text Area */}
          <div className="space-y-3">
            <Label>Post Content</Label>
            <TextValidationWrapper
              status={textStatus}
              characterCount={content.length}
              maxCharacters={characterLimit}
            >
              <Textarea
                placeholder={selectedAccounts.length === 0 
                  ? "Select accounts to start writing..." 
                  : "What's on your mind?"
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={selectedAccounts.length === 0}
              />
            </TextValidationWrapper>

            {/* Real-time suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Media Upload Section */}
          <div className="space-y-3">
            <Label>Media</Label>
            <MediaValidationWrapper
              status={mediaStatus}
              issueCount={validation.result ? 
                Array.from(validation.result.platformResults.values())
                  .flatMap(result => result.issues)
                  .filter(issue => 
                    issue.type.includes('IMAGE') || 
                    issue.type.includes('VIDEO') || 
                    issue.type.includes('MEDIA')
                  ).length : 0
              }
            >
              <div className="border-2 border-dashed border-input rounded-lg p-6">
                {media.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Add images or videos to your post</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Upload Media
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {media.map((item, index) => (
                      <div key={index} className="relative group">
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-20 bg-muted rounded-lg flex items-center justify-center">
                            <Video className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setMedia(prev => prev.filter((_, i) => i !== index));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </MediaValidationWrapper>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {validation.isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    validation.hasErrors ? 'bg-red-500' :
                    validation.hasWarnings ? 'bg-orange-500' :
                    'bg-green-500'
                  )} />
                  <span>
                    {validation.hasErrors ? `${validation.errorCount} errors` :
                     validation.hasWarnings ? `${validation.warningCount} warnings` :
                     'Ready to post'}
                  </span>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Save Draft
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={
                  isSubmitting || 
                  validation.isValidating || 
                  validation.hasErrors || 
                  selectedAccounts.length === 0 ||
                  content.trim().length === 0
                }
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Publish Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Stack - Always visible at bottom */}
      <ValidationStack 
        validationResult={validation.result}
        isValidating={validation.isValidating}
      />
    </div>
  );
}