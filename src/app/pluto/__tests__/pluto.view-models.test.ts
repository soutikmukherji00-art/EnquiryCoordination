import { describe, expect, it } from "vitest";
import type { EnquiryStateStore } from "@/domain/enquiry/enquiry.reducer";
import type { Enquiry, Member, Persona } from "@/domain/enquiry/enquiry.types";
import {
  buildPlutoDetailHeaderViewModel,
  buildPlutoKpiCards,
  buildPlutoListItemViewModels,
  filterPlutoListItemViewModels,
  resolveMergedPanelEnquiryId,
  selectPlutoAccessibleEnquiries,
} from "../pluto.view-models";

const now = new Date("2026-04-09T12:00:00Z");

const bdmPersona: Persona = {
  id: "p_bdm_1",
  userId: "u_101",
  displayName: "Amit Kumar",
  role: "BDM",
  isExternal: false,
};

const sellerPersona: Persona = {
  id: "p_seller_1",
  userId: "u_501",
  displayName: "Suresh Industries",
  role: "Seller",
  isExternal: true,
};

const enquiries: Enquiry[] = [
  {
    id: "ENQ-2401",
    buyerName: "Ramesh Industries",
    buyerPersonaId: "p_buyer_1",
    bdmPersonaId: "p_bdm_1",
    state: "Pending Response",
    estimatedValue: 75000,
    categories: ["Steel"],
    memberIds: ["m_ENQ-2401_p_bdm_1", "m_ENQ-2401_p_cm_north"],
    createdAt: new Date("2026-04-05T09:00:00Z"),
    lastActivity: new Date("2026-04-08T16:00:00Z"),
  },
  {
    id: "ENQ-2402",
    buyerName: "Global Manufacturing Ltd",
    buyerPersonaId: "p_buyer_2",
    bdmPersonaId: "p_bdm_2",
    state: "Converted to Order",
    estimatedValue: 120000,
    categories: ["Polymer"],
    memberIds: ["m_ENQ-2402_p_bdm_2", "m_ENQ-2402_p_cm_south"],
    createdAt: new Date("2026-04-02T11:00:00Z"),
    lastActivity: new Date("2026-04-09T08:00:00Z"),
  },
];

const members: Record<string, Member[]> = {
  "ENQ-2401": [
    {
      id: "m_ENQ-2401_p_bdm_1",
      userId: "u_101",
      personaId: "p_bdm_1",
      role: "BDM",
      joinedAt: new Date("2026-04-05T09:00:00Z"),
    },
    {
      id: "m_ENQ-2401_p_cm_north",
      userId: "u_210",
      personaId: "p_cm_north",
      role: "CM",
      isPrimaryCM: true,
      joinedAt: new Date("2026-04-05T09:05:00Z"),
    },
  ],
  "ENQ-2402": [
    {
      id: "m_ENQ-2402_p_bdm_2",
      userId: "u_102",
      personaId: "p_bdm_2",
      role: "BDM",
      joinedAt: new Date("2026-04-02T11:00:00Z"),
    },
    {
      id: "m_ENQ-2402_p_cm_south",
      userId: "u_211",
      personaId: "p_cm_south",
      role: "CM",
      joinedAt: new Date("2026-04-02T11:05:00Z"),
    },
  ],
};

const enquiryState: EnquiryStateStore = {
  enquiries: {
    "ENQ-2401": enquiries[0],
    "ENQ-2402": enquiries[1],
  },
  membersByEnquiry: members,
  records: {
    "ENQ-2401": {
      enquiryId: "ENQ-2401",
      createdAt: new Date("2026-04-05T09:00:00Z"),
      origin: "mail_intake",
      isNew: true,
      buyer: { name: "Ramesh Industries" },
      requirements: { categories: ["Steel"] },
      assignment: { primaryCMName: "Priya Sharma" },
      products: [],
    },
    "ENQ-2402": {
      enquiryId: "ENQ-2402",
      createdAt: new Date("2026-04-02T11:00:00Z"),
      origin: "whatsapp_intake",
      isNew: false,
      buyer: { name: "Global Manufacturing Ltd" },
      requirements: { categories: ["Polymer"] },
      assignment: { primaryCMName: "Meera Iyer" },
      products: [],
    },
  },
};

