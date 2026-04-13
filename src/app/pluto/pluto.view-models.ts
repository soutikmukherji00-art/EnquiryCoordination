import { formatDistanceStrict } from "date-fns";
import type { EnquiryStateStore } from "@/domain/enquiry/enquiry.reducer";
import { filterEnquiriesByPersona } from "@/domain/enquiry/enquiry.filters";
import type { Enquiry, Persona } from "@/domain/enquiry/enquiry.types";
import type { GroupChannel } from "@/domain/message/group.types";
import {
  selectMembers,
  selectMembersByRole,
  selectPrimaryCM,
} from "@/domain/enquiry/enquiry.selectors";
import { resolveEnquiryRecord } from "@/domain/enquiry/enquiry.record";
import {
  buildPlutoDetailFieldsFromRecord,
  computeEnquiryThreadAggregate,
  resolveCreationSourceBadge,
} from "@/domain/enquiry/enquiry.record-selectors";
import { formatCategories } from "@/domain/category/category.types";
import { getPersonaById } from "@/domain/persona/persona.data";
import type {
  PlutoDetailHeaderViewModel,
  PlutoKpiCardViewModel,
  PlutoListItemViewModel,
  PlutoStateTone,
} from "./pluto.types";

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
    const assignedCMName = resolveAssignedCMName(enquiryState, enquiry.id);
    const categoriesLabel = formatCategories(enquiry.categories || []);
    const ageLabel = (enquiry.createdAt instanceof Date)
      ? formatDistanceStrict(enquiry.createdAt, now)
      : "Recently";
    const lastActivityLabel = (enquiry.lastActivity instanceof Date)
      ? formatDistanceStrict(enquiry.lastActivity, now, { addSuffix: true })
      : "Recently";
    const record = resolveEnquiryRecord(enquiryState.records, enquiry.id);
    const sourceBadge = resolveCreationSourceBadge(record?.creationSource);
    const aggregate = computeEnquiryThreadAggregate(
      enquiry.id,
      allGroupChannels,
      currentPersonaId,
    );

    return {
      id: enquiry.id,
      buyerName: enquiry.buyerName || "Unassigned buyer",
      status: enquiry.state,
      stateTone: resolveStateTone(enquiry.state),
      ageLabel,
      lastActivityLabel,
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
  const recordFields = buildPlutoDetailFieldsFromRecord(record);

  return {
    id: enquiry.id,
    buyerName: enquiry.buyerName || "Unassigned buyer",
    status: enquiry.state,
    stateTone: resolveStateTone(enquiry.state),
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
  const inFlight = items.filter(
    (item) => item.status !== "Converted to Order",
  ).length;
  const pendingApproval = items.filter(
    (item) => item.status === "Pending Approval",
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
      value: String(inFlight),
      tone: "neutral",
    },
    {
      id: "approval",
      label: "Pending Approval",
      value: String(pendingApproval),
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
    case "Pending Approval":
      return "warning";
    case "Pending Response":
      return "accent";
    default:
      return "neutral";
  }
}

function formatValue(value?: number): string {
  if (!value) {
    return "Value pending";
  }

  return `₹${value.toLocaleString("en-IN")}`;
}
