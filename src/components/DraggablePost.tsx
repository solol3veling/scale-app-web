import { useDrag } from 'react-dnd'
import { format } from "date-fns"
import { Edit3, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Post, PostStatus } from "@/types/api"

interface DraggablePostProps {
  post: Post
  onClick: () => void
  getPlatformColor: (platform: string) => string
}

const ItemTypes = {
  POST: 'post'
}

export function DraggablePost({ post, onClick, getPlatformColor }: DraggablePostProps) {
  const canDrag = post.status !== PostStatus.PUBLISHED && post.status !== PostStatus.FAILED
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.POST,
    item: { post },
    canDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const getStatusIcon = (status: PostStatus) => {
    switch (status) {
      case PostStatus.DRAFT: 
        return <Edit3 className="h-3 w-3" />
      case PostStatus.SCHEDULED: 
        return <Clock className="h-3 w-3" />
      case PostStatus.PUBLISHED: 
        return <CheckCircle className="h-3 w-3" />
      case PostStatus.FAILED: 
        return <AlertCircle className="h-3 w-3" />
      default: 
        return <Edit3 className="h-3 w-3" />
    }
  }

  const getStatusText = (status: PostStatus) => {
    switch (status) {
      case PostStatus.DRAFT: return "Draft"
      case PostStatus.SCHEDULED: return "Scheduled"
      case PostStatus.PUBLISHED: return "Posted"
      case PostStatus.FAILED: return "Failed"
      default: return "Draft"
    }
  }

  return (
    <div
      ref={canDrag ? drag : undefined}
      className={`group cursor-pointer p-1.5 rounded text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${canDrag ? 'cursor-move' : 'cursor-default'} ${
        !canDrag ? 'opacity-75' : ''
      }`}
      onClick={onClick}
      title={canDrag ? "Drag to reschedule" : post.status === PostStatus.PUBLISHED ? "Published posts cannot be moved" : "Failed posts cannot be moved"}
    >
      <div className="flex items-center gap-1 mb-1">
        {getStatusIcon(post.status)}
        <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
          {getStatusText(post.status)}
        </span>
        <span className="text-[10px] text-gray-500 dark:text-gray-500 ml-auto">
          {post.displayDate 
            ? format(new Date(post.displayDate), 'HH:mm')
            : post.scheduledFor 
              ? format(new Date(post.scheduledFor), 'HH:mm')
              : format(new Date(post.createdAt), 'HH:mm')
          }
        </span>
      </div>
      
      <div className="text-xs text-gray-700 dark:text-gray-300 leading-tight mb-1">
        {post.content.length > 30 ? `${post.content.substring(0, 30)}...` : post.content}
      </div>
      
      {/* Platform indicators */}
      <div className="flex items-center gap-1">
        {post.accounts.slice(0, 4).map(account => (
          <div
            key={account.id}
            className={`w-2 h-2 rounded-full ${getPlatformColor(account.platform)}`}
            title={account.platform}
          />
        ))}
        {post.accounts.length > 4 && (
          <span className="text-[9px] text-gray-500 dark:text-gray-400">+{post.accounts.length - 4}</span>
        )}
      </div>
    </div>
  )
}

export { ItemTypes }