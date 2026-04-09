import type { Member } from "./enquiry.types";
import { selectMembersByRole, selectPrimaryCM } from "./enquiry.selectors";
import type { EnquiryStateStore } from "./enquiry.reducer";
import type { Message } from "@/domain/message/message.types";
import type { MessageDomainState } from "@/domain/message/message.reducer";

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
  const groupMessages = messageState.groupChannels
    .filter((group) => group.enquiryId === enquiryId)
    .flatMap((group) => [
      ...group.messages,
      ...(group.threads || []).flatMap((thread) =>
        collectThreadMessages(thread.messages, thread.rootMessage)
      ),
    ]);
  const threadMessages = messageState.threads
    .filter((thread) => thread.enquiryId === enquiryId)
    .flatMap((thread) => collectThreadMessages(thread.messages, thread.rootMessage));

  return [
    ...regularMessages,
    ...sellerChannelMessages,
    ...sellerDMMessages,
    ...groupMessages,
    ...threadMessages,
  ];
}

export function hasPOTaggedAttachment(messages: Message[]): boolean {
  return messages.some((message) => message.attachment?.markAsPO === true);
}

export function enquiryHasPOTaggedAttachment(
  messageState: MessageDomainState,
  enquiryId: string
): boolean {
  return hasPOTaggedAttachment(collectEnquiryMessages(messageState, enquiryId));
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
