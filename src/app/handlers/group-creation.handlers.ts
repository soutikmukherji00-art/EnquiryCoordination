/**
 * Group Creation Handlers
 * 
 * Handlers for creating groups with contact-based invite system
 */

import { GroupCreationResult } from "@/app/components/group/UnifiedGroupModal";
import { generateGroupId } from "@/domain/message/group.utils";
import { createGroupCreatedEvent } from "@/domain/message/message.events";
import { createContactGroupInvite } from "@/domain/message/group-invite.utils";
import { createInviteSentEvent } from "@/domain/message/group-invite.events";
import { Persona } from "@/domain/enquiry/enquiry.types";
import { getContactById } from "@/domain/buyer/buyer.mock-data";
import { getSellerContactById } from "@/domain/seller/seller.mock-data";

const __DEV_LOG__ = false;
const devLog = __DEV_LOG__ ? (label: string, data?: any) => console.log(label, data) : (() => {}) as (label: string, data?: any) => void;
const devWarn = __DEV_LOG__ ? (label: string, data?: any) => console.warn(label, data) : (() => {}) as (label: string, data?: any) => void;

/**
 * Handle buyer group creation with contact-based invite system
 */
export function handleBuyerGroupCreation(
  result: GroupCreationResult,
  currentPersona: Persona,
  dispatch: (event: any) => void,
  showToast: any,
  personas: Persona[]
) {
  devLog("[handleBuyerGroupCreation] Creating buyer group with contacts:", result);

  const groupId = generateGroupId();

  // Build internal members array
  const internalMembers = result.internalIds.map(personaId => {
    const persona = personas.find(p => p.id === personaId);
    return {
      id: personaId,
      type: "persona" as const,
      name: persona?.displayName || "",
      role: persona?.role || "",
    };
  });

  // Create group with pending status (will be activated when contacts accept)
  const groupEvent = createGroupCreatedEvent(
    groupId,
    result.groupName,
    "buyer",
    "pending",
    internalMembers,  // Only internal members initially
    currentPersona.id,
    `Waiting for ${result.externalIds.length} contact${result.externalIds.length > 1 ? "s" : ""} to accept invitation`
  );

  dispatch(groupEvent);

  // Send invites to buyer contacts
  let invitesSent = 0;
  result.externalIds.forEach(contactId => {
    const contact = getContactById(contactId);
    if (!contact) {
      devWarn(`[handleBuyerGroupCreation] Contact not found: ${contactId}`);
      return;
    }

    const invite = createContactGroupInvite(
      groupId,
      result.groupName,
      "buyer",
      contactId,
      currentPersona.id,
      currentPersona.displayName,
      currentPersona.role,
      result.inviteMethod || "whatsapp",
      `You've been invited to join "${result.groupName}" for enquiry discussions with Birla Pivot.`
    );

    if (invite) {
      const inviteEvent = createInviteSentEvent(invite);
      dispatch(inviteEvent);
      invitesSent++;
      devLog(`[handleBuyerGroupCreation] Sent invite to: ${contact.name} (${contactId})`);
    }
  });

  showToast.success(
    `Group "${result.groupName}" created! Sent ${invitesSent} invitation${invitesSent > 1 ? "s" : ""}.`
  );

  devLog(`[handleBuyerGroupCreation] Created group ${groupId} with ${invitesSent} invites`);
}

/**
 * Handle seller group creation with contact-based invite system
 */
export function handleSellerGroupCreation(
  result: GroupCreationResult,
  currentPersona: Persona,
  dispatch: (event: any) => void,
  showToast: any,
  personas: Persona[]
) {
  devLog("[handleSellerGroupCreation] Creating seller group with contacts:", result);

  const groupId = generateGroupId();

  // Build internal members array
  const internalMembers = result.internalIds.map(personaId => {
    const persona = personas.find(p => p.id === personaId);
    return {
      id: personaId,
      type: "persona" as const,
      name: persona?.displayName || "",
      role: persona?.role || "",
    };
  });

  // Create group with pending status (will be activated when contacts accept)
  const groupEvent = createGroupCreatedEvent(
    groupId,
    result.groupName,
    "seller",
    "pending",
    internalMembers,  // Only internal members initially
    currentPersona.id,
    `Waiting for ${result.externalIds.length} contact${result.externalIds.length > 1 ? "s" : ""} to accept invitation`
  );

  dispatch(groupEvent);

  // Send invites to seller contacts
  let invitesSent = 0;
  result.externalIds.forEach(contactId => {
    const contact = getSellerContactById(contactId);
    if (!contact) {
      devWarn(`[handleSellerGroupCreation] Contact not found: ${contactId}`);
      return;
    }

    const invite = createContactGroupInvite(
      groupId,
      result.groupName,
      "seller",
      contactId,
      currentPersona.id,
      currentPersona.displayName,
      currentPersona.role,
      result.inviteMethod || "whatsapp",
      `You've been invited to join "${result.groupName}" for pricing discussions with Birla Pivot.`
    );

    if (invite) {
      const inviteEvent = createInviteSentEvent(invite);
      dispatch(inviteEvent);
      invitesSent++;
      devLog(`[handleSellerGroupCreation] Sent invite to: ${contact.name} (${contactId})`);
    }
  });

  if (invitesSent > 0) {
    showToast.success(
      `Group "${result.groupName}" created! Sent ${invitesSent} invitation${invitesSent > 1 ? "s" : ""}.`
    );
    devLog(`[handleSellerGroupCreation] Created group ${groupId} with ${invitesSent} invites`);
  } else {
    showToast.error("No valid contacts selected for invitation");
  }
}