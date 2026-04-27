/**
 * Mock Data for Development
 * 
 * Initial data to populate the memory store.
 * 
 * Setup:
 * - BDM1 (Amit Kumar): Direct chats with Ramesh Industries and Global Manufacturing Ltd
 * - BDM2 (Priya Singh): Direct chat with TechnoSteel Corp
 * - Enquiries: mock set includes extra Amit Kumar (BDM1) workloads with category-appropriate CMs
 * - Buyers are NOT part of enquiry groups - they have separate DM channels with their BDM
 */

import { Enquiry, generateMemberId } from "@/domain/enquiry/enquiry.types";
import type { Category } from "@/domain/category/category.types";
import { Message, SellerChannel } from "@/domain/message/message.types";
import { AuditEntry } from "@/domain/audit/audit.types";
import { BuyerDMChannel, generateBuyerDMId } from "@/domain/message/buyer-dm.types";
import { SellerDMChannel, generateSellerDMId } from "@/domain/message/seller-dm.types";
import { GroupChannel } from "@/domain/message/group.types";
import { generateGroupId } from "@/domain/message/group.utils";
import { Thread } from "@/domain/message/thread.types";

// Persona IDs from persona.data.ts
const PERSONA_BDM_1 = "p_bdm_1"; // Amit Kumar
const PERSONA_BDM_2 = "p_bdm_2"; // Priya Singh
const PERSONA_CM_STEEL = "p_cm_north";   // Priya Sharma (Steel Specialist)
const PERSONA_CM_POLYMER = "p_cm_south";   // Meera Iyer (Polymer Specialist)
const PERSONA_CM_CEMENT = "p_cm_east";   // Rajesh Kumar (Cement Specialist)
const PERSONA_CM_BITUMEN = "p_cm_west";   // Aditya Verma (Bitumen Specialist)
const PERSONA_CX_1 = "p_cx_1";   // Sneha Reddy
const PERSONA_BUYER_1 = "p_buyer_1"; // Ramesh Industries
const PERSONA_BUYER_2 = "p_buyer_2"; // Global Manufacturing Ltd
const PERSONA_BUYER_3 = "p_buyer_3"; // TechnoSteel Corp

// Seller persona IDs (from persona.data.ts / SELLER_TO_PERSONA_MAP)
const PERSONA_SELLER_1 = "p_seller_1"; // Suresh Industries
const PERSONA_SELLER_2 = "p_seller_2"; // Om Steel Traders
const PERSONA_SELLER_3 = "p_seller_3"; // Rathi Metals
const PERSONA_SELLER_4 = "p_seller_4"; // Apex Alloys
const PERSONA_SELLER_5 = "p_seller_5"; // National Steel Corp

export const MOCK_ENQUIRIES: Enquiry[] = [
  // BDM1 (Amit Kumar) — WhatsApp intake (Delhi steel)
  {
    id: "ENQ-2401",
    buyerName: "Ramesh Industries",
    buyerPersonaId: PERSONA_BUYER_1,
    bdmPersonaId: PERSONA_BDM_1,
    state: "Awaiting Response",
    estimatedValue: 75000,
    categories: ["Steel"],
    memberIds: [
      generateMemberId("ENQ-2401", PERSONA_BDM_1),
      generateMemberId("ENQ-2401", PERSONA_CM_STEEL),
      generateMemberId("ENQ-2401", PERSONA_CX_1),
    ],
    unread: true,
    lastActivity: new Date("2026-02-02T10:15:00"),
    createdAt: new Date("2026-01-30T10:30:00"),
  },
  // BDM1 — Mail intake draft queue (Bangalore SS 316L)
  {
    id: "ENQ-2402",
    buyerName: "Global Manufacturing Ltd",
    buyerPersonaId: PERSONA_BUYER_2,
    bdmPersonaId: PERSONA_BDM_1,
    state: "Draft",
    estimatedValue: 120000,
    categories: ["Steel"],
    memberIds: [
      generateMemberId("ENQ-2402", PERSONA_BDM_1),
      generateMemberId("ENQ-2402", PERSONA_CM_POLYMER),
      generateMemberId("ENQ-2402", PERSONA_CX_1),
    ],
    unread: true,
    lastActivity: new Date("2026-02-05T09:30:00"),
    createdAt: new Date("2026-01-31T09:00:00"),
  },
  // BDM1 — Bitumen / roads (mail draft + internal bitumen desk)
  {
    id: "ENQ-2406",
    buyerName: "Ramesh Industries",
    buyerPersonaId: PERSONA_BUYER_1,
    bdmPersonaId: PERSONA_BDM_1,
    state: "Draft",
    estimatedValue: 42000,
    categories: ["Bitumen"],
    memberIds: [
      generateMemberId("ENQ-2406", PERSONA_BDM_1),
      generateMemberId("ENQ-2406", PERSONA_CM_BITUMEN),
      generateMemberId("ENQ-2406", PERSONA_CX_1),
    ],
    unread: true,
    lastActivity: new Date("2026-02-05T10:45:00"),
    createdAt: new Date("2026-02-03T08:45:00"),
  },
  // BDM1 — Polymer geomembrane mail draft (Global Mfg)
  {
    id: "ENQ-2407",
    buyerName: "Global Manufacturing Ltd",
    buyerPersonaId: PERSONA_BUYER_2,
    bdmPersonaId: PERSONA_BDM_1,
    state: "Draft",
    estimatedValue: 88000,
    categories: ["Polymer"],
    memberIds: [
      generateMemberId("ENQ-2407", PERSONA_BDM_1),
      generateMemberId("ENQ-2407", PERSONA_CM_POLYMER),
      generateMemberId("ENQ-2407", PERSONA_CX_1),
    ],
    unread: true,
    lastActivity: new Date("2026-02-05T11:20:00"),
    createdAt: new Date("2026-02-03T09:50:00"),
  },
  // BDM1 — Cement topping — Ramesh Lucknow site (WhatsApp-led)
  {
    id: "ENQ-2408",
    buyerName: "Ramesh Industries",
    buyerPersonaId: PERSONA_BUYER_1,
    bdmPersonaId: PERSONA_BDM_1,
    state: "Draft",
    estimatedValue: 34000,
    categories: ["Cement"],
    memberIds: [
      generateMemberId("ENQ-2408", PERSONA_BDM_1),
      generateMemberId("ENQ-2408", PERSONA_CM_CEMENT),
      generateMemberId("ENQ-2408", PERSONA_CX_1),
    ],
    unread: false,
    lastActivity: new Date("2026-02-03T11:00:00"),
    createdAt: new Date("2026-02-03T10:20:00"),
  },
  // BDM2 — Mail intake (Mumbai aluminum)
  {
    id: "ENQ-2403",
    buyerName: "TechnoSteel Corp",
    buyerPersonaId: PERSONA_BUYER_3,
    bdmPersonaId: PERSONA_BDM_2,
    state: "RM Approved",
    estimatedValue: 62500,
    categories: ["Steel"],
    memberIds: [
      generateMemberId("ENQ-2403", PERSONA_BDM_2),
      generateMemberId("ENQ-2403", PERSONA_CM_POLYMER),
      generateMemberId("ENQ-2403", PERSONA_CX_1),
    ],
    unread: false,
    lastActivity: new Date("2026-02-02T09:40:00"),
    createdAt: new Date("2026-01-30T11:00:00"),
  },
  // BDM2 — WhatsApp intake (Pune bundled steel + cement)
  {
    id: "ENQ-2405",
    buyerName: "TechnoSteel Corp",
    buyerPersonaId: PERSONA_BUYER_3,
    bdmPersonaId: PERSONA_BDM_2,
    state: "Converted to Order",
    estimatedValue: 40000,
    categories: ["Steel", "Cement"],
    memberIds: [
      generateMemberId("ENQ-2405", PERSONA_BDM_2),
      generateMemberId("ENQ-2405", PERSONA_CM_STEEL),
      generateMemberId("ENQ-2405", PERSONA_CM_CEMENT),
      generateMemberId("ENQ-2405", PERSONA_CX_1),
    ],
    unread: false,
    lastActivity: new Date("2026-02-02T12:30:00"),
    createdAt: new Date("2026-02-01T08:50:00"),
  },
  // BDM1 — Mail RFQ draft queue (Mumbai steel coils)
  {
    id: "ENQ-2409",
    buyerName: "Global Manufacturing Ltd",
    buyerPersonaId: PERSONA_BUYER_2,
    bdmPersonaId: PERSONA_BDM_1,
    state: "Draft",
    estimatedValue: 156000,
    categories: ["Steel"],
    memberIds: [
      generateMemberId("ENQ-2409", PERSONA_BDM_1),
      generateMemberId("ENQ-2409", PERSONA_CM_STEEL),
      generateMemberId("ENQ-2409", PERSONA_CX_1),
    ],
    unread: true,
    lastActivity: new Date("2026-02-05T12:05:00"),
    createdAt: new Date("2026-02-03T09:10:00"),
  },
  // BDM2 — WhatsApp RFQ converted (Chennai polymer liners)
  {
    id: "ENQ-2410",
    buyerName: "TechnoSteel Corp",
    buyerPersonaId: PERSONA_BUYER_3,
    bdmPersonaId: PERSONA_BDM_2,
    state: "Converted to Order",
    estimatedValue: 94000,
    categories: ["Polymer"],
    memberIds: [
      generateMemberId("ENQ-2410", PERSONA_BDM_2),
      generateMemberId("ENQ-2410", PERSONA_CM_POLYMER),
      generateMemberId("ENQ-2410", PERSONA_CX_1),
    ],
    unread: false,
    lastActivity: new Date("2026-02-04T12:15:00"),
    createdAt: new Date("2026-02-03T10:40:00"),
  },
  // BDM1 — Sole website intake example (listed last in Prism / mock order)
  {
    id: "ENQ-2404",
    buyerName: "Ramesh Industries",
    buyerPersonaId: PERSONA_BUYER_1,
    bdmPersonaId: PERSONA_BDM_1,
    state: "Draft",
    estimatedValue: 98000,
    categories: ["Cement"],
    memberIds: [
      generateMemberId("ENQ-2404", PERSONA_BDM_1),
      generateMemberId("ENQ-2404", PERSONA_CM_CEMENT),
      generateMemberId("ENQ-2404", PERSONA_CX_1),
    ],
    unread: false,
    lastActivity: new Date("2026-01-31T14:15:00"),
    createdAt: new Date("2026-01-31T11:20:00"),
  },
  // BDM1 — CM has responded (demo state)
  {
    id: "ENQ-2411",
    buyerName: "Ramesh Industries",
    buyerPersonaId: PERSONA_BUYER_1,
    bdmPersonaId: PERSONA_BDM_1,
    state: "CM Responded",
    estimatedValue: 82000,
    categories: ["Steel"],
    memberIds: [
      generateMemberId("ENQ-2411", PERSONA_BDM_1),
      generateMemberId("ENQ-2411", PERSONA_CM_STEEL),
      generateMemberId("ENQ-2411", PERSONA_CX_1),
    ],
    unread: true,
    lastActivity: new Date("2026-02-06T15:10:00"),
    createdAt: new Date("2026-02-05T09:10:00"),
  },
  // BDM2 — CM has responded (demo state)
  {
    id: "ENQ-2412",
    buyerName: "TechnoSteel Corp",
    buyerPersonaId: PERSONA_BUYER_3,
    bdmPersonaId: PERSONA_BDM_2,
    state: "CM Responded",
    estimatedValue: 64000,
    categories: ["Polymer"],
    memberIds: [
      generateMemberId("ENQ-2412", PERSONA_BDM_2),
      generateMemberId("ENQ-2412", PERSONA_CM_POLYMER),
      generateMemberId("ENQ-2412", PERSONA_CX_1),
    ],
    unread: false,
    lastActivity: new Date("2026-02-06T12:40:00"),
    createdAt: new Date("2026-02-05T10:00:00"),
  },
  // BDM1 — CM has responded (demo state)
  {
    id: "ENQ-2413",
    buyerName: "Global Manufacturing Ltd",
    buyerPersonaId: PERSONA_BUYER_2,
    bdmPersonaId: PERSONA_BDM_1,
    state: "CM Responded",
    estimatedValue: 99000,
    categories: ["Cement"],
    memberIds: [
      generateMemberId("ENQ-2413", PERSONA_BDM_1),
      generateMemberId("ENQ-2413", PERSONA_CM_CEMENT),
      generateMemberId("ENQ-2413", PERSONA_CX_1),
    ],
    unread: true,
    lastActivity: new Date("2026-02-07T09:05:00"),
    createdAt: new Date("2026-02-05T13:30:00"),
  },
  // Draft intake request — mail queue (no assigned BDM yet)
  {
    id: "ENQ-2414",
    buyerName: "Ramesh Industries",
    buyerPersonaId: PERSONA_BUYER_1,
    state: "Draft",
    estimatedValue: 47000,
    categories: ["Steel"],
    memberIds: [
      generateMemberId("ENQ-2414", PERSONA_CM_STEEL),
      generateMemberId("ENQ-2414", PERSONA_CX_1),
    ],
    unread: true,
    lastActivity: new Date("2026-02-07T11:20:00"),
    createdAt: new Date("2026-02-07T10:00:00"),
  },
  // Draft intake request — WhatsApp queue (no assigned BDM yet)
  {
    id: "ENQ-2415",
    buyerName: "Global Manufacturing Ltd",
    buyerPersonaId: PERSONA_BUYER_2,
    state: "Draft",
    estimatedValue: 53000,
    categories: ["Cement"],
    memberIds: [
      generateMemberId("ENQ-2415", PERSONA_CM_CEMENT),
      generateMemberId("ENQ-2415", PERSONA_CX_1),
    ],
    unread: true,
    lastActivity: new Date("2026-02-07T12:10:00"),
    createdAt: new Date("2026-02-07T10:25:00"),
  },
  // Draft intake with BDM assigned but buyer still unknown (email/WhatsApp bot use case)
  {
    id: "ENQ-2416",
    buyerName: "",
    bdmPersonaId: PERSONA_BDM_1,
    state: "Draft",
    estimatedValue: 61000,
    categories: ["Steel"],
    memberIds: [
      generateMemberId("ENQ-2416", PERSONA_BDM_1),
      generateMemberId("ENQ-2416", PERSONA_CM_STEEL),
      generateMemberId("ENQ-2416", PERSONA_CX_1),
    ],
    unread: true,
    lastActivity: new Date("2026-02-07T13:20:00"),
    createdAt: new Date("2026-02-07T12:55:00"),
  },
];

