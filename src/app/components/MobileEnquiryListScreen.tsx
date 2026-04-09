/**
 * MobileEnquiryListScreen Component
 * 
 * First screen in mobile 3-tier navigation (WhatsApp-like).
 * Shows list of enquiries and direct messages.
 */

import * as React from 'react';
import { MobileShell, MobileHeader } from './MobileShell';
import { EnquiryList } from './EnquiryList';
import type { Enquiry, Channel } from './EnquiryList';
import type { BuyerDMChannel } from '@/domain/message/buyer-dm.types';
import type { SellerDMChannel } from '@/domain/message/seller-dm.types';
import type { SellerChannel } from '@/domain/message/message.types';

interface MobileEnquiryListScreenProps {
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
  
  // Navigation - single callback for all selections
  onSelectItem: (params: {
    type: 'enquiry' | 'buyerDM' | 'sellerDM';
    enquiryId?: string;
    channel?: string;
    buyerDMId?: string;
    sellerDMId?: string;
  }) => void;
  
  // Actions
  onMenuClick?: () => void;
  
  // Additional props for EnquiryList
  messageDispatch?: (event: any) => void;
  currentPersona?: { id: string; displayName: string };
  currentUser?: string;
}

/**
 * MobileEnquiryListScreen - First screen in mobile navigation
 * 
 * Layout:
 * ┌──────────────────────┐
 * │ [☰] Enquiries        │
 * ├──────────────────────┤
 * │ 🔍 Search...         │
 * ├──────────────────────┤
 * │ ENQ-2404             │
 * │ ENQ-2405             │
 * │                      │
 * │ BUYER DMS            │
 * │ Birla Pivot          │
 * │ Mehra Industries     │
 * └──────────────────────┘
 */
export function MobileEnquiryListScreen({
  enquiries,
  channels,
  sellerChannels,
  buyerDMChannels,
  sellerDMChannels,
  searchQuery,
  onSearchChange,
  currentPersonaId,
  onSelectItem,
  onMenuClick,
  messageDispatch,
  currentPersona,
  currentUser,
}: MobileEnquiryListScreenProps) {
  // Handle channel selection within enquiry (if already expanded)
  const handleChannelSelect = (channelId: string) => {
    // This will be called when user taps a subchannel
    // We need the selected enquiry ID from EnquiryList's internal state
    // For now, we'll pass it through in the callback
  };
  
  // Handle Buyer DM selection
  const handleBuyerDMSelect = (dmId: string) => {
    onSelectItem({
      type: 'buyerDM',
      buyerDMId: dmId,
    });
  };
  
  // Handle Seller DM selection
  const handleSellerDMSelect = (dmId: string) => {
    onSelectItem({
      type: 'sellerDM',
      sellerDMId: dmId,
    });
  };
  
  return (
    <MobileShell
      header={
        <MobileHeader
          title="Enquiries"
          onMenuClick={onMenuClick}
        />
      }
    >
      {/* EnquiryList - adapted for mobile */}
      <div className="h-full">
        <EnquiryList
          enquiries={enquiries}
          selectedId={null} // No selection highlight on list screen
          selectedChannel=""
          onSelectChannel={handleChannelSelect}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          channels={channels}
          sellerChannels={sellerChannels}
          currentPersonaId={currentPersonaId}
          buyerDMChannels={buyerDMChannels}
          selectedBuyerDMId={null}
          onSelectBuyerDM={handleBuyerDMSelect}
          sellerDMChannels={sellerDMChannels}
          selectedSellerDMId={null}
          onSelectSellerDM={handleSellerDMSelect}
          messageDispatch={messageDispatch}
          currentPersona={currentPersona}
          currentUser={currentUser}
        />
      </div>
    </MobileShell>
  );
}
