/**
 * useMobileNavigation Hook
 * 
 * Three-tier WhatsApp-like navigation for mobile:
 * 1. Enquiry/DM List Screen
 * 2. Conversation Screen (with chat/details tabs)
 * 3. Additional overlays (profiles, etc.)
 */

import { useState, useCallback } from 'react';

export type MobileScreen = 'list' | 'conversation';
export type ConversationTab = 'chat' | 'details';

export interface MobileNavigationState {
  currentScreen: MobileScreen;
  currentTab: ConversationTab;
  selectedEnquiryId: string | null;
  selectedChannel: string | null;
  selectedBuyerDMId: string | null;
  selectedSellerDMId: string | null;
}

export interface MobileNavigationActions {
  // Screen navigation
  goToList: () => void;
  goToConversation: (params: {
    enquiryId?: string;
    channel?: string;
    buyerDMId?: string;
    sellerDMId?: string;
  }) => void;
  
  // Tab switching (within conversation screen)
  switchToChat: () => void;
  switchToDetails: () => void;
  setTab: (tab: ConversationTab) => void;
  
  // Back navigation
  goBack: () => void;
}

/**
 * useMobileNavigation - Mobile-specific navigation state
 * 
 * Three-tier navigation:
 * - List screen: Shows all enquiries and DMs
 * - Conversation screen: Shows messages + tabs (Chat | Details)
 * - Overlays: Profiles, audit, etc. (handled separately)
 */
export function useMobileNavigation(
  initialEnquiryId?: string,
  initialChannel?: string
): MobileNavigationState & MobileNavigationActions {
  const [state, setState] = useState<MobileNavigationState>({
    currentScreen: initialEnquiryId ? 'conversation' : 'list',
    currentTab: 'chat',
    selectedEnquiryId: initialEnquiryId || null,
    selectedChannel: initialChannel || 'internal',
    selectedBuyerDMId: null,
    selectedSellerDMId: null,
  });

  const goToList = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentScreen: 'list',
      currentTab: 'chat', // Reset to chat when going back
    }));
  }, []);

  const goToConversation = useCallback((params: {
    enquiryId?: string;
    channel?: string;
    buyerDMId?: string;
    sellerDMId?: string;
  }) => {
    setState(prev => ({
      ...prev,
      currentScreen: 'conversation',
      currentTab: 'chat', // Always start on chat tab
      selectedEnquiryId: params.enquiryId || null,
      selectedChannel: params.channel || prev.selectedChannel,
      selectedBuyerDMId: params.buyerDMId || null,
      selectedSellerDMId: params.sellerDMId || null,
    }));
  }, []);

  const switchToChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentTab: 'chat',
    }));
  }, []);

  const switchToDetails = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentTab: 'details',
    }));
  }, []);

  const setTab = useCallback((tab: ConversationTab) => {
    setState(prev => ({
      ...prev,
      currentTab: tab,
    }));
  }, []);

  const goBack = useCallback(() => {
    setState(prev => {
      // If on conversation screen, go back to list
      if (prev.currentScreen === 'conversation') {
        return {
          ...prev,
          currentScreen: 'list',
          currentTab: 'chat',
          selectedEnquiryId: null,
          selectedBuyerDMId: null,
          selectedSellerDMId: null,
        };
      }
      
      // Already on list screen, do nothing
      return prev;
    });
  }, []);

  return {
    ...state,
    goToList,
    goToConversation,
    switchToChat,
    switchToDetails,
    setTab,
    goBack,
  };
}
