/**
 * useShareMessages Hook
 *
 * Extracted from App.tsx (Pass 3) to reduce monolithic component size.
 * Handles all message sharing logic across different channel types:
 * - Seller DM → Enquiry channel
 * - Seller DM → Enquiry (by ID)
 * - Buyer DM → Enquiry
 * - Multi-buyer sharing
 * - Multi-seller sharing
 * - Regular single-channel sharing
 *
 * MIGRATION (Phase 8):
 *   Replaced legacy `prepareSharedMessages` + `concatenateSharedMessages`
 *   two-step with the policy-driven `transformForShare` pipeline from
 *   `@/domain/sharing`.  Each path now builds a typed ShareContext and
 *   lets the policy registry resolve masking, attribution, and render
 *   mode automatically.
 */

import { useCallback } from "react";
import type { Message, UserRole } from "@/domain/message/message.types";
import type { MessageEvent } from "@/domain/message/message.events";
import { transformForShare } from "@/domain/sharing/share.transforms";
import type { ShareContext, ShareSourceKind, GroupKind } from "@/domain/sharing/share.policy.types";
import { mapChannelToSourceKind } from "@/domain/sharing/share.channel-kinds";
import { stripRoleSuffix } from "@/domain/utils/name-utils";

// Performance: Debug logging flag - mirrors App.tsx pattern
const __DEV_LOG__ = false;
const devLog = __DEV_LOG__ ? (label: string, data?: any) => console.log(label, data) : (() => {}) as (label: string, data?: any) => void;
const devWarn = __DEV_LOG__ ? (label: string, data?: any) => console.warn(label, data) : (() => {}) as (label: string, data?: any) => void;
const devError = __DEV_LOG__ ? (label: string, data?: any) => console.error(label, data) : (() => {}) as (label: string, data?: any) => void;

