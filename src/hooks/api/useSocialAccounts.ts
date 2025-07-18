import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { socialAccountsApi } from '@/services/api/social-accounts';
import { 
  SocialAccount, 
  UpdateSocialAccountRequest, 
  GetSocialAccountsParams,
  PaginatedResponseSocialAccount 
} from '@/types/api';
import { useToast } from '@/hooks/use-toast';

// Query keys
export const socialAccountKeys = {
  all: ['socialAccounts'] as const,
  lists: () => [...socialAccountKeys.all, 'list'] as const,
  list: (filters: string) => [...socialAccountKeys.all, 'list', { filters }] as const,
  paginated: (params: GetSocialAccountsParams) => [...socialAccountKeys.all, 'paginated', params] as const,
  details: () => [...socialAccountKeys.all, 'detail'] as const,
  detail: (id: string) => [...socialAccountKeys.all, 'detail', id] as const,
  connection: (id: string) => [...socialAccountKeys.all, 'connection', id] as const,
};

/**
 * Hook to get all social accounts
 */
export const useSocialAccounts = () => {
  return useQuery({
    queryKey: socialAccountKeys.lists(),
    queryFn: () => api.socialAccounts.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to get paginated social accounts with search and filter support
 */
export const useSocialAccountsPaginated = (params: GetSocialAccountsParams) => {
  return useQuery({
    queryKey: socialAccountKeys.paginated(params),
    queryFn: () => socialAccountsApi.getPaginated(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    keepPreviousData: true, // Keep previous data while loading new page
  });
};

/**
 * Hook to get a specific social account
 */
export const useSocialAccount = (id: string) => {
  return useQuery({
    queryKey: socialAccountKeys.detail(id),
    queryFn: () => api.socialAccounts.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to test account connection
 */
export const useSocialAccountConnection = (id: string) => {
  return useQuery({
    queryKey: socialAccountKeys.connection(id),
    queryFn: () => api.socialAccounts.testConnection(id),
    enabled: !!id,
    retry: 1,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to create a social account
 */
export const useCreateSocialAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<SocialAccount, 'id' | 'createdAt' | 'updatedAt'>) => 
      api.socialAccounts.create(data),
    
    onMutate: async (newAccount) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: socialAccountKeys.lists() });

      // Create optimistic account
      const optimisticAccount: SocialAccount = {
        ...newAccount,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update accounts list
      queryClient.setQueryData(
        socialAccountKeys.lists(),
        (old: SocialAccount[] = []) => [optimisticAccount, ...old]
      );

      return { optimisticAccount };
    },

    onError: (error: any, newAccount, context) => {
      // Remove optimistic account
      if (context?.optimisticAccount) {
        queryClient.setQueryData(
          socialAccountKeys.lists(),
          (old: SocialAccount[] = []) => 
            old.filter(account => account.id !== context.optimisticAccount.id)
        );
      }

      toast({
        title: "Failed to create account",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },

    onSuccess: (newAccount, _, context) => {
      // Replace optimistic account with real account
      if (context?.optimisticAccount) {
        queryClient.setQueryData(
          socialAccountKeys.lists(),
          (old: SocialAccount[] = []) => 
            old.map(account => 
              account.id === context.optimisticAccount.id ? newAccount : account
            )
        );
      }

      // Invalidate to get fresh data
      queryClient.invalidateQueries({ queryKey: socialAccountKeys.lists() });
      
      toast({
        title: "Account created",
        description: "Your social account has been added successfully.",
      });
    },
  });
};

/**
 * Hook to update a social account with optimistic updates
 */
export const useUpdateSocialAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSocialAccountRequest }) => 
      api.socialAccounts.update(id, data),
    
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: socialAccountKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: socialAccountKeys.lists() });

      // Snapshot previous values
      const previousAccount = queryClient.getQueryData(socialAccountKeys.detail(id));
      const previousAccounts = queryClient.getQueryData(socialAccountKeys.lists());

      // Optimistically update individual account
      if (previousAccount) {
        queryClient.setQueryData(socialAccountKeys.detail(id), {
          ...previousAccount,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      // Optimistically update accounts list
      if (previousAccounts) {
        queryClient.setQueryData(
          socialAccountKeys.lists(),
          (old: SocialAccount[]) =>
            old.map(account =>
              account.id === id
                ? { ...account, ...data, updatedAt: new Date().toISOString() }
                : account
            )
        );
      }

      return { previousAccount, previousAccounts };
    },

    onError: (error: any, { id }, context) => {
      // Rollback optimistic updates
      if (context?.previousAccount) {
        queryClient.setQueryData(socialAccountKeys.detail(id), context.previousAccount);
      }
      if (context?.previousAccounts) {
        queryClient.setQueryData(socialAccountKeys.lists(), context.previousAccounts);
      }

      toast({
        title: "Failed to update account",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },

    onSuccess: (updatedAccount, { id }) => {
      // Update with server response
      queryClient.setQueryData(socialAccountKeys.detail(id), updatedAccount);
      queryClient.invalidateQueries({ queryKey: socialAccountKeys.lists() });
      
      toast({
        title: "Account updated",
        description: "Your social account has been updated successfully.",
      });
    },
  });
};

/**
 * Hook to delete a social account with optimistic updates
 */
export const useDeleteSocialAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.socialAccounts.delete(id),
    
    // Optimistic update
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: socialAccountKeys.lists() });

      const previousAccounts = queryClient.getQueryData(socialAccountKeys.lists());

      // Optimistically remove account from list
      if (previousAccounts) {
        queryClient.setQueryData(
          socialAccountKeys.lists(),
          (old: SocialAccount[]) => old.filter(account => account.id !== id)
        );
      }

      return { previousAccounts };
    },

    onError: (error: any, id, context) => {
      // Rollback optimistic update
      if (context?.previousAccounts) {
        queryClient.setQueryData(socialAccountKeys.lists(), context.previousAccounts);
      }

      toast({
        title: "Failed to delete account",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },

    onSuccess: (_, id) => {
      // Remove individual account query
      queryClient.removeQueries({ queryKey: socialAccountKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: socialAccountKeys.lists() });
      
      toast({
        title: "Account deleted",
        description: "Your social account has been removed.",
      });
    },
  });
};

