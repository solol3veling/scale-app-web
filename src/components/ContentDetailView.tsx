import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  TrendingUp,
  Calendar,
  Hash,
  AtSign,
  Image,
  Video,
  FileText,
  Users,
  BarChart3
} from "lucide-react"

interface ContentDetailViewProps {
  content: {
    postId: string;
    contentPreview: string;
    data: any;
  };
}

export function ContentDetailView({ content }: ContentDetailViewProps) {
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

  const post = content.data;
  
  // Extract engagement data from the post (now only available in analytics contexts)
  // Check multiple possible sources since engagement is no longer part of regular Post objects
  const engagement = post.engagement || post.engagementData || {};
  const hasEngagementData = engagement && Object.keys(engagement).length > 0;

  return (
    <div className="space-y-6">
      {/* Content Overview */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
          <CardDescription>Full content and metadata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">Content</h4>
              <p className="text-sm bg-muted/30 p-4 rounded-lg leading-relaxed">
                {post.content}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {'publishedAt' in post && post.publishedAt 
                    ? `Published ${new Date(post.publishedAt).toLocaleDateString()}`
                    : 'createdAt' in post 
                      ? `Created ${new Date(post.createdAt).toLocaleDateString()}`
                      : 'Date not available'}
                </span>
              </div>
              
              {'platformCount' in post && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{post.platformCount} platform{post.platformCount > 1 ? 's' : ''}</span>
                </div>
              )}
              
              {'hasMedia' in post && post.hasMedia && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  Media
                </Badge>
              )}
              
              {'hashtagCount' in post && post.hashtagCount > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {post.hashtagCount} hashtags
                </Badge>
              )}
              
              {'mentionCount' in post && post.mentionCount > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <AtSign className="h-3 w-3" />
                  {post.mentionCount} mentions
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      {hasEngagementData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Views/Reach */}
          {'views' in engagement || 'reach' in engagement ? (
            <Card className="hover-lift gradient-card border-0 shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {'views' in engagement ? 'Views' : 'Reach'}
                </CardTitle>
                <Eye className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(engagement.views || engagement.reach || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {'views' in engagement ? 'Total views' : 'Total reach'}
                </p>
              </CardContent>
            </Card>
          ) : null}

          {/* Likes */}
          {engagement.likes !== undefined && (
            <Card className="hover-lift gradient-card border-0 shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Likes</CardTitle>
                <Heart className="h-5 w-5 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(engagement.likes)}</div>
                <p className="text-xs text-muted-foreground">Total likes received</p>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          {engagement.comments !== undefined && (
            <Card className="hover-lift gradient-card border-0 shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Comments</CardTitle>
                <MessageSquare className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(engagement.comments)}</div>
                <p className="text-xs text-muted-foreground">Total comments</p>
              </CardContent>
            </Card>
          )}

          {/* Shares */}
          {engagement.shares !== undefined && (
            <Card className="hover-lift gradient-card border-0 shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Shares</CardTitle>
                <Share2 className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(engagement.shares)}</div>
                <p className="text-xs text-muted-foreground">Total shares</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Platform Breakdown */}
      {'accounts' in post && post.accounts && post.accounts.length > 0 && (
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Platform Breakdown</CardTitle>
            <CardDescription>Performance across different platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {post.accounts.map((account: any, index: number) => {
                const platformInfo = {
                  FACEBOOK: { name: 'Facebook', color: 'bg-blue-600' },
                  TWITTER: { name: 'Twitter', color: 'bg-blue-500' },
                  INSTAGRAM: { name: 'Instagram', color: 'bg-pink-500' },
                  LINKEDIN: { name: 'LinkedIn', color: 'bg-blue-700' },
                  GOOGLE: { name: 'Google', color: 'bg-green-500' }
                };
                
                const info = platformInfo[account.platform] || { 
                  name: account.platform, 
                  color: 'bg-gray-500' 
                };
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded ${info.color}`} />
                      <div>
                        <p className="font-medium">{info.name}</p>
                        <p className="text-sm text-muted-foreground">@{account.handle}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {account.followers ? `${formatNumber(Number(account.followers))} followers` : 'Followers data unavailable'}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      {'engagementRate' in post && (
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatPercentage(post.engagementRate)}
                </div>
                <p className="text-sm text-muted-foreground">Engagement Rate</p>
              </div>
              
              {'totalEngagement' in post && (
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {formatNumber(post.totalEngagement)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Engagement</p>
                </div>
              )}
              
              {'totalImpressions' in post && (
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {formatNumber(post.totalImpressions)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Impressions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Performance Relative to Other Posts */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Performance Ranking</CardTitle>
          <CardDescription>How this post compares to your other content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <h4 className="font-medium">Content Performance</h4>
                <p className="text-sm text-muted-foreground">
                  This post shows detailed engagement metrics across platforms
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Pro Analytics</span>
                </div>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-semibold mb-2">Multi-Platform</div>
                <p className="text-xs text-muted-foreground">
                  Published across {('platformCount' in post ? post.platformCount : post.accounts?.length) || 1} platform(s)
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-semibold mb-2">
                  {hasEngagementData ? 'Tracked' : 'Pending'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {hasEngagementData ? 'Engagement metrics available' : 'Awaiting engagement data'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}