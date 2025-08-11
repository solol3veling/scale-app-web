import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import EmojiPicker from 'emoji-picker-react'
import HighlightWithinTextarea from 'react-highlight-within-textarea'
import { 
  Image as ImageIcon, 
  Video, 
  Calendar as CalendarIcon, 
  X,
  Smile,
  Link,
  Hash,
  Send,
  Clock,
  Settings,
  Expand,
  AtSign,
  Loader2,
  Eye,
  EyeOff,
  Share2,
  CheckCircle,
  Users
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { MediaItem, CreatePostData } from "@/types/api"
import { useMediaUpload } from "@/hooks/useMediaUpload"
import { useAuth } from "@/hooks/useAuth"
import { MediaUpload } from "@/components/MediaUpload"
import { useCreatePost } from "@/hooks/api/usePosts"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useSocialAccounts } from "@/hooks/api/useSocialAccounts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getVideoThumbnailUrl } from "@/utils/mediaUtils"

interface PostComposerProps {
  postContent: string
  setPostContent: (content: string) => void
  uploadedMedia: MediaItem[]
  setUploadedMedia: (media: MediaItem[]) => void
  isScheduled: boolean
  setIsScheduled: (scheduled: boolean) => void
  scheduledDate?: Date
  setScheduledDate: (date: Date | undefined) => void
  scheduledTime: string
  setScheduledTime: (time: string) => void
  onUploadStateChange?: (isUploading: boolean) => void
  selectedAccountIds?: string[]
  onPublish?: (data: CreatePostData) => void
}

