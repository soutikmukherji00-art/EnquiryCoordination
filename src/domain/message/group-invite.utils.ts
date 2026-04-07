/**
 * Group Invite Utilities
 * 
 * Helper functions for managing group invitations
 * Updated to work with individual contacts instead of companies
 */

import { GroupInvite, InviteMethod, InviteRecipientType } from "./group-invite.types";
import { getUnifiedContactById } from "@/domain/contact/contact.utils";

/**
 * Generate a unique invite ID
 */
export function generateInviteId(): string {
  return `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a group invite for a contact (buyer or seller)
 * This is the new unified approach
 */
export function createContactGroupInvite(
  groupId: string,
  groupName: string,
  groupType: "buyer" | "seller",
  contactId: string,
  invitedByPersonaId: string,
  inviterName: string,
  inviterRole: string,
  inviteMethod: InviteMethod = "whatsapp",
  customMessage?: string
): GroupInvite | null {
  const contact = getUnifiedContactById(contactId);
  if (!contact) return null;

  return {
    id: generateInviteId(),
    groupId,
    groupName,
    groupType,
    contactId,
    recipientType: contact.type,
    recipientName: contact.name,
    recipientRole: contact.role,
    recipientPhone: contact.phone,
    recipientEmail: contact.email,
    companyId: contact.companyId,
    companyName: contact.companyName,
    recipientPersonaId: undefined, // Assigned when they accept
    invitedBy: invitedByPersonaId,
    inviterName,
    inviterRole,
    inviteMethod,
    status: "pending",
    message: customMessage,
    sentAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };
}

/**
 * Create a group invite for a buyer (LEGACY - use createContactGroupInvite instead)
 * @deprecated Use createContactGroupInvite with contactId
 */
export function createBuyerGroupInvite(
  groupId: string,
  groupName: string,
  buyerId: string,
  buyerName: string,
  buyerPhone: string | undefined,
  buyerPersonaId: string | undefined,
  invitedByPersonaId: string,
  inviterName: string,
  inviterRole: string,
  inviteMethod: InviteMethod = "whatsapp",
  customMessage?: string
): GroupInvite {
  return {
    id: generateInviteId(),
    groupId,
    groupName,
    groupType: "buyer",
    contactId: buyerId, // LEGACY: treating buyerId as contactId
    recipientType: "buyer",
    recipientName: buyerName,
    recipientRole: "", // Not available in legacy
    recipientPhone: buyerPhone,
    companyId: buyerId,
    companyName: buyerName,
    recipientPersonaId: buyerPersonaId,
    invitedBy: invitedByPersonaId,
    inviterName,
    inviterRole,
    inviteMethod,
    status: "pending",
    message: customMessage,
    sentAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };
}

/**
 * Create a group invite for a seller (LEGACY - use createContactGroupInvite instead)
 * @deprecated Use createContactGroupInvite with contactId
 */
export function createSellerGroupInvite(
  groupId: string,
  groupName: string,
  sellerId: string,
  sellerName: string,
  sellerPhone: string | undefined,
  sellerPersonaId: string | undefined,
  invitedByPersonaId: string,
  inviterName: string,
  inviterRole: string,
  inviteMethod: InviteMethod = "whatsapp",
  customMessage?: string
): GroupInvite {
  return {
    id: generateInviteId(),
    groupId,
    groupName,
    groupType: "seller",
    contactId: sellerId, // LEGACY: treating sellerId as contactId
    recipientType: "seller",
    recipientName: sellerName,
    recipientRole: "", // Not available in legacy
    recipientPhone: sellerPhone,
    companyId: sellerId,
    companyName: sellerName,
    recipientPersonaId: sellerPersonaId,
    invitedBy: invitedByPersonaId,
    inviterName,
    inviterRole,
    inviteMethod,
    status: "pending",
    message: customMessage,
    sentAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };
}

/**
 * Generate WhatsApp invite message
 */
export function generateWhatsAppInviteMessage(invite: GroupInvite): string {
  const { groupName, inviterName, inviterRole, recipientName, message } = invite;
  
  let whatsappMessage = `Hi ${recipientName},\n\n`;
  whatsappMessage += `${inviterName} (${inviterRole}) has invited you to join the group:\n`;
  whatsappMessage += `"${groupName}"\n\n`;
  
  if (message) {
    whatsappMessage += `Message: ${message}\n\n`;
  }
  
  whatsappMessage += `Click the link below to accept the invitation:\n`;
  whatsappMessage += `[Accept Invitation]\n\n`; // In production, this would be an actual link
  whatsappMessage += `This invitation will expire in 7 days.\n\n`;
  whatsappMessage += `Best regards,\nBirla Pivot Team`;
  
  return whatsappMessage;
}

/**
 * Generate email invite message
 */
export function generateEmailInviteMessage(invite: GroupInvite): { subject: string; body: string } {
  const { groupName, inviterName, inviterRole, recipientName, message } = invite;
  
  const subject = `You've been invited to join "${groupName}"`;
  
  let body = `<p>Hi ${recipientName},</p>`;
  body += `<p>${inviterName} (${inviterRole}) has invited you to join the group: <strong>${groupName}</strong></p>`;
  
  if (message) {
    body += `<p><em>Message: ${message}</em></p>`;
  }
  
  body += `<p><a href="[INVITE_LINK]" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a></p>`;
  body += `<p style="color: #666; font-size: 12px;">This invitation will expire in 7 days.</p>`;
  body += `<p>Best regards,<br/>Birla Pivot Team</p>`;
  
  return { subject, body };
}

/**
 * Check if an invite is expired
 */
export function isInviteExpired(invite: GroupInvite): boolean {
  if (!invite.expiresAt) return false;
  return new Date() > invite.expiresAt;
}

/**
 * Check if an invite can be accepted
 */
export function canAcceptInvite(invite: GroupInvite): boolean {
  return invite.status === "pending" && !isInviteExpired(invite);
}

/**
 * Format invite for display
 */
export function formatInviteForDisplay(invite: GroupInvite): string {
  const status = invite.status.charAt(0).toUpperCase() + invite.status.slice(1);
  const sentDate = invite.sentAt.toLocaleDateString();
  return `${invite.groupName} - Invited by ${invite.inviterName} on ${sentDate} (${status})`;
}