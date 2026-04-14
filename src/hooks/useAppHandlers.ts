/**
 * Hook: App Handlers
 * 
 * Memoized event handlers for App component to prevent child re-renders.
 * All handlers are wrapped in useCallback for performance optimization.
 */

import { useCallback } from "react";
import { toast } from "sonner";
import { Persona, generateMemberId } from "@/domain/enquiry/enquiry.types";
import { getPersonaById } from "@/domain/persona/persona.data";
import { CHANNEL_VISIBILITY } from "@/domain/message/message.types";
import { Message, Attachment } from "@/domain/message/message.types";
import type { UserRole } from "@/domain/message/message.types";
import type { EnquiryState } from "@/domain/enquiry/enquiry.state-machine";
import { filterEnquiriesByPersona } from "@/domain/enquiry/enquiry.filters";
import { EnquiryCreationData } from "@/domain/enquiry/enquiry.creation";
import {
  createMemberAddedEvent,
  createMemberRemovedEvent,
  createEnquiryCreatedEvent,
  createPrimaryCMAssignedEvent,
} from "@/domain/enquiry/enquiry.events";
import { findSellerById } from "@/domain/seller/seller.types";
import { getCMForRegion, type Region } from "@/domain/cm/cm.region";
import { transformForShare } from "@/domain/sharing/share.transforms";
import type { ShareContext } from "@/domain/sharing/share.policy.types";

const __DEV_LOG__ = false;
const devLog = __DEV_LOG__ ? (label: string, data?: any) => console.log(label, data) : (() => {}) as (label: string, data?: any) => void;
const devError = __DEV_LOG__ ? (label: string, data?: any) => console.error(label, data) : (() => {}) as (label: string, data?: any) => void;

interface UseAppHandlersProps {
  currentRole: string;
  currentPersona: Persona;
  currentUser: string;
  enquiries: any[];
  messages: Message[];
  sellerChannels: any[];
  selectedMessages: Set<string>;
  editedMessageContents: Record<string, string>;
  messageInput: string;
  attachment: Attachment | null;
  changeRole: (role: any) => void;
  changePersona: (persona: Persona) => void;
  changeEnquiryState: (id: string, state: string, user: string, role: string) => Promise<void>;
  convertEnquiry: (id: string, user: string, role: string) => Promise<void>;
  sendMessage: (content: string, user: string, role: string, attachment?: any, audio?: any, mentions?: string[]) => Promise<void>;
  shareMessages: (ids: string[], channel: string, user: string, role: string, edits?: Record<string, string>) => Promise<void>;
  fanOutMessages: (sellerIds: string[], content: string, user: string, role: string) => Promise<void>;
  sendToSellerChannel: (sellerId: string, content: string, user: string, role: string, attachment?: any, audio?: any) => Promise<void>;
  createSellerChannel: (sellerId: string, name: string, user: string, role: string) => Promise<void>;
  createEnquiryWithMessages: (data: EnquiryCreationData, messages: Message[], user: string, role: string, personaId: string, enquiries: any[]) => Promise<string>;
  reloadMessages: () => Promise<void>;
  reloadSellerChannels: () => Promise<void>;
  setCurrentChannel: (channel: string) => void;
  setSelectedEnquiryId: (id: string) => void;
  setSelectedBuyerDMId: (id: string | null) => void;
  dispatch: (event: any) => void;
  dataStore: any;
  realtimeService: any;
  selectedBuyerDM: any;
  onMentionSeller?: (sellerId: string, sellerName: string, content: string, attachment?: any) => void;
}

