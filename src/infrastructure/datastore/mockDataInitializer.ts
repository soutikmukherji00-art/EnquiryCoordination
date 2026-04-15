/**
 * Mock Data Initializer
 *
 * Converts mock data objects into initial reducer states.
 */

import { EnquiryStateStore } from "@/domain/enquiry/enquiry.reducer";
import { MessageDomainState } from "@/domain/message/message.reducer";
import {
  MOCK_ENQUIRIES,
  MOCK_MESSAGES,
  MOCK_SELLER_CHANNELS,
  MOCK_BUYER_DM_CHANNELS,
  MOCK_SELLER_DM_CHANNELS,
  MOCK_SELLER_GROUPS,
  MOCK_BUYER_GROUPS,
  MOCK_INTERNAL_GROUPS,
} from "./mockData";
import { EnquiryRecord } from "@/domain/enquiry/enquiry.record";
import { getPersonaById } from "@/domain/persona/persona.data";
import { Member, Enquiry } from "@/domain/enquiry/enquiry.types";
import { getBuyerDefaultsForEnquiry } from "@/domain/enquiry/enquiry.schema";
import { hydrateEnquiryPrimaryCMFromRecord } from "@/domain/enquiry/enquiry.state-hydration";

/**
 * Creates a mock EnquiryRecord for a given Enquiry.
 * Populates it with specific details for demo data continuity.
 */
