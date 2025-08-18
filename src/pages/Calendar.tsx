import React, { useState, useMemo, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle, Edit3, AlertCircle, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as DatePickerCalendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMonthlyCalendarPosts } from "@/hooks/api/useCalendarPosts"
import { useMultiplePostEvents } from "@/hooks/api/usePostEvents"
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
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal"
import { PostEventsDeleteModal } from "@/components/PostEventsDeleteModal"
import { DayViewSlider } from "@/components/DayViewSlider"
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
    // Selection state for bulk operations
    const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set())
    const [selectAllChecked, setSelectAllChecked] = useState(false)
    // Delete modal states
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
    const [showEventsModal, setShowEventsModal] = useState(false)
    // Day view slider state
    const [dayViewOpen, setDayViewOpen] = useState(false)
    const [dayViewDate, setDayViewDate] = useState<Date | null>(null)
    const [dayViewPosts, setDayViewPosts] = useState<Post[]>([])
    // Events state for posts being deleted
    const [postsToDelete, setPostsToDelete] = useState<Post[]>([])
    const [fetchEventsEnabled, setFetchEventsEnabled] = useState(false)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    // Use useMemo to ensure these values update properly when currentDate changes
    const { year, month, firstDayOfMonth, lastDayOfMonth, firstDayWeekday, daysInMonth } = useMemo(() => {
        const yr = currentDate.getFullYear()
        const mo = currentDate.getMonth()
        const firstDay = new Date(yr, mo, 1)
        const lastDay = new Date(yr, mo + 1, 0)

        return {
            year: yr,
            month: mo,
            firstDayOfMonth: firstDay,
            lastDayOfMonth: lastDay,
            firstDayWeekday: firstDay.getDay(),
            daysInMonth: lastDay.getDate()
        }
    }, [currentDate])

    // Clear any stale modal state when navigating months
    useEffect(() => {
        if (confirmModalOpen || selectedPost || targetDate) {
            setConfirmModalOpen(false)
            setSelectedPost(null)
            setTargetDate(null)
        }
    }, [year, month]) // Reset when month/year changes

    // Use the React Query hook for data fetching - get all posts for the month
    const {
        data: allPosts = [],
        isLoading,
        error,
        refetch,
        isRefetching
    } = useMonthlyCalendarPosts(year, month, undefined) // Get all posts

    // Fetch events for posts being deleted - ensure we have valid data
    const postsWithAccountsIds = Array.isArray(postsToDelete) 
        ? postsToDelete
            .filter(post => post?.accounts && Array.isArray(post.accounts) && post.accounts.length > 0)
            .map(post => post?.id)
            .filter(id => id && typeof id === 'string') // Remove any undefined/null IDs
        : []

    const {
        data: postEventsData = {},
        isLoading: eventsLoading,
        isError: eventsError
    } = useMultiplePostEvents(postsWithAccountsIds, fetchEventsEnabled)

    // Log events fetching for debugging
    console.log('Calendar - Events fetching:', {
        postsToDelete: postsToDelete?.length || 0,
        postsWithAccountsIds: postsWithAccountsIds?.length || 0,
        fetchEventsEnabled,
        eventsLoading,
        eventsError,
        postEventsData
    })

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
        onError: (error: any) => {
            console.error('Error scheduling post:', error)
            const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error occurred'
            toast.error(`Failed to schedule post: ${errorMessage}`)
            // Ensure state is clean after error
            setSelectedPost(null)
            setTargetDate(null)
            setConfirmModalOpen(false)
        }
    })

    // Mutation for deleting posts
    const deletePostsMutation = useMutation({
        mutationFn: async (postIds: string[]) => {
            if (postIds.length === 1) {
                return api.posts.delete(postIds[0])
            } else {
                return api.posts.deleteMultiple(postIds)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-posts'] })
            toast.success('Posts deleted successfully!')
            setSelectedPostIds(new Set())
            setSelectAllChecked(false)
            setShowDeleteConfirmModal(false)
            setShowEventsModal(false)
        },
        onError: (error: any) => {
            console.error('Error deleting posts:', error)
            const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error occurred'
            toast.error(`Failed to delete posts: ${errorMessage}`)
        }
    })

    // Mutation for deleting events
    const deleteEventsMutation = useMutation({
        mutationFn: async ({ postId, eventIds }: { postId: string; eventIds: string[] }) => {
            return api.posts.deletePostEvents(postId, eventIds)
        },
        onSuccess: (_, { postId }) => {
            queryClient.invalidateQueries({ queryKey: ['calendar-posts'] })
            queryClient.invalidateQueries({ queryKey: ['post-events', postId] })
            queryClient.invalidateQueries({ queryKey: ['post-events'] })
            toast.success('Events deleted successfully!')
        },
        onError: (error: any) => {
            console.error('Error deleting events:', error)
            const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error occurred'
            const eventIds = error?.config?.data ? JSON.parse(error.config.data)?.eventIds?.length || 'some' : 'some'
            toast.error(`Failed to delete ${eventIds} events: ${errorMessage}`)
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
            const currentYear = prev.getFullYear()
            const currentMonth = prev.getMonth()

            let newYear = currentYear
            let newMonth = currentMonth

            if (direction === 'prev') {
                if (currentMonth === 0) {
                    newYear = currentYear - 1
                    newMonth = 11
                } else {
                    newMonth = currentMonth - 1
                }
            } else {
                if (currentMonth === 11) {
                    newYear = currentYear + 1
                    newMonth = 0
                } else {
                    newMonth = currentMonth + 1
                }
            }

            // Always use day 1 to avoid month boundary issues
            const newDate = new Date(newYear, newMonth, 1)

            // Debug: Log navigation
            console.log('Navigating month:', {
                direction,
                from: { year: currentYear, month: currentMonth },
                to: { year: newYear, month: newMonth },
                newDate: newDate.toDateString()
            })

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
            case PostStatus.PUBLISHING:
                return <Clock className="h-3 w-3 animate-spin" />
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
            case PostStatus.PUBLISHING: return "Publishing"
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
    const calendarDays = useMemo(() => {
        const days = []

        // Debug: Log current year/month being used for calendar generation
        console.log('Generating calendar for:', { year, month, currentDate: currentDate.toDateString() })

        // Calculate previous month's year and month
        const prevYear = month === 0 ? year - 1 : year
        const prevMonth = month === 0 ? 11 : month - 1

        // Calculate next month's year and month  
        const nextYear = month === 11 ? year + 1 : year
        const nextMonth = month === 11 ? 0 : month + 1

        // Debug: Log calculated months
        console.log('Month calculations:', {
            prev: { year: prevYear, month: prevMonth },
            current: { year, month },
            next: { year: nextYear, month: nextMonth }
        })

        // Add days from previous month
        const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate()
        for (let i = firstDayWeekday - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i
            const date = new Date(prevYear, prevMonth, day)
            days.push({
                day,
                isCurrentMonth: false,
                isPrevMonth: true,
                isNextMonth: false,
                date
            })
        }

        // Add days from current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            days.push({
                day,
                isCurrentMonth: true,
                isPrevMonth: false,
                isNextMonth: false,
                date
            })
        }

        // Add days from next month to complete the grid
        const remainingCells = 42 - days.length // 6 rows * 7 days
        for (let day = 1; day <= remainingCells; day++) {
            const date = new Date(nextYear, nextMonth, day)
            days.push({
                day,
                isCurrentMonth: false,
                isPrevMonth: false,
                isNextMonth: true,
                date
            })
        }

        // Debug: Log sample dates to verify correctness
        const sampleDates = days.slice(0, 3).map(d => ({
            day: d.day,
            date: d.date.toDateString(),
            month: d.date.getMonth(),
            year: d.date.getFullYear(),
            isCurrentMonth: d.isCurrentMonth
        }))
        console.log('Sample calendar dates:', sampleDates)

        return days
    }, [year, month, firstDayWeekday, daysInMonth])

    // Count posts by status for filter tabs
    const getPostCounts = () => {
        const scheduled = allPosts.filter(p => p.status === PostStatus.SCHEDULED).length
        const drafts = allPosts.filter(p => p.status === PostStatus.DRAFT).length
        const posted = allPosts.filter(p => p.status === PostStatus.PUBLISHED).length
        return { scheduled, drafts, posted }
    }

    const postCounts = getPostCounts()

    // Get filter option display info
    const getFilterDisplayInfo = (filter: StatusFilterType) => {
        switch (filter) {
            case "all":
                return { icon: CalendarIcon, label: "Calendar", count: null }
            case "scheduled":
                return { icon: Clock, label: "Scheduled", count: postCounts.scheduled }
            case "drafts":
                return { icon: Edit3, label: "Drafts", count: postCounts.drafts }
            case "posted":
                return { icon: CheckCircle, label: "Posted", count: postCounts.posted }
            default:
                return { icon: CalendarIcon, label: "Calendar", count: null }
        }
    }

    const currentFilterInfo = getFilterDisplayInfo(statusFilter)

    // Handle post drop on calendar day
    const handlePostDropped = (post: Post, newTargetDate: Date) => {
        // Create a fresh copy of the target date to avoid mutation issues
        const freshTargetDate = new Date(newTargetDate.getTime())

        // Debug: Log the target date to verify accuracy with calendar context
        console.log('Dropped on date:', {
            targetDate: freshTargetDate,
            dateString: freshTargetDate.toDateString(),
            targetMonth: freshTargetDate.getMonth(),
            targetYear: freshTargetDate.getFullYear(),
            targetDay: freshTargetDate.getDate(),
            currentCalendarMonth: month,
            currentCalendarYear: year,
            monthMatch: freshTargetDate.getMonth() === month,
            yearMatch: freshTargetDate.getFullYear() === year
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

    // Selection handlers
    const handlePostLongPress = (postId: string) => {
        const newSelected = new Set(selectedPostIds)
        if (newSelected.has(postId)) {
            newSelected.delete(postId)
        } else {
            newSelected.add(postId)
        }
        setSelectedPostIds(newSelected)

        // Update select all checkbox state
        const allScheduledPosts = filteredPosts.filter(p => p.status === 'SCHEDULED')
        const allScheduledSelected = allScheduledPosts.length > 0 &&
            allScheduledPosts.every(p => newSelected.has(p.id))
        setSelectAllChecked(allScheduledSelected)
    }

    const handleSelectAllScheduled = () => {
        const scheduledPosts = filteredPosts.filter(p => p.status === 'SCHEDULED')
        const newSelected = new Set(selectedPostIds)

        if (selectAllChecked) {
            // Deselect all scheduled posts
            scheduledPosts.forEach(post => newSelected.delete(post.id))
        } else {
            // Select all scheduled posts
            scheduledPosts.forEach(post => newSelected.add(post.id))
        }

        setSelectedPostIds(newSelected)
        setSelectAllChecked(!selectAllChecked)
    }

    const handleDeleteSelected = () => {
        if (selectedPostIds.size === 0) return

        const selectedPosts = filteredPosts.filter(p => selectedPostIds.has(p.id))

        // Debug: Log selected posts and their accounts
        console.log('Selected posts for deletion:', selectedPosts.map(p => ({
            id: p.id,
            status: p.status,
            accountsCount: p.accounts?.length || 0,
            accounts: p.accounts
        })))

        // Check if any posts have social accounts (which might have events)
        const postsWithAccounts = selectedPosts.filter(p => {
            return p.accounts && p.accounts?.length > 0
        }
        )

        console.log('Posts with accounts:', postsWithAccounts.length)

        if (postsWithAccounts.length > 0) {
            // Set posts to delete and enable events fetching
            setPostsToDelete(postsWithAccounts)
            setFetchEventsEnabled(true)
            // Show events deletion modal (it will handle the loading state)
            setShowEventsModal(true)
        } else {
            // No social accounts, show simple confirmation modal
            setShowDeleteConfirmModal(true)
        }
    }

    const handleConfirmDelete = () => {
        const postIds = Array.from(selectedPostIds)
        deletePostsMutation.mutate(postIds)
    }

    const handleDeleteEvents = (postId: string, eventIds: string[]) => {
        deleteEventsMutation.mutate({ postId, eventIds })
    }

    const handleDayExpand = (date: Date, posts: Post[]) => {
        setDayViewDate(date)
        setDayViewPosts(posts)
        setDayViewOpen(true)
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
                <div key={`${year}-${month}`} className="grid grid-cols-7 h-full">
                    {/* Week header */}
                    {WEEKDAYS.map((day) => (
                        <div key={day} className="p-1.5 sm:p-3 text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
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
                                onPostLongPress={handlePostLongPress}
                                onDayExpand={handleDayExpand}
                                selectedPostIds={selectedPostIds}
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
                        {/* Desktop: Tabs */}
                        <div className="hidden sm:flex items-center gap-1">
                            <button
                                onClick={() => setStatusFilter("all")}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === "all"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <CalendarIcon className="h-4 w-4" />
                                Calendar
                            </button>

                            <button
                                onClick={() => setStatusFilter("scheduled")}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === "scheduled"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <Clock className="h-4 w-4" />
                                Scheduled ({postCounts.scheduled})
                            </button>

                            <button
                                onClick={() => setStatusFilter("drafts")}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === "drafts"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <Edit3 className="h-4 w-4" />
                                Drafts ({postCounts.drafts})
                            </button>

                            <button
                                onClick={() => setStatusFilter("posted")}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === "posted"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <CheckCircle className="h-4 w-4" />
                                Posted ({postCounts?.posted})
                            </button>
                        </div>

                        {/* Mobile: Dropdown */}
                        <div className="sm:hidden">
                            <Select value={statusFilter} onValueChange={(value: StatusFilterType) => setStatusFilter(value)}>
                                <SelectTrigger className="w-40 bg-background/50 backdrop-blur-sm border-border/50 h-9">
                                    <div className="flex items-center gap-1.5">
                                        {React.createElement(currentFilterInfo.icon, { className: "h-3.5 w-3.5" })}
                                        <span className="text-sm">
                                            {currentFilterInfo.label}
                                            {currentFilterInfo.count !== null && ` (${currentFilterInfo.count})`}
                                        </span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4" />
                                            Calendar
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="scheduled">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Scheduled ({postCounts.scheduled})
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="drafts">
                                        <div className="flex items-center gap-2">
                                            <Edit3 className="h-4 w-4" />
                                            Drafts ({postCounts.drafts})
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="posted">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Posted ({postCounts.posted})
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
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

                            {selectedPostIds.size > 0 ? (
                                <>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {selectedPostIds.size} selected
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDeleteSelected}
                                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedPostIds(new Set())
                                            setSelectAllChecked(false)
                                        }}
                                        className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                        Clear Selection
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={selectAllChecked}
                                        onChange={handleSelectAllScheduled}
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Select All Scheduled</span>
                                </>
                            )}

                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-700">
                                Unschedule
                            </Button>
                        </div>
                    </div>

                    {/* Calendar navigation */}
                    <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-4">
                        <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            {MONTHS[month]} {year}
                        </h1>

                        <div className="flex items-center gap-0.5 sm:gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigateMonth('prev')}
                                disabled={isLoading}
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>

                            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mx-1 sm:mx-2 px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                                        disabled={isLoading}
                                    >
                                        <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                        <span className="text-xs sm:text-sm">
                                            {format(currentDate, "MMM d, yyyy")}
                                        </span>
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
                                variant="ghost"
                                size="sm"
                                onClick={() => refetch()}
                                disabled={isLoading || isRefetching}
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors mr-1 sm:mr-2"
                                title="Refresh calendar"
                            >
                                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                            </Button>

                            {/* Today button - hidden on mobile */}
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setCurrentDate(new Date())}
                                disabled={isLoading}
                                className="hidden sm:block mr-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                            >
                                Today
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigateMonth('next')}
                                disabled={isLoading}
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
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

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={showDeleteConfirmModal}
                    onClose={() => setShowDeleteConfirmModal(false)}
                    onConfirm={handleConfirmDelete}
                    postCount={selectedPostIds.size}
                    isLoading={deletePostsMutation.isPending}
                />

                {/* Events Delete Modal */}
                <PostEventsDeleteModal
                    isOpen={showEventsModal}
                    onClose={() => {
                        setShowEventsModal(false)
                        setPostsToDelete([])
                        setFetchEventsEnabled(false)
                    }}
                    onConfirm={handleConfirmDelete}
                    onDeleteEvents={handleDeleteEvents}
                    posts={postsToDelete}
                    postEventsData={postEventsData}
                    eventsLoading={eventsLoading}
                    isLoading={deletePostsMutation.isPending || deleteEventsMutation.isPending}
                />

                {/* Day View Slider */}
                {dayViewDate && (
                    <DayViewSlider
                        isOpen={dayViewOpen}
                        onClose={() => setDayViewOpen(false)}
                        date={dayViewDate}
                        posts={dayViewPosts}
                        onPostClick={handlePostClick}
                        onPostLongPress={handlePostLongPress}
                        onDeleteSelected={handleDeleteSelected}
                        selectedPostIds={selectedPostIds}
                        getPlatformColor={getPlatformColor}
                    />
                )}
            </div>
        </DndProvider>
    )
}
