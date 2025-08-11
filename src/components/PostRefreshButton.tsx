import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRefreshPostEngagements } from "@/hooks/useAnalytics"
import { toast } from "sonner"

interface PostRefreshButtonProps {
  postId: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  showText?: boolean;
  className?: string;
}

export function PostRefreshButton({ 
  postId, 
  size = "sm", 
  variant = "outline", 
  showText = true,
  className = "" 
}: PostRefreshButtonProps) {
  const refreshMutation = useRefreshPostEngagements();

  const handleRefresh = async () => {
    try {
      await refreshMutation.mutateAsync(postId);
      toast.success('Post engagement data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh post engagement:', error);
      toast.error('Failed to refresh engagement data');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={refreshMutation.isPending}
      className={className}
      title="Refresh post engagement data"
    >
      <RefreshCw className={`h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''} ${showText ? 'mr-2' : ''}`} />
      {showText && (refreshMutation.isPending ? 'Refreshing...' : 'Refresh')}
    </Button>
  );
}