import { useState, useEffect } from "react"
import ReactPlayer from 'react-player';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Eye,
  Image as ImageIcon,
  Video,
  Users,
  X
} from "lucide-react"
import { usePostDetailsData, useRetryEvent, useExtendPost } from "@/hooks/api/usePostDetails"
import { useSocialAccounts } from "@/hooks/api/useSocialAccounts"
import { PublishingEventStatus, Platform, MediaItem } from "@/types/api"
import { format } from "date-fns"
import { getVideoThumbnailUrl, isVideoType } from "@/utils/mediaUtils"
import { useToast } from "@/hooks/use-toast"

interface PostDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
}

export function PostDetailsModal({ isOpen, onClose, postId }: PostDetailsModalProps) {
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([])
  const [showExtendForm, setShowExtendForm] = useState(false)
  const [selectedMediaForView, setSelectedMediaForView] = useState<MediaItem | null>(null)

  // No need for manual overflow management with Dialog component

  const { post, events, isLoading, refetch } = usePostDetailsData(postId)
  const { data: socialAccounts } = useSocialAccounts()
  const retryEvent = useRetryEvent()
  const extendPost = useExtendPost()
  const { toast } = useToast()

  const postData = post.data
  const eventsData = events.data || []

  // Parse error message to extract user-friendly details
  const parseErrorMessage = (errorMessage: string): { title: string; description: string } => {
    try {
      // Try to extract JSON error details from the message
      const jsonMatch = errorMessage.match(/\{.*\}/)
      if (jsonMatch) {
        const errorObj = JSON.parse(jsonMatch[0])
        if (errorObj.detail) {
          return {
            title: "Publishing Failed",
            description: errorObj.detail
          }
        }
      }

      // Handle status code patterns
      if (errorMessage.includes('403')) {
        return {
          title: "Access Forbidden",
          description: "You don't have permission to publish to this platform. Please check your account connection."
        }
      }
      if (errorMessage.includes('401')) {
        return {
          title: "Authentication Failed", 
          description: "Your account authorization has expired. Please reconnect your account."
        }
      }
      if (errorMessage.includes('429')) {
        return {
          title: "Rate Limited",
          description: "Too many requests. Please wait before trying again."
        }
      }

      // Default fallback
      return {
        title: "Publishing Failed",
        description: errorMessage.length > 100 ? `${errorMessage.substring(0, 100)}...` : errorMessage
      }
    } catch {
      return {
        title: "Publishing Failed",
        description: errorMessage.length > 100 ? `${errorMessage.substring(0, 100)}...` : errorMessage
      }
    }
  }

  // Show error details in toast
  const showErrorDetails = (errorMessage: string) => {
    const { title, description } = parseErrorMessage(errorMessage)
    toast({
      title,
      description,
      variant: "destructive",
      duration: 8000, // Show longer for error messages
    })
  }

  // Get status badge for publishing events
  const getEventStatusBadge = (status: PublishingEventStatus, errorMessage?: string) => {
    switch (status) {
      case PublishingEventStatus.COMPLETED:
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Published
          </Badge>
        )
      case PublishingEventStatus.PENDING:
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Pending
          </Badge>
        )
      case PublishingEventStatus.IN_PROGRESS:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Publishing
          </Badge>
        )
      case PublishingEventStatus.FAILED:
        return (
          <Badge 
            variant="destructive" 
            className="flex items-center gap-1 cursor-pointer hover:bg-red-600 transition-colors"
            onClick={() => errorMessage && showErrorDetails(errorMessage)}
            title={errorMessage ? "Click to see error details" : undefined}
          >
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get platform info for display
  const getPlatformInfo = (platform: Platform) => {
    switch (platform) {
      case Platform.INSTAGRAM:
        return { name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500' }
      case Platform.FACEBOOK:
        return { name: 'Facebook', color: 'bg-blue-600' }
      case Platform.TWITTER:
        return { name: 'Twitter', color: 'bg-sky-500' }
      case Platform.LINKEDIN:
        return { name: 'LinkedIn', color: 'bg-blue-700' }
      default:
        return { name: platform, color: 'bg-gray-500' }
    }
  }

  const handleMediaClick = (media: MediaItem) => {
    setSelectedMediaForView(media);
  };

  const handleCloseMediaView = () => {
    setSelectedMediaForView(null);
  };

  // Handle retry event
  const handleRetryEvent = (eventId: string) => {
    retryEvent.mutate(eventId)
  }

  // Handle extend post
  const handleExtendPost = () => {
    if (selectedAccountIds.length === 0) return
    
    extendPost.mutate({
      postId,
      data: {
        postId,
        socialAccountIds: selectedAccountIds
      }
    })
    setShowExtendForm(false)
    setSelectedAccountIds([])
  }

  // Get available accounts for extending (not already used)
  const usedAccountIds = postData?.accounts.map(acc => acc.id) || []
  const availableAccounts = socialAccounts?.filter(
    acc => !usedAccountIds.includes(acc.id) && acc.isConnected
  ) || []

  if (!postData && !isLoading) {
    return null
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] lg:max-w-[1200px] h-[95vh] p-0 flex flex-col overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading post details...</span>
          </div>
        ) : !postData ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Post not found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Left Column: Post Content, Media, Engagement */}
            <div className="lg:col-span-2 flex flex-col border-r dark:border-gray-800">
              <DialogHeader className="p-4 border-b dark:border-gray-800">
                <DialogTitle className="text-lg font-semibold">Post Details</DialogTitle>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogDescription className="text-sm">
                      {postData.scheduledFor ? (
                        <>Scheduled for {format(new Date(postData.scheduledFor), 'MMM dd, yyyy at h:mm a')}</>
                      ) : postData.publishedAt ? (
                        <>Published on {format(new Date(postData.publishedAt), 'MMM dd, yyyy at h:mm a')}</>
                      ) : (
                        <>Created on {format(new Date(postData.createdAt), 'MMM dd, yyyy at h:mm a')}</>
                      )}
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{postData.status}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={refetch}
                      disabled={isLoading}
                      className="hover:scale-105 transition-transform"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Post Content Section */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">Post Content</h3>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{postData.content}</div>
                </div>

                {/* Media Section */}
                {postData.media && postData.media.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-muted-foreground">Media</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                      {postData.media.map((mediaItem, index) => (
                        <div
                          key={index}
                          className="relative w-full aspect-square rounded-md overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                          onClick={() => handleMediaClick(mediaItem)}
                        >
                          {mediaItem.type === 'image' ? (
                            <img
                              src={mediaItem.url}
                              alt={`Media ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            // For videos: derive thumbnail URL from video URL
                            <div className="relative w-full h-full">
                              <img
                                src={getVideoThumbnailUrl(mediaItem.url)}
                                alt={`Video thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {/* Video icon indicator in top-left */}
                              <div className="absolute top-1 left-1 bg-black/70 rounded p-1">
                                <Video className="h-3 w-3 text-white" />
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-25 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Right Column: Publishing Events, Extend Post */}
            <div className="lg:col-span-1 flex flex-col bg-gray-50 dark:bg-gray-900">
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                {/* Publishing Events Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Publishing Events</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExtendForm(!showExtendForm)}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Extend
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {eventsData.map((event) => {
                      const platformInfo = getPlatformInfo(event.platform)
                      return (
                        <div key={event.id} className="p-4 bg-background rounded-lg border">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className={`${platformInfo.color} text-white text-sm`}>
                                {platformInfo.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{event.socialAccount.displayName}</div>
                              <div className="text-xs text-muted-foreground truncate">@{event.socialAccount.handle}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            {getEventStatusBadge(event.status, event.errorMessage)}
                            {event.status === PublishingEventStatus.FAILED && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRetryEvent(event.id)}
                                disabled={retryEvent.isPending}
                                className="h-8 w-8"
                              >
                                {retryEvent.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <RotateCcw className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {eventsData.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No publishing events</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Extend Post Form */}
                {showExtendForm && (
                  <div>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Extend to Additional Accounts</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                        {availableAccounts.map((account) => {
                          const isSelected = selectedAccountIds.includes(account.id)

                          return (
                            <div
                              key={account.id}
                              className={`relative flex flex-col items-center p-2 rounded-lg transition-all duration-200 hover:bg-accent/50`}
                            >
                              <div className="relative">
                                <Avatar
                                  className={`h-14 w-14 border-4 cursor-pointer transition-all duration-200 active:scale-95 active:shadow-inner
                                    ${isSelected ? "border-primary" : "border-transparent hover:border-muted"}
                                  `}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedAccountIds(selectedAccountIds.filter(id => id !== account.id))
                                    } else {
                                      setSelectedAccountIds([...selectedAccountIds, account.id])
                                    }
                                  }}
                                >
                                  <AvatarImage src={account.profileImage} alt={`${account.handle}'s avatar`} />
                                  <AvatarFallback>{account.handle ? account.handle[0].toUpperCase() : '?'}</AvatarFallback>
                                </Avatar>
                                {isSelected && (
                                  <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
                                    <CheckCircle className="h-4 w-4 text-primary-foreground" />
                                  </div>
                                )}
                              </div>
                              <p className="text-sm mt-2 text-center font-medium truncate w-full px-1">{account.handle}</p>
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleExtendPost}
                          disabled={selectedAccountIds.length === 0 || extendPost.isPending}
                          size="sm"
                          className="flex-1"
                        >
                          {extendPost.isPending ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Plus className="h-3 w-3 mr-1" />
                          )}
                          Extend
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowExtendForm(false)
                            setSelectedAccountIds([])
                          }}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons (moved to bottom of right column) */}
              <div className="p-6 border-t dark:border-gray-800">
                <Button variant="outline" onClick={onClose} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Full-screen Media Viewer Overlay */}
    {selectedMediaForView && (
      <div
        className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center p-4"
        onClick={handleCloseMediaView} // Close when clicking outside the media
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          onClick={handleCloseMediaView}
        >
          <X className="h-6 w-6" />
        </Button>
        <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking on media */}
          {selectedMediaForView.type === 'image' ? (
            <img
              src={selectedMediaForView.url}
              alt="Full screen media"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="max-w-full max-h-full">
              <ReactPlayer
                url={selectedMediaForView.url}
                controls
                playing={true}
                width="100%"
                height="100%"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                }}
              />
            </div>
          )}
        </div>
      </div>
    )}
    </>
  )
}