/**
 * MobileShell Component
 * 
 * Container for mobile-specific layout with navigation state management.
 * Handles drawer, bottom sheets, and full-screen modals.
 */

import * as React from 'react';
import { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

export interface MobileShellProps {
  children: ReactNode;
  header?: ReactNode;
  composer?: ReactNode;
  className?: string;
}

/**
 * MobileShell - Main container for mobile layout
 * 
 * Layout:
 * - Fixed header at top
 * - Flex content area (children control their own scrolling)
 * - Fixed composer at bottom
 */
export function MobileShell({ children, header, composer, className }: MobileShellProps) {
  return (
    <div className={cn('flex flex-col h-screen w-screen bg-white overflow-hidden', className)}>
      {/* Header - Fixed */}
      {header && (
        <div className="flex-shrink-0">
          {header}
        </div>
      )}
      
      {/* Content - Flex area, children control scrolling */}
      <div className="flex-1 min-h-0 flex flex-col">
        {children}
      </div>
      
      {/* Composer - Fixed Bottom */}
      {composer && (
        <div className="flex-shrink-0 z-10">
          {composer}
        </div>
      )}
    </div>
  );
}

/**
 * MobileHeader - Reusable mobile header component
 */
interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  onBackClick?: () => void;
  onMenuClick?: () => void;
  actions?: ReactNode;
  badge?: ReactNode;
}

export function MobileHeader({ 
  title, 
  subtitle, 
  onBackClick, 
  onMenuClick, 
  actions,
  badge 
}: MobileHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Back or Menu Button */}
      {onBackClick && (
        <button
          onClick={onBackClick}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      
      {/* Title Area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-gray-900 truncate">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 truncate">{subtitle}</p>
        )}
      </div>
      
      {/* Action Buttons */}
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * ActionButton - Standard mobile action button
 */
interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

export function ActionButton({ icon, label, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label={label}
    >
      {icon}
    </button>
  );
}