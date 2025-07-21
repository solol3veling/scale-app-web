import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CalendarErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface CalendarErrorBoundaryProps {
  children: React.ReactNode;
}

export class CalendarErrorBoundary extends React.Component<
  CalendarErrorBoundaryProps,
  CalendarErrorBoundaryState
> {
  constructor(props: CalendarErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): CalendarErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to your error reporting service
    console.error('Calendar Error Boundary caught an error:', error, errorInfo);
    
    // You can also log to your error reporting service here
    // Example: errorReportingService.logError(error, errorInfo);
  }

  handleRetry = () => {
    // Clear the error state and retry rendering
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col h-full">
          {/* Keep the same filter section structure for consistency */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Calendar</h2>
          </div>

          {/* Error state content */}
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Calendar Error
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Something went wrong while loading the calendar. This error is isolated to the calendar feature and won't affect other parts of the app.
                    </p>
                  </div>

                  {/* Show error details in development */}
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <div className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                      <p className="text-xs font-mono text-gray-800 dark:text-gray-200">
                        {this.state.error.message}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Button
                      onClick={this.handleRetry}
                      className="flex-1"
                      variant="default"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Calendar
                    </Button>
                    
                    <Button
                      onClick={() => window.location.href = '/'}
                      variant="outline"
                      className="flex-1"
                    >
                      Go to Dashboard
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    If this problem persists, please contact support or try refreshing the page.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for easier usage
export function WithCalendarErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <CalendarErrorBoundary>
      {children}
    </CalendarErrorBoundary>
  );
}