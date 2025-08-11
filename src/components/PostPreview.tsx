
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Video,
} from "lucide-react"
import { format } from "date-fns"
import { MediaItem, Platform } from "@/types/api"
import { getVideoThumbnailUrl, isVideoType } from "@/utils/mediaUtils"

const platformColors = {
  [Platform.INSTAGRAM]: "bg-gradient-to-r from-purple-500 to-pink-500",
  [Platform.FACEBOOK]: "bg-blue-600",
  [Platform.TWITTER]: "bg-sky-500",
  [Platform.LINKEDIN]: "bg-blue-700",
}

const MAX_POST_LENGTH = 150; // Max characters for the preview

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};

interface PostPreviewProps {
  postContent: string
  uploadedMedia: MediaItem[]
  selectedAccounts: Array<{
    id: string
    platform: Platform
    displayName: string
    handle: string
    connected: boolean
  }>
  isScheduled: boolean
  scheduledDate?: Date
}

export function PostPreview({
  postContent,
  uploadedMedia,
  selectedAccounts,
  isScheduled,
  scheduledDate,
}: PostPreviewProps) {
  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Preview
        </CardTitle>
        <CardDescription>See how your post will look</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
          {/* Generic Post Preview */}
          <div className="flex items-center gap-3 p-3 border-b">
            <div className={`w-8 h-8 rounded-full ${
              selectedAccounts.length > 0 
                ? platformColors[selectedAccounts[0].platform] || 'bg-gray-400'
                : 'bg-gray-400'
            } flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">
                {selectedAccounts.length > 0 ? selectedAccounts[0].displayName.substring(0, 2).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {selectedAccounts.length > 0 ? selectedAccounts[0].displayName : 'Your Account'}
              </p>
              <p className="text-xs text-gray-500">
                {isScheduled && scheduledDate ? format(scheduledDate, 'PPP') : 'Just now'}
              </p>
            </div>
          </div>
          
          {/* Post Content */}
          <div className="p-3 space-y-2">
            <p className="text-sm font-normal text-muted-foreground">
              {truncateText(postContent || "Your post content will appear here...", MAX_POST_LENGTH)}
            </p>
            
            {/* Media Preview */}
            {uploadedMedia.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {uploadedMedia.slice(0, 4).map((media, index) => (
                  <div key={index} className="relative">
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-12 object-cover rounded"
                      />
                    ) : (
                      // For videos: derive thumbnail URL from video URL
                      <div className="relative w-full h-24 rounded overflow-hidden">
                        <img
                          src={getVideoThumbnailUrl(media.url)}
                          alt={`Video thumbnail ${index + 1}`}
                          className="w-full h-12 object-cover"
                        />
                        {/* Video icon indicator in top-left */}
                        <div className="absolute top-1 left-1 bg-black/70 rounded p-1">
                          <Video className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                    {uploadedMedia.length > 4 && index === 3 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                        <span className="text-white font-bold">+{uploadedMedia.length - 4}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Engagement Preview */}
            <div className="flex items-center gap-4 pt-2 text-gray-500">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span className="text-sm">0</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">0</span>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                <span className="text-sm">0</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}