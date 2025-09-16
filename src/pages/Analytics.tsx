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
import { ComprehensiveAnalyticsDashboard } from "@/components/ComprehensiveAnalyticsDashboard"
import { PostSpecificAnalyticsView } from "@/components/PostSpecificAnalyticsView"
import { PlatformSpecificAnalyticsView } from "@/components/PlatformSpecificAnalyticsView"
import { 
  useAnalyticsOverview,
  useRefreshAllEngagements,
  useExportAnalytics
} from "@/hooks/useAnalytics"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Platform } from "@/types/api"

// View types
type AnalyticsView = 'overview' | 'platform' | 'post';

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
                variant="default"
                onClick={() => navigate('/settings?tab=billing')}
                className="w-full"
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
  const [currentView, setCurrentView] = useState<AnalyticsView>('overview');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

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

  const { data: overviewData, isLoading: overviewLoading, error: overviewError, refetch: refetchOverview } = useAnalyticsOverview(dateRange);

  const exportAnalyticsMutation = useExportAnalytics();
  const refreshAllMutation = useRefreshAllEngagements();

  const isLoading = overviewLoading;
  const error = overviewError;

  const handlePlatformClick = (platform: string) => {
    setSelectedPlatform(platform as Platform);
    setCurrentView('platform');
  };

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
    setCurrentView('post');
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
    setSelectedPostId(null);
    setSelectedPlatform(null);
  };

  const renderAnalyticsContent = () => {
    if (currentView === 'post' && selectedPostId) {
      return (
        <PostSpecificAnalyticsView 
          postId={selectedPostId}
          onBack={handleBackToOverview}
        />
      );
    }
    
    if (currentView === 'platform' && selectedPlatform) {
      return (
        <PlatformSpecificAnalyticsView 
          platform={selectedPlatform}
          onBack={handleBackToOverview}
        />
      );
    }
    
    if (overviewData) {
      return (
        <ComprehensiveAnalyticsDashboard 
          analyticsData={overviewData}
          onPlatformClick={handlePlatformClick}
          onPostClick={handlePostClick}
        />
      );
    }
    
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {currentView === 'post' 
                ? 'Post Analytics' 
                : currentView === 'platform' && selectedPlatform
                ? `${selectedPlatform} Analytics`
                : 'Analytics Dashboard'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {currentView === 'post' 
                ? 'Comprehensive post performance analysis and insights'
                : currentView === 'platform' && selectedPlatform
                ? `Detailed analytics and insights for ${selectedPlatform} platform`
                : 'Track your social media performance and engagement with comprehensive visualizations'
              }
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            {/* Date Range Picker - Full width on mobile */}
            <div className="w-full sm:w-auto">
              <DateRangePicker
                value={customDateRange}
                onChange={handleCustomDateRangeChange}
                presetValue={dateRange}
                onPresetChange={handlePresetDateRangeChange}
                disabled={isLoading}
              />
            </div>
            
            {/* Action Buttons - Row on mobile, inline on larger screens */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0" 
                size="sm" 
                onClick={() => refetchOverview()} 
                disabled={isLoading}
                title="Refresh analytics"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button 
                variant="outline" 
                className="hover-lift flex-1 sm:flex-initial" 
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
                className="hover-lift flex-1 sm:flex-initial" 
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
        ) : (
          renderAnalyticsContent()
        )}
      </div>
    </div>
  );
}