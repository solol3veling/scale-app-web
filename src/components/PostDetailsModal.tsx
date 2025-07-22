import { useState, useEffect } from "react"
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
  Heart,
  MessageSquare,
  Share2,
  Image as ImageIcon,
  Video,
  Users,
  X
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

  // No need for manual overflow management with Dialog component

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

  if (!postData && !isLoading) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl lg:max-w-2xl h-[95vh] overflow-hidden p-0 flex flex-col">
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
          <>
            <DialogHeader className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={postData.user?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {postData.user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">{postData.user?.full_name || 'User'}'s Post</DialogTitle>
                    <DialogDescription className="text-base">
                      {postData.scheduledFor ? (
                        <>Scheduled for {format(new Date(postData.scheduledFor), 'MMM dd, yyyy at h:mm a')}</>
                      ) : postData.publishedAt ? (
                        <>Published on {format(new Date(postData.publishedAt), 'MMM dd, yyyy at h:mm a')}</>
                      ) : (
                        <>Created on {format(new Date(postData.createdAt), 'MMM dd, yyyy at h:mm a')}</>
                      )}
                    </DialogDescription>
                  </div>
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

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                  {/* Post Content Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Post Content</h3>
                    <div className="p-4 rounded-lg border bg-muted/50">
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <p className="text-base leading-relaxed whitespace-pre-wrap m-0">{postData.content}</p>
                      </div>
                    </div>
                  </div>


                  {/* Media Section */}
                  {postData.media && postData.media.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Media</h3>
                      <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <div className="aspect-video">
                          {postData.media[currentMediaIndex]?.type === 'image' ? (
                            <img
                              src={postData.media[currentMediaIndex].url}
                              alt={`Media ${currentMediaIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="h-16 w-16 text-gray-400" />
                              <span className="ml-3 text-gray-500 text-lg">Video</span>
                            </div>
                          )}
                        </div>
                        
                        {postData.media.length > 1 && (
                          <>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 h-10 w-10 bg-black/50 hover:bg-black/70 text-white border-none"
                              onClick={() => setCurrentMediaIndex(Math.max(0, currentMediaIndex - 1))}
                              disabled={currentMediaIndex === 0}
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 h-10 w-10 bg-black/50 hover:bg-black/70 text-white border-none"
                              onClick={() => setCurrentMediaIndex(Math.min(postData.media.length - 1, currentMediaIndex + 1))}
                              disabled={currentMediaIndex === postData.media.length - 1}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </>
                        )}
                      </div>
                      
                      {postData.media.length > 1 && (
                        <div className="flex justify-center space-x-2 mt-4">
                          {postData.media.map((_, index) => (
                            <button
                              key={index}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                index === currentMediaIndex ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                              onClick={() => setCurrentMediaIndex(index)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Engagement Metrics */}
                  {postData.engagement && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Engagement</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                          <Heart className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-medium">{postData.engagement.likes}</p>
                            <p className="text-xs text-muted-foreground">Likes</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                          <MessageSquare className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{postData.engagement.comments}</p>
                            <p className="text-xs text-muted-foreground">Comments</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                          <Share2 className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">{postData.engagement.shares}</p>
                            <p className="text-xs text-muted-foreground">Shares</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                          <Eye className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{postData.engagement.reach}</p>
                            <p className="text-xs text-muted-foreground">Reach</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Publishing Events Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Publishing Events</h3>
                      {availableAccounts.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowExtendForm(!showExtendForm)}
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Extend
                        </Button>
                      )}
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
                              {getEventStatusBadge(event.status)}
                              {event.status === PublishingEventStatus.FAILED && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRetryEvent(event.id)}
                                  disabled={retryEvent.isPending}
                                  className="h-8 w-8"
                                >
                                  <RotateCcw className="h-3 w-3" />
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
                        <div className="space-y-3">
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
                              <label htmlFor={account.id} className="text-sm">
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
              </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}