import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  showRetry?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const ErrorIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background circle */}
    <circle 
      cx="50" 
      cy="50" 
      r="45" 
      fill="currentColor" 
      className="text-red-50"
      stroke="currentColor"
      strokeWidth="2"
      className="text-red-200"
    />
    
    {/* Error symbol - exclamation mark */}
    <rect 
      x="47" 
      y="25" 
      width="6" 
      height="30" 
      rx="3" 
      fill="currentColor"
      className="text-red-500"
    />
    <circle 
      cx="50" 
      cy="65" 
      r="4" 
      fill="currentColor"
      className="text-red-500"
    />
    
    {/* Disconnected lines to represent failed connection */}
    <path 
      d="M20 35 L35 35 M65 35 L80 35 M20 65 L35 65 M65 65 L80 65" 
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="text-red-300"
      strokeDasharray="2,2"
    />
  </svg>
)

export function ErrorState({
  title = "Failed to load data",
  description = "Something went wrong while fetching the information.",
  onRetry,
  showRetry = true,
  className = "",
  size = 'md'
}: ErrorStateProps) {
  const sizeClasses = {
    sm: {
      container: "py-4",
      icon: "h-12 w-12",
      title: "text-sm font-medium",
      description: "text-xs",
      spacing: "space-y-2"
    },
    md: {
      container: "py-8",
      icon: "h-16 w-16",
      title: "text-base font-medium",
      description: "text-sm",
      spacing: "space-y-3"
    },
    lg: {
      container: "py-12",
      icon: "h-20 w-20",
      title: "text-lg font-semibold",
      description: "text-base",
      spacing: "space-y-4"
    }
  }

  const styles = sizeClasses[size]

  return (
    <div className={`flex flex-col items-center justify-center text-center ${styles.container} ${className}`}>
      <div className={styles.spacing}>
        <ErrorIcon className={styles.icon} />
        
        <div className="space-y-1">
          <h3 className={`${styles.title} text-destructive`}>
            {title}
          </h3>
          <p className={`${styles.description} text-muted-foreground max-w-md`}>
            {description}
          </p>
        </div>

        {showRetry && onRetry && (
          <Button 
            variant="outline" 
            size={size === 'sm' ? 'sm' : 'default'}
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}