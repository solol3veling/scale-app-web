import { useState } from "react"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { format } from "date-fns"
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
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i === 0 ? 12 : i > 12 ? i - 12 : i
  const period = i < 12 ? 'am' : 'pm'
  return { value: i, label: `${hour} ${period}`, display: `${hour} ${period}` }
})

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

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7)
      } else {
        newDate.setDate(newDate.getDate() + 7)
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

  const getEventColor = (status: PostStatus) => {
    switch (status) {
      case PostStatus.DRAFT: 
        return 'bg-gray-700 border border-gray-600'
      case PostStatus.SCHEDULED: 
        return 'bg-blue-700 border border-blue-600'
      case PostStatus.PUBLISHED: 
        return 'bg-green-700 border border-green-600'
      case PostStatus.FAILED: 
        return 'bg-red-700 border border-red-600'
      default: 
        return 'bg-gray-700 border border-gray-600'
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

  const handlePostClick = (postId: string) => {
    navigate(`/posts?post=${postId}`)
  }

  const isNetworkError = error?.message.includes('Network') || error?.message.includes('connection')
  const hasNoPosts = !isLoading && !error && posts.length === 0

  // Get current week dates
  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - day)
    
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDates.push(date)
    }
    return weekDates
  }

  const weekDates = getWeekDates()
  const today = new Date()

  const getPostsForDateTime = (date: Date, hour: number) => {
    return posts.filter(post => {
      const postDate = dateType === "created" 
        ? new Date(post.createdAt)
        : new Date(post.scheduledFor || post.publishedAt || post.createdAt)
      
      return postDate.toDateString() === date.toDateString() && 
             postDate.getHours() === hour
    })
  }

  const isCurrentHour = (date: Date, hour: number) => {
    return today.toDateString() === date.toDateString() && 
           today.getHours() === hour
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

    // Show time-slot calendar grid
    return (
      <div className="h-full bg-gray-900 text-white">
        {/* Week header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 z-10">
          <div className="grid grid-cols-8 h-16">
            <div className="flex items-center justify-center border-r border-gray-700">
              <span className="text-sm text-gray-400">Time</span>
            </div>
            {weekDates.map((date, index) => {
              const isToday = today.toDateString() === date.toDateString()
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center justify-center border-r border-gray-700 ${
                    isToday ? 'bg-blue-600/20 border-blue-500' : ''
                  }`}
                >
                  <div className="text-xs text-gray-400 uppercase tracking-wider">
                    {WEEKDAYS[index]}
                  </div>
                  <div className={`text-lg font-medium ${
                    isToday ? 'text-blue-400' : 'text-gray-200'
                  }`}>
                    {date.getDate().toString().padStart(2, '0')}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Time slots grid */}
        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          {HOURS.map(hour => (
            <div key={hour.value} className="grid grid-cols-8 min-h-[80px] border-b border-gray-800">
              {/* Time label */}
              <div className="flex items-start justify-end p-4 border-r border-gray-700 bg-gray-900/50">
                <span className="text-sm text-gray-400 font-medium">{hour.display}</span>
              </div>
              
              {/* Day columns */}
              {weekDates.map((date, dayIndex) => {
                const postsForHour = getPostsForDateTime(date, hour.value)
                const isCurrentTime = isCurrentHour(date, hour.value)
                
                return (
                  <div
                    key={dayIndex}
                    className={`relative p-2 border-r border-gray-700 hover:bg-gray-800/50 transition-colors ${
                      isCurrentTime ? 'bg-blue-600/10 border-blue-500/50' : ''
                    }`}
                  >
                    {postsForHour.map(post => (
                      <div
                        key={post.id}
                        className={`group mb-2 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                          getEventColor(post.status)
                        }`}
                        onClick={() => handlePostClick(post.id)}
                        title={post.content}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {post.accounts.slice(0, 2).map(account => (
                              <div
                                key={account.id}
                                className={`w-3 h-3 rounded-full ${getPlatformColor(account.platform)} ring-1 ring-white/20`}
                                title={account.platform}
                              />
                            ))}
                          </div>
                          {post.accounts.length > 2 && (
                            <span className="text-xs text-gray-400">+{post.accounts.length - 2}</span>
                          )}
                        </div>
                        
                        <div className="text-sm font-medium text-white leading-tight mb-1">
                          {post.content.length > 30 ? `${post.content.substring(0, 30)}...` : post.content}
                        </div>
                        
                        {/* Smart positioned hover tooltip */}
                        <div className={`absolute bg-gray-800 text-white p-3 rounded-lg shadow-xl border border-gray-600 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 min-w-[250px] max-w-[300px] ${
                          // Position based on day of week - right side for early days, left for later days
                          dayIndex < 4 
                            ? 'left-full ml-2 top-0' 
                            : 'right-full mr-2 top-0'
                        }`}>
                          {/* Arrow indicator */}
                          <div className={`absolute top-3 w-2 h-2 bg-gray-800 border-gray-600 rotate-45 ${
                            dayIndex < 4 
                              ? '-left-1 border-r border-b' 
                              : '-right-1 border-l border-t'
                          }`}></div>
                          
                          <div className="text-sm font-medium mb-2 leading-tight">{post.content}</div>
                          <div className="text-xs text-gray-400 mb-2">
                            {post.scheduledFor ? (
                              <>Scheduled for {format(new Date(post.scheduledFor), 'MMM dd, h:mm a')}</>
                            ) : post.publishedAt ? (
                              <>Published {format(new Date(post.publishedAt), 'MMM dd, h:mm a')}</>
                            ) : (
                              <>Created {format(new Date(post.createdAt), 'MMM dd, h:mm a')}</>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {post.accounts.map(account => (
                              <div
                                key={account.id}
                                className={`w-2.5 h-2.5 rounded-full ${getPlatformColor(account.platform)} ring-1 ring-white/20`}
                                title={account.platform}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
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
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            {MONTHS[month]} <span className="text-gray-500 dark:text-gray-400 font-normal">{year}</span>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              Week View
            </span>
          </h1>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek('prev')}
              disabled={isLoading}
              className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              disabled={isLoading}
              className="mx-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek('next')}
              disabled={isLoading}
              className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
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