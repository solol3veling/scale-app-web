// Simple API test utility to verify the integration works
import { api } from '@/services/api';

export const testApiIntegration = async () => {
  console.log('🧪 Testing API Integration...');
  
  try {
    // Test Overview API
    console.log('📊 Testing Overview API...');
    const overviewResponse = await api.overview.getOverviewStats();
    console.log('✅ Overview API Response:', overviewResponse);
  } catch (error) {
    console.log('⚠️ Overview API Error (expected during development):', error);
  }

  try {
    // Test Social Accounts API
    console.log('👥 Testing Social Accounts API...');
    const accountsResponse = await api.socialAccounts.getSocialAccounts();
    console.log('✅ Accounts API Response:', accountsResponse);
  } catch (error) {
    console.log('⚠️ Accounts API Error (expected during development):', error);
  }

  try {
    // Test Analytics API
    console.log('📈 Testing Analytics API...');
    const analyticsResponse = await api.analytics.getAnalyticsData();
    console.log('✅ Analytics API Response:', analyticsResponse);
  } catch (error) {
    console.log('⚠️ Analytics API Error (expected during development):', error);
  }

  console.log('✨ API Integration test completed!');
};

// Run test if in development mode
if (import.meta.env.DEV) {
  // You can call testApiIntegration() from the browser console
  (window as any).testAPI = testApiIntegration;
  console.log('🔧 API test available: call testAPI() in browser console');
}