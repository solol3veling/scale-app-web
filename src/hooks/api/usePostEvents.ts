import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { PublishingEventResponse } from '@/types/api';

export function usePostEvents(postId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['post-events', postId],
    queryFn: async (): Promise<PublishingEventResponse[]> => {
      return api.posts.getPublishingEvents(postId);
    },
    enabled: enabled && !!postId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });
}

// Hook to fetch events for multiple posts
export function useMultiplePostEvents(postIds: string[], enabled: boolean = true) {
  // Ensure postIds is always an array and filter out undefined/null values
  const validPostIds = Array.isArray(postIds) ? postIds.filter(id => id && typeof id === 'string') : [];
  
  // Use a single query instead of mapping to avoid hooks order issues
  return useQuery({
    queryKey: ['post-events-multiple', validPostIds],
    queryFn: async (): Promise<Record<string, PublishingEventResponse[]>> => {
      if (validPostIds.length === 0) {
        return {};
      }
      
      const results = await Promise.allSettled(
        validPostIds.map(async (postId) => {
          try {
            const events = await api.posts.getPublishingEvents(postId);
            return { postId, events };
          } catch (error) {
            console.error(`Failed to fetch events for post ${postId}:`, error);
            return { postId, events: [] };
          }
        })
      );
      
      return results.reduce((acc, result) => {
        if (result.status === 'fulfilled' && result.value) {
          acc[result.value.postId] = result.value.events;
        }
        return acc;
      }, {} as Record<string, PublishingEventResponse[]>);
    },
    enabled: enabled && validPostIds.length > 0,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2
  });
}