function createMockRecordForEnquiry(enq: Enquiry): EnquiryRecord {
  const buyerDefaults = getBuyerDefaultsForEnquiry(enq.buyerId, "QuickRFQ");
  const etaDays = buyerDefaults.etaDays ? parseInt(buyerDefaults.etaDays, 10) : undefined;
  const attachmentKey = enq.id.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const previewAttachments = [
    {
      id: `att_${attachmentKey}_brief`,
      name: `${enq.id}_Requirement_Brief.pdf`,
      type: "application/pdf",
      url: "#mock-pdf",
    },
  ];
  const previewAttachmentsWithSpreadsheet = [
    ...previewAttachments,
    {
      id: `att_${attachmentKey}_line_items`,
      name: `${enq.id}_Line_Items.xlsx`,
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      url: "#mock-xlsx",
    },
  ];
  const resolvedPrimaryCMPersonaId = (enq.memberIds || [])
    .map((memberId) => memberId.split("_").slice(2).join("_"))
    .find((personaId) => getPersonaById(personaId)?.role === "CM");
  const resolvedPrimaryCMName = resolvedPrimaryCMPersonaId
    ? getPersonaById(resolvedPrimaryCMPersonaId)?.displayName
    : undefined;

  const common = {
    enquiryId: enq.id,
    createdAt: enq.createdAt || new Date(),
    origin: "manual" as const,
    responseMode: "quick" as const,
    isNew: false,
    buyer: {
      id: enq.buyerId,
      personaId: enq.buyerPersonaId,
      name: enq.buyerName || "Unknown Buyer",
      company: enq.buyerName || undefined,
      gstin: buyerDefaults.gstin,
      creditLimit: buyerDefaults.creditLimit,
      openCreditLimit: buyerDefaults.openCreditLimit,
    },
    requirements: {
      categories: enq.categories || [],
      deliveryLocation: buyerDefaults.deliveryLocation,
      deliveryLocations: buyerDefaults.deliveryLocations,
      etaDays: Number.isFinite(etaDays) ? etaDays : undefined,
      paymentTerms: buyerDefaults.paymentTerms,
      estimatedValue: enq.estimatedValue,
      enhancerTypes: ["primary"],
      iddDays: 10,
      mddDays: 15,
    },
    assignment: {
      primaryCMId: resolvedPrimaryCMPersonaId,
      primaryCMName: resolvedPrimaryCMName,
      bdmPersonaId: enq.bdmPersonaId,
    },
    attachments: previewAttachments,
  };

  // Specific overrides for key mock enquiries
  switch (enq.id) {
    case "ENQ-2401":
      return {
        ...common,
        origin: "whatsapp_intake",
        isNew: true,
        requirements: {
          ...common.requirements,
          deliveryLocation: "Delhi Project Site",
          scopeOfUnloading: "Buyer Scope",
          notes:
            "Hi Amit, we are starting structural work at our Delhi Sector-18 site and need support with a steel package that includes around 200 MT of TMT 500D and about 50 MT of 4-inch steel pipe. Please plan dispatch in two lots so the site team can manage unloading smoothly, and share mill test certificates and quality documents in advance because our consultant will verify these before each unloading slot.",
        },
        products: [
          { category: "Steel", name: "TMT 500D", quantity: "200 MT", specifications: "Standard construction grade" },
          { category: "Steel", name: "Steel Pipe 4 inch", quantity: "50 MT", specifications: "Industrial grade" },
        ],
      };
    case "ENQ-2402": {
      const enq2402Thread = [
        {
          kind: "email" as const,
          subject: "RE: RFQ: SS 316L pipes — Bangalore plant expansion (Apr 2026) | Add freight split",
          from: '"Global Manufacturing — Procurement" <procurement@globalmfg.example.com>',
          to: "Birla Pivot RFQ Inbox <rfq-inbox@birlapivot.example.com>",
          receivedAt: "Tue, 8 Apr 2026 12:18:43 +0530",
          body: [
            "Adding two commercial clarifications from our project controls team:",
            "",
            "1) Please split freight and basic price line-wise in the quote sheet.",
            "2) Keep loading/unloading assumptions explicit; unloading is buyer scope at Bangalore.",
            "",
            "Also, engineering has asked for hydro-test certificates and PMI report copy per batch.",
            "If your mill can share sample certificates, attach them in your response.",
            "",
            "Regards,",
            "Ananya Rao",
          ].join("\n"),
        },
        {
          kind: "email" as const,
          subject: "RFQ: SS 316L pipes — Bangalore plant expansion (Apr 2026)",
          from: '"Global Manufacturing — Procurement" <procurement@globalmfg.example.com>',
          to: "Birla Pivot RFQ Inbox <rfq-inbox@birlapivot.example.com>",
          receivedAt: "Tue, 8 Apr 2026 10:42:18 +0530",
          body: [
            "Dear Birla Pivot team,",
            "",
            "Please share your best offer for the following material for our Bangalore facility expansion.",
            "",
            "• Grade: SS 316L",
            "• Form: Seamless pipes, 4\" SCH 40",
            "• Qty: ~1000 linear metres (phased delivery OK)",
            "• Inspection: Third-party at your mill / warehouse — we will coordinate",
            "",
            "Attached: line list from our MRP export and the email thread with our engineering lead for reference.",
            "Please keep offer validity for minimum 15 days as approvals will run in two steps.",
            "",
            "Regards,",
            "Ananya Rao",
            "Senior Buyer | Global Manufacturing Ltd",
            "Mob: +91 98765 43210",
          ].join("\n"),
        },
        {
          kind: "email" as const,
          subject: "RE: RFQ: SS 316L pipes — Bangalore plant expansion (Apr 2026) | Delivery windows",
          from: '"Global Manufacturing — Projects" <projects@globalmfg.example.com>',
          to: "Birla Pivot RFQ Inbox <rfq-inbox@birlapivot.example.com>",
          receivedAt: "Tue, 8 Apr 2026 11:07:26 +0530",
          body: [
            "Hi Team, adding project planning inputs:",
            "",
            "• First lot target gate-in: 28 Apr 2026",
            "• Balance lots can be split across May as per rolling schedule",
            "• Mark bundles with heat number tags matching test certs",
            "",
            "Please mirror this in your delivery commitment table so stores can plan unloading bays.",
            "",
            "Thanks,",
            "Nikhil Menon",
            "Project Engineering | Global Manufacturing Ltd",
          ].join("\n"),
        },
      ];
      return {
        ...common,
        origin: "mail_intake",
        isNew: false,
        sourceCorrespondences: enq2402Thread,
        sourceCorrespondence: enq2402Thread[0],
        requirements: {
          ...common.requirements,
          deliveryLocation: "Bangalore Facility",
          scopeOfUnloading: "Buyer Scope",
          notes: "Requires SS 316L grade, 4-inch diameter for industrial use.",
        },
        products: [
          { category: "Steel", name: "SS 316L Pipes", quantity: "1000m", specifications: "4-inch diameter, Industrial grade" },
        ],
        attachments: [
          ...previewAttachmentsWithSpreadsheet,
          {
            id: "att_enq2402_eml",
            name: "Fwd_RFQ_SS316L_thread.eml",
            type: "message/rfc822",
            url: "#mock-eml",
          },
          {
            id: "att_enq2402_xlsx",
            name: "SS316L_line_items_Q2.xlsx",
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            url: "#mock-xlsx",
          },
        ],
      };
    }
    case "ENQ-2403": {
      const enq2403Thread = [
        {
          kind: "email" as const,
          subject: "RE: RFQ: Aluminum sheets 5mm — Mumbai warehouse (ENQ-2403) | Packing confirmation",
          from: '"TechnoSteel — SCM" <scm@technosteel.example.com>',
          to: "Priya Singh <priya.singh@birlapivot.example.com>",
          receivedAt: "Thu, 30 Jan 2026 13:12:04 +0530",
          body: [
            "Hi Priya,",
            "",
            "Please include export-safe palletized packing even though this is domestic movement.",
            "Our architect team has specifically requested edge protection + moisture barrier film",
            "because sheets will stay in covered staging for up to 10 days before installation.",
            "",
            "Also confirm whether you can include coating batch numbers in dispatch challan remarks.",
            "",
            "Regards,",
            "Karan Mehta",
            "Supply Chain | TechnoSteel Corp",
          ].join("\n"),
        },
        {
          kind: "email" as const,
          subject: "RE: RFQ: Aluminum sheets 5mm — Mumbai warehouse (ENQ-2403) | Site handling notes",
          from: '"TechnoSteel — Site Ops" <siteops@technosteel.example.com>',
          to: "Priya Singh <priya.singh@birlapivot.example.com>",
          receivedAt: "Thu, 30 Jan 2026 11:44:39 +0530",
          body: [
            "Adding site-side notes for quote assumptions:",
            "",
            "• Unloading is buyer scope with forklift available only 10 AM to 4 PM",
            "• Deliver in lots max 200 sqm to avoid stacking damage",
            "• Preferred vehicle: covered trailer",
            "• Attach mill COA + coating datasheet with each lot",
            "",
            "Please bake this into the delivery plan section.",
          ].join("\n"),
        },
        {
          kind: "email" as const,
          subject: "RFQ: Aluminum sheets 5mm — Mumbai warehouse (ENQ-2403)",
          from: '"TechnoSteel — SCM" <scm@technosteel.example.com>',
          to: "Priya Singh <priya.singh@birlapivot.example.com>",
          receivedAt: "Thu, 30 Jan 2026 10:58:22 +0530",
          body: [
            "Hi Priya,",
            "",
            "Following our call, please treat this as the formal mail trail for ENQ-2403.",
            "",
            "• Material: Aluminum rolled sheets, 5mm",
            "• Finish: Stucco-embossed (architect RAL 9006 ref)",
            "• Qty: 1000 sqm",
            "• Delivery: Mumbai warehouse — required gate date 12 Feb 2026",
            "• Docs: Mill COA + coating datasheet per batch",
            "",
            "Regards,",
            "Karan Mehta",
            "Supply Chain | TechnoSteel Corp",
          ].join("\n"),
        },
      ];
      return {
        ...common,
        origin: "mail_intake",
        isNew: false,
        sourceCorrespondences: enq2403Thread,
        sourceCorrespondence: enq2403Thread[0],
        requirements: {
          ...common.requirements,
          deliveryLocation: "Mumbai Warehouse",
          scopeOfUnloading: "Buyer Scope",
          notes: "Mail RFQ — 5mm aluminum, stucco finish, 2-week gate.",
        },
        products: [
          { category: "Steel", name: "Aluminum Sheets", quantity: "1000 sq m", specifications: "5mm thick, stucco-embossed" },
        ],
      };
    }
    case "ENQ-2404":
      return {
        ...common,
        origin: "website_intake",
        isNew: false,
        requirements: {
          ...common.requirements,
          deliveryLocation: "Chennai Site",
          scopeOfUnloading: "Buyer Scope",
          notes: "Website form + BOQ upload — Grade 304 pipes and OPC 53 cement.",
        },
        products: [
          { category: "Steel", name: "Industrial Steel Pipes", quantity: "500 units", specifications: "Grade 304, 2-inch diameter" },
          { category: "Cement", name: "Cement OPC 53", quantity: "50 bags", specifications: "Standard construction use" },
        ],
        attachments: [
          ...previewAttachments,
          {
            id: "att_enq2404_boq",
            name: "Website_upload_BOQ_Chennai.xlsx",
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            url: "#mock-xlsx",
          },
        ],
      };
    case "ENQ-2405":
      return {
        ...common,
        origin: "whatsapp_intake",
        isNew: false,
        requirements: {
          ...common.requirements,
          deliveryLocation: "Pune Plant",
          scopeOfUnloading: "Buyer Scope",
          notes:
            "Hi Priya, confirming from our side that we want to close the Pune requirement as a combined package with structural sections and 200 bags of OPC 53 in one coordinated delivery. Please send one consolidated quote with line-wise freight and tax breakup, and keep the dispatch window around Thu/Fri because our civil and fabrication teams will be available together only in that slot.",
        },
        products: [
          { category: "Steel", name: "Structural sections (bundle)", quantity: "1 lot", specifications: "As per TechnoSteel drawing TS-PN-09" },
          { category: "Cement", name: "OPC 53", quantity: "200 bags", specifications: "Pune site delivery" },
        ],
      };
    case "ENQ-2406": {
      const enq2406Thread = [
        {
          kind: "email" as const,
          subject: "RE: VG-30 bitumen — NHAI project (ENQ-2406) | Dispatch and weighbridge docs",
          from: '"RoadBuild Infra — Procurement Cell" <procurement@roadbuildinfra.example.com>',
          to: "Birla Pivot RFQ Inbox <rfq-inbox@birlapivot.example.com>",
          receivedAt: "Mon, 6 Apr 2026 18:04:27 +0530",
          body: [
            "Team, adding dispatch compliance points from our EPC partner:",
            "",
            "• Provide weighbridge slips for each lot and aggregate dispatch statement at lot closure.",
            "• Mention batch no., tanker no., and loading temperature on challan.",
            "• Include refinery test report reference in invoice remarks.",
            "",
            "This is mandatory for NHAI billing reconciliation.",
            "",
            "Regards,",
            "Aditya Verma",
            "Procurement Cell | RoadBuild Infra",
          ].join("\n"),
        },
        {
          kind: "email" as const,
          subject: "RE: VG-30 bitumen — NHAI project (ENQ-2406) | Phase plan",
          from: '"RoadBuild Infra — PMO" <pmo@roadbuildinfra.example.com>',
          to: "Birla Pivot RFQ Inbox <rfq-inbox@birlapivot.example.com>",
          receivedAt: "Mon, 6 Apr 2026 16:39:02 +0530",
          body: [
            "Please align supply to below phase plan:",
            "",
            "• Phase 1: 40 MT by 09 Apr",
            "• Phase 2: 40 MT by 12 Apr",
            "• Phase 3: 40 MT by 15 Apr",
            "",
            "Night unloading window only (8 PM to 4 AM) due to lane closure restrictions.",
            "Unloading and hose connections will be buyer scope at Jaipur corridor site.",
          ].join("\n"),
        },
        {
          kind: "email" as const,
          subject: "VG-30 bitumen — NHAI project, phased 120 MT (ENQ-2406)",
          from: '"RoadBuild Infra — Procurement Cell" <procurement@roadbuildinfra.example.com>',
          to: "Birla Pivot RFQ Inbox <rfq-inbox@birlapivot.example.com>",
          receivedAt: "Mon, 6 Apr 2026 15:22:15 +0530",
          body: [
            "Dear Birla Pivot team,",
            "",
            "Please quote for VG-30 paving bitumen against our NHAI package requirement.",
            "Total quantity is 120 MT in phased dispatch, destination Jaipur NH corridor.",
            "",
            "Specification: IS 73 compliant, refinery COA required with each load.",
            "Please share best landed rate with freight breakup and payment milestones.",
            "",
            "Regards,",
            "Aditya Verma",
          ].join("\n"),
        },
      ];
      return {
        ...common,
        origin: "mail_intake",
        isNew: false,
        sourceCorrespondences: enq2406Thread,
        sourceCorrespondence: enq2406Thread[0],
        requirements: {
          ...common.requirements,
          deliveryLocation: "Jaipur NH corridor",
          scopeOfUnloading: "Buyer Scope",
          notes: "VG-30 bitumen — NHAI project, phased120 MT.",
        },
        products: [
          { category: "Bitumen", name: "VG-30 paving bitumen", quantity: "120 MT", specifications: "IS 73; rail to site" },
        ],
      };
    }
    case "ENQ-2407": {
      const enq2407Thread = [
        {
          kind: "email" as const,
          subject: "RE: HDPE geomembrane 2mm — pond lining (ENQ-2407) | QA hold points",
          from: '"SouthChem Projects — QA" <qa@southchem.example.com>',
          to: "Birla Pivot RFQ Inbox <rfq-inbox@birlapivot.example.com>",
          receivedAt: "Wed, 2 Apr 2026 14:49:51 +0530",
          body: [
            "Adding QA hold points for quote + execution plan:",
            "",
            "• Rolls must be from same manufacturing batch per pond zone.",
            "• Share test values for density, tensile, tear resistance, puncture, and OIT.",
            "• Third-party witness test may be asked before final dispatch.",
            "",
            "Please include these assumptions in your commercial response.",
          ].join("\n"),
        },
        {
          kind: "email" as const,
          subject: "RE: HDPE geomembrane 2mm — pond lining (ENQ-2407) | Site sequence",
          from: '"SouthChem Projects — Site Team" <site@southchem.example.com>',
          to: "Birla Pivot RFQ Inbox <rfq-inbox@birlapivot.example.com>",
          receivedAt: "Wed, 2 Apr 2026 13:28:10 +0530",
          body: [
            "Site sequencing note:",
            "",
            "• Pond A: 3000 sqm",
            "• Pond B: 2800 sqm",
            "• Pond C: 2200 sqm",
            "",
            "Dispatch in this order with roll labels mapped to pond zone IDs.",
            "Delivery location is Chennai chemical site, unloading by buyer team.",
          ].join("\n"),
        },
        {
          kind: "email" as const,
          subject: "HDPE geomembrane 2mm — pond lining requirement (ENQ-2407)",
          from: '"SouthChem Projects — Procurement" <procurement@southchem.example.com>',
          to: "Birla Pivot RFQ Inbox <rfq-inbox@birlapivot.example.com>",
          receivedAt: "Wed, 2 Apr 2026 12:41:36 +0530",
          body: [
            "Dear Team,",
            "",
            "Please share quotation for HDPE geomembrane rolls, thickness 2mm,",
            "for effluent pond lining work at our Chennai chemical site.",
            "Total tentative quantity: 8000 sqm.",
            "",
            "Kindly provide technical datasheet + warranty declaration with quote.",
            "",
            "Regards,",
            "R. Suresh",
            "Procurement | SouthChem Projects",
          ].join("\n"),
        },
      ];
      return {
        ...common,
        origin: "mail_intake",
        isNew: false,
        sourceCorrespondences: enq2407Thread,
        sourceCorrespondence: enq2407Thread[0],
        requirements: {
          ...common.requirements,
          deliveryLocation: "Chennai chemical site",
          scopeOfUnloading: "Buyer Scope",
          notes: "HDPE geomembrane 2mm — pond lining, permeability spec on mail.",
        },
        products: [
          { category: "Polymer", name: "HDPE geomembrane", quantity: "8000 sqm", specifications: "2mm, chemical bund" },
        ],
      };
    }
    case "ENQ-2408":
      return {
        ...common,
        origin: "whatsapp_intake",
        isNew: false,
        requirements: {
          ...common.requirements,
          deliveryLocation: "Lucknow warehouse",
          scopeOfUnloading: "Buyer Scope",
          notes:
            "Hi Amit, for the Lucknow warehouse we need 350 bags of OPC 43 on priority, and our gate team has asked us to keep this within a 48-hour window from dispatch confirmation. Please share LR and vehicle details before truck movement, coordinate with our warehouse manager Neeraj for gate entry, and ensure moisture-safe covering because evening rain is expected during unloading.",
        },
        products: [
          { category: "Cement", name: "OPC 43", quantity: "350 bags", specifications: "Lucknow delivery" },
        ],
      };
    case "ENQ-2409": {
      const enq2409Thread = [
        {
          kind: "email" as const,
          subject: "RE: CR steel coils 1.2mm — Mumbai port warehouse (ENQ-2409) | Conversion to order-ready loting",
          from: '"MetroFab Components — SCM" <scm@metrofab.example.com>',
          to: "Birla Pivot RFQ Inbox <rfq-inbox@birlapivot.example.com>",
          receivedAt: "Fri, 28 Mar 2026 17:09:45 +0530",
          body: [
            "Thanks for the updated commercial sheet.",
            "Please lock material exactly as below so we can move this to order conversion:",
            "",
            "• Grade: IS 513, 1.2mm CR",
            "• Edge: slit",
            "• Total: 120 MT in 3 lots",
            "• Destination: Mumbai port warehouse",
            "• Unloading: seller scope with crane arrangement",
            "",
            "Share final dispatch calendar and pack-list template.",
          ].join("\n"),
        },
        {
          kind: "email" as const,
          subject: "RE: CR steel coils 1.2mm — Mumbai port warehouse (ENQ-2409) | Specs confirmation",
          from: '"MetroFab Components — Quality" <quality@metrofab.example.com>',
          to: "Birla Pivot RFQ Inbox <rfq-inbox@birlapivot.example.com>",
          receivedAt: "Fri, 28 Mar 2026 15:44:12 +0530",
          body: [
            "Quality confirmation points:",
            "",
            "• Mechanical properties as per IS 513 spec sheet rev C",
            "• Surface free from edge burr and transit marks",
            "• Coil IDs to be printed on both tag and packing list",
            "",
            "Please keep heat-wise traceability in your offer appendix.",
          ].join("\n"),
        },
        {
          kind: "email" as const,
          subject: "RFQ: CR steel coils 1.2mm — Mumbai port warehouse (ENQ-2409)",
          from: '"MetroFab Components — SCM" <scm@metrofab.example.com>',
          to: "Birla Pivot RFQ Inbox <rfq-inbox@birlapivot.example.com>",
          receivedAt: "Fri, 28 Mar 2026 14:58:03 +0530",
          body: [
            "Dear Birla Pivot Team,",
            "",
            "Requesting quotation for CR steel coils as per attached requirement note.",
            "Qty 120 MT with phased dispatch over 3 weekly lots.",
            "",
            "Need destination delivery at Mumbai port warehouse.",
            "Please include freight and unloading arrangement under seller scope.",
            "",
            "Regards,",
            "Neha Bansal",
            "SCM Lead | MetroFab Components",
          ].join("\n"),
        },
      ];
      return {
        ...common,
        origin: "mail_intake",
        isNew: false,
        sourceCorrespondences: enq2409Thread,
        sourceCorrespondence: enq2409Thread[0],
        requirements: {
          ...common.requirements,
          deliveryLocation: "Mumbai port warehouse",
          scopeOfUnloading: "Seller Scope",
          notes: "Converted mail RFQ for CR steel coils with phased dispatch.",
        },
        products: [
          {
            category: "Steel",
            name: "CR Steel Coils",
            quantity: "120 MT",
            specifications: "1.2mm, IS 513 grade, slit edges",
          },
        ],
      };
    }
    case "ENQ-2410":
      return {
        ...common,
        origin: "whatsapp_intake",
        isNew: false,
        requirements: {
          ...common.requirements,
          deliveryLocation: "Chennai fabrication unit",
          scopeOfUnloading: "Buyer Scope",
          notes:
            "Hi team, we are proceeding with the polymer liner order for our Chennai fabrication unit and would like the same commercial terms discussed on chat, with delivery scheduled for next week. Please include QA documents such as COA and warranty sheet along with dispatch paperwork, because our compliance team will not allow unloading unless certification is attached to each lot.",
        },
        products: [
          {
            category: "Polymer",
            name: "LLDPE Liner Rolls",
            quantity: "300 rolls",
            specifications: "600 micron, UV-stabilized",
          },
        ],
      };
    default:
      return {
        ...common,
        requirements: {
          ...common.requirements,
          notes: "Sourcing for standard construction materials.",
        },
      };
  }
}

