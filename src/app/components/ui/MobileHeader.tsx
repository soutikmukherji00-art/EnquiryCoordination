import * as React from 'react';
import { ChevronLeft, MoreVertical } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
}

/**
 * MobileHeader Component
 * 
 * Premium mobile header with glassmorphism and smooth transitions.
 * Ensures visual consistency with the desktop theme while optimizing for touch.
 */
export function MobileHeader({
  title,
  subtitle,
  onBack,
  actions,
  className,
  showBackButton = false,
}: MobileHeaderProps) {
  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full h-[var(--mweb-header-height)]",
        "bg-white/70 backdrop-blur-lg border-b border-border",
        "flex items-center justify-between px-4 transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {showBackButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0 -ml-2"
            onClick={onBack}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}
        
        <div className="flex flex-col min-w-0">
          <h1 className="text-base font-semibold leading-tight truncate text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10px] font-medium text-muted-foreground truncate leading-none mt-0.5 uppercase tracking-wider">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {actions || (
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreVertical className="w-5 h-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
