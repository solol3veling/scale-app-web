import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSidebar } from "@/components/ui/sidebar"
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
import { OverviewAnalytics } from "@/components/OverviewAnalytics"
import { EngagementAnalytics } from "@/components/EngagementAnalytics"
import { ContentAnalytics } from "@/components/ContentAnalytics"
import { 
  useAnalytics, 
  useEnhancedAnalytics, 
  useEngagementAnalytics,
  useContentAnalytics,
  useRefreshAllEngagements 
} from "@/hooks/useAnalytics"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

// Analytics view types
type AnalyticsView = 'overview' | 'engagement' | 'content'

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
  const [currentView, setCurrentView] = useState<AnalyticsView>('overview');
  const [useEnhanced, setUseEnhanced] = useState(true);
  
  // All analytics data hooks
  const { data: basicAnalyticsData, isLoading: basicLoading, error: basicError, refetch: refetchBasic } = useAnalytics(dateRange);
  const { data: enhancedAnalyticsData, isLoading: enhancedLoading, error: enhancedError, refetch: refetchEnhanced } = useEnhancedAnalytics(dateRange);
  const { data: engagementData, isLoading: engagementLoading, error: engagementError, refetch: refetchEngagement } = useEngagementAnalytics(dateRange);
  const { data: contentData, isLoading: contentLoading, error: contentError, refetch: refetchContent } = useContentAnalytics(dateRange);
  
  // Refresh mutation
  const refreshAllMutation = useRefreshAllEngagements();
  
  // Determine which data to show based on current view and settings
  const getActiveData = () => {
    switch (currentView) {
      case 'engagement':
        return { data: engagementData, loading: engagementLoading, error: engagementError, refetch: refetchEngagement };
      case 'content':
        return { data: contentData, loading: contentLoading, error: contentError, refetch: refetchContent };
      default: // overview
        const overviewData = useEnhanced ? enhancedAnalyticsData : basicAnalyticsData;
        const overviewLoading = useEnhanced ? enhancedLoading : basicLoading;
        const overviewError = useEnhanced ? enhancedError : basicError;
        const overviewRefetch = useEnhanced ? refetchEnhanced : refetchBasic;
        return { data: overviewData, loading: overviewLoading, error: overviewError, refetch: overviewRefetch };
    }
  };
  
  const { data: analyticsApiData, loading: isLoading, error, refetch } = getActiveData();

  // Render the appropriate analytics component
  const renderAnalyticsContent = () => {
    if (!analyticsApiData) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      );
    }

    switch (currentView) {
      case 'engagement':
        return <EngagementAnalytics data={analyticsApiData as any} />;
      case 'content':
        return <ContentAnalytics data={analyticsApiData as any} />;
      default:
        return <OverviewAnalytics data={analyticsApiData as any} isEnhanced={useEnhanced} />;
    }
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
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground text-sm">Track your social media performance and engagement</p>
          </div>
          <div className="flex gap-2">
            {/* View Selector */}
            <div className="flex rounded-lg border">
              <Button 
                variant={currentView === 'overview' ? 'default' : 'ghost'}
                size="sm" 
                onClick={() => setCurrentView('overview')}
                disabled={isLoading}
                className="rounded-r-none"
              >
                Overview
              </Button>
              <Button 
                variant={currentView === 'engagement' ? 'default' : 'ghost'}
                size="sm" 
                onClick={() => setCurrentView('engagement')}
                disabled={isLoading}
                className="rounded-none border-x"
              >
                Engagement
              </Button>
              <Button 
                variant={currentView === 'content' ? 'default' : 'ghost'}
                size="sm" 
                onClick={() => setCurrentView('content')}
                disabled={isLoading}
                className="rounded-l-none"
              >
                Content
              </Button>
            </div>
            
            {/* Overview-specific controls */}
            {currentView === 'overview' && (
              <Button 
                variant={useEnhanced ? "default" : "outline"}
                className="hover-lift" 
                size="sm" 
                onClick={() => setUseEnhanced(!useEnhanced)}
                disabled={isLoading}
              >
                {useEnhanced ? "Enhanced" : "Basic"}
              </Button>
            )}
            
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
            
            <Button variant="outline" className="hover-lift" size="sm" disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
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
        ) : (
          renderAnalyticsContent()
        )}
      </div>
    </div>
  );
}