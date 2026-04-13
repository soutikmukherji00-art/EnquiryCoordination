/**
 * MobileConversationWithTabs Component
 * 
 * Second screen in mobile 3-tier navigation (WhatsApp-like).
 * Shows conversation with three-dot menu for accessing details.
 */

import * as React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

export type MobileConversationTab = 'chat' | 'details';

interface MobileConversationWithTabsProps {
  // Header
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  onBackClick: () => void;
  onMoreClick?: () => void;
  customHeader?: React.ReactNode | ((onBackClick: () => void, onDetailsClick: () => void) => React.ReactNode); // NEW: Can be function
  
  // Tab state
  activeTab: MobileConversationTab;
  onTabChange: (tab: MobileConversationTab) => void;
  
  // Tab content
  chatContent: React.ReactNode;
  detailsContent: React.ReactNode;
  
  // Composer (only shown in chat tab)
  composer?: React.ReactNode;
}

/**
 * MobileConversationWithTabs - Conversation screen with menu-based navigation
 * 
 * Layout:
 * ┌──────────────────────────┐
 * │ [←] Title          [⋮]  │ ← Fixed header with menu
 * ├──────────────────────────┤
 * │                          │
 * │  Scrollable Content      │ ← ONLY this scrolls
 * │  (Chat or Details)       │
 * │                          │
 * ├──────────────────────────┤
 * │  Composer (chat only)    │ ← Fixed composer
 * └──────────────────────────┘
 */
export function MobileConversationWithTabs({
  title,
  subtitle,
  badge,
  onBackClick,
  onMoreClick,
  customHeader,
  activeTab,
  onTabChange,
  chatContent,
  detailsContent,
  composer,
}: MobileConversationWithTabsProps) {
  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      {/* LAYER 1: Fixed Header */}
      <div className="flex-shrink-0 bg-white z-30 border-b border-gray-200">
        {customHeader ? (
          typeof customHeader === 'function' ? customHeader(onBackClick, () => onTabChange('details')) : customHeader
        ) : (
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Back Button */}
            <button
              onClick={onBackClick}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Title */}
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
            
            {/* Three-Dot Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="More options"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => onTabChange('details')}
                  className="cursor-pointer"
                >
                  Structured Details
                </DropdownMenuItem>
                {onMoreClick && (
                  <DropdownMenuItem
                    onClick={onMoreClick}
                    className="cursor-pointer"
                  >
                    More Options
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      
      {/* LAYER 2: Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-white">
        {activeTab === 'chat' ? chatContent : detailsContent}
      </div>
      
      {/* LAYER 3: Fixed Composer (chat only) */}
      {activeTab === 'chat' && composer && (
        <div className="z-30 flex-shrink-0 border-t border-gray-200 bg-white pb-[var(--mweb-safe-area-bottom)]">
          {composer}
        </div>
      )}
      
      {/* Details view back button (when in details) */}
      {activeTab === 'details' && (
        <div className="flex-shrink-0 bg-white z-30 border-t border-gray-200 p-3">
          <button
            onClick={() => onTabChange('chat')}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Chat
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * MobileDetailsTab - Content for the Details tab
 * 
 * Shows structured data, members, audit trail, etc.
 */
interface MobileDetailsTabProps {
  structuredPanel: React.ReactNode;
}

export function MobileDetailsTab({ structuredPanel }: MobileDetailsTabProps) {
  return (
    <div>
      {structuredPanel}
    </div>
  );
}

/**
 * MobileChatTab - Content for the Chat tab
 * 
 * Shows conversation messages.
 */
interface MobileChatTabProps {
  conversationPanel: React.ReactNode;
}

export function MobileChatTab({ conversationPanel }: MobileChatTabProps) {
  return (
    <div>
      {conversationPanel}
    </div>
  );
}