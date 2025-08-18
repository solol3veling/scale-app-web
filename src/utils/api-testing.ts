import { api } from '@/services/api';
import { CreatePostData, PostStatus, Platform, PlanType } from '@/types/api';

// API Testing Utilities with comprehensive endpoint testing

export interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'skipped';
  duration: number;
  response?: unknown;
  error?: string;
}

export interface TestSuite {
  name: string;
  results: TestResult[];
  duration: number;
  passed: number;
  failed: number;
  skipped: number;
}

class ApiTester {
  private results: TestResult[] = [];
  private isRunning = false;

  /**
   * Test a single API endpoint
   */
  private async testEndpoint(
    name: string, 
    testFn: () => Promise<unknown>,
    shouldSkip: boolean = false
  ): Promise<TestResult> {
    const startTime = Date.now();
    
    if (shouldSkip) {
      return {
        endpoint: name,
        status: 'skipped',
        duration: 0,
      };
    }

    try {
      const response = await testFn();
      const duration = Date.now() - startTime;
      
      
      return {
        endpoint: name,
        status: 'success',
        duration,
        response,
      };
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        endpoint: name,
        status: 'error',
        duration,
        error: errorMessage,
      };
    }
  }

  /**
   * Test Overview APIs
   */
  async testOverviewApis(): Promise<TestResult[]> {
    
    const tests = [
      () => api.overview.getStats(),
      () => api.overview.getSummary(),
      () => api.overview.getRecentActivity(5),
      () => api.overview.getUpcomingPosts(3),
      () => api.overview.getPerformanceHighlights(),
      () => api.overview.getGrowthMetrics('30d'),
    ];

    const testNames = [
      'GET /overview - Get Stats',
      'GET /overview/summary - Get Summary',
      'GET /overview/recent - Get Recent Activity',
      'GET /overview/upcoming - Get Upcoming Posts',
      'GET /overview/highlights - Get Performance Highlights',
      'GET /overview/growth - Get Growth Metrics',
    ];

    const results = [];
    for (let i = 0; i < tests.length; i++) {
      const result = await this.testEndpoint(testNames[i], tests[i]);
      results.push(result);
    }

    return results;
  }

  /**
   * Test Social Accounts APIs
   */
  async testSocialAccountsApis(): Promise<TestResult[]> {
    
    let accountId: string | null = null;

    const results = [];

    // Test get all accounts
    const getAllResult = await this.testEndpoint(
      'GET /socials - Get All Accounts',
      async () => {
        const accounts = await api.socialAccounts.getAll();
        if (accounts.length > 0) {
          accountId = accounts[0].id;
        }
        return accounts;
      }
    );
    results.push(getAllResult);

    // Test get account by ID (only if we have an account)
    if (accountId) {
      const getByIdResult = await this.testEndpoint(
        `GET /socials/${accountId} - Get Account By ID`,
        () => api.socialAccounts.getById(accountId!)
      );
      results.push(getByIdResult);

      const testConnectionResult = await this.testEndpoint(
        `GET /socials/${accountId}/test - Test Connection`,
        () => api.socialAccounts.testConnection(accountId!)
      );
      results.push(testConnectionResult);
    }

    return results;
  }

  /**
   * Test Posts APIs
   */
  async testPostsApis(): Promise<TestResult[]> {
    
    let postId: string | null = null;
    
    const results = [];

    // Test get all posts
    const getAllPostsResult = await this.testEndpoint(
      'GET /posts - Get All Posts',
      async () => {
        const posts = await api.posts.getAll({
          pageable: { page: 0, size: 10 }
        });
        if (posts.data.length > 0) {
          postId = posts.data[0].id;
        }
        return posts;
      }
    );
    results.push(getAllPostsResult);

    // Test filtered posts
    const getFilteredPostsResult = await this.testEndpoint(
      'GET /posts?status=PUBLISHED - Get Filtered Posts',
      () => api.posts.getAll({
        status: PostStatus.PUBLISHED,
        pageable: { page: 0, size: 5 }
      })
    );
    results.push(getFilteredPostsResult);

    // Test get post by ID (only if we have a post)
    if (postId) {
      const getByIdResult = await this.testEndpoint(
        `GET /post/${postId} - Get Post By ID`,
        () => api.posts.getById(postId!)
      );
      results.push(getByIdResult);

      const getEventsResult = await this.testEndpoint(
        `GET /post/${postId}/events - Get Publishing Events`,
        () => api.posts.getPublishingEvents(postId!)
      );
      results.push(getEventsResult);

      const getMetricsResult = await this.testEndpoint(
        `GET /post/${postId}/metrics - Get Post Metrics`,
        () => api.posts.getMetrics(postId!)
      );
      results.push(getMetricsResult);
    }

    return results;
  }

  /**
   * Test Analytics APIs
   */
  async testAnalyticsApis(): Promise<TestResult[]> {
    
    const tests = [
      () => api.analytics.getAnalytics(),
      () => api.analytics.getPostAnalytics(),
      () => api.analytics.getAnalytics({ dateRange: '30d' }),
      () => api.analytics.getPlatformAnalytics('INSTAGRAM'),
      () => api.analytics.getEngagementTrends({ dateRange: '7d' }),
      () => api.analytics.getReachAnalytics(),
      () => api.analytics.getAudienceDemographics(),
      () => api.analytics.getContentPerformance(),
    ];

    const testNames = [
      'GET /analytics - Get Analytics',
      'GET /post/analytics - Get Post Analytics',
      'GET /analytics?dateRange=30d - Get Analytics with Date Range',
      'GET /analytics/platform?platform=INSTAGRAM - Get Platform Analytics',
      'GET /analytics/engagement-trends - Get Engagement Trends',
      'GET /analytics/reach - Get Reach Analytics',
      'GET /analytics/demographics - Get Audience Demographics',
      'GET /analytics/content-performance - Get Content Performance',
    ];

    const results = [];
    for (let i = 0; i < tests.length; i++) {
      const result = await this.testEndpoint(testNames[i], tests[i]);
      results.push(result);
    }

    return results;
  }

  /**
   * Test Billing APIs
   */
  async testBillingApis(): Promise<TestResult[]> {
    
    const tests = [
      () => api.billing.getStatus(),
      () => api.billing.getUsage(),
      () => api.billing.getHistory(),
      () => api.billing.getInvoices(),
    ];

    const testNames = [
      'GET /api/billing/status - Get Billing Status',
      'GET /api/billing/usage - Get Current Usage',
      'GET /api/billing/history - Get Billing History',
      'GET /api/billing/invoices - Get Invoices',
    ];

    const results = [];
    for (let i = 0; i < tests.length; i++) {
      const result = await this.testEndpoint(testNames[i], tests[i]);
      results.push(result);
    }

    return results;
  }

  /**
   * Test OAuth APIs
   */
  async testOAuthApis(): Promise<TestResult[]> {
    
    // These are mostly initialization tests since full OAuth flow requires user interaction
    const results = [];

    const initResult = await this.testEndpoint(
      'POST /oauth1/initialize - Initialize OAuth',
      () => api.oauth.initialize({ platform: 'twitter', account: 'test' }),
      true // Skip this test as it requires actual OAuth setup
    );
    results.push(initResult);

    return results;
  }

  /**
   * Test Create Operations (with cleanup)
   */
  async testCreateOperations(): Promise<TestResult[]> {
    
    const results = [];

    // Test create post
    const createPostData: CreatePostData = {
      content: '🧪 Test post from API testing suite - ' + new Date().toISOString(),
      media: [],
      accountIds: [], // Empty for testing
    };

    const createPostResult = await this.testEndpoint(
      'POST /post - Create Post',
      () => api.posts.create(createPostData)
    );
    results.push(createPostResult);

    // If post was created, test update and delete
    if (createPostResult.status === 'success' && createPostResult.response?.id) {
      const postId = createPostResult.response.id;

      const updatePostResult = await this.testEndpoint(
        `PUT /post/${postId} - Update Post`,
        () => api.posts.update(postId, {
          content: createPostData.content + ' (UPDATED)',
        })
      );
      results.push(updatePostResult);

      const deletePostResult = await this.testEndpoint(
        `DELETE /post/${postId} - Delete Post`,
        () => api.posts.delete(postId)
      );
      results.push(deletePostResult);
    }

    return results;
  }

  /**
   * Run comprehensive API test suite
   */
  async runAllTests(): Promise<TestSuite> {
    if (this.isRunning) {
      throw new Error('Tests are already running');
    }

    this.isRunning = true;
    this.results = [];
    
    const startTime = Date.now();
    

    try {
      // Run all test suites
      const overviewResults = await this.testOverviewApis();
      const socialAccountsResults = await this.testSocialAccountsApis();
      const postsResults = await this.testPostsApis();
      const analyticsResults = await this.testAnalyticsApis();
      const billingResults = await this.testBillingApis();
      const oauthResults = await this.testOAuthApis();
      const createResults = await this.testCreateOperations();

      this.results = [
        ...overviewResults,
        ...socialAccountsResults,
        ...postsResults,
        ...analyticsResults,
        ...billingResults,
        ...oauthResults,
        ...createResults,
      ];

      const duration = Date.now() - startTime;
      const passed = this.results.filter(r => r.status === 'success').length;
      const failed = this.results.filter(r => r.status === 'error').length;
      const skipped = this.results.filter(r => r.status === 'skipped').length;

      const suite: TestSuite = {
        name: 'API Integration Test Suite',
        results: this.results,
        duration,
        passed,
        failed,
        skipped,
      };


      return suite;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Test a specific endpoint manually
   */
  async testSingleEndpoint(name: string, testFn: () => Promise<unknown>): Promise<TestResult> {
    return this.testEndpoint(name, testFn);
  }
}

// Create singleton instance
export const apiTester = new ApiTester();

// Convenience functions for quick testing
export const testAllApis = () => apiTester.runAllTests();
export const testOverview = () => apiTester.testOverviewApis();
export const testSocialAccounts = () => apiTester.testSocialAccountsApis();
export const testPosts = () => apiTester.testPostsApis();
export const testAnalytics = () => apiTester.testAnalyticsApis();
export const testBilling = () => apiTester.testBillingApis();

// Make testing functions available globally in development
if (import.meta.env.DEV) {
  (window as any).apiTester = {
    testAll: testAllApis,
    testOverview,
    testSocialAccounts,
    testPosts,
    testAnalytics,
    testBilling,
    api, // Direct API access
  };

}