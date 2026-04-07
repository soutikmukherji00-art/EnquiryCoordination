/**
 * Debugging utilities for enquiry operations
 * Helps diagnose issues with enquiry creation, state transitions, and data integrity
 */

import type { Enquiry } from "./enquiry.types";
import type { GroupChannel, Thread } from "@/domain/message/group.types";
import type { MessageEvent } from "@/domain/message/message.events";

export interface EnquiryDebugInfo {
  enquiryId: string;
  exists: boolean;
  state?: string;
  buyerName?: string;
  buyerPersonaId?: string;
  memberCount?: number;
  createdBy?: string;
  createdAt?: Date;
  issues: string[];
}

export interface ThreadDebugInfo {
  threadId: string;
  exists: boolean;
  groupId?: string;
  groupName?: string;
  title?: string;
  enquiryId?: string;
  messageCount?: number;
  isTagged: boolean;
  issues: string[];
}

/**
 * Validate enquiry data integrity
 */
export function validateEnquiry(enquiry: Enquiry | undefined): EnquiryDebugInfo {
  if (!enquiry) {
    return {
      enquiryId: "unknown",
      exists: false,
      issues: ["Enquiry does not exist"],
    };
  }

  const issues: string[] = [];

  // Check required fields
  if (!enquiry.id || !enquiry.id.match(/^ENQ-\d+$/)) {
    issues.push(`Invalid enquiry ID format: ${enquiry.id}`);
  }

  if (!enquiry.buyerName || enquiry.buyerName === "Unknown Buyer") {
    issues.push("Buyer name is missing or unknown");
  }

  if (!enquiry.state) {
    issues.push("Enquiry state is missing");
  }

  if (!enquiry.createdBy) {
    issues.push("Creator persona ID is missing");
  }

  if (!enquiry.members || enquiry.members.length === 0) {
    issues.push("No team members assigned");
  }

  return {
    enquiryId: enquiry.id,
    exists: true,
    state: enquiry.state,
    buyerName: enquiry.buyerName,
    buyerPersonaId: enquiry.buyerPersonaId,
    memberCount: enquiry.members?.length || 0,
    createdBy: enquiry.createdBy,
    createdAt: enquiry.createdAt,
    issues,
  };
}

/**
 * Validate thread data integrity
 */
export function validateThread(
  threadId: string,
  groups: GroupChannel[]
): ThreadDebugInfo {
  let foundThread: Thread | undefined;
  let foundGroup: GroupChannel | undefined;

  for (const group of groups) {
    const thread = (group.threads || []).find(t => t.id === threadId);
    if (thread) {
      foundThread = thread;
      foundGroup = group;
      break;
    }
  }

  if (!foundThread || !foundGroup) {
    return {
      threadId,
      exists: false,
      isTagged: false,
      issues: ["Thread does not exist in any group"],
    };
  }

  const issues: string[] = [];

  if (!foundThread.title) {
    issues.push("Thread title is missing");
  }

  if (!foundThread.creatorId) {
    issues.push("Thread creator ID is missing");
  }

  if (foundThread.messageCount === 0) {
    issues.push("Thread has no messages");
  }

  return {
    threadId,
    exists: true,
    groupId: foundGroup.id,
    groupName: foundGroup.name,
    title: foundThread.title,
    enquiryId: foundThread.enquiryId,
    messageCount: foundThread.messageCount,
    isTagged: !!foundThread.enquiryId,
    issues,
  };
}

/**
 * Debug enquiry creation from thread
 */
export interface CreateEnquiryDebugResult {
  success: boolean;
  timestamp: Date;
  input: {
    threadId: string;
    buyerId: string;
    creatorPersonaId: string;
  };
  threadValidation: ThreadDebugInfo;
  enquiryValidation?: EnquiryDebugInfo;
  events?: Array<{ type: string; enquiryId?: string; threadId?: string }>;
  errors: string[];
}

/**
 * Debug helper for enquiry creation
 */
export function debugCreateEnquiryFromThread(
  threadId: string,
  buyerId: string,
  creatorPersonaId: string,
  groups: GroupChannel[],
  createdEnquiry?: Enquiry,
  events?: Array<MessageEvent | any>
): CreateEnquiryDebugResult {
  const errors: string[] = [];
  
  // Validate thread
  const threadValidation = validateThread(threadId, groups);
  if (!threadValidation.exists) {
    errors.push("Thread validation failed: " + threadValidation.issues.join(", "));
  }
  if (threadValidation.isTagged) {
    errors.push(`Thread is already tagged to enquiry: ${threadValidation.enquiryId}`);
  }

  // Validate created enquiry
  let enquiryValidation: EnquiryDebugInfo | undefined;
  if (createdEnquiry) {
    enquiryValidation = validateEnquiry(createdEnquiry);
    if (enquiryValidation.issues.length > 0) {
      errors.push("Enquiry validation failed: " + enquiryValidation.issues.join(", "));
    }
  }

  // Validate events
  const eventSummary = events?.map(e => ({
    type: e.type,
    enquiryId: e.payload?.enquiryId,
    threadId: e.payload?.threadId,
  }));

  if (events && events.length === 0) {
    errors.push("No events were generated");
  }

  return {
    success: errors.length === 0,
    timestamp: new Date(),
    input: {
      threadId,
      buyerId,
      creatorPersonaId,
    },
    threadValidation,
    enquiryValidation,
    events: eventSummary,
    errors,
  };
}

/**
 * Console logger for debug info (development only)
 */
export function logEnquiryDebug(debugInfo: CreateEnquiryDebugResult): void {
  if (process.env.NODE_ENV !== "development") return;

  console.group("🔍 Enquiry Creation Debug");
  console.log("Timestamp:", debugInfo.timestamp.toISOString());
  console.log("Success:", debugInfo.success);
  
  console.group("Input Parameters");
  console.log(debugInfo.input);
  console.groupEnd();

  console.group("Thread Validation");
  console.log("Exists:", debugInfo.threadValidation.exists);
  console.log("Is Tagged:", debugInfo.threadValidation.isTagged);
  if (debugInfo.threadValidation.issues.length > 0) {
    console.warn("Issues:", debugInfo.threadValidation.issues);
  }
  console.log(debugInfo.threadValidation);
  console.groupEnd();

  if (debugInfo.enquiryValidation) {
    console.group("Enquiry Validation");
    console.log("Exists:", debugInfo.enquiryValidation.exists);
    if (debugInfo.enquiryValidation.issues.length > 0) {
      console.warn("Issues:", debugInfo.enquiryValidation.issues);
    }
    console.log(debugInfo.enquiryValidation);
    console.groupEnd();
  }

  if (debugInfo.events) {
    console.group("Events Generated");
    console.table(debugInfo.events);
    console.groupEnd();
  }

  if (debugInfo.errors.length > 0) {
    console.group("❌ Errors");
    debugInfo.errors.forEach(err => console.error(err));
    console.groupEnd();
  }

  console.groupEnd();
}
