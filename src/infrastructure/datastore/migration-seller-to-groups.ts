/**
 * Migration Helper: Seller DM Channels to Seller Groups
 * 
 * Converts old seller DM channels and enquiry seller channels to the new group-based model.
 */

import { SellerDMChannel } from "@/domain/message/seller-dm.types";
import { SellerChannel } from "@/domain/message/message.types";
import { GroupChannel, GroupMember } from "@/domain/message/group.types";
import { generateGroupId } from "@/domain/message/group.utils";
import { getPersonaById } from "@/domain/persona/persona.data";

/**
 * Migrates a SellerDMChannel to GroupChannel format
 */
export function migrateSellerDMToGroup(
  sellerDM: SellerDMChannel
): GroupChannel {
  const cmPersona = getPersonaById(sellerDM.cmPersonaId);
  
  const members: GroupMember[] = [
    // Seller member (external contact)
    {
      id: sellerDM.sellerId,
      type: "contact",
      name: sellerDM.sellerName,
      role: "Seller",
      sellerId: sellerDM.sellerId,
    },
    // CM who created the channel (internal persona)
    {
      id: sellerDM.cmPersonaId,
      type: "persona",
      name: cmPersona?.displayName || sellerDM.cmName,
      role: cmPersona?.role || "CM",
    },
  ];

  // Extract member IDs and persona IDs
  const memberIds = members.map(m => m.id);
  const memberPersonaIds = members
    .filter(m => m.type === "persona")
    .map(m => m.id);

  return {
    id: generateGroupId(),
    name: `${sellerDM.sellerName} - General`,
    type: "seller",
    status: "active", // Auto-approved
    memberIds,
    memberPersonaIds,
    messages: sellerDM.messages,
    createdBy: sellerDM.cmPersonaId,
    createdAt: sellerDM.lastActivity || new Date(),
    sellerId: sellerDM.sellerId,
    lastActivity: sellerDM.lastActivity,
    unreadCount: sellerDM.unreadCount,
    unread: sellerDM.unread,
  };
}

/**
 * Migrates an enquiry SellerChannel to GroupChannel format
 */
export function migrateEnquirySellerChannelToGroup(
  sellerChannel: SellerChannel,
  enquiryId: string,
  creatorCMPersonaId: string
): GroupChannel {
  const cmPersona = getPersonaById(creatorCMPersonaId);
  
  const members: GroupMember[] = [
    // Seller member (external contact)
    {
      id: sellerChannel.sellerId,
      type: "contact",
      name: sellerChannel.sellerName,
      role: "Seller",
      sellerId: sellerChannel.sellerId,
    },
    // CM who manages this enquiry (internal persona)
    {
      id: creatorCMPersonaId,
      type: "persona",
      name: cmPersona?.displayName || "Category Manager",
      role: cmPersona?.role || "CM",
    },
  ];

  // Extract member IDs and persona IDs
  const memberIds = members.map(m => m.id);
  const memberPersonaIds = members
    .filter(m => m.type === "persona")
    .map(m => m.id);

  return {
    id: generateGroupId(),
    name: `${sellerChannel.sellerName} - Enquiry Discussion`,
    type: "seller",
    status: "active",
    memberIds,
    memberPersonaIds,
    messages: sellerChannel.messages || [],
    createdBy: creatorCMPersonaId,
    createdAt: new Date(),
    enquiryId, // Link to original enquiry
    sellerId: sellerChannel.sellerId,
    unread: sellerChannel.unread,
  };
}

/**
 * Creates a dummy seller group for each seller
 * These are pre-created to allow immediate forwarding
 */
export function createDummySellerGroup(
  sellerId: string,
  sellerName: string,
  creatorCMPersonaId: string
): GroupChannel {
  const cmPersona = getPersonaById(creatorCMPersonaId);
  
  const members: GroupMember[] = [
    // Seller member
    {
      id: sellerId,
      type: "contact",
      name: sellerName,
      role: "Seller",
      sellerId,
    },
    // Creator CM
    {
      id: creatorCMPersonaId,
      type: "persona",
      name: cmPersona?.displayName || "Category Manager",
      role: cmPersona?.role || "CM",
    },
  ];

  const memberIds = members.map(m => m.id);
  const memberPersonaIds = members
    .filter(m => m.type === "persona")
    .map(m => m.id);

  return {
    id: generateGroupId(),
    name: `${sellerName} - General`,
    type: "seller",
    status: "active",
    memberIds,
    memberPersonaIds,
    messages: [],
    createdBy: creatorCMPersonaId,
    createdAt: new Date(),
    sellerId,
    lastActivity: new Date(),
    unread: false,
    unreadCount: 0,
  };
}
