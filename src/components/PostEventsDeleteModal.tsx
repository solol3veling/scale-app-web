import { useState } from "react"
import { AlertTriangle, Calendar, Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Post, PublishingEventResponse } from "@/types/api"
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
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle>Posts Have Scheduled Events</DialogTitle>
              <DialogDescription>
                {postsWithEvents.length === 1 
                  ? 'This draft post has scheduled publishing events. You can delete the events individually or delete the post with all its events.'
                  : `These ${postsWithEvents.length} draft posts have scheduled publishing events. You can delete events individually or delete the posts with all their events.`
                }
              </DialogDescription>
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
              <div key={post.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{post?.content?.substring(0, 50) || 'No content'}...</h4>
                    <p className="text-xs text-gray-500">
                      {(post?.id && Array.isArray(postEventsData?.[post.id])) ? postEventsData[post.id].length : 0} events
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectAllEvents[post.id] || false}
                      onChange={() => handleSelectAllEventsForPost(post.id)}
                      className="rounded"
                    />
                    <span className="text-xs text-gray-600">Select All</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {(post?.id && Array.isArray(postEventsData?.[post.id]) ? postEventsData[post.id] : []).filter(event => event?.id).map(event => (
                    <div 
                      key={event.id} 
                      className={`flex items-center justify-between p-2 rounded border ${
                        selectedEventIds[post?.id]?.has(event.id) 
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700' 
                          : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedEventIds[post?.id]?.has(event.id) || false}
                          onChange={() => handleEventToggle(post?.id, event.id)}
                          className="rounded"
                        />
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <span className="text-xs">
                            {event?.scheduledFor 
                              ? format(new Date(event.scheduledFor), 'MMM d, yyyy HH:mm')
                              : 'No date'
                            }
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {event?.status === 'SCHEDULED' && <Clock className="w-3 h-3 text-yellow-500" />}
                        {event?.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                        <span className="text-xs text-gray-500">{event?.status || 'Unknown'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          {hasSelectedEvents && (
            <Button
              variant="destructive"
              onClick={handleDeleteSelectedEvents}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting Events...' : 'Delete Selected Events'}
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting Posts...' : 'Delete Posts Anyway'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}