export const MOCK_MESSAGES: Record<string, Record<string, Message[]>> = {
  "ENQ-2401": {
    internal: [
      {
        id: "enq2401-internal-1",
        type: "system",
        content: "Enquiry created for Ramesh Industries - TMT Bars requirement",
        timestamp: new Date("2026-01-30T10:30:00"),
      },
      {
        id: "enq2401-internal-2",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content:
          "@Priya - buyer shared a detailed chat update for Delhi Sector-18: they need around 200 MT of TMT 500D plus about 50 MT of 4-inch steel pipe, and they want dispatch staggered in two lots so their site can handle unloading without congestion. They also requested mill test certificates and QC docs before dispatch, and asked us to confirm unloading contact details one day before truck placement.",
        timestamp: new Date("2026-01-30T10:45:00"),
        mentions: [PERSONA_CM_STEEL],
      },
      {
        id: "enq2401-internal-3",
        type: "user",
        sender: "Priya Sharma",
        senderPersonaId: PERSONA_CM_STEEL,
        senderRole: "CM",
        content: "On it! I'll reach out to Tata Steel and JSW. Should have quotes by EOD.",
        timestamp: new Date("2026-01-30T10:50:00"),
      },
      {
        id: "enq2401-internal-4",
        type: "user",
        sender: "Priya Sharma",
        senderPersonaId: PERSONA_CM_STEEL,
        senderRole: "CM",
        content: "Got quotes back. TMT 500D is trending well - price has been stable. Also sourced the Steel Pipe 4 inch.",
        timestamp: new Date("2026-01-30T14:20:00"),
      },
      {
        id: "enq2401-internal-5",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "Great! Ramesh confirmed. They're sending PO/2024/001 for PO value ₹28,00,000",
        timestamp: new Date("2026-01-30T16:15:00"),
      },
      {
        id: "enq2401-internal-6",
        type: "user",
        sender: "Sneha Reddy",
        senderPersonaId: PERSONA_CX_1,
        senderRole: "CX",
        content: "Checking credit for PO/2024/001 - will update shortly",
        timestamp: new Date("2026-01-30T16:20:00"),
      },
    ],
    seller: [],
  },
  "ENQ-2402": {
    internal: [
      {
        id: "enq2402-internal-1",
        type: "system",
        content: "Enquiry created for Global Manufacturing Ltd — SS 316L pipes (mail RFQ)",
        timestamp: new Date("2026-01-31T09:00:00"),
      },
      {
        id: "enq2402-internal-2",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "@Meera — mail thread confirms seamless 4\" SCH40, third-party inspect OK. Need mill options today.",
        timestamp: new Date("2026-01-31T09:32:00"),
        mentions: [PERSONA_CM_POLYMER],
      },
      {
        id: "enq2402-internal-3",
        type: "user",
        sender: "Meera Iyer",
        senderPersonaId: PERSONA_CM_POLYMER,
        senderRole: "CM",
        content: "On it — Jindal and Ratnamani both have 316L ex-stock; I’ll share landed Bangalore numbers on the internal thread.",
        timestamp: new Date("2026-01-31T09:36:00"),
      },
    ],
    seller: [],
  },
  "ENQ-2403": {
    internal: [
      {
        id: "enq2403-internal-1",
        type: "system",
        content: "Enquiry created for TechnoSteel Corp — aluminum sheets (mail RFQ)",
        timestamp: new Date("2026-01-30T11:00:00"),
      },
      {
        id: "enq2403-internal-2",
        type: "user",
        sender: "Priya Singh",
        senderPersonaId: PERSONA_BDM_2,
        senderRole: "BDM",
        content: "@Meera — formal mail just landed: 1000 sqm aluminum 5mm, Mumbai site, 2-week gate. Can you confirm Hindalco vs Vedanta?",
        timestamp: new Date("2026-01-30T11:16:00"),
        mentions: [PERSONA_CM_POLYMER],
      },
      {
        id: "enq2403-internal-3",
        type: "user",
        sender: "Meera Iyer",
        senderPersonaId: PERSONA_CM_POLYMER,
        senderRole: "CM",
        content: "Yes — Hindalco can ex-Nagpur in 10 days; Vedanta needs 14. I’ll push MTC + coating spec on thread.",
        timestamp: new Date("2026-01-30T11:22:00"),
      },
    ],
    seller: [],
  },
  "ENQ-2404": {
    internal: [
      {
        id: "enq2404-internal-1",
        type: "system",
        content: "Enquiry created for Ramesh Industries — website form + BOQ upload (Chennai)",
        timestamp: new Date("2026-01-31T11:20:00"),
      },
      {
        id: "enq2404-internal-2",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "@Rajesh - Ramesh needs 500 units industrial steel pipes, Grade 304, 2-inch for Chennai.",
        timestamp: new Date("2026-01-31T11:26:00"),
        mentions: [PERSONA_CM_CEMENT],
      },
      {
        id: "enq2404-internal-3",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "Also adding 50 bags of Cement OPC 53 grade for the same project",
        timestamp: new Date("2026-01-31T11:30:00"),
      },
    ],
    seller: [],
  },
  "ENQ-2405": {
    internal: [
      {
        id: "enq2405-internal-1",
        type: "system",
        content: "Enquiry created for TechnoSteel Corp — Pune bundle (WhatsApp)",
        timestamp: new Date("2026-02-01T08:50:00"),
      },
      {
        id: "enq2405-internal-2",
        type: "user",
        sender: "Priya Singh",
        senderPersonaId: PERSONA_BDM_2,
        senderRole: "BDM",
        content:
          "@Priya Sharma @Rajesh Kumar - buyer has confirmed on chat that the Pune requirement should move as one combined package with structural sections and 200 bags of OPC 53 in a single coordinated drop. They need one consolidated quote with line-wise freight and GST breakup, and prefer dispatch in the Thu/Fri window because both their civil and fabrication teams will be available then.",
        timestamp: new Date("2026-02-01T08:52:00"),
        mentions: [PERSONA_CM_STEEL, PERSONA_CM_CEMENT],
      },
      {
        id: "enq2405-internal-3",
        type: "user",
        sender: "Priya Sharma",
        senderPersonaId: PERSONA_CM_STEEL,
        senderRole: "CM",
        content: "Steel portion locked with Rathi — I’ll share loadability once Rajesh confirms cement slot.",
        timestamp: new Date("2026-02-01T09:05:00"),
      },
    ],
    seller: [],
  },
  "ENQ-2406": {
    internal: [
      {
        id: "enq2406-internal-1",
        type: "system",
        content: "Enquiry created for Ramesh Industries — VG-30 bitumen (mail RFQ)",
        timestamp: new Date("2026-02-03T08:45:00"),
      },
      {
        id: "enq2406-internal-2",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "@Aditya — ENQ-2406:120 MT VG-30 for NHAI stretch near Jaipur, delivery from our west packer network.",
        timestamp: new Date("2026-02-03T08:52:00"),
        mentions: [PERSONA_CM_BITUMEN],
      },
      {
        id: "enq2406-internal-3",
        type: "user",
        sender: "Aditya Verma",
        senderPersonaId: PERSONA_CM_BITUMEN,
        senderRole: "CM",
        content: "Mapped to IOCL Mumbai refinery ex-tank + rail to site. Pushing pricing on the bitumen internal thread.",
        timestamp: new Date("2026-02-03T09:05:00"),
      },
    ],
    seller: [],
  },
  "ENQ-2407": {
    internal: [
      {
        id: "enq2407-internal-1",
        type: "system",
        content: "Enquiry created for Global Manufacturing — HDPE geomembrane (ENQ-2407)",
        timestamp: new Date("2026-02-03T09:50:00"),
      },
      {
        id: "enq2407-internal-2",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "@Meera — buyer needs 2mm HDPE liner, 8000 sqm, pond lining for chemical bund. Mail has permeability spec.",
        timestamp: new Date("2026-02-03T09:58:00"),
        mentions: [PERSONA_CM_POLYMER],
      },
      {
        id: "enq2407-internal-3",
        type: "user",
        sender: "Meera Iyer",
        senderPersonaId: PERSONA_CM_POLYMER,
        senderRole: "CM",
        content: "Reliance and GSE both qualify — I’ll anchor Reliance for MCLR traceability unless buyer insists on import.",
        timestamp: new Date("2026-02-03T10:08:00"),
      },
    ],
    seller: [],
  },
  "ENQ-2408": {
    internal: [
      {
        id: "enq2408-internal-1",
        type: "system",
        content: "Enquiry created for Ramesh Industries — OPC 43 Lucknow (WhatsApp)",
        timestamp: new Date("2026-02-03T10:20:00"),
      },
      {
        id: "enq2408-internal-2",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content:
          "@Rajesh - buyer confirmed through chat that ENQ-2408 is for 350 bags of OPC 43 at the Lucknow warehouse, and they need gate reporting within 48 hours of dispatch confirmation. They asked us to share LR and vehicle details before the truck leaves, coordinate gate entry with Neeraj, and ensure moisture-safe tarpaulin because evening rain is expected during unloading.",
        timestamp: new Date("2026-02-03T10:28:00"),
        mentions: [PERSONA_CM_CEMENT],
      },
      {
        id: "enq2408-internal-3",
        type: "user",
        sender: "Rajesh Kumar",
        senderPersonaId: PERSONA_CM_CEMENT,
        senderRole: "CM",
        content: "Pulling from our east packer — can hit47h if loading starts tonight.",
        timestamp: new Date("2026-02-03T10:40:00"),
      },
    ],
    seller: [],
  },
  "ENQ-2409": {
    internal: [
      {
        id: "enq2409-internal-1",
        type: "system",
        content: "Enquiry created for Global Manufacturing Ltd — CR steel coils (mail RFQ)",
        timestamp: new Date("2026-02-03T09:10:00"),
      },
      {
        id: "enq2409-internal-2",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content:
          "Draft ENQ-2409 — the buyer-facing mail thread (120 MT CR coils, Mumbai port, 3 lots) lives in Connect → Buyer → Global Manufacturing — Mail. Select messages there and share excerpts into this internal channel when ready.",
        timestamp: new Date("2026-02-04T09:45:00"),
        mentions: [PERSONA_CM_STEEL],
      },
      {
        id: "enq2409-internal-3",
        type: "user",
        sender: "Priya Sharma",
        senderPersonaId: PERSONA_CM_STEEL,
        senderRole: "CM",
        content:
          "Got it. I’ll wait for the forwarded mail highlights here before locking mill options and lot-wise dispatch assumptions.",
        timestamp: new Date("2026-02-04T09:52:00"),
      },
    ],
    seller: [],
  },
  "ENQ-2410": {
    internal: [
      {
        id: "enq2410-internal-1",
        type: "system",
        content: "Enquiry created for TechnoSteel Corp — polymer liners (WhatsApp RFQ)",
        timestamp: new Date("2026-02-03T10:40:00"),
      },
      {
        id: "enq2410-internal-2",
        type: "user",
        sender: "Priya Singh",
        senderPersonaId: PERSONA_BDM_2,
        senderRole: "BDM",
        content:
          "@Meera - buyer has accepted the final commercial terms for the polymer liner rolls and asked us to lock delivery for next week to their Chennai fabrication unit. They specifically requested QA documentation upfront, including COA and warranty sheets with dispatch papers, so we can proceed with ENQ-2410 conversion and order processing.",
        timestamp: new Date("2026-02-04T11:50:00"),
        mentions: [PERSONA_CM_POLYMER],
      },
      {
        id: "enq2410-internal-3",
        type: "user",
        sender: "Sneha Reddy",
        senderPersonaId: PERSONA_CX_1,
        senderRole: "CX",
        content: "All approval documents attached and validated. ENQ-2410 is now converted to order.",
        timestamp: new Date("2026-02-04T12:15:00"),
      },
    ],
    seller: [],
  },
  "ENQ-2411": {
    internal: [
      {
        id: "enq2411-internal-1",
        type: "system",
        content: "Enquiry created for Ramesh Industries — TMT 500D + steel pipe (QuickRFQ)",
        timestamp: new Date("2026-02-05T09:10:00"),
      },
      {
        id: "enq2411-internal-2",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content:
          "@Priya - buyer shared PO draft for ENQ-2411 (180 MT TMT 500D + 40 MT 4-inch steel pipe). Please send quotes with MTC/QC docs and confirm unloading contact details.",
        timestamp: new Date("2026-02-05T09:35:00"),
        mentions: [PERSONA_CM_STEEL],
      },
      {
        id: "enq2411-internal-3",
        type: "user",
        sender: "Priya Sharma",
        senderPersonaId: PERSONA_CM_STEEL,
        senderRole: "CM",
        content:
          "CM response submitted for ENQ-2411. Quotes are ready and QC/MTC documents are attached. Awaiting BDM mark as won.",
        timestamp: new Date("2026-02-06T15:10:00"),
      },
    ],
    seller: [],
  },
  "ENQ-2412": {
    internal: [
      {
        id: "enq2412-internal-1",
        type: "system",
        content: "Enquiry created for TechnoSteel Corp — polymer liners (QuickRFQ)",
        timestamp: new Date("2026-02-05T10:00:00"),
      },
      {
        id: "enq2412-internal-2",
        type: "user",
        sender: "Priya Singh",
        senderPersonaId: PERSONA_BDM_2,
        senderRole: "BDM",
        content:
          "@Meera - buyer confirmed liner specs for ENQ-2412 and asked us to lock commercial terms plus QA document delivery before dispatch.",
        timestamp: new Date("2026-02-05T10:22:00"),
        mentions: [PERSONA_CM_POLYMER],
      },
      {
        id: "enq2412-internal-3",
        type: "user",
        sender: "Meera Iyer",
        senderPersonaId: PERSONA_CM_POLYMER,
        senderRole: "CM",
        content:
          "CM responded for ENQ-2412: commercial quotes shared with QA document checklist. Awaiting BDM mark as won.",
        timestamp: new Date("2026-02-06T12:40:00"),
      },
    ],
    seller: [],
  },
  "ENQ-2413": {
    internal: [
      {
        id: "enq2413-internal-1",
        type: "system",
        content: "Enquiry created for Global Manufacturing Ltd — Cement OPC 53 (QuickRFQ)",
        timestamp: new Date("2026-02-05T13:30:00"),
      },
      {
        id: "enq2413-internal-2",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content:
          "@Rajesh - buyer confirmed ENQ-2413 requirement and requested line-wise freight + GST breakup in the CM quote.",
        timestamp: new Date("2026-02-05T13:55:00"),
        mentions: [PERSONA_CM_CEMENT],
      },
      {
        id: "enq2413-internal-3",
        type: "user",
        sender: "Rajesh Kumar",
        senderPersonaId: PERSONA_CM_CEMENT,
        senderRole: "CM",
        content:
          "CM response submitted for ENQ-2413. Quotes (incl. freight/GST breakup) are ready. Waiting for BDM mark as won.",
        timestamp: new Date("2026-02-07T09:05:00"),
      },
    ],
    seller: [],
  },
};

export const MOCK_SELLER_CHANNELS: Record<string, SellerChannel[]> = {
  "ENQ-2401": [],
  "ENQ-2402": [],
  "ENQ-2403": [],
  "ENQ-2404": [],
  "ENQ-2405": [],
  "ENQ-2406": [],
  "ENQ-2407": [],
  "ENQ-2408": [],
  "ENQ-2409": [],
  "ENQ-2410": [],
  "ENQ-2411": [],
  "ENQ-2412": [],
  "ENQ-2413": [],
};

