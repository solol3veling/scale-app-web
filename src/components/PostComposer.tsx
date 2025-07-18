import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Image as ImageIcon, 
  Video, 
  Calendar as CalendarIcon, 
  X,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { MediaItem } from "@/types/api"
import { useMediaUpload } from "@/hooks/useMediaUpload"
import { MediaUpload } from "@/components/MediaUpload"

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
}: PostComposerProps) {
  const { 
    mediaItems, 
    uploadFiles, 
    removeMediaItem, 
    getUploadedMedia, 
    isAnyUploading 
  } = useMediaUpload();

  // Update parent component when media changes
  useEffect(() => {
    const uploadedMediaItems = getUploadedMedia();
    setUploadedMedia(uploadedMediaItems);
  }, [mediaItems, getUploadedMedia, setUploadedMedia]);

  // Update parent component when upload state changes
  useEffect(() => {
    onUploadStateChange?.(isAnyUploading);
  }, [isAnyUploading, onUploadStateChange]);

  const handleFileUpload = (files: File[]) => {
    uploadFiles(files);
  };

  const handleRemoveMedia = (id: string) => {
    removeMediaItem(id);
  };

  return (
    <div className="space-y-6">
      {/* Post Content */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Post Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                {postContent.length}/2000 characters
              </p>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-3">
            <Label>Media</Label>
            <MediaUpload
              mediaItems={mediaItems}
              onFileUpload={handleFileUpload}
              onRemoveItem={handleRemoveMedia}
              isUploading={isAnyUploading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Publishing Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="schedule"
              checked={isScheduled}
              onCheckedChange={setIsScheduled}
            />
            <Label htmlFor="schedule">Schedule for later</Label>
          </div>

          {isScheduled && (
            <div className="grid gap-4 md:grid-cols-2">
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
        </CardContent>
      </Card>
    </div>
  )
}