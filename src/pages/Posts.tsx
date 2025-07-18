import { useState, useMemo } from 'react';
import { Search, Plus, Filter, Calendar, Clock, CheckCircle, Circle, Edit, Trash2, Copy, Eye, FileText, Sparkles, ArrowUpDown, X } from 'lucide-react';
import { format } from 'date-fns';
import { usePosts, useDeletePost, useDuplicatePost } from '@/hooks/api/usePosts';
import { PostStatus } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PostDetailsModal } from '@/components/PostDetailsModal';

// Static Header Component - Independent of data fetching
function PostsHeader({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusChange,
  sortBy,
  onSortChange
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: PostStatus | 'all';
  onStatusChange: (value: PostStatus | 'all') => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}) {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      {/* Title and Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground text-sm">Manage and track your social media posts</p>
        </div>
        <Button 
          onClick={() => navigate('/make-post')} 
          className="gap-2 gradient-primary hover-scale"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 bg-background/50 backdrop-blur-sm border-border/50"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-background/80"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm border-border/50">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value={PostStatus.PUBLISHED}>Published</SelectItem>
            <SelectItem value={PostStatus.SCHEDULED}>Scheduled</SelectItem>
            <SelectItem value={PostStatus.DRAFT}>Draft</SelectItem>
            <SelectItem value={PostStatus.FAILED}>Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm border-border/50">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt,desc">Newest First</SelectItem>
            <SelectItem value="createdAt,asc">Oldest First</SelectItem>
            <SelectItem value="updatedAt,desc">Recently Updated</SelectItem>
            <SelectItem value="status,asc">Status</SelectItem>
            <SelectItem value="scheduledFor,desc">Scheduled Date</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}


// Modern No Posts Illustration
function NoPostsIllustration() {
  return (
    <svg
      viewBox="0 0 400 300"
      className="w-48 h-36 mx-auto opacity-70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background gradient circle */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" className="text-blue-100" />
          <stop offset="100%" stopColor="currentColor" className="text-purple-100" />
        </linearGradient>
        <linearGradient id="docGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" className="text-blue-200" />
          <stop offset="100%" stopColor="currentColor" className="text-indigo-200" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <circle cx="200" cy="150" r="120" fill="url(#bgGradient)" />
      
      {/* Floating documents */}
      <g className="animate-pulse">
        {/* Document 1 */}
        <rect x="140" y="100" width="40" height="50" rx="6" fill="url(#docGradient)" transform="rotate(-15 160 125)" />
        <rect x="145" y="110" width="30" height="2" rx="1" fill="white" transform="rotate(-15 160 125)" />
        <rect x="145" y="115" width="25" height="2" rx="1" fill="white" transform="rotate(-15 160 125)" />
        <rect x="145" y="120" width="28" height="2" rx="1" fill="white" transform="rotate(-15 160 125)" />
        
        {/* Document 2 */}
        <rect x="220" y="90" width="40" height="50" rx="6" fill="url(#docGradient)" transform="rotate(15 240 115)" />
        <rect x="225" y="100" width="30" height="2" rx="1" fill="white" transform="rotate(15 240 115)" />
        <rect x="225" y="105" width="25" height="2" rx="1" fill="white" transform="rotate(15 240 115)" />
        <rect x="225" y="110" width="28" height="2" rx="1" fill="white" transform="rotate(15 240 115)" />
        
        {/* Document 3 */}
        <rect x="160" y="180" width="40" height="50" rx="6" fill="url(#docGradient)" transform="rotate(-10 180 205)" />
        <rect x="165" y="190" width="30" height="2" rx="1" fill="white" transform="rotate(-10 180 205)" />
        <rect x="165" y="195" width="25" height="2" rx="1" fill="white" transform="rotate(-10 180 205)" />
        <rect x="165" y="200" width="28" height="2" rx="1" fill="white" transform="rotate(-10 180 205)" />
      </g>
      
      {/* Central icon */}
      <circle cx="200" cy="150" r="25" fill="currentColor" className="text-white" />
      <circle cx="200" cy="150" r="20" fill="currentColor" className="text-blue-500" />
      
      {/* Plus icon */}
      <path 
        d="M200 140 L200 160 M190 150 L210 150" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      
      {/* Sparkles */}
      <g className="animate-pulse">
        <circle cx="130" cy="80" r="2" fill="currentColor" className="text-yellow-400" />
        <circle cx="270" cy="70" r="1.5" fill="currentColor" className="text-blue-400" />
        <circle cx="290" cy="200" r="2" fill="currentColor" className="text-purple-400" />
        <circle cx="110" cy="220" r="1.5" fill="currentColor" className="text-pink-400" />
      </g>
      
      {/* Connecting lines */}
      <g stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" className="text-gray-300">
        <line x1="170" y1="125" x2="185" y2="135" />
        <line x1="215" y1="135" x2="230" y2="125" />
        <line x1="185" y1="165" x2="170" y2="175" />
      </g>
    </svg>
  );
}

