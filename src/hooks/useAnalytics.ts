import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { analyticsApi } from '@/services/api'
import { 
  AnalyticsData, 
  EnhancedAnalyticsData, 
  PlatformAnalyticsData, 
  EngagementAnalyticsData,
  ContentAnalyticsData,
  AnalyticsOverview,
  PostsAnalyticsData,
  ContentInsights,
  PostSpecificAnalytics,
  Platform 
} from '@/types/api'
import { PostsAnalyticsParams } from '@/services/api/analytics'

// Analytics query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  basic: (dateRange: string) => [...analyticsKeys.all, 'basic', dateRange] as const,
  enhanced: (dateRange: string) => [...analyticsKeys.all, 'enhanced', dateRange] as const,
  platform: (platform: Platform, dateRange: string) => [...analyticsKeys.all, 'platform', platform, dateRange] as const,
  engagement: (dateRange: string) => [...analyticsKeys.all, 'engagement', dateRange] as const,
  content: (dateRange: string) => [...analyticsKeys.all, 'content', dateRange] as const,
  postAnalytics: (postId: string) => [...analyticsKeys.all, 'post', postId] as const,
  overview: (dateRange: string) => [...analyticsKeys.all, 'overview', dateRange] as const,
  postsAnalytics: (params: string) => [...analyticsKeys.all, 'posts', params] as const,
  platformSpecific: (platform: Platform, dateRange: string) => [...analyticsKeys.all, 'platform-specific', platform, dateRange] as const,
  contentInsights: (dateRange: string) => [...analyticsKeys.all, 'content-insights', dateRange] as const,
  postSpecific: (postId: string) => [...analyticsKeys.all, 'post-specific', postId] as const,
  dashboard: (dateRange: string) => [...analyticsKeys.all, 'dashboard', dateRange] as const,
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

// Analytics Overview Hook
export const useAnalyticsOverview = (dateRange: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.overview(dateRange),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getOverview({ dateRange })
        console.log('📊 Analytics Overview API Response:', response)
        return response
      } catch (error) {
        console.error('📊 Analytics Overview API Error:', error)
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

// Posts Analytics Hook
export const usePostsAnalytics = (params: PostsAnalyticsParams = {}) => {
  const paramsKey = JSON.stringify(params)
  
  return useQuery({
    queryKey: analyticsKeys.postsAnalytics(paramsKey),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getPostsAnalytics(params)
        console.log('📊 Posts Analytics API Response:', response)
        return response
      } catch (error) {
        console.error('📊 Posts Analytics API Error:', error)
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

// Platform Specific Analytics Hook
export const usePlatformSpecificAnalytics = (platform: Platform, dateRange: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.platformSpecific(platform, dateRange),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getPlatformSpecificAnalytics(platform, { dateRange })
        console.log(`📊 ${platform} Specific Analytics API Response:`, response)
        return response
      } catch (error) {
        console.error(`📊 ${platform} Specific Analytics API Error:`, error)
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

// Content Insights Hook
export const useContentInsights = (dateRange: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.contentInsights(dateRange),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getContentInsights({ dateRange })
        console.log('📊 Content Insights API Response:', response)
        return response
      } catch (error) {
        console.error('📊 Content Insights API Error:', error)
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

// Post-Specific Analytics Hook
export const usePostSpecificAnalytics = (postId: string) => {
  return useQuery({
    queryKey: analyticsKeys.postSpecific(postId),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getPostSpecificAnalytics(postId)
        console.log('📊 Post-Specific Analytics API Response:', response)
        return response
      } catch (error) {
        console.error('📊 Post-Specific Analytics API Error:', error)
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
    enabled: !!postId
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

// Analytics Dashboard Hook
export const useAnalyticsDashboard = (dateRange: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.dashboard(dateRange),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getDashboard({ dateRange })
        console.log('📊 Dashboard Analytics Response:', response)
        return response
      } catch (error) {
        console.error('📊 Dashboard Analytics Error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    retry: (failureCount, error) => {
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        return false
      }
      return failureCount < 2
    }
  })
}