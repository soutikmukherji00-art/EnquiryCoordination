/**
 * Seller Invites List
 * 
 * Displays pending and past group invitations for sellers
 */

import React, { useState } from "react";
import { GroupInviteCard } from "./GroupInviteCard";
import { GroupInvite } from "@/domain/message/group-invite.types";
import { createInviteAcceptedEvent, createInviteRejectedEvent } from "@/domain/message/group-invite.events";
import { useMessageState, useMessageDispatch } from "@/infrastructure";
import { Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "../ui/utils";
import { getSellerIdFromPersona } from "@/domain/buyer/buyer-persona-mapping";
import { getContactsForSeller } from "@/domain/seller/seller.mock-data";

interface SellerInvitesListProps {
  currentSellerId: string; // s_1 format (from getSellerIdByPersonaName)
  currentPersonaId?: string; // p_seller_1 format (for proper invite acceptance)
  className?: string;
}

type InviteFilter = "pending" | "accepted" | "rejected" | "all";

export function SellerInvitesList({
  currentSellerId,
  currentPersonaId,
  className,
}: SellerInvitesListProps) {
  const state = useMessageState();
  const dispatch = useMessageDispatch();
  const [filter, setFilter] = useState<InviteFilter>("pending");

  // Get the seller_N format ID for matching against invite companyId
  const sellerDataId = currentPersonaId 
    ? getSellerIdFromPersona(currentPersonaId) 
    : undefined;

  // Get all seller contact IDs for this seller (sc_1, sc_2, etc.)
  const sellerContactIds = sellerDataId 
    ? getContactsForSeller(sellerDataId).map(c => c.id) 
    : [];

  // Get invites for current seller by matching:
  // 1. companyId matches seller_N format (from MOCK_SELLERS)
  // 2. OR contactId is one of this seller's contacts
  // 3. OR legacy: contactId matches s_N format sellerId
  const myInvites = (state.groupInvites || []).filter(
    inv => inv.recipientType === "seller" && (
      (sellerDataId && inv.companyId === sellerDataId) ||
      sellerContactIds.includes(inv.contactId) ||
      inv.contactId === currentSellerId
    )
  );

  // Filter invites based on selected filter
  const filteredInvites = myInvites.filter(invite => {
    if (filter === "all") return true;
    return invite.status === filter;
  });

  // Sort by date (newest first)
  const sortedInvites = [...filteredInvites].sort((a, b) => 
    b.sentAt.getTime() - a.sentAt.getTime()
  );

  const handleAccept = (inviteId: string) => {
    const invite = (state.groupInvites || []).find(inv => inv.id === inviteId);
    if (!invite) return;
    
    // Use persona ID if available so memberPersonaIds gets the correct value
    // This ensures useGroupChannels can find the group for this seller
    const acceptedBy = currentPersonaId || currentSellerId;
    
    const event = createInviteAcceptedEvent(
      inviteId,
      invite.groupId,
      acceptedBy,
      invite
    );
    dispatch(event);
  };

  const handleReject = (inviteId: string, reason?: string) => {
    const invite = (state.groupInvites || []).find(inv => inv.id === inviteId);
    if (!invite) return;
    
    const rejectedBy = currentPersonaId || currentSellerId;
    
    const event = createInviteRejectedEvent(
      inviteId,
      invite.groupId,
      rejectedBy,
      reason,
      invite
    );
    dispatch(event);
  };

  // Count by status
  const pendingCount = myInvites.filter(i => i.status === "pending").length;
  const acceptedCount = myInvites.filter(i => i.status === "accepted").length;
  const rejectedCount = myInvites.filter(i => i.status === "rejected").length;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Group Invitations</h2>
            <p className="text-sm text-gray-600">
              {pendingCount} pending {pendingCount === 1 ? "invitation" : "invitations"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("pending")}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
              filter === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            <Clock className="w-4 h-4" />
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("accepted")}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
              filter === "accepted"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            <CheckCircle className="w-4 h-4" />
            Accepted ({acceptedCount})
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
              filter === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            <XCircle className="w-4 h-4" />
            Rejected ({rejectedCount})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              filter === "all"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            All ({myInvites.length})
          </button>
        </div>
      </div>

      {/* Invites List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {sortedInvites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {filter !== "all" ? filter : ""} invitations
            </h3>
            <p className="text-sm text-gray-600 max-w-sm">
              {filter === "pending"
                ? "You don't have any pending group invitations at the moment."
                : filter === "accepted"
                ? "You haven't accepted any group invitations yet."
                : filter === "rejected"
                ? "You haven't rejected any group invitations."
                : "You don't have any group invitations yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedInvites.map(invite => (
              <GroupInviteCard
                key={invite.id}
                invite={invite}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}