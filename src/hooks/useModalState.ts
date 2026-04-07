/**
 * Modal State Hook
 * 
 * Centralized state manager for all modal/dialog/widget states.
 * Consolidates scattered modal state from App.tsx.
 */

import { useState, useCallback } from "react";
import type { Message } from "@/domain/message/message.types";

export interface ModalState {
  // Group creation
  isGroupModalOpen: boolean;
  
  // Thread creation
  showThreadModal: boolean;
  threadCreationMessageId: string | null;
  threadCreationMessage: Message | null;
  
  // Delivery widget (AI inline widget)
  showDeliveryWidget: boolean;
  deliveryWidgetEnquiryId: string | null;
  deliveryLocation: string | null;
  
  // Profile bottom sheet (mobile)
  profileBottomSheetOpen: boolean;
  profilePersonaId: string | null;
}

export interface ModalActions {
  // Group modal
  openGroupModal: () => void;
  closeGroupModal: () => void;
  
  // Thread modal
  openThreadModal: (message: Message) => void;
  closeThreadModal: () => void;
  
  // Delivery widget
  openDeliveryWidget: (enquiryId: string, location: string) => void;
  closeDeliveryWidget: () => void;
  
  // Profile sheet
  openProfileSheet: (personaId: string) => void;
  closeProfileSheet: () => void;
  
  // Close all modals
  closeAllModals: () => void;
}

const initialState: ModalState = {
  isGroupModalOpen: false,
  showThreadModal: false,
  threadCreationMessageId: null,
  threadCreationMessage: null,
  showDeliveryWidget: false,
  deliveryWidgetEnquiryId: null,
  deliveryLocation: null,
  profileBottomSheetOpen: false,
  profilePersonaId: null,
};

export function useModalState(): ModalState & ModalActions {
  const [state, setState] = useState<ModalState>(initialState);
  
  // Group modal
  const openGroupModal = useCallback(() => {
    setState(prev => ({ ...prev, isGroupModalOpen: true }));
  }, []);
  
  const closeGroupModal = useCallback(() => {
    setState(prev => ({ ...prev, isGroupModalOpen: false }));
  }, []);
  
  // Thread modal
  const openThreadModal = useCallback((message: Message) => {
    setState(prev => ({
      ...prev,
      showThreadModal: true,
      threadCreationMessageId: message.id,
      threadCreationMessage: message,
    }));
  }, []);
  
  const closeThreadModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      showThreadModal: false,
      threadCreationMessageId: null,
      threadCreationMessage: null,
    }));
  }, []);
  
  // Delivery widget
  const openDeliveryWidget = useCallback((enquiryId: string, location: string) => {
    setState(prev => ({
      ...prev,
      showDeliveryWidget: true,
      deliveryWidgetEnquiryId: enquiryId,
      deliveryLocation: location,
    }));
  }, []);
  
  const closeDeliveryWidget = useCallback(() => {
    setState(prev => ({
      ...prev,
      showDeliveryWidget: false,
      deliveryWidgetEnquiryId: null,
      deliveryLocation: null,
    }));
  }, []);
  
  // Profile sheet
  const openProfileSheet = useCallback((personaId: string) => {
    setState(prev => ({
      ...prev,
      profileBottomSheetOpen: true,
      profilePersonaId: personaId,
    }));
  }, []);
  
  const closeProfileSheet = useCallback(() => {
    setState(prev => ({
      ...prev,
      profileBottomSheetOpen: false,
      profilePersonaId: null,
    }));
  }, []);
  
  // Close all modals (useful for reset/cleanup)
  const closeAllModals = useCallback(() => {
    setState(initialState);
  }, []);
  
  return {
    ...state,
    openGroupModal,
    closeGroupModal,
    openThreadModal,
    closeThreadModal,
    openDeliveryWidget,
    closeDeliveryWidget,
    openProfileSheet,
    closeProfileSheet,
    closeAllModals,
  };
}

/**
 * Utility: Check if any modal is open
 */
export function hasOpenModal(state: ModalState): boolean {
  return (
    state.isGroupModalOpen ||
    state.showThreadModal ||
    state.showDeliveryWidget ||
    state.profileBottomSheetOpen
  );
}
