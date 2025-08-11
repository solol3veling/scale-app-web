import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Image, 
  Video, 
  Hash, 
  AtSign, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  TrendingUp,
  Target
} from "lucide-react"
import { ContentAnalyticsData } from "@/types/api"

interface ContentAnalyticsProps {
  data: ContentAnalyticsData;
}

export function ContentAnalytics({ data }: ContentAnalyticsProps) {
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

  return (
    <div className="space-y-6">
      {/* Overall Content Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overallMetrics.totalPosts)}</div>
            <p className="text-xs text-muted-foreground">All content created</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published Posts</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overallMetrics.publishedPosts)}</div>
            <p className="text-xs text-muted-foreground">Successfully published</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <Target className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(data.overallMetrics.publishingSuccessRate)}</div>
            <p className="text-xs text-muted-foreground">Publishing performance</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Posts/Day</CardTitle>
            <Calendar className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overallMetrics.avgPostsPerDay.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Publishing frequency</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{formatNumber(data.overallMetrics.publishedPosts)}</div>
            <p className="text-sm text-muted-foreground">
              {formatPercentage((data.overallMetrics.publishedPosts / data.overallMetrics.totalPosts) * 100)} of total
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{formatNumber(data.overallMetrics.scheduledPosts)}</div>
            <p className="text-sm text-muted-foreground">
              {formatPercentage((data.overallMetrics.scheduledPosts / data.overallMetrics.totalPosts) * 100)} of total
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{formatNumber(data.overallMetrics.draftPosts)}</div>
            <p className="text-sm text-muted-foreground">
              {formatPercentage((data.overallMetrics.draftPosts / data.overallMetrics.totalPosts) * 100)} of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
          <CardDescription>Content success rate by platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.platformBreakdown.map((platform, index) => {
              const platformInfo = {
                FACEBOOK: { name: 'Facebook', color: 'bg-blue-600' },
                TWITTER: { name: 'Twitter', color: 'bg-blue-500' },
                INSTAGRAM: { name: 'Instagram', color: 'bg-pink-500' },
                LINKEDIN: { name: 'LinkedIn', color: 'bg-blue-700' },
                GOOGLE: { name: 'Google', color: 'bg-green-500' }
              };
              
              const info = platformInfo[platform.platform] || { name: platform.platform, color: 'bg-gray-500' };
              
              return (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${info.color}`} />
                    <span className="font-medium">{info.name}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{platform.totalPosts}</div>
                      <div className="text-muted-foreground text-xs">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">{platform.successfulPosts}</div>
                      <div className="text-muted-foreground text-xs">Success</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-red-600">{platform.failedPosts}</div>
                      <div className="text-muted-foreground text-xs">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{formatPercentage(platform.successRate)}</div>
                      <div className="text-muted-foreground text-xs">Rate</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content Composition */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Media Usage
            </CardTitle>
            <CardDescription>How you use different media types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Media Usage Rate</span>
              <Badge variant="secondary">{formatPercentage(data.contentComposition.mediaUsageRate)}</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Images Only</span>
                </div>
                <span className="font-medium">{data.contentComposition.postsWithImages}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Videos Only</span>
                </div>
                <span className="font-medium">{data.contentComposition.postsWithVideos}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Mixed Media</span>
                </div>
                <span className="font-medium">{data.contentComposition.postsWithBoth}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Text Only</span>
                </div>
                <span className="font-medium">{data.contentComposition.textOnlyPosts}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Content Elements
            </CardTitle>
            <CardDescription>Hashtags and mentions usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="text-2xl font-bold">{formatNumber(data.overallMetrics.totalHashtags)}</div>
                <div className="text-xs text-muted-foreground">Total Hashtags</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <div className="text-2xl font-bold">{formatNumber(data.overallMetrics.totalMentions)}</div>
                <div className="text-xs text-muted-foreground">Total Mentions</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Avg Hashtags/Post</span>
                <span className="font-medium">{data.contentComposition.avgHashtagsPerPost.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Mentions/Post</span>
                <span className="font-medium">{data.contentComposition.avgMentionsPerPost.toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Publishing Behavior */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Publishing Behavior</CardTitle>
          <CardDescription>How and when you publish content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h4 className="font-medium mb-3">Multi-Platform</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Multi-platform Posts</span>
                  <span className="font-medium">{data.publishingBehavior.multiPlatformPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Multi-platform Rate</span>
                  <span className="font-medium">{formatPercentage(data.publishingBehavior.multiPlatformRate)}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Scheduling</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Scheduled Posts</span>
                  <span className="font-medium">{data.publishingBehavior.scheduledPublishPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Scheduling Rate</span>
                  <span className="font-medium">{formatPercentage(data.publishingBehavior.schedulingRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Lead Time</span>
                  <span className="font-medium">{data.publishingBehavior.avgSchedulingLeadTimeHours.toFixed(1)}h</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Consistency</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Consistency Score</span>
                  <span className="font-medium">{formatPercentage(data.publishingBehavior.consistencyScore)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Immediate Posts</span>
                  <span className="font-medium">{data.publishingBehavior.immediatePublishPosts}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Hashtags & Mentions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Top Hashtags
            </CardTitle>
            <CardDescription>Most frequently used hashtags</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.contentComposition.topHashtags.slice(0, 10).map((hashtag, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm font-mono">#{hashtag}</span>
                  <Badge variant="outline">#{index + 1}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AtSign className="h-5 w-5" />
              Top Mentions
            </CardTitle>
            <CardDescription>Most frequently mentioned accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.contentComposition.topMentions.slice(0, 10).map((mention, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm font-mono">@{mention}</span>
                  <Badge variant="outline">#{index + 1}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Content */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Top Content</CardTitle>
          <CardDescription>Your most successful posts by engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topContent.slice(0, 5).map((content, index) => (
              <div key={content.postId} className="flex gap-4 p-4 rounded-lg border hover:bg-accent/20 transition-colors">
                <div className="flex-shrink-0">
                  <Badge variant="secondary">#{index + 1}</Badge>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{content.contentPreview}</span>
                    <Badge variant="outline">{content.platformCount} platform{content.platformCount > 1 ? 's' : ''}</Badge>
                    {content.hasMedia && <Badge variant="outline">Media</Badge>}
                    {content.hashtagCount > 0 && <Badge variant="outline">{content.hashtagCount} hashtags</Badge>}
                    {content.mentionCount > 0 && <Badge variant="outline">{content.mentionCount} mentions</Badge>}
                  </div>
                  {content.engagementData.hasEngagementData && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>👍 {formatNumber(content.engagementData.totalLikes)}</span>
                      <span>💬 {formatNumber(content.engagementData.totalComments)}</span>
                      <span>🔄 {formatNumber(content.engagementData.totalShares)}</span>
                      <span className="text-green-600 font-medium">
                        {formatPercentage(content.engagementData.avgEngagementRate)} engagement
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(content.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}