export function PostComposer({
  postContent,
  setPostContent,
  uploadedMedia,
  setUploadedMedia,
  isScheduled,
  setIsScheduled,
  scheduledDate,
  setScheduledDate,
  scheduledTime,
  setScheduledTime,
  onUploadStateChange,
  selectedAccountIds = [],
  onPublish,
}: PostComposerProps) {
  const { user } = useAuth();
  const { 
    mediaItems, 
    uploadFiles, 
    removeMediaItem, 
    getUploadedMedia, 
    isAnyUploading 
  } = useMediaUpload(user?.id);

  const [openModal, setOpenModal] = useState<string | null>(null);
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const createPost = useCreatePost()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Handle textarea change with HighlightWithinTextarea
  const handleTextareaChange = (value: string) => {
    setPostContent(value);
  };

  // Insert text at cursor position
  const insertTextAtCursor = (textToInsert: string) => {
    if (!textareaRef) return;
    
    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const newText = postContent.slice(0, start) + textToInsert + postContent.slice(end);
    
    setPostContent(newText);
    
    // Focus and set cursor position
    setTimeout(() => {
      const newPosition = start + textToInsert.length;
      textareaRef.setSelectionRange(newPosition, newPosition);
      textareaRef.focus();
    }, 0);
  };

  // Emoji handler with new plugin
  const handleEmojiClick = (emojiData: { emoji: string }) => {
    insertTextAtCursor(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Highlight patterns for the library
  const highlightPatterns = [
    {
      highlight: /(https?:\/\/(?:[-\w.])+(?:[:\d]+)?(?:\/(?:[\w._~:/?#[\]@!$&'()*+,;=%])*)?)/gi,
      className: 'url-highlight'
    },
    {
      highlight: /#[\w]+/g,
      className: 'hashtag-highlight'
    },
    {
      highlight: /@[\w]+/g,
      className: 'mention-highlight'
    }
  ];

  


  // Update parent component when media changes
  useEffect(() => {
    const uploadedMediaItems = getUploadedMedia();
    setUploadedMedia(uploadedMediaItems);
  }, [mediaItems, getUploadedMedia, setUploadedMedia]);

  // Update parent component when upload state changes
  useEffect(() => {
    onUploadStateChange?.(isAnyUploading);
  }, [isAnyUploading, onUploadStateChange]);

  

  

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (showEmojiPicker && !target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Auto-adjust textarea height based on content
  useEffect(() => {
    if (textareaRef) {
      textareaRef.style.height = 'auto';
      textareaRef.style.height = `${textareaRef.scrollHeight}px`;
    }
  }, [postContent, textareaRef]);

  const handleFileUpload = (files: File[]) => {
    uploadFiles(files);
  };

  const handleRemoveMedia = (id: string) => {
    removeMediaItem(id);
  };

  const buildScheduledDateTime = (): string | undefined => {
    if (!isScheduled || !scheduledDate || !scheduledTime) return undefined
    
    const [hours, minutes] = scheduledTime.split(':')
    const dateTime = new Date(scheduledDate)
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    
    return dateTime.toISOString()
  }

  const handlePublish = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your post.",
        variant: "destructive",
      })
      return
    }

    if (isAnyUploading) {
      toast({
        title: "Media uploading",
        description: "Please wait for media uploads to complete before publishing.",
        variant: "destructive",
      })
      return
    }

    const scheduledFor = buildScheduledDateTime()
    if (isScheduled && !scheduledFor) {
      toast({
        title: "Schedule date required",
        description: "Please select a date and time for scheduling.",
        variant: "destructive",
      })
      return
    }

    const postData: CreatePostData = {
      content: postContent,
      media: uploadedMedia,
      scheduledFor,
      accountIds: selectedAccountIds,
    }

    try {
      await createPost.mutateAsync(postData)
      
      if (isScheduled && scheduledFor) {
        toast({
          title: "Post scheduled!",
          description: selectedAccountIds.length > 0 
            ? `Your post has been scheduled for ${format(new Date(scheduledFor), 'PPP p')} on ${selectedAccountIds.length} account${selectedAccountIds.length > 1 ? 's' : ''}.`
            : `Your post draft has been scheduled for ${format(new Date(scheduledFor), 'PPP p')}. Select accounts to publish it.`,
        })
      } else {
        toast({
          title: selectedAccountIds.length > 0 ? "Post published!" : "Draft saved!",
          description: selectedAccountIds.length > 0 
            ? `Your post has been published to ${selectedAccountIds.length} account${selectedAccountIds.length > 1 ? 's' : ''}.`
            : "Your post has been saved as a draft. You can publish it later by selecting accounts.",
        })
      }
      
      navigate('/posts')
    } catch (error) {
      console.error('Failed to publish post:', error)
    }
  };


  const SchedulingModal = () => (
    <Dialog open={openModal === 'schedule'} onOpenChange={(open) => !open && setOpenModal(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="schedule"
              checked={isScheduled}
              onCheckedChange={setIsScheduled}
            />
            <Label htmlFor="schedule">Schedule for later</Label>
          </div>

          {isScheduled && (
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );


  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Main Post Content Card - floating when expanded */}
      <Card className={cn(
        "shadow-medium border bg-muted/30 backdrop-blur-sm transition-all duration-300 relative group",
        isExpanded && "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-5xl bg-white dark:bg-gray-900"
      )}>
        {/* Floating Expand Button - only show on hover when not expanded */}
        {!isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md z-10"
            title="Expand composer"
          >
            <Expand className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Collapse Button - only show when expanded */}
        {isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md z-10"
            title="Collapse composer"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
        <CardContent className={cn(
          isExpanded ? "pt-8 px-8 pb-8" : "pt-6 px-6 pb-6"
        )}>
          {/* Main Content Area */}
          <div className="space-y-0">
            {/* Text Input with Library Highlighting */}
            <div className="relative pb-4">
              <textarea
                ref={setTextareaRef}
                value={postContent}
                onChange={(e) => handleTextareaChange(e.target.value)}
                placeholder="What's on your mind?"
                className={cn(
                  "w-full resize-none border-0 bg-transparent placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 focus:outline-none",
                  isExpanded ? "min-h-[200px] max-h-[70vh] text-lg leading-relaxed" : "min-h-[120px] max-h-[300px] text-base leading-[1.5]"
                )}
                style={{
                  fontFamily: 'inherit',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word'
                }}
              />
              
              {/* Character Count */}
              <div className="absolute bottom-6 right-2 text-xs text-muted-foreground/60 z-10">
                {postContent.length}/2000
              </div>
            </div>

            {/* Media Preview - Show only when media exists */}
            {mediaItems.length > 0 && (
              <div className="pb-4">
                <div className={cn(
                  "flex flex-wrap gap-3"
                )}>
                  {mediaItems.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className={cn(
                        "relative overflow-hidden rounded-md border border-border bg-muted cursor-pointer",
                        "w-16 h-16"
                      )}>
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
                            alt={`Upload ${item.id}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          // For videos: show derived thumbnail if upload completed, else generic video icon  
                          item.uploadState.progress === 100 && !item.uploadState.error ? (
                            <div className="relative w-full h-full">
                              <img
                                src={getVideoThumbnailUrl(item.url)}
                                alt={`Video thumbnail ${item.id}`}
                                className="w-full h-full object-cover"
                              />
                              {/* Video icon indicator */}
                              <div className={cn(
                                "absolute bg-black/70 rounded",
                                isExpanded ? "top-2 left-2 p-1" : "top-1 left-1 p-0.5"
                              )}>
                                <Video className={cn(
                                  "text-white",
                                  "h-2.5 w-2.5"
                                )} />
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Video className={cn(
                                "text-muted-foreground",
                                isExpanded ? "h-6 w-6" : "h-4 w-4"
                              )} />
                            </div>
                          )
                        )}
                        
                        {/* Upload Progress Overlay */}
                        {item.uploadState.isUploading && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 className={cn(
                              "animate-spin text-white",
                              isExpanded ? "h-6 w-6" : "h-3 w-3"
                            )} />
                          </div>
                        )}
                      </div>
                      
                      {/* Remove Button - Outside the media container */}
                      <Button
                        variant="secondary"
                        size="icon"
                        className={cn(
                          "absolute rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white border-2 border-white shadow-lg z-20",
                          isExpanded ? "-top-2 -right-2 h-6 w-6" : "-top-1 -right-1 h-5 w-5"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMedia(item.id);
                        }}
                      >
                        <X className={cn("h-3 w-3")} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Action Bar - Seamless with content */}
            <div className="flex items-center justify-between">
              {/* Left Side - Post Options */}
              <div className="flex items-center space-x-1 relative">
                {/* Media Upload Button - Integrated with other options */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 relative"
                  disabled={isAnyUploading}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) {
                        handleFileUpload(Array.from(files));
                      }
                      e.target.value = '';
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isAnyUploading}
                  />
                  {isAnyUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                </Button>
                
                {/* Emoji Button with Full Picker */}
                <div className="relative emoji-picker-container">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      showEmojiPicker && "bg-muted/50 text-foreground"
                    )}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  
                  {/* Full Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full mb-2 left-0 z-50">
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width={350}
                        height={400}
                        searchDisabled={false}
                        skinTonesDisabled={false}
                        previewConfig={{
                          showPreview: false
                        }}
                      />
                    </div>
                  )}
                </div>
                
                

                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    isScheduled && "text-blue-500 bg-blue-50 hover:bg-blue-100"
                  )}
                  onClick={() => setOpenModal('schedule')}
                  title="Schedule post"
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </div>

              {/* Right Side - Create Post */}
              <div className="flex items-center space-x-2">
                {isScheduled && scheduledDate && (
                  <span className="text-xs text-muted-foreground">
                    {format(scheduledDate, "MMM d")} at {scheduledTime}
                  </span>
                )}
                <Button
                  size="sm"
                  className="gradient-primary hover-scale h-8 px-4"
                  disabled={!postContent.trim() || isAnyUploading || createPost.isPending}
                  onClick={handlePublish}
                >
                  {createPost.isPending ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : isAnyUploading ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : isScheduled ? (
                    <Clock className="h-3 w-3 mr-1" />
                  ) : (
                    <Send className="h-3 w-3 mr-1" />
                  )}
                  {isAnyUploading ? "Uploading..." : isScheduled ? "Schedule" : selectedAccountIds.length > 0 ? "Post" : "Save Draft"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <SchedulingModal />
    </>
  )
}