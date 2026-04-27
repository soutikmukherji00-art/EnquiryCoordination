import { formatDistanceStrict } from "date-fns";
import type { EnquiryStateStore } from "@/domain/enquiry/enquiry.reducer";
import { filterEnquiriesByPersona } from "@/domain/enquiry/enquiry.filters";
import type { Enquiry, Persona } from "@/domain/enquiry/enquiry.types";
import type { GroupChannel } from "@/domain/message/group.types";
import type { Message } from "@/domain/message/message.types";
import {
  selectMembers,
  selectMembersByRole,
  selectPrimaryCM,
} from "@/domain/enquiry/enquiry.selectors";
import { resolveEnquiryRecord } from "@/domain/enquiry/enquiry.record";
import { normalizeEnquiryState } from "@/domain/enquiry/enquiry.state-machine";
import {
  buildEnquiryDetailFieldsFromRecord,
  computeEnquiryThreadAggregate,
  resolveRecordOriginBadge,
} from "@/domain/enquiry/enquiry.record-selectors";
import { formatCategories } from "@/domain/category/category.types";
import { getPersonaById } from "@/domain/persona/persona.data";
import { getContactsForBuyer } from "@/domain/buyer/buyer.mock-data";
import type { PlutoPage, WorkspaceMode } from "@/app/workspace.types";
import type {
  PlutoDetailHeaderViewModel,
  PlutoKpiCardViewModel,
  PlutoListItemViewModel,
  PlutoStateTone,
} from "./pluto.types";

/**
 * Resolves which enquiry id backs structured data and Pluto chat (Pluto chat follows pluto selection, not a stale thread tag).
 */
export function resolveMergedPanelEnquiryId(input: {
  workspaceMode: WorkspaceMode;
  plutoPage: PlutoPage;
  plutoSelectedEnquiryId: string | null;
  threadEnquiryId: string | null | undefined;
  selectedEnquiryId: string | null;
}): string | null {
  if (
    input.workspaceMode === "pluto" &&
    input.plutoPage === "enquiry-chat" &&
    input.plutoSelectedEnquiryId
  ) {
    return input.plutoSelectedEnquiryId;
  }
  return input.threadEnquiryId ?? input.selectedEnquiryId ?? null;
}

interface PlutoThreadRecoverySeedInput {
  enquiryId: string;
  allGroupChannels: GroupChannel[];
  messagesByChannel?: Record<string, Message[]> | null;
}

interface PlutoThreadRecoverySeed {
  group: GroupChannel;
  rootMessage: Message;
}

/**
 * Recover a thread seed for Pluto when synced data contains enquiry messages
 * but the tagged thread object has not been created yet.
 */
export function resolvePlutoThreadRecoverySeed({
  enquiryId,
  allGroupChannels,
  messagesByChannel,
}: PlutoThreadRecoverySeedInput): PlutoThreadRecoverySeed | null {
  const messageIds = new Set(
    Object.values(messagesByChannel ?? {})
      .flat()
      .map((message) => message.id),
  );

  const candidateGroups = allGroupChannels
    .map((group) => {
      const matchingMessages = group.messages.filter((message) =>
        messageIds.has(message.id) || message.content.includes(enquiryId),
      );
      if (matchingMessages.length === 0) {
        return null;
      }

      const unthreaded = matchingMessages.filter((message) => !message.threadId);
      const preferredPool = unthreaded.length > 0 ? unthreaded : matchingMessages;
      const preferredMessage = [...preferredPool].sort(
        (left, right) => left.timestamp.getTime() - right.timestamp.getTime(),
      )[0];

      return {
        group,
        rootMessage: preferredMessage,
        exactIdMatches: matchingMessages.filter((message) => messageIds.has(message.id)).length,
        contentMatches: matchingMessages.filter((message) => message.content.includes(enquiryId)).length,
        firstTimestamp: preferredMessage.timestamp.getTime(),
      };
    })
    .filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null);

  if (candidateGroups.length === 0) {
    return null;
  }

  candidateGroups.sort((left, right) => {
    if (right.exactIdMatches !== left.exactIdMatches) {
      return right.exactIdMatches - left.exactIdMatches;
    }
    if (right.contentMatches !== left.contentMatches) {
      return right.contentMatches - left.contentMatches;
    }
    return left.firstTimestamp - right.firstTimestamp;
  });

  return {
    group: candidateGroups[0].group,
    rootMessage: candidateGroups[0].rootMessage,
  };
}

