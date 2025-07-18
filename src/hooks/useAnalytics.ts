import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/services/api'
import { AnalyticsData } from '@/types/api'

// Mock data for development
const mockAnalyticsData: AnalyticsData = {
  dateRange: '30d',
  totalReach: 1245600,
  totalEngagement: 89420,
  engagementRate: 7.2,
  platformBreakdown: [
    {
      platform: 'Instagram',
      reach: 456780,
      engagement: 32890,
      posts: 45
    },
    {
      platform: 'Twitter',
      reach: 342150,
      engagement: 25640,
      posts: 78
    },
    {
      platform: 'LinkedIn',
      reach: 234560,
      engagement: 18920,
      posts: 23
    },
    {
      platform: 'Facebook',
      reach: 156780,
      engagement: 9870,
      posts: 34
    },
    {
      platform: 'Pinterest',
      reach: 55330,
      engagement: 2100,
      posts: 12
    }
  ],
  timeSeriesData: [
    { date: '2024-01-01', reach: 15400, engagement: 1200, posts: 3 },
    { date: '2024-01-02', reach: 18200, engagement: 1450, posts: 4 },
    { date: '2024-01-03', reach: 22100, engagement: 1780, posts: 5 },
    { date: '2024-01-04', reach: 19800, engagement: 1590, posts: 3 },
    { date: '2024-01-05', reach: 25600, engagement: 2100, posts: 6 },
    { date: '2024-01-06', reach: 28400, engagement: 2340, posts: 4 },
    { date: '2024-01-07', reach: 31200, engagement: 2680, posts: 7 },
    { date: '2024-01-08', reach: 27900, engagement: 2210, posts: 5 },
    { date: '2024-01-09', reach: 33100, engagement: 2890, posts: 6 },
    { date: '2024-01-10', reach: 29800, engagement: 2456, posts: 4 },
    { date: '2024-01-11', reach: 35600, engagement: 3120, posts: 8 },
    { date: '2024-01-12', reach: 32400, engagement: 2780, posts: 5 },
    { date: '2024-01-13', reach: 38200, engagement: 3340, posts: 7 },
    { date: '2024-01-14', reach: 41100, engagement: 3690, posts: 6 },
    { date: '2024-01-15', reach: 44800, engagement: 4120, posts: 9 }
  ],
  topPosts: [
    {
      id: 1,
      content: "Just launched our new product line! 🚀 #innovation #tech",
      images: ["/placeholder-post1.jpg"],
      publishedAt: new Date('2024-01-15T10:30:00Z'),
      status: 'published',
      platforms: ['Instagram', 'Twitter'],
      accountIds: [1, 2],
      engagement: { likes: 1250, comments: 89, shares: 45, reach: 12400 },
      createdAt: new Date('2024-01-15T09:00:00Z'),
      updatedAt: new Date('2024-01-15T10:30:00Z')
    },
    {
      id: 2,
      content: "Behind the scenes of our latest photoshoot 📸",
      images: ["/placeholder-post2.jpg", "/placeholder-post3.jpg"],
      publishedAt: new Date('2024-01-14T15:45:00Z'),
      status: 'published',
      platforms: ['Instagram', 'Pinterest'],
      accountIds: [1, 5],
      engagement: { likes: 890, comments: 34, shares: 23, reach: 8900 },
      createdAt: new Date('2024-01-14T14:00:00Z'),
      updatedAt: new Date('2024-01-14T15:45:00Z')
    }
  ]
}

export const useAnalytics = (dateRange: string = '30d') => {
  return useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      try {
        const response = await analyticsApi.getAnalyticsData()
        return response.data
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
        // Fallback to mock data during development
        await new Promise(resolve => setTimeout(resolve, 1200))
        return {
          ...mockAnalyticsData,
          dateRange
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  })
}

export const usePostAnalytics = (postId: number) => {
  return useQuery({
    queryKey: ['post-analytics', postId],
    queryFn: async () => {
      try {
        // Replace with actual API call when backend is ready
        // return await api.getPostAnalytics(postId)
        
        await new Promise(resolve => setTimeout(resolve, 400))
        
        // Return mock post data
        return mockAnalyticsData.topPosts.find(post => post.id === postId) || null
      } catch (error) {
        console.error(`Failed to fetch analytics for post ${postId}:`, error)
        throw error
      }
    },
    enabled: !!postId,
  })
}