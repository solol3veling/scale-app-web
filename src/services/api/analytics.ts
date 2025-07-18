import { apiClient, makeApiCall, buildApiUrl, buildQueryParams } from './base';
import {
  ApiResponseAnalyticsData,
  AnalyticsData,
} from '@/types/api';

export interface AnalyticsParams {
  dateRange?: string;
  platform?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
}

export const analyticsApi = {
  /**
   * Get general analytics data
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
   * Get analytics for a specific platform
   */
  getPlatformAnalytics: async (platform: string, params: AnalyticsParams = {}): Promise<AnalyticsData> => {
    const queryString = buildQueryParams({ ...params, platform });
    
    const response = await makeApiCall<ApiResponseAnalyticsData>(
      () => apiClient.get(buildApiUrl(`/analytics/platform?${queryString}`))
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
   * Get engagement trends
   */
  getEngagementTrends: async (params: AnalyticsParams = {}): Promise<any> => {
    const queryString = buildQueryParams(params);
    
    return makeApiCall(
      () => apiClient.get(buildApiUrl(`/analytics/engagement-trends?${queryString}`))
    );
  },

  /**
   * Get reach analytics
   */
  getReachAnalytics: async (params: AnalyticsParams = {}): Promise<any> => {
    const queryString = buildQueryParams(params);
    
    return makeApiCall(
      () => apiClient.get(buildApiUrl(`/analytics/reach?${queryString}`))
    );
  },

  /**
   * Get audience demographics
   */
  getAudienceDemographics: async (params: AnalyticsParams = {}): Promise<any> => {
    const queryString = buildQueryParams(params);
    
    return makeApiCall(
      () => apiClient.get(buildApiUrl(`/analytics/demographics?${queryString}`))
    );
  },

  /**
   * Get content performance
   */
  getContentPerformance: async (params: AnalyticsParams = {}): Promise<any> => {
    const queryString = buildQueryParams(params);
    
    return makeApiCall(
      () => apiClient.get(buildApiUrl(`/analytics/content-performance?${queryString}`))
    );
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
};