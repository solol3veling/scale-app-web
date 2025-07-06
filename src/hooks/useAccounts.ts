import { useState, useEffect } from 'react'

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
}

// This will be replaced with actual API calls
const mockAccounts: SocialAccount[] = [
  {
    id: 1,
    platform: "Instagram",
    handle: "@mycompany",
    displayName: "My Company",
    followers: "2.1K",
    status: "active",
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    tags: ["Business", "Main"],
    lastPost: "2h ago",
    profileImage: "/placeholder-ig.jpg"
  },
  {
    id: 2,
    platform: "Twitter",
    handle: "@mycompany",
    displayName: "My Company",
    followers: "1.8K",
    status: "active",
    color: "bg-twitter",
    tags: ["Business", "Updates"],
    lastPost: "5h ago",
    profileImage: "/placeholder-twitter.jpg"
  },
  {
    id: 3,
    platform: "Facebook",
    handle: "mycompany",
    displayName: "My Company Page",
    followers: "3.2K",
    status: "inactive",
    color: "bg-facebook",
    tags: ["Business"],
    lastPost: "2d ago",
    profileImage: "/placeholder-fb.jpg"
  },
  {
    id: 4,
    platform: "LinkedIn",
    handle: "my-company",
    displayName: "My Company",
    followers: "945",
    status: "active",
    color: "bg-linkedin",
    tags: ["Professional", "B2B"],
    lastPost: "1d ago",
    profileImage: "/placeholder-linkedin.jpg"
  },
  {
    id: 5,
    platform: "Pinterest",
    handle: "@mycompany",
    displayName: "My Company",
    followers: "567",
    status: "active",
    color: "bg-pinterest",
    tags: ["Visual", "Marketing"],
    lastPost: "3d ago",
    profileImage: "/placeholder-pinterest.jpg"
  },
  {
    id: 6,
    platform: "TikTok",
    handle: "@mycompany",
    displayName: "My Company",
    followers: "1.2K",
    status: "pending",
    color: "bg-tiktok",
    tags: ["Video", "Creative"],
    lastPost: "1w ago",
    profileImage: "/placeholder-tiktok.jpg"
  }
]

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simulate API call
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true)
        // Replace with: const response = await api.get('/accounts')
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
        setAccounts(mockAccounts)
      } catch (err) {
        setError('Failed to fetch accounts')
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  const addAccount = async (accountData: Omit<SocialAccount, 'id'>) => {
    try {
      // Replace with: await api.post('/accounts', accountData)
      const newAccount = { ...accountData, id: Date.now() }
      setAccounts(prev => [...prev, newAccount])
      return newAccount
    } catch (err) {
      setError('Failed to add account')
      throw err
    }
  }

  const updateAccount = async (id: number, updates: Partial<SocialAccount>) => {
    try {
      // Replace with: await api.put(`/accounts/${id}`, updates)
      setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...updates } : acc))
    } catch (err) {
      setError('Failed to update account')
      throw err
    }
  }

  const deleteAccount = async (id: number) => {
    try {
      // Replace with: await api.delete(`/accounts/${id}`)
      setAccounts(prev => prev.filter(acc => acc.id !== id))
    } catch (err) {
      setError('Failed to delete account')
      throw err
    }
  }

  return {
    accounts,
    loading,
    error,
    addAccount,
    updateAccount,
    deleteAccount,
    refetch: () => {
      // Implement refetch logic
    }
  }
}