export const MOCK_AUDIT_ENTRIES: Record<string, AuditEntry[]> = {
  "ENQ-2401": [
    {
      id: "audit-1",
      type: "system",
      timestamp: new Date("2026-01-30T10:30:00"),
      content: "Enquiry created for Ramesh Industries - Steel Plates requirement",
      actor: "Amit Kumar",
      actorRole: "BDM",
      channel: "internal",
    },
    {
      id: "audit-2",
      type: "system",
      timestamp: new Date("2026-01-30T10:30:05"),
      content: "CM Priya Sharma auto-assigned (North region - Delhi)",
      actor: "System",
      actorRole: "System",
      channel: "internal",
    },
    {
      id: "audit-3",
      type: "system",
      timestamp: new Date("2026-01-30T10:30:06"),
      content: "CX Sneha Reddy auto-assigned",
      actor: "System",
      actorRole: "System",
      channel: "internal",
    },
    {
      id: "audit-4",
      type: "message",
      timestamp: new Date("2026-01-30T10:32:00"),
      content: "Hey team, urgent client need for 50 tons IS 2062 E250 grade plates. Ramesh sir needs it by next week for their Faridabad facility.",
      actor: "Amit Kumar",
      actorRole: "BDM",
      channel: "internal",
    },
    {
      id: "audit-5",
      type: "message",
      timestamp: new Date("2026-01-30T11:15:00"),
      content: "Got it @Amit. Checking with our North suppliers. Steel Authority and JSW can likely fulfill this.",
      actor: "Priya Sharma",
      actorRole: "CM",
      channel: "internal",
    },
    {
      id: "audit-6",
      type: "state_change",
      timestamp: new Date("2026-01-30T14:20:00"),
      content: "Enquiry state changed to In Progress",
      actor: "Priya Sharma",
      actorRole: "CM",
      metadata: {
        field: "state",
        newValue: "In Progress",
      },
    },
    {
      id: "audit-7",
      type: "message",
      timestamp: new Date("2026-01-30T16:45:00"),
      content: "Quotes received from 3 suppliers. Steel Authority best price at ₹52,500/ton.",
      actor: "Priya Sharma",
      actorRole: "CM",
      channel: "internal",
    },
  ],
  "ENQ-2402": [
    {
      id: "audit-2402-1",
      type: "system",
      timestamp: new Date("2026-01-28T14:20:00"),
      content: "Enquiry created for Global Manufacturing Ltd - Aluminum Sheets",
      actor: "Amit Kumar",
      actorRole: "BDM",
      channel: "internal",
    },
    {
      id: "audit-2402-2",
      type: "system",
      timestamp: new Date("2026-01-28T14:20:05"),
      content: "CM Meera Iyer auto-assigned (South region - Bangalore)",
      actor: "System",
      actorRole: "System",
      channel: "internal",
    },
    {
      id: "audit-2402-3",
      type: "message",
      timestamp: new Date("2026-01-28T14:25:00"),
      content: "Need 5000 sheets of 6061-T6 aluminum, 2mm thickness for aerospace client in Bangalore.",
      actor: "Amit Kumar",
      actorRole: "BDM",
      channel: "internal",
    },
  ],
  "ENQ-2403": [
    {
      id: "audit-2403-1",
      type: "system",
      timestamp: new Date("2026-01-31T09:15:00"),
      content: "Enquiry created for Ramesh Industries - Copper Rods",
      actor: "Amit Kumar",
      actorRole: "BDM",
      channel: "internal",
    },
    {
      id: "audit-2403-2",
      type: "system",
      timestamp: new Date("2026-01-31T09:15:05"),
      content: "CM Priya Sharma auto-assigned (North region - Delhi)",
      actor: "System",
      actorRole: "System",
      channel: "internal",
    },
  ],
  "ENQ-2404": [
    {
      id: "audit-2404-1",
      type: "system",
      timestamp: new Date("2026-02-02T08:30:00"),
      content: "Enquiry created (Draft) - No buyer assigned yet",
      actor: "Amit Kumar",
      actorRole: "BDM",
      channel: "internal",
    },
  ],
  "ENQ-2405": [
    {
      id: "audit-2405-1",
      type: "system",
      timestamp: new Date("2026-02-01T08:50:00"),
      content: "Enquiry created for TechnoSteel Corp - Copper Wires",
      actor: "Priya Singh",
      actorRole: "BDM",
      channel: "internal",
    },
    {
      id: "audit-2405-2",
      type: "system",
      timestamp: new Date("2026-02-01T08:50:05"),
      content: "CM Aditya Verma auto-assigned (West region - Pune)",
      actor: "System",
      actorRole: "System",
      channel: "internal",
    },
  ],
  "ENQ-2411": [
    {
      id: "audit-2411-1",
      type: "system",
      timestamp: new Date("2026-02-05T09:10:00"),
      content: "Enquiry created for Ramesh Industries - Steel requirement",
      actor: "Amit Kumar",
      actorRole: "BDM",
      channel: "internal",
    },
    {
      id: "audit-2411-2",
      type: "system",
      timestamp: new Date("2026-02-05T09:10:05"),
      content: "CM Priya Sharma auto-assigned",
      actor: "System",
      actorRole: "System",
      channel: "internal",
    },
    {
      id: "audit-2411-3",
      type: "state_change",
      timestamp: new Date("2026-02-06T15:10:00"),
      content: "Enquiry state changed to CM Responded",
      actor: "Priya Sharma",
      actorRole: "CM",
      metadata: {
        field: "state",
        newValue: "CM Responded",
      },
    },
  ],
  "ENQ-2412": [
    {
      id: "audit-2412-1",
      type: "system",
      timestamp: new Date("2026-02-05T10:00:00"),
      content: "Enquiry created for TechnoSteel Corp - Polymer liners",
      actor: "Priya Singh",
      actorRole: "BDM",
      channel: "internal",
    },
    {
      id: "audit-2412-2",
      type: "system",
      timestamp: new Date("2026-02-05T10:00:05"),
      content: "CM Meera Iyer auto-assigned",
      actor: "System",
      actorRole: "System",
      channel: "internal",
    },
    {
      id: "audit-2412-3",
      type: "state_change",
      timestamp: new Date("2026-02-06T12:40:00"),
      content: "Enquiry state changed to CM Responded",
      actor: "Meera Iyer",
      actorRole: "CM",
      metadata: {
        field: "state",
        newValue: "CM Responded",
      },
    },
  ],
  "ENQ-2413": [
    {
      id: "audit-2413-1",
      type: "system",
      timestamp: new Date("2026-02-05T13:30:00"),
      content: "Enquiry created for Global Manufacturing Ltd - Cement requirement",
      actor: "Amit Kumar",
      actorRole: "BDM",
      channel: "internal",
    },
    {
      id: "audit-2413-2",
      type: "system",
      timestamp: new Date("2026-02-05T13:30:05"),
      content: "CM Rajesh Kumar auto-assigned",
      actor: "System",
      actorRole: "System",
      channel: "internal",
    },
    {
      id: "audit-2413-3",
      type: "state_change",
      timestamp: new Date("2026-02-07T09:05:00"),
      content: "Enquiry state changed to CM Responded",
      actor: "Rajesh Kumar",
      actorRole: "CM",
      metadata: {
        field: "state",
        newValue: "CM Responded",
      },
    },
  ],
};

/**
 * Buyer-BDM Direct Message Channels
 * Separate from enquiry channels - buyers chat directly with their BDM
 */
export const MOCK_BUYER_DM_CHANNELS: BuyerDMChannel[] = [
  // Ramesh Industries <-> Amit Kumar
  {
    id: generateBuyerDMId(PERSONA_BUYER_1),
    buyerPersonaId: PERSONA_BUYER_1,
    buyerName: "Ramesh Industries",
    bdmPersonaId: PERSONA_BDM_1,
    bdmName: "Amit Kumar",
    messages: [
      {
        id: "dm-b1-msg1",
        type: "user",
        sender: "Ramesh Patel",
        senderPersonaId: PERSONA_BUYER_1,
        senderRole: "Buyer",
        content: "Hi Amit, we need 200 MT of TMT bars, Grade Fe500D, for our construction project in Delhi.",
        timestamp: new Date("2026-01-30T10:35:00"),
      },
      {
        id: "dm-b1-msg2",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "Hello! Thank you for reaching out. Let me check with our team and get back to you with options.",
        timestamp: new Date("2026-01-30T10:40:00"),
      },
      {
        id: "dm-b1-msg3",
        type: "user",
        sender: "Ramesh Patel",
        senderPersonaId: PERSONA_BUYER_1,
        senderRole: "Buyer",
        content: "Also, we're planning another project - need 500 units of industrial steel pipes, Grade 304, 2-inch diameter for our Chennai facility.",
        timestamp: new Date("2026-01-31T11:20:00"),
      },
      {
        id: "dm-b1-msg4",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "Noted! I'll process both requirements separately and send you quotes within 24 hours.",
        timestamp: new Date("2026-01-31T11:25:00"),
      },
    ],
    unread: false,
    unreadCount: 0,
    unreadForBuyer: 0,
    unreadForBDM: 0,
    lastActivity: new Date("2026-01-31T11:25:00"),
  },
  
  // Global Manufacturing Ltd <-> Amit Kumar
  {
    id: generateBuyerDMId(PERSONA_BUYER_2),
    buyerPersonaId: PERSONA_BUYER_2,
    buyerName: "Global Manufacturing Ltd",
    bdmPersonaId: PERSONA_BDM_1,
    bdmName: "Amit Kumar",
    messages: [
      {
        id: "dm-b2-msg1",
        type: "user",
        sender: "Global Manufacturing Ltd",
        senderPersonaId: PERSONA_BUYER_2,
        senderRole: "Buyer",
        content: "Good morning Amit! Looking for industrial pipes, 4-inch diameter, stainless steel 316L. Quantity: 1000 meters. This is for our Bangalore plant.",
        timestamp: new Date("2026-01-31T09:20:00"),
      },
      {
        id: "dm-b2-msg2",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "Good morning! SS 316L is a specialized requirement. Let me connect with our sourcing team and I'll have a quote ready for you by end of day.",
        timestamp: new Date("2026-01-31T09:30:00"),
      },
    ],
    unread: false,
    unreadCount: 0,
    unreadForBuyer: 0,
    unreadForBDM: 0,
    lastActivity: new Date("2026-01-31T09:30:00"),
  },
  
  // TechnoSteel Corp <-> Priya Singh
  {
    id: generateBuyerDMId(PERSONA_BUYER_3),
    buyerPersonaId: PERSONA_BUYER_3,
    buyerName: "TechnoSteel Corp",
    bdmPersonaId: PERSONA_BDM_2,
    bdmName: "Priya Singh",
    messages: [
      {
        id: "dm-b3-msg1",
        type: "user",
        sender: "TechnoSteel Corp",
        senderPersonaId: PERSONA_BUYER_3,
        senderRole: "Buyer",
        content: "Hi Priya! Need urgent quote for aluminum sheets, 5mm thickness, 1000 sq meters for our Mumbai facility.",
        timestamp: new Date("2026-01-30T11:05:00"),
      },
      {
        id: "dm-b3-msg2",
        type: "user",
        sender: "Priya Singh",
        senderPersonaId: PERSONA_BDM_2,
        senderRole: "BDM",
        content: "Hi! I understand this is urgent. Let me fast-track this with our team. What's your deadline?",
        timestamp: new Date("2026-01-30T11:15:00"),
      },
      {
        id: "dm-b3-msg3",
        type: "user",
        sender: "TechnoSteel Corp",
        senderPersonaId: PERSONA_BUYER_3,
        senderRole: "Buyer",
        content: "We need delivery within 2 weeks. Can you manage that?",
        timestamp: new Date("2026-01-30T11:18:00"),
      },
      {
        id: "dm-b3-msg4",
        type: "user",
        sender: "Priya Singh",
        senderPersonaId: PERSONA_BDM_2,
        senderRole: "BDM",
        content: "Let me check with suppliers and get back to you within 2 hours.",
        timestamp: new Date("2026-01-30T11:20:00"),
      },
      {
        id: "dm-b3-msg5",
        type: "user",
        sender: "TechnoSteel Corp",
        senderPersonaId: PERSONA_BUYER_3,
        senderRole: "Buyer",
        content: "Also interested in bulk order of copper wires, specifications to follow. Location will be our Pune facility.",
        timestamp: new Date("2026-02-01T08:50:00"),
      },
    ],
    unread: false,
    unreadCount: 0,
    unreadForBuyer: 0,
    unreadForBDM: 0,
    lastActivity: new Date("2026-02-01T08:50:00"),
  },
];

/**
 * Seller Groups - NEW MODEL
 * CMs create groups with sellers (similar to buyer groups)
 * Sellers see all internal messages as "Birla Pivot"
 * Each group can have multiple CMs collaborating
 */
export const MOCK_SELLER_GROUPS: GroupChannel[] = [
  // Suresh Industries - General (with existing messages migrated)
  {
    id: "grp_seller_s1_general",
    name: "Suresh Industries - General",
    type: "seller",
    status: "active",
    memberIds: ["s_1", PERSONA_CM_STEEL, PERSONA_CM_POLYMER, PERSONA_CM_BITUMEN],
    memberPersonaIds: [PERSONA_SELLER_1, PERSONA_CM_STEEL, PERSONA_CM_POLYMER, PERSONA_CM_BITUMEN],
    messages: [
      {
        id: "seller-dm-s1-msg1",
        type: "user",
        sender: "Priya Sharma",
        senderPersonaId: PERSONA_CM_STEEL,
        senderRole: "CM",
        content: "Sharing the latest quote from Suresh Industries for review.",
        timestamp: new Date("2026-02-03T03:08:00"),
      },
      {
        id: "seller-dm-s1-msg2",
        type: "user",
        sender: "Meera Iyer",
        senderPersonaId: PERSONA_CM_POLYMER,
        senderRole: "CM",
        content: "Thanks. I’ll compare it against the other vendor options and update the thread.",
        timestamp: new Date("2026-02-03T03:08:00"),
      },
    ],
    sellerId: "s_1",
    sellerPersonaId: PERSONA_SELLER_1,
    createdBy: PERSONA_CM_STEEL,
    createdAt: new Date("2026-02-01T08:00:00"),
    lastActivity: new Date("2026-02-03T03:08:00"),
    unread: false,
    unreadCount: 0,
  },
  // Om Steel Traders - General
  {
    id: "grp_seller_s2_general",
    name: "Om Steel Traders - General",
    type: "seller",
    status: "active",
    memberIds: ["s_2", PERSONA_CM_STEEL],
    memberPersonaIds: [PERSONA_SELLER_2, PERSONA_CM_STEEL],
    messages: [],
    sellerId: "s_2",
    sellerPersonaId: PERSONA_SELLER_2,
    createdBy: PERSONA_CM_STEEL,
    createdAt: new Date("2026-02-01T08:00:00"),
    lastActivity: new Date("2026-02-01T08:00:00"),
    unread: false,
    unreadCount: 0,
  },
  // Rathi Metals - General
  {
    id: "grp_seller_s3_general",
    name: "Rathi Metals - General",
    type: "seller",
    status: "active",
    memberIds: ["s_3", PERSONA_CM_STEEL],
    memberPersonaIds: [PERSONA_SELLER_3, PERSONA_CM_STEEL],
    messages: [],
    sellerId: "s_3",
    sellerPersonaId: PERSONA_SELLER_3,
    createdBy: PERSONA_CM_STEEL,
    createdAt: new Date("2026-02-01T08:00:00"),
    lastActivity: new Date("2026-02-01T08:00:00"),
    unread: false,
    unreadCount: 0,
  },
  // Apex Alloys - General
  {
    id: "grp_seller_s4_general",
    name: "Apex Alloys - General",
    type: "seller",
    status: "active",
    memberIds: ["s_4", PERSONA_CM_STEEL],
    memberPersonaIds: [PERSONA_SELLER_4, PERSONA_CM_STEEL],
    messages: [],
    sellerId: "s_4",
    sellerPersonaId: PERSONA_SELLER_4,
    createdBy: PERSONA_CM_STEEL,
    createdAt: new Date("2026-02-01T08:00:00"),
    lastActivity: new Date("2026-02-01T08:00:00"),
    unread: false,
    unreadCount: 0,
  },
  // National Steel Corp - General
  {
    id: "grp_seller_s5_general",
    name: "National Steel Corp - General",
    type: "seller",
    status: "active",
    memberIds: ["s_5", PERSONA_CM_STEEL, PERSONA_CM_BITUMEN],
    memberPersonaIds: [PERSONA_SELLER_5, PERSONA_CM_STEEL, PERSONA_CM_BITUMEN],
    messages: [],
    sellerId: "s_5",
    sellerPersonaId: PERSONA_SELLER_5,
    createdBy: PERSONA_CM_STEEL,
    createdAt: new Date("2026-02-01T08:00:00"),
    lastActivity: new Date("2026-02-01T08:00:00"),
    unread: false,
    unreadCount: 0,
  },
];

