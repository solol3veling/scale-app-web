import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { analyticsApi } from '@/services/api'
import { 
  AnalyticsData, 
  EnhancedAnalyticsData, 
  PlatformAnalyticsData, 
  EngagementAnalyticsData,
  AnalyticsOverview,
  PostsAnalyticsData,
  PostSpecificAnalytics,
  Platform 
} from '@/types/api'
import { DateRangeRequest } from '@/services/api/analytics'

// Define PostsAnalyticsParams locally since it's not exported from API
interface PostsAnalyticsParams {
  dateRange?: string;
  platform?: string;
  limit?: number;
}

// Analytics query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  basic: (dateRange: string) => [...analyticsKeys.all, 'basic', dateRange] as const,
  enhanced: (dateRange: string) => [...analyticsKeys.all, 'enhanced', dateRange] as const,
  platform: (platform: Platform, dateRange: string) => [...analyticsKeys.all, 'platform', platform, dateRange] as const,
  engagement: (dateRange: string) => [...analyticsKeys.all, 'engagement', dateRange] as const,
  // Real API endpoints
  overview: (dateRange: string) => [...analyticsKeys.all, 'overview', dateRange] as const,
  overviewAdvanced: (request: string) => [...analyticsKeys.all, 'overview-advanced', request] as const,
  platformOverview: (platform: Platform, params: string) => [...analyticsKeys.all, 'platform-overview', platform, params] as const,
  postOverview: (postId: string) => [...analyticsKeys.all, 'post-overview', postId] as const,
  platformRankings: (dateRange: string) => [...analyticsKeys.all, 'platform-rankings', dateRange] as const,
  platformRankingsAdvanced: (request: string) => [...analyticsKeys.all, 'platform-rankings-advanced', request] as const,
  topPerformingPosts: (params: string) => [...analyticsKeys.all, 'top-performing-posts', params] as const,
  postAnalytics: (postId: string) => [...analyticsKeys.all, 'post', postId] as const,
  postSpecific: (postId: string) => [...analyticsKeys.all, 'post-specific', postId] as const,
  platformSpecific: (platform: Platform, dateRange: string) => [...analyticsKeys.all, 'platform-specific', platform, dateRange] as const,
  // Legacy
  postsAnalytics: (params: string) => [...analyticsKeys.all, 'posts', params] as const,
}

const defaultRetryConfig = {
  retry: (failureCount: number, error: any) => {
    if (error?.response?.status === 403 || error?.response?.status === 401) {
      return false
    }
    if (!error?.response) {
      return false
    }
    return failureCount < 2
  }
}

// Legacy Analytics Hooks (keeping for backward compatibility)

export const useAnalytics = (dateRange: string = '30d'): { data: AnalyticsOverview | undefined, isLoading: boolean, error: Error | null } => {
  return useQuery({
    queryKey: analyticsKeys.basic(dateRange),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getAnalyticsOverview(dateRange)
        console.log('📊 Analytics API Response:', response)
        return response
      } catch (error) {
        console.error('📊 Analytics API Error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    ...defaultRetryConfig
  })
}

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
    ...defaultRetryConfig
  })
}

export const useEngagementAnalytics = (dateRange: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.engagement(dateRange),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getAnalyticsOverview(dateRange)
        console.log('📊 Engagement Analytics API Response:', response)
        return response
      } catch (error) {
        console.error('📊 Engagement Analytics API Error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    ...defaultRetryConfig
  })
}

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
    ...defaultRetryConfig
  })
}

// Real API Hooks based on actual backend endpoints

/**
 * Main analytics overview hook - GET /api/v1/analytics/overview
 */
export const useAnalyticsOverview = (dateRange: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.overview(dateRange),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getAnalyticsOverview(dateRange)
        console.log('📊 Analytics Overview Response:', response)
        return response
      } catch (error) {
        console.error('📊 Analytics Overview Error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    ...defaultRetryConfig
  })
}

/**
 * Advanced analytics overview hook - POST /api/v1/analytics/overview
 */
