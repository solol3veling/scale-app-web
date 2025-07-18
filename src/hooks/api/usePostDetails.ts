import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Post, PublishingEventResponse, ExtendPostRequest } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

// Query keys for React Query
export const postDetailsKeys = {
  all: ['postDetails'] as const,
  post: (id: string) => [...postDetailsKeys.all, 'post', id] as const,
  events: (postId: string) => [...postDetailsKeys.all, 'events', postId] as const,
  event: (eventId: string) => [...postDetailsKeys.all, 'event', eventId] as const,
};

/**
 * Hook to get a specific post by ID
 */
export const usePost = (postId: string) => {
  return useQuery({
    queryKey: postDetailsKeys.post(postId),
    queryFn: () => api.posts.getById(postId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!postId,
  });
};

/**
 * Hook to get publishing events for a post
 */
export const usePostEvents = (postId: string) => {
  return useQuery({
    queryKey: postDetailsKeys.events(postId),
    queryFn: () => api.posts.getPublishingEvents(postId),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // 30 seconds
    enabled: !!postId,
  });
};

/**
 * Hook to retry a failed publishing event
 */
export const useRetryEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (publishingEventId: string) => api.posts.retryPublishingEvent(publishingEventId),
    onSuccess: (data, publishingEventId) => {
      // Refresh the events list
      queryClient.invalidateQueries({ queryKey: postDetailsKeys.all });
      
      toast({
        title: "Retry initiated",
        description: "The publishing event has been queued for retry.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Retry failed",
        description: error.message || "Failed to retry the publishing event.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to extend a post to more accounts
 */
export const useExtendPost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: ExtendPostRequest }) => 
      api.posts.extend(postId, data),
    onSuccess: (data, { postId }) => {
      // Refresh the post and events
      queryClient.invalidateQueries({ queryKey: postDetailsKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: postDetailsKeys.events(postId) });
      
      toast({
        title: "Post extended",
        description: "The post has been extended to additional accounts.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to extend post",
        description: error.message || "Could not extend the post to additional accounts.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to get all post details and events at once
 */
export const usePostDetailsData = (postId: string) => {
  const post = usePost(postId);
  const events = usePostEvents(postId);

  return {
    post,
    events,
    isLoading: post.isLoading || events.isLoading,
    isError: post.isError || events.isError,
    refetch: () => {
      post.refetch();
      events.refetch();
    },
  };
};