/**
 * Hook to reconnect a social account
 */
export const useReconnectSocialAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.socialAccounts.reconnect(id),
    
    onMutate: async (id) => {
      // Optimistically update connection status
      await queryClient.cancelQueries({ queryKey: socialAccountKeys.detail(id) });
      
      const previousAccount = queryClient.getQueryData(socialAccountKeys.detail(id));
      
      if (previousAccount) {
        queryClient.setQueryData(socialAccountKeys.detail(id), {
          ...previousAccount,
          status: 'PENDING',
        });
      }

      return { previousAccount };
    },

    onError: (error: any, id, context) => {
      if (context?.previousAccount) {
        queryClient.setQueryData(socialAccountKeys.detail(id), context.previousAccount);
      }

      toast({
        title: "Failed to reconnect",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },

    onSuccess: (updatedAccount, id) => {
      queryClient.setQueryData(socialAccountKeys.detail(id), updatedAccount);
      queryClient.invalidateQueries({ queryKey: socialAccountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: socialAccountKeys.connection(id) });
      
      toast({
        title: "Account reconnected",
        description: "Your social account connection has been restored.",
      });
    },
  });
};

/**
 * Hook to get accounts grouped by platform
 */
export const useSocialAccountsByPlatform = () => {
  const { data: accounts, ...rest } = useSocialAccounts();
  
  const groupedAccounts = accounts?.reduce((acc, account) => {
    const platform = account.platform;
    if (!acc[platform]) {
      acc[platform] = [];
    }
    acc[platform].push(account);
    return acc;
  }, {} as Record<string, SocialAccount[]>);

  return {
    data: groupedAccounts,
    accounts,
    ...rest,
  };
};

/**
 * Hook to get active accounts only
 */
export const useActiveSocialAccounts = () => {
  const { data: accounts, ...rest } = useSocialAccounts();
  
  const activeAccounts = accounts?.filter(account => 
    account.status === 'ACTIVE' && account.connected
  );

  return {
    data: activeAccounts,
    ...rest,
  };
};