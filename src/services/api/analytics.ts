import { apiClient, makeApiCall, buildApiUrl, buildQueryParams } from './base';
import {
  ApiResponseAnalyticsData,
  ApiResponseEnhancedAnalyticsData,
  ApiResponsePlatformAnalyticsData,
  ApiResponseEngagementAnalyticsData,
  ApiResponseContentAnalyticsData,
  ApiResponseRefreshEngagement,
  ApiResponseRefreshGeneric,
  AnalyticsData,
  EnhancedAnalyticsData,
  PlatformAnalyticsData,
  EngagementAnalyticsData,
  ContentAnalyticsData,
  RefreshEngagementResponse,
  Platform,
  AnalyticsOverview,
  PostsAnalyticsData,
  ContentInsights,
  PostSpecificAnalytics,
  ApiResponse
} from '@/types/api';

export interface AnalyticsParams {
  dateRange?: string;
  platform?: Platform;
  accountId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PostsAnalyticsParams {
  platform?: Platform;
  mediaType?: string;
  dateRange?: string;
  hashtag?: string;
  accountId?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
}

export const analyticsApi = {
  /**
   * Get general analytics data - /api/v1/analytics
   */
  getAnalytics: async (params: AnalyticsParams = {}): Promise<AnalyticsData> => {
    const queryString = buildQueryParams(params);
    const url = queryString ? `/analytics?${queryString}` : '/analytics';
    
    const response = await makeApiCall<ApiResponseAnalyticsData>(
      () => apiClient.get(buildApiUrl(url))
    );
    return response.data;
  },

  /**
   * Get enhanced analytics data - /api/v1/analytics/enhanced
   */
  getEnhancedAnalytics: async (params: AnalyticsParams = {}): Promise<EnhancedAnalyticsData> => {
    const queryString = buildQueryParams(params);
    const url = queryString ? `/analytics/enhanced?${queryString}` : '/analytics/enhanced';
    
    const response = await makeApiCall<ApiResponseEnhancedAnalyticsData>(
      () => apiClient.get(buildApiUrl(url))
    );
    return response.data;
  },

  /**
   * Get platform-specific analytics - /api/v1/analytics/platform/{platform}
   */
  getPlatformAnalytics: async (platform: Platform, params: Omit<AnalyticsParams, 'platform'> = {}): Promise<PlatformAnalyticsData> => {
    const queryString = buildQueryParams(params);
    const url = queryString ? `/analytics/platform/${platform}?${queryString}` : `/analytics/platform/${platform}`;
    
    const response = await makeApiCall<ApiResponsePlatformAnalyticsData>(
      () => apiClient.get(buildApiUrl(url))
    );
    return response.data;
  },

  /**
   * Get post analytics (from post controller)
   */
  getPostAnalytics: async (params: AnalyticsParams = {}): Promise<AnalyticsData> => {
    const queryString = buildQueryParams(params);
    const url = queryString ? `/post/analytics?${queryString}` : '/post/analytics';
    
    const response = await makeApiCall<ApiResponseAnalyticsData>(
      () => apiClient.get(buildApiUrl(url))
    );
    return response.data;
  },

  /**
   * Get analytics for a specific account
   */
  getAccountAnalytics: async (accountId: string, params: AnalyticsParams = {}): Promise<AnalyticsData> => {
    const queryString = buildQueryParams({ ...params, accountId });
    
    const response = await makeApiCall<ApiResponseAnalyticsData>(
      () => apiClient.get(buildApiUrl(`/analytics/account?${queryString}`))
    );
    return response.data;
  },

  /**
   * Get engagement analytics - /api/v1/analytics/engagement
   */
  getEngagementAnalytics: async (params: AnalyticsParams = {}): Promise<EngagementAnalyticsData> => {
    const queryString = buildQueryParams(params);
    const url = queryString ? `/analytics/engagement?${queryString}` : '/analytics/engagement';
    
    const response = await makeApiCall<ApiResponseEngagementAnalyticsData>(
      () => apiClient.get(buildApiUrl(url))
    );
    return response.data;
  },

  /**
   * Get content analytics - /api/v1/analytics/content
   */
  getContentAnalytics: async (params: AnalyticsParams = {}): Promise<ContentAnalyticsData> => {
    const queryString = buildQueryParams(params);
    const url = queryString ? `/analytics/content?${queryString}` : '/analytics/content';
    
    const response = await makeApiCall<ApiResponseContentAnalyticsData>(
      () => apiClient.get(buildApiUrl(url))
    );
    return response.data;
  },

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

  /**
   * Export analytics data
   */
  exportData: async (format: 'csv' | 'pdf' | 'excel', params: AnalyticsParams = {}): Promise<Blob> => {
    const queryString = buildQueryParams({ ...params, format });
    
    const response = await makeApiCall(
      () => apiClient.get(buildApiUrl(`/analytics/export?${queryString}`), {
        responseType: 'blob'
      })
    );
    return response;
  },

  /**
   * Get analytics overview - /api/v1/analytics/overview
   */
  getOverview: async (params: Pick<AnalyticsParams, 'dateRange'> = {}): Promise<AnalyticsOverview> => {
    const queryString = buildQueryParams(params);
    const url = queryString ? `/analytics/overview?${queryString}` : '/analytics/overview';
    
    const response = await makeApiCall<ApiResponse<AnalyticsOverview>>(
      () => apiClient.get(buildApiUrl(url))
    );
    return response.data;
  },

  /**
   * Get posts analytics with filtering and pagination - /api/v1/analytics/posts
   */
  getPostsAnalytics: async (params: PostsAnalyticsParams = {}): Promise<PostsAnalyticsData> => {
    const queryString = buildQueryParams(params);
    const url = queryString ? `/analytics/posts?${queryString}` : '/analytics/posts';
    
    const response = await makeApiCall<ApiResponse<PostsAnalyticsData>>(
      () => apiClient.get(buildApiUrl(url))
    );
    return response.data;
  },

  /**
   * Get platform-specific analytics - /api/v1/analytics/platforms/{platform}
   */
  getPlatformSpecificAnalytics: async (platform: Platform, params: Pick<AnalyticsParams, 'dateRange'> = {}): Promise<PlatformAnalyticsData> => {
    const queryString = buildQueryParams(params);
    const url = queryString ? `/analytics/platforms/${platform}?${queryString}` : `/analytics/platforms/${platform}`;
    
    const response = await makeApiCall<ApiResponse<PlatformAnalyticsData>>(
      () => apiClient.get(buildApiUrl(url))
    );
    return response.data;
  },

  /**
   * Get content insights - /api/v1/analytics/content-insights
   */
  getContentInsights: async (params: Pick<AnalyticsParams, 'dateRange'> = {}): Promise<ContentInsights> => {
    const queryString = buildQueryParams(params);
    const url = queryString ? `/analytics/content-insights?${queryString}` : '/analytics/content-insights';
    
    const response = await makeApiCall<ApiResponse<ContentInsights>>(
      () => apiClient.get(buildApiUrl(url))
    );
    return response.data;
  },

  /**
   * Get post-specific analytics - /api/v1/analytics/posts/{postId}
   */
  getPostSpecificAnalytics: async (postId: string): Promise<PostSpecificAnalytics> => {
    const response = await makeApiCall<ApiResponse<PostSpecificAnalytics>>(
      () => apiClient.get(buildApiUrl(`/analytics/posts/${postId}`))
    );
    return response.data;
  },
};