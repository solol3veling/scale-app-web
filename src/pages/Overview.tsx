import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  Copy,
  Trash2,
  Calendar,
  Clock,
  Plus,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useOverview, useRecentActivity } from "@/hooks/api/useOverview"
import { useSocialAccounts } from "@/hooks/useAccounts"
import { PostDetailsModal } from "@/components/PostDetailsModal"
import { useDeletePost } from "@/hooks/api/usePosts"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/PageHeader"
import { useUserProfile, formatNumber, getErrorMessage, calculateGrowthPercentage, formatRelativeTime, getStatusBadge, getSocialPlatformIcon, getPlatformInfo, getAccountStatusBadge } from "@/utils/overviewHelpers.tsx";
import { MediaCount } from "@/components/MediaCount";
import { PostsSVG, ReachSVG, EngagementSVG, AccountsSVG, EmptyPostsSVG, EmptyStateSVG } from "@/components/svgs/OverviewSVGs";


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

  

  // Create stats cards with real API data
  const statsCards = overviewStats ? [
    {
      title: "Total Posts",
      value: formatNumber(overviewStats.totalPosts)
    }
  ] : []

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statsCards.map((stat, index) => (
        <Card key={index} className="p-6 h-full">
          <div className="flex flex-col justify-between h-full">
            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
            <p className="text-3xl font-bold text-foreground mt-auto">{stat.value}</p>
          </div>
        </Card>
      ))}
      {/* Connected Accounts Card */}
      <ConnectedAccountsCard />
      {/* Quick Actions Card */}
      <QuickActionsCard />
    </div>
  )
}

