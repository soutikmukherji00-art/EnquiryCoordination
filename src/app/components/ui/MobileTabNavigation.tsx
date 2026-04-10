import * as React from 'react';
import { MessageSquare, LayoutGrid, User, Settings } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import type { WorkspaceMode } from '@/app/workspace.types';

interface MobileTabNavigationProps {
  activeTab: WorkspaceMode;
  onTabChange: (tab: WorkspaceMode) => void;
  className?: string;
}

/**
 * MobileTabNavigation Component
 * 
 * Premium bottom navigation bar for high-level workspace switching.
 * Follows mobile OS best practices for touch targets and visual feedback.
 */
export function MobileTabNavigation({
  activeTab,
  onTabChange,
  className,
}: MobileTabNavigationProps) {
  const tabs: Array<{ id: WorkspaceMode; label: string; icon: React.ElementType }> = [
    { id: 'prism', label: 'Inbox', icon: MessageSquare },
    { id: 'pluto', label: 'Pipeline', icon: LayoutGrid },
  ];

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 md:hidden",
      "h-[var(--mweb-tab-bar-height)] pb-[var(--mweb-safe-area-bottom)]",
      "bg-card/80 backdrop-blur-xl border-t border-border shadow-[0_-8px_32px_rgba(0,0,0,0.05)]",
      className
    )}>
      <nav className="flex items-center justify-around h-full w-full max-w-md mx-auto px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 min-w-[72px] transition-all duration-300 relative",
                isActive ? "text-primary px-2" : "text-muted-foreground"
              )}
              aria-label={`Switch to ${tab.label}`}
            >
              {isActive && (
                <div className="absolute -top-1 w-12 h-1 bg-primary rounded-full blur-[2px] opacity-40 animate-in fade-in zoom-in duration-300" />
              )}
              <div className={cn(
                "relative p-1.5 rounded-2xl transition-all duration-300",
                isActive ? "bg-primary/10" : "hover:bg-muted"
              )}>
                <Icon className={cn(
                  "w-6 h-6 transition-transform duration-300",
                  isActive ? "fill-primary/20 scale-110" : "scale-100"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-semibold tracking-wide uppercase transition-all",
                isActive ? "opacity-100 scale-100" : "opacity-70 scale-95"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
