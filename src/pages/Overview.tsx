import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ErrorState } from "@/components/ErrorState"
import { format } from "date-fns"
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Share2, 
  Eye,
  Heart,
  MoreHorizontal,
  Edit3,
  Copy,
  Trash2,
  Calendar,
  Clock,
  Plus,
  Loader2,
  Images,
  Play
} from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useOverview, useRecentActivity, useOverviewData } from "@/hooks/api/useOverview"
import { useAccounts, useSocialAccounts } from "@/hooks/useAccounts"
import { PostDetailsModal } from "@/components/PostDetailsModal"
import { useDeletePost } from "@/hooks/api/usePosts"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/PageHeader"
import { useAuth } from "@/hooks/useAuth"

// Helper functions for user profile data
const useUserProfile = () => {
  const { user } = useAuth();
  
  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  };
  
  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  const getAvatarUrl = () => {
    return user?.user_metadata?.avatar_url;
  };
  
  return { getDisplayName, getInitials, getAvatarUrl };
};

// Utility function to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
}

// Helper function to extract meaningful error message
const getErrorMessage = (error: any, fallback: string) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.statusText) return error.response.statusText;
  return fallback;
};

// Media Count Component (same as Posts page)
function MediaCount({ media }: { media: any[] }) {
  if (!media || media.length === 0) return null;
  
  // Count images and videos
  const imageCount = media.filter(item => item.type === 'image').length;
  const videoCount = media.filter(item => item.type === 'video').length;
  
  return (
    <div className="flex items-center gap-3">
      {imageCount > 0 && (
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
          <Images className="h-4 w-4" />
          <span className="text-sm font-semibold">{imageCount}</span>
        </div>
      )}
      {videoCount > 0 && (
        <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
          <Play className="h-4 w-4 fill-current" />
          <span className="text-sm font-semibold">{videoCount}</span>
        </div>
      )}
    </div>
  );
}

// Calculate growth rate percentage (placeholder logic)
const calculateGrowthPercentage = (current: number, growth: number): string => {
  if (growth > 0) return `+${Math.round(growth)}%`
  if (growth < 0) return `${Math.round(growth)}%`
  return "0%"
}


