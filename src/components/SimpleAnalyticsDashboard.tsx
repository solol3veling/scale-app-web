import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink
} from "lucide-react"

interface SimpleAnalyticsData {
  generalStats?: {
    totalPosts: number;
    scheduledPosts: number;
    publishedPosts: number;
    totalEngagements: number;
    publishingSuccessRate: number;
    topPlatform: string;
    topPlatformPosts: number;
  };
  platformRankings?: Array<{
    platform: string;
    totalPosts: number;
    totalEngagements: number;
    successRate: number;
  }>;
  topPerformingPosts?: Array<{
    post: {
      id: string;
      content: string;
      publishedAt: string;
    };
    totalEngagements: number;
    engagementRate: number;
    platform: string;
  }>;
  performanceMetrics?: {
    overallEngagementRate: number;
    avgLikesPerPost: number;
    avgCommentsPerPost: number;
    avgSharesPerPost: number;
    avgViewsPerPost: number;
    avgSavesPerPost: number;
  };
  bestTimeToPost?: {
    bestHour: number;
    bestDayOfWeek: string;
    successRateAtBestTime: number;
  };
}

interface SimpleAnalyticsDashboardProps {
  analyticsData: SimpleAnalyticsData | null;
  onPlatformClick: (platform: string) => void;
  onPostClick: (postId: string) => void;
}

export function SimpleAnalyticsDashboard({ 
  analyticsData, 
  onPlatformClick, 
  onPostClick 
}: SimpleAnalyticsDashboardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (num: number): string => `${num.toFixed(1)}%`;

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.generalStats?.totalPosts || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.generalStats?.publishedPosts || 0} published, {analyticsData.generalStats?.scheduledPosts || 0} scheduled
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Engagement</CardTitle>
            <Heart className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.generalStats?.totalEngagements || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(analyticsData.performanceMetrics?.overallEngagementRate || 0)} engagement rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analyticsData.generalStats?.publishingSuccessRate || 0)}</div>
            <p className="text-xs text-muted-foreground">Publishing success rate</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Platform</CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.generalStats?.topPlatform || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.generalStats?.topPlatformPosts || 0} posts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Average Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">
                {formatNumber(analyticsData.performanceMetrics?.avgLikesPerPost || 0)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Likes/Post</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(analyticsData.performanceMetrics?.avgCommentsPerPost || 0)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Comments/Post</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(analyticsData.performanceMetrics?.avgSharesPerPost || 0)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Shares/Post</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(analyticsData.performanceMetrics?.avgViewsPerPost || 0)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Views/Post</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatNumber(analyticsData.performanceMetrics?.avgSavesPerPost || 0)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Saves/Post</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Time to Post */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Best Time to Post
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Best Day</p>
                <p className="text-sm text-muted-foreground">{analyticsData.bestTimeToPost?.bestDayOfWeek || 'N/A'}</p>
              </div>
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Best Hour</p>
                <p className="text-sm text-muted-foreground">{analyticsData.bestTimeToPost?.bestHour || 0}:00</p>
              </div>
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Success Rate</p>
                <p className="text-sm text-muted-foreground">
                  {formatPercentage(analyticsData.bestTimeToPost?.successRateAtBestTime || 0)}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Rankings */}
      {analyticsData.platformRankings && analyticsData.platformRankings.length > 0 && (
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Platform Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.platformRankings.slice(0, 5).map((platform, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{platform.platform}</h4>
                      <Badge variant="secondary">{formatNumber(platform.totalPosts)} posts</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(platform.totalEngagements)} engagements
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatPercentage(platform.successRate)} success rate
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPlatformClick(platform.platform)}
                    className="flex items-center gap-2"
                  >
                    View Details
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Posts */}
      {analyticsData.topPerformingPosts && analyticsData.topPerformingPosts.length > 0 && (
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topPerformingPosts.slice(0, 5).map((post, index) => (
                <div 
                  key={post.post.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium line-clamp-2">{post.post.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary">{post.platform}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(post.totalEngagements)} engagements
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatPercentage(post.engagementRate)} rate
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(post.post.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPostClick(post.post.id)}
                    className="flex items-center gap-2"
                  >
                    View Details
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}