describe("resolveMergedPanelEnquiryId", () => {
  it("uses Pluto selection on enquiry-chat even when a stale thread tag differs", () => {
    expect(
      resolveMergedPanelEnquiryId({
        workspaceMode: "pluto",
        plutoPage: "enquiry-chat",
        plutoSelectedEnquiryId: "ENQ-A",
        threadEnquiryId: "ENQ-B",
        selectedEnquiryId: "ENQ-B",
      }),
    ).toBe("ENQ-A");
  });

  it("falls back to thread then selected enquiry in Prism", () => {
    expect(
      resolveMergedPanelEnquiryId({
        workspaceMode: "prism",
        plutoPage: "enquiry-list",
        plutoSelectedEnquiryId: null,
        threadEnquiryId: "ENQ-T",
        selectedEnquiryId: "ENQ-S",
      }),
    ).toBe("ENQ-T");
    expect(
      resolveMergedPanelEnquiryId({
        workspaceMode: "prism",
        plutoPage: "enquiry-list",
        plutoSelectedEnquiryId: null,
        threadEnquiryId: undefined,
        selectedEnquiryId: "ENQ-S",
      }),
    ).toBe("ENQ-S");
  });
});

describe("pluto.view-models", () => {
  it("maps enquiries into Pluto list rows using shared enquiry state", () => {
    const items = buildPlutoListItemViewModels({
      enquiries,
      enquiryState,
      allGroupChannels: [],
      currentPersonaId: "p_bdm_1",
      now,
    });

    expect(items[0]).toMatchObject({
      id: "ENQ-2401",
      buyerName: "Ramesh Industries",
      assignedCMName: "Priya Sharma",
      valueLabel: "₹75,000",
      categoriesLabel: "Steel",
      regionLabel: "—",
      isNew: true,
      sourceBadge: "Email",
      unreadCount: 0,
      mentionCount: 0,
    });
    expect(items[0].lastActivityLabel).toContain("ago");
    expect(items[0].createdAtTime).toBe(enquiries[0].createdAt.getTime());
    expect(items[0].lastActivityTime).toBe(enquiries[0].lastActivity.getTime());
  });

  it("builds a detail header for the selected enquiry", () => {
    const header = buildPlutoDetailHeaderViewModel({
      enquiryId: "ENQ-2402",
      enquiryState,
      now,
    });

    expect(header).toMatchObject({
      id: "ENQ-2402",
      buyerName: "Global Manufacturing Ltd",
      assignedCMName: "Meera Iyer",
      valueLabel: "₹1,20,000",
      categoriesLabel: "Polymer",
      status: "Converted to Order",
    });
  });

  it("filters accessible enquiries with the same persona rules as Prism", () => {
    const visibleToBDM = selectPlutoAccessibleEnquiries({
      enquiries,
      currentPersona: bdmPersona,
    });
    const visibleToSeller = selectPlutoAccessibleEnquiries({
      enquiries,
      currentPersona: sellerPersona,
    });

    expect(visibleToBDM.map((enquiry) => enquiry.id)).toEqual(["ENQ-2401"]);
    expect(visibleToSeller).toEqual([]);
  });

  it("supports query filtering and KPI summaries", () => {
    const items = buildPlutoListItemViewModels({
      enquiries,
      enquiryState,
      allGroupChannels: [],
      currentPersonaId: "p_bdm_1",
      now,
    });
    const filtered = filterPlutoListItemViewModels(items, "meera");
    const cards = buildPlutoKpiCards(items);

    expect(filtered.map((item) => item.id)).toEqual(["ENQ-2402"]);
    expect(cards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "total", value: "2", label: "Total" }),
        expect.objectContaining({ id: "converted", value: "1" }),
      ]),
    );
  });
});
