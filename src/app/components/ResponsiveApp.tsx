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
import { useEffect, useState } from 'react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
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
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/app/components/ui/resizable';

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
  const [chatCollapsedDesktop, setChatCollapsedDesktop] = useState(false);
  const [desktopLayoutKey, setDesktopLayoutKey] = useState(0);

  useEffect(() => {
    const handlePOFocusTransition = () => {
      setChatCollapsedDesktop(true);
      setDesktopLayoutKey((prev) => prev + 1);
    };
    window.addEventListener("po-analysis-focus-transition", handlePOFocusTransition);
    return () => window.removeEventListener("po-analysis-focus-transition", handlePOFocusTransition);
  }, []);

  const handleExpandDesktopChat = () => {
    setChatCollapsedDesktop(false);
    setDesktopLayoutKey((prev) => prev + 1);
  };

  const handleCollapseDesktopChat = () => {
    setChatCollapsedDesktop(true);
    setDesktopLayoutKey((prev) => prev + 1);
  };

  return (
    <ResponsiveScreen
      className="bg-gray-50"
      expanded={
        <div className="relative flex h-full w-full overflow-hidden bg-gray-50">
          <ResizablePanelGroup key={`desktop-layout-${desktopLayoutKey}`} direction="horizontal" className="h-full w-full z-0">
            {/* Left Sidebar - Enquiry List - Default 25% */}
            <ResizablePanel defaultSize={25} minSize={15} maxSize={40} className="bg-white border-r border-gray-200/50 overflow-hidden flex flex-col">
              {enquiryList}
            </ResizablePanel>
            
            <ResizableHandle withHandle className="z-10" />

            {!chatCollapsedDesktop && (
              <>
                {/* Center - Conversation Panel - Default 60/40 vs structured panel.
                    Keep this unbounded on max so dragging the right handle
                    doesn't force a resize from the left panel. */}
                <ResizablePanel defaultSize={45} minSize={15} className="flex flex-col bg-white overflow-hidden">
                  {conversationPanel}
                </ResizablePanel>
                
                <ResizableHandle withHandle className="z-10" />
              </>
            )}

            {/* Right Panel - Structured Data - Primary focus after PO analysis */}
            <ResizablePanel
              defaultSize={chatCollapsedDesktop ? 75 : 30}
              minSize={chatCollapsedDesktop ? 40 : 15}
              maxSize={85}
              className="relative bg-white border-l border-gray-200/50 overflow-hidden flex flex-col"
            >
              <button
                type="button"
                onClick={chatCollapsedDesktop ? handleExpandDesktopChat : handleCollapseDesktopChat}
                className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                title={chatCollapsedDesktop ? "Expand chat" : "Focus details"}
                aria-label={chatCollapsedDesktop ? "Expand chat" : "Focus details"}
              >
                {chatCollapsedDesktop ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
              </button>
              {structuredPanel}
            </ResizablePanel>
          </ResizablePanelGroup>
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
              <div className="px-4 py-3 border-b border-gray-200/50 flex-shrink-0">
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