/**
 * Buyer Groups - NEW MODEL
 * BDMs create groups with buyer contacts
 * Buyer contacts see all internal messages as "Birla Pivot"
 */
export const MOCK_BUYER_GROUPS: GroupChannel[] = [
  // Ramesh Industries - WhatsApp
  {
    id: "grp_buyer_b1_whatsapp",
    name: "Ramesh Industries - WhatsApp",
    type: "buyer",
    channelKind: "whatsapp",
    status: "active",
    memberIds: ["c_1", "c_2", PERSONA_BDM_1],
    memberPersonaIds: [PERSONA_BUYER_1, PERSONA_BDM_1],
    messages: [
      {
        id: "buyer-grp-b1-msg1",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "Hi Ramesh, welcome to the group. We'll coordinate all enquiry updates here.",
        timestamp: new Date("2026-02-02T09:00:00"),
      },
      {
        id: "buyer-grp-b1-msg2",
        type: "user",
        sender: "Ramesh Patel",
        senderPersonaId: PERSONA_BUYER_1,
        senderRole: "Buyer",
        content: "Thanks Amit! This is convenient. Can you share the latest quote for ENQ-2401?",
        timestamp: new Date("2026-02-02T09:15:00"),
      },
      {
        id: "buyer-grp-b1-msg-enq2408",
        type: "user",
        sender: "Ramesh Patel",
        senderPersonaId: PERSONA_BUYER_1,
        senderRole: "Buyer",
        content:
          "Hi Amit, sharing our Lucknow requirement in detail: we need 350 bags of OPC 43 at the warehouse before Friday close. Please confirm stock position, planned dispatch timing, and the vehicle details in advance so our gate manager can schedule unloading without delay.",
        timestamp: new Date("2026-02-03T10:25:00"),
      },
    ],
    buyerId: "buyer_1",
    buyerPersonaId: PERSONA_BUYER_1,
    createdBy: PERSONA_BDM_1,
    createdAt: new Date("2026-02-02T09:00:00"),
    lastActivity: new Date("2026-02-03T10:48:00"),
    unread: false,
    unreadCount: 0,
  },
  // Ramesh Industries - Mail
  {
    id: "grp_buyer_b1_mail",
    name: "Ramesh Industries - Mail",
    type: "buyer",
    channelKind: "mail",
    status: "active",
    memberIds: [PERSONA_BDM_1, PERSONA_BUYER_1],
    memberPersonaIds: [PERSONA_BDM_1, PERSONA_BUYER_1],
    messages: [],
    buyerId: "buyer_1",
    buyerPersonaId: PERSONA_BUYER_1,
    createdBy: PERSONA_BDM_1,
    createdAt: new Date("2026-02-02T09:05:00"),
    lastActivity: new Date("2026-02-02T09:05:00"),
    unread: false,
    unreadCount: 0,
  },
  // Global Manufacturing Ltd - General
  {
    id: "grp_buyer_b2_whatsapp",
    name: "Global Manufacturing - WhatsApp",
    type: "buyer",
    channelKind: "whatsapp",
    status: "active",
    memberIds: ["c_4", "c_5", PERSONA_BDM_1],
    memberPersonaIds: [PERSONA_BUYER_2, PERSONA_BDM_1],
    messages: [],
    buyerId: "buyer_2",
    buyerPersonaId: PERSONA_BUYER_2,
    createdBy: PERSONA_BDM_1,
    createdAt: new Date("2026-02-02T10:00:00"),
    lastActivity: new Date("2026-02-02T10:00:00"),
    unread: false,
    unreadCount: 0,
  },
  // Global Manufacturing Ltd - Mail
  {
    id: "grp_buyer_b2_mail",
    name: "Global Manufacturing - Mail",
    type: "buyer",
    channelKind: "mail",
    status: "active",
    memberIds: [PERSONA_BDM_1, PERSONA_BUYER_2],
    memberPersonaIds: [PERSONA_BDM_1, PERSONA_BUYER_2],
    messages: [],
    buyerId: "buyer_2",
    buyerPersonaId: PERSONA_BUYER_2,
    createdBy: PERSONA_BDM_1,
    createdAt: new Date("2026-02-02T10:05:00"),
    lastActivity: new Date("2026-02-02T10:05:00"),
    unread: false,
    unreadCount: 0,
  },
  // TechnoSteel Corp - WhatsApp
  {
    id: "grp_buyer_b3_whatsapp",
    name: "TechnoSteel Corp - WhatsApp",
    type: "buyer",
    channelKind: "whatsapp",
    status: "active",
    memberIds: ["c_6", "c_7", PERSONA_BDM_2],
    memberPersonaIds: [PERSONA_BUYER_3, PERSONA_BDM_2],
    messages: [
      {
        id: "buyer-grp-b3-msg1",
        type: "user",
        sender: "TechnoSteel Corp",
        senderPersonaId: PERSONA_BUYER_3,
        senderRole: "Buyer",
        content: "Need to coordinate on our current RFQ and delivery timeline here.",
        timestamp: new Date("2026-02-01T11:00:00"),
      },
      {
        id: "buyer-grp-b3-msg-enq2405",
        type: "user",
        sender: "TechnoSteel Corp",
        senderPersonaId: PERSONA_BUYER_3,
        senderRole: "Buyer",
        content:
          "Hi Priya, confirming the Pune package from our side as one coordinated delivery covering structural sections and 200 bags of OPC 53. Please share a combined commercial with freight breakup and confirm dispatch date, since our team is aligning both work fronts together at site.",
        timestamp: new Date("2026-02-02T11:35:00"),
      },
    ],
    buyerId: "buyer_3",
    buyerPersonaId: PERSONA_BUYER_3,
    createdBy: PERSONA_BDM_2,
    createdAt: new Date("2026-02-01T11:00:00"),
    lastActivity: new Date("2026-02-02T12:00:00"),
    unread: false,
    unreadCount: 0,
  },
  // TechnoSteel Corp - Mail
  {
    id: "grp_buyer_b3_mail",
    name: "TechnoSteel Corp - Mail",
    type: "buyer",
    channelKind: "mail",
    status: "active",
    memberIds: [PERSONA_BDM_2, PERSONA_BUYER_3],
    memberPersonaIds: [PERSONA_BDM_2, PERSONA_BUYER_3],
    messages: [],
    buyerId: "buyer_3",
    buyerPersonaId: PERSONA_BUYER_3,
    createdBy: PERSONA_BDM_2,
    createdAt: new Date("2026-02-01T11:05:00"),
    lastActivity: new Date("2026-02-01T11:05:00"),
    unread: false,
    unreadCount: 0,
  },
];

/**
 * DEPRECATED: Seller-CM Direct Message Channels
 * MIGRATION NOTE: These are being replaced by MOCK_SELLER_GROUPS
 * Keeping temporarily for reference during migration
 */
