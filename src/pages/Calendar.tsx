import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle, Edit3, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as DatePickerCalendar } from "@/components/ui/calendar"
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

type StatusFilterType = "all" | "scheduled" | "drafts" | "posted"

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all")
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const navigate = useNavigate()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Use the React Query hook for data fetching - get all posts for the month
  const { 
    data: allPosts = [], 
    isLoading, 
    error,
    refetch,
    isRefetching
  } = useMonthlyCalendarPosts(year, month, undefined) // Get all posts

  // Filter posts based on status filter
  const filteredPosts = allPosts.filter(post => {
    if (statusFilter === "all") return true
    if (statusFilter === "scheduled") return post.status === PostStatus.SCHEDULED
    if (statusFilter === "drafts") return post.status === PostStatus.DRAFT
    if (statusFilter === "posted") return post.status === PostStatus.PUBLISHED
    return true
  })

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const getPostsForDate = (date: number) => {
    const targetDate = new Date(year, month, date)
    return filteredPosts.filter(post => {
      // Use displayDate if available, otherwise fall back to appropriate date field
      const postDate = post.displayDate 
        ? new Date(post.displayDate)
        : post.scheduledFor 
          ? new Date(post.scheduledFor)
          : post.publishedAt
            ? new Date(post.publishedAt)
            : new Date(post.createdAt)
      
      return postDate.toDateString() === targetDate.toDateString()
    })
  }

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

  // Generate calendar days including previous/next month days for full grid
  const generateCalendarDays = () => {
    const days = []
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        isNextMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      })
    }
    
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isPrevMonth: false,
        isNextMonth: false,
        date: new Date(year, month, day)
      })
    }
    
    // Add days from next month to complete the grid
    const remainingCells = 42 - days.length // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isPrevMonth: false,
        isNextMonth: true,
        date: new Date(year, month + 1, day)
      })
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()

  // Count posts by status for filter tabs
  const getPostCounts = () => {
    const scheduled = allPosts.filter(p => p.status === PostStatus.SCHEDULED).length
    const drafts = allPosts.filter(p => p.status === PostStatus.DRAFT).length
    const posted = allPosts.filter(p => p.status === PostStatus.PUBLISHED).length
    return { scheduled, drafts, posted }
  }

  const postCounts = getPostCounts()

  const handleRetry = () => {
    refetch()
  }

  const handleCreatePost = () => {
    navigate('/make-post')
  }

  const handlePostClick = (postId: string) => {
    navigate(`/posts?post=${postId}`)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date)
      setDatePickerOpen(false)
    }
  }

  const isNetworkError = error?.message.includes('Network') || error?.message.includes('connection')
  const hasNoPosts = !isLoading && !error && filteredPosts.length === 0

  const today = new Date()
  const isToday = (date: Date) => {
    return today.toDateString() === date.toDateString()
  }

  const renderCalendarContent = () => {
    // Show loading state
    if (isLoading && !allPosts.length) {
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
          onGoToDashboard={() => navigate('/')}
        />
      )
    }

    // Show empty state when no posts match the filter
    if (hasNoPosts) {
      return (
        <CalendarEmptyState 
          statusFilter={statusFilter}
          monthName={MONTHS[month]}
          year={year}
          onCreatePost={handleCreatePost}
        />
      )
    }

    // Show monthly calendar grid
    return (
      <div className="h-full bg-white dark:bg-gray-900">
        {/* Calendar grid */}
        <div className="grid grid-cols-7 h-full">
          {/* Week header */}
          {WEEKDAYS.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((calendarDay, index) => {
            const dayPosts = getPostsForDate(calendarDay.day)
            const isTodayCell = isToday(calendarDay.date)
            
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-b border-r border-gray-200 dark:border-gray-700 ${
                  !calendarDay.isCurrentMonth 
                    ? 'bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600' 
                    : 'bg-white dark:bg-gray-900'
                } ${isTodayCell ? 'bg-blue-50/30 dark:bg-blue-900/20' : ''}`}
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
                    <div
                      key={post.id}
                      className="group cursor-pointer p-1.5 rounded text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handlePostClick(post.id)}
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
                  ))}
                  
                  {/* Show more indicator */}
                  {dayPosts.length > 3 && (
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 text-center py-1">
                      +{dayPosts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with filter tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        {/* Filter tabs */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter("all")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </button>
            
            <button
              onClick={() => setStatusFilter("scheduled")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "scheduled"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Clock className="h-4 w-4" />
              Scheduled ({postCounts.scheduled})
            </button>
            
            <button
              onClick={() => setStatusFilter("drafts")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "drafts"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Edit3 className="h-4 w-4" />
              Drafts ({postCounts.drafts})
            </button>
            
            <button
              onClick={() => setStatusFilter("posted")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "posted"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              Posted ({postCounts.posted})
            </button>
          </div>

          <div className="flex items-center gap-2">
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
            
            <input type="checkbox" className="rounded" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Select All</span>
            
            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
              Delete
            </Button>
            
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-700">
              Unschedule
            </Button>
          </div>
        </div>

        {/* Calendar navigation */}
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {MONTHS[month]} {year}
          </h1>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              disabled={isLoading}
              className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mx-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(currentDate, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <DatePickerCalendar
                  mode="single"
                  selected={currentDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button
              variant="default"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              disabled={isLoading}
              className="mr-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
            >
              Today
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              disabled={isLoading}
              className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden">
        {renderCalendarContent()}
      </div>
    </div>
  )
}