interface PlutoSelectorOptions {
  enquiries: Enquiry[];
  currentPersona: Persona;
}

interface PlutoListViewModelOptions {
  enquiries: Enquiry[];
  enquiryState: EnquiryStateStore;
  allGroupChannels: GroupChannel[];
  currentPersonaId: string;
  now?: Date;
}

interface PlutoDetailHeaderOptions {
  enquiryId: string;
  enquiryState: EnquiryStateStore;
  now?: Date;
}

const BUYER_PLACEHOLDER_NAMES = new Set(["unknown buyer", "unassigned buyer", "—", "-"]);

function normalizeBuyerDisplayName(name?: string | null): string {
  const trimmedName = (name ?? "").trim();
  if (!trimmedName) {
    return "—";
  }

  const normalizedName = trimmedName.toLowerCase();
  if (BUYER_PLACEHOLDER_NAMES.has(normalizedName)) {
    return "—";
  }

  return trimmedName;
}

export function hasMissingBuyerIdentity(
  enquiry: Enquiry,
  record: ReturnType<typeof resolveEnquiryRecord> | null | undefined,
): boolean {
  const recordBuyerId = record?.buyer?.id?.trim();
  const recordBuyerPersonaId = record?.buyer?.personaId?.trim();
  const enquiryBuyerPersonaId = enquiry.buyerPersonaId?.trim();
  const buyerName = normalizeBuyerDisplayName(enquiry.buyerName || record?.buyer?.name).toLowerCase();

  if (recordBuyerId || recordBuyerPersonaId || enquiryBuyerPersonaId) {
    return false;
  }

  return !buyerName || BUYER_PLACEHOLDER_NAMES.has(buyerName);
}

/** Compact recency for list cards: hours (under 24) or whole days — avoids month/week phrasing. */
export function formatListActivityRecency(
  lastActivity: Date | undefined,
  createdAt: Date | undefined,
  now: Date,
): string {
  const anchorMs = (d: Date | undefined) =>
    d instanceof Date && !Number.isNaN(d.getTime()) ? d.getTime() : null;

  const t = anchorMs(lastActivity) ?? anchorMs(createdAt);
  if (t === null) return "Recently";

  const diffMs = now.getTime() - t;
  if (diffMs <= 0) return "Just now";

  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 1) return "Under 1 hour";

  if (diffHours < 24) {
    const h = Math.max(1, Math.round(diffHours));
    return `${h} ${h === 1 ? "hour" : "hours"}`;
  }

  const d = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  return `${d} ${d === 1 ? "day" : "days"}`;
}

export function selectPlutoAccessibleEnquiries({
  enquiries,
  currentPersona,
}: PlutoSelectorOptions): Enquiry[] {
  return filterEnquiriesByPersona(enquiries, currentPersona).sort(
    (left, right) => {
      const leftTime = left.lastActivity instanceof Date ? left.lastActivity.getTime() : 0;
      const rightTime = right.lastActivity instanceof Date ? right.lastActivity.getTime() : 0;
      return rightTime - leftTime;
    },
  );
}

