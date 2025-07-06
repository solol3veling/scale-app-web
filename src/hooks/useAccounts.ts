import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { SocialAccount } from '@/types'
import { useToast } from '@/hooks/use-toast'

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
    profileImage: "/placeholder-ig.jpg",
    isConnected: true
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
    profileImage: "/placeholder-twitter.jpg",
    isConnected: true
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
    profileImage: "/placeholder-fb.jpg",
    isConnected: true
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
    profileImage: "/placeholder-linkedin.jpg",
    isConnected: true
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
    profileImage: "/placeholder-pinterest.jpg",
    isConnected: true
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
    profileImage: "/placeholder-tiktok.jpg",
    isConnected: false
  }
]

export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      try {
        // Replace with actual API call when backend is ready
        // return await api.getAccounts()
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800))
        return mockAccounts
      } catch (error) {
        console.error('Failed to fetch accounts:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateAccount = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (accountData: Omit<SocialAccount, 'id'>) => {
      // Replace with actual API call when backend is ready
      // return await api.createAccount(accountData)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { ...accountData, id: Date.now() }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      toast({
        title: "Account connected successfully!",
        description: "Your social media account has been added.",
      })
    },
    onError: (error) => {
      console.error('Failed to create account:', error)
      toast({
        title: "Failed to connect account",
        description: "Please try again later.",
        variant: "destructive",
      })
    },
  })
}

export const useUpdateAccount = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<SocialAccount> }) => {
      // Replace with actual API call when backend is ready
      // return await api.updateAccount(id, updates)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      return { id, ...updates }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      toast({
        title: "Account updated successfully!",
      })
    },
    onError: (error) => {
      console.error('Failed to update account:', error)
      toast({
        title: "Failed to update account",
        description: "Please try again later.",
        variant: "destructive",
      })
    },
  })
}

export const useDeleteAccount = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: number) => {
      // Replace with actual API call when backend is ready
      // return await api.deleteAccount(id)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      toast({
        title: "Account removed successfully!",
      })
    },
    onError: (error) => {
      console.error('Failed to delete account:', error)
      toast({
        title: "Failed to remove account",
        description: "Please try again later.",
        variant: "destructive",
      })
    },
  })
}