// Component for stats cards with isolated error handling
function StatsSection() {
  const { data: overviewStats, isLoading, error, refetch } = useOverview()

  if (isLoading) {
    return (
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
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-4">
          <Card className="shadow-soft">
            <CardContent className="flex items-center justify-center py-8">
              <ErrorState
                title="Failed to load statistics"
                description={getErrorMessage(error, "Unable to fetch your dashboard statistics.")}
                onRetry={refetch}
                size="sm"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // SVG Components for visual indicators
  const PostsSVG = () => (
    <svg className="w-8 h-5" viewBox="0 0 40 20" fill="none">
      <path d="M2 8h6v8H2V8zM12 4h6v12h-6V4zM22 6h6v10h-6V6zM32 2h6v14h-6V2z" 
            fill="currentColor" className="text-blue-200" />
      <circle cx="5" cy="6" r="1" fill="currentColor" className="text-blue-500" />
      <circle cx="15" cy="2" r="1" fill="currentColor" className="text-blue-500" />
      <circle cx="25" cy="4" r="1" fill="currentColor" className="text-blue-500" />
      <circle cx="35" cy="1" r="1" fill="currentColor" className="text-blue-500" />
    </svg>
  )

  const ReachSVG = () => (
    <svg className="w-8 h-5" viewBox="0 0 40 20" fill="none">
      <circle cx="20" cy="10" r="8" stroke="currentColor" strokeWidth="1" 
              fill="none" className="text-green-300" />
      <circle cx="20" cy="10" r="5" stroke="currentColor" strokeWidth="1" 
              fill="none" className="text-green-400" />
      <circle cx="20" cy="10" r="2" fill="currentColor" className="text-green-500" />
      <path d="M12 10L8 6M12 10L8 14M28 10L32 6M28 10L32 14" 
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" 
            className="text-green-400" />
    </svg>
  )

  const EngagementSVG = () => (
    <svg className="w-8 h-5" viewBox="0 0 40 20" fill="none">
      <path d="M20 3L22 8h5l-4 3 1.5 5L20 14l-4.5 2L17 11l-4-3h5l2-5z" 
            fill="currentColor" className="text-pink-300" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" className="text-pink-400" />
      <circle cx="32" cy="12" r="1.5" fill="currentColor" className="text-pink-400" />
      <circle cx="6" cy="14" r="1" fill="currentColor" className="text-pink-300" />
      <circle cx="34" cy="6" r="1" fill="currentColor" className="text-pink-300" />
    </svg>
  )

  const AccountsSVG = () => (
    <svg className="w-8 h-5" viewBox="0 0 40 20" fill="none">
      <circle cx="10" cy="10" r="3" fill="currentColor" className="text-purple-400" />
      <circle cx="20" cy="10" r="3" fill="currentColor" className="text-purple-500" />
      <circle cx="30" cy="10" r="3" fill="currentColor" className="text-purple-400" />
      <path d="M13 10c0 3 3 5 7 5s7-2 7-5M3 10c0 3 3 5 7 5M30 15c4 0 7-2 7-5" 
            stroke="currentColor" strokeWidth="1" fill="none" className="text-purple-300" />
    </svg>
  )

  // Create stats cards with real API data
  const statsCards = overviewStats ? [
    {
      title: "Total Posts",
      value: formatNumber(overviewStats.totalPosts),
      visual: <PostsSVG />,
      icon: MessageSquare,
      color: "text-blue-600"
    },
    {
      title: "Total Reach",
      value: formatNumber(overviewStats.totalReach),
      visual: <ReachSVG />,
      icon: Eye,
      color: "text-green-600"
    },
    {
      title: "Engagement",
      value: formatNumber(overviewStats.totalEngagement),
      visual: <EngagementSVG />,
      icon: Heart,
      color: "text-pink-600"
    },
    {
      title: "Active Accounts",
      value: overviewStats.activeAccounts.toString(),
      visual: <AccountsSVG />,
      icon: Users,
      color: "text-purple-600"
    }
  ] : []

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => (
        <Card key={index} className="hover-lift gradient-card border-0 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center">
                {stat.visual}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Component for recent posts with isolated error handling
function RecentPostsSection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPostId = searchParams.get('post');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; postId: string | null }>({ open: false, postId: null })
  const { data: apiResponse, isLoading, error, refetch } = useRecentActivity(5)
  const deletePost = useDeletePost()
  const { toast } = useToast()
  const { getDisplayName, getInitials, getAvatarUrl } = useUserProfile()
  
  // Handle modal open/close via URL params
  const openModal = (postId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('post', postId);
    setSearchParams(newSearchParams);
  };
  
  const closeModal = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('post');
    setSearchParams(newSearchParams);
  };
  
  // Extract posts from API response structure
  const recentPosts = apiResponse?.data || []

  // Handle delete post
  const handleDelete = async (postId: string) => {
    try {
      await deletePost.mutateAsync(postId)
      setDeleteDialog({ open: false, postId: null })
      refetch()
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted.",
      })
    } catch (error) {
      console.error('Failed to delete post:', error)
      toast({
        title: "Failed to delete post",
        description: "There was an error deleting the post. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Helper function to format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return '1 day ago'
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  // Helper function to get status badge styling (same as Posts page)
  const getStatusBadge = (status: string) => {
    const statusUpper = status.toUpperCase()
    const variants = {
      'PUBLISHED': 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-800',
      'SCHEDULED': 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-800',
      'PUBLISHING': 'bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-800',
      'DRAFT': 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-800',
      'FAILED': 'bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-800',
    };
    
    const variant = variants[statusUpper as keyof typeof variants] || variants['DRAFT'];
    return (
      <Badge className={`${variant} text-xs font-medium px-2 py-0.5 rounded-full border`}>
        {status.toLowerCase()}
      </Badge>
    );
  }

  // Helper function for social platform icons
  const getSocialPlatformIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    const colors = {
      twitter: 'bg-blue-500',
      facebook: 'bg-blue-600', 
      instagram: 'bg-pink-500',
      linkedin: 'bg-blue-700',
      tiktok: 'bg-black',
      youtube: 'bg-red-500',
    };
    
    const bgColor = colors[platformLower as keyof typeof colors] || 'bg-gray-500';
    
    return (
      <div className={`w-5 h-5 rounded-full ${bgColor} flex items-center justify-center text-white text-xs font-bold border border-white dark:border-gray-900`}>
        {platform.charAt(0).toUpperCase()}
      </div>
    );
  };

  // Empty state SVG for recent posts
  const EmptyPostsSVG = () => (
    <svg
      viewBox="0 0 400 300"
      className="w-32 h-24 mx-auto opacity-60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <circle cx="200" cy="150" r="80" fill="currentColor" className="text-gray-100" />
      
      {/* Document/Post icons */}
      <g className="text-gray-300">
        <rect x="160" y="120" width="30" height="40" rx="4" fill="currentColor" />
        <rect x="165" y="130" width="20" height="2" fill="white" />
        <rect x="165" y="135" width="15" height="2" fill="white" />
        <rect x="165" y="140" width="18" height="2" fill="white" />
        
        <rect x="200" y="110" width="30" height="40" rx="4" fill="currentColor" />
        <rect x="205" y="120" width="20" height="2" fill="white" />
        <rect x="205" y="125" width="15" height="2" fill="white" />
        <rect x="205" y="130" width="18" height="2" fill="white" />
      </g>
      
      {/* Pen/Write icon in center */}
      <circle cx="200" cy="180" r="12" fill="currentColor" className="text-blue-100" />
      <path 
        d="M195 175 L205 175 L202 185 Z" 
        fill="currentColor"
        className="text-blue-400"
      />
      <line x1="198" y1="175" x2="202" y2="175" stroke="currentColor" strokeWidth="1" className="text-blue-400" />
    </svg>
  )

  if (isLoading) {
    return (
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Posts
          </CardTitle>
          <CardDescription>Your latest social media activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-4 rounded-lg border">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Posts
          </CardTitle>
          <CardDescription>Your latest social media activity</CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorState
            title="Failed to load recent posts"
            description={getErrorMessage(error, "Unable to fetch your recent social media activity.")}
            onRetry={refetch}
            size="sm"
          />
        </CardContent>
      </Card>
    )
  }

  if (!recentPosts || recentPosts.length === 0) {
    return (
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Posts
          </CardTitle>
          <CardDescription>Your latest social media activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <EmptyPostsSVG />
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-foreground">No recent posts</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                You haven't published any posts yet. Create your first post to get started.
              </p>
            </div>
            <Button 
              variant="default" 
              size="sm" 
              className="mt-4 gradient-primary hover-scale" 
              onClick={() => window.location.href = '/make-post'}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Recent Posts
        </CardTitle>
        <CardDescription>Your latest social media activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {recentPosts.map((post: any) => (
            <article 
              key={post.id} 
              className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 hover:shadow-lg overflow-hidden w-full flex-shrink-0 flex flex-col relative cursor-pointer"
              onClick={() => openModal(post.id)}
            >
              {/* Top username - subtle */}
              <div className="px-5 pt-4 pb-2">
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                  @{getDisplayName().toLowerCase().replace(/\s+/g, '')}
                </span>
              </div>

              {/* Main content - now takes center stage */}
              <div className="px-5 pb-3 flex-1 flex flex-col min-h-0">
                <p className="text-base font-semibold text-gray-900 dark:text-white leading-relaxed">
                  {post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}
                </p>
              </div>

              {/* Bottom info bar - cleaner without divider */}
              <div className="px-5 pb-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Date */}
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                      {post.status === "SCHEDULED" && post.scheduledFor
                        ? format(new Date(post.scheduledFor), 'MMM dd, HH:mm')
                        : format(new Date(post.createdAt), 'MMM dd, yyyy')}
                    </span>
                    
                    {/* Media count indicators */}
                    {post.media && post.media.length > 0 && (
                      <MediaCount media={post.media} />
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    {/* Status badge */}
                    {getStatusBadge(post.status)}
                  </div>
                </div>
              </div>
              
              {/* Hover button for opening modal */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openModal(post.id);
                }}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center z-10 shadow-lg"
              >
                <Eye className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
        
        {/* View All Posts Link */}
        <div className="pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-center text-muted-foreground hover:text-foreground"
            onClick={() => window.location.href = '/posts'}
          >
            View All Posts
          </Button>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, postId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Post
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone and will remove the post from all connected platforms.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, postId: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog.postId && handleDelete(deleteDialog.postId)}
              disabled={deletePost.isPending}
              className="gap-2"
            >
              {deletePost.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Post
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Details Modal */}
      {selectedPostId && (
        <PostDetailsModal
          isOpen={!!selectedPostId}
          onClose={closeModal}
          postId={selectedPostId}
        />
      )}
    </Card>
  )
}

// Component for connected accounts with isolated error handling
function ConnectedAccountsSection() {
  const { data: accounts = [], isLoading, error, refetch } = useSocialAccounts()

  // Helper function to get platform avatar info
  const getPlatformInfo = (platform: string) => {
    const platformLower = platform.toLowerCase()
    switch (platformLower) {
      case 'instagram':
        return { 
          initials: 'IG', 
          className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
          name: 'Instagram'
        }
      case 'twitter':
      case 'x':
        return { 
          initials: 'TW', 
          className: 'bg-blue-500 text-white',
          name: 'Twitter'
        }
      case 'facebook':
        return { 
          initials: 'FB', 
          className: 'bg-blue-600 text-white',
          name: 'Facebook'
        }
      case 'linkedin':
        return { 
          initials: 'LI', 
          className: 'bg-blue-700 text-white',
          name: 'LinkedIn'
        }
      case 'tiktok':
        return { 
          initials: 'TT', 
          className: 'bg-black text-white',
          name: 'TikTok'
        }
      case 'youtube':
        return { 
          initials: 'YT', 
          className: 'bg-red-600 text-white',
          name: 'YouTube'
        }
      default:
        return { 
          initials: platform.slice(0, 2).toUpperCase(), 
          className: 'bg-gray-500 text-white',
          name: platform
        }
    }
  }

  // Helper function to get status badge
  const getStatusBadge = (account: any) => {
    if (account.status === 'ACTIVE' && account.isConnected) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
    }
    if (account.status === 'ERROR' || !account.isConnected) {
      return <Badge variant="destructive">Disconnected</Badge>
    }
    if (account.status === 'PENDING') {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
    return <Badge variant="outline">Inactive</Badge>
  }

  // Beautiful Empty State SVG Component
  const EmptyStateSVG = () => (
    <svg
      viewBox="0 0 400 300"
      className="w-32 h-24 mx-auto opacity-60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background elements */}
      <circle cx="200" cy="150" r="100" fill="currentColor" className="text-gray-100" />
      <circle cx="200" cy="150" r="60" fill="currentColor" className="text-gray-50" />
      
      {/* Social media icons floating */}
      <g className="text-gray-300">
        {/* Instagram icon */}
        <rect x="160" y="110" width="20" height="20" rx="6" fill="currentColor" />
        <circle cx="170" cy="120" r="6" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="175" cy="115" r="1" fill="white" />
        
        {/* Twitter/X icon */}
        <path 
          d="M230 110 L245 125 L250 120 L235 105 L230 110 Z M235 125 L250 140 L245 145 L230 130 L235 125 Z" 
          fill="currentColor" 
        />
        
        {/* Facebook icon */}
        <rect x="160" y="160" width="20" height="20" rx="3" fill="currentColor" />
        <path d="M168 165 L168 175 M165 170 L175 170" stroke="white" strokeWidth="2" />
        
        {/* LinkedIn icon */}
        <rect x="220" y="160" width="20" height="20" rx="3" fill="currentColor" />
        <circle cx="225" cy="165" r="2" fill="white" />
        <rect x="223" y="170" width="4" height="7" fill="white" />
        <rect x="230" y="168" width="4" height="9" fill="white" />
        <rect x="235" y="165" width="4" height="12" fill="white" />
      </g>
      
      {/* Plus icon in center */}
      <circle cx="200" cy="150" r="15" fill="currentColor" className="text-blue-100" />
      <path 
        d="M200 140 L200 160 M190 150 L210 150" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
        className="text-blue-400"
      />
      
      {/* Connecting lines */}
      <g className="text-gray-200" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3">
        <line x1="180" y1="130" x2="190" y2="140" />
        <line x1="220" y1="130" x2="210" y2="140" />
        <line x1="180" y1="170" x2="190" y2="160" />
        <line x1="220" y1="170" x2="210" y2="160" />
      </g>
    </svg>
  )

  if (isLoading) {
    return (
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mb-1"></div>
                <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
              </div>
              <div className="h-5 w-12 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            title="Failed to load accounts"
            description={getErrorMessage(error, "Unable to fetch your connected social media accounts.")}
            onRetry={refetch}
            size="sm"
          />
        </CardContent>
      </Card>
    )
  }

  if (!accounts || accounts.length === 0) {
    return (
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <EmptyStateSVG />
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-foreground">No accounts connected</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Connect your social media accounts to start managing your posts and analytics.
              </p>
            </div>
            <Button 
              variant="default" 
              size="sm" 
              className="mt-4 gradient-primary hover-scale" 
              onClick={() => window.location.href = '/accounts'}
            >
              <Plus className="h-4 w-4 mr-2" />
              Connect Account
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {accounts.map((account) => {
          const platformInfo = getPlatformInfo(account.platform)
          return (
            <div key={account.id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className={platformInfo.className}>
                  {platformInfo.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {account.handle ? `@${account.handle}` : account.displayName || 'Unknown Account'}
                </p>
                <p className="text-xs text-muted-foreground">{platformInfo.name}</p>
              </div>
              <div className="flex-shrink-0">
                {getStatusBadge(account)}
              </div>
            </div>
          )
        })}
        
        {/* Add Account Button */}
        <div className="pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => window.location.href = '/accounts'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Account
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Overview() {
  const navigate = useNavigate()

  return (
    <div className="space-y-0">
      {/* Header */}
      <PageHeader>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
            <p className="text-muted-foreground text-sm">Welcome back! Here's what's happening with your social media.</p>
          </div>
          <Button 
            className="gradient-primary hover-scale"
            onClick={() => navigate('/make-post')}
            size="sm"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Quick Post
          </Button>
        </div>
      </PageHeader>

      {/* Main content area */}
      <div className="space-y-6 p-6">
        {/* Stats Cards - Isolated Error Handling */}
        <StatsSection />

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Posts - Isolated Error Handling */}
        <div className="lg:col-span-2">
          <RecentPostsSection />
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start gradient-primary hover-scale"
                onClick={() => navigate('/make-post')}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Create New Post
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover-lift"
                onClick={() => navigate('/accounts')}
              >
                <Users className="h-4 w-4 mr-2" />
                Add Account
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover-lift"
                onClick={() => navigate('/analytics')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Connected Accounts - Isolated Error Handling */}
          <ConnectedAccountsSection />
        </div>
        </div>
      </div>
    </div>
  )
}