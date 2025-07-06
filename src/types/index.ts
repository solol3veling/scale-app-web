// Core data models for the application

export interface SocialAccount {
  id: number
  platform: string
  handle: string
  displayName: string
  followers: string
  status: 'active' | 'inactive' | 'pending'
  color: string
  tags: string[]
  lastPost: string
  profileImage: string
  isConnected: boolean
  accessToken?: string
}

export interface Post {
  id: number
  content: string
  images: string[]
  scheduledFor?: Date
  publishedAt?: Date
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  platforms: string[]
  accountIds: number[]
  engagement: {
    likes: number
    comments: number
    shares: number
    reach: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface OverviewStats {
  totalPosts: number
  totalReach: number
  totalEngagement: number
  activeAccounts: number
  scheduledPosts: number
  recentPosts: Post[]
  topPerformingPost?: Post
  engagementRate: number
  growthRate: number
}

export interface AnalyticsData {
  dateRange: string
  totalReach: number
  totalEngagement: number
  engagementRate: number
  platformBreakdown: {
    platform: string
    reach: number
    engagement: number
    posts: number
  }[]
  timeSeriesData: {
    date: string
    reach: number
    engagement: number
    posts: number
  }[]
  topPosts: Post[]
}

export interface CreatePostData {
  content: string
  images?: File[]
  scheduledFor?: Date
  accountIds: number[]
  platforms: string[]
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}