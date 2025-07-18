import { apiClient, makeApiCall, buildApiUrl } from './base';
import {
  UserBilling,
  UpdateUserBillingRequest,
} from '@/types/api';

export const userBillingApi = {
  /**
   * Get current user's billing status
   */
  getBillingStatus: async (): Promise<UserBilling> => {
    return makeApiCall<UserBilling>(
      () => apiClient.get(buildApiUrl('/billing/status'))
    );
  },

  /**
   * Update user billing information (if endpoint exists)
   */
  updateBilling: async (data: UpdateUserBillingRequest): Promise<UserBilling> => {
    return makeApiCall<UserBilling>(
      () => apiClient.put(buildApiUrl('/billing'), data)
    );
  },

  /**
   * Upgrade subscription plan
   */
  upgradePlan: async (planType: string): Promise<string> => {
    return makeApiCall<string>(
      () => apiClient.post(buildApiUrl(`/billing/upgrade?planType=${planType}`))
    );
  },

  /**
   * Cancel subscription (if endpoint exists)
   */
  cancelSubscription: async (): Promise<void> => {
    await makeApiCall<void>(
      () => apiClient.post(buildApiUrl('/billing/cancel'))
    );
  },
};