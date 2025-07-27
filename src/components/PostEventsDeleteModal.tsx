import { useState } from "react"
import { AlertTriangle, Calendar, Clock, CheckCircle2, X, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Post, PublishingEventResponse, PublishingEventStatus, Platform } from "@/types/api"
import { format } from "date-fns"

interface PostEventsDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onDeleteEvents: (postId: string, eventIds: string[]) => void
  posts: Post[]
  postEventsData: Record<string, PublishingEventResponse[]>
  eventsLoading: boolean
  isLoading?: boolean
}

export function PostEventsDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  onDeleteEvents,
  posts,
  postEventsData,
  eventsLoading,
  isLoading = false
}: PostEventsDeleteModalProps) {
  const [selectedEventIds, setSelectedEventIds] = useState<Record<string, Set<string>>>({})
  const [selectAllEvents, setSelectAllEvents] = useState<Record<string, boolean>>({})

  // Helper functions for better display
  const getStatusIcon = (status: PublishingEventStatus) => {
    switch (status) {
      case PublishingEventStatus.PENDING:
        return <Clock className="w-3 h-3 text-yellow-500" />
      case PublishingEventStatus.IN_PROGRESS:
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
      case PublishingEventStatus.COMPLETED:
        return <CheckCircle2 className="w-3 h-3 text-green-500" />
      case PublishingEventStatus.FAILED:
        return <X className="w-3 h-3 text-red-500" />
      default:
        return <AlertCircle className="w-3 h-3 text-gray-500" />
    }
  }

  const getStatusColor = (status: PublishingEventStatus) => {
    switch (status) {
      case PublishingEventStatus.PENDING:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case PublishingEventStatus.IN_PROGRESS:
        return "text-blue-600 bg-blue-50 border-blue-200"
      case PublishingEventStatus.COMPLETED:
        return "text-green-600 bg-green-50 border-green-200"
      case PublishingEventStatus.FAILED:
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case Platform.FACEBOOK:
        return "📘"
      case Platform.TWITTER:
        return "🐦"
      case Platform.INSTAGRAM:
        return "📷"
      case Platform.LINKEDIN:
        return "💼"
      case Platform.GOOGLE:
        return "🌐"
      default:
        return "📱"
    }
  }

  const formatEventTime = (scheduledFor: string) => {
    try {
      return format(new Date(scheduledFor), 'MMM d, yyyy \'at\' h:mm a')
    } catch {
      return 'Invalid date'
    }
  }

  // Use fetched events data instead of post.events - add comprehensive null safety
  const postsWithEvents = Array.isArray(posts) ? posts.filter(p => {
    if (!p?.id) return false;
    const events = postEventsData?.[p.id];
    return events && Array.isArray(events) && events.length > 0;
  }) : []
  
  const totalEvents = postsWithEvents.reduce((acc, post) => {
    if (!post?.id) return acc;
    const events = postEventsData?.[post.id];
    return acc + (Array.isArray(events) ? events.length : 0);
  }, 0)

  // Debug: Log posts and events data
  console.log('PostEventsDeleteModal - Posts received:', Array.isArray(posts) ? posts.map(p => ({
    id: p?.id,
    status: p?.status,
    accountsCount: p?.accounts?.length || 0,
    fetchedEventsCount: (p?.id && Array.isArray(postEventsData?.[p.id])) ? postEventsData[p.id].length : 0,
    fetchedEvents: p?.id ? postEventsData?.[p.id] : undefined
  })) : [])
  console.log('PostEventsDeleteModal - Posts with events:', postsWithEvents?.length || 0)
  console.log('PostEventsDeleteModal - Events loading:', eventsLoading)
  console.log('PostEventsDeleteModal - Post events data:', postEventsData)

  const handleEventToggle = (postId: string, eventId: string) => {
    if (!postId || !eventId) return
    
    const currentSelected = selectedEventIds[postId] || new Set()
    const newSelected = new Set(currentSelected)
    
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId)
    } else {
      newSelected.add(eventId)
    }
    
    setSelectedEventIds(prev => ({
      ...prev,
      [postId]: newSelected
    }))
    
    // Update select all state for this post
    const events = postEventsData?.[postId]
    const allSelected = (Array.isArray(events) && events.length > 0) 
      ? events.every(e => e?.id && newSelected.has(e.id)) 
      : false
    setSelectAllEvents(prev => ({
      ...prev,
      [postId]: allSelected
    }))
  }

  const handleSelectAllEventsForPost = (postId: string) => {
    if (!postId) return
    
    const events = postEventsData?.[postId]
    if (!Array.isArray(events) || events.length === 0) return
    
    const isCurrentlyAllSelected = selectAllEvents[postId]
    const newSelected = new Set<string>()
    
    if (!isCurrentlyAllSelected) {
      events.forEach(event => {
        if (event?.id) {
          newSelected.add(event.id)
        }
      })
    }
    
    setSelectedEventIds(prev => ({
      ...prev,
      [postId]: newSelected
    }))
    
    setSelectAllEvents(prev => ({
      ...prev,
      [postId]: !isCurrentlyAllSelected
    }))
  }

  const handleDeleteSelectedEvents = () => {
    // Delete selected events for each post
    Object.entries(selectedEventIds).forEach(([postId, eventIds]) => {
      if (eventIds.size > 0) {
        onDeleteEvents(postId, Array.from(eventIds))
      }
    })
    
    // Close modal and reset state
    setSelectedEventIds({})
    setSelectAllEvents({})
    onClose()
  }

  const hasSelectedEvents = Object.values(selectedEventIds).some(set => set.size > 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold">
                Posts Have Scheduled Publishing Events
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                {postsWithEvents.length === 1 
                  ? `This post has ${totalEvents} scheduled publishing event${totalEvents !== 1 ? 's' : ''}. You can review and delete events individually, or delete the entire post.`
                  : `These ${postsWithEvents.length} posts have a total of ${totalEvents} scheduled publishing events. Review each event carefully before deletion.`
                }
              </DialogDescription>
              {totalEvents > 0 && (
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-4">
                  <span>💡 Tip: Deleting events will cancel their scheduled publishing</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {eventsLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Loading events...</p>
            </div>
          ) : postsWithEvents.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p>No events found for selected posts.</p>
              <p className="text-sm mt-1">You can still delete the posts using the button below.</p>
            </div>
          ) : (
            postsWithEvents.map(post => (
              <div key={post.id} className="border rounded-lg p-4 space-y-4 bg-white dark:bg-gray-900">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {post?.content?.substring(0, 60) || 'No content'}
                        {(post?.content?.length || 0) > 60 && '...'}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        post.status === 'DRAFT' 
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {(post?.id && Array.isArray(postEventsData?.[post.id])) ? postEventsData[post.id].length : 0} publishing events
                      </span>
                      <span>
                        {post?.accounts?.length || 0} social accounts
                      </span>
                      {post.createdAt && (
                        <span>Created {format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <input
                      type="checkbox"
                      checked={selectAllEvents[post.id] || false}
                      onChange={() => handleSelectAllEventsForPost(post.id)}
                      className="rounded"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Select All</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {(post?.id && Array.isArray(postEventsData?.[post.id]) ? postEventsData[post.id] : []).filter(event => event?.id).map(event => (
                    <div 
                      key={event.id} 
                      className={`p-3 rounded-lg border transition-all ${
                        selectedEventIds[post?.id]?.has(event.id) 
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 shadow-sm' 
                          : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedEventIds[post?.id]?.has(event.id) || false}
                          onChange={() => handleEventToggle(post?.id, event.id)}
                          className="rounded mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          {/* Event Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getPlatformIcon(event.platform)}</span>
                              <span className="text-sm font-medium capitalize">
                                {event.platform?.toLowerCase()}
                              </span>
                              {event.socialAccount?.name && (
                                <span className="text-xs text-gray-500">
                                  (@{event.socialAccount.name})
                                </span>
                              )}
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                              {getStatusIcon(event.status)}
                              <span>{event.status?.replace('_', ' ')}</span>
                            </div>
                          </div>

                          {/* Scheduled Time */}
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {event?.scheduledFor 
                                ? formatEventTime(event.scheduledFor)
                                : 'No date scheduled'
                              }
                            </span>
                          </div>

                          {/* Error Message if Failed */}
                          {event.status === PublishingEventStatus.FAILED && event.errorMessage && (
                            <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-red-700">Error:</p>
                                <p className="text-red-600">{event.errorMessage}</p>
                              </div>
                            </div>
                          )}

                          {/* Additional Metadata */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Created: {format(new Date(event.createdAt), 'MMM d, h:mm a')}</span>
                            {event.updatedAt !== event.createdAt && (
                              <span>Updated: {format(new Date(event.updatedAt), 'MMM d, h:mm a')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2 pt-4 border-t">
          <div className="flex-1 text-xs text-gray-500">
            {hasSelectedEvents && (
              <span>
                {Object.values(selectedEventIds).reduce((acc, set) => acc + set.size, 0)} event(s) selected for deletion
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            {hasSelectedEvents && (
              <Button
                variant="destructive"
                onClick={handleDeleteSelectedEvents}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting Events...
                  </>
                ) : (
                  `Delete ${Object.values(selectedEventIds).reduce((acc, set) => acc + set.size, 0)} Selected Event(s)`
                )}
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting Posts...
                </>
              ) : (
                `Delete ${postsWithEvents.length} Post(s) & All Events`
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}