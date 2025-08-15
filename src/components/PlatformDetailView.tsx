import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  BarChart3,
  PieChart
} from "lucide-react"

interface PlatformDetailViewProps {
  platform: {
    platform: string;
    data: any;
  };
}

export function PlatformDetailView({ platform }: PlatformDetailViewProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    }
    return num.toString()
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const platformData = platform.data;
  const platformName = platform.platform;
  
  // Platform color mapping
  const getPlatformColor = (name: string) => {
    const colors = {
      'Facebook': 'bg-blue-600',
      'Twitter': 'bg-blue-500',
      'Instagram': 'bg-pink-500',
      'LinkedIn': 'bg-blue-700',
      'Google': 'bg-green-500'
    };
    return colors[name as keyof typeof colors] || 'bg-gray-500';
  };

  const isEnhancedData = 'likes' in platformData;

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <Card className="shadow-medium border-l-4" style={{ borderLeftColor: getPlatformColor(platformName).replace('bg-', '') }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded ${getPlatformColor(platformName)}`} />
            {platformName} Performance
          </CardTitle>
          <CardDescription>Detailed analytics for this platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{platformData.posts}</div>
              <p className="text-sm text-muted-foreground">Total Posts</p>
            </div>
            
            {isEnhancedData ? (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{formatNumber(platformData.views)}</div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{formatNumber(platformData.impressions)}</div>
                  <p className="text-sm text-muted-foreground">Total Impressions</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{formatNumber(platformData.reach)}</div>
                  <p className="text-sm text-muted-foreground">Total Reach</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{formatNumber(platformData.engagement)}</div>
                  <p className="text-sm text-muted-foreground">Total Engagement</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Breakdown */}
      {isEnhancedData && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover-lift gradient-card border-0 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Likes</CardTitle>
              <Heart className="h-5 w-5 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(platformData.likes)}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatNumber(Math.round(platformData.likes / platformData.posts))} per post
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift gradient-card border-0 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Comments</CardTitle>
              <MessageSquare className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(platformData.comments)}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatNumber(Math.round(platformData.comments / platformData.posts))} per post
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift gradient-card border-0 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Shares</CardTitle>
              <Share2 className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(platformData.shares)}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatNumber(Math.round(platformData.shares / platformData.posts))} per post
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Engagement Analysis
            </CardTitle>
            <CardDescription>How your content performs on {platformName}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isEnhancedData ? (
                <>
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="font-medium">Total Engagement</span>
                    <span className="text-lg font-bold">
                      {formatNumber(platformData.likes + platformData.comments + platformData.shares)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Likes Distribution</span>
                      <span>{formatPercentage((platformData.likes / (platformData.likes + platformData.comments + platformData.shares)) * 100)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-pink-500 h-2 rounded-full" 
                        style={{ width: `${(platformData.likes / (platformData.likes + platformData.comments + platformData.shares)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Comments Distribution</span>
                      <span>{formatPercentage((platformData.comments / (platformData.likes + platformData.comments + platformData.shares)) * 100)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(platformData.comments / (platformData.likes + platformData.comments + platformData.shares)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Shares Distribution</span>
                      <span>{formatPercentage((platformData.shares / (platformData.likes + platformData.comments + platformData.shares)) * 100)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${(platformData.shares / (platformData.likes + platformData.comments + platformData.shares)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="font-medium">Engagement Rate</span>
                    <span className="text-lg font-bold">
                      {formatPercentage((platformData.engagement / platformData.reach) * 100)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <span className="font-medium">Avg Engagement per Post</span>
                    <span className="text-lg font-bold">
                      {formatNumber(Math.round(platformData.engagement / platformData.posts))}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <span className="font-medium">Avg Reach per Post</span>
                    <span className="text-lg font-bold">
                      {formatNumber(Math.round(platformData.reach / platformData.posts))}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Platform Insights
            </CardTitle>
            <CardDescription>Specific insights for {platformName}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Publishing Activity</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  You've published {platformData.posts} posts on {platformName}
                </p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getPlatformColor(platformName)}`} />
                  <span className="text-xs">Active platform</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {isEnhancedData ? (
                  <>
                    <div className="text-center p-3 border rounded">
                      <div className="font-medium">{formatNumber(platformData.views)}</div>
                      <div className="text-muted-foreground text-xs">Views</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="font-medium">{formatNumber(platformData.impressions)}</div>
                      <div className="text-muted-foreground text-xs">Impressions</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center p-3 border rounded">
                      <div className="font-medium">{formatNumber(platformData.reach)}</div>
                      <div className="text-muted-foreground text-xs">Total Reach</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="font-medium">{formatNumber(platformData.engagement)}</div>
                      <div className="text-muted-foreground text-xs">Engagement</div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Performance Status</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isEnhancedData ? 
                    'Enhanced analytics available with detailed engagement metrics' :
                    'Basic analytics showing reach and engagement data'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform-specific Recommendations */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Platform Recommendations</CardTitle>
          <CardDescription>Optimizations specific to {platformName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Content Strategy</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  {platformData.posts > 10 ? 
                    'Maintain consistent posting frequency' : 
                    'Consider increasing posting frequency'
                  }
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  {isEnhancedData && platformData.shares > platformData.likes * 0.1 ?
                    'Your content is highly shareable - continue current strategy' :
                    'Focus on creating more shareable content'
                  }
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  Monitor best posting times for {platformName}
                </li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Engagement Tips</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  {isEnhancedData && platformData.comments > 0 ?
                    'Good audience interaction - keep engaging with comments' :
                    'Encourage more comments by asking questions'
                  }
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  Use platform-specific hashtags and features
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  Post when your {platformName} audience is most active
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}