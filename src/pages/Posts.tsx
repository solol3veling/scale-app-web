import { useState, useMemo, useRef, useCallback, useEffect, memo } from 'react';
import { Search, Plus, Filter, Calendar, Clock, CheckCircle, Circle, Edit, Trash2, Copy, Eye, FileText, Video, Sparkles, ArrowUpDown, X, Check, RefreshCw, Images, Play, Camera, Film } from 'lucide-react';
import { format } from 'date-fns';
import { usePosts, useDeletePost, useDuplicatePost } from '@/hooks/api/usePosts';
import { useMultiplePostEvents } from '@/hooks/api/usePostEvents';
import { PostStatus, Post, Platform } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PostDetailsModal } from '@/components/PostDetailsModal';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import { PostEventsDeleteModal } from '@/components/PostEventsDeleteModal';
import { PageHeader } from '@/components/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { toast } from 'sonner';

const useUserProfile = () => {
  const { user } = useAuth();
  const displayName = useMemo(() => {
    return user?.user_metadata?.full_name || user?.email?.split('@')?.[0] || 'User';
  }, [user?.user_metadata?.full_name, user?.email]);
  
  const initials = useMemo(() => {
    return displayName?.split(' ')?.map(n => n?.[0])?.join('')?.toUpperCase()?.slice(0, 2) || 'U';
  }, [displayName]);
  
  const avatarUrl = useMemo(() => {
    return user?.user_metadata?.avatar_url;
  }, [user?.user_metadata?.avatar_url]);
  
  const getDisplayName = () => displayName;
  const getInitials = () => initials;
  const getAvatarUrl = () => avatarUrl;
  
  return { getDisplayName, getInitials, getAvatarUrl };
};

const MAX_POST_DESCRIPTION_LENGTH = 20;

const truncateWords = (text: string, maxWords: number) => {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) {
    return text;
  }
  return words.slice(0, maxWords).join(' ') + '...';
};