export const useAppHandlers = (props: UseAppHandlersProps) => {
  const {
    currentRole,
    currentPersona,
    currentUser,
    enquiries,
    messages,
    sellerChannels,
    selectedMessages,
    editedMessageContents,
    messageInput,
    attachment,
    changeRole,
    changePersona,
    changeEnquiryState,
    convertEnquiry,
    sendMessage,
    shareMessages,
    fanOutMessages,
    sendToSellerChannel,
    createSellerChannel,
    createEnquiryWithMessages,
    reloadMessages,
    reloadSellerChannels,
    setCurrentChannel,
    setSelectedEnquiryId,
    setSelectedBuyerDMId,
    dispatch,
    dataStore,
    realtimeService,
    selectedBuyerDM,
  } = props;

  const handleRoleChange = useCallback((newRole: typeof currentRole) => {
    changeRole(newRole, { enquiries });
    
    // Update channel visibility based on new role
    const newVisibleChannels = CHANNEL_VISIBILITY[newRole];
    // This logic needs to access current channel - will be handled in component
  }, [changeRole, enquiries]);

  const handlePersonaChange = useCallback((newPersona: typeof currentPersona) => {
    changePersona(newPersona);
    
    // Filter enquiries for the new persona
    const accessibleEnquiries = filterEnquiriesByPersona(enquiries, newPersona);
    
    // Will trigger navigation logic in component
  }, [changePersona, enquiries]);

  const handleStateChange = useCallback(async (enquiryId: string, newState: string) => {
    await changeEnquiryState(enquiryId, newState as EnquiryState, currentUser, currentRole);
    toast.success(`State changed to: ${newState}`);
  }, [changeEnquiryState, currentUser, currentRole]);

  const handleConvertToOrder = useCallback(async (enquiryId: string) => {
    await convertEnquiry(enquiryId, currentUser, currentRole);
    toast.success("Enquiry converted to order!");
  }, [convertEnquiry, currentUser, currentRole]);

  const handleSendMessage = useCallback(async (
    content: string,
    attachmentParam?: any,
    audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number },
    mentions?: string[]
  ) => {
    await sendMessage(content, currentUser, currentRole, attachmentParam, audioRecording, mentions);
    toast.success("Message sent");
  }, [sendMessage, currentUser, currentRole]);

  const handleShareMessages = useCallback(async (
    messageIds: string[],
    toChannel: string,
    editedContents?: Record<string, string>
  ) => {
    devLog('[handleShareMessages] Starting:', { messageIds, toChannel, editedContents });
    
    // Handle buyer DM sharing
    if (selectedBuyerDM && toChannel.startsWith('ENQ-')) {
      const messagesToShare = selectedBuyerDM.messages.filter((m: Message) => messageIds.includes(m.id));
      
      if (messagesToShare.length === 0) {
        toast.error("No messages selected");
        return;
      }
      
      const ctx: ShareContext = {
        role: currentRole as UserRole,
        sourceKind: "buyer-dm",
        targetKind: "enquiry-internal",
        sourceId: selectedBuyerDM.id,
        targetId: toChannel,
      };

      const concatenated = transformForShare(messagesToShare, {
        context: ctx,
        sharerName: currentUser,
        sharerPersonaId: currentPersona.id,
        sharerRole: currentRole as UserRole,
        editedContents,
        timestamp: new Date(),
      });
      
      const messageEvent: any = {
        type: "MESSAGE_SENT",
        payload: {
          enquiryId: toChannel,
          channelId: "internal",
          message: concatenated,
          timestamp: concatenated.timestamp,
        },
      };
      
      await dataStore.appendEvent(messageEvent);
      await realtimeService.publish(messageEvent);
      
      toast.success(`Shared ${messagesToShare.length} message(s) to ${toChannel}`);
      setSelectedBuyerDMId('');
      setSelectedEnquiryId(toChannel);
      setCurrentChannel('internal');
      await reloadMessages();
      return;
    }
    
    // Handle multi-seller sharing
    if (toChannel.startsWith('seller-multi:')) {
      const sellerIdsStr = toChannel.replace('seller-multi:', '');
      const sellerIds = sellerIdsStr.split(',');
      
      for (const sellerId of sellerIds) {
        const seller = findSellerById(sellerId);
        if (!seller) continue;
        
        const existingChannel = sellerChannels.find((sc: any) => sc.sellerId === sellerId);
        
        if (!existingChannel) {
          await createSellerChannel(sellerId, seller.name, currentUser, currentRole);
        }
        
        const sellerChannelId = `seller-${sellerId}`;
        await shareMessages(messageIds, sellerChannelId, currentUser, currentRole, editedContents);
      }
      
      await reloadSellerChannels();
      toast.success(`Shared to ${sellerIds.length} seller(s)`);
      return;
    }
    
    // Regular share
    await shareMessages(messageIds, toChannel, currentUser, currentRole, editedContents);
    toast.success(`Shared ${messageIds.length} message(s)`);
  }, [
    selectedBuyerDM,
    currentUser,
    currentRole,
    currentPersona,
    sellerChannels,
    shareMessages,
    createSellerChannel,
    reloadMessages,
    reloadSellerChannels,
    setSelectedBuyerDMId,
    setSelectedEnquiryId,
    setCurrentChannel,
    dataStore,
    realtimeService,
  ]);

  const handleFanOut = useCallback(async (sellerIds: string[], content: string) => {
    await fanOutMessages(sellerIds, content, currentUser, currentRole);
    toast.success(`Sent to ${sellerIds.length} seller(s)`);
    await reloadSellerChannels();
  }, [fanOutMessages, reloadSellerChannels, currentUser, currentRole]);

  const handleSellerChannelMessage = useCallback(async (
    sellerId: string,
    content: string,
    attachmentParam?: any,
    audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number }
  ) => {
    await sendToSellerChannel(sellerId, content, currentUser, currentRole, attachmentParam, audioRecording);
    toast.success("Message sent to seller");
    await reloadSellerChannels();
  }, [sendToSellerChannel, reloadSellerChannels, currentUser, currentRole]);

  const handleSellerMention = useCallback(async (
    sellerId: string,
    sellerName: string,
    content: string,
    attachmentParam?: { name: string; type: string; url: string }
  ) => {
    try {
      const existingChannel = sellerChannels.find((sc: any) => sc.sellerId === sellerId);
      
      if (!existingChannel) {
        await createSellerChannel(sellerId, sellerName, currentUser, currentRole);
      }
      
      await sendToSellerChannel(sellerId, content, currentUser, currentRole, attachmentParam);
      toast.success(`Message sent to ${sellerName}`);
      await reloadSellerChannels();
      setCurrentChannel(`seller-${sellerId}`);
    } catch (error) {
      devError("Failed to send message to seller:", error);
      toast.error("Failed to send message to seller");
    }
  }, [
    sellerChannels,
    createSellerChannel,
    sendToSellerChannel,
    reloadSellerChannels,
    setCurrentChannel,
    currentUser,
    currentRole,
  ]);

  const handleAddMember = useCallback((personaId: string, selectedEnquiryId: string) => {
    const persona = getPersonaById(personaId);
    if (!persona) {
      toast.error("Persona not found");
      return;
    }
    
    const memberId = generateMemberId(selectedEnquiryId, personaId);
    const member = {
      id: memberId,
      userId: persona.userId,
      personaId: persona.id,
      role: persona.role,
      joinedAt: new Date(),
    };
    
    const event = createMemberAddedEvent(selectedEnquiryId, member);
    dispatch(event);
    toast.success(`Added ${persona.displayName}`);
  }, [dispatch]);

  const handleRemoveMember = useCallback((memberId: string, selectedEnquiryId: string) => {
    const event = createMemberRemovedEvent(selectedEnquiryId, memberId);
    dispatch(event);
    toast.success("Member removed");
  }, [dispatch]);

  const handleCreateEnquiry = useCallback(async (data: EnquiryCreationData, messagesToShare: Message[]) => {
    try {
      const newEnquiryId = await createEnquiryWithMessages(
        data,
        messagesToShare,
        currentUser,
        currentRole as UserRole,
        currentPersona?.id || "unknown",
        enquiries
      );
      
      // Dispatch events
      const enquiryEvent = createEnquiryCreatedEvent(
        newEnquiryId,
        currentPersona?.id || "unknown",
        data.deliveryLocation,
        data.buyerName
      );
      dispatch(enquiryEvent);
      
      // Add creator as member
      const persona = currentPersona;
      if (persona) {
        const memberId = generateMemberId(newEnquiryId, persona.id);
        const member = {
          id: memberId,
          userId: persona.userId,
          personaId: persona.id,
          role: persona.role,
          joinedAt: new Date(),
        };
        const memberAddedEvent = createMemberAddedEvent(newEnquiryId, member);
        dispatch(memberAddedEvent);
      }
      
      // Auto-assign CM
      let assignedCMName = "";
      if (data.deliveryLocation) {
        const region = data.deliveryLocation as Region;
        const cmPersonaId = getCMForRegion(region);
        if (cmPersonaId) {
          const cmPersona = getPersonaById(cmPersonaId);
          if (cmPersona) {
            const cmMemberId = generateMemberId(newEnquiryId, cmPersonaId);
            const cmMember = {
              id: cmMemberId,
              userId: cmPersona.userId,
              personaId: cmPersonaId,
              role: cmPersona.role,
              joinedAt: new Date(),
              isPrimaryCM: true,
            };
            
            const cmMemberAddedEvent = createMemberAddedEvent(newEnquiryId, cmMember);
            dispatch(cmMemberAddedEvent);
            
            const primaryCMEvent = createPrimaryCMAssignedEvent(newEnquiryId, cmMemberId);
            dispatch(primaryCMEvent);
            
            assignedCMName = cmPersona.displayName;
          }
        }
      }
      
      // Auto-assign CX
      const cxPersonaId = "p_cx_1";
      const cxPersona = getPersonaById(cxPersonaId);
      if (cxPersona) {
        const cxMemberId = generateMemberId(newEnquiryId, cxPersonaId);
        const cxMember = {
          id: cxMemberId,
          userId: cxPersona.userId,
          personaId: cxPersonaId,
          role: cxPersona.role,
          joinedAt: new Date(),
        };
        
        const cxMemberAddedEvent = createMemberAddedEvent(newEnquiryId, cxMember);
        dispatch(cxMemberAddedEvent);
      }
      
      // Success message
      if (assignedCMName) {
        toast.success(`Created enquiry ${newEnquiryId} • Assigned to ${assignedCMName} + CX`);
      } else {
        toast.success(`Created enquiry ${newEnquiryId} • CX assigned`);
      }
      
      // Navigate to new enquiry
      setSelectedBuyerDMId('');
      setSelectedEnquiryId(newEnquiryId);
      setCurrentChannel("internal");
      await reloadMessages();
    } catch (error) {
      devError("Failed to create enquiry:", error);
      toast.error("Failed to create enquiry");
    }
  }, [
    createEnquiryWithMessages,
    currentUser,
    currentRole,
    currentPersona,
    enquiries,
    dispatch,
    setSelectedBuyerDMId,
    setSelectedEnquiryId,
    setCurrentChannel,
    reloadMessages,
  ]);

  return {
    handleRoleChange,
    handlePersonaChange,
    handleStateChange,
    handleConvertToOrder,
    handleSendMessage,
    handleShareMessages,
    handleFanOut,
    handleSellerChannelMessage,
    handleSellerMention,
    handleAddMember,
    handleRemoveMember,
    handleCreateEnquiry,
  };
};