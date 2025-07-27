import { useState } from "react"
import { X, Calendar, Clock, CheckCircle, Edit3, AlertCircle, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Post, PostStatus } from "@/types/api"
import { DraggablePost } from "./DraggablePost"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

interface DayViewSliderProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  posts: Post[]
  onPostClick: (postId: string) => void
  onPostLongPress: (postId: string) => void
  onDeleteSelected: () => void
  selectedPostIds: Set<string>
  getPlatformColor: (platform: string) => string
}

export function DayViewSlider({
  isOpen,
  onClose,
  date,
  posts,
  onPostClick,
  onPostLongPress,
  onDeleteSelected,
  selectedPostIds,
  getPlatformColor
}: DayViewSliderProps) {
  const [sortBy, setSortBy] = useState<'time' | 'status' | 'platform'>('time')

  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'time':
        const timeA = a.displayDate || a.scheduledFor || a.publishedAt || a.createdAt
        const timeB = b.displayDate || b.scheduledFor || b.publishedAt || b.createdAt
        return new Date(timeA).getTime() - new Date(timeB).getTime()
      case 'status':
        const statusOrder = { 'DRAFT': 0, 'SCHEDULED': 1, 'PUBLISHED': 2, 'FAILED': 3 }
        return statusOrder[a.status] - statusOrder[b.status]
      case 'platform':
        const platformA = a.accounts[0]?.platform || ''
        const platformB = b.accounts[0]?.platform || ''
        return platformA.localeCompare(platformB)
      default:
        return 0
    }
  })

  const getStatusCounts = () => {
    const draft = posts.filter(p => p.status === PostStatus.DRAFT).length
    const scheduled = posts.filter(p => p.status === PostStatus.SCHEDULED).length
    const published = posts.filter(p => p.status === PostStatus.PUBLISHED).length
    const failed = posts.filter(p => p.status === PostStatus.FAILED).length
    return { draft, scheduled, published, failed }
  }

  const statusCounts = getStatusCounts()

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[500px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {format(date, 'EEEE, MMMM d, yyyy')}
                </SheetTitle>
                <SheetDescription>
                  {posts.length} {posts.length === 1 ? 'post' : 'posts'} scheduled
                </SheetDescription>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Status summary */}
            <div className="flex gap-4 pt-3 text-sm">
              {statusCounts.draft > 0 && (
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Edit3 className="w-3 h-3" />
                  <span>{statusCounts.draft} Draft{statusCounts.draft !== 1 ? 's' : ''}</span>
                </div>
              )}
              {statusCounts.scheduled > 0 && (
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <Clock className="w-3 h-3" />
                  <span>{statusCounts.scheduled} Scheduled</span>
                </div>
              )}
              {statusCounts.published > 0 && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>{statusCounts.published} Published</span>
                </div>
              )}
              {statusCounts.failed > 0 && (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3 h-3" />
                  <span>{statusCounts.failed} Failed</span>
                </div>
              )}
            </div>
          </SheetHeader>

          {/* Controls */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
            {/* Selection controls */}
            {selectedPostIds.size > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedPostIds.size} selected
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDeleteSelected}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </Button>
              </div>
            )}
            
            {/* Sort controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
              <div className="flex gap-1">
                {[
                  { value: 'time', label: 'Time' },
                  { value: 'status', label: 'Status' },
                  { value: 'platform', label: 'Platform' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      sortBy === option.value
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Posts list */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {sortedPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="relative"
                >
                  {/* Time indicator for time sort */}
                  {sortBy === 'time' && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
                      {format(
                        new Date(post.displayDate || post.scheduledFor || post.publishedAt || post.createdAt),
                        'HH:mm'
                      )}
                    </div>
                  )}
                  
                  <DraggablePost
                    post={post}
                    onClick={() => onPostClick(post.id)}
                    onLongPress={onPostLongPress}
                    isSelected={selectedPostIds.has(post.id)}
                    getPlatformColor={getPlatformColor}
                  />
                  
                  {/* Show events for drafts */}
                  {post.status === PostStatus.DRAFT && post.events && post.events.length > 0 && (
                    <div className="ml-4 mt-2 space-y-1">
                      {post.events.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1"
                        >
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(event.scheduledFor), 'MMM d, HH:mm')}</span>
                          <span className="ml-auto capitalize">{event.status.toLowerCase()}</span>
                        </div>
                      ))}
                      {post.events.length > 3 && (
                        <div className="text-xs text-gray-400 ml-2">
                          +{post.events.length - 3} more events
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}