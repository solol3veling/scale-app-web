import React from 'react';
import { AlertCircle, Calendar, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarErrorStateProps {
  error: Error;
  onRetry: () => void;
  onGoToDashboard?: () => void;
}

export function CalendarErrorState({ error, onRetry, onGoToDashboard }: CalendarErrorStateProps) {
  const getErrorIcon = () => {
    if (error.message.includes('Network') || error.message.includes('connection')) {
      return <WifiOff className="h-12 w-12 text-red-500" />;
    }
    if (error.message.includes('permission')) {
      return <AlertCircle className="h-12 w-12 text-yellow-500" />;
    }
    return <AlertCircle className="h-12 w-12 text-red-500" />;
  };

  const getErrorTitle = () => {
    if (error.message.includes('Network') || error.message.includes('connection')) {
      return 'Connection Problem';
    }
    if (error.message.includes('permission')) {
      return 'Access Denied';
    }
    if (error.message.includes('Server error')) {
      return 'Server Issue';
    }
    return 'Unable to Load Calendar';
  };

  const getErrorDescription = () => {
    if (error.message.includes('Network') || error.message.includes('connection')) {
      return 'Please check your internet connection and try again.';
    }
    if (error.message.includes('permission')) {
      return 'You don\'t have the necessary permissions to view calendar data.';
    }
    if (error.message.includes('Server error')) {
      return 'Our servers are experiencing issues. Please try again in a few minutes.';
    }
    return 'There was a problem loading your calendar data.';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center">
          {getErrorIcon()}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {getErrorTitle()}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {getErrorDescription()}
          </p>
        </div>

        {/* Show detailed error in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
            <p className="text-xs font-mono text-gray-800 dark:text-gray-200">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onRetry} variant="default" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          {onGoToDashboard && (
            <Button onClick={onGoToDashboard} variant="outline" className="flex-1">
              Go to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface CalendarEmptyStateProps {
  dateType: 'created' | 'scheduled';
  monthName: string;
  year: number;
  onCreatePost?: () => void;
}

export function CalendarEmptyState({ dateType, monthName, year, onCreatePost }: CalendarEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center">
          <Calendar className="h-16 w-16 text-gray-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            No Posts Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have any posts {dateType === 'created' ? 'created' : 'scheduled'} in {monthName} {year}.
          </p>
        </div>

        {onCreatePost && (
          <Button onClick={onCreatePost} variant="default">
            Create Your First Post
          </Button>
        )}
      </div>
    </div>
  );
}

interface CalendarLoadingStateProps {
  message?: string;
}

export function CalendarLoadingState({ message = "Loading your calendar..." }: CalendarLoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

interface CalendarNetworkErrorProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function CalendarNetworkError({ onRetry, isRetrying = false }: CalendarNetworkErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center">
          <WifiOff className="h-16 w-16 text-gray-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            You're Offline
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please check your internet connection to view your calendar.
          </p>
        </div>

        <Button 
          onClick={onRetry} 
          variant="default"
          disabled={isRetrying}
        >
          {isRetrying ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connecting...
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4 mr-2" />
              Try Again
            </>
          )}
        </Button>
      </div>
    </div>
  );
}