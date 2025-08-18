// Simple API test utility to verify the integration works
import { api } from '@/services/api';

export const testApiIntegration = async () => {
  
  try {
    // Test Overview API
    const overviewResponse = await api.overview.getOverviewStats();
  } catch (error) {
  }

  try {
    // Test Social Accounts API
    const accountsResponse = await api.socialAccounts.getSocialAccounts();
  } catch (error) {
  }

  try {
    // Test Analytics API
    const analyticsResponse = await api.analytics.getAnalyticsData();
  } catch (error) {
  }

};

// Run test if in development mode
if (import.meta.env.DEV) {
  // You can call testApiIntegration() from the browser console
  (window as any).testAPI = testApiIntegration;
}