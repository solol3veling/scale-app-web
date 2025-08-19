import { apiClient, makeApiCall, buildApiUrl, buildQueryParams } from './base';
import {
  ApiResponseRefreshEngagement,
  ApiResponseRefreshGeneric,
  RefreshEngagementResponse,
  Platform,
  ApiResponse
} from '@/types/api';

// Real API interfaces based on actual endpoints
export interface DateRangeRequest {
  startDate?: string;        // ISO 8601 format: "2025-08-19T15:51:51.285Z"
  endDate?: string;          // ISO 8601 format: "2025-08-19T15:51:51.285Z"
  presetRange?: string;      // "7d" | "30d" | "90d" | "365d"
  validRange?: boolean;
  customRange?: boolean;
}

export const analyticsApi = {
  // Real API endpoints based on actual backend

  /**
   * GET /api/v1/analytics/overview - General analytics overview
   */
  getAnalyticsOverview: async (dateRange: string = '30d'): Promise<any> => {
    const response = await makeApiCall<ApiResponse<any>>(
      () => apiClient.get(buildApiUrl(`/analytics/overview?dateRange=${dateRange}`))
    );
    return response.data;
  },

  /**
   * POST /api/v1/analytics/overview - Advanced overview with custom date ranges
   */
  getAnalyticsOverviewAdvanced: async (request: DateRangeRequest): Promise<any> => {
    const response = await makeApiCall<ApiResponse<any>>(
      () => apiClient.post(buildApiUrl('/analytics/overview'), request)
    );
    return response.data;
  },

  /**
   * GET /api/v1/analytics/platform/{platform}/overview - Platform-specific analytics
   */
  getPlatformOverview: async (platform: Platform, dateRange: string = '30d'): Promise<any> => {
    const response = await makeApiCall<ApiResponse<any>>(
      () => apiClient.get(buildApiUrl(`/analytics/platform/${platform}/overview?dateRange=${dateRange}`))
    );
    return response.data;
  },

  /**
   * POST /api/v1/analytics/platform/{platform}/overview - Platform analytics with custom date ranges
   */
  getPlatformOverviewAdvanced: async (platform: Platform, request: DateRangeRequest): Promise<any> => {
    const response = await makeApiCall<ApiResponse<any>>(
      () => apiClient.post(buildApiUrl(`/analytics/platform/${platform}/overview`), request)
    );
    return response.data;
  },

  /**
   * GET /api/v1/analytics/post/{postId}/overview - Individual post analytics
   */
  getPostAnalyticsOverview: async (postId: string): Promise<any> => {
    const response = await makeApiCall<ApiResponse<any>>(
      () => apiClient.get(buildApiUrl(`/analytics/post/${postId}/overview`))
    );
    return response.data;
  },

  // Derived data from main endpoints

  /**
   * Get platform rankings from overview endpoint
   */
  getPlatformRankings: async (dateRange: string = '30d'): Promise<any> => {
    const response = await analyticsApi.getAnalyticsOverview(dateRange);
    return {
      rankings: response.platformRankings || [],
      summary: {
        totalPlatforms: response.platformRankings?.length || 0,
        bestPerformer: response.generalStats?.topPlatform || null,
        avgSuccessRate: response.generalStats?.publishingSuccessRate || 0
      }
    };
  },

  /**
   * Get platform rankings with advanced date range
   */
  getPlatformRankingsAdvanced: async (request: DateRangeRequest): Promise<any> => {
    const response = await analyticsApi.getAnalyticsOverviewAdvanced(request);
    return {
      rankings: response.platformRankings || [],
      summary: {
        totalPlatforms: response.platformRankings?.length || 0,
        bestPerformer: response.generalStats?.topPlatform || null,
        avgSuccessRate: response.generalStats?.publishingSuccessRate || 0
      }
    };
  },

  /**
   * Get top performing posts from overview endpoint
   */
  getTopPerformingPosts: async (dateRange: string = '30d'): Promise<any> => {
    const response = await analyticsApi.getAnalyticsOverview(dateRange);
    return {
      topPosts: response.topPerformingPosts || [],
      analytics: {
        totalAnalyzedPosts: response.generalStats?.publishedPosts || 0,
        averageEngagementRate: response.performanceMetrics?.overallEngagementRate || 0,
        topPerformingPlatform: response.generalStats?.topPlatform || null
      }
    };
  },

  /**
   * Get top performing posts with advanced date range
   */
  getTopPerformingPostsAdvanced: async (request: DateRangeRequest): Promise<any> => {
    const response = await analyticsApi.getAnalyticsOverviewAdvanced(request);
    return {
      topPosts: response.topPerformingPosts || [],
      analytics: {
        totalAnalyzedPosts: response.generalStats?.publishedPosts || 0,
        averageEngagementRate: response.performanceMetrics?.overallEngagementRate || 0,
        topPerformingPlatform: response.generalStats?.topPlatform || null
      }
    };
  },

  // Export functionality

  /**
   * POST /api/v1/analytics/export - Export analytics data
   */
  exportAnalytics: async (format: 'JSON' | 'CSV' | 'EXCEL' = 'CSV', request: DateRangeRequest): Promise<Blob> => {
    const response = await makeApiCall(
      () => apiClient.post(buildApiUrl(`/analytics/export?format=${format}`), request, {
        responseType: 'blob'
      })
    );
    return response;
  },

  // Refresh functionality

  /**
   * Refresh post engagements - POST /api/v1/analytics/refresh-post-engagements/{postId}
   */
  refreshPostEngagements: async (postId: string): Promise<Record<string, any>> => {
    const response = await makeApiCall<ApiResponseRefreshGeneric>(
      () => apiClient.post(buildApiUrl(`/analytics/refresh-post-engagements/${postId}`))
    );
    return response.data;
  },

  /**
   * Refresh platform engagements - POST /api/v1/analytics/refresh-platform-engagements/{platform}
   */
  refreshPlatformEngagements: async (platform: Platform): Promise<Record<string, any>> => {
    const response = await makeApiCall<ApiResponseRefreshGeneric>(
      () => apiClient.post(buildApiUrl(`/analytics/refresh-platform-engagements/${platform}`))
    );
    return response.data;
  },

  /**
   * Refresh publishing event engagements - POST /api/v1/analytics/refresh-engagements/{publishingEventId}
   */
  refreshEventEngagements: async (publishingEventId: string): Promise<RefreshEngagementResponse> => {
    const response = await makeApiCall<ApiResponseRefreshEngagement>(
      () => apiClient.post(buildApiUrl(`/analytics/refresh-engagements/${publishingEventId}`))
    );
    return response.data;
  },

  /**
   * Refresh all engagements - POST /api/v1/analytics/refresh-all-engagements
   */
  refreshAllEngagements: async (): Promise<Record<string, any>> => {
    const response = await makeApiCall<ApiResponseRefreshGeneric>(
      () => apiClient.post(buildApiUrl('/analytics/refresh-all-engagements'))
    );
    return response.data;
  },
};