import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { OverviewStats } from '@/types'

// Mock data for development
const mockOverviewStats: OverviewStats = {
  totalPosts: 342,
  totalReach: 1245600,
  totalEngagement: 89420,
  activeAccounts: 6,
  scheduledPosts: 12,
  engagementRate: 7.2,
  growthRate: 15.8,
  recentPosts: [
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
    },
    {
      id: 3,
      content: "Weekly team update - great progress on our Q1 goals! 💪",
      images: [],
      publishedAt: new Date('2024-01-13T12:00:00Z'),
      status: 'published',
      platforms: ['LinkedIn', 'Twitter'],
      accountIds: [4, 2],
      engagement: { likes: 456, comments: 12, shares: 67, reach: 5600 },
      createdAt: new Date('2024-01-13T11:30:00Z'),
      updatedAt: new Date('2024-01-13T12:00:00Z')
    }
  ],
  topPerformingPost: {
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
  }
}

export const useOverview = () => {
  return useQuery({
    queryKey: ['overview'],
    queryFn: async () => {
      try {
        // Replace with actual API call when backend is ready
        // return await api.getOverviewStats()
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800))
        return mockOverviewStats
      } catch (error) {
        console.error('Failed to fetch overview stats:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  })
}

export const useOverviewRefresh = () => {
  const { refetch } = useOverview()
  return refetch
}