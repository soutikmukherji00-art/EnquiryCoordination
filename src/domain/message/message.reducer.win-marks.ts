/**
 * Apply PO / buyer-confirmation flags to a message anywhere in domain state.
 */

import type { Message } from "./message.types";
import type { MessageDomainState } from "./message.reducer";
import type { Thread } from "./thread.types";
import type { GroupChannel } from "./group.types";

export interface MessageWinMarksPayload {
  messageId: string;
  /** When set, updates attachment.markAsPO if attachment exists (no-op if true and no attachment). */
  markAsPO?: boolean;
  /** When set, updates or clears markAsBuyerConfirmation. */
  buyerConfirmation?: boolean;
  timestamp: Date;
}

function applyWinMarksToMessage(
  msg: Message,
  markAsPO: boolean | undefined,
  buyerConfirmation: boolean | undefined,
): Message {
  let next: Message = { ...msg };

  if (markAsPO !== undefined && next.attachment) {
    next = {
      ...next,
      attachment: { ...next.attachment, markAsPO },
    };
  }

  if (buyerConfirmation !== undefined) {
    if (buyerConfirmation) {
      next = { ...next, markAsBuyerConfirmation: true };
    } else {
      const { markAsBuyerConfirmation: _omit, ...rest } = next;
      next = rest as Message;
    }
  }

  return next;
}

function patchMessageList(messages: Message[], messageId: string, payload: MessageWinMarksPayload): Message[] {
  let changed = false;
  const next = messages.map((m) => {
    if (m.id !== messageId) return m;
    changed = true;
    return applyWinMarksToMessage(m, payload.markAsPO, payload.buyerConfirmation);
  });
  return changed ? next : messages;
}

function patchThread(thread: Thread, messageId: string, payload: MessageWinMarksPayload): Thread | null {
  let changed = false;
  let nextRoot = thread.rootMessage;
  if (thread.rootMessage?.id === messageId) {
    nextRoot = applyWinMarksToMessage(thread.rootMessage, payload.markAsPO, payload.buyerConfirmation);
    changed = true;
  }
  const nextMessages = patchMessageList(thread.messages, messageId, payload);
  if (nextMessages !== thread.messages) changed = true;
  if (!changed) return null;
  return {
    ...thread,
    rootMessage: nextRoot,
    messages: nextMessages,
  };
}

function patchGroupChannel(group: GroupChannel, messageId: string, payload: MessageWinMarksPayload): GroupChannel | null {
  const nextMain = patchMessageList(group.messages, messageId, payload);
  let gChanged = nextMain !== group.messages;
  const threads = group.threads || [];
  const nextThreads = threads.map((t) => {
    const patched = patchThread(t, messageId, payload);
    if (patched) {
      gChanged = true;
      return patched;
    }
    return t;
  });
  if (!gChanged) return null;
  return {
    ...group,
    messages: nextMain,
    threads: nextThreads,
  };
}

export function applyMessageWinMarksUpdate(
  state: MessageDomainState,
  payload: MessageWinMarksPayload,
): MessageDomainState {
  const { messageId } = payload;
  let next: MessageDomainState = state;

  const nextMessagesRoot = { ...state.messages };
  let messagesChanged = false;
  for (const enquiryId of Object.keys(state.messages)) {
    const channels = state.messages[enquiryId];
    const nextChannels = { ...channels };
    let enquiryChanged = false;
    for (const channelId of Object.keys(channels)) {
      const list = channels[channelId];
      const patched = patchMessageList(list, messageId, payload);
      if (patched !== list) {
        nextChannels[channelId] = patched;
        enquiryChanged = true;
      }
    }
    if (enquiryChanged) {
      messagesChanged = true;
      nextMessagesRoot[enquiryId] = nextChannels;
    }
  }
  if (messagesChanged) {
    next = { ...next, messages: nextMessagesRoot };
  }

  const sellerCh = next.sellerChannels;
  const nextSeller = { ...sellerCh };
  let sellerChanged = false;
  for (const enquiryId of Object.keys(sellerCh)) {
    const channels = sellerCh[enquiryId];
    let rowChanged = false;
    const nextRow = channels.map((ch) => {
      const patched = patchMessageList(ch.messages, messageId, payload);
      if (patched !== ch.messages) {
        rowChanged = true;
        return { ...ch, messages: patched };
      }
      return ch;
    });
    if (rowChanged) {
      sellerChanged = true;
      nextSeller[enquiryId] = nextRow;
    }
  }
  if (sellerChanged) {
    next = { ...next, sellerChannels: nextSeller };
  }

  const nextBuyer = next.buyerDMChannels.map((ch) => {
    const patched = patchMessageList(ch.messages, messageId, payload);
    if (patched !== ch.messages) {
      return { ...ch, messages: patched, lastActivity: payload.timestamp };
    }
    return ch;
  });
  if (nextBuyer !== next.buyerDMChannels) {
    next = { ...next, buyerDMChannels: nextBuyer };
  }

  const nextSellerDm = next.sellerDMChannels.map((ch) => {
    const patched = patchMessageList(ch.messages, messageId, payload);
    if (patched !== ch.messages) {
      return { ...ch, messages: patched };
    }
    return ch;
  });
  if (nextSellerDm !== next.sellerDMChannels) {
    next = { ...next, sellerDMChannels: nextSellerDm };
  }

  const nextGroups = next.groupChannels.map((g) => {
    const patched = patchGroupChannel(g, messageId, payload);
    return patched ?? g;
  });
  if (nextGroups !== next.groupChannels) {
    next = { ...next, groupChannels: nextGroups };
  }

  const nextThreads = next.threads.map((t) => {
    const patched = patchThread(t, messageId, payload);
    return patched ?? t;
  });
  if (nextThreads !== next.threads) {
    next = { ...next, threads: nextThreads };
  }

  return next;
}
