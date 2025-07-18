import { apiClient, makeApiCall, buildApiUrl, buildQueryParams } from './base';
import {
  ApiResponseOverviewStats,
  OverviewStats,
} from '@/types/api';

export interface OverviewParams {
  dateRange?: string;
  includePosts?: boolean;
  includeMetrics?: boolean;
}

export const overviewApi = {
  /**
   * Get dashboard overview statistics
   */
  getStats: async (params: OverviewParams = {}): Promise<OverviewStats> => {
    const queryString = buildQueryParams(params);
    const url = queryString ? `/overview?${queryString}` : '/overview';
    
    const response = await makeApiCall<ApiResponseOverviewStats>(
      () => apiClient.get(buildApiUrl(url))
    );
    return response.data;
  },

  /**
   * Get summary metrics
   */
  getSummary: async (): Promise<any> => {
    return makeApiCall(
      () => apiClient.get(buildApiUrl('/overview/summary'))
    );
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async (limit: number = 10): Promise<any> => {
    return makeApiCall(
      () => apiClient.get(buildApiUrl(`/overview/recent?limit=${limit}`))
    );
  },

  /**
   * Get upcoming scheduled posts
   */
  getUpcomingPosts: async (limit: number = 5): Promise<any> => {
    return makeApiCall(
      () => apiClient.get(buildApiUrl(`/overview/upcoming?limit=${limit}`))
    );
  },

  /**
   * Get performance highlights
   */
  getPerformanceHighlights: async (): Promise<any> => {
    return makeApiCall(
      () => apiClient.get(buildApiUrl('/overview/highlights'))
    );
  },

  /**
   * Get growth metrics
   */
  getGrowthMetrics: async (period: string = '30d'): Promise<any> => {
    return makeApiCall(
      () => apiClient.get(buildApiUrl(`/overview/growth?period=${period}`))
    );
  },

  /**
   * Refresh overview data
   */
  refresh: async (): Promise<OverviewStats> => {
    const response = await makeApiCall<ApiResponseOverviewStats>(
      () => apiClient.post(buildApiUrl('/overview/refresh'))
    );
    return response.data;
  },
};