export function buildPlutoListItemViewModels({
  enquiries,
  enquiryState,
  allGroupChannels,
  currentPersonaId,
  now = new Date(),
}: PlutoListViewModelOptions): PlutoListItemViewModel[] {
  return enquiries.map((enquiry) => {
    const normalizedState = normalizeEnquiryState(enquiry.state);
    const assignedCMName = resolveAssignedCMName(enquiryState, enquiry.id);
    const categoriesLabel = formatCategories(enquiry.categories || []);
    const ageLabel = formatListActivityRecency(
      enquiry.lastActivity,
      enquiry.createdAt,
      now,
    );
    const lastActivityLabel = (enquiry.lastActivity instanceof Date)
      ? formatDistanceStrict(enquiry.lastActivity, now, { addSuffix: true })
      : "Recently";
    const record = resolveEnquiryRecord(enquiryState.records, enquiry.id);
    const buyerContactDetails = resolveBuyerContactDetails(record);
    const assignedBdmPersonaId = record?.assignment?.bdmPersonaId ?? enquiry.bdmPersonaId;
    const sourceBadge = resolveRecordOriginBadge(record?.origin);
    const missingBuyerIdentity = hasMissingBuyerIdentity(enquiry, record);
    const hasAssignedBdm = Boolean(assignedBdmPersonaId);
    const displayStatus = resolveDisplayStatus(normalizedState, hasAssignedBdm, missingBuyerIdentity);
    const aggregate = computeEnquiryThreadAggregate(
      enquiry.id,
      allGroupChannels,
      currentPersonaId,
    );

    return {
      id: enquiry.id,
      buyerName: normalizeBuyerDisplayName(enquiry.buyerName || record?.buyer?.name),
      hasMissingBuyerIdentity: missingBuyerIdentity,
      buyerEmails: buyerContactDetails.emails,
      buyerPhones: buyerContactDetails.phones,
      hasAssignedBdm,
      status: displayStatus,
      stateTone: resolveStateTone(displayStatus),
      ageLabel,
      lastActivityLabel,
      lastActivityTime: enquiry.lastActivity instanceof Date ? enquiry.lastActivity.getTime() : 0,
      createdAtTime: enquiry.createdAt instanceof Date ? enquiry.createdAt.getTime() : 0,
      assignedCMName,
      valueLabel: formatValue(enquiry.estimatedValue),
      categoriesLabel,
      regionLabel: enquiry.region || "—",
      isNew: Boolean(record?.isNew),
      sourceBadge,
      unreadCount: aggregate.unreadCount,
      mentionCount: aggregate.mentionCount,
    };
  });
}

function resolveBuyerContactDetails(
  record: ReturnType<typeof resolveEnquiryRecord> | null | undefined,
): { emails: string[]; phones: string[] } {
  const contactEmails = new Set<string>();
  const contactPhones = new Set<string>();

  const buyerId = record?.buyer?.id;
  if (buyerId) {
    const contacts = getContactsForBuyer(buyerId);
    for (const contact of contacts) {
      const normalizedEmail = normalizeEmail(contact.email);
      if (normalizedEmail) {
        contactEmails.add(normalizedEmail);
      }
      const normalizedPhone = normalizePhone(contact.phone);
      if (normalizedPhone) {
        contactPhones.add(normalizedPhone);
      }
    }
  }

  const senderFields = [
    record?.sourceCorrespondence?.from,
    ...(record?.sourceCorrespondences?.map((correspondence) => correspondence.from) ?? []),
  ];
  for (const senderField of senderFields) {
    const extracted = extractContactDetailsFromSender(senderField);
    extracted.emails.forEach((email) => contactEmails.add(email));
    extracted.phones.forEach((phone) => contactPhones.add(phone));
  }

  return {
    emails: [...contactEmails],
    phones: [...contactPhones],
  };
}

function extractContactDetailsFromSender(
  senderField: string | undefined,
): { emails: string[]; phones: string[] } {
  if (!senderField) {
    return { emails: [], phones: [] };
  }

  const emails = new Set<string>();
  const phones = new Set<string>();

  const emailMatches = senderField.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  for (const email of emailMatches) {
    const normalizedEmail = normalizeEmail(email);
    if (normalizedEmail) {
      emails.add(normalizedEmail);
    }
  }

  const phoneMatches = senderField.match(/\+?\d[\d\s()-]{7,}\d/g) ?? [];
  for (const phone of phoneMatches) {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) {
      phones.add(normalizedPhone);
    }
  }

  return {
    emails: [...emails],
    phones: [...phones],
  };
}

function normalizeEmail(value: string | undefined): string | null {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  return normalized;
}

function normalizePhone(value: string | undefined): string | null {
  const normalized = value?.replace(/\D/g, "");
  if (!normalized) {
    return null;
  }
  return normalized;
}

