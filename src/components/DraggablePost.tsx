import { useDrag } from 'react-dnd'
import { format } from "date-fns"
import { Edit3, Clock, CheckCircle, AlertCircle, Check } from "lucide-react"
import { Post, PostStatus } from "@/types/api"
import { useState, useRef, useEffect } from "react"

interface DraggablePostProps {
  post: Post
  onClick: () => void
  onLongPress: (postId: string) => void
  isSelected: boolean
  getPlatformColor: (platform: string) => string
}

const ItemTypes = {
  POST: 'post'
}

export function DraggablePost({ post, onClick, onLongPress, isSelected, getPlatformColor }: DraggablePostProps) {
  const canDrag = post.status !== PostStatus.PUBLISHED && post.status !== PostStatus.FAILED && post.status !== PostStatus.PUBLISHING
  const [isLongPressing, setIsLongPressing] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const touchStartTime = useRef<number>(0)
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.POST,
    item: { post },
    canDrag: canDrag && !isSelected, // Disable drag when selected
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const handleTouchStart = () => {
    touchStartTime.current = Date.now()
    setIsLongPressing(true)
    
    longPressTimer.current = setTimeout(() => {
      onLongPress(post.id)
      setIsLongPressing(false)
    }, 500) // 500ms long press
  }

  const handleTouchEnd = () => {
    const touchDuration = Date.now() - touchStartTime.current
    setIsLongPressing(false)
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    
    // If it was a short touch (less than 500ms), treat as click
    if (touchDuration < 500 && !isSelected) {
      onClick()
    }
  }

  const handleMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      onLongPress(post.id)
      setIsLongPressing(false)
    }, 500)
  }

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click if we're in selection mode
    if (isSelected || isLongPressing) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onClick()
  }

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  const getStatusIcon = (status: PostStatus) => {
    switch (status) {
      case PostStatus.DRAFT: 
        return <Edit3 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
      case PostStatus.SCHEDULED: 
        return <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
      case PostStatus.PUBLISHING: 
        return <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />
      case PostStatus.PUBLISHED: 
        return <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
      case PostStatus.FAILED: 
        return <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
      default: 
        return <Edit3 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
    }
  }

  const getStatusText = (status: PostStatus) => {
    switch (status) {
      case PostStatus.DRAFT: return "Draft"
      case PostStatus.SCHEDULED: return "Scheduled"
      case PostStatus.PUBLISHING: return "Publishing"
      case PostStatus.PUBLISHED: return "Posted"
      case PostStatus.FAILED: return "Failed"
      default: return "Draft"
    }
  }

  return (
    <div
      ref={canDrag && !isSelected ? drag : undefined}
      className={`group relative p-1 sm:p-1.5 rounded text-xs transition-all duration-200 ${
        isSelected 
          ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 shadow-lg scale-105' 
          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-transparent'
      } ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${
        canDrag && !isSelected ? 'cursor-move' : isSelected ? 'cursor-pointer' : 'cursor-default'
      } ${
        !canDrag ? 'opacity-75' : ''
      } ${
        isLongPressing ? 'scale-95 bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      title={
        isSelected 
          ? "Selected post" 
          : canDrag 
            ? "Long press to select, drag to reschedule" 
            : post.status === PostStatus.PUBLISHED 
              ? "Published posts cannot be moved" 
              : "Failed posts cannot be moved"
      }
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
        </div>
      )}
      <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
        {getStatusIcon(post.status)}
        <span className="text-[9px] sm:text-[10px] font-medium text-gray-600 dark:text-gray-400">
          {getStatusText(post.status)}
        </span>
        <span className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-500 ml-auto">
          {post.displayDate 
            ? format(new Date(post.displayDate), 'HH:mm')
            : post.scheduledFor 
              ? format(new Date(post.scheduledFor), 'HH:mm')
              : format(new Date(post.createdAt), 'HH:mm')
          }
        </span>
      </div>
      
      <div className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 leading-tight mb-0.5 sm:mb-1">
        {post.content.length > 25 ? `${post.content.substring(0, 25)}...` : post.content}
      </div>
      
      {/* Platform indicators */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        {post.accounts.slice(0, 3).map(account => (
          <div
            key={account.id}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getPlatformColor(account.platform)}`}
            title={account.platform}
          />
        ))}
        {post.accounts.length > 3 && (
          <span className="text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400">+{post.accounts.length - 3}</span>
        )}
      </div>
    </div>
  )
}

export { ItemTypes }