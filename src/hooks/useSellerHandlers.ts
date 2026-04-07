/**
 * Seller channel handling business logic
 * Extracts seller-related handlers from App.tsx
 */

import { toast } from "sonner";
import { useSellerChannels } from "./useSellerChannels";

const __DEV_LOG__ = false;
const devLog = __DEV_LOG__ ? (label: string, data?: any) => console.log(label, data) : (() => {}) as (label: string, data?: any) => void;
const devWarn = __DEV_LOG__ ? (label: string, data?: any) => console.warn(label, data) : (() => {}) as (label: string, data?: any) => void;
const devError = __DEV_LOG__ ? (label: string, data?: any) => console.error(label, data) : (() => {}) as (label: string, data?: any) => void;

export interface SellerHandlerOptions {
  selectedEnquiryId: string;
  currentUser: string;
  currentRole: string;
  shareMessages: (messageIds: string[], toChannel: string, currentUser: string, currentRole: string, editedContents?: Record<string, string>) => Promise<void>;
  setCurrentChannel: (channel: string) => void;
}

export function useSellerHandlers(options: SellerHandlerOptions) {
  const { selectedEnquiryId, currentUser, currentRole, shareMessages, setCurrentChannel } = options;

  const { sellerChannels, fanOutMessages, sendToSellerChannel, createSellerChannel, reload: reloadSellerChannels } = useSellerChannels(selectedEnquiryId);

  /**
   * Handle fan-out to multiple sellers
   */
  const handleFanOut = async (sellerIds: string[], content: string) => {
    await fanOutMessages(sellerIds, content, currentUser, currentRole);
    toast.success(`Sent to ${sellerIds.length} seller(s)`);
    await reloadSellerChannels();
  };

  /**
   * Handle sending message to seller channel
   */
  const handleSellerChannelMessage = async (
    sellerId: string,
    content: string,
    attachment?: any,
    audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number }
  ) => {
    await sendToSellerChannel(sellerId, content, currentUser, currentRole, attachment, audioRecording);
    toast.success("Message sent to seller");
    await reloadSellerChannels();
  };

  /**
   * Handle seller mention - creates channel if needed and sends message
   */
  const handleSellerMention = async (
    sellerId: string,
    sellerName: string,
    content: string,
    attachment?: { name: string; type: string; url: string }
  ) => {
    try {
      devLog("[handleSellerMention] Starting:", { sellerId, sellerName, content });

      // Check if seller channel already exists
      const existingChannel = sellerChannels.find((sc) => sc.sellerId === sellerId);
      devLog("[handleSellerMention] Existing channel:", existingChannel);

      // Create channel if it doesn't exist
      if (!existingChannel) {
        devLog("[handleSellerMention] Creating new channel...");
        await createSellerChannel(sellerId, sellerName, currentUser, currentRole);
        devLog("[handleSellerMention] Channel created");
      }

      // Send message to the seller channel
      devLog("[handleSellerMention] Sending message to channel...");
      await sendToSellerChannel(sellerId, content, currentUser, currentRole, attachment);
      devLog("[handleSellerMention] Message sent");

      toast.success(`Message sent to ${sellerName}`);

      // Reload seller channels to get the latest state
      devLog("[handleSellerMention] Reloading seller channels...");
      await reloadSellerChannels();
      devLog("[handleSellerMention] Channels reloaded");

      // Switch to the seller channel to show the message
      setCurrentChannel(`seller-${sellerId}`);
      devLog("[handleSellerMention] Switched to channel:", `seller-${sellerId}`);
    } catch (error) {
      devError("Failed to send message to seller:", error);
      toast.error("Failed to send message to seller");
    }
  };

  /**
   * Handle sharing to multiple sellers (from share dialog)
   * Integrates with the main message sharing system
   */
  const handleShareToSellers = async (
    messageIds: string[],
    sellerIdsStr: string,
    editedContents?: Record<string, string>
  ) => {
    const sellerIds = sellerIdsStr.split(",");

    devLog("[handleShareToSellers] Sharing to multiple sellers:", sellerIds);

    // Import SELLERS to get seller names
    const { findSellerById } = await import("@/domain/seller/seller.types");

    // For each seller, create channel if needed and share messages
    for (const sellerId of sellerIds) {
      const seller = findSellerById(sellerId);
      if (!seller) {
        devWarn(`[handleShareToSellers] Seller not found: ${sellerId}`);
        continue;
      }

      devLog(`[handleShareToSellers] Processing seller: ${seller.name} (${sellerId})`);

      // Check if seller channel already exists
      const existingChannel = sellerChannels.find((sc) => sc.sellerId === sellerId);
      devLog(`[handleShareToSellers] Existing channel for ${seller.name}:`, existingChannel);

      // Create channel if it doesn't exist
      if (!existingChannel) {
        devLog(`[handleShareToSellers] Creating channel for ${seller.name}`);
        await createSellerChannel(sellerId, seller.name, currentUser, currentRole);
      }

      // Share messages to this seller's channel
      const sellerChannelId = `seller-${sellerId}`;
      devLog(`[handleShareToSellers] Sharing to channel: ${sellerChannelId}`);
      await shareMessages(messageIds, sellerChannelId, currentUser, currentRole, editedContents);
    }

    // Reload seller channels to get the latest state
    devLog("[handleShareToSellers] Reloading seller channels...");
    await reloadSellerChannels();

    toast.success(`Shared to ${sellerIds.length} seller(s)`);
    devLog("[handleShareToSellers] Complete");
  };

  return {
    handleFanOut,
    handleSellerChannelMessage,
    handleSellerMention,
    handleShareToSellers,
    sellerChannels,
    reloadSellerChannels,
  };
}