// Component for connected accounts card in stats row
function ConnectedAccountsCard() {
  const { data: accounts, isLoading, error, refetch } = useSocialAccounts()

  if (isLoading) {
    return (
      <Card className="p-6 h-full">
        <div className="flex flex-col justify-between h-full">
          <p className="text-sm font-medium text-muted-foreground">Connected Accounts</p>
          <p className="text-3xl font-bold text-foreground mt-auto">...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 h-full">
        <div className="flex flex-col justify-between h-full">
          <p className="text-sm font-medium text-muted-foreground">Connected Accounts</p>
          <div className="flex items-center justify-between mt-auto">
            <p className="text-3xl font-bold text-foreground">Error</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  if (!accounts || accounts.length === 0) {
    return (
      <Card className="p-6 h-full cursor-pointer" onClick={() => window.location.href = '/accounts'}>
        <div className="flex flex-col justify-between h-full">
          <p className="text-sm font-medium text-muted-foreground">Connected Accounts</p>
          <div className="flex items-center justify-between mt-auto">
            <p className="text-3xl font-bold text-foreground">0</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                window.location.href = '/accounts'
              }}
              className="h-8 w-8 p-0 rounded-full"
              title="Connect account"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 h-full cursor-pointer" onClick={() => window.location.href = '/accounts'}>
      <div className="flex flex-col justify-between h-full">
        <p className="text-sm font-medium text-muted-foreground">Connected Accounts</p>
        <div className="flex items-center justify-between mt-auto">
          <p className="text-3xl font-bold text-foreground">{accounts.length}</p>
          <div className="flex items-center">
            {/* Stacked avatars */}
            <div className="flex -space-x-2">
              {accounts.slice(0, 3).map((account) => {
                const platformInfo = getPlatformInfo(account.platform)
                return (
                  <Avatar key={account.id} className="h-8 w-8 border-2 border-white dark:border-gray-900">
                    <AvatarImage src={account.avatar_url || undefined} />
                    <AvatarFallback className={`${platformInfo.className} text-xs`}>
                      {platformInfo.initials}
                    </AvatarFallback>
                  </Avatar>
                )
              })}
              {accounts.length > 3 && (
                <div className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">+{accounts.length - 3}</span>
                </div>
              )}
              {/* Always show add button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  window.location.href = '/accounts'
                }}
                className="h-8 w-8 p-0 rounded-full ml-1"
                title="Add account"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Component for quick actions card in stats row
function QuickActionsCard() {
  const navigate = useNavigate()

  return (
    <Card className="p-6 h-full">
      <div className="flex flex-col h-full">
        <p className="text-sm font-medium text-muted-foreground mb-4">Quick Actions</p>
        <div className="flex flex-col justify-center flex-1 space-y-2">
          <Button
            variant="default"
            size="sm"
            className="w-full justify-start text-xs h-8"
            onClick={() => navigate('/make-post')}
          >
            <Share2 className="h-3 w-3 mr-2" />
            Create Post
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs h-8"
            onClick={() => navigate('/accounts')}
          >
            <Users className="h-3 w-3 mr-2" />
            Add Account
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs h-8"
            onClick={() => navigate('/analytics')}
          >
            <TrendingUp className="h-3 w-3 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>
    </Card>
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
      
      toast({
        title: "Failed to delete post",
        description: "There was an error deleting the post. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Recent Posts</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/posts'}
            className="text-muted-foreground hover:text-foreground"
          >
            View All
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Platforms</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-48 bg-gray-200 animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-1">
                      <div className="h-4 w-4 bg-gray-200 animate-pulse rounded-full"></div>
                      <div className="h-4 w-4 bg-gray-200 animate-pulse rounded-full"></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-8 bg-gray-200 animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-4 bg-gray-200 animate-pulse rounded"></div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Recent Posts</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/posts'}
            className="text-muted-foreground hover:text-foreground"
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <ErrorState
            title="Failed to load recent posts"
            description={getErrorMessage(error, "Unable to fetch your recent posts.")}
            onRetry={refetch}
            size="sm"
          />
        </CardContent>
      </Card>
    )
  }

  if (!recentPosts || recentPosts.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Recent Posts</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/posts'}
            className="text-muted-foreground hover:text-foreground"
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <EmptyPostsSVG />
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-foreground">No posts yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Start creating posts to see your recent activity here.
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              className="mt-4 hover-scale"
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Recent Posts</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/posts'}
          className="text-muted-foreground hover:text-foreground"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Platforms</TableHead>
              <TableHead>Media</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPosts.slice(0, 5).map((post: any) => (
              <TableRow
                key={post.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => openModal(post.id)}
              >
                <TableCell className="font-medium">
                  <span className="text-sm truncate max-w-[300px] block">
                    {post.content?.length > 60 ? `${post.content.substring(0, 60)}...` : post.content}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-1">
                    {post.accounts?.slice(0, 3).map((account: any, index: number) => (
                      <div
                        key={account.id}
                        className="relative flex-shrink-0 border border-white dark:border-gray-900 rounded-full"
                        style={{ zIndex: 3 - index }}
                      >
                        {getSocialPlatformIcon(account.platform, "h-4 w-4")}
                      </div>
                    ))}
                    {post.accounts?.length > 3 && (
                      <div
                        className="relative flex items-center justify-center w-4 h-4 text-xs font-medium text-muted-foreground bg-gray-200 dark:bg-gray-700 border border-white dark:border-gray-900 rounded-full"
                        style={{ zIndex: 0 }}
                      >
                        +{post.accounts.length - 3}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {post.media && post.media.length > 0 && (
                    <div className="flex items-center gap-1">
                      {post.media.filter((m: any) => m.type === 'image').length > 0 && (
                        <div className="flex items-center gap-0.5">
                          <div className="w-2 h-2 rounded-sm bg-blue-500"></div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            {post.media.filter((m: any) => m.type === 'image').length}
                          </span>
                        </div>
                      )}
                      {post.media.filter((m: any) => m.type === 'video').length > 0 && (
                        <div className="flex items-center gap-0.5">
                          <div className="w-2 h-2 rounded-sm bg-purple-500"></div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            {post.media.filter((m: any) => m.type === 'video').length}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(post.status)}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground font-medium">
                    {post.status === 'SCHEDULED' && post.scheduledFor
                      ? format(new Date(post.scheduledFor), 'MMM dd, HH:mm')
                      : formatRelativeTime(post.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openModal(post.id); }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, postId: post.id }); }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Post Details Modal */}
        {selectedPostId && (
          <PostDetailsModal
            postId={selectedPostId}
            isOpen={true}
            onClose={closeModal}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, postId: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Post</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this post? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
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
              >
                {deletePost.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
            <p className="text-muted-foreground text-sm">Welcome back! Here's what's happening with your social media.</p>
          </div>
          <Button
            variant="default"
            className="hover-scale"
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

        {/* Recent Posts - Full Width */}
        <RecentPostsSection />
      </div>
    </div>
  )
}