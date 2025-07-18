import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '@/services/api/billing';
import { UserBilling, UserPlan, PlanType, PlansResponse, UpgradeResponse, SubscriptionManagementResponse } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

// Query keys
export const userBillingKeys = {
    all: ['userBilling'] as const,
    current: () => [...userBillingKeys.all, 'current'] as const,
    plans: () => [...userBillingKeys.all, 'plans'] as const,
};

/**
 * Hook to get available billing plans
 */
export const useBillingPlans = () => {
    return useQuery({
        queryKey: userBillingKeys.plans(),
        queryFn: billingApi.getPlans,
        staleTime: 10 * 60 * 1000, // 10 minutes - plans change less frequently
        retry: 2,
    });
};

/**
 * Hook to get current user's plan (OpenAPI compliant)
 */
export const useCurrentUserPlan = () => {
    return useQuery({
        queryKey: userBillingKeys.current(),
        queryFn: billingApi.getCurrentPlan,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};

/**
 * Hook to get current user's billing information (legacy - kept for backward compatibility)
 */
export const useUserBilling = () => {
    return useQuery({
        queryKey: userBillingKeys.current(),
        queryFn: billingApi.getStatus,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};

/**
 * Hook to update payment method (OpenAPI compliant)
 */
export const useUpdatePaymentMethod = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: () => billingApi.updatePaymentMethod(),

        onSuccess: (data: any) => {
            if (data?.authorization_url) {
                toast({
                    title: "Redirecting to Payment",
                    description: "Redirecting to update your payment method...",
                });
                window.location.href = data.authorization_url;
            } else {
                queryClient.invalidateQueries({ queryKey: userBillingKeys.current() });
                toast({
                    title: "Payment Method Updated",
                    description: "Your payment method has been updated successfully.",
                });
            }
        },

        onError: (error: any) => {
            toast({
                title: "Update Failed",
                description: error.message || "Failed to update payment method.",
                variant: "destructive",
            });
        },
    });
};

/**
 * Hook to get subscription management URL
 */
export const useSubscriptionManagement = () => {
    const { toast } = useToast();

    return useMutation({
        mutationFn: () => billingApi.getSubscriptionManagementUrl(),

        onSuccess: (data: any) => {
            if (data?.management_url) {
                toast({
                    title: "Redirecting to Subscription Management",
                    description: "Redirecting to manage your subscription...",
                });
                window.location.href = data.management_url;
            }
        },

        onError: (error: any) => {
            toast({
                title: "Management Failed",
                description: error.message || "Failed to access subscription management.",
                variant: "destructive",
            });
        },
    });
};

/**
 * Hook to update user billing information (legacy - kept for backward compatibility)
 */
export const useUpdateUserBilling = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: { email: string }) =>
            billingApi.legacyUpdatePaymentMethod(data.email),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userBillingKeys.current() });
            toast({
                title: "Billing Updated",
                description: "Your billing information has been updated successfully.",
            });
        },

        onError: (error: any) => {
            toast({
                title: "Update Failed",
                description: error.message || "Failed to update billing information.",
                variant: "destructive",
            });
        },
    });
};

/**
 * Hook to upgrade to PRO plan (OpenAPI compliant)
 */
export const useUpgradeToPro = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: () => billingApi.upgradeToPro(),

        onSuccess: (data: any) => {
            console.log('Upgrade response data:', data);
            if (data?.data?.authorization_url) {
                toast({
                    title: "Redirecting to Payment",
                    description: "Redirecting to complete your payment...",
                });
                window.location.href = data.data.authorization_url;
            } else {
                queryClient.invalidateQueries({ queryKey: userBillingKeys.current() });
                toast({
                    title: "Plan Upgraded",
                    description: "Your subscription plan has been upgraded successfully.",
                });
            }
        },

        onError: (error: any) => {
            toast({
                title: "Upgrade Failed",
                description: error.message || "Failed to upgrade plan.",
                variant: "destructive",
            });
        },
    });
};

/**
 * Hook to upgrade subscription plan (legacy - kept for backward compatibility)
 */
export const useUpgradePlan = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: () => billingApi.upgradePlan(),

        onSuccess: (data) => {
            console.log('Legacy upgrade response data:', data);
            if (data?.data?.authorization_url) {
                toast({
                    title: "Redirecting to Payment",
                    description: "Redirecting to complete your payment...",
                });
                window.location.href = data.data.authorization_url;
            } else {
                queryClient.invalidateQueries({ queryKey: userBillingKeys.current() });
                toast({
                    title: "Plan Upgraded",
                    description: "Your subscription plan has been upgraded successfully.",
                });
            }
        },

        onError: (error: any) => {
            toast({
                title: "Upgrade Failed",
                description: error.message || "Failed to upgrade plan.",
                variant: "destructive",
            });
        },
    });
};

/**
 * Hook to cancel subscription
 */
export const useCancelSubscription = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: billingApi.cancelSubscription,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userBillingKeys.current() });
            toast({
                title: "Subscription Cancelled",
                description: "Your subscription has been cancelled.",
            });
        },

        onError: (error: any) => {
            toast({
                title: "Cancellation Failed",
                description: error.message || "Failed to cancel subscription.",
                variant: "destructive",
            });
        },
    });
};

/**
 * Hook to resubscribe to service
 */
export const useResubscribe = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: billingApi.resubscribe,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userBillingKeys.current() });
            toast({
                title: "Resubscribed Successfully",
                description: "You have been resubscribed to the service.",
            });
        },

        onError: (error: any) => {
            toast({
                title: "Resubscription Failed",
                description: error.message || "Failed to resubscribe.",
                variant: "destructive",
            });
        },
    });
};
