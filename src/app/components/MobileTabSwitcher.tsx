/**
 * MobileTabSwitcher Component
 * 
 * Horizontally scrollable tab navigation for mobile.
 * Used in ProfileBottomSheet and other mobile contexts.
 */

import * as React from 'react';
import { cn } from '@/app/components/ui/utils';

export interface Tab {
  id: string;
  label: string;
  badge?: number | string;
}

interface MobileTabSwitcherProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

/**
 * MobileTabSwitcher - Horizontal scrollable tabs
 * 
 * Features:
 * - Horizontal scroll
 * - Active indicator
 * - Badge support
 * - Touch-optimized (44px height)
 */
export function MobileTabSwitcher({ 
  tabs, 
  activeTab, 
  onTabChange,
  className 
}: MobileTabSwitcherProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Scroll active tab into view when it changes
  React.useEffect(() => {
    const activeTabElement = scrollContainerRef.current?.querySelector(
      `[data-tab-id="${activeTab}"]`
    );
    
    if (activeTabElement) {
      activeTabElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);
  
  return (
    <div className={cn('border-b border-gray-200 bg-white', className)}>
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-shrink-0 px-4 py-3 min-h-[44px] text-sm font-medium transition-colors relative whitespace-nowrap',
              activeTab === tab.id
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              {tab.badge !== undefined && (
                <span className={cn(
                  'px-1.5 py-0.5 text-xs rounded-full',
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                )}>
                  {tab.badge}
                </span>
              )}
            </span>
            
            {/* Active Indicator */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * SegmentedControl - Alternative tab style
 * 
 * Used for 2-3 options with equal width.
 */
interface SegmentedControlProps {
  options: Array<{ id: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({ 
  options, 
  value, 
  onChange,
  className 
}: SegmentedControlProps) {
  return (
    <div className={cn('inline-flex p-1 bg-gray-100 rounded-lg', className)}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md transition-colors min-h-[40px]',
            value === option.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
