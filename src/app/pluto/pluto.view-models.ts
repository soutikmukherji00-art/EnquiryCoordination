import { formatDistanceStrict } from "date-fns";
import type { EnquiryStateStore } from "@/domain/enquiry/enquiry.reducer";
import { filterEnquiriesByPersona } from "@/domain/enquiry/enquiry.filters";
import type { Enquiry, Persona } from "@/domain/enquiry/enquiry.types";
import {
  selectMembers,
  selectMembersByRole,
  selectPrimaryCM,
} from "@/domain/enquiry/enquiry.selectors";
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
    (left, right) => right.lastActivity.getTime() - left.lastActivity.getTime(),
  );
}

export function buildPlutoListItemViewModels({
  enquiries,
  enquiryState,
  now = new Date(),
}: PlutoListViewModelOptions): PlutoListItemViewModel[] {
  return enquiries.map((enquiry) => {
    const assignedCMName = resolveAssignedCMName(enquiryState, enquiry.id);
    const categoriesLabel = formatCategories(enquiry.categories || []);
    const ageLabel = formatDistanceStrict(enquiry.createdAt, now);
    const lastActivityLabel = formatDistanceStrict(enquiry.lastActivity, now, {
      addSuffix: true,
    });

    return {
      id: enquiry.id,
      buyerName: enquiry.buyerName || "Unassigned buyer",
      status: enquiry.state,
      stateTone: resolveStateTone(enquiry.state),
      ageLabel,
      lastActivityLabel,
      createdAtTime: enquiry.createdAt.getTime(),
      assignedCMName,
      valueLabel: formatValue(enquiry.estimatedValue),
      categoriesLabel,
      regionLabel: enquiry.region || "—",
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

  return {
    id: enquiry.id,
    buyerName: enquiry.buyerName || "Unassigned buyer",
    status: enquiry.state,
    stateTone: resolveStateTone(enquiry.state),
    assignedCMName: resolveAssignedCMName(enquiryState, enquiry.id),
    valueLabel: formatValue(enquiry.estimatedValue),
    categoriesLabel: formatCategories(enquiry.categories || []),
    createdAtLabel: formatDistanceStrict(enquiry.createdAt, now, {
      addSuffix: true,
    }),
    lastActivityLabel: formatDistanceStrict(enquiry.lastActivity, now, {
      addSuffix: true,
    }),
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
