/**
 * Mock Data for Development
 * 
 * Initial data to populate the memory store.
 * 
 * Setup:
 * - BDM1 (Amit Kumar): Direct chats with Ramesh Industries and Global Manufacturing Ltd
 * - BDM2 (Priya Singh): Direct chat with TechnoSteel Corp
 * - Enquiries: 5 enquiries with BDM, CM (region-based), and CX members only
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
  // BDM1 (Amit Kumar) - Enquiry 1 (North region - Delhi)
  {
    id: "ENQ-2401",
    buyerName: "Ramesh Industries",
    buyerPersonaId: PERSONA_BUYER_1,
    bdmPersonaId: PERSONA_BDM_1,
    state: "Pending Response",
    estimatedValue: 75000,
    categories: ["Steel"], // TMT Bars and Steel Pipe
    memberIds: [
      generateMemberId("ENQ-2401", PERSONA_BDM_1),
      generateMemberId("ENQ-2401", PERSONA_CM_STEEL), // North CM
      generateMemberId("ENQ-2401", PERSONA_CX_1),
    ],
    unread: true, // Mark as unread to show in Unread tab
    lastActivity: new Date("2026-02-01T10:30:00"),
    createdAt: new Date("2026-01-30T10:30:00"),
  },
  // BDM1 (Amit Kumar) - Enquiry 2 (South region - Bangalore)
  {
    id: "ENQ-2402",
    buyerName: "Global Manufacturing Ltd",
    buyerPersonaId: PERSONA_BUYER_2,
    bdmPersonaId: PERSONA_BDM_1,
    state: "Pending Response",
    estimatedValue: 120000,
    categories: ["Polymer"], // Polymer products
    memberIds: [
      generateMemberId("ENQ-2402", PERSONA_BDM_1),
      generateMemberId("ENQ-2402", PERSONA_CM_POLYMER), // South CM
      generateMemberId("ENQ-2402", PERSONA_CX_1),
    ],
    unread: true, // Mark as unread to show in Unread tab
    lastActivity: new Date("2026-01-31T14:20:00"),
    createdAt: new Date("2026-01-31T09:00:00"),
  },
  // BDM2 (Priya Singh) - Enquiry 3 (West region - Mumbai)
  {
    id: "ENQ-2403",
    buyerName: "TechnoSteel Corp",
    buyerPersonaId: PERSONA_BUYER_3,
    bdmPersonaId: PERSONA_BDM_2,
    state: "Pending Response",
    estimatedValue: 62500,
    categories: ["Bitumen"], // Bitumen for road construction
    memberIds: [
      generateMemberId("ENQ-2403", PERSONA_BDM_2),
      generateMemberId("ENQ-2403", PERSONA_CM_BITUMEN), // West CM
      generateMemberId("ENQ-2403", PERSONA_CX_1),
    ],
    unread: false,
    lastActivity: new Date("2026-01-30T16:45:00"),
    createdAt: new Date("2026-01-30T11:00:00"),
  },
  // BDM1 (Amit Kumar) - Enquiry 4 (South region - Chennai)
  {
    id: "ENQ-2404",
    buyerName: "Ramesh Industries",
    buyerPersonaId: PERSONA_BUYER_1,
    bdmPersonaId: PERSONA_BDM_1,
    state: "Draft",
    estimatedValue: 98000,
    categories: ["Cement"], // Cement for construction
    memberIds: [
      generateMemberId("ENQ-2404", PERSONA_BDM_1),
      generateMemberId("ENQ-2404", PERSONA_CM_CEMENT), // East CM
      generateMemberId("ENQ-2404", PERSONA_CX_1),
    ],
    unread: false,
    lastActivity: new Date("2026-01-31T11:30:00"),
    createdAt: new Date("2026-01-31T11:20:00"),
  },
  // BDM2 (Priya Singh) - Enquiry 5 (West region - Pune)
  {
    id: "ENQ-2405",
    buyerName: "TechnoSteel Corp",
    buyerPersonaId: PERSONA_BUYER_3,
    bdmPersonaId: PERSONA_BDM_2,
    state: "Converted to Order",
    estimatedValue: 40000,
    categories: ["Steel", "Cement"], // Multi-category enquiry example
    memberIds: [
      generateMemberId("ENQ-2405", PERSONA_BDM_2),
      generateMemberId("ENQ-2405", PERSONA_CM_STEEL), // Primary category CM
      generateMemberId("ENQ-2405", PERSONA_CM_CEMENT), // Secondary category CM
      generateMemberId("ENQ-2405", PERSONA_CX_1),
    ],
    unread: false,
    lastActivity: new Date("2026-02-01T09:00:00"),
    createdAt: new Date("2026-02-01T08:50:00"),
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
        content: "@Priya - Ramesh needs 200 MT of TMT 500D and 50 MT of Steel Pipe 4 inch for Delhi project. Can you source?",
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
        content: "Enquiry created for Global Manufacturing Ltd - Industrial Pipes",
        timestamp: new Date("2026-01-31T09:00:00"),
      },
      {
        id: "enq2402-internal-2",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "@Meera - Need SS 316L pipes, 4-inch, 1000m for Bangalore. Urgent.",
        timestamp: new Date("2026-01-31T09:32:00"),
        mentions: [PERSONA_CM_POLYMER],
      },
      {
        id: "enq2402-internal-3",
        type: "user",
        sender: "Meera Iyer",
        senderPersonaId: PERSONA_CM_POLYMER,
        senderRole: "CM",
        content: "Got it. I'll contact JSW Steel - they have good stock of 316L.",
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
        content: "Enquiry created for TechnoSteel Corp - Aluminum Sheets",
        timestamp: new Date("2026-01-30T11:00:00"),
      },
      {
        id: "enq2403-internal-2",
        type: "user",
        sender: "Priya Singh",
        senderPersonaId: PERSONA_BDM_2,
        senderRole: "BDM",
        content: "@Aditya - Urgent: 1000 sq m aluminum sheets, 5mm thick. Client needs in 2 weeks.",
        timestamp: new Date("2026-01-30T11:16:00"),
        mentions: [PERSONA_CM_BITUMEN],
      },
      {
        id: "enq2403-internal-3",
        type: "user",
        sender: "Aditya Verma",
        senderPersonaId: PERSONA_CM_BITUMEN,
        senderRole: "CM",
        content: "Checking with Vedanta and Hindalco. Will update in 2 hours.",
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
        content: "Enquiry created for Ramesh Industries - Steel Pipes",
        timestamp: new Date("2026-01-31T11:20:00"),
      },
      {
        id: "enq2404-internal-2",
        type: "user",
        sender: "Amit Kumar",
        senderPersonaId: PERSONA_BDM_1,
        senderRole: "BDM",
        content: "@Meera - Ramesh needs 500 units industrial steel pipes, Grade 304, 2-inch for Chennai.",
        timestamp: new Date("2026-01-31T11:26:00"),
        mentions: [PERSONA_CM_POLYMER],
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
        content: "Enquiry created for TechnoSteel Corp - Copper Wires",
        timestamp: new Date("2026-02-01T08:50:00"),
      },
      {
        id: "enq2405-internal-2",
        type: "user",
        sender: "Priya Singh",
        senderPersonaId: PERSONA_BDM_2,
        senderRole: "BDM",
        content: "@Aditya - Bulk order copper wires needed for Pune facility. Specs coming from client.",
        timestamp: new Date("2026-02-01T08:52:00"),
        mentions: [PERSONA_CM_BITUMEN],
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
    memberIds: ["s_1", PERSONA_CM_STEEL, PERSONA_CM_POLYMER],
    memberPersonaIds: [PERSONA_SELLER_1, PERSONA_CM_STEEL, PERSONA_CM_POLYMER],
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
    memberIds: ["s_5", PERSONA_CM_STEEL],
    memberPersonaIds: [PERSONA_SELLER_5, PERSONA_CM_STEEL],
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
    ],
    buyerId: "buyer_1",
    buyerPersonaId: PERSONA_BUYER_1,
    createdBy: PERSONA_BDM_1,
    createdAt: new Date("2026-02-02T09:00:00"),
    lastActivity: new Date("2026-02-02T09:15:00"),
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
    ],
    buyerId: "buyer_3",
    buyerPersonaId: PERSONA_BUYER_3,
    createdBy: PERSONA_BDM_2,
    createdAt: new Date("2026-02-01T11:00:00"),
    lastActivity: new Date("2026-02-01T11:00:00"),
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
  ],
  replyCount: 3,
  lastReplyAt: new Date("2026-01-30T16:30:00"),
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
      mentions: [PERSONA_BDM_1],
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

const THREAD_ENQ2404_INTERNAL: Thread = {
  id: "thread_enq2404_steel",
  groupId: "grp_internal_steel",
  rootMessageId: "int-steel-msg4", // Steel pipes message
  enquiryId: "ENQ-2404",
  title: "Steel Pipes Grade 304",
  messages: [
    {
      id: "thread-2404-steel-r1",
      type: "user",
      sender: "Meera Iyer",
      senderPersonaId: PERSONA_CM_POLYMER,
      senderRole: "CM",
      content: "I've sourced Grade 304 pipes from JSW. ₹1,200/unit for 500 units. 2-week lead time.",
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
      sender: "Meera Iyer",
      senderPersonaId: PERSONA_CM_POLYMER,
      senderRole: "CM",
      content: "@[Amit Kumar](p_bdm_1) please confirm buyer acceptance so I can lock seller allocation today.",
      timestamp: new Date("2026-01-31T14:15:00"),
      mentions: [PERSONA_BDM_1],
    },
  ],
  replyCount: 3,
  lastReplyAt: new Date("2026-01-31T14:15:00"),
  participants: [PERSONA_CM_POLYMER, PERSONA_BDM_1],
  createdBy: PERSONA_CM_POLYMER,
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

export const MOCK_INTERNAL_GROUPS: GroupChannel[] = [
  // Steel Internal — Primary workspace for steel category
  {
    id: "grp_internal_steel",
    name: "Steel Internal",
    type: "custom",
    status: "active",
    memberIds: [PERSONA_BDM_1, PERSONA_BDM_2, PERSONA_CM_STEEL, PERSONA_CX_1],
    memberPersonaIds: [PERSONA_BDM_1, PERSONA_BDM_2, PERSONA_CM_STEEL, PERSONA_CX_1],
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
        replyCount: 3,
        lastReplyAt: new Date("2026-01-30T16:30:00"),
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
        content: "Ramesh Industries also needs 500 units Grade 304 steel pipes for Chennai. @Meera please source.",
        timestamp: new Date("2026-01-31T11:30:00"),
        mentions: [PERSONA_CM_POLYMER],
        // Thread indicators
        threadId: "thread_enq2404_steel",
        replyCount: 3,
        lastReplyAt: new Date("2026-01-31T14:15:00"),
        threadParticipants: [PERSONA_CM_POLYMER, PERSONA_BDM_1],
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
    ],
    createdBy: PERSONA_CM_STEEL,
    createdAt: new Date("2026-01-28T09:00:00"),
    lastActivity: new Date("2026-02-01T10:00:00"),
    unread: false,
    unreadCount: 0,
    // Threads within this group
    threads: [THREAD_ENQ2401_INTERNAL, THREAD_ENQ2404_INTERNAL],
  },
  // Polymer Internal — Workspace for polymer/specialty category
  {
    id: "grp_internal_polymer",
    name: "Polymer Internal",
    type: "custom",
    status: "active",
    memberIds: [PERSONA_BDM_1, PERSONA_CM_POLYMER, PERSONA_CX_1],
    memberPersonaIds: [PERSONA_BDM_1, PERSONA_CM_POLYMER, PERSONA_CX_1],
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
    ],
    createdBy: PERSONA_CM_POLYMER,
    createdAt: new Date("2026-01-28T09:00:00"),
    lastActivity: new Date("2026-01-29T14:00:00"),
    unread: false,
    unreadCount: 0,
    threads: [],
  },
];

// Inject threads into existing buyer and seller groups (post-definition mutation)
// ENQ-2401 thread in buyer WhatsApp group
MOCK_BUYER_GROUPS[0].threads = [THREAD_ENQ2401_BUYER];
// Update root message thread indicators
MOCK_BUYER_GROUPS[0].messages = MOCK_BUYER_GROUPS[0].messages.map(msg => {
  if (msg.id === "buyer-grp-b1-msg2") {
    return {
      ...msg,
      threadId: "thread_enq2401_buyer",
      replyCount: 2,
      lastReplyAt: new Date("2026-02-02T10:15:00"),
      threadParticipants: [PERSONA_BDM_1, PERSONA_BUYER_1],
    };
  }
  return msg;
});

// Mirror the buyer mail group with an enquiry-tagged email thread example
MOCK_BUYER_GROUPS[1].messages = [
  {
    id: "buyer-mail-b1-msg1",
    type: "user",
    sender: "Ramesh Patel",
    senderPersonaId: PERSONA_BUYER_1,
    senderRole: "Buyer",
    content: "Subject: Request for latest quote\n\nPlease share the latest quote for our TMT 500D requirement.",
    timestamp: new Date("2026-02-02T09:20:00"),
  },
];
MOCK_BUYER_GROUPS[1].threads = [
  {
    id: "thread_enq2401_buyer_mail",
    groupId: "grp_buyer_b1_mail",
    rootMessageId: "buyer-mail-b1-msg1",
    enquiryId: "ENQ-2401",
    title: "Incoming email enquiry",
    messages: [],
    replyCount: 0,
    participants: [PERSONA_BDM_1],
    createdBy: PERSONA_BDM_1,
    createdAt: new Date("2026-02-02T09:20:00"),
    unread: false,
    unreadCount: 0,
  },
];
MOCK_BUYER_GROUPS[1].messages = MOCK_BUYER_GROUPS[1].messages.map(msg => {
  if (msg.id === "buyer-mail-b1-msg1") {
    return {
      ...msg,
      threadId: "thread_enq2401_buyer_mail",
      replyCount: 0,
      threadParticipants: [PERSONA_BDM_1],
    };
  }
  return msg;
});

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
