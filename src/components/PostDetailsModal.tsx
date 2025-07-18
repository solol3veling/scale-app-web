import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Heart,
  MessageSquare,
  Share2,
  Image as ImageIcon,
  Video,
  Users
} from "lucide-react"
import { usePostDetailsData, useRetryEvent, useExtendPost } from "@/hooks/api/usePostDetails"
import { useSocialAccounts } from "@/hooks/api/useSocialAccounts"
import { PublishingEventStatus, Platform } from "@/types/api"
import { format } from "date-fns"

interface PostDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
}

export function PostDetailsModal({ isOpen, onClose, postId }: PostDetailsModalProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([])
  const [showExtendForm, setShowExtendForm] = useState(false)

  const { post, events, isLoading, refetch } = usePostDetailsData(postId)
  const { data: socialAccounts } = useSocialAccounts()
  const retryEvent = useRetryEvent()
  const extendPost = useExtendPost()

  const postData = post.data
  const eventsData = events.data || []

  // Get status badge for publishing events
  const getEventStatusBadge = (status: PublishingEventStatus) => {
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
            <Clock className="h-3 w-3 mr-1" />
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
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
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
    acc => !usedAccountIds.includes(acc.id) && acc.connected
  ) || []

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading post details...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!postData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="text-center py-20">
            <p className="text-muted-foreground">Post not found</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Post Details</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={refetch}
              disabled={isLoading}
              className="hover-scale"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] overflow-x-hidden">
          <div className="p-6 pt-4 space-y-6 max-w-full">
            {/* Post Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed break-words">{postData.content}</p>
                
                {/* Media Slider */}
                {postData.media && postData.media.length > 0 && (
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        {postData.media[currentMediaIndex]?.type === 'image' ? (
                          <img
                            src={postData.media[currentMediaIndex].url}
                            alt={`Media ${currentMediaIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="h-12 w-12 text-gray-400" />
                            <span className="ml-2 text-gray-500">Video</span>
                          </div>
                        )}
                      </div>
                      
                      {postData.media.length > 1 && (
                        <>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                            onClick={() => setCurrentMediaIndex(Math.max(0, currentMediaIndex - 1))}
                            disabled={currentMediaIndex === 0}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                            onClick={() => setCurrentMediaIndex(Math.min(postData.media.length - 1, currentMediaIndex + 1))}
                            disabled={currentMediaIndex === postData.media.length - 1}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    
                    {postData.media.length > 1 && (
                      <div className="flex justify-center space-x-2">
                        {postData.media.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === currentMediaIndex ? 'bg-primary' : 'bg-gray-300'
                            }`}
                            onClick={() => setCurrentMediaIndex(index)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Post Metadata */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {postData.scheduledFor ? (
                      <span>Scheduled for {format(new Date(postData.scheduledFor), 'PPP p')}</span>
                    ) : postData.publishedAt ? (
                      <span>Published on {format(new Date(postData.publishedAt), 'PPP p')}</span>
                    ) : (
                      <span>Created on {format(new Date(postData.createdAt), 'PPP p')}</span>
                    )}
                  </div>
                  <Badge variant="outline">{postData.status}</Badge>
                </div>

                {/* Engagement Metrics */}
                {postData.engagement && (
                  <div className="flex items-center gap-6 text-sm text-muted-foreground border-t pt-4">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{postData.engagement.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{postData.engagement.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      <span>{postData.engagement.shares}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{postData.engagement.reach}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Publishing Events */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Publishing Events</CardTitle>
                  {availableAccounts.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExtendForm(!showExtendForm)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Extend Post
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {eventsData.map((event) => {
                  const platformInfo = getPlatformInfo(event.platform)
                  return (
                    <div key={event.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className={`${platformInfo.color} text-white`}>
                            {platformInfo.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{event.socialAccount.displayName}</span>
                            <span className="text-sm text-muted-foreground truncate">@{event.socialAccount.handle}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{platformInfo.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-shrink-0 sm:justify-end justify-start">
                        {getEventStatusBadge(event.status)}
                        {event.status === PublishingEventStatus.FAILED && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRetryEvent(event.id)}
                            disabled={retryEvent.isPending}
                            className="h-8 w-8"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {eventsData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No publishing events found</p>
                  </div>
                )}

                {/* Extend Post Form */}
                {showExtendForm && (
                  <div className="border-t pt-4 space-y-4">
                    <h4 className="font-medium">Extend to Additional Accounts</h4>
                    <div className="space-y-2">
                      {availableAccounts.map((account) => (
                        <div key={account.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={account.id}
                            checked={selectedAccountIds.includes(account.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAccountIds([...selectedAccountIds, account.id])
                              } else {
                                setSelectedAccountIds(selectedAccountIds.filter(id => id !== account.id))
                              }
                            }}
                          />
                          <label htmlFor={account.id} className="text-sm font-medium">
                            {account.displayName} ({account.platform})
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleExtendPost}
                        disabled={selectedAccountIds.length === 0 || extendPost.isPending}
                        size="sm"
                      >
                        {extendPost.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Extend Post
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
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}