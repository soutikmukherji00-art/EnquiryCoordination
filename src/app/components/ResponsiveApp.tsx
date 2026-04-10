/**
 * ResponsiveApp Component
 * 
 * Responsive wrapper for the main App.
 * Handles breakpoint-based layout switching:
 * - Desktop: 3-column layout (unchanged)
 * - Tablet: 2-surface (drawer + conversation)
 * - Mobile: Three-tier WhatsApp-like navigation
 */

import * as React from 'react';
import { useState } from 'react';
import { useBreakpoint, isMobile, isTablet, isDesktop } from '@/hooks/useBreakpoint';
import { ResponsiveScreen } from '@/app/components/ui/Layout/ResponsiveScreen';
import { EnquiryDrawer, TabletDrawer } from './EnquiryDrawer';
import { ProfileBottomSheet } from './ProfileBottomSheet';
import { MobileApp } from './MobileApp';
import { cn } from '@/app/components/ui/utils';
import type { Enquiry, Channel } from './EnquiryList';
import type { BuyerDMChannel } from '@/domain/message/buyer-dm.types';
import type { SellerDMChannel } from '@/domain/message/seller-dm.types';
import type { SellerChannel } from '@/domain/message/message.types';

interface ResponsiveAppProps {
  // Layout components
  enquiryList: React.ReactNode;
  conversationPanel: React.ReactNode;
  structuredPanel: React.ReactNode;
  composer?: React.ReactNode;
  
  // Mobile-specific props
  currentEnquiryTitle?: string;
  currentEnquirySubtitle?: string;
  currentBadge?: React.ReactNode;
  customHeader?: React.ReactNode | ((onBackClick: () => void, onDetailsClick: () => void) => React.ReactNode); // NEW: Can be function with callbacks
  
