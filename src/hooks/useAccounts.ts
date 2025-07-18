// Legacy hook - redirects to new modular hooks
export * from './api/useSocialAccounts';
export { 
  useSocialAccounts as useAccounts, 
  useSocialAccountsPaginated,
  useCreateSocialAccount as useCreateAccount, 
  useUpdateSocialAccount as useUpdateAccount, 
  useDeleteSocialAccount as useDeleteAccount 
} from './api/useSocialAccounts';