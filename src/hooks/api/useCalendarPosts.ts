import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Post, CalendarPostsParams } from '@/types/api';

interface UseCalendarPostsOptions {
  startDate: string;
  endDate: string;
  dateType?: 'created' | 'scheduled';
  enabled?: boolean;
}

interface CalendarError extends Error {
  status?: number;
  code?: string;
}

export function useCalendarPosts(options: UseCalendarPostsOptions) {
  const { startDate, endDate, dateType = 'created', enabled = true } = options;

  return useQuery({
    queryKey: ['calendar-posts', startDate, endDate, dateType],
    queryFn: async (): Promise<Post[]> => {
      try {
        const params: CalendarPostsParams = {
          startDate,
          endDate,
          dateType,
        };
        return api.posts.getCalendarPosts(params);
      } catch (error) {
        // Enhanced error handling for calendar-specific errors
        const calendarError = error as CalendarError;
        
        // Log the error but don't let it bubble up to crash the app
        console.error('Calendar API Error:', {
          message: calendarError.message,
          status: calendarError.status,
          code: calendarError.code,
          params: { startDate, endDate, dateType }
        });

        // Transform different error types into user-friendly messages
        if (calendarError.status === 403) {
          throw new Error('You don\'t have permission to view calendar data');
        } else if (calendarError.status === 404) {
          throw new Error('Calendar endpoint not found');
        } else if (calendarError.status >= 500) {
          throw new Error('Server error while loading calendar data');
        } else if (calendarError.message?.includes('Network Error')) {
          throw new Error('Network connection issue while loading calendar');
        }
        
        // Re-throw with a generic message for unknown errors
        throw new Error('Failed to load calendar data. Please try again.');
      }
    },
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Custom retry logic for calendar
      const calendarError = error as CalendarError;
      
      // Don't retry on certain error types
      if (calendarError.status === 403 || calendarError.status === 404) {
        return false;
      }
      
      // Retry up to 2 times for network/server errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    // Return empty array on error instead of throwing
    select: (data) => data || [],
    onError: (error) => {
      // Log errors but don't show toast notifications automatically
      // Let the component handle user notifications
      console.warn('Calendar query failed:', error);
    }
  });
}

// Helper hook for getting posts for a specific month
export function useMonthlyCalendarPosts(
  year: number,
  month: number,
  dateType: 'created' | 'scheduled' = 'created'
) {
  const startDate = new Date(year, month, 1).toISOString();
  const endDate = new Date(year, month + 1, 0).toISOString();

  return useCalendarPosts({
    startDate,
    endDate,
    dateType,
  });
}