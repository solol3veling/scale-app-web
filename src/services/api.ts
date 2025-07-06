// API service layer for backend communication
// This will be connected to your backend API

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api'

interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Account management endpoints
  async getAccounts() {
    return this.request('/accounts')
  }

  async createAccount(accountData: any) {
    return this.request('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    })
  }

  async updateAccount(id: number, updates: any) {
    return this.request(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteAccount(id: number) {
    return this.request(`/accounts/${id}`, {
      method: 'DELETE',
    })
  }

  // Posts endpoints
  async createPost(postData: any) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    })
  }

  async getPosts() {
    return this.request('/posts')
  }

  async getAnalytics(dateRange?: string) {
    const params = dateRange ? `?range=${dateRange}` : ''
    return this.request(`/analytics${params}`)
  }
}

export const api = new ApiService()