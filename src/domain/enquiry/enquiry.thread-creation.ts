/**
 * Domain service for creating enquiries from existing threads
 * Handles the business logic of tagging an existing thread to a newly created enquiry
 */

import type { Enquiry } from "./enquiry.types";
import type { GroupChannel, Thread } from "@/domain/message/group.types";
import type { MessageEvent } from "@/domain/message/message.events";
import { createEnquiryCreatedEvent } from "./enquiry.events";
import { autoAssignTeamMembers } from "./enquiry.member-assignment";
import { getBuyerById } from "@/domain/buyer/buyer.mock-data";
import { getBuyerPersonaFromBuyerId } from "@/domain/buyer/buyer-persona-mapping";
import { createGroupTaggedEvent } from "@/domain/message/message.events";
import { EnquiryIntake } from "./enquiry.intake";

/**
 * Generate the next sequential enquiry ID
 */
export function generateNextEnquiryId(existingEnquiries: Enquiry[]): string {
  const existingNums = existingEnquiries
    .map(e => {
      const match = e.id.match(/^ENQ-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => n > 0);
  const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 2401;
  return `ENQ-${nextNum}`;
}

/**
 * Find a thread and its parent group
 */
export function findThreadInGroups(
  threadId: string,
  groups: GroupChannel[]
): { thread: Thread; groupId: string; group: GroupChannel } | null {
  for (const group of groups) {
    const thread = (group.threads || []).find(t => t.id === threadId);
    if (thread) {
      return { thread, groupId: group.id, group };
    }
  }
  return null;
}

/**
 * Resolve buyer information from buyer ID
 */
export function resolveBuyerInfo(buyerId: string): {
  buyerName: string;
  buyerPersonaId: string | undefined;
} {
  const buyer = getBuyerById(buyerId);
  const buyerPersonaId = getBuyerPersonaFromBuyerId(buyerId);
  const buyerName = buyer?.name || "Unknown Buyer";
  
  return { buyerName, buyerPersonaId };
}

/**
 * Create an enquiry entity from a thread
 * Returns the events to dispatch
 */
export interface CreateEnquiryFromThreadParams {
  threadId: string;
  buyerId: string;
  existingEnquiries: Enquiry[];
  allGroupChannels: GroupChannel[];
  creatorPersonaId: string;
}

export interface CreateEnquiryFromThreadResult {
  success: boolean;
  error?: string;
  enquiryId?: string;
  groupId?: string;
  events?: Array<ReturnType<typeof createEnquiryCreatedEvent> | MessageEvent>;
}

/**
 * Main business logic for creating an enquiry from an existing thread
 */
export function createEnquiryFromThread(
  params: CreateEnquiryFromThreadParams
): CreateEnquiryFromThreadResult {
  const { threadId, buyerId, existingEnquiries, allGroupChannels, creatorPersonaId } = params;

  // 1. Validate thread exists
  const threadInfo = findThreadInGroups(threadId, allGroupChannels);
  if (!threadInfo) {
    return {
      success: false,
      error: "Thread not found",
    };
  }

  // 2. Check if thread is already tagged
  if (threadInfo.thread.enquiryId) {
    return {
      success: false,
      error: "Thread is already tagged to an enquiry",
    };
  }

  // 3. Generate new enquiry ID
  const newEnquiryId = generateNextEnquiryId(existingEnquiries);

  // 4. Resolve buyer information
  const { buyerName, buyerPersonaId } = resolveBuyerInfo(buyerId);

  // 4.5. Create unified intake model
  const intake: EnquiryIntake = {
    buyer: {
      personaId: buyerPersonaId,
      buyerId: buyerId,
      manualName: buyerName,
    },
    requirements: {
      categories: [], // Inherited from context or extracted
      notes: "Created from thread",
    },
    source: {
      medium: "thread",
      threadId,
    },
  };

  // 5. Create enquiry creation event
  const enquiryEvent = createEnquiryCreatedEvent(
    newEnquiryId,
    creatorPersonaId,
    intake.requirements.deliveryLocation,
    buyerName,
    intake.buyer.personaId,
  );

  // 6. Create thread tagging event
  const tagEvent: MessageEvent = {
    type: "THREAD_TAGGED",
    payload: {
      threadId,
      enquiryId: newEnquiryId,
      timestamp: new Date(),
    },
  };

  // 7. Auto-assign team members
  const assignmentResult = autoAssignTeamMembers(newEnquiryId, creatorPersonaId);

  // 8. Return all events to dispatch
  const tagGroupEvent =
    threadInfo.group.type === "custom"
      ? createGroupTaggedEvent(threadInfo.groupId, newEnquiryId, creatorPersonaId)
      : null;

  return {
    success: true,
    enquiryId: newEnquiryId,
    groupId: threadInfo.groupId,
    events: [
      enquiryEvent,
      tagEvent,
      ...(tagGroupEvent ? [tagGroupEvent] : []),
      ...assignmentResult.events,
    ],
  };
}

/**
 * Navigation state updates after creating enquiry from thread
 */
export interface NavigationStateUpdate {
  selectedEnquiryId: string;
  selectedThreadId: string;
  selectedGroupId: string;
  selectedBuyerDMId: null;
  selectedSellerDMId: null;
  threadViewMode: "main";
  threadPanelOpen: true;
  currentChannel: "internal";
}

/**
 * Get the navigation state updates after creating an enquiry from thread
 */
export function getNavigationStateAfterCreation(
  enquiryId: string,
  threadId: string,
  groupId: string
): NavigationStateUpdate {
  return {
    selectedEnquiryId: enquiryId,
    selectedThreadId: threadId,
    selectedGroupId: groupId,
    selectedBuyerDMId: null,
    selectedSellerDMId: null,
    threadViewMode: "main",
    threadPanelOpen: true,
    currentChannel: "internal",
  };
}
