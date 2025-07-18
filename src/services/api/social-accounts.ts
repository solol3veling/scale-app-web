import { apiClient, makeApiCall, buildApiUrl, buildQueryParams } from './base';
import {
  ApiResponseSocialAccount,
  ApiResponseListSocialAccount,
  ApiResponseVoid,
  ApiResponseObject,
  UpdateSocialAccountRequest,
  SocialAccount,
  AccountSummary,
  PaginatedResponseSocialAccount,
  GetSocialAccountsParams,
} from '@/types/api';

export const socialAccountsApi = {
  /**
   * Get all social accounts for the current user (legacy method for non-paginated use)
   */
  getAll: async (): Promise<SocialAccount[]> => {
    const response = await makeApiCall<ApiResponseListSocialAccount>(
      () => apiClient.get(buildApiUrl('/socials'))
    );
    return response.data;
  },

  /**
   * Get paginated social accounts with search and filter support
   */
  getPaginated: async (params: GetSocialAccountsParams): Promise<PaginatedResponseSocialAccount> => {
    const queryParams = {
      searchTerm: params.searchTerm,
      status: params.status,
      platform: params.platform,
      page: params.pageable.page,
      size: params.pageable.size,
      sort: params.pageable.sort?.join(','),
    };

    // Remove undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, value]) => value !== undefined)
    );

    const queryString = buildQueryParams(cleanParams);
    
    return makeApiCall<PaginatedResponseSocialAccount>(
      () => apiClient.get(buildApiUrl(`/socials?${queryString}`))
    );
  },

  /**
   * Get a specific social account by ID
   */
  getById: async (id: string): Promise<SocialAccount> => {
    const response = await makeApiCall<ApiResponseSocialAccount>(
      () => apiClient.get(buildApiUrl(`/socials/${id}`))
    );
    return response.data;
  },

  /**
   * Update a social account
   */
  update: async (id: string, data: UpdateSocialAccountRequest): Promise<SocialAccount> => {
    const response = await makeApiCall<ApiResponseSocialAccount>(
      () => apiClient.put(buildApiUrl(`/socials/${id}`), data)
    );
    return response.data;
  },

  /**
   * Delete a social account
   */
  delete: async (id: string): Promise<void> => {
    await makeApiCall<ApiResponseVoid>(
      () => apiClient.delete(buildApiUrl(`/socials/${id}`))
    );
  },

  /**
   * Reconnect a social account (retry connection)
   */
  reconnect: async (id: string): Promise<SocialAccount> => {
    const response = await makeApiCall<ApiResponseSocialAccount>(
      () => apiClient.post(buildApiUrl(`/socials/${id}/reconnect`))
    );
    return response.data;
  },

  /**
   * Test connection for a social account
   */
  testConnection: async (id: string): Promise<boolean> => {
    try {
      await makeApiCall(
        () => apiClient.get(buildApiUrl(`/socials/${id}/test`))
      );
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get account summary statistics
   */
  getSummary: async (): Promise<AccountSummary> => {
    const response = await makeApiCall<ApiResponseObject>(
      () => apiClient.get(buildApiUrl('/socials/account-summary'))
    );
    return response.data as AccountSummary;
  },
};