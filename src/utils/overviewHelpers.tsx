import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

// Helper functions for user profile data
export const useUserProfile = () => {
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
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
}

// Helper function to extract meaningful error message
export const getErrorMessage = (error: any, fallback: string) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.statusText) return error.response.statusText;
  return fallback;
};

// Calculate growth rate percentage (placeholder logic)
export const calculateGrowthPercentage = (current: number, growth: number): string => {
  if (growth > 0) return `+${Math.round(growth)}%`
  if (growth < 0) return `${Math.round(growth)}%`
  return "0%"
}

// Helper function to format relative time
export const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours} hours ago`
  if (diffInHours < 48) return '1 day ago'
  return `${Math.floor(diffInHours / 24)} days ago`
}

// Helper function to get status badge styling (same as Posts page)
export const getStatusBadge = (status: string) => {
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
export const getSocialPlatformIcon = (platform: string) => {
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

// Helper function to get platform avatar info
export const getPlatformInfo = (platform: string) => {
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

// Helper function to get status badge for accounts
export const formatPercentage = (num: number): string => {
  return `${num.toFixed(1)}%`;
};

export const getAccountStatusBadge = (account: any) => {
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
