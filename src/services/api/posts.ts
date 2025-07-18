import { apiClient, makeApiCall, buildApiUrl, buildQueryParams } from './base';
import {
  ApiResponsePost,
  ApiResponseListPublishingEventResponse,
  ApiResponsePublishingEventResponse,
  ApiResponseObject,
  PaginatedResponsePost,
  CreatePostData,
  ExtendPostRequest,
  GetPostsParams,
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
   * Delete a post
   */
  delete: async (id: string): Promise<void> => {
    await makeApiCall(
      () => apiClient.delete(buildApiUrl(`/post/${id}`))
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
  schedule: async (id: string, scheduledFor: string): Promise<Post> => {
    const response = await makeApiCall<ApiResponsePost>(
      () => apiClient.post(buildApiUrl(`/post/${id}/schedule`), { scheduledFor })
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
};