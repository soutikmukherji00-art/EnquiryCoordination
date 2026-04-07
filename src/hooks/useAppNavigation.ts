/**
 * Hooks: App Navigation
 * 
 * Centralized navigation state management for the app
 */

import { useState, useCallback } from 'react';
import { useEnquiryDispatch, useMessageDispatch } from '@/infrastructure';
import { createEnquiryViewedEvent } from '@/domain/enquiry/enquiry.events';
import { createBuyerDMViewedEvent, createSellerDMViewedEvent } from '@/domain/message/message.events';

export type NavigationContext = 
  | { type: 'enquiry'; enquiryId: string; channel: string }
  | { type: 'buyerDM'; dmId: string }
  | { type: 'sellerDM'; dmId: string }
  | { type: 'group'; groupId: string };

export interface AppNavigationState {
  selectedEnquiryId: string | null;
  selectedBuyerDMId: string | null;
  selectedSellerDMId: string | null;
  selectedGroupId: string | null;
  currentChannel: string;
}

export function useAppNavigation(initialEnquiryId: string = "ENQ-2404", initialChannel: string = "internal") {
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(initialEnquiryId);
  const [selectedBuyerDMId, setSelectedBuyerDMId] = useState<string | null>(null);
  const [selectedSellerDMId, setSelectedSellerDMId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [currentChannel, setCurrentChannel] = useState(initialChannel);
  
  const enquiryDispatch = useEnquiryDispatch();
  const messageDispatch = useMessageDispatch();

  const navigateToEnquiry = useCallback((enquiryId: string, channel: string = "internal", personaId?: string) => {
    setSelectedEnquiryId(enquiryId);
    setCurrentChannel(channel);
    setSelectedBuyerDMId(null);
    setSelectedSellerDMId(null);
    setSelectedGroupId(null);
    
    if (personaId) {
      enquiryDispatch(createEnquiryViewedEvent(enquiryId, personaId));
    }
  }, [enquiryDispatch]);

  const navigateToBuyerDM = useCallback((dmId: string, personaId?: string) => {
    setSelectedBuyerDMId(dmId);
    setSelectedEnquiryId(null);
    setSelectedSellerDMId(null);
    setSelectedGroupId(null);
    
    if (personaId) {
      messageDispatch(createBuyerDMViewedEvent(dmId, personaId));
    }
  }, [messageDispatch]);

  const navigateToSellerDM = useCallback((dmId: string, personaId?: string) => {
    setSelectedSellerDMId(dmId);
    setSelectedBuyerDMId(null);
    setSelectedEnquiryId(null);
    setSelectedGroupId(null);
    
    if (personaId) {
      messageDispatch(createSellerDMViewedEvent(dmId, personaId));
    }
  }, [messageDispatch]);

  const navigateToGroup = useCallback((groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedBuyerDMId(null);
    setSelectedSellerDMId(null);
    setSelectedEnquiryId(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEnquiryId(null);
    setSelectedBuyerDMId(null);
    setSelectedSellerDMId(null);
    setSelectedGroupId(null);
  }, []);

  return {
    // State
    selectedEnquiryId,
    selectedBuyerDMId,
    selectedSellerDMId,
    selectedGroupId,
    currentChannel,
    
    // Actions
    navigateToEnquiry,
    navigateToBuyerDM,
    navigateToSellerDM,
    navigateToGroup,
    clearSelection,
    setCurrentChannel,
    
    // Helpers
    getActiveContext: (): NavigationContext | null => {
      if (selectedEnquiryId) return { type: 'enquiry', enquiryId: selectedEnquiryId, channel: currentChannel };
      if (selectedBuyerDMId) return { type: 'buyerDM', dmId: selectedBuyerDMId };
      if (selectedSellerDMId) return { type: 'sellerDM', dmId: selectedSellerDMId };
      if (selectedGroupId) return { type: 'group', groupId: selectedGroupId };
      return null;
    },
  };
}
