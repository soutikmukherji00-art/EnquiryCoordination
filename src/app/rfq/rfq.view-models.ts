import { format } from "date-fns";
import type { EnquiryStateStore } from "@/domain/enquiry/enquiry.reducer";
import { selectMembersByRole } from "@/domain/enquiry/enquiry.selectors";
import { getPersonaById } from "@/domain/persona/persona.data";
import type { PlutoKpiCardViewModel, PlutoListItemViewModel, PlutoStateTone } from "@/app/pluto/pluto.types";

export interface RfqListRowViewModel {
  id: string;
  buyerName: string;
  createdAtTime: number;
  rfqDateLabel: string;
  status: string;
  stateTone: PlutoStateTone;
  valueLabel: string;
  regionLabel: string;
  orderChampionLabel: string;
  rmNameLabel: string;
  cmNameLabel: string;
}

function resolveFirstBDMDisplayName(
  enquiryState: EnquiryStateStore,
  enquiryId: string,
): string {
  const bdms = selectMembersByRole(enquiryState, enquiryId, "BDM");
  if (bdms.length === 0) {
    return "—";
  }
  return getPersonaById(bdms[0].personaId)?.displayName ?? "—";
}

export function filterConvertedListItems(
  items: PlutoListItemViewModel[],
): PlutoListItemViewModel[] {
  return items.filter((item) => item.status === "Converted to Order");
}

/**
 * KPI strip uses the full persona-scoped pipeline (same input list as Pluto), one card per enquiry state bucket.
 */
export function buildRfqKpiCards(
  items: PlutoListItemViewModel[],
): PlutoKpiCardViewModel[] {
  const awaitingResponse = items.filter(
    (item) => item.status === "Awaiting Response",
  ).length;
  const cmResponded = items.filter(
    (item) => item.status === "CM Responded",
  ).length;
  const pendingResponse = items.filter(
    (item) => item.status === "Pending Response",
  ).length;
  const draft = items.filter((item) => item.status === "Draft").length;
  const converted = items.filter(
    (item) => item.status === "Converted to Order",
  ).length;

  return [
    {
      id: "awaiting-response",
      label: "Awaiting Response",
      value: String(awaitingResponse),
      tone: "accent",
    },
    {
      id: "cm-responded",
      label: "CM Responded",
      value: String(cmResponded),
      tone: "warning",
    },
    {
      id: "pending-response",
      label: "Pending Response",
      value: String(pendingResponse),
      tone: "warning",
    },
    {
      id: "draft",
      label: "Draft",
      value: String(draft),
      tone: "neutral",
    },
    {
      id: "converted",
      label: "Converted to Order",
      value: String(converted),
      tone: "success",
    },
  ];
}

export function buildRfqTableRows(
  items: PlutoListItemViewModel[],
  enquiryState: EnquiryStateStore,
): RfqListRowViewModel[] {
  return filterConvertedListItems(items).map((item) => ({
    id: item.id,
    buyerName: item.buyerName,
    createdAtTime: item.createdAtTime,
    rfqDateLabel: format(new Date(item.createdAtTime), "d MMM, yyyy | h:mm a"),
    status: item.status,
    stateTone: item.stateTone,
    valueLabel: item.valueLabel,
    regionLabel: item.regionLabel,
    orderChampionLabel: "—",
    rmNameLabel: resolveFirstBDMDisplayName(enquiryState, item.id),
    cmNameLabel:
      item.assignedCMName === "Unassigned CM" ? "—" : item.assignedCMName,
  }));
}
