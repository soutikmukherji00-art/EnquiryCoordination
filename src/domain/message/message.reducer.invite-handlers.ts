/**
 * Message Reducer - Invite Event Handlers
 * 
 * Handles group invitation lifecycle events
 */

import { MessageDomainState } from "./message.reducer";
import { GroupInviteEvent } from "./group-invite.events";
import { SELLER_TO_PERSONA_MAP } from "@/domain/seller/seller.types";

/**
 * Handle INVITE_SENT event
 */
export function handleInviteSent(
  state: MessageDomainState,
  event: GroupInviteEvent
): MessageDomainState {
  if (event.type !== "INVITE_SENT") return state;
  
  const { invite } = event.payload;
  
  // Add invite to the state (with safety check for undefined groupInvites)
  return {
    ...state,
    groupInvites: [...(state.groupInvites || []), invite],
  };
}

/**
 * Handle INVITE_ACCEPTED event
 * Updated to work with contact-based invites
 */
export function handleInviteAccepted(
  state: MessageDomainState,
  event: GroupInviteEvent
): MessageDomainState {
  if (event.type !== "INVITE_ACCEPTED") return state;
  
  const { acceptance, invite } = event.payload;
  
  // Update invite status to accepted (with safety check)
  const updatedInvites = (state.groupInvites || []).map(inv =>
    inv.id === acceptance.inviteId
      ? { ...inv, status: "accepted" as const, respondedAt: acceptance.acceptedAt }
      : inv
  );
  
  // Find the group and add the contact (with safety check)
  const updatedGroupChannels = (state.groupChannels || []).map(group => {
    if (group.id === acceptance.groupId) {
      // Don't add if already a member
      if (group.memberPersonaIds.includes(invite.recipientPersonaId || acceptance.acceptedBy)) {
        return group;
      }
      
      // Add the new member (using contactId from invite)
      const newMemberId = invite.contactId; // UPDATED: use contactId instead of recipientId
      const newMemberPersonaId = invite.recipientPersonaId || acceptance.acceptedBy;
      
      // Derive sellerId (s_1 format) or buyerId for the group if not already set
      let sellerId = group.sellerId;
      let buyerId = group.buyerId;
      
      if (!sellerId && invite.recipientType === "seller") {
        // Try to find s_N format from persona map (acceptedBy is p_seller_N)
        const sellerEntry = Object.entries(SELLER_TO_PERSONA_MAP)
          .find(([_, personaId]) => personaId === acceptance.acceptedBy);
        if (sellerEntry) {
          sellerId = sellerEntry[0]; // e.g., "s_1"
        }
      }
      
      if (!buyerId && invite.recipientType === "buyer") {
        // invite.companyId is already in buyer_N format (matches MOCK_BUYERS IDs)
        buyerId = invite.companyId;
      }
      
      return {
        ...group,
        memberIds: [...group.memberIds, newMemberId],
        memberPersonaIds: [...group.memberPersonaIds, newMemberPersonaId],
        status: "active" as const, // Activate group if it was pending
        sellerId,
        buyerId,
      };
    }
    return group;
  });
  
  return {
    ...state,
    groupInvites: updatedInvites,
    groupChannels: updatedGroupChannels,
  };
}

/**
 * Handle INVITE_REJECTED event
 */
export function handleInviteRejected(
  state: MessageDomainState,
  event: GroupInviteEvent
): MessageDomainState {
  if (event.type !== "INVITE_REJECTED") return state;
  
  const { rejection } = event.payload;
  
  // Update invite status to rejected (with safety check)
  const updatedInvites = (state.groupInvites || []).map(inv =>
    inv.id === rejection.inviteId
      ? { ...inv, status: "rejected" as const, respondedAt: rejection.rejectedAt }
      : inv
  );
  
  return {
    ...state,
    groupInvites: updatedInvites,
  };
}

/**
 * Handle INVITE_EXPIRED event
 */
export function handleInviteExpired(
  state: MessageDomainState,
  event: GroupInviteEvent
): MessageDomainState {
  if (event.type !== "INVITE_EXPIRED") return state;
  
  const { inviteId } = event.payload;
  
  // Update invite status to expired (with safety check)
  const updatedInvites = (state.groupInvites || []).map(inv =>
    inv.id === inviteId
      ? { ...inv, status: "expired" as const }
      : inv
  );
  
  return {
    ...state,
    groupInvites: updatedInvites,
  };
}