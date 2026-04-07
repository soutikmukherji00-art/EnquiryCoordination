/**
 * Message handling business logic
 * Extracts all message-related handlers from App.tsx
 */

import { toast } from "sonner";
import { Message } from "@/domain/message/message.types";
import type { UserRole } from "@/domain/message/message.types";
import { useBuyerDMMessages } from "./useBuyerDMMessages";
import { useMessages } from "./useMessages";
import { useAppStore } from "./useAppStore";
import { BuyerDMChannel } from "@/domain/message/buyerDM.types";
import { transformForShare } from "@/domain/sharing/share.transforms";
import type { ShareContext } from "@/domain/sharing/share.policy.types";

const __DEV_LOG__ = false;
const devLog = __DEV_LOG__ ? (label: string, data?: any) => console.log(label, data) : (() => {}) as (label: string, data?: any) => void;
const devError = __DEV_LOG__ ? (label: string, data?: any) => console.error(label, data) : (() => {}) as (label: string, data?: any) => void;

export interface MessageHandlerOptions {
  selectedEnquiryId: string;
  currentChannel: string;
  selectedBuyerDMId: string | null;
  selectedBuyerDM: BuyerDMChannel | undefined;
  currentUser: string;
  currentRole: string;
  currentPersonaId: string;
  reloadMessages: () => Promise<void>;
  setSelectedBuyerDMId: (id: string) => void;
  setSelectedEnquiryId: (id: string) => void;
  setCurrentChannel: (channel: string) => void;
}

export function useMessageHandlers(options: MessageHandlerOptions) {
  const {
    selectedEnquiryId,
    currentChannel,
    selectedBuyerDMId,
    selectedBuyerDM,
    currentUser,
    currentRole,
    currentPersonaId,
    reloadMessages,
    setSelectedBuyerDMId,
    setSelectedEnquiryId,
    setCurrentChannel,
  } = options;

  const { sendMessage, shareMessages } = useMessages(selectedEnquiryId, currentChannel);
  const buyerDMMessages = useBuyerDMMessages(selectedBuyerDMId || "");
  const { dataStore, realtimeService } = useAppStore();

  /**
   * Handle sending a message (regular or buyer DM)
   */
  const handleSendMessage = async (
    content: string,
    attachment?: any,
    audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number },
    mentions?: string[]
  ) => {
    // Check if we're in a buyer DM context (BDM sending to a selected buyer DM)
    if (selectedBuyerDMId && buyerDMMessages) {
      devLog("[handleSendMessage] Sending buyer DM message:", { selectedBuyerDMId, content });
      await buyerDMMessages.sendBuyerDMMessage(content, currentUser, currentRole, attachment, audioRecording, mentions);
      toast.success("Message sent");
      return;
    }

    // Otherwise use regular enquiry message sending
    await sendMessage(content, currentUser, currentRole, attachment, audioRecording, mentions);
    toast.success("Message sent");
  };

  /**
   * Handle sharing messages from buyer DM to enquiry
   */
  const handleShareFromBuyerDM = async (
    messageIds: string[],
    toEnquiryId: string,
    editedContents?: Record<string, string>
  ) => {
    if (!selectedBuyerDM) {
      devError("[handleShareFromBuyerDM] No buyer DM selected");
      toast.error("No buyer DM selected");
      return;
    }

    devLog("[handleShareFromBuyerDM] Sharing from Buyer DM to enquiry:", toEnquiryId);

    // Get the actual message objects from the Buyer DM
    const messagesToShare = selectedBuyerDM.messages.filter((m: Message) => messageIds.includes(m.id));
    devLog("[handleShareFromBuyerDM] Messages from Buyer DM:", messagesToShare.length, messagesToShare.map((m: Message) => ({ id: m.id, content: m.content.substring(0, 50) })));

    if (messagesToShare.length === 0) {
      devError("[handleShareFromBuyerDM] No messages found to share!");
      toast.error("No messages selected");
      return;
    }

    // Build policy-driven share context
    const ctx: ShareContext = {
      role: currentRole as UserRole,
      sourceKind: "buyer-dm",
      targetKind: "enquiry-internal",
      sourceId: selectedBuyerDMId || undefined,
      targetId: toEnquiryId,
    };

    const concatenated = transformForShare(messagesToShare, {
      context: ctx,
      sharerName: currentUser,
      sharerPersonaId: currentPersonaId,
      sharerRole: currentRole as UserRole,
      editedContents,
      timestamp: new Date(),
    });

    devLog("[handleShareFromBuyerDM] Transformed via policy pipeline");

    const messageEvent: any = {
      type: "MESSAGE_SENT",
      payload: {
        enquiryId: toEnquiryId,
        channelId: "internal",
        message: concatenated,
        timestamp: concatenated.timestamp,
      },
    };

    devLog("[handleShareFromBuyerDM] Sending concatenated message:", { enquiryId: toEnquiryId, messageId: concatenated.id });
    await dataStore.appendEvent(messageEvent);
    await realtimeService.publish(messageEvent);

    devLog("[handleShareFromBuyerDM] Successfully shared", messagesToShare.length, "messages to", toEnquiryId);
    toast.success(`Shared ${messagesToShare.length} message(s) to ${toEnquiryId}`);

    // Navigate to the target enquiry immediately for seamless experience
    setSelectedBuyerDMId(""); // Clear DM selection
    setSelectedEnquiryId(toEnquiryId); // Switch to target enquiry
    setCurrentChannel("internal"); // Show internal channel where messages were shared

    // Reload messages to show the shared content
    await reloadMessages();
  };

  /**
   * Handle sharing messages between channels
   */
  const handleShareMessages = async (
    messageIds: string[],
    toChannel: string,
    editedContents?: Record<string, string>
  ) => {
    devLog("[handleShareMessages] Starting:", { messageIds, toChannel, editedContents, selectedBuyerDMId, selectedEnquiryId });

    // Special handling for sharing from Buyer DM to an enquiry
    if (selectedBuyerDMId && selectedBuyerDM && toChannel.startsWith("ENQ-")) {
      await handleShareFromBuyerDM(messageIds, toChannel, editedContents);
      return;
    }

    // Regular share to a single channel
    devLog("[handleShareMessages] Regular share to:", toChannel);
    await shareMessages(messageIds, toChannel, currentUser, currentRole, editedContents);
    toast.success(`Shared ${messageIds.length} message(s)`);
  };

  return {
    handleSendMessage,
    handleShareMessages,
  };
}