export function buildPlutoDetailHeaderViewModel({
  enquiryId,
  enquiryState,
  now = new Date(),
}: PlutoDetailHeaderOptions): PlutoDetailHeaderViewModel | null {
  const enquiry = enquiryState.enquiries[enquiryId];
  if (!enquiry) {
    return null;
  }

  const record = resolveEnquiryRecord(enquiryState.records, enquiryId);
  const recordFields = buildEnquiryDetailFieldsFromRecord(record);
  const missingBuyerIdentity = hasMissingBuyerIdentity(enquiry, record);
  const hasAssignedBdm = Boolean(record?.assignment?.bdmPersonaId ?? enquiry.bdmPersonaId);
  const displayStatus = resolveDisplayStatus(
    normalizeEnquiryState(enquiry.state),
    hasAssignedBdm,
    missingBuyerIdentity,
  );

  return {
    id: enquiry.id,
    buyerName: normalizeBuyerDisplayName(enquiry.buyerName || record?.buyer?.name),
    hasMissingBuyerIdentity: missingBuyerIdentity,
    status: displayStatus,
    stateTone: resolveStateTone(displayStatus),
    assignedCMName: recordFields.assignedCMName || resolveAssignedCMName(enquiryState, enquiry.id),
    valueLabel: formatValue(enquiry.estimatedValue),
    categoriesLabel: formatCategories(enquiry.categories || []),
    createdAtLabel: (enquiry.createdAt instanceof Date)
      ? formatDistanceStrict(enquiry.createdAt, now, { addSuffix: true })
      : "Recently",
    lastActivityLabel: (enquiry.lastActivity instanceof Date)
      ? formatDistanceStrict(enquiry.lastActivity, now, { addSuffix: true })
      : "Recently",
    ...recordFields,
  };
}

export function buildPlutoKpiCards(
  items: PlutoListItemViewModel[],
): PlutoKpiCardViewModel[] {
  const total = items.length;
  const awaitingResponse = items.filter(
    (item) => item.status === "Awaiting Response",
  ).length;
  const cmResponded = items.filter(
    (item) => item.status === "CM Responded",
  ).length;
  const pendingResponse = items.filter(
    (item) => item.status === "RM Approved",
  ).length;
  const converted = items.filter(
    (item) => item.status === "Converted to Order",
  ).length;

  return [
    {
      id: "total",
      label: "Total",
      value: String(total),
      tone: "accent",
    },
    {
      id: "in-flight",
      label: "Awaiting Response",
      value: String(awaitingResponse),
      tone: "neutral",
    },
    {
      id: "cm-responded",
      label: "CM Responded",
      value: String(cmResponded),
      tone: "warning",
    },
    {
      id: "pending-response",
      label: "RM Approved",
      value: String(pendingResponse),
      tone: "warning",
    },
    {
      id: "converted",
      label: "Converted",
      value: String(converted),
      tone: "success",
    },
  ];
}

export function filterPlutoListItemViewModels(
  items: PlutoListItemViewModel[],
  query: string,
): PlutoListItemViewModel[] {
  if (!query.trim()) {
    return items;
  }

  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) =>
    [
      item.id,
      item.buyerName,
      item.status,
      item.assignedCMName,
      item.categoriesLabel,
      item.regionLabel,
      item.buyerEmails.join(" "),
      item.buyerPhones.join(" "),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery),
  );
}

function resolveAssignedCMName(
  enquiryState: EnquiryStateStore,
  enquiryId: string,
): string {
  const primaryCM = selectPrimaryCM(enquiryState, enquiryId);
  if (primaryCM) {
    return getPersonaById(primaryCM.personaId)?.displayName || "Assigned CM";
  }

  const cmMembers = selectMembersByRole(enquiryState, enquiryId, "CM");
  if (cmMembers.length > 0) {
    return (
      getPersonaById(cmMembers[0].personaId)?.displayName || "Assigned CM"
    );
  }

  const fallbackMember = selectMembers(enquiryState, enquiryId).find(
    (member) => member.role === "CM",
  );
  if (fallbackMember) {
    return (
      getPersonaById(fallbackMember.personaId)?.displayName || "Assigned CM"
    );
  }

  return "Unassigned CM";
}

function resolveStateTone(state: string): PlutoStateTone {
  switch (state) {
    case "Converted to Order":
      return "success";
    case "CM Responded":
    case "RM Approved":
      return "warning";
    case "Awaiting Response":
      return "accent";
    default:
      return "neutral";
  }
}

function resolveDisplayStatus(
  normalizedState: string,
  hasAssignedBdm: boolean,
  hasMissingBuyerIdentity: boolean,
): string {
  if (!hasAssignedBdm || hasMissingBuyerIdentity) {
    return "Draft Request";
  }
  if (normalizedState === "Unassigned") {
    return "Draft Request";
  }
  return normalizedState;
}

function formatValue(value?: number): string {
  if (!value) {
    return "Value pending";
  }

  return `₹${value.toLocaleString("en-IN")}`;
}
