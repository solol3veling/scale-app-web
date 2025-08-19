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
  onPostLongPress: (postId: string) => void
  onDayExpand: (date: Date, posts: Post[]) => void
  selectedPostIds: Set<string>
  getPlatformColor: (platform: string) => string
}

export function DroppableDayCell({
  calendarDay,
  dayPosts,
  isTodayCell,
  onPostClick,
  onPostDropped,
  onPostLongPress,
  onDayExpand,
  selectedPostIds,
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
      className={`relative min-h-[80px] sm:min-h-[100px] md:min-h-[120px] p-1 sm:p-2 border-b border-r border-gray-200 dark:border-gray-700 ${
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
      <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
        isTodayCell 
          ? 'w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs' 
          : calendarDay.isCurrentMonth 
            ? 'text-gray-900 dark:text-gray-100' 
            : 'text-gray-400 dark:text-gray-600'
      }`}>
        {calendarDay.day}
      </div>
      
      {/* Posts for this day */}
      <div className="space-y-0.5 sm:space-y-1">
        {dayPosts.slice(0, 2).map((post) => (
          <DraggablePost
            key={post.id}
            post={post}
            onClick={() => onPostClick(post.id)}
            onLongPress={onPostLongPress}
            isSelected={selectedPostIds.has(post.id)}
            getPlatformColor={getPlatformColor}
          />
        ))}
        
        {/* Show more indicator - clickable */}
        {dayPosts.length > 2 && (
          <button
            onClick={() => onDayExpand(calendarDay.date, dayPosts)}
            className="w-full text-[9px] sm:text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-center py-0.5 sm:py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
          >
            +{dayPosts.length - 2} more
          </button>
        )}
      </div>

      {/* Drop target visual feedback */}
      {isOver && (
        <div className={`absolute inset-0 border-2 border-dashed rounded pointer-events-none ${
          canDrop 
            ? 'border-green-400 bg-green-50/20 dark:bg-green-900/10' 
            : 'border-red-400 bg-red-50/20 dark:bg-red-900/10'
        }`}>
          <div className={`flex items-center justify-center h-full text-xs sm:text-sm font-medium ${
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