export const MOCK_SELLER_DM_CHANNELS: SellerDMChannel[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// THREADS + INTERNAL GROUPS (Slack-like model)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Internal Groups — only internal personas (BDM, CM, CX)
 * These are the primary workspace groups for internal coordination.
 */

// Shared thread definitions — threads tagged with enquiry IDs span groups
const THREAD_ENQ2401_INTERNAL: Thread = {
  id: "thread_enq2401_steel",
  groupId: "grp_internal_steel",
  rootMessageId: "int-steel-msg2", // The message that started this thread
  enquiryId: "ENQ-2401",
  title: "TMT 500D Sourcing",
  messages: [
    {
      id: "thread-2401-steel-r1",
      type: "user",
      sender: "Priya Sharma",
      senderPersonaId: PERSONA_CM_STEEL,
      senderRole: "CM",
      content: "Checked with Tata Steel — ₹52,500/ton for 200 MT TMT 500D. Delivery in 10 days.",
      timestamp: new Date("2026-01-30T15:00:00"),
    },
    {
      id: "thread-2401-steel-r2",
      type: "user",
      sender: "Amit Kumar",
      senderPersonaId: PERSONA_BDM_1,
      senderRole: "BDM",
      content: "That's competitive. Ramesh's budget is ₹55k/ton. Let's lock this in.",
      timestamp: new Date("2026-01-30T15:10:00"),
    },
    {
      id: "thread-2401-steel-r3",
      type: "user",
      sender: "Sneha Reddy",
      senderPersonaId: PERSONA_CX_1,
      senderRole: "CX",
      content: "Credit check cleared for Ramesh Industries. Here is the PO for validation.",
      timestamp: new Date("2026-01-30T16:30:00"),
      attachment: {
        name: "Purchase_Order_2401.pdf",
        type: "application/pdf",
        url: "https://www.adobe.com/support/products/enterprise/knowledgecenter/it/etla/sample_po.pdf",
        markAsPO: true,
      }
    },
    {
      id: "thread-2401-steel-r4",
      type: "user",
      sender: "Priya Sharma",
      senderPersonaId: PERSONA_CM_STEEL,
      senderRole: "CM",
      content:
        "@[Amit Kumar](p_bdm_1) @[Priya Sharma](p_cm_north) — Tata path is approved internally; please keep buyer thread aligned with ₹52.5k landed.",
      timestamp: new Date("2026-01-30T16:45:00"),
      mentions: [PERSONA_BDM_1, PERSONA_CM_STEEL],
    },
  ],
  replyCount: 4,
  lastReplyAt: new Date("2026-01-30T16:45:00"),
  participants: [PERSONA_CM_STEEL, PERSONA_BDM_1, PERSONA_CX_1],
  createdBy: PERSONA_CM_STEEL,
  createdAt: new Date("2026-01-30T15:00:00"),
  unread: true,
  unreadCount: 1,
};

const THREAD_ENQ2401_BUYER: Thread = {
  id: "thread_enq2401_buyer",
  groupId: "grp_buyer_b1_whatsapp",
  rootMessageId: "buyer-grp-b1-msg2", // "Can you share the latest quote for ENQ-2401?"
  enquiryId: "ENQ-2401",
  title: "Quote discussion",
  messages: [
    {
      id: "thread-2401-buyer-r1",
      type: "user",
      sender: "Amit Kumar",
      senderPersonaId: PERSONA_BDM_1,
      senderRole: "BDM",
      content: "Hi Ramesh, quote for TMT 500D: ₹54,000/ton for 200 MT. Includes delivery to Delhi site.",
      timestamp: new Date("2026-02-02T10:00:00"),
    },
    {
      id: "thread-2401-buyer-r2",
      type: "user",
      sender: "Ramesh Patel",
      senderPersonaId: PERSONA_BUYER_1,
      senderRole: "Buyer",
      content: "Can we get it down to ₹52,000? We've been quoted ₹53,000 by another supplier.",
      timestamp: new Date("2026-02-02T10:15:00"),
      mentions: [PERSONA_BDM_1, PERSONA_CM_STEEL],
    },
  ],
  replyCount: 2,
  lastReplyAt: new Date("2026-02-02T10:15:00"),
  participants: [PERSONA_BDM_1, PERSONA_BUYER_1],
  createdBy: PERSONA_BDM_1,
  createdAt: new Date("2026-02-02T10:00:00"),
  unread: true,
  unreadCount: 2,
};

const THREAD_ENQ2402_INTERNAL: Thread = {
  id: "thread_enq2402_poly",
  groupId: "grp_internal_polymer",
  rootMessageId: "int-poly-msg3",
  enquiryId: "ENQ-2402",
  title: "SS 316L — mills & inspection",
  messages: [
    {
      id: "thread-2402-poly-r1",
      type: "user",
      sender: "Meera Iyer",
      senderPersonaId: PERSONA_CM_POLYMER,
      senderRole: "CM",
      content: "Ratnamani quoted ₹318/m landed Bangalore incl. freight; PMI at their yard next Tue if buyer approves.",
      timestamp: new Date("2026-02-02T10:05:00"),
    },
    {
      id: "thread-2402-poly-r2",
      type: "user",
      sender: "Amit Kumar",
      senderPersonaId: PERSONA_BDM_1,
      senderRole: "BDM",
      content: "Buyer wants EN 10204 3.1 on the full lot. Can Ratnamani tag heat numbers to the line list we have from mail?",
      timestamp: new Date("2026-02-02T10:22:00"),
    },
    {
      id: "thread-2402-poly-r3",
      type: "user",
      sender: "Meera Iyer",
      senderPersonaId: PERSONA_CM_POLYMER,
      senderRole: "CM",
      content: "Yes — I’ve asked them to map heat numbers row-wise. Will paste the tracker in mail thread once QC confirms.",
      timestamp: new Date("2026-02-02T10:48:00"),
    },
    {
      id: "thread-2402-poly-r4",
      type: "user",
      sender: "Meera Iyer",
      senderPersonaId: PERSONA_CM_POLYMER,
      senderRole: "CM",
      content:
        "@[Amit Kumar](p_bdm_1) @[Meera Iyer](p_cm_south) — heat map v1 is on the drive; please confirm buyer sign-off window today.",
      timestamp: new Date("2026-02-02T11:05:00"),
      mentions: [PERSONA_BDM_1, PERSONA_CM_POLYMER],
    },
  ],
  replyCount: 4,
  lastReplyAt: new Date("2026-02-02T11:05:00"),
  participants: [PERSONA_CM_POLYMER, PERSONA_BDM_1, PERSONA_CX_1],
  createdBy: PERSONA_CM_POLYMER,
  createdAt: new Date("2026-02-02T10:05:00"),
  unread: true,
  unreadCount: 1,
};

const THREAD_ENQ2403_INTERNAL: Thread = {
  id: "thread_enq2403_poly",
  groupId: "grp_internal_polymer",
  rootMessageId: "int-poly-msg4",
  enquiryId: "ENQ-2403",
  title: "Aluminum 5mm — Mumbai gate",
  messages: [
    {
      id: "thread-2403-poly-r1",
      type: "user",
      sender: "Meera Iyer",
      senderPersonaId: PERSONA_CM_POLYMER,
      senderRole: "CM",
      content: "Hindalco can release 600 sqm this week + balance next; coating is stucco-embossed per mail spec.",
      timestamp: new Date("2026-02-02T09:18:00"),
    },
    {
      id: "thread-2403-poly-r2",
      type: "user",
      sender: "Priya Singh",
      senderPersonaId: PERSONA_BDM_2,
      senderRole: "BDM",
      content: "Buyer asked if we can split invoices60/40 for their capex buckets — CX okay with that?",
      timestamp: new Date("2026-02-02T09:28:00"),
      mentions: [PERSONA_CX_1],
    },
    {
      id: "thread-2403-poly-r3",
      type: "user",
      sender: "Sneha Reddy",
      senderPersonaId: PERSONA_CX_1,
      senderRole: "CX",
      content: "Yes, as long as PO references ENQ-2403 and GST matches the mail trail. I’ll note it on the file.",
      timestamp: new Date("2026-02-02T09:35:00"),
    },
    {
      id: "thread-2403-poly-r4",
      type: "user",
      sender: "Meera Iyer",
      senderPersonaId: PERSONA_CM_POLYMER,
      senderRole: "CM",
      content:
        "@[Priya Singh](p_bdm_2) @[Meera Iyer](p_cm_south) — split-invoice 60/40 is noted; I’ll align Hindalco dispatch with CX comment.",
      timestamp: new Date("2026-02-02T09:42:00"),
      mentions: [PERSONA_BDM_2, PERSONA_CM_POLYMER],
    },
  ],
  replyCount: 4,
  lastReplyAt: new Date("2026-02-02T09:42:00"),
  participants: [PERSONA_CM_POLYMER, PERSONA_BDM_2, PERSONA_CX_1],
  createdBy: PERSONA_CM_POLYMER,
  createdAt: new Date("2026-02-02T09:18:00"),
  unread: true,
  unreadCount: 1,
};

const THREAD_ENQ2405_INTERNAL: Thread = {
  id: "thread_enq2405_steel",
  groupId: "grp_internal_steel",
  rootMessageId: "int-steel-msg6",
  enquiryId: "ENQ-2405",
  title: "Pune — steel + cement bundle",
  messages: [
    {
      id: "thread-2405-steel-r1",
      type: "user",
      sender: "Rajesh Kumar",
      senderPersonaId: PERSONA_CM_CEMENT,
      senderRole: "CM",
      content: "OPC 53 from our east packer — ₹385/bag ex-works + Pune freight. Can align dispatch with Priya’s steel truck.",
      timestamp: new Date("2026-02-02T12:05:00"),
    },
    {
      id: "thread-2405-steel-r2",
      type: "user",
      sender: "Priya Sharma",
      senderPersonaId: PERSONA_CM_STEEL,
      senderRole: "CM",
      content: "Perfect — combined load24 MT + 200 bags. I’ll send one proforma so buyer signs once.",
      timestamp: new Date("2026-02-02T12:18:00"),
    },
    {
      id: "thread-2405-steel-r3",
      type: "user",
      sender: "Sneha Reddy",
      senderPersonaId: PERSONA_CX_1,
      senderRole: "CX",
      content: "Credit for TechnoSteel is green for this bundle value. WhatsApp confirmation is on file.",
      timestamp: new Date("2026-02-02T12:28:00"),
    },
    {
      id: "thread-2405-steel-r4",
      type: "user",
      sender: "Sneha Reddy",
      senderPersonaId: PERSONA_CX_1,
      senderRole: "CX",
      content:
        "@[Priya Singh](p_bdm_2) @[Priya Sharma](p_cm_north) @[Rajesh Kumar](p_cm_east) — please lock combined LR + gate pass pack for 10 Apr.",
      timestamp: new Date("2026-02-02T12:35:00"),
      mentions: [PERSONA_BDM_2, PERSONA_CM_STEEL, PERSONA_CM_CEMENT],
    },
  ],
  replyCount: 4,
  lastReplyAt: new Date("2026-02-02T12:35:00"),
  participants: [PERSONA_CM_CEMENT, PERSONA_CM_STEEL, PERSONA_CX_1],
  createdBy: PERSONA_CM_CEMENT,
  createdAt: new Date("2026-02-02T12:05:00"),
  unread: true,
  unreadCount: 1,
};

const THREAD_ENQ2405_BUYER: Thread = {
  id: "thread_enq2405_buyer_wa",
  groupId: "grp_buyer_b3_whatsapp",
  rootMessageId: "buyer-grp-b3-msg-enq2405",
  enquiryId: "ENQ-2405",
  title: "Pune shipment — steel + cement",
  messages: [
    {
      id: "thread-2405-wa-r1",
      type: "user",
      sender: "Priya Singh",
      senderPersonaId: PERSONA_BDM_2,
      senderRole: "BDM",
      content: "Hi team — attaching one combined proforma for ENQ-2405. Steel sections + 200 bags OPC 53, single Pune drop.",
      timestamp: new Date("2026-02-02T11:40:00"),
    },
    {
      id: "thread-2405-wa-r2",
      type: "user",
      sender: "TechnoSteel Corp",
      senderPersonaId: PERSONA_BUYER_3,
      senderRole: "Buyer",
      content: "Received. We can accept if delivery is before 12 Apr. Please confirm vehicle reporting time at our gate.",
      timestamp: new Date("2026-02-02T11:52:00"),
    },
    {
      id: "thread-2405-wa-r3",
      type: "user",
      sender: "Priya Singh",
      senderPersonaId: PERSONA_BDM_2,
      senderRole: "BDM",
      content: "Locked for 10 Apr AM. I’ll share LR and driver contact by 9 Apr EOD.",
      timestamp: new Date("2026-02-02T12:00:00"),
    },
    {
      id: "thread-2405-wa-r4",
      type: "user",
      sender: "TechnoSteel Corp",
      senderPersonaId: PERSONA_BUYER_3,
      senderRole: "Buyer",
      content:
        "@[Priya Singh](p_bdm_2) @[Priya Sharma](p_cm_north) — gate opens 08:00; please share vehicle reg by tonight.",
      timestamp: new Date("2026-02-02T12:08:00"),
      mentions: [PERSONA_BDM_2, PERSONA_CM_STEEL],
    },
  ],
  replyCount: 4,
  lastReplyAt: new Date("2026-02-02T12:08:00"),
  participants: [PERSONA_BDM_2, PERSONA_BUYER_3],
  createdBy: PERSONA_BDM_2,
  createdAt: new Date("2026-02-02T11:40:00"),
  unread: true,
  unreadCount: 1,
};

const THREAD_ENQ2404_INTERNAL: Thread = {
  id: "thread_enq2404_steel",
  groupId: "grp_internal_steel",
  rootMessageId: "int-steel-msg4", // Steel pipes message
  enquiryId: "ENQ-2404",
  title: "Website BOQ — Chennai line items",
  messages: [
    {
      id: "thread-2404-steel-r1",
      type: "user",
      sender: "Rajesh Kumar",
      senderPersonaId: PERSONA_CM_CEMENT,
      senderRole: "CM",
      content: "Parsed the website BOQ: Grade 304 pipes ₹1,200/unit for 500 nos; OPC 53 cement line matches 50-bag call-out. 2-week Chennai lead.",
      timestamp: new Date("2026-01-31T14:00:00"),
    },
    {
      id: "thread-2404-steel-r2",
      type: "user",
      sender: "Amit Kumar",
      senderPersonaId: PERSONA_BDM_1,
      senderRole: "BDM",
      content: "Good rate. Let me confirm with Ramesh and get back.",
      timestamp: new Date("2026-01-31T14:10:00"),
    },
    {
      id: "thread-2404-steel-r3",
      type: "user",
      sender: "Rajesh Kumar",
      senderPersonaId: PERSONA_CM_CEMENT,
      senderRole: "CM",
      content:
        "@[Amit Kumar](p_bdm_1) please confirm buyer acceptance so I can lock seller allocation today.",
      timestamp: new Date("2026-01-31T14:15:00"),
      mentions: [PERSONA_BDM_1],
    },
    {
      id: "thread-2404-steel-r4",
      type: "user",
      sender: "Amit Kumar",
      senderPersonaId: PERSONA_BDM_1,
      senderRole: "BDM",
      content: "@[Rajesh Kumar](p_cm_east) — Ramesh approved; you can lock allocation.",
      timestamp: new Date("2026-01-31T14:18:00"),
      mentions: [PERSONA_CM_CEMENT],
    },
  ],
  replyCount: 4,
  lastReplyAt: new Date("2026-01-31T14:18:00"),
  participants: [PERSONA_CM_CEMENT, PERSONA_BDM_1, PERSONA_CX_1],
  createdBy: PERSONA_CM_CEMENT,
  createdAt: new Date("2026-01-31T14:00:00"),
  unread: true,
  unreadCount: 1,
};

const THREAD_ENQ2401_SELLER: Thread = {
  id: "thread_enq2401_seller_s1",
  groupId: "grp_seller_s1_general",
  rootMessageId: "seller-dm-s1-msg1",
  enquiryId: "ENQ-2401",
  title: "TMT 500D pricing",
  messages: [
    {
      id: "thread-2401-s1-r1",
      type: "user",
      sender: "Suresh Patil",
      senderPersonaId: PERSONA_SELLER_1,
      senderRole: "Seller",
      content: "We can offer TMT 500D at ₹51,800/ton for 200 MT. Attaching formal quote.",
      timestamp: new Date("2026-02-03T09:00:00"),
      attachment: {
        name: "Suresh_Industries_Quote_2401.pdf",
        type: "application/pdf",
        url: "https://www.adobe.com/support/products/enterprise/knowledgecenter/it/etla/sample_po.pdf",
      }
    },
    {
      id: "thread-2401-s1-r2",
      type: "user",
      sender: "Priya Sharma",
      senderPersonaId: PERSONA_CM_STEEL,
      senderRole: "CM",
      content: "Competitive price. Can you do ₹51,000 if we commit to 300 MT across 2 orders?",
      timestamp: new Date("2026-02-03T09:15:00"),
    },
  ],
  replyCount: 2,
  lastReplyAt: new Date("2026-02-03T09:15:00"),
  participants: [PERSONA_SELLER_1, PERSONA_CM_STEEL],
  createdBy: PERSONA_SELLER_1,
  createdAt: new Date("2026-02-03T09:00:00"),
  unread: true,
  unreadCount: 1,
};

const THREAD_ENQ2406_BITUMEN: Thread = {
  id: "thread_enq2406_bitumen",
  groupId: "grp_internal_bitumen",
  rootMessageId: "int-bitumen-msg2",
  enquiryId: "ENQ-2406",
  title: "VG-30 — refinery + rail",
  messages: [
    {
      id: "thread-2406-bit-r1",
      type: "user",
      sender: "Aditya Verma",
      senderPersonaId: PERSONA_CM_BITUMEN,
      senderRole: "CM",
      content: "IOCL Mumbai ex-tank @ ₹48.2/kg; rail to Jaipur siding adds ₹1.1/kg. Sharing draft COA.",
      timestamp: new Date("2026-02-03T09:12:00"),
    },
    {
      id: "thread-2406-bit-r2",
      type: "user",
      sender: "Amit Kumar",
      senderPersonaId: PERSONA_BDM_1,
      senderRole: "BDM",
      content: "Buyer will take it if we guarantee spray temp window155–165°C — can IOCL note that on dispatch advice?",
      timestamp: new Date("2026-02-03T09:22:00"),
    },
    {
      id: "thread-2406-bit-r3",
      type: "user",
      sender: "Aditya Verma",
      senderPersonaId: PERSONA_CM_BITUMEN,
      senderRole: "CM",
      content:
        "@[Amit Kumar](p_bdm_1) @[Aditya Verma](p_cm_west) — IOCL will stamp spray band on advice; sharing revised draft COA.",
      timestamp: new Date("2026-02-03T09:28:00"),
      mentions: [PERSONA_BDM_1, PERSONA_CM_BITUMEN],
    },
  ],
  replyCount: 3,
  lastReplyAt: new Date("2026-02-03T09:28:00"),
  participants: [PERSONA_CM_BITUMEN, PERSONA_BDM_1, PERSONA_CX_1],
  createdBy: PERSONA_CM_BITUMEN,
  createdAt: new Date("2026-02-03T09:12:00"),
  unread: true,
  unreadCount: 1,
};

const THREAD_ENQ2407_POLY: Thread = {
  id: "thread_enq2407_poly",
  groupId: "grp_internal_polymer",
  rootMessageId: "int-poly-msg5",
  enquiryId: "ENQ-2407",
  title: "HDPE geomembrane — mill shortlist",
  messages: [
    {
      id: "thread-2407-poly-r1",
      type: "user",
      sender: "Meera Iyer",
      senderPersonaId: PERSONA_CM_POLYMER,
      senderRole: "CM",
      content: "Reliance 2mm meets permeability; welder kit + trial strip included. GSE is backup if Reliance slips on dates.",
      timestamp: new Date("2026-02-03T10:02:00"),
    },
    {
      id: "thread-2407-poly-r2",
      type: "user",
      sender: "Amit Kumar",
      senderPersonaId: PERSONA_BDM_1,
      senderRole: "BDM",
      content: "Buyer wants installation supervision for first500 sqm — can we bundle a2-day tech visit?",
      timestamp: new Date("2026-02-03T10:10:00"),
    },
    {
      id: "thread-2407-poly-r3",
      type: "user",
      sender: "Meera Iyer",
      senderPersonaId: PERSONA_CM_POLYMER,
      senderRole: "CM",
      content:
        "@[Amit Kumar](p_bdm_1) @[Meera Iyer](p_cm_south) — 2-day tech visit bundled in Reliance quote; buyer mail updated.",
      timestamp: new Date("2026-02-03T10:18:00"),
      mentions: [PERSONA_BDM_1, PERSONA_CM_POLYMER],
    },
  ],
  replyCount: 3,
  lastReplyAt: new Date("2026-02-03T10:18:00"),
  participants: [PERSONA_CM_POLYMER, PERSONA_BDM_1, PERSONA_CX_1],
  createdBy: PERSONA_CM_POLYMER,
  createdAt: new Date("2026-02-03T10:02:00"),
  unread: true,
  unreadCount: 1,
};

const THREAD_ENQ2408_STEEL: Thread = {
  id: "thread_enq2408_steel",
  groupId: "grp_internal_steel",
  rootMessageId: "int-steel-msg7",
  enquiryId: "ENQ-2408",
  title: "OPC 43 — Lucknow gate",
  messages: [
    {
      id: "thread-2408-steel-r1",
      type: "user",
      sender: "Rajesh Kumar",
      senderPersonaId: PERSONA_CM_CEMENT,
      senderRole: "CM",
      content: "Truck loaded22:30 — LR BP-LKW-9081. Gate ETA tomorrow 14:00 Lucknow warehouse.",
      timestamp: new Date("2026-02-03T10:55:00"),
    },
    {
      id: "thread-2408-steel-r2",
      type: "user",
      sender: "Rajesh Kumar",
      senderPersonaId: PERSONA_CM_CEMENT,
      senderRole: "CM",
      content: "@[Amit Kumar](p_bdm_1) — buyer confirmed Neeraj as gate contact; please share LR photo on WhatsApp before departure.",
      timestamp: new Date("2026-02-03T11:00:00"),
      mentions: [PERSONA_BDM_1],
    },
    {
      id: "thread-2408-steel-r3",
      type: "user",
      sender: "Amit Kumar",
      senderPersonaId: PERSONA_BDM_1,
      senderRole: "BDM",
      content: "@[Rajesh Kumar](p_cm_east) — copy; I’ll push Neeraj’s number on the buyer thread now.",
      timestamp: new Date("2026-02-03T11:02:00"),
      mentions: [PERSONA_CM_CEMENT],
    },
  ],
  replyCount: 3,
  lastReplyAt: new Date("2026-02-03T11:02:00"),
  participants: [PERSONA_CM_CEMENT, PERSONA_BDM_1, PERSONA_CX_1],
  createdBy: PERSONA_CM_CEMENT,
  createdAt: new Date("2026-02-03T10:45:00"),
  unread: true,
  unreadCount: 1,
};

const THREAD_ENQ2409_STEEL: Thread = {
  id: "thread_enq2409_steel",
  groupId: "grp_internal_steel",
  rootMessageId: "int-steel-msg8",
  enquiryId: "ENQ-2409",
  title: "CR coils — draft mail intake",
  messages: [
    {
      id: "thread-2409-steel-r1",
      type: "user",
      sender: "Priya Sharma",
      senderPersonaId: PERSONA_CM_STEEL,
      senderRole: "CM",
      content:
        "For ENQ-2409 I’ll need the forwarded buyer mail excerpts before I shortlist mills — especially heat-trace and slit edge assumptions for 1.2mm CR.",
      timestamp: new Date("2026-02-04T10:12:00"),
    },
    {
      id: "thread-2409-steel-r2",
      type: "user",
      sender: "Amit Kumar",
      senderPersonaId: PERSONA_BDM_1,
      senderRole: "BDM",
      content:
        "Understood — full trail is still on Global Manufacturing — Mail only. I’ll share selected messages here once we align on what the buyer wants quoted first.",
      timestamp: new Date("2026-02-04T10:18:00"),
    },
    {
      id: "thread-2409-steel-r3",
      type: "user",
      sender: "Sneha Reddy",
      senderPersonaId: PERSONA_CX_1,
      senderRole: "CX",
      content:
        "Credit posture for Global Manufacturing is fine for a draft RFQ pass — flag me when commercial crosses negotiation thresholds.",
      timestamp: new Date("2026-02-04T10:22:00"),
    },
  ],
  replyCount: 3,
  lastReplyAt: new Date("2026-02-04T10:22:00"),
  participants: [PERSONA_CM_STEEL, PERSONA_BDM_1, PERSONA_CX_1],
  createdBy: PERSONA_CM_STEEL,
  createdAt: new Date("2026-02-04T10:12:00"),
  unread: true,
  unreadCount: 1,
};

const THREAD_ENQ2408_BUYER: Thread = {
  id: "thread_enq2408_buyer_wa",
  groupId: "grp_buyer_b1_whatsapp",
  rootMessageId: "buyer-grp-b1-msg-enq2408",
  enquiryId: "ENQ-2408",
  title: "Lucknow — OPC 43 WhatsApp",
  messages: [
    {
      id: "thread-2408-wa-r1",
      type: "user",
      sender: "Amit Kumar",
      senderPersonaId: PERSONA_BDM_1,
      senderRole: "BDM",
      content: "Ramesh — ENQ-2408: ₹382/bag landed Lucknow, 350 bags OPC 43. Confirm gate pass contact?",
      timestamp: new Date("2026-02-03T10:42:00"),
    },
    {
      id: "thread-2408-wa-r2",
      type: "user",
      sender: "Ramesh Patel",
      senderPersonaId: PERSONA_BUYER_1,
      senderRole: "Buyer",
      content: "Use warehouse manager Neeraj — I’ll WhatsApp his number. Need delivery before Friday EOD.",
      timestamp: new Date("2026-02-03T10:48:00"),
    },
    {
      id: "thread-2408-wa-r3",
      type: "user",
      sender: "Ramesh Patel",
      senderPersonaId: PERSONA_BUYER_1,
      senderRole: "Buyer",
      content:
        "@[Amit Kumar](p_bdm_1) @[Rajesh Kumar](p_cm_east) — Neeraj expects LR photo on WhatsApp before truck leaves plant.",
      timestamp: new Date("2026-02-03T10:52:00"),
      mentions: [PERSONA_BDM_1, PERSONA_CM_CEMENT],
    },
  ],
  replyCount: 3,
  lastReplyAt: new Date("2026-02-03T10:52:00"),
  participants: [PERSONA_BDM_1, PERSONA_BUYER_1],
  createdBy: PERSONA_BDM_1,
  createdAt: new Date("2026-02-03T10:42:00"),
  unread: true,
  unreadCount: 1,
};

const THREAD_ENQ2411_INTERNAL: Thread = {
  id: "thread_enq2411_steel",
  groupId: "grp_internal_steel",
  rootMessageId: "int-steel-msg-enq2411",
  enquiryId: "ENQ-2411",
  title: "Steel quote shared",
  messages: [
    {
      id: "thread-2411-steel-r1",
      type: "user",
      sender: "Priya Sharma",
      senderPersonaId: PERSONA_CM_STEEL,
      senderRole: "CM",
      content: "JSW and Tata quotes are ready for ENQ-2411. Best landed option is within buyer budget and MTC/QC docs are attached.",
      timestamp: new Date("2026-02-06T14:42:00"),
    },
    {
      id: "thread-2411-steel-r2",
      type: "user",
      sender: "Amit Kumar",
      senderPersonaId: PERSONA_BDM_1,
      senderRole: "BDM",
      content: "Perfect. I’ll align with Ramesh and move this to won once he confirms dispatch window.",
      timestamp: new Date("2026-02-06T14:55:00"),
    },
    {
      id: "thread-2411-steel-r3",
      type: "user",
      sender: "Priya Sharma",
      senderPersonaId: PERSONA_CM_STEEL,
      senderRole: "CM",
      content: "@[Amit Kumar](p_bdm_1) — marking ENQ-2411 as CM Responded from sourcing side.",
      timestamp: new Date("2026-02-06T15:10:00"),
      mentions: [PERSONA_BDM_1],
    },
  ],
  replyCount: 3,
  lastReplyAt: new Date("2026-02-06T15:10:00"),
  participants: [PERSONA_CM_STEEL, PERSONA_BDM_1],
  createdBy: PERSONA_CM_STEEL,
  createdAt: new Date("2026-02-06T14:42:00"),
  unread: true,
  unreadCount: 1,
};

const THREAD_ENQ2412_INTERNAL: Thread = {
  id: "thread_enq2412_poly",
  groupId: "grp_internal_polymer",
  rootMessageId: "int-poly-msg-enq2412",
  enquiryId: "ENQ-2412",
  title: "Polymer quote shared",
  messages: [
    {
      id: "thread-2412-poly-r1",
      type: "user",
      sender: "Meera Iyer",
      senderPersonaId: PERSONA_CM_POLYMER,
      senderRole: "CM",
      content: "Commercial sheet + QA checklist for ENQ-2412 are ready. Reliance lead time works for the buyer’s requested dispatch window.",
      timestamp: new Date("2026-02-06T12:22:00"),
    },
    {
      id: "thread-2412-poly-r2",
      type: "user",
      sender: "Priya Singh",
      senderPersonaId: PERSONA_BDM_2,
      senderRole: "BDM",
      content: "Good. I’ll share final pricing in the buyer thread and wait for order confirmation.",
      timestamp: new Date("2026-02-06T12:30:00"),
    },
    {
      id: "thread-2412-poly-r3",
      type: "user",
      sender: "Meera Iyer",
      senderPersonaId: PERSONA_CM_POLYMER,
      senderRole: "CM",
      content: "@[Priya Singh](p_bdm_2) — ENQ-2412 can be treated as CM Responded.",
      timestamp: new Date("2026-02-06T12:40:00"),
      mentions: [PERSONA_BDM_2],
    },
  ],
  replyCount: 3,
  lastReplyAt: new Date("2026-02-06T12:40:00"),
  participants: [PERSONA_CM_POLYMER, PERSONA_BDM_2],
  createdBy: PERSONA_CM_POLYMER,
  createdAt: new Date("2026-02-06T12:22:00"),
  unread: false,
  unreadCount: 0,
};

const THREAD_ENQ2413_INTERNAL: Thread = {
  id: "thread_enq2413_steel",
  groupId: "grp_internal_steel",
  rootMessageId: "int-steel-msg-enq2413",
  enquiryId: "ENQ-2413",
  title: "Cement quote shared",
  messages: [
    {
      id: "thread-2413-steel-r1",
      type: "user",
      sender: "Rajesh Kumar",
      senderPersonaId: PERSONA_CM_CEMENT,
      senderRole: "CM",
      content: "Line-wise freight + GST breakup for ENQ-2413 is ready. East packer can load against buyer’s preferred schedule.",
      timestamp: new Date("2026-02-07T08:42:00"),
    },
    {
      id: "thread-2413-steel-r2",
      type: "user",
      sender: "Amit Kumar",
      senderPersonaId: PERSONA_BDM_1,
      senderRole: "BDM",
      content: "Looks good. I’ll close buyer confirmation next and then mark won.",
      timestamp: new Date("2026-02-07T08:55:00"),
    },
    {
      id: "thread-2413-steel-r3",
      type: "user",
      sender: "Rajesh Kumar",
      senderPersonaId: PERSONA_CM_CEMENT,
      senderRole: "CM",
      content: "@[Amit Kumar](p_bdm_1) — ENQ-2413 is ready from CM side and can remain in CM Responded until buyer closes.",
      timestamp: new Date("2026-02-07T09:05:00"),
      mentions: [PERSONA_BDM_1],
    },
  ],
  replyCount: 3,
  lastReplyAt: new Date("2026-02-07T09:05:00"),
  participants: [PERSONA_CM_CEMENT, PERSONA_BDM_1],
  createdBy: PERSONA_CM_CEMENT,
  createdAt: new Date("2026-02-07T08:42:00"),
  unread: true,
  unreadCount: 1,
};

const THREAD_ENQ2411_BUYER: Thread = {
  id: "thread_enq2411_buyer_wa",
  groupId: "grp_buyer_b1_whatsapp",
  rootMessageId: "buyer-grp-b1-msg-enq2411",
  enquiryId: "ENQ-2411",
  title: "Steel quote follow-up",
  messages: [
    {
      id: "thread-2411-wa-r1",
      type: "user",
      sender: "Amit Kumar",
      senderPersonaId: PERSONA_BDM_1,
      senderRole: "BDM",
      content: "Sharing ENQ-2411 quote now. Best option is ready with QC docs and two dispatch windows.",
      timestamp: new Date("2026-02-06T14:48:00"),
    },
    {
      id: "thread-2411-wa-r2",
      type: "user",
      sender: "Ramesh Patel",
      senderPersonaId: PERSONA_BUYER_1,
      senderRole: "Buyer",
      content: "Received. Let me close internally and revert on final dispatch preference.",
      timestamp: new Date("2026-02-06T15:02:00"),
    },
  ],
  replyCount: 2,
  lastReplyAt: new Date("2026-02-06T15:02:00"),
  participants: [PERSONA_BDM_1, PERSONA_BUYER_1],
  createdBy: PERSONA_BDM_1,
  createdAt: new Date("2026-02-06T14:48:00"),
  unread: false,
  unreadCount: 0,
};

const THREAD_ENQ2412_BUYER: Thread = {
  id: "thread_enq2412_buyer_wa",
  groupId: "grp_buyer_b3_whatsapp",
  rootMessageId: "buyer-grp-b3-msg-enq2412",
  enquiryId: "ENQ-2412",
  title: "Polymer pricing follow-up",
  messages: [
    {
      id: "thread-2412-wa-r1",
      type: "user",
      sender: "Priya Singh",
      senderPersonaId: PERSONA_BDM_2,
      senderRole: "BDM",
      content: "ENQ-2412 pricing and QA checklist shared. Please confirm if we should hold dispatch for next week.",
      timestamp: new Date("2026-02-06T12:25:00"),
    },
    {
      id: "thread-2412-wa-r2",
      type: "user",
      sender: "TechnoSteel Corp",
      senderPersonaId: PERSONA_BUYER_3,
      senderRole: "Buyer",
      content: "Looks aligned. We’ll confirm final release after internal approval.",
      timestamp: new Date("2026-02-06T12:34:00"),
    },
  ],
  replyCount: 2,
  lastReplyAt: new Date("2026-02-06T12:34:00"),
  participants: [PERSONA_BDM_2, PERSONA_BUYER_3],
  createdBy: PERSONA_BDM_2,
  createdAt: new Date("2026-02-06T12:25:00"),
  unread: false,
  unreadCount: 0,
};

const THREAD_ENQ2413_BUYER: Thread = {
  id: "thread_enq2413_buyer_mail",
  groupId: "grp_buyer_b2_mail",
  rootMessageId: "buyer-mail-b2-msg-enq2413",
  enquiryId: "ENQ-2413",
  title: "Mail — cement commercial",
  messages: [
    {
      id: "thread-2413-mail-r1",
      type: "user",
      sender: "Amit Kumar",
      senderPersonaId: PERSONA_BDM_1,
      senderRole: "BDM",
      content: "Sharing the line-wise freight and GST commercial for ENQ-2413 as requested.",
      timestamp: new Date("2026-02-07T08:50:00"),
    },
    {
      id: "thread-2413-mail-r2",
      type: "user",
      sender: "Global Manufacturing Ltd",
      senderPersonaId: PERSONA_BUYER_2,
      senderRole: "Buyer",
      content: "Received. Team is reviewing the commercial and expected dispatch cadence.",
      timestamp: new Date("2026-02-07T09:00:00"),
    },
  ],
  replyCount: 2,
  lastReplyAt: new Date("2026-02-07T09:00:00"),
  participants: [PERSONA_BDM_1, PERSONA_BUYER_2],
  createdBy: PERSONA_BDM_1,
  createdAt: new Date("2026-02-07T08:50:00"),
  unread: false,
  unreadCount: 0,
};

export const MOCK_INTERNAL_GROUPS: GroupChannel[] = [
  // Steel Internal — Primary workspace for steel category
  {
    id: "grp_internal_steel",
    name: "Steel Internal",
    type: "custom",
    status: "active",
    memberIds: [PERSONA_BDM_1, PERSONA_BDM_2, PERSONA_CM_STEEL, PERSONA_CM_CEMENT, PERSONA_CX_1],
    memberPersonaIds: [PERSONA_BDM_1, PERSONA_BDM_2, PERSONA_CM_STEEL, PERSONA_CM_CEMENT, PERSONA_CX_1],
    messages: [
      {
        id: "int-steel-msg1",
        type: "system",
        content: "Group created for Steel category coordination",
        timestamp: new Date("2026-01-28T09:00:00"),
      },
      {
        id: "int-steel-msg2",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "New requirement from Ramesh Industries — 200 MT TMT 500D for Delhi. @Priya can you source?",
        timestamp: new Date("2026-01-30T10:45:00"),
        mentions: [PERSONA_CM_STEEL],
        // Thread indicators (pre-populated for mock data)
        threadId: "thread_enq2401_steel",
        replyCount: 4,
        lastReplyAt: new Date("2026-01-30T16:45:00"),
        threadParticipants: [PERSONA_CM_STEEL, PERSONA_BDM_1, PERSONA_CX_1],
      },
      {
        id: "int-steel-msg3",
        type: "user",
        sender: "Priya Sharma",
        senderPersonaId: PERSONA_CM_STEEL,
        senderRole: "CM",
        content: "Steel market update: TMT prices stable at ₹52-54k/ton. Good window for bulk orders.",
        timestamp: new Date("2026-01-31T09:00:00"),
      },
      {
        id: "int-steel-msg4",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "Website intake ENQ-2404 from Ramesh — Chennai BOQ: 500× Grade 304 pipes + 50 bags OPC 53. @Rajesh please validate against uploaded xlsx.",
        timestamp: new Date("2026-01-31T11:30:00"),
        mentions: [PERSONA_CM_CEMENT],
        // Thread indicators
        threadId: "thread_enq2404_steel",
        replyCount: 4,
        lastReplyAt: new Date("2026-01-31T14:18:00"),
        threadParticipants: [PERSONA_CM_CEMENT, PERSONA_BDM_1, PERSONA_CX_1],
      },
      {
        id: "int-steel-msg5",
        type: "user",
        sender: "Sneha Reddy",
        senderPersonaId: PERSONA_CX_1,
        senderRole: "CX",
        content: "Reminder: Credit limits updated for Q1. Ramesh Industries limit is now ₹50L.",
        timestamp: new Date("2026-02-01T10:00:00"),
      },
      {
        id: "int-steel-msg6",
        type: "user",
        sender: "Priya Singh",
        senderPersonaId: PERSONA_BDM_2,
        senderRole: "BDM",
        content:
          "TechnoSteel has confirmed in chat that ENQ-2405 should move as one Pune bundle with structural sections and 200 bags of OPC 53. @Priya Sharma @Rajesh Kumar please align a single coordinated dispatch plan with one commercial sheet and shared delivery timeline.",
        timestamp: new Date("2026-02-02T11:55:00"),
        mentions: [PERSONA_CM_STEEL, PERSONA_CM_CEMENT],
        threadId: "thread_enq2405_steel",
        replyCount: 4,
        lastReplyAt: new Date("2026-02-02T12:35:00"),
        threadParticipants: [PERSONA_CM_CEMENT, PERSONA_CM_STEEL, PERSONA_CX_1],
      },
      {
        id: "int-steel-msg7",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content:
          "Buyer chat trail for ENQ-2408 confirms 350 bags of OPC 43 for the Lucknow warehouse with a strict 48-hour gate window from dispatch confirmation. @Rajesh please confirm packer allocation, LR readiness, and truck dispatch timeline by tonight so we can keep buyer coordination smooth.",
        timestamp: new Date("2026-02-03T10:35:00"),
        mentions: [PERSONA_CM_CEMENT],
        threadId: "thread_enq2408_steel",
        replyCount: 3,
        lastReplyAt: new Date("2026-02-03T11:02:00"),
        threadParticipants: [PERSONA_CM_CEMENT, PERSONA_BDM_1, PERSONA_CX_1],
      },
      {
        id: "int-steel-msg8",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content:
          "ENQ-2409 (Draft): buyer mail for 120 MT CR coils / Mumbai port is in Global Manufacturing — Mail under Connect. @Priya — pick up sourcing once I share selected messages from that buyer-facing thread into Steel Internal.",
        timestamp: new Date("2026-02-04T10:40:00"),
        mentions: [PERSONA_CM_STEEL],
        threadId: "thread_enq2409_steel",
        replyCount: 3,
        lastReplyAt: new Date("2026-02-04T10:22:00"),
        threadParticipants: [PERSONA_CM_STEEL, PERSONA_BDM_1, PERSONA_CX_1],
      },
    ],
    createdBy: PERSONA_CM_STEEL,
    createdAt: new Date("2026-01-28T09:00:00"),
    lastActivity: new Date("2026-02-04T10:40:00"),
    unread: false,
    unreadCount: 0,
    // Threads within this group
    threads: [
      THREAD_ENQ2401_INTERNAL,
      THREAD_ENQ2404_INTERNAL,
      THREAD_ENQ2405_INTERNAL,
      THREAD_ENQ2408_STEEL,
      THREAD_ENQ2409_STEEL,
    ],
  },
  // Polymer Internal — Workspace for polymer/specialty category
  {
    id: "grp_internal_polymer",
    name: "Polymer Internal",
    type: "custom",
    status: "active",
    memberIds: [PERSONA_BDM_1, PERSONA_BDM_2, PERSONA_CM_POLYMER, PERSONA_CX_1],
    memberPersonaIds: [PERSONA_BDM_1, PERSONA_BDM_2, PERSONA_CM_POLYMER, PERSONA_CX_1],
    messages: [
      {
        id: "int-poly-msg1",
        type: "system",
        content: "Group created for Polymer category coordination",
        timestamp: new Date("2026-01-28T09:00:00"),
      },
      {
        id: "int-poly-msg2",
        type: "user",
        sender: "Meera Iyer",
        senderPersonaId: PERSONA_CM_POLYMER,
        senderRole: "CM",
        content: "Polymer prices are volatile this week. Holding off on large commitments until market stabilizes.",
        timestamp: new Date("2026-01-29T14:00:00"),
      },
      {
        id: "int-poly-msg4",
        type: "user",
        sender: "Priya Singh",
        senderPersonaId: PERSONA_BDM_2,
        senderRole: "BDM",
        content: "TechnoSteel mail ENQ-2403 landed — 1000 sqm aluminum 5mm, Mumbai, 2-week gate. @Meera Hindalco vs Vedanta?",
        timestamp: new Date("2026-02-02T09:12:00"),
        mentions: [PERSONA_CM_POLYMER],
        threadId: "thread_enq2403_poly",
        replyCount: 4,
        lastReplyAt: new Date("2026-02-02T09:42:00"),
        threadParticipants: [PERSONA_CM_POLYMER, PERSONA_BDM_2, PERSONA_CX_1],
      },
      {
        id: "int-poly-msg3",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "Mail RFQ ENQ-2402 — Global Mfg — SS 316L seamless 4\" SCH40 ~1000m Bangalore. @Meera need mill + EN 10204 path today.",
        timestamp: new Date("2026-02-02T09:55:00"),
        mentions: [PERSONA_CM_POLYMER],
        threadId: "thread_enq2402_poly",
        replyCount: 4,
        lastReplyAt: new Date("2026-02-02T11:05:00"),
        threadParticipants: [PERSONA_CM_POLYMER, PERSONA_BDM_1, PERSONA_CX_1],
      },
      {
        id: "int-poly-msg5",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "ENQ-2407 mail from Global — 8000 sqm HDPE 2mm geomembrane, chemical bund. @Meera need Reliance vs GSE landed Chennai.",
        timestamp: new Date("2026-02-03T09:55:00"),
        mentions: [PERSONA_CM_POLYMER],
        threadId: "thread_enq2407_poly",
        replyCount: 3,
        lastReplyAt: new Date("2026-02-03T10:18:00"),
        threadParticipants: [PERSONA_CM_POLYMER, PERSONA_BDM_1, PERSONA_CX_1],
      },
    ],
    createdBy: PERSONA_CM_POLYMER,
    createdAt: new Date("2026-01-28T09:00:00"),
    lastActivity: new Date("2026-02-03T10:10:00"),
    unread: false,
    unreadCount: 0,
    threads: [THREAD_ENQ2402_INTERNAL, THREAD_ENQ2403_INTERNAL, THREAD_ENQ2407_POLY],
  },
  {
    id: "grp_internal_bitumen",
    name: "Bitumen Internal",
    type: "custom",
    status: "active",
    memberIds: [PERSONA_BDM_1, PERSONA_BDM_2, PERSONA_CM_BITUMEN, PERSONA_CX_1],
    memberPersonaIds: [PERSONA_BDM_1, PERSONA_BDM_2, PERSONA_CM_BITUMEN, PERSONA_CX_1],
    messages: [
      {
        id: "int-bitumen-msg1",
        type: "system",
        content: "Group created for Bitumen category coordination",
        timestamp: new Date("2026-01-28T09:30:00"),
      },
      {
        id: "int-bitumen-msg2",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "Mail RFQ ENQ-2406 on file — 120 MT VG-30, NHAI Jaipur corridor. @Aditya need IOCL vs HPCL option with rail leg.",
        timestamp: new Date("2026-02-03T08:55:00"),
        mentions: [PERSONA_CM_BITUMEN],
        threadId: "thread_enq2406_bitumen",
        replyCount: 3,
        lastReplyAt: new Date("2026-02-03T09:28:00"),
        threadParticipants: [PERSONA_CM_BITUMEN, PERSONA_BDM_1, PERSONA_CX_1],
      },
    ],
    createdBy: PERSONA_CM_BITUMEN,
    createdAt: new Date("2026-01-28T09:30:00"),
    lastActivity: new Date("2026-02-03T09:22:00"),
    unread: false,
    unreadCount: 0,
    threads: [THREAD_ENQ2406_BITUMEN],
  },
];

// Inject threads into existing buyer and seller groups (post-definition mutation)
// Ramesh WhatsApp — ENQ-2401 + ENQ-2408
MOCK_BUYER_GROUPS[0].threads = [THREAD_ENQ2401_BUYER, THREAD_ENQ2408_BUYER];
MOCK_BUYER_GROUPS[0].messages = MOCK_BUYER_GROUPS[0].messages.map((msg) => {
  if (msg.id === "buyer-grp-b1-msg2") {
    return {
      ...msg,
      threadId: "thread_enq2401_buyer",
      replyCount: 2,
      lastReplyAt: new Date("2026-02-02T10:15:00"),
      threadParticipants: [PERSONA_BDM_1, PERSONA_BUYER_1],
    };
  }
  if (msg.id === "buyer-grp-b1-msg-enq2408") {
    return {
      ...msg,
      threadId: "thread_enq2408_buyer_wa",
      replyCount: 3,
      lastReplyAt: new Date("2026-02-03T10:52:00"),
      threadParticipants: [PERSONA_BDM_1, PERSONA_BUYER_1],
    };
  }
  return msg;
});

// Ramesh Industries — mail: ENQ-2401 + ENQ-2406
MOCK_BUYER_GROUPS[1].messages = [
  {
    id: "buyer-mail-b1-msg1",
    type: "user",
    sender: "Ramesh Patel",
    senderPersonaId: PERSONA_BUYER_1,
    senderRole: "Buyer",
    content:
      "Subject: RE: ENQ-2401 — TMT 500D Delhi site\n\nAmit — please confirm mill name, dispatch sequence (200 MT), and whether insurance is included in your ₹54k/ton.",
    timestamp: new Date("2026-02-02T09:20:00"),
  },
  {
    id: "buyer-mail-b1-msg-enq2406",
    type: "user",
    sender: "Ramesh Patel",
    senderPersonaId: PERSONA_BUYER_1,
    senderRole: "Buyer",
    content:
      "Subject: RE: VG-30 bitumen — NHAI project (ENQ-2406) | Dispatch and weighbridge docs\n\nTeam, adding dispatch compliance points from our EPC partner:\n\n• Provide weighbridge slips for each lot and aggregate dispatch statement at lot closure.\n• Mention batch no., tanker no., and loading temperature on challan.\n• Include refinery test report reference in invoice remarks.\n\nThis is mandatory for NHAI billing reconciliation.\n\nRegards,\nAditya Verma\nProcurement Cell | RoadBuild Infra",
    timestamp: new Date("2026-02-03T08:50:00"),
  },
];
MOCK_BUYER_GROUPS[1].threads = [
  {
    id: "thread_enq2401_buyer_mail",
    groupId: "grp_buyer_b1_mail",
    rootMessageId: "buyer-mail-b1-msg1",
    enquiryId: "ENQ-2401",
    title: "Mail — TMT 500D terms",
    messages: [
      {
        id: "thread-2401-mail-r1",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content:
          "Ramesh — mill is Tata Steel Jamshedpur; we’ll phase 120+80 MT; insurance covered till Delhi ICD as per standard pivot terms.",
        timestamp: new Date("2026-02-02T09:35:00"),
      },
      {
        id: "thread-2401-mail-r2",
        type: "user",
        sender: "Ramesh Patel",
        senderPersonaId: PERSONA_BUYER_1,
        senderRole: "Buyer",
        content: "Thanks — please add Priya’s cell on the delivery coordination list. We’ll release gate pass 24h before first truck.",
        timestamp: new Date("2026-02-02T09:50:00"),
      },
      {
        id: "thread-2401-mail-r3",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "Done. Looping Priya Sharma (CM) on CC; she owns loading plan.",
        timestamp: new Date("2026-02-02T10:02:00"),
        mentions: [PERSONA_CM_STEEL],
      },
    ],
    replyCount: 3,
    lastReplyAt: new Date("2026-02-02T10:02:00"),
    participants: [PERSONA_BDM_1, PERSONA_BUYER_1],
    createdBy: PERSONA_BDM_1,
    createdAt: new Date("2026-02-02T09:20:00"),
    unread: false,
    unreadCount: 0,
  },
  {
    id: "thread_enq2406_buyer_mail",
    groupId: "grp_buyer_b1_mail",
    rootMessageId: "buyer-mail-b1-msg-enq2406",
    enquiryId: "ENQ-2406",
    title: "Mail — VG-30 validity",
    messages: [],
    replyCount: 0,
    lastReplyAt: undefined,
    participants: [PERSONA_BDM_1, PERSONA_BUYER_1],
    createdBy: PERSONA_BDM_1,
    createdAt: new Date("2026-02-03T08:50:00"),
    unread: false,
    unreadCount: 0,
  },
];
MOCK_BUYER_GROUPS[1].messages = MOCK_BUYER_GROUPS[1].messages.map((msg) => {
  if (msg.id === "buyer-mail-b1-msg1") {
    return {
      ...msg,
      threadId: "thread_enq2401_buyer_mail",
      replyCount: 3,
      lastReplyAt: new Date("2026-02-02T10:02:00"),
      threadParticipants: [PERSONA_BDM_1, PERSONA_BUYER_1],
    };
  }
  if (msg.id === "buyer-mail-b1-msg-enq2406") {
    return {
      ...msg,
      threadId: "thread_enq2406_buyer_mail",
      replyCount: 0,
      lastReplyAt: undefined,
      threadParticipants: [PERSONA_BDM_1, PERSONA_BUYER_1],
    };
  }
  return msg;
});
MOCK_BUYER_GROUPS[1].lastActivity = new Date("2026-02-03T09:08:00");

// Global Manufacturing — mail: ENQ-2402 + ENQ-2407 + ENQ-2409 (draft RFQ trail)
MOCK_BUYER_GROUPS[3].messages = [
  {
    id: "buyer-mail-b2-msg1",
    type: "user",
    sender: "Global Manufacturing Ltd",
    senderPersonaId: PERSONA_BUYER_2,
    senderRole: "Buyer",
    content:
      "Subject: RE: RFQ: SS 316L pipes — Bangalore plant expansion (Apr 2026) | Add freight split\n\nAdding two commercial clarifications from our project controls team:\n\n1) Please split freight and basic price line-wise in the quote sheet.\n2) Keep loading/unloading assumptions explicit; unloading is buyer scope at Bangalore.\n\nAlso, engineering has asked for hydro-test certificates and PMI report copy per batch.\nIf your mill can share sample certificates, attach them in your response.\n\nRegards,\nAnanya Rao",
    timestamp: new Date("2026-02-02T10:25:00"),
  },
  {
    id: "buyer-mail-b2-msg-enq2407",
    type: "user",
    sender: "Global Manufacturing Ltd",
    senderPersonaId: PERSONA_BUYER_2,
    senderRole: "Buyer",
    content:
      "Subject: RE: HDPE geomembrane 2mm — pond lining (ENQ-2407) | QA hold points\n\nAdding QA hold points for quote + execution plan:\n\n• Rolls must be from same manufacturing batch per pond zone.\n• Share test values for density, tensile, tear resistance, puncture, and OIT.\n• Third-party witness test may be asked before final dispatch.\n\nPlease include these assumptions in your commercial response.",
    timestamp: new Date("2026-02-03T09:52:00"),
  },
  {
    id: "buyer-mail-b2-msg-enq2409",
    type: "user",
    sender: "Global Manufacturing Ltd",
    senderPersonaId: PERSONA_BUYER_2,
    senderRole: "Buyer",
    content:
      "Subject: RE: CR steel coils 1.2mm — Mumbai port warehouse (ENQ-2409) | Conversion to order-ready loting\n\nThanks for the updated commercial sheet.\nPlease lock material exactly as below so we can move this to order conversion:\n\n• Grade: IS 513, 1.2mm CR\n• Edge: slit\n• Total: 120 MT in 3 lots\n• Destination: Mumbai port warehouse\n• Unloading: seller scope with crane arrangement\n\nShare final dispatch calendar and pack-list template.",
    timestamp: new Date("2026-02-04T09:05:00"),
  },
];
MOCK_BUYER_GROUPS[3].threads = [
  {
    id: "thread_enq2402_buyer_mail",
    groupId: "grp_buyer_b2_mail",
    rootMessageId: "buyer-mail-b2-msg1",
    enquiryId: "ENQ-2402",
    title: "Mail — SS 316L inspection",
    messages: [],
    replyCount: 0,
    lastReplyAt: undefined,
    participants: [PERSONA_BDM_1, PERSONA_BUYER_2],
    createdBy: PERSONA_BDM_1,
    createdAt: new Date("2026-02-02T10:25:00"),
    unread: false,
    unreadCount: 0,
  },
  {
    id: "thread_enq2407_buyer_mail",
    groupId: "grp_buyer_b2_mail",
    rootMessageId: "buyer-mail-b2-msg-enq2407",
    enquiryId: "ENQ-2407",
    title: "Mail — HDPE spec",
    messages: [],
    replyCount: 0,
    lastReplyAt: undefined,
    participants: [PERSONA_BDM_1, PERSONA_BUYER_2],
    createdBy: PERSONA_BDM_1,
    createdAt: new Date("2026-02-03T09:52:00"),
    unread: false,
    unreadCount: 0,
  },
  {
    id: "thread_enq2409_buyer_mail",
    groupId: "grp_buyer_b2_mail",
    rootMessageId: "buyer-mail-b2-msg-enq2409",
    enquiryId: "ENQ-2409",
    title: "Mail — CR coils RFQ (draft)",
    messages: [],
    replyCount: 0,
    lastReplyAt: undefined,
    participants: [PERSONA_BDM_1, PERSONA_BUYER_2],
    createdBy: PERSONA_BDM_1,
    createdAt: new Date("2026-02-04T09:05:00"),
    unread: false,
    unreadCount: 0,
  },
];
MOCK_BUYER_GROUPS[3].messages = MOCK_BUYER_GROUPS[3].messages.map((msg) => {
  if (msg.id === "buyer-mail-b2-msg1") {
    return {
      ...msg,
      threadId: "thread_enq2402_buyer_mail",
      replyCount: 0,
      lastReplyAt: undefined,
      threadParticipants: [PERSONA_BDM_1, PERSONA_BUYER_2],
    };
  }
  if (msg.id === "buyer-mail-b2-msg-enq2407") {
    return {
      ...msg,
      threadId: "thread_enq2407_buyer_mail",
      replyCount: 0,
      lastReplyAt: undefined,
      threadParticipants: [PERSONA_BDM_1, PERSONA_BUYER_2],
    };
  }
  if (msg.id === "buyer-mail-b2-msg-enq2409") {
    return {
      ...msg,
      threadId: "thread_enq2409_buyer_mail",
      replyCount: 0,
      lastReplyAt: undefined,
      threadParticipants: [PERSONA_BDM_1, PERSONA_BUYER_2],
    };
  }
  return msg;
});
MOCK_BUYER_GROUPS[3].lastActivity = new Date("2026-02-04T09:05:00");

// TechnoSteel — WhatsApp ENQ-2405
MOCK_BUYER_GROUPS[4].threads = [THREAD_ENQ2405_BUYER];
MOCK_BUYER_GROUPS[4].messages = MOCK_BUYER_GROUPS[4].messages.map((msg) => {
  if (msg.id === "buyer-grp-b3-msg-enq2405") {
    return {
      ...msg,
      threadId: "thread_enq2405_buyer_wa",
      replyCount: 4,
      lastReplyAt: new Date("2026-02-02T12:08:00"),
      threadParticipants: [PERSONA_BDM_2, PERSONA_BUYER_3],
    };
  }
  return msg;
});

// TechnoSteel — mail thread for ENQ-2403 (aluminum)
MOCK_BUYER_GROUPS[5].messages = [
  {
    id: "buyer-mail-b3-msg1",
    type: "user",
    sender: "TechnoSteel Corp",
    senderPersonaId: PERSONA_BUYER_3,
    senderRole: "Buyer",
    content:
      "Subject: RE: RFQ: Aluminum sheets 5mm — Mumbai warehouse (ENQ-2403) | Packing confirmation\n\nHi Priya,\n\nPlease include export-safe palletized packing even though this is domestic movement.\nOur architect team has specifically requested edge protection + moisture barrier film\nbecause sheets will stay in covered staging for up to 10 days before installation.\n\nAlso confirm whether you can include coating batch numbers in dispatch challan remarks.\n\nRegards,\nKaran Mehta\nSupply Chain | TechnoSteel Corp",
    timestamp: new Date("2026-02-02T09:08:00"),
  },
];
MOCK_BUYER_GROUPS[5].threads = [
  {
    id: "thread_enq2403_buyer_mail",
    groupId: "grp_buyer_b3_mail",
    rootMessageId: "buyer-mail-b3-msg1",
    enquiryId: "ENQ-2403",
    title: "Mail — aluminum COA",
    messages: [],
    replyCount: 0,
    lastReplyAt: undefined,
    participants: [PERSONA_BDM_2, PERSONA_BUYER_3],
    createdBy: PERSONA_BDM_2,
    createdAt: new Date("2026-02-02T09:08:00"),
    unread: false,
    unreadCount: 0,
  },
];
MOCK_BUYER_GROUPS[5].messages = MOCK_BUYER_GROUPS[5].messages.map((msg) => {
  if (msg.id === "buyer-mail-b3-msg1") {
    return {
      ...msg,
      threadId: "thread_enq2403_buyer_mail",
      replyCount: 0,
      lastReplyAt: undefined,
      threadParticipants: [PERSONA_BDM_2, PERSONA_BUYER_3],
    };
  }
  return msg;
});
MOCK_BUYER_GROUPS[5].lastActivity = new Date("2026-02-02T09:08:00");

// ENQ-2401 thread in seller group (Suresh Industries)
MOCK_SELLER_GROUPS[0].threads = [THREAD_ENQ2401_SELLER];
MOCK_SELLER_GROUPS[0].messages = MOCK_SELLER_GROUPS[0].messages.map(msg => {
  if (msg.id === "seller-dm-s1-msg1") {
    return {
      ...msg,
      threadId: "thread_enq2401_seller_s1",
      replyCount: 2,
      lastReplyAt: new Date("2026-02-03T09:15:00"),
      threadParticipants: [PERSONA_SELLER_1, PERSONA_CM_STEEL],
    };
  }
  return msg;
});

// Additional CM Responded mock enquiries — wire them into internal + buyer groups
MOCK_INTERNAL_GROUPS[0].messages.push(
  {
    id: "int-steel-msg-enq2411",
    type: "user",
    sender: "Amit Kumar",
    senderPersonaId: PERSONA_BDM_1,
    senderRole: "BDM",
    content: "ENQ-2411 is quote-ready for Ramesh. @Priya please post the final sourcing view so I can close buyer confirmation.",
    timestamp: new Date("2026-02-06T14:35:00"),
    mentions: [PERSONA_CM_STEEL],
    threadId: "thread_enq2411_steel",
    replyCount: 3,
    lastReplyAt: new Date("2026-02-06T15:10:00"),
    threadParticipants: [PERSONA_CM_STEEL, PERSONA_BDM_1],
  },
  {
    id: "int-steel-msg-enq2413",
    type: "user",
    sender: "Amit Kumar",
    senderPersonaId: PERSONA_BDM_1,
    senderRole: "BDM",
    content: "ENQ-2413 commercial is nearly closed. @Rajesh share the final cement split so I can keep Global Manufacturing aligned.",
    timestamp: new Date("2026-02-07T08:35:00"),
    mentions: [PERSONA_CM_CEMENT],
    threadId: "thread_enq2413_steel",
    replyCount: 3,
    lastReplyAt: new Date("2026-02-07T09:05:00"),
    threadParticipants: [PERSONA_CM_CEMENT, PERSONA_BDM_1],
  },
);
MOCK_INTERNAL_GROUPS[0].threads = [
  ...(MOCK_INTERNAL_GROUPS[0].threads || []),
  THREAD_ENQ2411_INTERNAL,
  THREAD_ENQ2413_INTERNAL,
];
MOCK_INTERNAL_GROUPS[0].lastActivity = new Date("2026-02-07T09:05:00");

MOCK_INTERNAL_GROUPS[1].messages.push({
  id: "int-poly-msg-enq2412",
  type: "user",
  sender: "Priya Singh",
  senderPersonaId: PERSONA_BDM_2,
  senderRole: "BDM",
  content: "ENQ-2412 is ready for buyer-facing closure. @Meera please pin the final polymer commercial summary here.",
  timestamp: new Date("2026-02-06T12:18:00"),
  mentions: [PERSONA_CM_POLYMER],
  threadId: "thread_enq2412_poly",
  replyCount: 3,
  lastReplyAt: new Date("2026-02-06T12:40:00"),
  threadParticipants: [PERSONA_CM_POLYMER, PERSONA_BDM_2],
});
MOCK_INTERNAL_GROUPS[1].threads = [
  ...(MOCK_INTERNAL_GROUPS[1].threads || []),
  THREAD_ENQ2412_INTERNAL,
];
MOCK_INTERNAL_GROUPS[1].lastActivity = new Date("2026-02-06T12:40:00");

MOCK_BUYER_GROUPS[0].messages.push({
  id: "buyer-grp-b1-msg-enq2411",
  type: "user",
  sender: "Ramesh Patel",
  senderPersonaId: PERSONA_BUYER_1,
  senderRole: "Buyer",
  content: "Amit, please share the latest commercial for ENQ-2411 with QC docs. We’re reviewing dispatch timing internally.",
  timestamp: new Date("2026-02-06T14:45:00"),
  threadId: "thread_enq2411_buyer_wa",
  replyCount: 2,
  lastReplyAt: new Date("2026-02-06T15:02:00"),
  threadParticipants: [PERSONA_BDM_1, PERSONA_BUYER_1],
});
MOCK_BUYER_GROUPS[0].threads = [
  ...(MOCK_BUYER_GROUPS[0].threads || []),
  THREAD_ENQ2411_BUYER,
];
MOCK_BUYER_GROUPS[0].lastActivity = new Date("2026-02-06T15:02:00");

MOCK_BUYER_GROUPS[3].messages.push({
  id: "buyer-mail-b2-msg-enq2413",
  type: "user",
  sender: "Global Manufacturing Ltd",
  senderPersonaId: PERSONA_BUYER_2,
  senderRole: "Buyer",
  content: "Subject: RE: ENQ-2413 | Freight and GST breakup\n\nPlease share the final line-wise commercial and tentative dispatch cadence for our review.",
  timestamp: new Date("2026-02-07T08:48:00"),
  threadId: "thread_enq2413_buyer_mail",
  replyCount: 2,
  lastReplyAt: new Date("2026-02-07T09:00:00"),
  threadParticipants: [PERSONA_BDM_1, PERSONA_BUYER_2],
});
MOCK_BUYER_GROUPS[3].threads = [
  ...(MOCK_BUYER_GROUPS[3].threads || []),
  THREAD_ENQ2413_BUYER,
];
MOCK_BUYER_GROUPS[3].lastActivity = new Date("2026-02-07T09:00:00");

MOCK_BUYER_GROUPS[4].messages.push({
  id: "buyer-grp-b3-msg-enq2412",
  type: "user",
  sender: "TechnoSteel Corp",
  senderPersonaId: PERSONA_BUYER_3,
  senderRole: "Buyer",
  content: "Please share the final ENQ-2412 polymer commercial with QA checklist. We’re moving toward release.",
  timestamp: new Date("2026-02-06T12:20:00"),
  threadId: "thread_enq2412_buyer_wa",
  replyCount: 2,
  lastReplyAt: new Date("2026-02-06T12:34:00"),
  threadParticipants: [PERSONA_BDM_2, PERSONA_BUYER_3],
});
MOCK_BUYER_GROUPS[4].threads = [
  ...(MOCK_BUYER_GROUPS[4].threads || []),
  THREAD_ENQ2412_BUYER,
];
MOCK_BUYER_GROUPS[4].lastActivity = new Date("2026-02-06T12:34:00");
