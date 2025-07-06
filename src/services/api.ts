// API service layer for backend communication
import { 
  SocialAccount, 
  Post, 
  OverviewStats, 
  AnalyticsData, 
  CreatePostData, 
  ApiResponse, 
  PaginatedResponse 
} from '@/types'

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api'

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        // Add auth token when available
        // 'Authorization': `Bearer ${getToken()}`,
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<T> = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'API request failed')
      }
      
      return result.data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Account management endpoints
  async getAccounts(): Promise<SocialAccount[]> {
    return this.request<SocialAccount[]>('/accounts')
  }

  async createAccount(accountData: Omit<SocialAccount, 'id'>): Promise<SocialAccount> {
    return this.request<SocialAccount>('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    })
  }

  async updateAccount(id: number, updates: Partial<SocialAccount>): Promise<SocialAccount> {
    return this.request<SocialAccount>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteAccount(id: number): Promise<void> {
    return this.request<void>(`/accounts/${id}`, {
      method: 'DELETE',
    })
  }

  // Posts endpoints
  async getPosts(page = 1, limit = 10): Promise<PaginatedResponse<Post>> {
    return this.request<PaginatedResponse<Post>>(`/posts?page=${page}&limit=${limit}`)
  }

  async getPost(id: number): Promise<Post> {
    return this.request<Post>(`/posts/${id}`)
  }

  async createPost(postData: CreatePostData): Promise<Post> {
    const formData = new FormData()
    formData.append('content', postData.content)
    formData.append('accountIds', JSON.stringify(postData.accountIds))
    formData.append('platforms', JSON.stringify(postData.platforms))
    
    if (postData.scheduledFor) {
      formData.append('scheduledFor', postData.scheduledFor.toISOString())
    }
    
    if (postData.images) {
      postData.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })
    }

    return this.request<Post>('/posts', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it for FormData
      },
    })
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post> {
    return this.request<Post>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deletePost(id: number): Promise<void> {
    return this.request<void>(`/posts/${id}`, {
      method: 'DELETE',
    })
  }

  async publishPost(id: number): Promise<Post> {
    return this.request<Post>(`/posts/${id}/publish`, {
      method: 'POST',
    })
  }

  // Analytics endpoints
  async getOverviewStats(): Promise<OverviewStats> {
    return this.request<OverviewStats>('/analytics/overview')
  }

  async getAnalytics(dateRange: string = '30d'): Promise<AnalyticsData> {
    return this.request<AnalyticsData>(`/analytics?range=${dateRange}`)
  }

  async getPostAnalytics(postId: number): Promise<Post> {
    return this.request<Post>(`/analytics/posts/${postId}`)
  }

  // Platform-specific endpoints
  async connectPlatform(platform: string, authCode: string): Promise<SocialAccount> {
    return this.request<SocialAccount>('/platforms/connect', {
      method: 'POST',
      body: JSON.stringify({ platform, authCode }),
    })
  }

  async disconnectPlatform(accountId: number): Promise<void> {
    return this.request<void>(`/platforms/${accountId}/disconnect`, {
      method: 'POST',
    })
  }

  // File upload endpoints
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('image', file)

    return this.request<{ url: string }>('/upload/image', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type for FormData
      },
    })
  }
}

export const api = new ApiService()