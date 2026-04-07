/**
 * View Navigation Handlers Hook
 * 
 * Consolidates all view selection and navigation handlers.
 * Handles:
 * - Enquiry selection with channel switching
 * - DM selection (buyer/seller)
 * - Group selection
 * - Thread selection with mode switching
 * - Side effects (realtime events, telemetry)
 */

import { useCallback } from "react";
import { useNavigationState } from "./useNavigationState";
import { useMessageDispatch, useEnquiryDispatch } from "@/infrastructure";
import { 
  createEnquiryViewedEvent,
  createBuyerDMViewedEvent,
  createSellerDMViewedEvent,
  createGroupViewedEvent,
  createThreadViewedEvent
} from "@/domain/message/message.events";
import type { RealtimeService } from "@/infrastructure/realtime/realtime.interface";

export interface ViewNavigationHandlersOptions {
  realtimeService?: RealtimeService;
  onNavigate?: (context: string) => void; // Telemetry callback
}

export interface ViewNavigationHandlers {
  // Primary navigation
  handleSelectEnquiry: (enquiryId: string, channel?: string) => void;
  handleSelectBuyerDM: (dmId: string) => void;
  handleSelectSellerDM: (dmId: string) => void;
  handleSelectGroup: (groupId: string) => void;
  handleSelectThread: (threadId: string, groupId: string, mode?: "side-panel" | "main") => void;
  
  // Thread-specific
  handleOpenThread: (threadId: string, groupId: string) => void;
  handleCloseThread: () => void;
  
  // Channel switching (enquiry-specific)
  handleChannelSwitch: (channel: string) => void;
  
  // Audit trail
  handleToggleAudit: () => void;
}

export function useViewNavigationHandlers(
  options: ViewNavigationHandlersOptions = {}
): ViewNavigationHandlers {
  const { realtimeService, onNavigate } = options;
  const navigation = useNavigationState();
  const messageDispatch = useMessageDispatch();
  const enquiryDispatch = useEnquiryDispatch();
  
  // Select enquiry (with realtime event + telemetry)
  const handleSelectEnquiry = useCallback((enquiryId: string, channel: string = "internal") => {
    navigation.selectEnquiry(enquiryId, channel);
    
    // Dispatch viewed event
    enquiryDispatch(createEnquiryViewedEvent(enquiryId));
    
    // Realtime event
    if (realtimeService) {
      realtimeService.emit("enquiry:viewed", { enquiryId, channel });
    }
    
    // Telemetry
    onNavigate?.(`enquiry:${enquiryId}:${channel}`);
  }, [navigation, enquiryDispatch, realtimeService, onNavigate]);
  
  // Select buyer DM (with realtime event)
  const handleSelectBuyerDM = useCallback((dmId: string) => {
    navigation.selectBuyerDM(dmId);
    
    // Dispatch viewed event (marks unread as read)
    messageDispatch(createBuyerDMViewedEvent(dmId));
    
    // Realtime event
    if (realtimeService) {
      realtimeService.emit("dm:viewed", { dmId, type: "buyer" });
    }
    
    // Telemetry
    onNavigate?.(`buyer-dm:${dmId}`);
  }, [navigation, messageDispatch, realtimeService, onNavigate]);
  
  // Select seller DM (with realtime event)
  const handleSelectSellerDM = useCallback((dmId: string) => {
    navigation.selectSellerDM(dmId);
    
    // Dispatch viewed event (marks unread as read)
    messageDispatch(createSellerDMViewedEvent(dmId));
    
    // Realtime event
    if (realtimeService) {
      realtimeService.emit("dm:viewed", { dmId, type: "seller" });
    }
    
    // Telemetry
    onNavigate?.(`seller-dm:${dmId}`);
  }, [navigation, messageDispatch, realtimeService, onNavigate]);
  
  // Select group (with realtime event)
  const handleSelectGroup = useCallback((groupId: string) => {
    navigation.selectGroup(groupId);
    
    // Dispatch viewed event (marks unread as read)
    messageDispatch(createGroupViewedEvent(groupId));
    
    // Realtime event
    if (realtimeService) {
      realtimeService.emit("group:viewed", { groupId });
    }
    
    // Telemetry
    onNavigate?.(`group:${groupId}`);
  }, [navigation, messageDispatch, realtimeService, onNavigate]);
  
  // Select thread (with realtime event)
  const handleSelectThread = useCallback((threadId: string, groupId: string, mode: "side-panel" | "main" = "main") => {
    navigation.selectThread(threadId, groupId, mode);
    
    // Dispatch viewed event
    messageDispatch(createThreadViewedEvent(threadId, groupId));
    
    // Realtime event
    if (realtimeService) {
      realtimeService.emit("thread:viewed", { threadId, groupId, mode });
    }
    
    // Telemetry
    onNavigate?.(`thread:${threadId}:${mode}`);
  }, [navigation, messageDispatch, realtimeService, onNavigate]);
  
  // Open thread (in side-panel mode, keeps current selection)
  const handleOpenThread = useCallback((threadId: string, groupId: string) => {
    navigation.openThread(threadId, groupId, "side-panel");
    
    // Dispatch viewed event
    messageDispatch(createThreadViewedEvent(threadId, groupId));
    
    // Realtime event
    if (realtimeService) {
      realtimeService.emit("thread:opened", { threadId, groupId });
    }
    
    // Telemetry
    onNavigate?.(`thread-opened:${threadId}`);
  }, [navigation, messageDispatch, realtimeService, onNavigate]);
  
  // Close thread
  const handleCloseThread = useCallback(() => {
    navigation.closeThread();
    
    // Telemetry
    onNavigate?.("thread-closed");
  }, [navigation, onNavigate]);
  
  // Channel switch (enquiry-specific)
  const handleChannelSwitch = useCallback((channel: string) => {
    navigation.setChannel(channel);
    
    // Telemetry
    onNavigate?.(`channel-switch:${channel}`);
  }, [navigation, onNavigate]);
  
  // Toggle audit trail
  const handleToggleAudit = useCallback(() => {
    navigation.toggleAuditTrail();
    
    // Telemetry
    onNavigate?.(`audit-trail:${!navigation.showAuditTrail ? "opened" : "closed"}`);
  }, [navigation, onNavigate]);
  
  return {
    handleSelectEnquiry,
    handleSelectBuyerDM,
    handleSelectSellerDM,
    handleSelectGroup,
    handleSelectThread,
    handleOpenThread,
    handleCloseThread,
    handleChannelSwitch,
    handleToggleAudit,
  };
}
