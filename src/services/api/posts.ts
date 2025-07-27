import { apiClient, makeApiCall, buildApiUrl, buildQueryParams } from './base';
import {
  ApiResponsePost,
  ApiResponseListPublishingEventResponse,
  ApiResponsePublishingEventResponse,
  ApiResponseObject,
  ApiResponseCalendarPosts,
  PaginatedResponsePost,
  CreatePostData,
  ExtendPostRequest,
  GetPostsParams,
  CalendarPostsParams,
  Post,
  PublishingEventResponse,
} from '@/types/api';

export const postsApi = {
  /**
   * Create a new post
   */
  create: async (data: CreatePostData): Promise<Post> => {
    const response = await makeApiCall<ApiResponsePost>(
      () => apiClient.post(buildApiUrl('/post'), data)
    );
    return response.data;
  },

  /**
   * Get all posts with filtering and pagination
   */
  getAll: async (params: GetPostsParams): Promise<PaginatedResponsePost> => {
    const queryString = buildQueryParams({
      searchTerm: params.searchTerm,
      status: params.status,
      page: params.pageable.page,
      size: params.pageable.size,
      sort: params.pageable.sort,
    });
    
    return makeApiCall<PaginatedResponsePost>(
      () => apiClient.get(buildApiUrl(`/posts?${queryString}`))
    );
  },

  /**
   * Get a specific post by ID
   */
  getById: async (id: string): Promise<Post> => {
    const response = await makeApiCall<ApiResponsePost>(
      () => apiClient.get(buildApiUrl(`/post/${id}`))
    );
    return response.data;
  },

  /**
   * Update a post
   */
  update: async (id: string, data: Partial<CreatePostData>): Promise<Post> => {
    const response = await makeApiCall<ApiResponsePost>(
      () => apiClient.put(buildApiUrl(`/post/${id}`), data)
    );
    return response.data;
  },

  /**
   * Delete a single post
   */
  delete: async (id: string): Promise<void> => {
    await makeApiCall(
      () => apiClient.delete(buildApiUrl(`/post/${id}`))
    );
  },

  /**
   * Delete multiple posts
   */
  deleteMultiple: async (postIds: string[]): Promise<void> => {
    await makeApiCall(
      () => apiClient.delete(buildApiUrl('/posts'), {
        data: { postIds }
      })
    );
  },

  /**
   * Delete publishing events for a post
   */
  deletePostEvents: async (postId: string, eventIds: string[]): Promise<void> => {
    await makeApiCall(
      () => apiClient.delete(buildApiUrl(`/post/${postId}/events`), {
        data: { eventIds }
      })
    );
  },

  /**
   * Delete a specific publishing event
   */
  deleteEvent: async (eventId: string): Promise<void> => {
    await makeApiCall(
      () => apiClient.delete(buildApiUrl(`/post/event/${eventId}`))
    );
  },

  /**
   * Extend post to additional social accounts
   */
  extend: async (id: string, data: ExtendPostRequest): Promise<any> => {
    const response = await makeApiCall<ApiResponseObject>(
      () => apiClient.post(buildApiUrl(`/post/${id}/extend`), data)
    );
    return response.data;
  },

  /**
   * Get publishing events for a post
   */
  getPublishingEvents: async (postId: string): Promise<PublishingEventResponse[]> => {
    const response = await makeApiCall<ApiResponseListPublishingEventResponse>(
      () => apiClient.get(buildApiUrl(`/post/${postId}/events`))
    );
    return response.data;
  },

  /**
   * Get a specific publishing event
   */
  getPublishingEvent: async (publishingEventId: string): Promise<PublishingEventResponse> => {
    const response = await makeApiCall<ApiResponsePublishingEventResponse>(
      () => apiClient.get(buildApiUrl(`/post/event/${publishingEventId}`))
    );
    return response.data;
  },

  /**
   * Retry a failed publishing event
   */
  retryPublishingEvent: async (publishingEventId: string): Promise<any> => {
    const response = await makeApiCall<ApiResponseObject>(
      () => apiClient.post(buildApiUrl(`/post/retry/${publishingEventId}`))
    );
    return response.data;
  },

  /**
   * Schedule a post for publishing
   */
  schedule: async (id: string, scheduledFor: string, accountIds?: string[]): Promise<Post> => {
    const payload: { scheduledFor: string; accountIds?: string[] } = { scheduledFor };
    if (accountIds) {
      payload.accountIds = accountIds;
    }
    
    const response = await makeApiCall<ApiResponsePost>(
      () => apiClient.put(buildApiUrl(`/post/${id}/schedule`), payload)
    );
    return response.data;
  },

  /**
   * Cancel a scheduled post
   */
  cancelSchedule: async (id: string): Promise<Post> => {
    const response = await makeApiCall<ApiResponsePost>(
      () => apiClient.post(buildApiUrl(`/post/${id}/cancel-schedule`))
    );
    return response.data;
  },

  /**
   * Duplicate a post
   */
  duplicate: async (id: string): Promise<Post> => {
    const response = await makeApiCall<ApiResponsePost>(
      () => apiClient.post(buildApiUrl(`/post/${id}/duplicate`))
    );
    return response.data;
  },

  /**
   * Get post performance metrics
   */
  getMetrics: async (id: string): Promise<any> => {
    const response = await makeApiCall<ApiResponseObject>(
      () => apiClient.get(buildApiUrl(`/post/${id}/metrics`))
    );
    return response.data;
  },

  /**
   * Get posts for calendar view
   */
  getCalendarPosts: async (params: CalendarPostsParams): Promise<Post[]> => {
    const queryParams: Record<string, string> = {
      startDate: params.startDate,
      endDate: params.endDate,
    };
    
    // Only include dateType if it's specified (omit for "All" filter)
    if (params.dateType) {
      queryParams.dateType = params.dateType;
    }
    
    const queryString = buildQueryParams(queryParams);
    
    const response = await makeApiCall<ApiResponseCalendarPosts>(
      () => apiClient.get(buildApiUrl(`/posts/calendar?${queryString}`))
    );
    return response.data;
  },
};