/**
 * Invites Hook
 * 
 * Custom hooks for working with group invites
 * 
 * UPDATED: Uses correct GroupInvite fields (contactId, companyId, recipientPersonaId)
 * instead of the non-existent "recipientId" field.
 */

import { useMemo } from "react";
import { useMessageState } from "@/infrastructure";
import { GroupInvite } from "@/domain/message/group-invite.types";
import { getBuyerIdFromPersona, getSellerIdFromPersona } from "@/domain/buyer/buyer-persona-mapping";
import { getContactsForBuyer } from "@/domain/buyer/buyer.mock-data";
import { getContactsForSeller } from "@/domain/seller/seller.mock-data";

/**
 * Get all invites for a specific recipient (by persona ID, companyId, or contactId)
 */
export function useInvitesForRecipient(
  recipientPersonaId: string,
  recipientType: "buyer" | "seller"
): {
  allInvites: GroupInvite[];
  pendingInvites: GroupInvite[];
  acceptedInvites: GroupInvite[];
  rejectedInvites: GroupInvite[];
  pendingCount: number;
} {
  const state = useMessageState();

  return useMemo(() => {
    // Build a set of matching criteria based on recipient type
    let companyId: string | undefined;
    let contactIds: string[] = [];

    if (recipientType === "buyer") {
      companyId = getBuyerIdFromPersona(recipientPersonaId);
      if (companyId) {
        contactIds = getContactsForBuyer(companyId).map(c => c.id);
      }
    } else {
      companyId = getSellerIdFromPersona(recipientPersonaId);
      if (companyId) {
        contactIds = getContactsForSeller(companyId).map(c => c.id);
      }
    }

    const allInvites = (state.groupInvites || []).filter(
      inv => inv.recipientType === recipientType && (
        inv.recipientPersonaId === recipientPersonaId ||
        (companyId && inv.companyId === companyId) ||
        contactIds.includes(inv.contactId)
      )
    );

    const pendingInvites = allInvites.filter(inv => inv.status === "pending");
    const acceptedInvites = allInvites.filter(inv => inv.status === "accepted");
    const rejectedInvites = allInvites.filter(inv => inv.status === "rejected");

    return {
      allInvites,
      pendingInvites,
      acceptedInvites,
      rejectedInvites,
      pendingCount: pendingInvites.length,
    };
  }, [state.groupInvites, recipientPersonaId, recipientType]);
}

/**
 * Get invites for a buyer persona
 */
export function useBuyerInvites(buyerPersonaId: string) {
  return useInvitesForRecipient(buyerPersonaId, "buyer");
}

/**
 * Get invites for a seller persona
 */
export function useSellerInvites(sellerPersonaId: string) {
  return useInvitesForRecipient(sellerPersonaId, "seller");
}

/**
 * Get all pending invites across the system (admin view)
 */
export function useAllPendingInvites(): {
  buyerInvites: GroupInvite[];
  sellerInvites: GroupInvite[];
  totalPending: number;
} {
  const state = useMessageState();

  return useMemo(() => {
    const pendingInvites = (state.groupInvites || []).filter(inv => inv.status === "pending");
    
    const buyerInvites = pendingInvites.filter(inv => inv.recipientType === "buyer");
    const sellerInvites = pendingInvites.filter(inv => inv.recipientType === "seller");

    return {
      buyerInvites,
      sellerInvites,
      totalPending: pendingInvites.length,
    };
  }, [state.groupInvites]);
}