// Posts Content Component - Handles data fetching and display
function PostsContent({ 
  searchTerm, 
  statusFilter,
  sortBy,
  onClearFilters 
}: {
  searchTerm: string;
  statusFilter: PostStatus | 'all';
  sortBy: string;
  onClearFilters?: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; postId: string | null }>({ open: false, postId: null });
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Build query params
  const queryParams = useMemo(() => {
    const pageable: any = { page: currentPage, size: pageSize };
    
    // Add sort if specified
    if (sortBy) {
      pageable.sort = [sortBy];
    }
    
    return {
      pageable,
      ...(searchTerm && { searchTerm }),
      ...(statusFilter !== 'all' && { status: statusFilter }),
    };
  }, [currentPage, pageSize, searchTerm, statusFilter, sortBy]);
  
  const { data, isLoading, error, refetch } = usePosts(queryParams);
  const deletePost = useDeletePost();
  const duplicatePost = useDuplicatePost();
  
  const posts = data?.data || [];
  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;
  const hasNext = data?.hasNext || false;
  const hasPrev = data?.hasPrev || false;

  // Reset to first page when search, filter, or sort changes
  useMemo(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter, sortBy]);
  
  const handleDelete = async (postId: string) => {
    try {
      await deletePost.mutateAsync(postId);
      setDeleteDialog({ open: false, postId: null });
      refetch();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };
  
  const handleDuplicate = async (postId: string) => {
    try {
      await duplicatePost.mutateAsync(postId);
      refetch();
    } catch (error) {
      console.error('Failed to duplicate post:', error);
    }
  };
  
  const getStatusIcon = (status: PostStatus) => {
    switch (status) {
      case PostStatus.PUBLISHED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case PostStatus.SCHEDULED:
        return <Clock className="h-4 w-4 text-blue-500" />;
      case PostStatus.DRAFT:
        return <Circle className="h-4 w-4 text-gray-500" />;
      case PostStatus.FAILED:
        return <Circle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getStatusBadge = (status: PostStatus) => {
    const variants = {
      [PostStatus.PUBLISHED]: 'bg-green-100 text-green-800',
      [PostStatus.SCHEDULED]: 'bg-blue-100 text-blue-800',
      [PostStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [PostStatus.FAILED]: 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={`${variants[status]} border-0`}>
        {status.toLowerCase()}
      </Badge>
    );
  };
  
  if (error) {
    return (
      <div className="text-center py-12 px-6">
        <div className="bg-destructive/10 backdrop-blur-sm rounded-2xl p-8 border border-destructive/20">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Posts</h2>
          <p className="text-muted-foreground mb-6">There was an error loading your posts. Please try again.</p>
          <Button onClick={() => refetch()} variant="outline" className="hover-scale">
            <FileText className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3 px-6">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-5 bg-muted/80 rounded-lg w-3/4 mb-3"></div>
                <div className="h-4 bg-muted/60 rounded-lg w-1/2 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-muted/60 rounded-full w-16"></div>
                  <div className="h-6 bg-muted/60 rounded-full w-12"></div>
                </div>
              </div>
              <div className="h-8 w-8 bg-muted/60 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <div className="bg-card/30 backdrop-blur-sm rounded-3xl p-12 border border-border/30">
          <NoPostsIllustration />
          <div className="mt-8 space-y-3">
            <h3 className="text-xl font-semibold">
              {searchTerm || statusFilter !== 'all' ? "No posts found" : "Ready to share your story?"}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              {searchTerm || statusFilter !== 'all' 
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Create your first post and start building your social media presence across all platforms."}
            </p>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => navigate('/make-post')} 
              className="gap-2 gradient-primary hover-scale"
            >
              <Plus className="h-4 w-4" />
              {searchTerm || statusFilter !== 'all' ? "Create New Post" : "Create Your First Post"}
            </Button>
            {(searchTerm || statusFilter !== 'all') && (
              <Button 
                variant="outline" 
                onClick={onClearFilters}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

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
      <div className={`w-6 h-6 rounded-full ${bgColor} flex items-center justify-center text-white text-xs font-bold border-2 border-white`}>
        {platform.charAt(0).toUpperCase()}
      </div>
    );
  };

  // Posts list
  return (
    <>
      <div className="space-y-3 px-6">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className="group bg-card/40 backdrop-blur-sm rounded-xl p-5 border border-border/50 hover:bg-card/60 hover:border-border/80 transition-all duration-200 hover:shadow-md cursor-pointer hover:-translate-y-0.5"
            onClick={() => setSelectedPostId(post.id)}
          >
            <div className="space-y-4">
              {/* Main Content */}
              <div className="space-y-2">
                <p className="text-foreground font-medium text-base leading-relaxed line-clamp-3">
                  {post.content}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {post.status === PostStatus.SCHEDULED && post.scheduledFor
                      ? `Scheduled for ${format(new Date(post.scheduledFor), 'MMM dd, yyyy HH:mm')}`
                      : `Created ${format(new Date(post.createdAt), 'MMM dd, yyyy')}`}
                  </span>
                  {getStatusBadge(post.status)}
                </div>
              </div>
              
              {/* Bottom Section: Social Avatars and Media Count */}
              <div className="flex items-center justify-between">
                {/* Overlapping Social Media Avatars */}
                <div className="flex items-center gap-3">
                  {post.accounts && post.accounts.length > 0 ? (
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {post.accounts.slice(0, 4).map((account, index) => (
                          <div key={account.id} className="relative" style={{ zIndex: 10 - index }}>
                            {getSocialPlatformIcon(account.platform)}
                          </div>
                        ))}
                        {post.accounts.length > 4 && (
                          <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">
                            +{post.accounts.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-gray-400">-</span>
                    </div>
                  )}
                  
                  {/* Media Count */}
                  {post.media && post.media.length > 0 && (
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <FileText className="h-3 w-3" />
                      <span>{post.media.length}</span>
                    </div>
                  )}
                </div>
                
                {/* Status Indicator */}
                <div className="flex items-center gap-2">
                  {getStatusIcon(post.status)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12 px-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={!hasPrev}
            className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {[...Array(Math.min(totalPages, 7))].map((_, i) => {
              let pageIndex = i;
              if (totalPages > 7) {
                if (currentPage <= 3) {
                  pageIndex = i;
                } else if (currentPage >= totalPages - 4) {
                  pageIndex = totalPages - 7 + i;
                } else {
                  pageIndex = currentPage - 3 + i;
                }
              }
              
              return (
                <Button
                  key={pageIndex}
                  variant={currentPage === pageIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageIndex)}
                  className={`w-10 h-10 p-0 ${
                    currentPage === pageIndex 
                      ? "gradient-primary" 
                      : "bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
                  }`}
                >
                  {pageIndex + 1}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!hasNext}
            className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
          >
            Next
          </Button>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, postId: null })}>
        <DialogContent className="bg-background/95 backdrop-blur-md border-border/50">
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
              className="bg-background/50"
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
                  <Clock className="h-4 w-4 animate-spin" />
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
          onClose={() => setSelectedPostId(null)}
          postId={selectedPostId}
        />
      )}
    </>
  );
}

// Main Posts Component
export default function Posts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState('createdAt,desc');
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('createdAt,desc');
  };
  
  return (
    <div className="space-y-0">
      {/* Header directly after topbar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-4">
          <PostsHeader 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={(value) => setStatusFilter(value as PostStatus | 'all')}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
      </div>
      
      {/* Main content area */}
      <div className="space-y-4">
        {/* Dynamic Posts Content */}
        <PostsContent 
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          sortBy={sortBy}
          onClearFilters={handleClearFilters}
        />
      </div>
    </div>
  );
}