export const useAnalyticsOverviewAdvanced = (request: DateRangeRequest) => {
  const requestKey = JSON.stringify(request)
  
  return useQuery({
    queryKey: analyticsKeys.overviewAdvanced(requestKey),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getAnalyticsOverviewAdvanced(request)
        console.log('📊 Analytics Overview Advanced Response:', response)
        return response
      } catch (error) {
        console.error('📊 Analytics Overview Advanced Error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    ...defaultRetryConfig
  })
}

/**
 * Platform overview hook - GET /api/v1/analytics/platform/{platform}/overview
 */
export const usePlatformOverview = (platform: Platform | null, dateRange: string = '30d') => {
  const params = JSON.stringify({ dateRange })
  
  return useQuery({
    queryKey: analyticsKeys.platformOverview(platform!, params),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getPlatformOverview(platform!, dateRange)
        console.log(`📊 ${platform} Overview Response:`, response)
        return response
      } catch (error) {
        console.error(`📊 ${platform} Overview Error:`, error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    ...defaultRetryConfig,
    enabled: !!platform
  })
}

/**
 * Advanced platform overview hook - POST /api/v1/analytics/platform/{platform}/overview
 */
export const usePlatformOverviewAdvanced = (platform: Platform | null, request: DateRangeRequest) => {
  const requestKey = JSON.stringify(request)
  
  return useQuery({
    queryKey: analyticsKeys.platformOverview(platform!, requestKey),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getPlatformOverviewAdvanced(platform!, request)
        console.log(`📊 ${platform} Overview Advanced Response:`, response)
        return response
      } catch (error) {
        console.error(`📊 ${platform} Overview Advanced Error:`, error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    ...defaultRetryConfig,
    enabled: !!platform
  })
}

/**
 * Post analytics overview hook - GET /api/v1/analytics/post/{postId}/overview
 */
export const usePostAnalyticsOverview = (postId: string) => {
  return useQuery({
    queryKey: analyticsKeys.postOverview(postId),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getPostAnalyticsOverview(postId)
        console.log('📊 Post Analytics Overview Response:', response)
        return response
      } catch (error) {
        console.error('📊 Post Analytics Overview Error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    ...defaultRetryConfig,
    enabled: !!postId
  })
}

/**
 * Platform rankings hook (derived from overview)
 */
export const usePlatformRankings = (dateRange: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.platformRankings(dateRange),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getPlatformRankings(dateRange)
        console.log('📊 Platform Rankings Response:', response)
        return response
      } catch (error) {
        console.error('📊 Platform Rankings Error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    ...defaultRetryConfig
  })
}

/**
 * Advanced platform rankings hook
 */
export const usePlatformRankingsAdvanced = (request: DateRangeRequest) => {
  const requestKey = JSON.stringify(request)
  
  return useQuery({
    queryKey: analyticsKeys.platformRankingsAdvanced(requestKey),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getPlatformRankingsAdvanced(request)
        console.log('📊 Platform Rankings Advanced Response:', response)
        return response
      } catch (error) {
        console.error('📊 Platform Rankings Advanced Error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    ...defaultRetryConfig
  })
}

/**
 * Top performing posts hook (derived from overview)
 */
export const useTopPerformingPosts = (dateRange: string = '30d') => {
  const params = JSON.stringify({ dateRange })
  
  return useQuery({
    queryKey: analyticsKeys.topPerformingPosts(params),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getTopPerformingPosts(dateRange)
        console.log('📊 Top Performing Posts Response:', response)
        return response
      } catch (error) {
        console.error('📊 Top Performing Posts Error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    ...defaultRetryConfig
  })
}

/**
 * Advanced top performing posts hook
 */
export const useTopPerformingPostsAdvanced = (request: DateRangeRequest) => {
  const requestKey = JSON.stringify(request)
  
  return useQuery({
    queryKey: analyticsKeys.topPerformingPosts(requestKey),
    queryFn: async () => {
      try {
        const response = await analyticsApi.getTopPerformingPostsAdvanced(request)
        console.log('📊 Top Performing Posts Advanced Response:', response)
        return response
      } catch (error) {
        console.error('📊 Top Performing Posts Advanced Error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    ...defaultRetryConfig
  })
}

// Legacy platform analytics hook
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
    ...defaultRetryConfig,
    enabled: !!platform
  })
}

// Legacy hook for post-specific analytics (for compatibility)
export const usePostSpecificAnalytics = (postId: string) => {
  return usePostAnalyticsOverview(postId)
}

// Export Hooks

export const useExportAnalytics = () => {
  return useMutation({
    mutationFn: ({ format, request }: { format: 'JSON' | 'CSV' | 'EXCEL'; request: DateRangeRequest }) => 
      analyticsApi.exportAnalytics(format, request),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const dateStr = variables.request.presetRange || 'custom'
      link.download = `analytics_${dateStr}.${variables.format.toLowerCase()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      console.log('✅ Analytics export downloaded successfully')
    },
    onError: (error) => {
      console.error('❌ Failed to export analytics:', error)
    }
  })
}

// Refresh Hooks

export const useRefreshPostEngagements = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (postId: string) => analyticsApi.refreshPostEngagements(postId),
    onSuccess: () => {
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