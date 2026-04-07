/**
 * Group Invite System
 * 
 * Handles invitations for both buyer and seller groups
 * Invites are sent to individual contacts, not whole companies
 */

export type InviteStatus = "pending" | "accepted" | "rejected" | "expired";
export type InviteMethod = "whatsapp" | "email" | "internal";
export type InviteRecipientType = "buyer" | "seller";

/**
 * Group Invite - sent to external users (contacts) to join a group
 */
export interface GroupInvite {
  id: string; // e.g., "invite_abc123"
  groupId: string; // Reference to the group
  groupName: string;
  groupType: "buyer" | "seller" | "custom";
  
  // Recipient information (CONTACT-BASED)
  contactId: string; // Contact ID (c_1, sc_1, etc.)
  recipientType: InviteRecipientType;
  recipientName: string; // Contact's name
  recipientRole: string; // Contact's role
  recipientPhone?: string;
  recipientEmail?: string;
  companyId: string; // Buyer ID or Seller ID
  companyName: string; // Company name for display
  recipientPersonaId?: string; // If they have a persona (for internal tracking)
  
  // Sender information
  invitedBy: string; // Persona ID of inviter
  inviterName: string;
  inviterRole: string;
  
  // Invite details
  inviteMethod: InviteMethod;
  status: InviteStatus;
  message?: string; // Custom invitation message
  
  // Timestamps
  sentAt: Date;
  expiresAt?: Date;
  respondedAt?: Date;
  
  // WhatsApp specific
  whatsappMessageId?: string;
  whatsappStatus?: "sent" | "delivered" | "read" | "failed";
}

/**
 * Invite acceptance response
 */
export interface InviteAcceptance {
  inviteId: string;
  groupId: string;
  acceptedBy: string; // Persona ID or contact ID
  acceptedAt: Date;
}

/**
 * Invite rejection response
 */
export interface InviteRejection {
  inviteId: string;
  groupId: string;
  rejectedBy: string;
  rejectedAt: Date;
  reason?: string;
}