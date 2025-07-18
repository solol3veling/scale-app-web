// Re-export from API types for backward compatibility
export * from './api'

// Legacy types for backward compatibility - these maintain the old structure
// while the new API types follow the OpenAPI schema

export interface LegacySocialAccount {
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

export interface LegacyPost {
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

export interface LegacyCreatePostData {
  content: string
  images?: File[]
  scheduledFor?: Date
  accountIds: number[]
  platforms: string[]
}