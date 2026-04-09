/**
 * Shared buyer intake service for mail and WhatsApp bot messages.
 *
 * Both intake paths follow the same domain lifecycle:
 * - find or create the buyer's channel
 * - create the enquiry
 * - create the root message and thread
 * - auto-assign internal team members
 */

import type { Enquiry } from "./enquiry.types";
import type { GroupChannel } from "@/domain/message/group.types";
import type {
  GroupCreatedEvent,
  MessageEvent,
} from "@/domain/message/message.events";
import {
  createGroupMembersAddedEvent,
  createMessageSentEvent,
  createThreadCreatedEvent,
} from "@/domain/message/message.events";
import { createEnquiryCreatedEvent } from "./enquiry.events";
import { autoAssignTeamMembers } from "./enquiry.member-assignment";
import { generateNextEnquiryId } from "./enquiry.thread-creation";
import type { Message } from "@/domain/message/message.types";
import {
  getBuyerById,
  getContactsForBuyer,
  getPrimaryContactForBuyer,
} from "@/domain/buyer/buyer.mock-data";
import type { Contact } from "@/domain/buyer/buyer.types";
import {
  getBuyerPersonaFromBuyerId,
  getBdmPersonaFromBuyerId,
} from "@/domain/buyer/buyer-persona-mapping";
import { generateThreadId } from "@/domain/message/thread.types";
import { generateGroupId } from "@/domain/message/group.utils";
import { getPersonaById } from "@/domain/persona/persona.data";
import { EnquiryIntake } from "./enquiry.intake";

export type BuyerIntakeChannelKind = "whatsapp" | "mail";

export interface CreateEnquiryFromBuyerIntakeParams {
  buyerPersonaId: string;
  buyerId: string;
  buyerName?: string;
  subject?: string;
  body: string;
  existingEnquiries: Enquiry[];
  allGroupChannels: GroupChannel[];
  channelKind: BuyerIntakeChannelKind;
}

export interface CreateEnquiryFromBuyerIntakeResult {
  success: boolean;
  error?: string;
  enquiryId?: string;
  groupId?: string;
  threadId?: string;
  rootMessageId?: string;
  events?: Array<ReturnType<typeof createEnquiryCreatedEvent> | MessageEvent>;
}

function getBuyerIntakeGroupName(buyerName: string, channelKind: BuyerIntakeChannelKind): string {
  return `${buyerName} - ${channelKind === "whatsapp" ? "WhatsApp" : "Mail"}`;
}

export function findBuyerIntakeGroup(
  allGroupChannels: GroupChannel[],
  buyerId: string,
  buyerPersonaId: string | undefined,
  channelKind: BuyerIntakeChannelKind,
): GroupChannel | null {
  const directMatch = allGroupChannels.find((group) => {
    return (
      group.type === "buyer" &&
      group.channelKind === channelKind &&
      (group.buyerId === buyerId || (buyerPersonaId && group.buyerPersonaId === buyerPersonaId))
    );
  });

  return directMatch || null;
}

export function createEnquiryFromBuyerIntake(
  params: CreateEnquiryFromBuyerIntakeParams
): CreateEnquiryFromBuyerIntakeResult {
  const {
    buyerPersonaId,
    buyerId,
    buyerName,
    subject,
    body,
    existingEnquiries,
    allGroupChannels,
    channelKind,
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

  const intakeGroup = findBuyerIntakeGroup(allGroupChannels, buyerId, buyerPersonaId, channelKind);
  const intakeGroupId = intakeGroup?.id || generateGroupId();
  const buyerContactMembers = getContactsForBuyer(buyerId).map((contact: Contact) => ({
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
  const intakeGroupCreatedEvent: GroupCreatedEvent | null = intakeGroup
    ? null
    : {
        type: "GROUP_CREATED",
        payload: {
          groupId: intakeGroupId,
          name: getBuyerIntakeGroupName(resolvedBuyerName, channelKind),
          type: "buyer",
          channelKind,
          status: "active",
          members: [
            {
              id: bdmPersonaId,
              type: "persona",
              name: getPersonaById(bdmPersonaId)?.displayName || bdmPersonaId,
              role: getPersonaById(bdmPersonaId)?.role || "BDM",
            },
            ...buyerPersonaMember,
            ...buyerContactMembers,
          ],
          createdBy: bdmPersonaId,
          buyerId,
          buyerPersonaId: resolvedBuyerPersonaId,
          timestamp: new Date(),
        },
      };
  const intakeGroupMembershipEvent =
    intakeGroup && !intakeGroup.memberPersonaIds.includes(resolvedBuyerPersonaId || buyerPersonaId)
      ? createGroupMembersAddedEvent(
          intakeGroup.id,
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
  const rootMessageId = `${channelKind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const primaryBuyerContact = getPrimaryContactForBuyer(buyerId);
  const buyerSenderName = primaryBuyerContact?.name || resolvedBuyerName;

  const intake: EnquiryIntake = {
    buyer: {
      personaId: resolvedBuyerPersonaId,
      buyerId: buyerId,
      manualName: resolvedBuyerName,
    },
    requirements: {
      categories: [],
      notes: body,
      deliveryLocation: undefined,
    },
    source: {
      medium: channelKind === "whatsapp" ? "whatsapp" : "mail",
      messages: [], // Initial message built below
    },
  };

  const enquiryEvent = createEnquiryCreatedEvent(
    enquiryId,
    bdmPersonaId,
    intake.requirements.deliveryLocation,
    resolveIntakeBuyerName(intake.buyer),
    intake.buyer.personaId,
    true,
  );

  const intakeMessage: Message = {
    id: rootMessageId,
    type: "user",
    sender: buyerSenderName,
    senderPersonaId: intake.buyer.personaId || buyerPersonaId,
    senderRole: "Buyer",
    content: [
      channelKind === "mail" && subject ? `Subject: ${subject}` : null,
      body,
    ].filter(Boolean).join("\n\n"),
    timestamp,
    threadId,
    replyCount: 0,
    threadParticipants: [bdmPersonaId],
  };

  const messageEvent = createMessageSentEvent(enquiryId, intakeGroupId, intakeMessage);
  const threadEvent = createThreadCreatedEvent(
    threadId,
    intakeGroupId,
    bdmPersonaId,
    channelKind === "mail"
      ? (subject || `Buyer mail — ${resolvedBuyerName}`)
      : (subject || `Buyer WhatsApp — ${resolvedBuyerName}`),
    enquiryId,
    rootMessageId,
    intakeMessage,
    true,
    1,
  );

  const assignmentResult = autoAssignTeamMembers(enquiryId, bdmPersonaId);

  return {
    success: true,
    enquiryId,
    groupId: intakeGroupId,
    threadId,
    rootMessageId,
    events: [
      ...(intakeGroupCreatedEvent ? [intakeGroupCreatedEvent] : []),
      ...(intakeGroupMembershipEvent ? [intakeGroupMembershipEvent] : []),
      enquiryEvent,
      messageEvent,
      threadEvent,
      ...assignmentResult.events,
    ],
  };
}
