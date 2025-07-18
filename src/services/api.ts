// Legacy API service - now redirects to new modular API structure
// This file maintains backward compatibility while migrating to the new structure

export * from './api/index';
export { api as default } from './api/index';
export { socialAccountsApi as socialAccountApi } from './api/index';