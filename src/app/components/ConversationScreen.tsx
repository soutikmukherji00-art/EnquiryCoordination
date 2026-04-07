/**
 * ConversationScreen Component
 * 
 * Mobile-optimized conversation view.
 * Wraps ConversationPanel with mobile-specific header and layout.
 */

import * as React from 'react';
import { MoreVertical, Users, FileText, Info } from 'lucide-react';
import { MobileShell, MobileHeader, ActionButton } from './MobileShell';
import { ConversationPanel } from './ConversationPanel';
import { cn } from '@/app/components/ui/utils';

interface ConversationScreenProps {
  // Header props
  title: string;
  subtitle?: string;
  onBackClick?: () => void;
  onMenuClick?: () => void;
  badge?: React.ReactNode;
  
  // Actions
  onMembersClick?: () => void;
  onStructuredDataClick?: () => void;
  onAuditClick?: () => void;
  onMoreClick?: () => void;
  
  // Conversation props (pass through to ConversationPanel)
  conversationPanelProps: any;
  
  // Composer
  composer?: React.ReactNode;
}

/**
 * ConversationScreen - Full-screen mobile conversation view
 * 
 * Layout:
 * - Header with back/menu, title, actions
 * - ConversationPanel (scrollable)
 * - Composer (fixed bottom)
 */
export function ConversationScreen({
  title,
  subtitle,
  onBackClick,
  onMenuClick,
  badge,
  onMembersClick,
  onStructuredDataClick,
  onAuditClick,
  onMoreClick,
  conversationPanelProps,
  composer,
}: ConversationScreenProps) {
  const [showActionMenu, setShowActionMenu] = React.useState(false);
  
  // Build action buttons
  const actions = (
    <>
      {onMembersClick && (
        <ActionButton
          icon={<Users className="w-5 h-5" />}
          label="View members"
          onClick={onMembersClick}
        />
      )}
      {onStructuredDataClick && (
        <ActionButton
          icon={<FileText className="w-5 h-5" />}
          label="View structured data"
          onClick={onStructuredDataClick}
        />
      )}
      {onAuditClick && (
        <ActionButton
          icon={<Info className="w-5 h-5" />}
          label="View audit trail"
          onClick={onAuditClick}
        />
      )}
      {onMoreClick && (
        <ActionButton
          icon={<MoreVertical className="w-5 h-5" />}
          label="More options"
          onClick={onMoreClick}
        />
      )}
    </>
  );
  
  return (
    <MobileShell
      header={
        <MobileHeader
          title={title}
          subtitle={subtitle}
          onBackClick={onBackClick}
          onMenuClick={onMenuClick}
          badge={badge}
          actions={actions}
        />
      }
      composer={composer}
    >
      {/* Conversation Panel - adapted for mobile */}
      <div className="h-full">
        <ConversationPanel {...conversationPanelProps} />
      </div>
    </MobileShell>
  );
}

/**
 * MobileConversationHeader - Simplified header for external roles
 * 
 * Used by Buyer and Seller views.
 */
interface MobileConversationHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  badge?: React.ReactNode;
}

export function MobileConversationHeader({
  title,
  subtitle,
  onMenuClick,
  badge,
}: MobileConversationHeaderProps) {
  return (
    <MobileHeader
      title={title}
      subtitle={subtitle}
      onMenuClick={onMenuClick}
      badge={badge}
    />
  );
}
