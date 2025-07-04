import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Filter
} from "lucide-react"

const analyticsData = {
  overview: {
    totalReach: { value: "24.5K", change: "+12.5%", trend: "up" },
    engagement: { value: "1.2K", change: "+8.3%", trend: "up" },
    followers: { value: "892", change: "+5.1%", trend: "up" },
    posts: { value: "45", change: "-2.1%", trend: "down" }
  },
  platforms: [
    {
      name: "Instagram",
      followers: "2.1K",
      engagement: "4.2%",
      reach: "8.5K",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      posts: 15
    },
    {
      name: "Twitter",
      followers: "1.8K",
      engagement: "3.1%",
      reach: "6.2K",
      color: "bg-twitter",
      posts: 12
    },
    {
      name: "Facebook",
      followers: "3.2K",
      engagement: "2.8%",
      reach: "9.8K",
      color: "bg-facebook",
      posts: 8
    },
    {
      name: "LinkedIn",
      followers: "945",
      engagement: "5.1%",
      reach: "3.2K",
      color: "bg-linkedin",
      posts: 6
    }
  ],
  topPosts: [
    {
      id: 1,
      content: "Check out our latest product update! 🚀 #innovation #tech",
      platform: "Instagram",
      metrics: { reach: "2.1K", likes: 145, comments: 23, shares: 12 },
      date: "2 days ago"
    },
    {
      id: 2,
      content: "Behind the scenes at our office! Great team working...",
      platform: "LinkedIn",
      metrics: { reach: "1.8K", likes: 89, comments: 15, shares: 8 },
      date: "3 days ago"
    },
    {
      id: 3,
      content: "Weekend vibes! What's everyone up to? 🌟",
      platform: "Twitter",
      metrics: { reach: "1.2K", likes: 67, comments: 12, shares: 5 },
      date: "1 week ago"
    }
  ]
}

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track your social media performance and engagement</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hover-lift">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" className="hover-lift">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reach</CardTitle>
            <Eye className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalReach.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">{analyticsData.overview.totalReach.change}</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement</CardTitle>
            <Heart className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.engagement.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">{analyticsData.overview.engagement.change}</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Followers</CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.followers.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">{analyticsData.overview.followers.change}</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Posts</CardTitle>
            <MessageSquare className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.posts.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              <span className="text-red-600">{analyticsData.overview.posts.change}</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platforms">Platform Performance</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
          <TabsTrigger value="audience">Audience Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {analyticsData.platforms.map((platform, index) => (
              <Card key={index} className="shadow-medium hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded ${platform.color}`} />
                    {platform.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Followers</p>
                      <p className="text-2xl font-bold">{platform.followers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Engagement Rate</p>
                      <p className="text-2xl font-bold">{platform.engagement}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Reach</p>
                      <p className="text-lg font-semibold">{platform.reach}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Posts</p>
                      <p className="text-lg font-semibold">{platform.posts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
              <CardDescription>Your most engaging content from the past month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPosts.map((post) => (
                  <div key={post.id} className="flex gap-4 p-4 rounded-lg border hover:bg-accent/20 transition-colors">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{post.platform}</Badge>
                        <span className="text-sm text-muted-foreground">{post.date}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{post.content}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.metrics.reach}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.metrics.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.metrics.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="h-3 w-3" />
                          {post.metrics.shares}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Audience Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Age 18-24</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Age 25-34</span>
                    <span className="text-sm font-medium">40%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Age 35-44</span>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '20%' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Age 45+</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Best Posting Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 rounded bg-accent/20">
                    <span className="text-sm font-medium">Monday 9:00 AM</span>
                    <Badge variant="secondary">High</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded">
                    <span className="text-sm">Wednesday 3:00 PM</span>
                    <Badge variant="outline">Medium</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-accent/20">
                    <span className="text-sm font-medium">Friday 6:00 PM</span>
                    <Badge variant="secondary">High</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded">
                    <span className="text-sm">Sunday 11:00 AM</span>
                    <Badge variant="outline">Medium</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}