/**
 * Initialize EnquiryStateStore from mock enquiries
 */
export function initializeMockEnquiryState(): EnquiryStateStore {
  const state: EnquiryStateStore = {
    enquiries: {},
    membersByEnquiry: {},
    records: {},
  };

  // Convert enquiries
  MOCK_ENQUIRIES.forEach((enq) => {
    state.enquiries[enq.id] = enq;
    // Generate a structured record for each mock enquiry
    state.records[enq.id] = createMockRecordForEnquiry(enq);

    // Convert memberIds to Member objects
    // Member ID format: m_{enquiryId}_{personaId}
    // We need to extract the personaId from the full member ID
    const members: Member[] = (enq.memberIds || []).map((memberId) => {
      // Extract persona ID from member ID (format: m_ENQ-2401_p_bdm_1 -> p_bdm_1)
      const parts = memberId.split("_");
      const personaId = parts.slice(2).join("_"); // Handle persona IDs that might have underscores

      const persona = getPersonaById(personaId);
      if (!persona) {
        console.warn(`[initializeMockEnquiryState] Persona not found: ${personaId} (from memberId: ${memberId})`);
        return null;
      }

      return {
        id: memberId, // Keep the full member ID
        userId: persona.userId,
        personaId: persona.id,
        role: persona.role,
        joinedAt: new Date(),
      };
    }).filter((m): m is Member => m !== null);

    state.membersByEnquiry[enq.id] = members;

    const hydrated = hydrateEnquiryPrimaryCMFromRecord(
      state.enquiries[enq.id],
      state.membersByEnquiry[enq.id],
      state.records[enq.id],
    );
    state.enquiries[enq.id] = hydrated.enquiry;
    state.membersByEnquiry[enq.id] = hydrated.members;
  });

  return state as EnquiryStateStore;
}

