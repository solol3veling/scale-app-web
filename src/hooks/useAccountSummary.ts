import { useQuery } from '@tanstack/react-query'
import { socialAccountsApi } from '@/services/api/social-accounts'
import { AccountSummary } from '@/types/api'

export const useAccountSummary = () => {
  return useQuery<AccountSummary, Error>({
    queryKey: ['accountSummary'],
    queryFn: socialAccountsApi.getSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}