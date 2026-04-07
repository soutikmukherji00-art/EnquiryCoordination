/**
 * MobileApp Component
 * 
 * WhatsApp-like three-tier navigation for mobile:
 * 1. Enquiry/DM List Screen
 * 2. Conversation Screen with Chat/Details tabs
 * 3. Overlays (profiles, etc.)
 */

import * as React from 'react';
import { useMobileNavigation } from '@/hooks/useMobileNavigation';
import { MobileEnquiryListScreen } from './MobileEnquiryListScreen';
import { MobileConversationWithTabs, MobileChatTab, MobileDetailsTab } from './MobileConversationWithTabs';
import type { Enquiry, Channel } from './EnquiryList';
import type { BuyerDMChannel } from '@/domain/message/buyer-dm.types';
import type { SellerDMChannel } from '@/domain/message/seller-dm.types';
import type { SellerChannel } from '@/domain/message/message.types';

interface MobileAppProps {
  // Data
  enquiries: Enquiry[];
  channels: Channel[];
  sellerChannels?: SellerChannel[];
  buyerDMChannels?: BuyerDMChannel[];
  sellerDMChannels?: SellerDMChannel[];
  
  // State
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPersonaId?: string;
  
  // Content components
  conversationPanel: React.ReactNode;
  structuredPanel: React.ReactNode;
  composer?: React.ReactNode; // Make composer optional
  
  // Current conversation info
  currentTitle: string;
  currentSubtitle?: string;
  currentBadge?: React.ReactNode;
  customHeader?: React.ReactNode | ((onBackClick: () => void, onDetailsClick: () => void) => React.ReactNode); // NEW: Can be function to receive callbacks
  
  // Callbacks (propagate to parent App.tsx)
  onEnquirySelect?: (enquiryId: string, channel: string) => void;
  onBuyerDMSelect?: (dmId: string) => void;
  onSellerDMSelect?: (dmId: string) => void;
  
  // Props for EnquiryList
  messageDispatch?: (event: any) => void;
  currentPersona?: { id: string; displayName: string };
  currentUser?: string;
  
  // Initial state (for deep linking)
  initialEnquiryId?: string;
  initialChannel?: string;
  
  // Children (additional overlays)
  children?: React.ReactNode;
}

/**
 * MobileApp - Three-tier mobile navigation
 * 
 * Navigation flow:
 * [List Screen] → [Conversation Screen]
 *                  ↓ tabs ↓
 *              [Chat | Details]
 */
export function MobileApp({
  enquiries,
  channels,
  sellerChannels,
  buyerDMChannels,
  sellerDMChannels,
  searchQuery,
  onSearchChange,
  currentPersonaId,
  conversationPanel,
  structuredPanel,
  composer,
  currentTitle,
  currentSubtitle,
  currentBadge,
  customHeader, // NEW: Custom header support
  onEnquirySelect,
  onBuyerDMSelect,
  onSellerDMSelect,
  messageDispatch,
  currentPersona,
  currentUser,
  initialEnquiryId,
  initialChannel,
  children,
}: MobileAppProps) {
  // Mobile navigation state
  const navigation = useMobileNavigation(initialEnquiryId, initialChannel);
  
  // Handle item selection from list screen
  const handleSelectItem = (params: {
    type: 'enquiry' | 'buyerDM' | 'sellerDM';
    enquiryId?: string;
    channel?: string;
    buyerDMId?: string;
    sellerDMId?: string;
  }) => {
    if (params.type === 'enquiry' && params.enquiryId) {
      // Navigate to conversation screen
      navigation.goToConversation({
        enquiryId: params.enquiryId,
        channel: params.channel || 'internal',
      });
      
      // Notify parent
      onEnquirySelect?.(params.enquiryId, params.channel || 'internal');
    } else if (params.type === 'buyerDM' && params.buyerDMId) {
      navigation.goToConversation({
        buyerDMId: params.buyerDMId,
      });
      
      onBuyerDMSelect?.(params.buyerDMId);
    } else if (params.type === 'sellerDM' && params.sellerDMId) {
      navigation.goToConversation({
        sellerDMId: params.sellerDMId,
      });
      
      onSellerDMSelect?.(params.sellerDMId);
    }
  };
  
  // Handle back from conversation to list
  const handleBackToList = () => {
    navigation.goBack();
  };
  
  // Render list screen
  if (navigation.currentScreen === 'list') {
    return (
      <>
        <MobileEnquiryListScreen
          enquiries={enquiries}
          channels={channels}
          sellerChannels={sellerChannels}
          buyerDMChannels={buyerDMChannels}
          sellerDMChannels={sellerDMChannels}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          currentPersonaId={currentPersonaId}
          onSelectItem={handleSelectItem}
          messageDispatch={messageDispatch}
          currentPersona={currentPersona}
          currentUser={currentUser}
        />
        
        {children}
      </>
    );
  }
  
  // Render conversation screen with tabs
  return (
    <>
      <MobileConversationWithTabs
        title={currentTitle}
        subtitle={currentSubtitle}
        badge={currentBadge}
        onBackClick={handleBackToList}
        activeTab={navigation.currentTab}
        onTabChange={navigation.setTab}
        chatContent={
          <MobileChatTab conversationPanel={conversationPanel} />
        }
        detailsContent={
          <MobileDetailsTab structuredPanel={structuredPanel} />
        }
        composer={composer}
        customHeader={customHeader} // NEW: Custom header support
      />
      
      {children}
    </>
  );
}