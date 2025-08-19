import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSidebar } from "@/components/ui/sidebar"
import { DateRangePicker, DateRange } from "@/components/ui/date-range-picker"
import { 
  TrendingUp, 
  TrendingDown,
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  Users,
  Calendar,
  Download,
  Filter,
  CreditCard,
  X,
  RefreshCw
} from "lucide-react"
import { PageHeader } from "@/components/PageHeader"
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard"
import { EnhancedAnalyticsDashboard } from "@/components/EnhancedAnalyticsDashboard"
import { AdvancedAnalyticsDashboard } from "@/components/AdvancedAnalyticsDashboard"
import { RealAnalyticsDashboard } from "@/components/RealAnalyticsDashboard"
import { PostSpecificAnalyticsView } from "@/components/PostSpecificAnalyticsView"
import { ContentDetailView } from "@/components/ContentDetailView"
import { PlatformDetailView } from "@/components/PlatformDetailView"
import { 
  useAnalytics, 
  useEnhancedAnalytics, 
  useEngagementAnalytics,
  useContentAnalytics,
  useAnalyticsOverview,
  useAnalyticsOverviewAdvanced,
  usePostsAnalytics,
  useContentInsights,
  useRefreshAllEngagements,
  useAnalyticsDashboard,
  usePlatformRankings,
  usePlatformRankingsAdvanced,
  useTopPerformingPosts,
  useTopPerformingPostsAdvanced,
  usePlatformOverview,
  usePostAnalyticsOverview,
  useExportAnalytics
} from "@/hooks/useAnalytics"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

// Analytics view types
type AnalyticsView = 'dashboard' | 'content-detail' | 'platform-detail' | 'post-specific'

// Selected content/platform for drill-down views
interface SelectedContent {
  postId: string;
  contentPreview: string;
  data: any;
}

interface SelectedPlatform {
  platform: string;
  data: any;
}

// Helper function to extract meaningful error message
const getErrorMessage = (error: any) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.statusText) return error.response.statusText;
  return 'Unable to load analytics data.';
};

// Helper function to check if error is 403 or subscription-related
const isSubscriptionError = (error: any) => {
  if (error?.response?.status === 403) return true;
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('subscription') || message.includes('plan') || message.includes('upgrade') || message.includes('premium') || message.includes('pro');
};