  // Data for mobile navigation
  enquiries?: Enquiry[];
  channels?: Channel[];
  sellerChannels?: SellerChannel[];
  buyerDMChannels?: BuyerDMChannel[];
  sellerDMChannels?: SellerDMChannel[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  currentPersonaId?: string;
  
  // Mobile callbacks
  onEnquirySelect?: (enquiryId: string, channel: string) => void;
  onBuyerDMSelect?: (dmId: string) => void;
  onSellerDMSelect?: (dmId: string) => void;
  
  // Props for EnquiryList
  messageDispatch?: (event: any) => void;
  currentPersona?: { id: string; displayName: string };
  currentUser?: string;
  
  // Initial state
  initialEnquiryId?: string;
  initialChannel?: string;
  
  // Children (for additional modals/overlays)
  children?: React.ReactNode;
}

export function ResponsiveApp({
  enquiryList,
  conversationPanel,
  structuredPanel,
  composer,
  currentEnquiryTitle = 'Conversation',
  currentEnquirySubtitle,
  currentBadge,
  customHeader,
  enquiries = [],
  channels = [],
  sellerChannels = [],
  buyerDMChannels = [],
  sellerDMChannels = [],
  searchQuery = '',
  onSearchChange = () => {},
  currentPersonaId,
  onEnquirySelect,
  onBuyerDMSelect,
  onSellerDMSelect,
  messageDispatch,
  currentPersona,
  currentUser,
  initialEnquiryId,
  initialChannel,
  children,
}: ResponsiveAppProps) {
  const [tabletDrawerOpen, setTabletDrawerOpen] = useState(true);
  const [structuredPanelOpen, setStructuredPanelOpen] = useState(false);

  return (
    <ResponsiveScreen
      className="bg-gray-50"
      expanded={
        <div className="flex h-full w-full overflow-hidden bg-gray-50">
          {/* Left Sidebar - Enquiry List - 25% */}
          <div className="w-[25%] flex-shrink-0 bg-white border-r border-gray-200 overflow-hidden">
            {enquiryList}
          </div>
          
          {/* Center - Conversation Panel - 50% */}
          <div className="w-[50%] flex-shrink-0 flex flex-col bg-white overflow-hidden">
            {conversationPanel}
          </div>
          
          {/* Right Panel - Structured Data - 25% */}
          <div className="w-[25%] flex-shrink-0 bg-white border-l border-gray-200 overflow-hidden flex flex-col">
            {structuredPanel}
          </div>
          
          {children}
        </div>
      }
      medium={
        <div className="flex h-full w-full overflow-hidden bg-gray-50">
          <TabletDrawer 
            open={tabletDrawerOpen} 
            onOpenChange={setTabletDrawerOpen}
          >
            {enquiryList}
          </TabletDrawer>
          
          <div className="flex-1 bg-white overflow-hidden flex flex-col">
            {!tabletDrawerOpen && (
              <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
                <button
                  onClick={() => setTabletDrawerOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-muted-foreground"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex-1 min-h-0 overflow-hidden">
              {conversationPanel}
            </div>
          </div>
          
          <ProfileBottomSheet
            open={structuredPanelOpen}
            onOpenChange={setStructuredPanelOpen}
            title="Details"
          >
            {structuredPanel}
          </ProfileBottomSheet>
          
          {children}
        </div>
      }
      compact={
        <MobileApp
          enquiries={enquiries}
          channels={channels}
          sellerChannels={sellerChannels}
          buyerDMChannels={buyerDMChannels}
          sellerDMChannels={sellerDMChannels}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          currentPersonaId={currentPersonaId}
          conversationPanel={conversationPanel}
          structuredPanel={structuredPanel}
          composer={composer}
          currentTitle={currentEnquiryTitle}
          currentSubtitle={currentEnquirySubtitle}
          currentBadge={currentBadge}
          customHeader={customHeader}
          onEnquirySelect={onEnquirySelect}
          onBuyerDMSelect={onBuyerDMSelect}
          onSellerDMSelect={onSellerDMSelect}
          messageDispatch={messageDispatch}
          currentPersona={currentPersona}
          currentUser={currentUser}
          initialEnquiryId={initialEnquiryId}
          initialChannel={initialChannel}
        >
          {children}
        </MobileApp>
      }
    />
  );
}

/**
 * Helper hook to manage responsive panel state
 */
export function useResponsivePanels() {
  const [enquiryDrawerOpen, setEnquiryDrawerOpen] = useState(false);
  const [structuredPanelOpen, setStructuredPanelOpen] = useState(false);
  const [tabletDrawerOpen, setTabletDrawerOpen] = useState(true);
  
  const breakpoint = useBreakpoint();
  
  const openEnquiryDrawer = () => setEnquiryDrawerOpen(true);
  const closeEnquiryDrawer = () => setEnquiryDrawerOpen(false);
  const toggleEnquiryDrawer = () => setEnquiryDrawerOpen(prev => !prev);
  
  const openStructuredPanel = () => setStructuredPanelOpen(true);
  const closeStructuredPanel = () => setStructuredPanelOpen(false);
  const toggleStructuredPanel = () => setStructuredPanelOpen(prev => !prev);
  
  const openTabletDrawer = () => setTabletDrawerOpen(true);
  const closeTabletDrawer = () => setTabletDrawerOpen(false);
  const toggleTabletDrawer = () => setTabletDrawerOpen(prev => !prev);
  
  return {
    breakpoint,
    isMobile: isMobile(breakpoint),
    isTablet: isTablet(breakpoint),
    isDesktop: isDesktop(breakpoint),
    
    // Enquiry drawer (mobile)
    enquiryDrawerOpen,
    openEnquiryDrawer,
    closeEnquiryDrawer,
    toggleEnquiryDrawer,
    
    // Structured panel (mobile/tablet)
    structuredPanelOpen,
    openStructuredPanel,
    closeStructuredPanel,
    toggleStructuredPanel,
    
    // Tablet drawer
    tabletDrawerOpen,
    openTabletDrawer,
    closeTabletDrawer,
    toggleTabletDrawer,
  };
}