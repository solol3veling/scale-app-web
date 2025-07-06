import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Share2, 
  Eye,
  Heart,
  MoreHorizontal,
  Calendar,
  Clock,
  Plus,
  Loader2
} from "lucide-react"
import { useOverview } from "@/hooks/useOverview"
import { useAccounts } from "@/hooks/useAccounts"

const statsCards = [
  {
    title: "Total Posts",
    value: "245",
    change: "+12%",
    trend: "up",
    icon: MessageSquare,
    color: "text-blue-600"
  },
  {
    title: "Total Reach",
    value: "12.5K",
    change: "+18%",
    trend: "up", 
    icon: Eye,
    color: "text-green-600"
  },
  {
    title: "Engagement",
    value: "892",
    change: "+7%",
    trend: "up",
    icon: Heart,
    color: "text-pink-600"
  },
  {
    title: "Accounts",
    value: "8",
    change: "+2",
    trend: "up",
    icon: Users,
    color: "text-purple-600"
  }
]

const recentPosts = [
  {
    id: 1,
    content: "Check out our latest product update! 🚀 #innovation #tech",
    platforms: ["Instagram", "Twitter", "Facebook"],
    status: "published",
    engagement: { likes: 45, comments: 12, shares: 8 },
    publishedAt: "2 hours ago",
    image: "/placeholder-post-1.jpg"
  },
  {
    id: 2,
    content: "Behind the scenes at our office! Great team working on amazing projects.",
    platforms: ["LinkedIn", "Instagram"],
    status: "scheduled",
    scheduledFor: "Tomorrow at 3:00 PM",
    image: "/placeholder-post-2.jpg"
  },
  {
    id: 3,
    content: "Weekend vibes! What's everyone up to? 🌟",
    platforms: ["Twitter", "Facebook"],
    status: "published",
    engagement: { likes: 23, comments: 5, shares: 3 },
    publishedAt: "1 day ago"
  }
]

export default function Overview() {
  const { data: overviewStats, isLoading, error } = useOverview()
  const { data: accounts = [] } = useAccounts()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load dashboard data</p>
        <Button variant="outline" className="mt-4">Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your social media.</p>
        </div>
        <Button className="gradient-primary hover-scale">
          <Share2 className="h-4 w-4 mr-2" />
          Quick Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover-lift gradient-card border-0 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600">{stat.change}</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Posts
              </CardTitle>
              <CardDescription>Your latest social media activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex gap-4 p-4 rounded-lg border hover:bg-accent/20 transition-colors">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm leading-relaxed">{post.content}</p>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.platforms.map((platform) => (
                        <Badge key={platform} variant="secondary" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                      <Badge 
                        variant={post.status === "published" ? "default" : "outline"}
                        className={post.status === "published" ? "bg-green-100 text-green-800" : ""}
                      >
                        {post.status}
                      </Badge>
                    </div>

                    {post.status === "published" && post.engagement && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.engagement.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.engagement.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="h-3 w-3" />
                          {post.engagement.shares}
                        </span>
                        <span className="flex items-center gap-1 ml-auto">
                          <Clock className="h-3 w-3" />
                          {post.publishedAt}
                        </span>
                      </div>
                    )}

                    {post.status === "scheduled" && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {post.scheduledFor}
                      </div>
                    )}
                  </div>
                  
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gradient-primary hover-scale">
                <Share2 className="h-4 w-4 mr-2" />
                Create New Post
              </Button>
              <Button variant="outline" className="w-full justify-start hover-lift">
                <Users className="h-4 w-4 mr-2" />
                Add Account
              </Button>
              <Button variant="outline" className="w-full justify-start hover-lift">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-instagram text-white">IG</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">@mycompany</p>
                  <p className="text-xs text-muted-foreground">Instagram</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-twitter text-white">TW</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">@mycompany</p>
                  <p className="text-xs text-muted-foreground">Twitter</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-facebook text-white">FB</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">My Company</p>
                  <p className="text-xs text-muted-foreground">Facebook</p>
                </div>
                <Badge variant="outline">Inactive</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}