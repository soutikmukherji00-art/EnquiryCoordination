/**
 * Domain: Audit Formatters
 * 
 * Pure functions that format domain events into human-readable audit entries.
 */

import { AuditEntry } from "./audit.types";
import { EnquiryEvent } from "../enquiry/enquiry.events";
import { MessageEvent } from "../message/message.events";
import { findSellerById } from "../seller/seller.types";

export const formatEnquiryCreated = (
  event: Extract<EnquiryEvent, { type: "ENQUIRY_CREATED" }>
): AuditEntry => {
  return {
    id: `audit-${Date.now()}`,
    type: "system",
    timestamp: event.payload.timestamp,
    content: `Enquiry ${event.payload.enquiryId} created`,
    actor: event.payload.createdBy,
    actorRole: event.payload.createdByRole,
  };
};

export const formatStateChange = (
  event: Extract<EnquiryEvent, { type: "ENQUIRY_STATE_CHANGED" }>
): AuditEntry => {
  return {
    id: `audit-${Date.now()}`,
    type: "state_change",
    timestamp: event.payload.timestamp,
    content: `State changed from "${event.payload.fromState}" to "${event.payload.toState}"`,
    actor: event.payload.changedBy,
    actorRole: event.payload.changedByRole,
  };
};

export const formatEnquiryConverted = (
  event: Extract<EnquiryEvent, { type: "ENQUIRY_CONVERTED" }>
): AuditEntry => {
  return {
    id: `audit-${Date.now()}`,
    type: "system",
    timestamp: event.payload.timestamp,
    content: `Enquiry ${event.payload.enquiryId} converted to order`,
    actor: event.payload.convertedBy,
    actorRole: event.payload.convertedByRole,
  };
};

export const formatMessageSent = (
  event: Extract<MessageEvent, { type: "MESSAGE_SENT" }>
): AuditEntry => {
  const { message, channelId } = event.payload;
  const attachmentSuffix = message.attachment
    ? ` [Attachment: ${message.attachment.name}]`
    : "";

  return {
    id: `audit-${Date.now()}`,
    type: "message",
    timestamp: event.payload.timestamp,
    content: `${message.content}${attachmentSuffix}`,
    actor: message.sender || "System",
    actorRole: message.senderRole || "System",
    channel: channelId,
  };
};

export const formatMessageShared = (
  event: Extract<MessageEvent, { type: "MESSAGE_SHARED" }>
): AuditEntry => {
  const { fromChannel, toChannel, messages, sharedBy, edited, masked } =
    event.payload;

  let description = `Shared ${messages.length} message(s) from ${fromChannel} to ${toChannel}`;

  if (edited) {
    description += " (with edits)";
  }

  if (masked) {
    description += " (seller identity masked)";
  }

  return {
    id: `audit-${Date.now()}`,
    type: "share",
    timestamp: event.payload.timestamp,
    content: description,
    actor: sharedBy,
    actorRole: event.payload.sharedByRole,
    metadata: {
      fromChannel,
      toChannel,
      messageCount: messages.length,
      hasEdits: edited,
      masked,
    },
  };
};

export const formatSellerChannelCreated = (
  event: Extract<MessageEvent, { type: "SELLER_CHANNEL_CREATED" }>
): AuditEntry => {
  return {
    id: `audit-${Date.now()}`,
    type: "system",
    timestamp: event.payload.timestamp,
    content: `Created seller channel for ${event.payload.sellerName}`,
    actor: event.payload.createdBy,
    actorRole: event.payload.createdByRole,
  };
};

export const formatFanOut = (
  event: Extract<MessageEvent, { type: "MESSAGES_FAN_OUT" }>
): AuditEntry => {
  const { sellerIds, messages, sentBy } = event.payload;

  const sellerNames = sellerIds
    .map((id) => findSellerById(id)?.name || id)
    .join(", ");

  return {
    id: `audit-${Date.now()}`,
    type: "message",
    timestamp: event.payload.timestamp,
    content: `${sentBy} sent RFQ to ${sellerIds.length} seller(s): ${sellerNames}`,
    actor: sentBy,
    actorRole: event.payload.sentByRole,
    channel: "sellers",
    metadata: {
      sellerIds,
      sellerCount: sellerIds.length,
      messageCount: messages.length,
    },
  };
};