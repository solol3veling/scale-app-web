import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { analyticsApi } from '@/services/api'
import { 
  AnalyticsData, 
  EnhancedAnalyticsData, 
  PlatformAnalyticsData, 
  EngagementAnalyticsData,
  ContentAnalyticsData,
  Platform 
} from '@/types/api'

// Analytics query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  basic: (dateRange: string) => [...analyticsKeys.all, 'basic', dateRange] as const,
  enhanced: (dateRange: string) => [...analyticsKeys.all, 'enhanced', dateRange] as const,
  platform: (platform: Platform, dateRange: string) => [...analyticsKeys.all, 'platform', platform, dateRange] as const,
  engagement: (dateRange: string) => [...analyticsKeys.all, 'engagement', dateRange] as const,
  content: (dateRange: string) => [...analyticsKeys.all, 'content', dateRange] as const,
  postAnalytics: (postId: string) => [...analyticsKeys.all, 'post', postId] as const,
}

// Basic Analytics Hook
export const useAnalytics = (dateRange: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.basic(dateRange),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getAnalytics({ dateRange })
        console.log('📊 Analytics API Response:', response)
        return response
      } catch (error) {
        console.error('📊 Analytics API Error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    retry: (failureCount, error) => {
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        return false
      }
      if (!error?.response) {
        return false
      }
      return failureCount < 2
    }
  })
}

// Enhanced Analytics Hook
export const useEnhancedAnalytics = (dateRange: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.enhanced(dateRange),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getEnhancedAnalytics({ dateRange })
        console.log('📊 Enhanced Analytics API Response:', response)
        return response
      } catch (error) {
        console.error('📊 Enhanced Analytics API Error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    retry: (failureCount, error) => {
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        return false
      }
      if (!error?.response) {
        return false
      }
      return failureCount < 2
    }
  })
}

// Platform Analytics Hook
export const usePlatformAnalytics = (platform: Platform, dateRange: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.platform(platform, dateRange),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getPlatformAnalytics(platform, { dateRange })
        console.log(`📊 ${platform} Analytics API Response:`, response)
        return response
      } catch (error) {
        console.error(`📊 ${platform} Analytics API Error:`, error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    retry: (failureCount, error) => {
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        return false
      }
      if (!error?.response) {
        return false
      }
      return failureCount < 2
    },
    enabled: !!platform
  })
}

// Engagement Analytics Hook
export const useEngagementAnalytics = (dateRange: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.engagement(dateRange),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getEngagementAnalytics({ dateRange })
        console.log('📊 Engagement Analytics API Response:', response)
        return response
      } catch (error) {
        console.error('📊 Engagement Analytics API Error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    retry: (failureCount, error) => {
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        return false
      }
      if (!error?.response) {
        return false
      }
      return failureCount < 2
    }
  })
}

// Content Analytics Hook
export const useContentAnalytics = (dateRange: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.content(dateRange),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getContentAnalytics({ dateRange })
        console.log('📊 Content Analytics API Response:', response)
        return response
      } catch (error) {
        console.error('📊 Content Analytics API Error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    retry: (failureCount, error) => {
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        return false
      }
      if (!error?.response) {
        return false
      }
      return failureCount < 2
    }
  })
}

// Refresh Hooks
export const useRefreshPostEngagements = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (postId: string) => analyticsApi.refreshPostEngagements(postId),
    onSuccess: () => {
      // Invalidate all analytics queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
      console.log('✅ Post engagements refreshed successfully')
    },
    onError: (error) => {
      console.error('❌ Failed to refresh post engagements:', error)
    }
  })
}

export const useRefreshPlatformEngagements = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (platform: Platform) => analyticsApi.refreshPlatformEngagements(platform),
    onSuccess: (_, platform) => {
      // Invalidate platform-specific and overall analytics
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      console.log(`✅ ${platform} engagements refreshed successfully`)
    },
    onError: (error) => {
      console.error('❌ Failed to refresh platform engagements:', error)
    }
  })
}

export const useRefreshEventEngagements = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (publishingEventId: string) => analyticsApi.refreshEventEngagements(publishingEventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
      console.log('✅ Event engagements refreshed successfully')
    },
    onError: (error) => {
      console.error('❌ Failed to refresh event engagements:', error)
    }
  })
}

export const useRefreshAllEngagements = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => analyticsApi.refreshAllEngagements(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
      console.log('✅ All engagements refreshed successfully')
    },
    onError: (error) => {
      console.error('❌ Failed to refresh all engagements:', error)
    }
  })
}