import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Post, CreatePostData, PostStatus, GetPostsParams } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

// Query keys
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: any) => [...postKeys.all, 'list', filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.all, 'detail', id] as const,
  events: (id: string) => [...postKeys.all, 'events', id] as const,
  metrics: (id: string) => [...postKeys.all, 'metrics', id] as const,
};

/**
 * Hook to get posts with pagination
 */
export const usePosts = (params: Partial<GetPostsParams> = {}) => {
  const defaultParams: GetPostsParams = {
    pageable: { page: 0, size: 10 },
    ...params,
  };

  return useQuery({
    queryKey: postKeys.list(defaultParams),
    queryFn: () => api.posts.getAll(defaultParams),
    staleTime: 2 * 60 * 1000, // 2 minutes
    keepPreviousData: true,
  });
};

/**
 * Hook for infinite scroll posts
 */
export const useInfinitePosts = (params: Omit<GetPostsParams, 'pageable'> = {}) => {
  return useInfiniteQuery({
    queryKey: postKeys.list({ ...params, infinite: true }),
    queryFn: ({ pageParam = 0 }) =>
      api.posts.getAll({
        ...params,
        pageable: { page: pageParam, size: 10 },
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.page + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to get a specific post
 */
export const usePost = (id: string) => {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => api.posts.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to get publishing events for a post
 */
export const usePostEvents = (postId: string) => {
  return useQuery({
    queryKey: postKeys.events(postId),
    queryFn: () => api.posts.getPublishingEvents(postId),
    enabled: !!postId,
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Hook to get post metrics
 */
export const usePostMetrics = (postId: string) => {
  return useQuery({
    queryKey: postKeys.metrics(postId),
    queryFn: () => api.posts.getMetrics(postId),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a post with optimistic updates
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreatePostData) => api.posts.create(data),
    
    onMutate: async (newPost) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });

      // Create optimistic post
      const optimisticPost: Partial<Post> = {
        id: `temp-${Date.now()}`,
        content: newPost.content,
        media: newPost.media || [],
        status: newPost.scheduledFor ? PostStatus.SCHEDULED : PostStatus.PUBLISHED,
        scheduledFor: newPost.scheduledFor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'current-user',
        accounts: [],
      };

      // Optimistically update all post lists
      queryClient.setQueriesData(
        { queryKey: postKeys.lists() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            data: [optimisticPost, ...old.data],
            total: old.total + 1,
          };
        }
      );

      return { optimisticPost };
    },

    onError: (error: any, newPost, context) => {
      // Remove optimistic post
      if (context?.optimisticPost) {
        queryClient.setQueriesData(
          { queryKey: postKeys.lists() },
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.filter((post: Post) => post.id !== context.optimisticPost.id),
              total: old.total - 1,
            };
          }
        );
      }

      toast({
        title: "Failed to create post",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },

    onSuccess: (newPost) => {
      // Replace optimistic post with real post
      queryClient.setQueriesData(
        { queryKey: postKeys.lists() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((post: Post) =>
              post.id.toString().startsWith('temp-') ? newPost : post
            ),
          };
        }
      );

      // Invalidate to get fresh data
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      
      toast({
        title: "Post created",
        description: newPost.status === PostStatus.SCHEDULED 
          ? "Your post has been scheduled."
          : "Your post has been published.",
      });
    },
  });
};

/**
 * Hook to update a post
 */
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePostData> }) =>
      api.posts.update(id, data),
    
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: postKeys.detail(id) });
      
      const previousPost = queryClient.getQueryData(postKeys.detail(id));
      
      if (previousPost) {
        queryClient.setQueryData(postKeys.detail(id), {
          ...previousPost,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousPost };
    },

    onError: (error: any, { id }, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(id), context.previousPost);
      }

      toast({
        title: "Failed to update post",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },

    onSuccess: (updatedPost, { id }) => {
      queryClient.setQueryData(postKeys.detail(id), updatedPost);
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully.",
      });
    },
  });
};

/**
 * Hook to delete a post
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.posts.delete(id),
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });
      
      // Optimistically remove from all lists
      queryClient.setQueriesData(
        { queryKey: postKeys.lists() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((post: Post) => post.id !== id),
            total: Math.max(0, old.total - 1),
          };
        }
      );
    },

    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      
      toast({
        title: "Failed to delete post",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },

    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: postKeys.detail(id) });
      queryClient.removeQueries({ queryKey: postKeys.events(id) });
      queryClient.removeQueries({ queryKey: postKeys.metrics(id) });
      
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
    },
  });
};

/**
 * Hook to duplicate a post
 */
export const useDuplicatePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.posts.duplicate(id),
    
    onSuccess: (duplicatedPost) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      
      toast({
        title: "Post duplicated",
        description: "A copy of your post has been created.",
      });
    },

    onError: (error: any) => {
      toast({
        title: "Failed to duplicate post",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to schedule a post
 */
export const useSchedulePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, scheduledFor }: { id: string; scheduledFor: string }) =>
      api.posts.schedule(id, scheduledFor),
    
    onSuccess: (updatedPost, { id }) => {
      queryClient.setQueryData(postKeys.detail(id), updatedPost);
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      
      toast({
        title: "Post scheduled",
        description: `Your post has been scheduled for ${new Date(updatedPost.scheduledFor!).toLocaleString()}.`,
      });
    },

    onError: (error: any) => {
      toast({
        title: "Failed to schedule post",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to retry a failed publishing event
 */
export const useRetryPublishing = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (publishingEventId: string) => api.posts.retryPublishingEvent(publishingEventId),
    
    onSuccess: (_, publishingEventId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      
      toast({
        title: "Publishing retry initiated",
        description: "We're attempting to publish your post again.",
      });
    },

    onError: (error: any) => {
      toast({
        title: "Failed to retry publishing",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to get posts by status
 */
export const usePostsByStatus = (status: PostStatus) => {
  return usePosts({ status });
};

/**
 * Hook to get draft posts
 */
export const useDraftPosts = () => usePostsByStatus(PostStatus.DRAFT);

/**
 * Hook to get scheduled posts
 */
export const useScheduledPosts = () => usePostsByStatus(PostStatus.SCHEDULED);

/**
 * Hook to get published posts
 */
export const usePublishedPosts = () => usePostsByStatus(PostStatus.PUBLISHED);

/**
 * Hook to search posts
 */
export const useSearchPosts = (searchTerm: string) => {
  return usePosts({ 
    searchTerm,
    pageable: { page: 0, size: 20 }
  });
};