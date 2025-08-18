import { apiClient, makeApiCall, buildApiUrl, buildQueryParams } from './base';
import {
  OAuthInitParams,
  OAuthInitResponse,
  OAuthCallbackParams,
} from '@/types/api';

export const oauthApi = {
  /**
   * Initialize OAuth flow for a platform
   */
  initialize: async (params: OAuthInitParams): Promise<OAuthInitResponse> => {
    const queryString = buildQueryParams(params);
    
    const response = await makeApiCall<OAuthInitResponse>(
      () => apiClient.post(buildApiUrl(`/oauth1/initialize?${queryString}`))
    );

    // Set the oauth1_state as a cookie for the popup to access
    if (response.oauth1_state) {
      document.cookie = `oauth1_state=${response.oauth1_state}; path=/; SameSite=Lax`;
    }

    return response;
  },

  /**
   * Complete OAuth flow
   */
  complete: async (params: OAuthCallbackParams): Promise<string> => {
    const queryString = buildQueryParams({
      oauth_verifier: params.oauth_verifier
    });
    
    const config = params.oauth_request_token ? {
      headers: {
        Cookie: `oauth_request_token=${params.oauth_request_token}`
      }
    } : {};
    
    return makeApiCall<string>(
      () => apiClient.get(buildApiUrl(`/oauth1/callback?${queryString}`), config)
    );
  },

  /**
   * Complete OAuth flow and get JSON response
   */
  completeJson: async (params: OAuthCallbackParams): Promise<Record<string, string>> => {
    const queryString = buildQueryParams({
      oauth_verifier: params.oauth_verifier
    });
    
    const config = params.oauth_request_token ? {
      headers: {
        Cookie: `oauth_request_token=${params.oauth_request_token}`
      }
    } : {};
    
    return makeApiCall<Record<string, string>>(
      () => apiClient.get(buildApiUrl(`/oauth1/callback/json?${queryString}`), config)
    );
  },

  /**
   * Initialize OAuth2 flow
   */
  initializeOAuth2: async (platform: string, account: string, redirectUri: string): Promise<Record<string, string>> => {
    const queryString = buildQueryParams({
      platform,
      account,
      redirectUri
    });
    
    return makeApiCall<Record<string, string>>(
      () => apiClient.post(buildApiUrl(`/oauth2/initialize?${queryString}`))
    );
  },

  /**
   * Complete OAuth2 flow
   */
  completeOAuth2: async (platform: string, code: string, state?: string): Promise<any> => {
    return makeApiCall(
      () => apiClient.post(buildApiUrl('/oauth2/callback'), {
        platform,
        code,
        state
      })
    );
  },

  /**
   * Refresh OAuth token
   */
  refreshToken: async (accountId: string): Promise<any> => {
    return makeApiCall(
      () => apiClient.post(buildApiUrl(`/oauth/refresh/${accountId}`))
    );
  },

  /**
   * Revoke OAuth token
   */
  revokeToken: async (accountId: string): Promise<void> => {
    await makeApiCall(
      () => apiClient.post(buildApiUrl(`/oauth/revoke/${accountId}`))
    );
  },

  /**
   * Get OAuth status for an account
   */
  getStatus: async (accountId: string): Promise<any> => {
    return makeApiCall(
      () => apiClient.get(buildApiUrl(`/oauth/status/${accountId}`))
    );
  },

};