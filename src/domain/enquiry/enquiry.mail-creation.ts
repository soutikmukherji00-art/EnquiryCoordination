/**
 * Domain service for creating enquiries from buyer email intake.
 * 
 * The bot/classifier routes an incoming buyer email into a Buyer Mail group,
 * creates the new enquiry, and tags the forwarded mail body as the root of a
 * new enquiry thread.
 */

import type { Enquiry } from "./enquiry.types";
import type { GroupChannel } from "@/domain/message/group.types";
import type { MessageEvent } from "@/domain/message/message.events";
import { createGroupCreatedEvent, createGroupMembersAddedEvent } from "@/domain/message/message.events";
import { createEnquiryCreatedEvent } from "./enquiry.events";
import { autoAssignTeamMembers } from "./enquiry.member-assignment";
import { generateNextEnquiryId } from "./enquiry.thread-creation";
import { createMessageSentEvent, createThreadCreatedEvent } from "@/domain/message/message.events";
import type { Message } from "@/domain/message/message.types";
import { getBuyerById } from "@/domain/buyer/buyer.mock-data";
import { getBuyerPersonaFromBuyerId, getBdmPersonaFromBuyerId } from "@/domain/buyer/buyer-persona-mapping";
import { generateThreadId } from "@/domain/message/thread.types";
import { generateGroupId } from "@/domain/message/group.utils";
import { getPersonaById } from "@/domain/persona/persona.data";
import { getContactsForBuyer } from "@/domain/buyer/buyer.mock-data";

export interface CreateEnquiryFromBuyerMailParams {
  buyerPersonaId: string;
  buyerId: string;
  buyerName?: string;
  subject?: string;
  body: string;
  existingEnquiries: Enquiry[];
  allGroupChannels: GroupChannel[];
}

export interface CreateEnquiryFromBuyerMailResult {
  success: boolean;
  error?: string;
  enquiryId?: string;
  groupId?: string;
  threadId?: string;
  rootMessageId?: string;
  events?: Array<ReturnType<typeof createEnquiryCreatedEvent> | MessageEvent>;
}

export function findBuyerMailGroup(
  allGroupChannels: GroupChannel[],
  buyerId: string,
  buyerPersonaId?: string,
): GroupChannel | null {
  const directMatch = allGroupChannels.find((group) => {
    return (
      group.type === "buyer" &&
      group.channelKind === "mail" &&
      (group.buyerId === buyerId || (buyerPersonaId && group.buyerPersonaId === buyerPersonaId))
    );
  });

  return directMatch || null;
}

export function createEnquiryFromBuyerMail(
  params: CreateEnquiryFromBuyerMailParams
): CreateEnquiryFromBuyerMailResult {
  const {
    buyerPersonaId,
    buyerId,
    buyerName,
    subject,
    body,
    existingEnquiries,
    allGroupChannels,
  } = params;

  const resolvedBuyerName = buyerName || getBuyerById(buyerId)?.name || "Unknown Buyer";
  const resolvedBuyerPersonaId = getBuyerPersonaFromBuyerId(buyerId) || buyerPersonaId;
  const bdmPersonaId = getBdmPersonaFromBuyerId(buyerId);
  if (!bdmPersonaId) {
    return {
      success: false,
      error: "No BDM mapped for this buyer",
    };
  }

  const mailGroup = findBuyerMailGroup(allGroupChannels, buyerId, buyerPersonaId);
  const mailGroupId = mailGroup?.id || generateGroupId();
  const buyerContactMembers = getContactsForBuyer(buyerId).map((contact) => ({
    id: contact.id,
    type: "contact" as const,
    name: contact.name,
    phone: contact.phone,
    role: contact.role,
    buyerId,
  }));
  const buyerPersonaMember = resolvedBuyerPersonaId
    ? [{
        id: resolvedBuyerPersonaId,
        type: "persona" as const,
        name: resolvedBuyerName,
        role: "Buyer" as const,
      }]
    : [];
  const mailGroupCreatedEvent = mailGroup
    ? null
    : createGroupCreatedEvent(
        mailGroupId,
        `${resolvedBuyerName} - Mail`,
        "buyer",
        "active",
        [
          {
            id: bdmPersonaId,
            type: "persona",
            name: getPersonaById(bdmPersonaId)?.displayName || bdmPersonaId,
            role: getPersonaById(bdmPersonaId)?.role || "BDM",
          },
          ...buyerPersonaMember,
          ...buyerContactMembers,
        ],
        bdmPersonaId,
        undefined,
        {
          channelKind: "mail",
          buyerId,
          buyerPersonaId: resolvedBuyerPersonaId,
        }
      );
  const mailGroupMembershipEvent =
    mailGroup && !mailGroup.memberPersonaIds.includes(resolvedBuyerPersonaId || buyerPersonaId)
      ? createGroupMembersAddedEvent(
          mailGroup.id,
          [
            ...buyerPersonaMember,
            ...buyerContactMembers,
          ],
          bdmPersonaId
        )
      : null;

  const enquiryId = generateNextEnquiryId(existingEnquiries);
  const threadId = generateThreadId();
  const timestamp = new Date();
  const rootMessageId = `mail-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const enquiryEvent = createEnquiryCreatedEvent(
    enquiryId,
    bdmPersonaId,
    undefined,
    resolvedBuyerName,
    resolvedBuyerPersonaId,
  );

  const emailMessage: Message = {
    id: rootMessageId,
    type: "user",
    sender: resolvedBuyerName,
    senderPersonaId: buyerPersonaId,
    senderRole: "Buyer",
    content: [
      subject ? `Subject: ${subject}` : null,
      body,
    ].filter(Boolean).join("\n\n"),
    timestamp,
    threadId,
    replyCount: 0,
    threadParticipants: [bdmPersonaId],
  };

  const messageEvent = createMessageSentEvent(enquiryId, mailGroupId, emailMessage);
  const threadEvent = createThreadCreatedEvent(
    threadId,
    mailGroupId,
    bdmPersonaId,
    subject || `Buyer mail — ${resolvedBuyerName}`,
    enquiryId,
    rootMessageId,
  );

  const assignmentResult = autoAssignTeamMembers(enquiryId, bdmPersonaId);

  return {
    success: true,
    enquiryId,
    groupId: mailGroupId,
    threadId,
    rootMessageId,
    events: [
      ...(mailGroupCreatedEvent ? [mailGroupCreatedEvent] : []),
      ...(mailGroupMembershipEvent ? [mailGroupMembershipEvent] : []),
      enquiryEvent,
      messageEvent,
      threadEvent,
      ...assignmentResult.events,
    ],
  };
}
