import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRefreshPlatformEngagements } from "@/hooks/useAnalytics"
import { Platform } from "@/types/api"
import { toast } from "sonner"

interface PlatformRefreshButtonProps {
  platform: Platform;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  showText?: boolean;
  className?: string;
}

export function PlatformRefreshButton({ 
  platform, 
  size = "sm", 
  variant = "outline", 
  showText = true,
  className = "" 
}: PlatformRefreshButtonProps) {
  const refreshMutation = useRefreshPlatformEngagements();

  const handleRefresh = async () => {
    try {
      await refreshMutation.mutateAsync(platform);
      toast.success(`${platform} engagement data refreshed successfully`);
    } catch (error) {
      console.error(`Failed to refresh ${platform} engagement:`, error);
      toast.error(`Failed to refresh ${platform} engagement data`);
    }
  };

  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={refreshMutation.isPending}
      className={className}
      title={`Refresh ${platformName} engagement data`}
    >
      <RefreshCw className={`h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''} ${showText ? 'mr-2' : ''}`} />
      {showText && (refreshMutation.isPending ? 'Refreshing...' : `Refresh ${platformName}`)}
    </Button>
  );
}