import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { OverviewStats } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

// Query keys for React Query
export const overviewKeys = {
  all: ['overview'] as const,
  stats: (params?: any) => [...overviewKeys.all, 'stats', params] as const,
  summary: () => [...overviewKeys.all, 'summary'] as const,
  recentActivity: (limit?: number) => [...overviewKeys.all, 'recent', limit] as const,
  upcomingPosts: (limit?: number) => [...overviewKeys.all, 'upcoming', limit] as const,
  highlights: () => [...overviewKeys.all, 'highlights'] as const,
  growth: (period?: string) => [...overviewKeys.all, 'growth', period] as const,
};

/**
 * Hook to get overview statistics
 */
export const useOverview = (params?: any) => {
  return useQuery({
    queryKey: overviewKeys.stats(params),
    queryFn: () => api.overview.getStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

/**
 * Hook to get overview summary
 */
export const useOverviewSummary = () => {
  return useQuery({
    queryKey: overviewKeys.summary(),
    queryFn: () => api.overview.getSummary(),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to get recent activity
 */
export const useRecentActivity = (limit: number = 10) => {
  return useQuery({
    queryKey: overviewKeys.recentActivity(limit),
    queryFn: () => api.overview.getRecentActivity(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get upcoming posts
 */
export const useUpcomingPosts = (limit: number = 5) => {
  return useQuery({
    queryKey: overviewKeys.upcomingPosts(limit),
    queryFn: () => api.overview.getUpcomingPosts(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to get performance highlights
 */
export const usePerformanceHighlights = () => {
  return useQuery({
    queryKey: overviewKeys.highlights(),
    queryFn: () => api.overview.getPerformanceHighlights(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

/**
 * Hook to get growth metrics
 */
export const useGrowthMetrics = (period: string = '30d') => {
  return useQuery({
    queryKey: overviewKeys.growth(period),
    queryFn: () => api.overview.getGrowthMetrics(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to refresh overview data
 */
export const useRefreshOverview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => api.overview.refresh(),
    onSuccess: (data) => {
      // Update all overview-related queries
      queryClient.setQueryData(overviewKeys.stats(), data);
      queryClient.invalidateQueries({ queryKey: overviewKeys.all });
      
      toast({
        title: "Overview refreshed",
        description: "Your dashboard data has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to refresh",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to get all overview data at once
 */
export const useOverviewData = () => {
  const stats = useOverview();
  const summary = useOverviewSummary();
  const recentActivity = useRecentActivity(10);
  const upcomingPosts = useUpcomingPosts(5);
  const highlights = usePerformanceHighlights();
  const growth = useGrowthMetrics();

  return {
    stats,
    summary,
    recentActivity,
    upcomingPosts,
    highlights,
    growth,
    isLoading: stats.isLoading || summary.isLoading || recentActivity.isLoading,
    isError: stats.isError || summary.isError || recentActivity.isError,
    refetch: () => {
      stats.refetch();
      summary.refetch();
      recentActivity.refetch();
      upcomingPosts.refetch();
      highlights.refetch();
      growth.refetch();
    },
  };
};