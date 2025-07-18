import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { postApi } from '@/services/api'
import { Post, CreatePostData, PaginatedResponse, PostStatus, GetPostsParams } from '@/types/api'
import { useToast } from '@/hooks/use-toast'

// Mock data for development
const mockPosts: Post[] = [
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
    scheduledFor: new Date('2024-01-20T14:00:00Z'),
    status: 'scheduled',
    platforms: ['Instagram', 'Pinterest'],
    accountIds: [1, 5],
    engagement: { likes: 0, comments: 0, shares: 0, reach: 0 },
    createdAt: new Date('2024-01-14T14:00:00Z'),
    updatedAt: new Date('2024-01-14T14:00:00Z')
  },
  {
    id: 3,
    content: "Weekly team update - great progress on our Q1 goals! 💪",
    images: [],
    status: 'draft',
    platforms: ['LinkedIn', 'Twitter'],
    accountIds: [4, 2],
    engagement: { likes: 0, comments: 0, shares: 0, reach: 0 },
    createdAt: new Date('2024-01-13T11:30:00Z'),
    updatedAt: new Date('2024-01-13T11:30:00Z')
  }
]

export const usePosts = (page = 1, limit = 10, searchTerm?: string, status?: PostStatus) => {
  return useQuery({
    queryKey: ['posts', page, limit, searchTerm, status],
    queryFn: async (): Promise<PaginatedResponse<Post>> => {
      try {
        const params: GetPostsParams = {
          searchTerm,
          status,
          pageable: {
            page: page - 1, // API uses 0-based indexing
            size: limit
          }
        }
        const response = await postApi.getAllPosts(params)
        return response
      } catch (error) {
        console.error('Failed to fetch posts:', error)
        // Fallback to mock data during development
        await new Promise(resolve => setTimeout(resolve, 600))
        
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedPosts = mockPosts.slice(startIndex, endIndex)
        
        return {
          data: paginatedPosts,
          total: mockPosts.length,
          page,
          limit,
          hasNext: endIndex < mockPosts.length,
          hasPrev: page > 1
        }
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const usePost = (id: string) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      try {
        const response = await postApi.getPostById(id)
        return response.data
      } catch (error) {
        console.error(`Failed to fetch post ${id}:`, error)
        // Fallback to mock data during development
        await new Promise(resolve => setTimeout(resolve, 300))
        return mockPosts.find(post => post.id.toString() === id) || null
      }
    },
    enabled: !!id,
  })
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (postData: CreatePostData): Promise<Post> => {
      try {
        const response = await postApi.createPost(postData)
        return response.data
      } catch (error) {
        // Fallback for development
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const newPost: any = {
          id: Date.now().toString(),
          content: postData.content,
          media: postData.media || [],
          scheduledFor: postData.scheduledFor,
          status: postData.scheduledFor ? PostStatus.SCHEDULED : PostStatus.PUBLISHED,
          accounts: [],
          engagement: { likes: 0, comments: 0, shares: 0, reach: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: postData.scheduledFor ? undefined : new Date().toISOString(),
          userId: 'current-user'
        }
        
        return newPost
      }
    },
    onSuccess: (newPost) => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      
      toast({
        title: "Post created successfully!",
        description: newPost.status === 'scheduled' 
          ? "Your post has been scheduled." 
          : "Your post has been published.",
      })
    },
    onError: (error) => {
      console.error('Failed to create post:', error)
      toast({
        title: "Failed to create post",
        description: "Please try again later.",
        variant: "destructive",
      })
    },
  })
}

export const useUpdatePost = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Post> }) => {
      // Replace with actual API call when backend is ready
      // return await api.updatePost(id, updates)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      return { id, ...updates }
    },
    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', updatedPost.id] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      
      toast({
        title: "Post updated successfully!",
      })
    },
    onError: (error) => {
      console.error('Failed to update post:', error)
      toast({
        title: "Failed to update post",
        description: "Please try again later.",
        variant: "destructive",
      })
    },
  })
}

export const useDeletePost = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: number) => {
      // Replace with actual API call when backend is ready
      // return await api.deletePost(id)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['overview'] })
      
      toast({
        title: "Post deleted successfully!",
      })
    },
    onError: (error) => {
      console.error('Failed to delete post:', error)
      toast({
        title: "Failed to delete post",
        description: "Please try again later.",
        variant: "destructive",
      })
    },
  })
}