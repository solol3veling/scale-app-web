import { useDrop } from 'react-dnd'
import { Post } from "@/types/api"
import { DraggablePost, ItemTypes } from "./DraggablePost"

interface DroppableDayCellProps {
  calendarDay: {
    day: number
    isCurrentMonth: boolean
    isPrevMonth: boolean
    isNextMonth: boolean
    date: Date
  }
  dayPosts: Post[]
  isTodayCell: boolean
  onPostClick: (postId: string) => void
  onPostDropped: (post: Post, targetDate: Date) => void
  getPlatformColor: (platform: string) => string
}

export function DroppableDayCell({
  calendarDay,
  dayPosts,
  isTodayCell,
  onPostClick,
  onPostDropped,
  getPlatformColor
}: DroppableDayCellProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.POST,
    drop: (item: { post: Post }) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const targetDate = new Date(calendarDay.date)
      targetDate.setHours(0, 0, 0, 0)
      
      // Don't allow dropping on past dates (except today)
      if (targetDate < today) return
      
      // Create a fresh Date object to avoid mutation issues
      const freshTargetDate = new Date(calendarDay.date.getTime())
      onPostDropped(item.post, freshTargetDate)
    },
    canDrop: (item: { post: Post }) => {
      // Check if target date is not in the past (allow future dates in any month)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const targetDate = new Date(calendarDay.date)
      targetDate.setHours(0, 0, 0, 0)
      
      return targetDate >= today
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))

  return (
    <div
      ref={drop}
      className={`relative min-h-[120px] p-2 border-b border-r border-gray-200 dark:border-gray-700 ${
        !calendarDay.isCurrentMonth 
          ? 'bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600' 
          : 'bg-white dark:bg-gray-900'
      } ${isTodayCell ? 'bg-blue-50/30 dark:bg-blue-900/20' : ''} ${
        isOver && canDrop ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600' : ''
      } ${
        isOver && !canDrop ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600' : ''
      } transition-colors duration-200`}
    >
      {/* Day number */}
      <div className={`text-sm font-medium mb-2 ${
        isTodayCell 
          ? 'w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs' 
          : calendarDay.isCurrentMonth 
            ? 'text-gray-900 dark:text-gray-100' 
            : 'text-gray-400 dark:text-gray-600'
      }`}>
        {calendarDay.day}
      </div>
      
      {/* Posts for this day */}
      <div className="space-y-1">
        {dayPosts.slice(0, 3).map((post) => (
          <DraggablePost
            key={post.id}
            post={post}
            onClick={() => onPostClick(post.id)}
            getPlatformColor={getPlatformColor}
          />
        ))}
        
        {/* Show more indicator */}
        {dayPosts.length > 3 && (
          <div className="text-[10px] text-gray-500 dark:text-gray-400 text-center py-1">
            +{dayPosts.length - 3} more
          </div>
        )}
      </div>

      {/* Drop target visual feedback */}
      {isOver && (
        <div className={`absolute inset-0 border-2 border-dashed rounded pointer-events-none ${
          canDrop 
            ? 'border-green-400 bg-green-50/20 dark:bg-green-900/10' 
            : 'border-red-400 bg-red-50/20 dark:bg-red-900/10'
        }`}>
          <div className={`flex items-center justify-center h-full text-sm font-medium ${
            canDrop ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {canDrop ? (
              calendarDay.isCurrentMonth ? 'Drop to schedule' : 'Schedule & go to month'
            ) : (
              'Cannot schedule in past'
            )}
          </div>
        </div>
      )}
    </div>
  )
}