import { useState } from "react"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMonthlyCalendarPosts } from "@/hooks/api/useCalendarPosts"
import { Post, PostStatus } from "@/types/api"
import { 
  CalendarErrorState, 
  CalendarEmptyState, 
  CalendarLoadingState,
  CalendarNetworkError
} from "@/components/CalendarFallbackStates"
import { useNavigate } from "react-router-dom"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dateType, setDateType] = useState<"created" | "scheduled">("created")
  const navigate = useNavigate()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Use the React Query hook for data fetching with improved error handling
  const { 
    data: posts = [], 
    isLoading, 
    error,
    refetch,
    isRefetching
  } = useMonthlyCalendarPosts(year, month, dateType)

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(month - 1)
      } else {
        newDate.setMonth(month + 1)
      }
      return newDate
    })
  }

  const getPostsForDate = (date: number) => {
    const targetDate = new Date(year, month, date)
    return posts.filter(post => {
      const postDate = dateType === "created" 
        ? new Date(post.createdAt)
        : new Date(post.scheduledFor || post.publishedAt || post.createdAt)
      
      return postDate.toDateString() === targetDate.toDateString()
    })
  }

  const getStatusColor = (status: PostStatus) => {
    switch (status) {
      case PostStatus.DRAFT: 
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case PostStatus.SCHEDULED: 
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case PostStatus.PUBLISHED: 
        return 'bg-green-100 text-green-700 border-green-200'
      case PostStatus.FAILED: 
        return 'bg-red-100 text-red-700 border-red-200'
      default: 
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return 'bg-sky-500'
      case 'facebook': return 'bg-blue-600'
      case 'instagram': return 'bg-pink-500'
      case 'linkedin': return 'bg-blue-700'
      case 'youtube': return 'bg-red-600'
      case 'google': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const handleRetry = () => {
    refetch()
  }

  const handleGoToDashboard = () => {
    navigate('/')
  }

  const handleCreatePost = () => {
    navigate('/make-post')
  }

  const isNetworkError = error?.message.includes('Network') || error?.message.includes('connection')
  const hasNoPosts = !isLoading && !error && posts.length === 0

  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px]"></div>)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const postsForDay = getPostsForDate(day)
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
      
      days.push(
        <div
          key={day}
          className={`min-h-[120px] p-3 border-r border-b border-gray-200 dark:border-gray-700 ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          } transition-colors`}
        >
          <div className={`text-sm font-semibold mb-2 ${
            isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
          }`}>
            {day}
          </div>
          <div className="space-y-1 overflow-hidden">
            {postsForDay.slice(0, 3).map(post => (
              <div
                key={post.id}
                className={`text-xs p-2 rounded-md border ${getStatusColor(post.status)} cursor-pointer hover:shadow-sm transition-shadow`}
                title={post.content}
              >
                <div className="font-medium truncate mb-1">
                  {post.content.length > 30 ? `${post.content.substring(0, 30)}...` : post.content}
                </div>
                <div className="flex items-center gap-1">
                  {post.accounts.slice(0, 3).map(account => (
                    <div
                      key={account.id}
                      className={`w-2 h-2 rounded-full ${getPlatformColor(account.platform)}`}
                      title={account.platform}
                    />
                  ))}
                  {post.accounts.length > 3 && (
                    <span className="text-xs text-gray-500">+{post.accounts.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
            {postsForDay.length > 3 && (
              <div className="text-xs text-gray-500 text-center py-1">
                +{postsForDay.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
    }
    
    return days
  }

  const renderCalendarContent = () => {
    // Show loading state
    if (isLoading && !posts.length) {
      return <CalendarLoadingState />
    }

    // Show network error state
    if (isNetworkError) {
      return (
        <CalendarNetworkError 
          onRetry={handleRetry}
          isRetrying={isRefetching}
        />
      )
    }

    // Show general error state
    if (error) {
      return (
        <CalendarErrorState 
          error={error}
          onRetry={handleRetry}
          onGoToDashboard={handleGoToDashboard}
        />
      )
    }

    // Show empty state
    if (hasNoPosts) {
      return (
        <CalendarEmptyState 
          dateType={dateType}
          monthName={MONTHS[month]}
          year={year}
          onCreatePost={handleCreatePost}
        />
      )
    }

    // Show normal calendar grid
    return (
      <div className="h-full border-l border-t border-gray-200 dark:border-gray-700">
        {/* Weekday headers */}
        <div className="grid grid-cols-7">
          {WEEKDAYS.map(day => (
            <div
              key={day}
              className="p-4 text-center font-semibold text-sm bg-gray-50 dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 h-[calc(100%-60px)]">
          {renderCalendarDays()}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters Section */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View by:</span>
          </div>
          <Select 
            value={dateType} 
            onValueChange={(value: "created" | "scheduled") => setDateType(value)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Created Date</SelectItem>
              <SelectItem value="scheduled">Scheduled Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
              <span>Draft</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span>Published</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span>Failed</span>
            </div>
          </div>
          
          {error && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              disabled={isRefetching}
            >
              {isRefetching ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                  Retrying...
                </>
              ) : (
                'Retry'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Header - only show when not in error state */}
      {!error && (
        <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-900">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {MONTHS[month]} {year}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              disabled={isLoading}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              disabled={isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden">
        {renderCalendarContent()}
      </div>
    </div>
  )
}