export interface UseShareMessagesOptions {
  selectedSellerDMId: string | null;
  selectedSellerDM: any;
  selectedBuyerDMId: string | null;
  selectedBuyerDM: any;
  selectedGroupId: string | null;
  allGroupChannels: any[];
  currentUser: string;
  currentRole: string;
  currentPersonaId: string;
  currentPersonaDisplayName: string;
  currentChannel: string;
  selectedEnquiryId: string | null;
  messages: Message[];
  buyerDMChannels: any[];
  sellerDMChannels: any[];
  messageDispatch: (event: any) => void;
  showToast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
  reloadMessages: () => Promise<void>;
  shareMessages: (messageIds: string[], toChannel: string, currentUser: string, currentRole: string, editedContents?: Record<string, string>, currentPersonaId?: string) => Promise<void>;
  setSelectedSellerDMId: (id: string | null) => void;
  setSelectedBuyerDMId: (id: string | null) => void;
  setSelectedEnquiryId: (id: string | null) => void;
  setCurrentChannel: (channel: string) => void;
  /** Fired after a share is routed into an enquiry-tagged group thread (Pluto tab sync). */
  onRoutedShareToEnquiryThread?: (ctx: {
    threadId: string;
    groupId: string;
    enquiryId: string;
  }) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Check if a channel ID is a group ID.
 */
const isGroupId = (id: string): boolean => id.startsWith('grp_') || id.startsWith('group_');

// ── Hook ─────────────────────────────────────────────────────────────

export function useShareMessages(options: UseShareMessagesOptions) {
  const {
    selectedSellerDMId,
    selectedSellerDM,
    selectedBuyerDMId,
    selectedBuyerDM,
    selectedGroupId,
    allGroupChannels,
    currentUser,
    currentRole,
    currentPersonaId,
    currentPersonaDisplayName,
    currentChannel,
    selectedEnquiryId,
    messages,
    buyerDMChannels,
    sellerDMChannels,
    messageDispatch,
    showToast,
    reloadMessages,
    shareMessages,
    setSelectedSellerDMId,
    setSelectedBuyerDMId,
    setSelectedEnquiryId,
    setCurrentChannel,
    onRoutedShareToEnquiryThread,
  } = options;

  const role = currentRole as UserRole;

  const handleShareMessages = useCallback(async (
    messageIds: string[],
    toChannel: string,
    editedContents?: Record<string, string>
  ) => {
    devLog('[handleShareMessages] Starting:', { messageIds, toChannel, selectedBuyerDMId, selectedSellerDMId, selectedEnquiryId });

    // ═════════════════════════════════════════════════════════════════
    //  PATH 1: Seller DM → Enquiry channel (internal / buyer)
    // ═════════════════════════════════════════════════════════════════
    if (selectedSellerDMId && selectedSellerDM && selectedSellerDM.sourceEnquiryId && (toChannel === 'internal' || toChannel === 'buyer')) {
      devLog('[handleShareMessages] Sharing from Seller DM to enquiry channel:', {
        sourceEnquiryId: selectedSellerDM.sourceEnquiryId,
        toChannel
      });

      const messagesToShare = selectedSellerDM.messages.filter((m: Message) => messageIds.includes(m.id));
      devLog('[handleShareMessages] Messages from Seller DM:', messagesToShare.length);

      if (messagesToShare.length === 0) {
        devError('[handleShareMessages] No messages found to share!');
        showToast.error("No messages selected");
        return;
      }

      const ctx: ShareContext = {
        role,
        sourceKind: "seller-dm",
        targetKind: toChannel === "internal" ? "enquiry-internal" : "enquiry-buyer",
        sourceId: selectedSellerDMId,
        targetId: selectedSellerDM.sourceEnquiryId,
      };

      const concatenated = transformForShare(messagesToShare, {
        context: ctx,
        sharerName: stripRoleSuffix(currentPersonaDisplayName),
        sharerPersonaId: currentPersonaId,
        sharerRole: role,
        editedContents,
        timestamp: new Date(),
      });

      devLog('[handleShareMessages] Transformed via policy pipeline');

      const shareEvent: MessageEvent = {
        type: "MESSAGE_SHARED",
        payload: {
          enquiryId: selectedSellerDM.sourceEnquiryId,
          fromChannel: 'seller-dm',
          toChannel,
          messages: [concatenated],
          sharedBy: stripRoleSuffix(currentUser),
          sharedByRole: currentRole,
          edited: concatenated.edited || false,
          masked: concatenated.masked || false,
          timestamp: new Date(),
        },
      };

      devLog('[handleShareMessages] Dispatching MESSAGE_SHARED event:', {
        enquiryId: selectedSellerDM.sourceEnquiryId,
        messageCount: messagesToShare.length,
        toChannel
      });

      messageDispatch(shareEvent);

      devLog('[handleShareMessages] Successfully shared', messagesToShare.length);
      showToast.success(`Shared ${messagesToShare.length} message(s) to #${toChannel}`);

      setSelectedSellerDMId(null);
      setSelectedEnquiryId(selectedSellerDM.sourceEnquiryId);
      setCurrentChannel(toChannel);

      await reloadMessages();
      return;
    }

    // ═════════════════════════════════════════════════════════════════
    //  PATH 2: Seller DM → Enquiry by ID (ENQ-*)
    // ═════════════════════════════════════════════════════════════════
    if (selectedSellerDMId && selectedSellerDM && toChannel.startsWith('ENQ-')) {
      devLog('[handleShareMessages] Sharing from Seller DM to enquiry:', toChannel);

      const messagesToShare = selectedSellerDM.messages.filter((m: Message) => messageIds.includes(m.id));
      devLog('[handleShareMessages] Messages from Seller DM:', messagesToShare.length);

      if (messagesToShare.length === 0) {
        devError('[handleShareMessages] No messages found to share!');
        showToast.error("No messages selected");
        return;
      }

      const ctx: ShareContext = {
        role,
        sourceKind: "seller-dm",
        targetKind: "enquiry-internal",
        sourceId: selectedSellerDMId,
        targetId: toChannel,
      };

      const concatenated = transformForShare(messagesToShare, {
        context: ctx,
        sharerName: stripRoleSuffix(currentPersonaDisplayName),
        sharerPersonaId: currentPersonaId,
        sharerRole: role,
        editedContents,
        timestamp: new Date(),
      });

      devLog('[handleShareMessages] Transformed via policy pipeline');

      const shareEvent: MessageEvent = {
        type: "MESSAGE_SHARED",
        payload: {
          enquiryId: toChannel,
          fromChannel: 'seller-dm',
          toChannel: 'internal',
          messages: [concatenated],
          sharedBy: stripRoleSuffix(currentUser),
          sharedByRole: currentRole,
          edited: concatenated.edited || false,
          masked: concatenated.masked || false,
          timestamp: new Date(),
        },
      };

      devLog('[handleShareMessages] Dispatching MESSAGE_SHARED event:', {
        enquiryId: toChannel,
        messageCount: messagesToShare.length
      });

      messageDispatch(shareEvent);

      devLog('[handleShareMessages] Successfully shared', messagesToShare.length);
      showToast.success(`Shared ${messagesToShare.length} message(s) to ${toChannel}`);

      setSelectedSellerDMId(null);
      setSelectedEnquiryId(toChannel);
      setCurrentChannel('internal');

      await reloadMessages();
      return;
    }

    // ═════════════════════════════════════════════════════════════════
    //  PATH 3: Buyer DM → Enquiry by ID (ENQ-*)
    // ═════════════════════════════════════════════════════════════════
    if (selectedBuyerDMId && selectedBuyerDM && toChannel.startsWith('ENQ-')) {
      devLog('[handleShareMessages] Sharing from Buyer DM to enquiry:', toChannel);

      const messagesToShare = selectedBuyerDM.messages.filter((m: Message) => messageIds.includes(m.id));
      devLog('[handleShareMessages] Messages from Buyer DM:', messagesToShare.length);

      if (messagesToShare.length === 0) {
        devError('[handleShareMessages] No messages found to share!');
        showToast.error("No messages selected");
        return;
      }

      const ctx: ShareContext = {
        role,
        sourceKind: "buyer-dm",
        targetKind: "enquiry-internal",
        sourceId: selectedBuyerDMId,
        targetId: toChannel,
      };

      const concatenated = transformForShare(messagesToShare, {
        context: ctx,
        sharerName: stripRoleSuffix(currentPersonaDisplayName),
        sharerPersonaId: currentPersonaId,
        sharerRole: role,
        editedContents,
        timestamp: new Date(),
      });

      devLog('[handleShareMessages] Transformed via policy pipeline');

      const shareEvent: MessageEvent = {
        type: "MESSAGE_SHARED",
        payload: {
          enquiryId: toChannel,
          fromChannel: 'buyer-dm',
          toChannel: 'internal',
          messages: [concatenated],
          sharedBy: stripRoleSuffix(currentUser),
          sharedByRole: currentRole,
          edited: concatenated.edited || false,
          masked: concatenated.masked || false,
          timestamp: new Date(),
        },
      };

      devLog('[handleShareMessages] Dispatching MESSAGE_SHARED event:', {
        enquiryId: toChannel,
        messageCount: messagesToShare.length
      });

      messageDispatch(shareEvent);

      devLog('[handleShareMessages] Successfully shared', messagesToShare.length);
      showToast.success(`Shared ${messagesToShare.length} message(s) to ${toChannel}`);

      setSelectedBuyerDMId('');
      setSelectedEnquiryId(toChannel);
      setCurrentChannel('internal');

      await reloadMessages();
      return;
    }

    // ═════════════════════════════════════════════════════════════════
    //  PATH 4: Multi-buyer sharing (buyer-multi:dm-p_buyer_1,dm-p_buyer_2)
    // ═════════════════════════════════════════════════════════════════
    if (toChannel.startsWith('buyer-multi:')) {
      const buyerDMIdsStr = toChannel.replace('buyer-multi:', '');
      const buyerDMIds = buyerDMIdsStr.split(',');

      devLog('[handleShareMessages] Sharing to multiple buyer DMs:', buyerDMIds);

      const selectedMessages = messages.filter((m: Message) => messageIds.includes(m.id));
      const sourceKind = mapChannelToSourceKind(currentChannel);

      for (let buyerDMIndex = 0; buyerDMIndex < buyerDMIds.length; buyerDMIndex++) {
        const buyerDMId = buyerDMIds[buyerDMIndex];
        const buyerDM = buyerDMChannels.find(dm => dm.id === buyerDMId);

        if (!buyerDM) {
          devWarn(`[handleShareMessages] Buyer DM not found: ${buyerDMId}`);
          continue;
        }

        devLog(`[handleShareMessages] Processing buyer DM: ${buyerDM.buyerName} (${buyerDMId})`);

        const ctx: ShareContext = {
          role,
          sourceKind,
          targetKind: "buyer-dm",
          sourceId: selectedEnquiryId || undefined,
          targetId: buyerDMId,
        };

        const concatenated = transformForShare(selectedMessages, {
          context: ctx,
          sharerName: stripRoleSuffix(currentPersonaDisplayName),
          sharerPersonaId: currentPersonaId,
          sharerRole: role,
          editedContents,
          timestamp: new Date(),
        });

        const event = {
          type: "BUYER_DM_MESSAGE_SENT" as const,
          payload: {
            buyerDMId,
            message: concatenated,
            timestamp: new Date(),
          },
        };

        messageDispatch(event);

        devLog('[handleShareMessages] Successfully shared to buyer DM', buyerDMId);
      }

      showToast.success(`Shared to ${buyerDMIds.length} buyer(s)`);
      return;
    }

    // ═════════════════════════════════════════════════════════════════
    //  PATH 5: Multi-seller sharing (seller-multi:s_1,s_2,s_3)
    // ════════════════════════════════════════════════════════════════
    if (toChannel.startsWith('seller-multi:')) {
      const sellerIdsStr = toChannel.replace('seller-multi:', '');
      const sellerIds = sellerIdsStr.split(',');

      devLog('[handleShareMessages] Sharing to multiple sellers:', sellerIds);

      const { findSellerById } = await import('@/domain/seller/seller.types');
      const { generateSellerDMId } = await import('@/domain/message/seller-dm.types');

      const selectedMessages = messages.filter((m: Message) => messageIds.includes(m.id));
      const sourceKind = mapChannelToSourceKind(currentChannel);

      for (let sellerIndex = 0; sellerIndex < sellerIds.length; sellerIndex++) {
        const sellerId = sellerIds[sellerIndex];
        const seller = findSellerById(sellerId);
        if (!seller) {
          devWarn(`[handleShareMessages] Seller not found: ${sellerId}`);
          continue;
        }

        devLog(`[handleShareMessages] Processing seller: ${seller.name} (${sellerId})`);

        const sellerDMId = generateSellerDMId(currentPersonaId, sellerId);

        const ctx: ShareContext = {
          role,
          sourceKind,
          targetKind: "seller-dm",
          sourceId: selectedEnquiryId || undefined,
          targetId: sellerDMId,
        };

      const concatenated = transformForShare(selectedMessages, {
        context: ctx,
        sharerName: stripRoleSuffix(currentPersonaDisplayName),
        sharerPersonaId: currentPersonaId,
        sharerRole: role,
        editedContents,
          timestamp: new Date(),
        });

        devLog('[handleShareMessages] Transformed via policy pipeline');

        const channelExists = (sellerDMChannels || []).some(ch => ch.id === sellerDMId);

        if (!channelExists) {
          devLog('[handleShareMessages] Creating new seller DM channel');
          const createChannelEvent = {
            type: "SELLER_DM_CHANNEL_CREATED" as const,
            payload: {
              sellerDMId,
              sellerId,
              sellerName: seller.name,
              cmPersonaId: currentPersonaId,
              cmName: stripRoleSuffix(currentPersonaDisplayName),
              createdBy: stripRoleSuffix(currentUser),
              timestamp: new Date(),
              sourceEnquiryId: selectedEnquiryId ?? undefined,
            },
          };

          messageDispatch(createChannelEvent);
        }

        const event = {
          type: "SELLER_DM_MESSAGE_SENT" as const,
          payload: {
            sellerDMId,
            message: concatenated,
            timestamp: new Date(),
          },
        };

        messageDispatch(event);

        devLog('[handleShareMessages] Successfully shared to seller DM', sellerDMId);
      }

      showToast.success(`Shared to ${sellerIds.length} seller(s)`);
      return;
    }

    // ═════════════════════════════════════════════════════════════════
    //  PATH 6: Share to a group (grp_* / group_*)
    // ═════════════════════════════════════════════════════════════════
    if (isGroupId(toChannel)) {
      const destGroup = allGroupChannels.find((ch: any) => ch.id === toChannel);

      if (!destGroup) {
        devError('[handleShareMessages] Group channel not found:', toChannel);
        showToast.error("Group channel not found");
        return;
      }

      devLog('[handleShareMessages] Sharing to group:', destGroup.name);

      // ── Resolve source messages based on current context ──────────
      let sourceMessages: Message[] = [];
      let sourceKind: ShareSourceKind;
      let sourceGroupKind: GroupKind | undefined;
      let sourceThreadEnquiryId: string | undefined;

      if (selectedGroupId) {
        // Sharing FROM a group — search main chat messages AND thread messages
        sourceKind = "group-main";
        const sourceGroup = allGroupChannels.find((g: any) => g.id === selectedGroupId);
        if (sourceGroup) {
          sourceGroupKind = sourceGroup.type as GroupKind;

          // First try main chat messages
          sourceMessages = (sourceGroup.messages || []).filter((m: Message) => messageIds.includes(m.id));
          // If not found in main chat, search thread messages (for sharing from ThreadPanel)
          if (sourceMessages.length === 0 && sourceGroup.threads) {
            const allThreadMessages: Message[] = [];
            for (const thread of sourceGroup.threads) {
              allThreadMessages.push(...(thread.messages || []));
            }
            // Also include root messages from main chat that might be selected
            const rootMsgIds = sourceGroup.threads.map((t: any) => t.rootMessageId).filter(Boolean);
            const rootMsgs = (sourceGroup.messages || []).filter((m: Message) => rootMsgIds.includes(m.id) && messageIds.includes(m.id));
            const threadMsgs = allThreadMessages.filter((m: Message) => messageIds.includes(m.id));
            sourceMessages = [...rootMsgs, ...threadMsgs];

            // Detect which enquiry-tagged thread these messages belong to
            if (threadMsgs.length > 0) {
              sourceKind = "thread";
              for (const thread of sourceGroup.threads) {
                if (thread.enquiryId && thread.messages.some((m: Message) => messageIds.includes(m.id))) {
                  sourceThreadEnquiryId = thread.enquiryId;
                  break;
                }
              }
            }
          }
        }
      } else if (selectedBuyerDMId && selectedBuyerDM) {
        // Sharing from buyer DM to a group
        sourceKind = "buyer-dm";
        sourceMessages = (selectedBuyerDM.messages || []).filter((m: Message) => messageIds.includes(m.id));
      } else if (selectedSellerDMId && selectedSellerDM) {
        // Sharing from seller DM to a group
        sourceKind = "seller-dm";
        sourceMessages = (selectedSellerDM.messages || []).filter((m: Message) => messageIds.includes(m.id));
      } else {
        // Sharing from enquiry channels to a group
        sourceKind = mapChannelToSourceKind(currentChannel);
        sourceMessages = messages.filter((m: Message) => messageIds.includes(m.id));
      }

      if (sourceMessages.length === 0) {
        devError('[handleShareMessages] No messages found to share!');
        showToast.error("No messages selected");
        return;
      }

      const ctx: ShareContext = {
        role,
        sourceKind,
        sourceGroupKind,
        targetKind: sourceThreadEnquiryId ? "thread" : "group-main",
        targetGroupKind: destGroup.type as GroupKind,
        sourceId: sourceThreadEnquiryId || selectedGroupId || selectedBuyerDMId || selectedSellerDMId || selectedEnquiryId || undefined,
        targetId: toChannel,
      };

      const concatenated = transformForShare(sourceMessages, {
        context: ctx,
        sharerName: stripRoleSuffix(currentPersonaDisplayName),
        sharerPersonaId: currentPersonaId,
        sharerRole: role,
        editedContents,
        timestamp: new Date(),
      });

      devLog('[handleShareMessages] Transformed via policy pipeline');

      // ── Enquiry-thread clustering: auto-route to a tagged thread ──
      if (sourceThreadEnquiryId) {
        const existingThread = (destGroup.threads || []).find(
          (t: any) => t.enquiryId === sourceThreadEnquiryId
        );

        if (existingThread) {
          // Route the shared message into the existing enquiry thread
          messageDispatch({
            type: "THREAD_MESSAGE_SENT",
            payload: {
              threadId: existingThread.id,
              channelId: toChannel,
              message: concatenated,
              timestamp: new Date(),
            },
          });
          if (onRoutedShareToEnquiryThread && sourceThreadEnquiryId) {
            const tid = existingThread.id;
            const gid = toChannel;
            const eid = sourceThreadEnquiryId;
            setTimeout(() => onRoutedShareToEnquiryThread({ threadId: tid, groupId: gid, enquiryId: eid }), 0);
          }
        } else {
          // No matching thread — create root message + enquiry-tagged thread
          const rootMsgId = `msg-root-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newThreadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

          messageDispatch({
            type: "MESSAGE_SENT",
            payload: {
              enquiryId: toChannel,
              channelId: toChannel,
              message: { ...concatenated, id: rootMsgId, threadId: newThreadId, replyCount: 0 },
              timestamp: new Date(),
            },
          });

          messageDispatch({
            type: "THREAD_CREATED",
            payload: {
              threadId: newThreadId,
              channelId: toChannel,
              creatorId: currentPersonaId,
              timestamp: new Date(),
              title: `${sourceThreadEnquiryId} — shared thread`,
              enquiryId: sourceThreadEnquiryId,
              rootMessageId: rootMsgId,
            },
          });
          if (onRoutedShareToEnquiryThread && sourceThreadEnquiryId) {
            const tid = newThreadId;
            const gid = toChannel;
            const eid = sourceThreadEnquiryId;
            setTimeout(() => onRoutedShareToEnquiryThread({ threadId: tid, groupId: gid, enquiryId: eid }), 0);
          }
        }

        devLog('[handleShareMessages] Routed to enquiry thread', sourceThreadEnquiryId);
        showToast.success(`Shared to ${destGroup.name} (${sourceThreadEnquiryId} thread)`);
        return;
      }

      // Use MESSAGE_SENT — the reducer already handles group IDs (grp_*/group_* prefix)
      const event: MessageEvent = {
        type: "MESSAGE_SENT",
        payload: {
          enquiryId: toChannel, // Group ID doubles as enquiryId for routing in reducer
          channelId: toChannel,
          message: concatenated,
          timestamp: new Date(),
        },
      };

      messageDispatch(event);

      devLog('[handleShareMessages] Successfully shared', sourceMessages.length);
      showToast.success(`Shared ${sourceMessages.length} message(s) to ${destGroup.name}`);
      return;
    }

    // ═════════════════════════════════════════════════════════════════
    //  PATH 7: Fallback — regular single-channel share
    //  (enquiry-to-enquiry via useMessages.shareMessages)
    // ═════════════════════════════════════════════════════════════════
    devLog('[handleShareMessages] Regular share to:', toChannel);
    await shareMessages(messageIds, toChannel, currentUser, currentRole, editedContents, currentPersonaId);
    showToast.success(`Shared ${messageIds.length} message(s)`);
  }, [selectedSellerDMId, selectedSellerDM, selectedBuyerDMId, selectedBuyerDM, selectedGroupId, allGroupChannels, currentUser, currentRole, messageDispatch, showToast, reloadMessages, messages, buyerDMChannels, currentChannel, sellerDMChannels, currentPersonaId, currentPersonaDisplayName, selectedEnquiryId, shareMessages, setSelectedSellerDMId, setSelectedBuyerDMId, setSelectedEnquiryId, setCurrentChannel, onRoutedShareToEnquiryThread]);

  return handleShareMessages;
}
