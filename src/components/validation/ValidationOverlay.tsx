import React from 'react';
import { cn } from '@/lib/utils';

interface ValidationOverlayProps {
  status: 'valid' | 'warning' | 'error' | 'neutral';
  children: React.ReactNode;
  showOverlay?: boolean;
  className?: string;
}

const overlayStyles = {
  valid: {
    overlay: 'bg-green-500/10 border-green-500/30',
    border: 'border-green-500/50',
    focus: 'focus:ring-green-500/20 focus:border-green-500/60',
  },
  warning: {
    overlay: 'bg-orange-500/10 border-orange-500/30',
    border: 'border-orange-500/50',
    focus: 'focus:ring-orange-500/20 focus:border-orange-500/60',
  },
  error: {
    overlay: 'bg-red-500/10 border-red-500/30',
    border: 'border-red-500/50',
    focus: 'focus:ring-red-500/20 focus:border-red-500/60',
  },
  neutral: {
    overlay: 'bg-transparent border-transparent',
    border: 'border-input',
    focus: 'focus:ring-ring focus:border-ring',
  },
};

export function ValidationOverlay({ 
  status, 
  children, 
  showOverlay = true, 
  className 
}: ValidationOverlayProps) {
  const styles = overlayStyles[status];

  if (!showOverlay || status === 'neutral') {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative", className)}>
      {/* Overlay */}
      <div 
        className={cn(
          "absolute inset-0 rounded-md pointer-events-none transition-all duration-200",
          styles.overlay
        )}
      />
      
      {/* Content with enhanced border styling */}
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          className: cn(
            (children as React.ReactElement).props.className,
            styles.border,
            styles.focus,
            "transition-all duration-200"
          ),
        })}
      </div>
    </div>
  );
}

interface TextValidationWrapperProps {
  status: 'valid' | 'warning' | 'error';
  children: React.ReactNode;
  characterCount?: number;
  maxCharacters?: number;
  className?: string;
}

export function TextValidationWrapper({ 
  status, 
  children, 
  characterCount, 
  maxCharacters,
  className 
}: TextValidationWrapperProps) {
  return (
    <ValidationOverlay status={status} className={className}>
      <div className="space-y-2">
        {children}
        
        {/* Character count indicator */}
        {typeof characterCount === 'number' && typeof maxCharacters === 'number' && (
          <div className="flex justify-between items-center text-xs">
            <div className="flex gap-2">
              {/* Status indicator dot */}
              <div className={cn(
                "w-2 h-2 rounded-full",
                status === 'valid' ? 'bg-green-500' :
                status === 'warning' ? 'bg-orange-500' :
                'bg-red-500'
              )} />
              <span className={cn(
                "font-medium",
                status === 'valid' ? 'text-green-600 dark:text-green-400' :
                status === 'warning' ? 'text-orange-600 dark:text-orange-400' :
                'text-red-600 dark:text-red-400'
              )}>
                {status === 'valid' ? 'Valid length' :
                 status === 'warning' ? 'Consider shortening' :
                 'Too long'}
              </span>
            </div>
            
            <span className={cn(
              "tabular-nums",
              characterCount > maxCharacters 
                ? 'text-red-600 dark:text-red-400 font-medium'
                : characterCount > maxCharacters * 0.8
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-muted-foreground'
            )}>
              {characterCount} / {maxCharacters}
            </span>
          </div>
        )}
      </div>
    </ValidationOverlay>
  );
}

interface MediaValidationWrapperProps {
  status: 'valid' | 'warning' | 'error';
  children: React.ReactNode;
  issueCount?: number;
  className?: string;
}

export function MediaValidationWrapper({ 
  status, 
  children, 
  issueCount = 0,
  className 
}: MediaValidationWrapperProps) {
  return (
    <ValidationOverlay status={status} className={className}>
      <div className="space-y-2">
        {children}
        
        {/* Media status indicator */}
        <div className="flex items-center gap-2 text-xs">
          <div className={cn(
            "w-2 h-2 rounded-full",
            status === 'valid' ? 'bg-green-500' :
            status === 'warning' ? 'bg-orange-500' :
            'bg-red-500'
          )} />
          <span className={cn(
            "font-medium",
            status === 'valid' ? 'text-green-600 dark:text-green-400' :
            status === 'warning' ? 'text-orange-600 dark:text-orange-400' :
            'text-red-600 dark:text-red-400'
          )}>
            {status === 'valid' ? 'Media compatible' :
             status === 'warning' ? `${issueCount} warning${issueCount !== 1 ? 's' : ''}` :
             `${issueCount} error${issueCount !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>
    </ValidationOverlay>
  );
}

interface PlatformCompatibilityIndicatorProps {
  platformName: string;
  status: 'valid' | 'warning' | 'error';
  issueCount: number;
  className?: string;
}

export function PlatformCompatibilityIndicator({
  platformName,
  status,
  issueCount,
  className
}: PlatformCompatibilityIndicatorProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
      status === 'valid' 
        ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300"
        : status === 'warning'
        ? "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-300"
        : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300",
      className
    )}>
      <div className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === 'valid' ? 'bg-green-500' :
        status === 'warning' ? 'bg-orange-500' :
        'bg-red-500'
      )} />
      <span>{platformName}</span>
      {issueCount > 0 && (
        <span className="tabular-nums">
          {issueCount}
        </span>
      )}
    </div>
  );
}