/**
 * Initialize MessageDomainState from mock messages, seller channels, and buyer/seller DMs
 */
export function initializeMockMessageState(): MessageDomainState {
  console.log("[initializeMockMessageState] Initializing message state with:", {
    messagesCount: Object.keys(MOCK_MESSAGES).length,
    sellerChannelsCount: Object.keys(MOCK_SELLER_CHANNELS).length,
    sellerDMChannelsCount: MOCK_SELLER_DM_CHANNELS.length,
    buyerDMChannelsCount: MOCK_BUYER_DM_CHANNELS.length,
    sellerGroupsCount: MOCK_SELLER_GROUPS.length,
    buyerGroupsCount: MOCK_BUYER_GROUPS.length,
    internalGroupsCount: MOCK_INTERNAL_GROUPS.length,
    sellerDMChannels: MOCK_SELLER_DM_CHANNELS.map((ch) => ({
      id: ch.id,
      sellerId: ch.sellerId,
      sellerName: ch.sellerName,
      cmPersonaId: ch.cmPersonaId,
    })),
  });

  return {
    messages: MOCK_MESSAGES,
    sellerChannels: MOCK_SELLER_CHANNELS,
    sellerDMChannels: MOCK_SELLER_DM_CHANNELS,
    buyerDMChannels: MOCK_BUYER_DM_CHANNELS,
    groupChannels: [...MOCK_SELLER_GROUPS, ...MOCK_BUYER_GROUPS, ...MOCK_INTERNAL_GROUPS],
    groupInvites: [],
    threads: [],
  };
}