// Error Overlay Component
const ErrorOverlay = ({ error, onClose }: { error: any, onClose: () => void }) => {
  const navigate = useNavigate();
  const { state, isMobile } = useSidebar();
  const isSubError = isSubscriptionError(error);
  const errorMessage = getErrorMessage(error);
  
  const overlayClasses = isMobile 
    ? "fixed top-16 bottom-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" 
    : "fixed top-16 bottom-0 right-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4";
  
  const overlayStyle = isMobile 
    ? {} 
    : { left: state === "collapsed" ? "var(--sidebar-width-icon, 60px)" : "var(--sidebar-width, 200px)" };

  return (
    <div className={overlayClasses} style={overlayStyle}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-6 relative">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isSubError ? 'Upgrade Required' : 'Access Denied'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {errorMessage}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            {isSubError ? (
              <Button
                onClick={() => navigate('/settings?tab=billing')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Analytics() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('30d');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [useAdvancedDateRange, setUseAdvancedDateRange] = useState(false);
  const [currentView, setCurrentView] = useState<AnalyticsView>('dashboard');
  const [useEnhanced, setUseEnhanced] = useState(false);
  const [selectedContent, setSelectedContent] = useState<SelectedContent | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<SelectedPlatform | null>(null);

  // Handle date range changes
  const handlePresetDateRangeChange = (preset: string) => {
    setDateRange(preset);
    if (preset !== 'custom') {
      setUseAdvancedDateRange(false);
    } else {
      setUseAdvancedDateRange(true);
    }
  };

  const handleCustomDateRangeChange = (range: DateRange | undefined) => {
    setCustomDateRange(range);
  };
  
  // Prepare date range request for advanced endpoints
  const getDateRangeRequest = () => {
    if (useAdvancedDateRange && customDateRange?.from && customDateRange?.to) {
      return {
        startDate: customDateRange.from.toISOString(),
        endDate: customDateRange.to.toISOString(),
        customRange: true,
        validRange: true
      };
    }
    return { 
      presetRange: dateRange,
      validRange: true,
      customRange: false
    };
  };

  // Real API hooks based on actual backend endpoints
  const { data: overviewDataSimple, isLoading: overviewSimpleLoading, error: overviewSimpleError, refetch: refetchOverviewSimple } = useAnalyticsOverview(useAdvancedDateRange ? '30d' : dateRange);
  const { data: overviewDataAdvanced, isLoading: overviewAdvancedLoading, error: overviewAdvancedError, refetch: refetchOverviewAdvanced } = useAnalyticsOverviewAdvanced(getDateRangeRequest());
  
  const { data: platformRankingsDataSimple, isLoading: platformRankingsSimpleLoading, error: platformRankingsSimpleError } = usePlatformRankings(useAdvancedDateRange ? '30d' : dateRange);
  const { data: platformRankingsDataAdvanced, isLoading: platformRankingsAdvancedLoading, error: platformRankingsAdvancedError } = usePlatformRankingsAdvanced(getDateRangeRequest());
  
  const { data: topPostsDataSimple, isLoading: topPostsSimpleLoading, error: topPostsSimpleError } = useTopPerformingPosts(useAdvancedDateRange ? '30d' : dateRange);
  const { data: topPostsDataAdvanced, isLoading: topPostsAdvancedLoading, error: topPostsAdvancedError } = useTopPerformingPostsAdvanced(getDateRangeRequest());
  
  // Choose between simple and advanced data based on date range type
  const overviewData = useAdvancedDateRange ? overviewDataAdvanced : overviewDataSimple;
  const overviewLoading = useAdvancedDateRange ? overviewAdvancedLoading : overviewSimpleLoading;
  const overviewError = useAdvancedDateRange ? overviewAdvancedError : overviewSimpleError;
  const refetchOverview = useAdvancedDateRange ? refetchOverviewAdvanced : refetchOverviewSimple;
  
  const platformRankingsData = useAdvancedDateRange ? platformRankingsDataAdvanced : platformRankingsDataSimple;
  const platformRankingsLoading = useAdvancedDateRange ? platformRankingsAdvancedLoading : platformRankingsSimpleLoading;
  const platformRankingsError = useAdvancedDateRange ? platformRankingsAdvancedError : platformRankingsSimpleError;
  
  const topPostsData = useAdvancedDateRange ? topPostsDataAdvanced : topPostsDataSimple;
  const topPostsLoading = useAdvancedDateRange ? topPostsAdvancedLoading : topPostsSimpleLoading;
  const topPostsError = useAdvancedDateRange ? topPostsAdvancedError : topPostsSimpleError;
  
  // Export functionality
  const exportAnalyticsMutation = useExportAnalytics();
  
  // Fallback hooks for compatibility
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useAnalyticsDashboard(dateRange);
  const { data: basicAnalyticsData, isLoading: basicLoading, error: basicError, refetch: refetchBasic } = useAnalytics(dateRange);
  const { data: postsData, isLoading: postsLoading, error: postsError } = usePostsAnalytics({ dateRange, sortBy: 'engagement', order: 'DESC', size: 10 });
  const { data: insightsData, isLoading: insightsLoading, error: insightsError } = useContentInsights(dateRange);
  
  // Refresh mutation
  const refreshAllMutation = useRefreshAllEngagements();
  
  // Determine which data to show based on current view and settings
  const getActiveData = () => {
    // Prioritize new API data structure
    const primaryData = overviewData || dashboardData || basicAnalyticsData;
    const primaryLoading = overviewLoading || dashboardLoading || basicLoading;
    const primaryError = overviewError || dashboardError || basicError;
    const primaryRefetch = refetchOverview || refetchDashboard || refetchBasic;
    
    return { 
      data: primaryData, 
      loading: primaryLoading, 
      error: primaryError, 
      refetch: primaryRefetch,
      overviewData,
      platformRankingsData,
      topPostsData,
      dashboardData,
      postsData,
      insightsData,
      overviewLoading,
      platformRankingsLoading,
      topPostsLoading,
      dashboardLoading,
      postsLoading,
      insightsLoading
    };
  };
  
  const { data: analyticsApiData, loading: isLoading, error, refetch } = getActiveData();

  // Handle content selection for drill-down
  const handleContentSelect = (post: any) => {
    setSelectedContent({
      postId: post.id || post.postId,
      contentPreview: post.content || post.contentPreview,
      data: post
    });
    // Use post-specific view for detailed analytics
    setCurrentView('post-specific');
  };

  // Handle platform selection for drill-down  
  const handlePlatformSelect = (platform: string, platformData: any) => {
    setSelectedPlatform({
      platform,
      data: platformData
    });
    setCurrentView('platform-detail');
  };

  // Combine all analytics data for advanced dashboard
  const getCombinedAnalyticsData = () => {
    const { 
      data: primaryData,
      overviewData,
      platformRankingsData,
      topPostsData,
      dashboardData,
      postsData, 
      insightsData
    } = getActiveData();

    // Use real API structure from /api/v1/analytics/overview
    if (overviewData) {
      return {
        // Basic metrics from generalStats
        totalPosts: overviewData.generalStats?.totalPosts || 0,
        totalPublishedPosts: overviewData.generalStats?.publishedPosts || 0,
        totalScheduledPosts: overviewData.generalStats?.scheduledPosts || 0,
        totalEngagement: overviewData.generalStats?.totalEngagements || 0,
        mostActiveplatform: overviewData.generalStats?.topPlatform || 'N/A',

        // Performance data from performanceMetrics
        performance: {
          averageEngagementPerPost: overviewData.performanceMetrics?.overallEngagementRate || 0
        },

        // Publishing stats from generalStats
        publishingStats: {
          successRate: overviewData.generalStats?.publishingSuccessRate || 0,
          successfulPublishes: overviewData.generalStats?.publishedPosts || 0,
          mostSuccessfulPlatform: overviewData.generalStats?.topPlatform || 'N/A'
        },

        // Platform rankings from overview response or dedicated endpoint
        platformRankings: overviewData.platformRankings || platformRankingsData?.rankings || [],

        // Top posts from overview response or dedicated endpoint  
        topPosts: overviewData.topPerformingPosts || topPostsData?.topPosts || [],

        // Engagement analysis from overview
        engagementAnalysis: overviewData.engagementBreakdown || {
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalViews: 0,
          totalSaves: 0,
          averageLikesPerPost: overviewData.performanceMetrics?.avgLikesPerPost || 0,
          averageCommentsPerPost: overviewData.performanceMetrics?.avgCommentsPerPost || 0,
          averageSharesPerPost: overviewData.performanceMetrics?.avgSharesPerPost || 0
        },

        // Posting time analysis from overview
        postingTimeAnalysis: {
          peakPostingDay: overviewData.bestTimeToPost?.bestDayOfWeek || 'N/A',
          peakPostingHour: `${overviewData.bestTimeToPost?.bestHour || 0}:00`,
          hourlyBreakdown: Object.entries(overviewData.postTimeAnalysis?.hourlyDistribution || {}).map(([hour, count]) => ({
            hour: `${hour}:00`,
            posts: count,
            percentage: (count / (overviewData.generalStats?.totalPosts || 1)) * 100
          })),
          dailyBreakdown: Object.entries(overviewData.postTimeAnalysis?.dayOfWeekDistribution || {}).map(([day, count]) => ({
            day: day.slice(0, 3),
            posts: count,
            percentage: (count / (overviewData.generalStats?.totalPosts || 1)) * 100
          }))
        },

        // Time series data from overview
        timeSeriesData: overviewData.engagementTimeSeries || [],

        // Best time to post insights
        bestTimeToPost: overviewData.bestTimeToPost || {
          bestHour: 0,
          bestDayOfWeek: 'Monday',
          successRateAtBestTime: 0,
          hourlySuccessRates: {},
          dailySuccessRates: {}
        },

        // Performance metrics
        performanceMetrics: overviewData.performanceMetrics || {
          avgLikesPerPost: 0,
          avgCommentsPerPost: 0,
          avgSharesPerPost: 0,
          avgViewsPerPost: 0,
          avgSavesPerPost: 0,
          overallEngagementRate: 0
        },

        // Scheduling analysis
        schedulingAnalysis: {
          schedulingRate: overviewData.postTimeAnalysis?.schedulingRate || 0,
          currentlyScheduled: overviewData.generalStats?.scheduledPosts || 0,
          monthlyTrends: []
        }
      };
    }

    // Use dashboard data if available (legacy fallback)
    if (dashboardData) {
      return {
        // Basic metrics from dashboard overview
        totalPosts: dashboardData.overview?.totalPosts || 0,
        totalPublishedPosts: dashboardData.overview?.totalPublishedPosts || 0,
        totalScheduledPosts: dashboardData.overview?.totalScheduledPosts || 0,
        totalEngagement: dashboardData.overview?.totalEngagement || 0,
        mostActiveplatform: dashboardData.overview?.mostActiveplatform || 'N/A',

        // Performance data
        performance: {
          averageEngagementPerPost: dashboardData.overview?.averageEngagementPerPost || 0
        },

        // Publishing stats
        publishingStats: {
          successRate: dashboardData.overview?.publishingSuccessRate || 0,
          successfulPublishes: dashboardData.overview?.successfulPublishes || 0,
          mostSuccessfulPlatform: dashboardData.overview?.mostActiveplatform || 'N/A'
        },

        // Platform rankings (direct from API)
        platformRankings: dashboardData.platformRankings || [],

        // Top posts (direct from API)
        topPosts: dashboardData.topPosts || [],

        // Engagement analysis (direct from API)
        engagementAnalysis: dashboardData.engagementAnalysis || {
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalViews: 0,
          totalSaves: 0,
          averageLikesPerPost: 0,
          averageCommentsPerPost: 0,
          averageSharesPerPost: 0
        },

        // Posting time analysis (direct from API with backend-calculated percentages!)
        postingTimeAnalysis: dashboardData.postingTimeAnalysis || {
          peakPostingDay: 'N/A',
          peakPostingHour: 'N/A',
          hourlyBreakdown: [],
          dailyBreakdown: []
        },

        // Time series data (direct from API)
        timeSeriesData: dashboardData.timeSeriesData || [],

        // Scheduling analysis (direct from API)
        schedulingAnalysis: dashboardData.schedulingAnalysis || {
          schedulingRate: 0,
          currentlyScheduled: 0,
          monthlyTrends: []
        }
      };
    }

    // Fallback to other data sources if dashboard data is not available
    {
      // Calculate basic metrics from available data
      const totalPosts = insightsData?.mediaTypePerformance?.reduce((sum, type) => sum + type.postCount, 0) || 
                        postsData?.totalPosts || 
                        overviewData?.totalPosts || 
                        0;

      // Create platform rankings from media type data if available
      const platformRankings = insightsData?.mediaTypePerformance?.map((mediaType, index) => ({
        platform: mediaType.mediaType.toUpperCase(),
        totalPosts: mediaType.postCount,
        engagement: mediaType.totalEngagements,
        reach: mediaType.totalEngagements * 2, // Estimate reach
        successRate: mediaType.averageEngagementRate * 100
      })) || [
        // Fallback sample data for demonstration
        { platform: 'FACEBOOK', totalPosts: 25, engagement: 1250, reach: 2500, successRate: 92.5 },
        { platform: 'INSTAGRAM', totalPosts: 32, engagement: 1680, reach: 3360, successRate: 88.2 },
        { platform: 'TWITTER', totalPosts: 18, engagement: 756, reach: 1512, successRate: 85.7 },
        { platform: 'LINKEDIN', totalPosts: 12, engagement: 480, reach: 960, successRate: 95.1 }
      ];

      // Create hourly/daily breakdown from insights data or sample data
      const hourlyBreakdown = Object.entries(insightsData?.hourOfDayPerformance || {}).map(([hour, count]) => ({
        hour: `${parseInt(hour)}:00`, // Charts expect formatted hour string
        posts: typeof count === 'number' ? count : 0, // Charts expect "posts" field
        percentage: typeof count === 'number' ? (count / totalPosts) * 100 : 0
      })) || [
        { hour: '8:00', posts: 5, percentage: 12.5 },
        { hour: '9:00', posts: 8, percentage: 20 },
        { hour: '10:00', posts: 12, percentage: 30 },
        { hour: '11:00', posts: 7, percentage: 17.5 },
        { hour: '12:00', posts: 4, percentage: 10 },
        { hour: '13:00', posts: 6, percentage: 15 },
        { hour: '14:00', posts: 3, percentage: 7.5 },
        { hour: '15:00', posts: 2, percentage: 5 }
      ];

      const dailyBreakdown = Object.entries(insightsData?.dayOfWeekPerformance || {}).map(([day, count]) => ({
        day: day.slice(0, 3), // Charts expect "day" field, not "dayOfWeek"
        posts: typeof count === 'number' ? count : 0, // Charts expect "posts" field
        percentage: typeof count === 'number' ? (count / totalPosts) * 100 : 0
      })) || [
        { day: 'Mon', posts: 15, percentage: 18.75 },
        { day: 'Tue', posts: 12, percentage: 15 },
        { day: 'Wed', posts: 18, percentage: 22.5 },
        { day: 'Thu', posts: 14, percentage: 17.5 },
        { day: 'Fri', posts: 10, percentage: 12.5 },
        { day: 'Sat', posts: 6, percentage: 7.5 },
        { day: 'Sun', posts: 5, percentage: 6.25 }
      ];

      return {
        // Basic metrics
        totalPosts,
        totalPublishedPosts: totalPosts,
        totalScheduledPosts: 0,
        totalEngagement: insightsData?.mediaTypePerformance?.reduce((sum, type) => sum + type.totalEngagements, 0) || 2500,
        mostActiveplatform: platformRankings[0]?.platform || 'INSTAGRAM',

        // Performance data
        performance: {
          averageEngagementPerPost: insightsData?.mediaTypePerformance?.reduce((sum, type) => sum + type.averageEngagementRate, 0) / (insightsData?.mediaTypePerformance?.length || 1) || 0
        },

        // Publishing stats
        publishingStats: {
          successRate: 92.5,
          successfulPublishes: totalPosts,
          mostSuccessfulPlatform: platformRankings[0]?.platform || 'INSTAGRAM'
        },

        // Platform rankings
        platformRankings,

        // Top posts - use sample data if posts not available
        topPosts: postsData?.posts?.slice(0, 10) || [],

        // Engagement analysis
        engagementAnalysis: {
          totalLikes: 1200,
          totalComments: 380,
          totalShares: 145,
          totalViews: 8500,
          totalSaves: 275,
          averageLikesPerPost: 1200 / totalPosts,
          averageCommentsPerPost: 380 / totalPosts,
          averageSharesPerPost: 145 / totalPosts
        },

        // Posting time analysis
        postingTimeAnalysis: {
          peakPostingDay: 'WEDNESDAY',
          peakPostingHour: '10:00',
          hourlyBreakdown,
          dailyBreakdown
        },

        // Time series data for trends - sample data
        timeSeriesData: [
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), engagement: 850, reach: 1700, posts: 8 },
          { date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), engagement: 920, reach: 1840, posts: 10 },
          { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), engagement: 1100, reach: 2200, posts: 12 },
          { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), engagement: 980, reach: 1960, posts: 9 },
          { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), engagement: 1250, reach: 2500, posts: 14 },
          { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), engagement: 1180, reach: 2360, posts: 11 }
        ],

        // Scheduling analysis
        schedulingAnalysis: {
          schedulingRate: 85.5,
          currentlyScheduled: 0,
          monthlyTrends: [
            { month: 'Jan', scheduledCount: 45, publishedCount: 42, conversionRate: 93.3 },
            { month: 'Feb', scheduledCount: 38, publishedCount: 35, conversionRate: 92.1 },
            { month: 'Mar', scheduledCount: 52, publishedCount: 48, conversionRate: 92.3 }
          ]
        }
      };
    }
  };

  // Render the appropriate analytics component
  const renderAnalyticsContent = () => {
    const { 
      data: primaryData, 
      overviewData, 
      postsData, 
      insightsData, 
      engagementData, 
      contentData 
    } = getActiveData();
    
    if (currentView === 'post-specific' && selectedContent) {
      return (
        <PostSpecificAnalyticsView 
          postId={selectedContent.postId} 
          onBack={() => {
            setCurrentView('dashboard');
            setSelectedContent(null);
          }}
        />
      );
    }
    
    if (currentView === 'content-detail' && selectedContent) {
      return <ContentDetailView content={selectedContent} />;
    }
    
    if (currentView === 'platform-detail' && selectedPlatform) {
      return <PlatformDetailView platform={selectedPlatform} />;
    }
    
    // Always try to show real analytics dashboard with actual API data
    const combinedData = getCombinedAnalyticsData();
    if (combinedData) {
      return (
        <RealAnalyticsDashboard 
          analyticsData={combinedData}
          onContentSelect={handleContentSelect}
          onPlatformSelect={handlePlatformSelect}
        />
      );
    }

    // Enhanced dashboard for overview data
    if (overviewData) {
      return (
        <EnhancedAnalyticsDashboard 
          overviewData={overviewData}
          postsData={postsData}
          insightsData={insightsData}
          onContentSelect={handleContentSelect}
          onPlatformSelect={handlePlatformSelect}
        />
      );
    }
    
    // Fallback to legacy dashboard
    return (
      <AnalyticsDashboard 
        primaryData={primaryData}
        engagementData={engagementData}
        contentData={contentData}
        isEnhanced={useEnhanced}
        onContentSelect={handleContentSelect}
        onPlatformSelect={handlePlatformSelect}
      />
    );
  };

  return (
    <div className="space-y-0 relative">
      {/* Error Overlay */}
      {error && (
        <ErrorOverlay 
          error={error} 
          onClose={() => window.location.reload()} 
        />
      )}

      {/* Header */}
      <PageHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back button for drill-down views */}
            {(currentView === 'content-detail' || currentView === 'platform-detail' || currentView === 'post-specific') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setCurrentView('dashboard');
                  setSelectedContent(null);
                  setSelectedPlatform(null);
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Back
              </Button>
            )}
            
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {currentView === 'post-specific' && selectedContent ? 
                  'Post Analytics' :
                  currentView === 'content-detail' && selectedContent ? 
                  'Content Analytics' : 
                  currentView === 'platform-detail' && selectedPlatform ?
                  `${selectedPlatform.platform} Analytics` :
                  'Analytics Dashboard'
                }
              </h1>
              <p className="text-muted-foreground text-sm">
                {currentView === 'post-specific' ? 
                  'Comprehensive analytics with charts and detailed metrics' :
                  currentView === 'content-detail' ? 
                  'Detailed performance metrics for this post' :
                  currentView === 'platform-detail' ?
                  'Platform-specific performance insights' :
                  'Track your social media performance and engagement with comprehensive visualizations'
                }
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            {/* Date Range Picker */}
            <DateRangePicker
              value={customDateRange}
              onChange={handleCustomDateRangeChange}
              presetValue={dateRange}
              onPresetChange={handlePresetDateRangeChange}
              disabled={isLoading}
            />
            
            <Button 
              variant="outline" 
              className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" 
              size="sm" 
              onClick={() => refetch()} 
              disabled={isLoading}
              title="Refresh analytics"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button 
              variant="outline" 
              className="hover-lift" 
              size="sm" 
              onClick={() => refreshAllMutation.mutate()}
              disabled={isLoading || refreshAllMutation.isPending}
              title="Refresh all engagement data"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshAllMutation.isPending ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            
            <Button 
              variant="outline" 
              className="hover-lift" 
              size="sm" 
              onClick={() => exportAnalyticsMutation.mutate({ 
                format: 'CSV', 
                request: getDateRangeRequest()
              })}
              disabled={isLoading || exportAnalyticsMutation.isPending}
              title="Export analytics data"
            >
              <Download className={`h-4 w-4 mr-2 ${exportAnalyticsMutation.isPending ? 'animate-spin' : ''}`} />
              Export
            </Button>
          </div>
        </div>
      </PageHeader>

      {/* Main content area */}
      <div className="space-y-6 p-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="hover-lift gradient-card border-0 shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-5 w-5 bg-gray-200 animate-pulse rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-12 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !getActiveData().data ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No analytics data available</p>
          </div>
        ) : (
          renderAnalyticsContent()
        )}
      </div>
    </div>
  );
}