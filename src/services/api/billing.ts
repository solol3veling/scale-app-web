import { apiClient, makeApiCall, makeCriticalApiCall } from './base';
import {
    UserBilling,
    UserBillingResponse,
    UserPlan,
    UserPlanResponse,
    PlanType,
    PlansResponse,
    UpgradeResponse,
    SubscriptionManagementResponse,
    AuthInit,
    ApiResponse,
} from '@/types/api';

export const billingApi = {
    /**
     * Get available billing plans (OpenAPI compliant)
     */
    getPlans: async (): Promise<PlansResponse> => {
        const response = await makeApiCall<ApiResponse<PlansResponse['data']>>(
            () => apiClient.get('/api/v1/billing/plans')
        );
        return { data: response.data };
    },

    /**
     * Get current user's plan (OpenAPI compliant)
     */
    getCurrentPlan: async (): Promise<UserPlan> => {
        const response = await makeApiCall<ApiResponse<UserPlan>>(
            () => apiClient.get('/api/v1/billing/plan')
        );
        return response.data;
    },

    /**
     * Get user billing plan (legacy method - kept for backward compatibility)
     */
    getStatus: async (): Promise<UserBilling> => {
        const response = await makeApiCall<UserBillingResponse>(
            () => apiClient.get('/api/v1/billing/plan')
        );
        return response.data;
    },

    /**
     * Upgrade to PRO plan (OpenAPI compliant)
     */
    upgradeToPro: async (): Promise<UpgradeResponse> => {
        const response = await makeCriticalApiCall<ApiResponse<UpgradeResponse>>(
            () => apiClient.post('/api/v1/billing/upgrade')
        );
        console.log('Raw API response:', response);
        console.log('Extracted data:', response.data);
        return response.data;
    },

    /**
     * Upgrade user plan (legacy method - kept for backward compatibility)
     */
    upgradePlan: async (): Promise<AuthInit> => {
        const response = await makeCriticalApiCall<{ authorization_url: string; message: string }>(
            () => apiClient.post('/api/v1/billing/upgrade')
        );
        console.log('Legacy upgrade raw response:', response);
        return response;
    },

    /**
     * Cancel subscription (OpenAPI compliant)
     */
    cancelSubscription: async (): Promise<UserPlan> => {
        const response = await makeCriticalApiCall<ApiResponse<UserPlan>>(
            () => apiClient.post('/api/v1/billing/cancel')
        );
        return response.data;
    },

    /**
     * Resubscribe to service
     */
    resubscribe: async (): Promise<string> => {
        return makeCriticalApiCall<string>(
            () => apiClient.post('/api/v1/billing/resubscribe')
        );
    },

    /**
     * Get billing history
     */
    getHistory: async (): Promise<any> => {
        return makeApiCall(
            () => apiClient.get('/api/billing/history')
        );
    },

    /**
     * Update payment method (OpenAPI compliant)
     */
    updatePaymentMethod: async (): Promise<UpgradeResponse> => {
        const response = await makeCriticalApiCall<ApiResponse<UpgradeResponse>>(
            () => apiClient.post('/api/v1/billing/update-payment-method')
        );
        return response.data;
    },

    /**
     * Get subscription management URL (OpenAPI compliant)
     */
    getSubscriptionManagementUrl: async (): Promise<SubscriptionManagementResponse> => {
        const response = await makeApiCall<ApiResponse<SubscriptionManagementResponse>>(
            () => apiClient.get('/api/v1/billing/subscription-management')
        );
        return response.data;
    },

    /**
     * Legacy update payment method (kept for backward compatibility)
     */
    legacyUpdatePaymentMethod: async (paymentMethodId: string): Promise<any> => {
        return makeCriticalApiCall(
            () => apiClient.put('/api/billing/payment-method', {
                paymentMethodId
            })
        );
    },

    /**
     * Get current usage
     */
    getUsage: async (): Promise<any> => {
        return makeApiCall(
            () => apiClient.get('/api/billing/usage')
        );
    },

    /**
     * Get invoices
     */
    getInvoices: async (): Promise<any> => {
        return makeApiCall(
            () => apiClient.get('/api/billing/invoices')
        );
    },

    /**
     * Download invoice
     */
    downloadInvoice: async (invoiceId: string): Promise<Blob> => {
        const response = await makeApiCall(
            () => apiClient.get(`/api/billing/invoices/${invoiceId}/download`, {
                responseType: 'blob'
            })
        );
        return response;
    },
};
