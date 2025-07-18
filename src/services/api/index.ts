// Main API exports with organized structure
export * from './base';
export { socialAccountsApi } from './social-accounts';
export { postsApi } from './posts';
export { analyticsApi } from './analytics';
export { overviewApi } from './overview';
export { oauthApi } from './oauth';
export { billingApi } from './billing';

// Consolidated API object for easy access
import { socialAccountsApi } from './social-accounts';
import { postsApi } from './posts';
import { analyticsApi } from './analytics';
import { overviewApi } from './overview';
import { oauthApi } from './oauth';
import { billingApi } from './billing';

export const api = {
  socialAccounts: socialAccountsApi,
  posts: postsApi,
  analytics: analyticsApi,
  overview: overviewApi,
  oauth: oauthApi,
  billing: billingApi,
} as const;

export default api;