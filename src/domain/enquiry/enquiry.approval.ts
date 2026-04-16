import type { Member } from "./enquiry.types";
import { selectMembersByRole, selectPrimaryCM } from "./enquiry.selectors";
import type { EnquiryStateStore } from "./enquiry.reducer";
import type { Message } from "@/domain/message/message.types";
import type { MessageDomainState } from "@/domain/message/message.reducer";

export interface WinSignalPODocument {
  messageId: string;
  name: string;
  type?: string;
  url?: string;
  timestamp: Date;
  note?: string;
}

export interface WinSignalBuyerConfirmationSnippet {
  messageId: string;
  content: string;
  timestamp: Date;
}

function collectThreadMessages(messages: Message[], rootMessage?: Message): Message[] {
  return rootMessage ? [rootMessage, ...messages] : messages;
}

export function collectEnquiryMessages(
  messageState: MessageDomainState,
  enquiryId: string
): Message[] {
  const regularMessages = Object.values(messageState.messages[enquiryId] || {}).flat();
  const sellerChannelMessages = (messageState.sellerChannels[enquiryId] || []).flatMap(
    (channel) => channel.messages
  );
  const sellerDMMessages = messageState.sellerDMChannels
    .filter((channel) => channel.sourceEnquiryId === enquiryId)
    .flatMap((channel) => channel.messages);

  // Group messages for groups tagged with this enquiry
  const taggedGroupMessages = messageState.groupChannels
    .filter((group) => group.enquiryId === enquiryId)
    .flatMap((group) => group.messages);

  // Thread messages from ANY group if the thread is tagged with this enquiry
  const groupThreadMessages = messageState.groupChannels.flatMap((group) =>
    (group.threads || [])
      .filter((thread) => thread.enquiryId === enquiryId)
      .flatMap((thread) => collectThreadMessages(thread.messages, thread.rootMessage))
  );

  const standaloneThreadMessages = messageState.threads
    .filter((thread) => thread.enquiryId === enquiryId)
    .flatMap((thread) => collectThreadMessages(thread.messages, thread.rootMessage));

  return [
    ...regularMessages,
    ...sellerChannelMessages,
    ...sellerDMMessages,
    ...taggedGroupMessages,
    ...groupThreadMessages,
    ...standaloneThreadMessages,
  ];
}

export function hasPOTaggedAttachment(messages: Message[]): boolean {
  return messages.some((message) => message.attachment?.markAsPO === true);
}

export function hasBuyerConfirmation(messages: Message[]): boolean {
  return messages.some((message) => message.markAsBuyerConfirmation === true);
}

export function enquiryHasPOTaggedAttachment(
  messageState: MessageDomainState,
  enquiryId: string
): boolean {
  return hasPOTaggedAttachment(collectEnquiryMessages(messageState, enquiryId));
}

export function enquiryHasBuyerConfirmation(
  messageState: MessageDomainState,
  enquiryId: string
): boolean {
  return hasBuyerConfirmation(collectEnquiryMessages(messageState, enquiryId));
}

export function enquiryHasWinSignals(
  messageState: MessageDomainState,
  enquiryId: string
): boolean {
  const messages = collectEnquiryMessages(messageState, enquiryId);
  return hasPOTaggedAttachment(messages) || hasBuyerConfirmation(messages);
}

export function collectBuyerConfirmationExcerpts(
  messageState: MessageDomainState,
  enquiryId: string,
  maxItems = 20,
): string[] {
  const messages = collectEnquiryMessages(messageState, enquiryId);
  return messages
    .filter((m) => m.markAsBuyerConfirmation === true)
    .map((m) => m.content?.trim())
    .filter((c): c is string => Boolean(c))
    .slice(0, maxItems);
}

export function collectWinSignalEvidence(
  messageState: MessageDomainState,
  enquiryId: string,
  maxItems = 20,
): {
  poDocuments: WinSignalPODocument[];
  buyerConfirmations: WinSignalBuyerConfirmationSnippet[];
} {
  const messages = collectEnquiryMessages(messageState, enquiryId);

  const poDocuments = messages
    .filter((message) => message.attachment?.markAsPO === true)
    .map((message) => ({
      messageId: message.id,
      name: message.attachment?.name?.trim() || "PO document",
      type: message.attachment?.type,
      url: message.attachment?.url,
      timestamp: message.timestamp,
      note: message.content?.trim() || undefined,
    }))
    .slice(0, maxItems);

  const buyerConfirmations = messages
    .filter((message) => message.markAsBuyerConfirmation === true)
    .map((message) => ({
      messageId: message.id,
      content: message.content?.trim() || "Buyer confirmation marked",
      timestamp: message.timestamp,
    }))
    .slice(0, maxItems);

  return {
    poDocuments,
    buyerConfirmations,
  };
}

export function getApprovalTargets(
  enquiryState: EnquiryStateStore,
  enquiryId: string
): {
  primaryCM?: Member;
  cxMembers: Member[];
} {
  return {
    primaryCM: selectPrimaryCM(enquiryState, enquiryId),
    cxMembers: selectMembersByRole(enquiryState, enquiryId, "CX"),
  };
}