function MediaCount({ media }: { media: { type: 'image' | 'video'; url: string; }[] }) {
  if (!media?.length) return null;
  
  const imageCount = media?.filter(item => item?.type === 'image')?.length || 0;
  const videoCount = media?.filter(item => item?.type === 'video')?.length || 0;
  
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

function PostsHeader({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusChange,
  sortBy,
  onSortChange,
  selectedPostIds,
  selectAllChecked,
  onSelectAllChange,
  onDeleteSelected,
  onClearSelection,
  selectionMode,
  onRefresh,
  isRefreshing
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: PostStatus | 'all';
  onStatusChange: (value: PostStatus | 'all') => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  selectedPostIds: Set<string>;
  selectAllChecked: boolean;
  onSelectAllChange: (posts: Post[]) => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  selectionMode: boolean;
  onRefresh: () => void;
  isRefreshing?: boolean;
}) {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground text-sm">
            {selectionMode 
              ? `${selectedPostIds.size} post${selectedPostIds.size !== 1 ? 's' : ''} selected`
              : "Manage and track your social media posts"
            }
          </p>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          {selectedPostIds.size > 0 ? (
            <>
              <Button 
                variant="outline" 
                size="xs" 
                onClick={onClearSelection}
                className="text-gray-600 hover:text-gray-700 whitespace-nowrap h-7 px-2 text-xs"
              >
                Clear
              </Button>
              <Button 
                variant="destructive" 
                size="xs" 
                onClick={onDeleteSelected}
                className="gap-1 whitespace-nowrap h-7 px-2 text-xs"
              >
                <Trash2 className="h-3 w-3" />
                Delete {selectedPostIds.size}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Refresh posts"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                onClick={() => navigate('/make-post')} 
                className="gap-2 gradient-primary hover-scale whitespace-nowrap"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Create Post
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
        <div className="flex-1 relative min-w-[120px] sm:min-w-[150px]">
          {selectedPostIds.size > 0 ? (
            <div className="flex items-center gap-2 h-10 px-3 bg-background/50 backdrop-blur-sm border border-border/50 rounded-md">
              <input 
                type="checkbox" 
                className="rounded" 
                checked={selectAllChecked}
                onChange={() => onSelectAllChange([])}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Select All Posts</span>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
        
        {selectedPostIds.size === 0 && (
          <>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-10 sm:w-[180px] bg-background/50 backdrop-blur-sm border-border/50 px-2 sm:px-4 h-10" title="Filter posts by status">
                <Filter className="h-4 w-4 sm:mr-2" />
                <div className="hidden sm:block">
                  <SelectValue placeholder="Filter" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value={PostStatus.PUBLISHED}>Published</SelectItem>
                <SelectItem value={PostStatus.SCHEDULED}>Scheduled</SelectItem>
                <SelectItem value={PostStatus.PUBLISHING}>Publishing</SelectItem>
                <SelectItem value={PostStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={PostStatus.FAILED}>Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-10 sm:w-[180px] bg-background/50 backdrop-blur-sm border-border/50 px-2 sm:px-4 h-10" title="Sort posts">
                <ArrowUpDown className="h-4 w-4 sm:mr-2" />
                <div className="hidden sm:block">
                  <SelectValue placeholder="Sort" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt,desc">Newest First</SelectItem>
                <SelectItem value="createdAt,asc">Oldest First</SelectItem>
                <SelectItem value="updatedAt,desc">Recently Updated</SelectItem>
                <SelectItem value="status,asc">Status</SelectItem>
                <SelectItem value="scheduledFor,desc">Scheduled Date</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    </div>
  );
}


function NoPostsIllustration() {
  return (
    <svg
      viewBox="0 0 400 300"
      className="w-48 h-36 mx-auto opacity-70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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
      
      <circle cx="200" cy="150" r="120" fill="url(#bgGradient)" />
      
      <g className="animate-pulse">
        <rect x="140" y="100" width="40" height="50" rx="6" fill="url(#docGradient)" transform="rotate(-15 160 125)" />
        <rect x="145" y="110" width="30" height="2" rx="1" fill="white" transform="rotate(-15 160 125)" />
        <rect x="145" y="115" width="25" height="2" rx="1" fill="white" transform="rotate(-15 160 125)" />
        <rect x="145" y="120" width="28" height="2" rx="1" fill="white" transform="rotate(-15 160 125)" />
        
        <rect x="220" y="90" width="40" height="50" rx="6" fill="url(#docGradient)" transform="rotate(15 240 115)" />
        <rect x="225" y="100" width="30" height="2" rx="1" fill="white" transform="rotate(15 240 115)" />
        <rect x="225" y="105" width="25" height="2" rx="1" fill="white" transform="rotate(15 240 115)" />
        <rect x="225" y="110" width="28" height="2" rx="1" fill="white" transform="rotate(15 240 115)" />
        
        <rect x="160" y="180" width="40" height="50" rx="6" fill="url(#docGradient)" transform="rotate(-10 180 205)" />
        <rect x="165" y="190" width="30" height="2" rx="1" fill="white" transform="rotate(-10 180 205)" />
        <rect x="165" y="195" width="25" height="2" rx="1" fill="white" transform="rotate(-10 180 205)" />
        <rect x="165" y="200" width="28" height="2" rx="1" fill="white" transform="rotate(-10 180 205)" />
      </g>
      
      <circle cx="200" cy="150" r="25" fill="currentColor" className="text-white" />
      <circle cx="200" cy="150" r="20" fill="currentColor" className="text-blue-500" />
      
      <path 
        d="M200 140 L200 160 M190 150 L210 150" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      
      <g className="animate-pulse">
        <circle cx="130" cy="80" r="2" fill="currentColor" className="text-yellow-400" />
        <circle cx="270" cy="70" r="1.5" fill="currentColor" className="text-blue-400" />
        <circle cx="290" cy="200" r="2" fill="currentColor" className="text-purple-400" />
        <circle cx="110" cy="220" r="1.5" fill="currentColor" className="text-pink-400" />
      </g>
      
      <g stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" className="text-gray-300">
        <line x1="170" y1="125" x2="185" y2="135" />
        <line x1="215" y1="135" x2="230" y2="125" />
        <line x1="185" y1="165" x2="170" y2="175" />
      </g>
    </svg>
  );
}

function PostsContent({ 
  searchTerm, 
  statusFilter,
  sortBy,
  onClearFilters,
  selectedPostIds,
  selectAllChecked,
  onSelectAllChange,
  onDeleteSelected: _, // We'll use our own handleBulkDelete
  onClearSelection,
  selectionMode,
  onPostLongPress,
  onPostSelect,
  triggerDelete,
  onDeleteTriggered,
  triggerSelectAll,
  onSelectAllTriggered,
  userProfile,
  refetchRef
}: {
  searchTerm: string;
  statusFilter: PostStatus | 'all';
  sortBy: string;
  onClearFilters?: () => void;
  selectedPostIds: Set<string>;
  selectAllChecked: boolean;
  onSelectAllChange: (posts: Post[]) => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  selectionMode: boolean;
  onPostLongPress: (postId: string) => void;
  onPostSelect: (postId: string) => void;
  triggerDelete: boolean;
  onDeleteTriggered: () => void;
  triggerSelectAll: boolean;
  onSelectAllTriggered: () => void;
  userProfile: { getDisplayName: () => string; getInitials: () => string; getAvatarUrl: () => string | undefined; };
  refetchRef: React.MutableRefObject<(() => void) | null>;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; postId: string | null }>({ open: false, postId: null });
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPostId = searchParams.get('post');
  
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [postsToDelete, setPostsToDelete] = useState<Post[]>([]);
  const [fetchEventsEnabled, setFetchEventsEnabled] = useState(false);
  
  const queryClient = useQueryClient();
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (triggerDelete) {
      handleBulkDelete();
      onDeleteTriggered();
    }
  }, [triggerDelete]);

  useEffect(() => {
    if (triggerSelectAll) {
      handleSelectAll();
      onSelectAllTriggered();
    }
  }, [triggerSelectAll]);
  
  const openModal = useCallback((postId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('post', postId);
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);
  
  const closeModal = useCallback(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('post');
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);
  
  const queryParams = useMemo(() => {
    const pageable: { page: number; size: number; sort?: string[]; } = { page: currentPage, size: pageSize };
    
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
  
  // Set refetch function for parent component
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch, refetchRef]);
  
  // Fetch events for posts being deleted (similar to Calendar)
  const postsWithAccountsIds = Array.isArray(postsToDelete) 
    ? postsToDelete
        .filter(post => post?.accounts && Array.isArray(post.accounts) && post.accounts.length > 0)
        .map(post => post?.id)
        .filter(id => id && typeof id === 'string')
    : [];
  
  const { 
    data: postEventsData = {}, 
    isLoading: eventsLoading,
    isError: eventsError 
  } = useMultiplePostEvents(postsWithAccountsIds, fetchEventsEnabled);
  
  // Mutation for deleting posts
  const deletePostsMutation = useMutation({
    mutationFn: async (postIds: string[]) => {
      if (postIds.length === 1) {
        return api.posts.delete(postIds[0]);
      } else {
        return api.posts.deleteMultiple(postIds);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Posts deleted successfully!');
      onClearSelection();
      setShowDeleteConfirmModal(false);
      setShowEventsModal(false);
      setPostsToDelete([]);
      setFetchEventsEnabled(false);
    },
    onError: (error: unknown) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error occurred';
      toast.error(`Failed to delete posts: ${errorMessage}`);
    }
  });

  // Mutation for deleting events
  const deleteEventsMutation = useMutation({
    mutationFn: async ({ postId, eventIds }: { postId: string; eventIds: string[] }) => {
      return api.posts.deletePostEvents(postId, eventIds);
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post-events', postId] });
      queryClient.invalidateQueries({ queryKey: ['post-events'] });
      toast.success('Events deleted successfully!');
    },
    onError: (error: unknown) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error occurred';
      toast.error(`Failed to delete events: ${errorMessage}`);
    }
  });
  
  const posts = data?.data || [];
  const totalPages = data ? Math.ceil((data?.total || 0) / (data?.limit || 1)) : 0;
  const hasNext = data?.hasNext || false;
  const hasPrev = data?.hasPrev || false;

  // Helper function to extract meaningful error message
  const getErrorMessage = (error: unknown) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.error) return error.response.data.error;
    if (error?.response?.statusText) return error.response.statusText;
    return 'There was an error loading your posts. Please try again.';
  };

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
      // Error handled by mutation
    }
  };
  
  const handleDuplicate = async (postId: string) => {
    try {
      await duplicatePost.mutateAsync(postId);
      refetch();
    } catch (error) {
      // Error handled by mutation
    }
  };
  
  // Handle bulk delete like in Calendar
  const handleBulkDelete = () => {
    if (selectedPostIds.size === 0) return;
    
    const selectedPosts = posts?.filter(p => selectedPostIds?.has(p?.id)) || [];
    
    const postsWithAccounts = selectedPosts?.filter(p => 
      p?.accounts?.length > 0
    ) || [];
    
    if (postsWithAccounts.length > 0) {
      // Set posts to delete and enable events fetching
      setPostsToDelete(postsWithAccounts);
      setFetchEventsEnabled(true);
      // Show events deletion modal (it will handle the loading state)
      setShowEventsModal(true);
    } else {
      // No social accounts, show simple confirmation modal
      setShowDeleteConfirmModal(true);
    }
  };

  const handleConfirmDelete = () => {
    const postIds = Array.from(selectedPostIds);
    // Close the modal and clear selection immediately when user confirms
    setShowDeleteConfirmModal(false);
    onClearSelection(); // Clear selection state immediately
    deletePostsMutation.mutate(postIds);
  };

  const handleDeleteEvents = (postId: string, eventIds: string[]) => {
    deleteEventsMutation.mutate({ postId, eventIds });
  };

  // Handle Select All functionality
  const handleSelectAll = () => {
    onSelectAllChange(posts);
  };
  
  const getStatusIcon = (status: PostStatus) => {
    switch (status) {
      case PostStatus.PUBLISHED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case PostStatus.SCHEDULED:
        return <Clock className="h-4 w-4 text-blue-500" />;
      case PostStatus.PUBLISHING:
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
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
      [PostStatus.PUBLISHED]: 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-800',
      [PostStatus.SCHEDULED]: 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-800',
      [PostStatus.PUBLISHING]: 'bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-800',
      [PostStatus.DRAFT]: 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-800',
      [PostStatus.FAILED]: 'bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-800',
    };
    
    return (
      <Badge className={`${variants[status]} text-xs font-medium px-2 py-0.5 rounded-full border`}>
        {status.toLowerCase()}
      </Badge>
    );
  };
  
  if (error) {
    return (
      <div className="text-center py-12 px-6">
        <div className="bg-destructive/10 backdrop-blur-sm rounded-2xl p-8 border border-destructive/20">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Posts</h2>
          <p className="text-muted-foreground mb-6">{getErrorMessage(error)}</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 px-6 py-6">
        {[...Array(10)].map((_, i) => (
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

  const getSocialPlatformIcon = (platform: Platform) => {
    const colors: Record<Platform, string> = {
      [Platform.TWITTER]: 'bg-blue-500',
      [Platform.FACEBOOK]: 'bg-blue-600', 
      [Platform.INSTAGRAM]: 'bg-pink-500',
      [Platform.LINKEDIN]: 'bg-blue-700',
      [Platform.GOOGLE]: 'bg-gray-500',
    };
    
    const platformCharMap: Record<Platform, string> = {
      [Platform.FACEBOOK]: 'F',
      [Platform.TWITTER]: 'X',
      [Platform.INSTAGRAM]: 'I',
      [Platform.LINKEDIN]: 'L',
      [Platform.GOOGLE]: 'G',
    };
    
    const bgColor = colors[platform] || 'bg-gray-500';
    const char = platformCharMap[platform] || platform?.charAt(0)?.toUpperCase() || '';
    
    return (
      <div className={`w-5 h-5 rounded-full ${bgColor} flex items-center justify-center text-white text-xs font-bold border border-white dark:border-gray-900`}>
        {char}
      </div>
    );
  };

  const PostCard = memo(({ 
    post, 
    isSelected, 
    onLongPress, 
    onSelect, 
    onOpenModal,
    userProfile,
    selectionMode
  }: { 
    post: Post;
    isSelected: boolean;
    onLongPress: (postId: string) => void;
    onSelect: (postId: string) => void;
    onOpenModal: (postId: string) => void;
    userProfile: { getDisplayName: () => string; getInitials: () => string; getAvatarUrl: () => string | undefined; };
    selectionMode: boolean;
  }) => {
    const { getDisplayName, getInitials, getAvatarUrl } = userProfile;
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const touchStartTime = useRef<number>(0);
    const mouseDownTime = useRef<number>(0);
    const [isLongPressing, setIsLongPressing] = useState(false);
    const longPressExecuted = useRef<boolean>(false);
    
    const clearLongPressTimer = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      setIsLongPressing(false);
    };

    const resetLongPressFlag = () => {
      setTimeout(() => {
        longPressExecuted.current = false;
      }, 200);
    };

    const handleTouchStart = () => {
      touchStartTime.current = Date.now();
      setIsLongPressing(true);
      longPressExecuted.current = false;
      longPressTimer.current = setTimeout(() => {
        longPressExecuted.current = true;
        onLongPress(post.id);
        setIsLongPressing(false);
      }, 500);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
      const pressDuration = Date.now() - touchStartTime.current;
      clearLongPressTimer();
      
      // If long press was executed, prevent any further event handling
      if (longPressExecuted.current) {
        e.preventDefault();
        e.stopPropagation();
        resetLongPressFlag();
        return;
      }
      
      // Only handle click if it wasn't a long press
      if (pressDuration < 500) {
        if (selectionMode) {
          onSelect(post.id);
        } else {
          onOpenModal(post.id);
        }
      }
      
      resetLongPressFlag();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      mouseDownTime.current = Date.now();
      setIsLongPressing(true);
      longPressExecuted.current = false;
      longPressTimer.current = setTimeout(() => {
        longPressExecuted.current = true;
        onLongPress(post.id);
        setIsLongPressing(false);
      }, 500);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
      const pressDuration = Date.now() - mouseDownTime.current;
      clearLongPressTimer();
      
      // If long press was executed, prevent any further event handling
      if (longPressExecuted.current) {
        e.preventDefault();
        e.stopPropagation();
        resetLongPressFlag();
        return;
      }
      
      // Only handle click if it wasn't a long press
      if (pressDuration < 500) {
        if (selectionMode) {
          onSelect(post.id);
        } else {
          onOpenModal(post.id);
        }
      }
      
      resetLongPressFlag();
    };

    const handleMouseLeave = () => {
      clearLongPressTimer();
    };

    const handleClick = (e: React.MouseEvent) => {
      // Prevent click event if long press was executed
      if (longPressExecuted.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      // In selection mode, clicking the card should select/deselect
      if (selectionMode) {
        onSelect(post.id);
      } else {
        // Not in selection mode, open modal
        onOpenModal(post.id);
      }
    };

    const handleSelectClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(post.id);
    };

    return (
      <article 
        className={`group bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-200 hover:shadow-lg overflow-hidden w-full flex flex-col relative cursor-pointer ${
          isSelected 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
        } ${
          isLongPressing ? 'scale-95' : ''
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
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
            {truncateWords(post?.content || '', MAX_POST_DESCRIPTION_LENGTH)}
          </p>
        </div>

        {/* Bottom info bar - cleaner without divider */}
        <div className="px-5 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Date */}
              <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                {post?.status === PostStatus.SCHEDULED && post?.scheduledFor
                  ? format(new Date(post?.scheduledFor), 'MMM dd, HH:mm')
                  : format(new Date(post?.createdAt || new Date()), 'MMM dd, yyyy')}
              </span>
              
              {post?.media?.length > 0 && (
                <MediaCount media={post?.media} />
              )}
            </div>
            
            <div className="flex items-center">
              {/* Status badge */}
              {getStatusBadge(post?.status || PostStatus.DRAFT)}
            </div>
          </div>
        </div>
        
        {/* Hover button for opening modal */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenModal(post?.id);
          }}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center z-10 shadow-lg"
        >
          <Eye className="h-4 w-4" />
        </button>
        
      </article>
    );
  });

  // Posts list
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 px-6 py-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isSelected={selectedPostIds.has(post.id)}
            onLongPress={onPostLongPress}
            onSelect={onPostSelect}
            onOpenModal={openModal}
            userProfile={userProfile}
            selectionMode={selectionMode}
          />
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
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        postCount={selectedPostIds.size}
        isLoading={deletePostsMutation.isPending}
      />

      {/* Events Delete Modal */}
      <PostEventsDeleteModal
        isOpen={showEventsModal}
        onClose={() => {
          setShowEventsModal(false);
          setPostsToDelete([]);
          setFetchEventsEnabled(false);
        }}
        onConfirm={handleConfirmDelete}
        onDeleteEvents={handleDeleteEvents}
        posts={postsToDelete}
        postEventsData={postEventsData}
        eventsLoading={eventsLoading}
        isLoading={deletePostsMutation.isPending || deleteEventsMutation.isPending}
      />

      {/* Post Details Modal */}
      {selectedPostId && (
        <PostDetailsModal
          isOpen={!!selectedPostId}
          onClose={closeModal}
          postId={selectedPostId}
        />
      )}
    </>
  );
}

// Main Posts Component
export default function Posts() {
  const [filters, setFilters] = useState({
    searchTerm: '',
    statusFilter: 'all' as PostStatus | 'all',
    sortBy: 'createdAt,desc'
  });
  
  const [selection, setSelection] = useState({
    selectedPostIds: new Set<string>(),
    selectAllChecked: false,
    selectionMode: false,
    triggerDelete: false,
    triggerSelectAll: false
  });
  
  const refetchRef = useRef<(() => void) | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get user profile data once at the top level
  const userProfile = useUserProfile();
  
  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      statusFilter: 'all',
      sortBy: 'createdAt,desc'
    });
  };

  const handlePostLongPress = useCallback((postId: string) => {
    setSelection(prev => ({
      ...prev,
      selectionMode: true,
      selectedPostIds: new Set(prev.selectedPostIds).add(postId)
    }));
  }, []);

  const handlePostSelect = useCallback((postId: string) => {
    setSelection(prev => {
      const newSelected = new Set(prev.selectedPostIds);
      if (newSelected.has(postId)) {
        newSelected.delete(postId);
      } else {
        newSelected.add(postId);
      }
      
      return {
        ...prev,
        selectedPostIds: newSelected,
        selectionMode: newSelected.size > 0,
        selectAllChecked: newSelected.size === 0 ? false : prev.selectAllChecked
      };
    });
  }, []);

  const handleSelectAllChange = (posts: Post[]) => {
    if (posts.length === 0) {
      setSelection(prev => ({ ...prev, triggerSelectAll: true }));
      return;
    }
    
    setSelection(prev => {
      const newSelected = new Set(prev.selectedPostIds);
      
      if (prev.selectAllChecked) {
        posts.forEach(post => newSelected.delete(post.id));
      } else {
        posts.forEach(post => newSelected.add(post.id));
      }
      
      return {
        ...prev,
        selectedPostIds: newSelected,
        selectAllChecked: !prev.selectAllChecked
      };
    });
  };

  const handleClearSelection = () => {
    setSelection({
      selectedPostIds: new Set(),
      selectAllChecked: false,
      selectionMode: false,
      triggerDelete: false,
      triggerSelectAll: false
    });
  };

  const handleDeleteSelected = () => {
    setSelection(prev => ({ ...prev, triggerDelete: true }));
  };
  
  return (
    <div className="space-y-0">
      {/* Header directly after topbar */}
      <PageHeader>
        <PostsHeader 
          searchTerm={filters.searchTerm}
          onSearchChange={(value) => setFilters(prev => ({ ...prev, searchTerm: value }))}
          statusFilter={filters.statusFilter}
          onStatusChange={(value) => setFilters(prev => ({ ...prev, statusFilter: value as PostStatus | 'all' }))}
          sortBy={filters.sortBy}
          onSortChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
          selectedPostIds={selection.selectedPostIds}
          selectAllChecked={selection.selectAllChecked}
          onSelectAllChange={() => {}}
          onDeleteSelected={handleDeleteSelected}
          onClearSelection={handleClearSelection}
          selectionMode={selection.selectionMode}
          onRefresh={async () => {
            try {
              setIsRefreshing(true);
              if (refetchRef.current) {
                await refetchRef.current();
              }
            } catch (error) {
              // Error handled silently
            } finally {
              setIsRefreshing(false);
            }
          }}
          isRefreshing={isRefreshing}
        />
      </PageHeader>
      
      {/* Main content area */}
      <div className="space-y-4">
        {/* Dynamic Posts Content */}
        <PostsContent 
          searchTerm={filters.searchTerm}
          statusFilter={filters.statusFilter}
          sortBy={filters.sortBy}
          onClearFilters={handleClearFilters}
          selectedPostIds={selection.selectedPostIds}
          selectAllChecked={selection.selectAllChecked}
          onSelectAllChange={handleSelectAllChange}
          onDeleteSelected={handleDeleteSelected}
          onClearSelection={handleClearSelection}
          selectionMode={selection.selectionMode}
          onPostLongPress={handlePostLongPress}
          onPostSelect={handlePostSelect}
          triggerDelete={selection.triggerDelete}
          onDeleteTriggered={() => setSelection(prev => ({ ...prev, triggerDelete: false }))}
          triggerSelectAll={selection.triggerSelectAll}
          onSelectAllTriggered={() => setSelection(prev => ({ ...prev, triggerSelectAll: false }))}
          userProfile={userProfile}
          refetchRef={refetchRef}
        />
      </div>
    </div>
  );
}