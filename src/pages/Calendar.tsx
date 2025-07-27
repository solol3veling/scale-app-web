import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle, Edit3, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as DatePickerCalendar } from "@/components/ui/calendar"
import { useMonthlyCalendarPosts } from "@/hooks/api/useCalendarPosts"
import { Post, PostStatus } from "@/types/api"
import { api } from "@/services/api"
import { 
  CalendarErrorState, 
  CalendarEmptyState, 
  CalendarLoadingState,
  CalendarNetworkError
} from "@/components/CalendarFallbackStates"
import { ScheduleConfirmationModal } from "@/components/ScheduleConfirmationModal"
import { PostDetailsModal } from "@/components/PostDetailsModal"
import { DroppableDayCell } from "@/components/DroppableDayCell"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [targetDate, setTargetDate] = useState<Date | null>(null)
  // Post details modal state
  const [postDetailsModalOpen, setPostDetailsModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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

  // Mutation for scheduling posts
  const schedulePostMutation = useMutation({
    mutationFn: async ({ postId, scheduledFor, accountIds }: { 
      postId: string; 
      scheduledFor: string; 
      accountIds?: string[] 
    }) => {
      return api.posts.schedule(postId, scheduledFor, accountIds)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-posts'] })
      toast.success('Post scheduled successfully!')
      // Ensure state is clean after successful scheduling
      setSelectedPost(null)
      setTargetDate(null)
      setConfirmModalOpen(false)
    },
    onError: (error) => {
      console.error('Error scheduling post:', error)
      toast.error('Failed to schedule post. Please try again.')
      // Ensure state is clean after error
      setSelectedPost(null)
      setTargetDate(null)
      setConfirmModalOpen(false)
    }
  })

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

  const getPostsForDate = (calendarDay: { day: number; date: Date; isCurrentMonth: boolean }) => {
    // Use the actual date from the calendar day to avoid month boundary issues
    const targetDate = calendarDay.date
    
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
    
    // Calculate previous month's year and month
    const prevYear = month === 0 ? year - 1 : year
    const prevMonth = month === 0 ? 11 : month - 1
    
    // Calculate next month's year and month  
    const nextYear = month === 11 ? year + 1 : year
    const nextMonth = month === 11 ? 0 : month + 1
    
    // Add days from previous month
    const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate()
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i
      days.push({
        day,
        isCurrentMonth: false,
        isPrevMonth: true,
        isNextMonth: false,
        date: new Date(prevYear, prevMonth, day)
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
        date: new Date(nextYear, nextMonth, day)
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

  // Handle post drop on calendar day
  const handlePostDropped = (post: Post, newTargetDate: Date) => {
    // Create a fresh copy of the target date to avoid mutation issues
    const freshTargetDate = new Date(newTargetDate.getTime())
    
    // Debug: Log the target date to verify accuracy
    console.log('Dropped on date:', {
      targetDate: freshTargetDate,
      dateString: freshTargetDate.toDateString(),
      month: freshTargetDate.getMonth(),
      year: freshTargetDate.getFullYear(),
      day: freshTargetDate.getDate()
    })
    
    // Check if we're dropping on the same date (no need for confirmation)
    const currentPostDate = post.displayDate 
      ? new Date(post.displayDate)
      : post.scheduledFor 
        ? new Date(post.scheduledFor)
        : post.publishedAt
          ? new Date(post.publishedAt)
          : new Date(post.createdAt)
    
    const isSameDate = currentPostDate.toDateString() === freshTargetDate.toDateString()
    
    if (isSameDate) {
      // No need to show modal if dropping on the same date
      return
    }
    
    setSelectedPost(post)
    setTargetDate(freshTargetDate)
    setConfirmModalOpen(true)
  }

  // Handle confirmation modal
  const handleScheduleConfirm = async () => {
    if (!selectedPost || !targetDate) return

    try {
      // Create a fresh copy of the target date to avoid mutation issues
      const scheduledFor = new Date(targetDate.getTime())
      scheduledFor.setHours(12, 0, 0, 0) // Default to noon - user can adjust later

      // Debug: Log what we're sending to the API
      console.log('Scheduling post:', {
        originalTargetDate: targetDate,
        scheduledForDate: scheduledFor,
        scheduledForISO: scheduledFor.toISOString(),
        targetMonth: targetDate.getMonth(),
        targetYear: targetDate.getFullYear(),
        currentMonth: month,
        currentYear: year
      })

      // Store navigation info before clearing state
      const targetMonth = targetDate.getMonth()
      const targetYear = targetDate.getFullYear()
      const shouldNavigate = targetMonth !== month || targetYear !== year

      // Clear modal state immediately to prevent stale data
      setSelectedPost(null)
      setTargetDate(null)
      setConfirmModalOpen(false)

      // Always use the schedule endpoint - it will handle creating copies for drafts
      schedulePostMutation.mutate({
        postId: selectedPost.id,
        scheduledFor: scheduledFor.toISOString(),
        accountIds: selectedPost.accounts.map(acc => acc.id)
      })
      
      // If the target date is in a different month, navigate to that month
      if (shouldNavigate) {
        console.log('Navigating to different month:', {
          fromMonth: month,
          fromYear: year,
          toMonth: targetMonth,
          toYear: targetYear
        })
        setCurrentDate(new Date(targetYear, targetMonth, 1))
      }
    } catch (error) {
      console.error('Error in schedule confirm:', error)
      // Reset state on error too
      setSelectedPost(null)
      setTargetDate(null)
      setConfirmModalOpen(false)
    }
  }

  const handleRetry = () => {
    refetch()
  }

  const handleCreatePost = () => {
    navigate('/make-post')
  }

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId)
    setPostDetailsModalOpen(true)
  }

  const handleClosePostDetails = () => {
    setPostDetailsModalOpen(false)
    setSelectedPostId(null)
    // Refresh calendar data when modal closes to ensure any changes are reflected
    queryClient.invalidateQueries({ queryKey: ['calendar-posts'] })
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
            const dayPosts = getPostsForDate(calendarDay)
            const isTodayCell = isToday(calendarDay.date)
            
            return (
              <DroppableDayCell
                key={index}
                calendarDay={calendarDay}
                dayPosts={dayPosts}
                isTodayCell={isTodayCell}
                onPostClick={handlePostClick}
                onPostDropped={handlePostDropped}
                getPlatformColor={getPlatformColor}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
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

      {/* Schedule Confirmation Modal */}
      <ScheduleConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false)
          setSelectedPost(null)
          setTargetDate(null)
        }}
        post={selectedPost}
        targetDate={targetDate}
        onConfirm={handleScheduleConfirm}
      />

      {/* Post Details Modal */}
      {selectedPostId && (
        <PostDetailsModal
          isOpen={postDetailsModalOpen}
          onClose={handleClosePostDetails}
          postId={selectedPostId}
        />
      )}
    </div>
    </DndProvider>
  )
}