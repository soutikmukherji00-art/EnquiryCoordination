import * as React from 'react';
import { useAdaptiveLayout, LayoutMode } from '@/hooks/useAdaptiveLayout';
import { cn } from '@/app/components/ui/utils';

interface ResponsiveScreenProps {
  /** The component/content for desktop/expanded view */
  expanded: React.ReactNode;
  
  /** The component/content for mobile/compact view */
  compact: React.ReactNode;
  
  /** Optional tablet/medium override, defaults to expanded if not provided */
  medium?: React.ReactNode;
  
  /** Additional container classes */
  className?: string;
  
  /** Whether to show the universal mobile tab bar in compact mode */
  showMobileTabBar?: boolean;
}

/**
 * ResponsiveScreen Component
 * 
 * Orchestrates the transition between Desktop and Mobile layouts.
 * Ensures functional parity by keeping both "versions" reachable via the same screen entry point.
 */
export function ResponsiveScreen({
  expanded,
  compact,
  medium,
  className,
  showMobileTabBar = false,
}: ResponsiveScreenProps) {
  const { mode, isCompact, isMedium, isExpanded } = useAdaptiveLayout();

  // Determine which content to render
  let content = expanded;
  if (isCompact) {
    content = compact;
  } else if (isMedium) {
    content = medium || expanded; // Default tablet to desktop layout unless specified
  }

  return (
    <div 
      className={cn(
        "h-full w-full overflow-hidden flex flex-col bg-background transition-colors duration-300",
        className
      )}
    >
      {/* Main Content Area */}
      <main className="flex-1 min-h-0 relative">
        {content}
      </main>
      
      {/* Universal Mobile Navigation (rendered only in compact mode if enabled) */}
      {isCompact && showMobileTabBar && (
        <div className="h-[var(--mweb-tab-bar-height)] border-t border-border bg-card/80 backdrop-blur-md pb-[var(--mweb-safe-area-bottom)]">
          {/* MobileTabNavigation will be injected here or handled by the Screen itself */}
        </div>
      )}
    </div>
  );
}
