/**
 * Persona Profile Data
 * 
 * Enhanced data model for unified buyer and seller profile cards.
 * Includes overview, credit, activity, risk, and performance information.
 */

import type { Role } from "@/domain/enquiry/enquiry.types";

export type ProfileCardPage = "overview" | "credit" | "activity" | "risk";

/**
 * Seller Profile Card Pages
 */
export type SellerProfileCardPage = "overview" | "performance" | "history";

/**
 * Base Profile Data
 */
export interface ProfileOverview {
  legalName: string;
  entityType?: string;
  primaryLocation: string;
  gstin?: string;
  status: "active" | "credit_blocked" | "new_buyer" | "under_review" | "blocked";
  relationship: {
    assignedTo: string;
    assignedToRole: Role;
  };
  stats: {
    activeEnquiries: number;
    lastActivity: Date;
  };
  // Seller-specific fields
  sellerType?: "manufacturer" | "trader" | "distributor";
  categoriesSupplied?: string[];
  onboardingLevel?: "verified" | "partially_verified" | "unverified";
}

/**
 * Quick Signals for Conversion Cockpit (Buyer)
 */
export interface QuickSignals {
  openCredit: number;
  typicalPaymentCycle: string;
  orderFrequency: "high" | "medium" | "low";
  riskFlag: "low" | "medium" | "high";
}

/**
 * Quick Signals for Seller Selection
 */
export interface SellerQuickSignals {
  quoteSpeedHours: number;
  deliveryReliabilityPercent: number;
  priceCompetitiveness: "competitive" | "premium" | "budget";
  riskLevel: "low" | "medium" | "high";
}

/**
 * AI Insights (Buyer)
 */
export interface AIInsight {
  id: string;
  type: "credit" | "conversion" | "negotiation" | "followup";
  title: string;
  message: string;
  confidenceLevel?: "high" | "medium" | "low";
}

/**
 * Seller AI Insights
 */
export interface SellerAIInsight {
  id: string;
  type: "routing" | "pricing" | "risk";
  title: string;
  message: string;
  confidenceLevel?: "high" | "medium" | "low";
}

/**
 * Credit Instrument
 */
export interface CreditInstrument {
  id: string;
  type: "anchor_program" | "bank_guarantee" | "lc" | "other";
  amount: number;
  provider?: string;
  idd?: string;
}

/**
 * Credit Information (Buyers only)
 */
export interface CreditData {
  creditLimit: number;
  creditUsed: number;
  creditAvailable: number;
  utilizationPercent: number;
  paymentTerms: string;
  avgPaymentDays: number;
  breakup: CreditBreakupItem[];
  conversionSignal?: string;
  instruments: CreditInstrument[];
}

export interface CreditBreakupItem {
  enquiryId: string;
  amount: number;
  daysOutstanding: number;
}

/**
 * Business Overview Data (Buyer)
 */
export interface BusinessOverview {
  primaryCategories: string[];
  topDeliveryLocations: string[];
  preferredSellers: string[];
  lastOrderDate: Date;
  avgOrderValue: {
    min: number;
    max: number;
  };
}

/**
 * Activity and Insights
 */
export interface ActivityData {
  recentMilestones: ActivityMilestone[];
  engagementScore: number;
  avgResponseTime: string;
  responseRate: number;
  conversionRate: number;
  avgTimeToConversion: string;
  quoteResponsiveness?: string;
}

export interface ActivityMilestone {
  id: string;
  timestamp: Date;
  type: "enquiry_created" | "quote_shared" | "po_received" | "message_sent" | "response_received";
  description: string;
  enquiryId?: string;
}

/**
 * Risk and Flags
 */
export interface RiskData {
  paymentRisk?: "low" | "medium" | "high";
  deliveryRisk?: "low" | "medium" | "high";
  disputeHistory: number;
  internalNotes: string[];
  flags: RiskFlag[];
}

export interface RiskFlag {
  id: string;
  severity: "info" | "warning" | "critical";
  label: string;
  description: string;
}

/**
 * Complete Profile Data
 */
export interface ProfileData {
  entityType: "buyer" | "seller";
  entityId: string;
  personaId: string;
  displayName: string;
  avatarUrl?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
  overview: ProfileOverview;
  credit?: CreditData;
  activity: ActivityData;
  risk: RiskData;
  businessOverview?: BusinessOverview;
  quickSignals?: QuickSignals;
  aiInsights?: AIInsight[];
  // Seller-specific fields
  sellerQuickSignals?: SellerQuickSignals;
  sellerAIInsights?: SellerAIInsight[];
  sellerPerformance?: {
    quoteAcceptanceRate: number;
    orderConversionRate: number;
    avgDispatchDays: number;
  };
  sellerHistory?: {
    totalEnquiriesRouted: number;
    totalOrdersConverted: number;
    lastOrderValue?: number;
    lastOrderDate?: Date;
  };
  sellerOverview?: {
    primaryCategories: string[];
    typicalOrderSizeRange: {
      min: number;
      max: number;
    };
    preferredDeliveryRegions: string[];
    creditSupportAvailable: boolean;
    lastActiveDate: Date;
  };
}

/**
 * Mock Buyer Profile Data
 */
const BUYER_PROFILES: Record<string, ProfileData> = {
  p_buyer_1: {
    entityType: "buyer",
    entityId: "buyer_1",
    personaId: "p_buyer_1",
    displayName: "Ramesh Industries",
    contact: {
      email: "rajesh.kumar@rameshindustries.com",
      phone: "+91 98765 43210",
    },
    overview: {
      legalName: "Ramesh Industries",
      entityType: "Private Limited",
      primaryLocation: "Mumbai, Maharashtra",
      gstin: "27AAACG1234A1Z5",
      status: "active",
      relationship: {
        assignedTo: "Arjun Mehta",
        assignedToRole: "BDM",
      },
      stats: {
        activeEnquiries: 3,
        lastActivity: new Date(2026, 1, 1, 14, 30),
      },
    },
    credit: {
      creditLimit: 50000000,
      creditUsed: 28500000,
      creditAvailable: 21500000,
      utilizationPercent: 57,
      paymentTerms: "30 days credit",
      avgPaymentDays: 5.2,
      breakup: [
        {
          enquiryId: "ENQ-2401",
          amount: 12500000,
          daysOutstanding: 15,
        },
        {
          enquiryId: "ENQ-2402",
          amount: 8000000,
          daysOutstanding: 20,
        },
        {
          enquiryId: "ENQ-2403",
          amount: 8000000,
          daysOutstanding: 25,
        },
      ],
      conversionSignal: "High urgency pattern detected",
      instruments: [
        {
          id: "ci1",
          type: "anchor_program",
          amount: 50000000,
          provider: "Birla Pivot",
          idd: "AP-001",
        },
      ],
    },
    activity: {
      recentMilestones: [
        {
          id: "m1",
          timestamp: new Date(2026, 1, 1, 14, 30),
          type: "message_sent",
          description: "Sent urgent query on TMT pricing",
          enquiryId: "ENQ-2401",
        },
        {
          id: "m2",
          timestamp: new Date(2026, 0, 31, 10, 15),
          type: "po_received",
          description: "PO received for Cement",
          enquiryId: "ENQ-2402",
        },
        {
          id: "m3",
          timestamp: new Date(2026, 0, 29, 16, 45),
          type: "quote_shared",
          description: "Quote shared for Steel Angles",
          enquiryId: "ENQ-2403",
        },
      ],
      engagementScore: 85,
      avgResponseTime: "4 hours",
      responseRate: 90,
      conversionRate: 75,
      avgTimeToConversion: "4.5 days",
    },
    risk: {
      paymentRisk: "low",
      disputeHistory: 0,
      internalNotes: [
        "Preferred buyer - excellent payment track record",
        "Direct line to CFO for approvals",
      ],
      flags: [],
    },
    businessOverview: {
      primaryCategories: ["Infrastructure", "Construction"],
      topDeliveryLocations: ["Mumbai", "Pune"],
      preferredSellers: ["JSW Steel", "UltraTech Cement"],
      lastOrderDate: new Date(2026, 0, 28),
      avgOrderValue: {
        min: 5000000,
        max: 10000000,
      },
    },
    quickSignals: {
      openCredit: 21500000,
      typicalPaymentCycle: "30 days",
      orderFrequency: "high",
      riskFlag: "low",
    },
    aiInsights: [
      {
        id: "ai1",
        type: "credit",
        title: "Credit Usage Pattern",
        message: "Buyer typically uses 65-75% of available credit before PO. Proposing split shipment may reduce delay.",
        confidenceLevel: "high",
      },
      {
        id: "ai2",
        type: "conversion",
        title: "Conversion Pattern",
        message: "Orders convert faster when delivery ETA is under 7 days. Highlight fastest seller options.",
        confidenceLevel: "high",
      },
      {
        id: "ai3",
        type: "negotiation",
        title: "Negotiation Tip",
        message: "Buyer has accepted 12-15% margin in last 3 enquiries without renegotiation.",
        confidenceLevel: "high",
      },
    ],
  },
  p_buyer_2: {
    entityType: "buyer",
    entityId: "buyer_2",
    personaId: "p_buyer_2",
    displayName: "Global Manufacturing Ltd",
    contact: {
      email: "contact@globalmfg.com",
      phone: "+91 98765 43211",
    },
    overview: {
      legalName: "Global Manufacturing Ltd",
      entityType: "Public Limited",
      primaryLocation: "Bangalore, Karnataka",
      gstin: "29AAACG1234A1Z5",
      status: "active",
      relationship: {
        assignedTo: "Arjun Mehta",
        assignedToRole: "BDM",
      },
      stats: {
        activeEnquiries: 5,
        lastActivity: new Date(2026, 1, 2, 9, 15),
      },
    },
    credit: {
      creditLimit: 100000000,
      creditUsed: 45000000,
      creditAvailable: 55000000,
      utilizationPercent: 45,
      paymentTerms: "45 days credit",
      avgPaymentDays: 2.8,
      breakup: [
        {
          enquiryId: "ENQ-2404",
          amount: 25000000,
          daysOutstanding: 10,
        },
        {
          enquiryId: "ENQ-2405",
          amount: 20000000,
          daysOutstanding: 5,
        },
      ],
      conversionSignal: "Premium buyer - large order sizes",
      instruments: [
        {
          id: "ci2",
          type: "bank_guarantee",
          amount: 100000000,
          provider: "Tata Projects",
          idd: "BG-001",
        },
      ],
    },
    activity: {
      recentMilestones: [
        {
          id: "m4",
          timestamp: new Date(2026, 1, 2, 9, 15),
          type: "enquiry_created",
          description: "New enquiry for Premium Steel",
          enquiryId: "ENQ-2404",
        },
        {
          id: "m5",
          timestamp: new Date(2026, 1, 1, 15, 30),
          type: "quote_shared",
          description: "Quote shared for Construction Materials",
          enquiryId: "ENQ-2405",
        },
      ],
      engagementScore: 92,
      avgResponseTime: "2 hours",
      responseRate: 95,
      conversionRate: 80,
      avgTimeToConversion: "3.5 days",
    },
    risk: {
      paymentRisk: "low",
      disputeHistory: 0,
      internalNotes: [
        "Enterprise buyer with excellent credit",
        "Direct procurement authority",
      ],
      flags: [],
    },
    businessOverview: {
      primaryCategories: ["Infrastructure", "Construction"],
      topDeliveryLocations: ["Bangalore", "Hyderabad"],
      preferredSellers: ["Tata Steel", "UltraTech Cement"],
      lastOrderDate: new Date(2026, 0, 27),
      avgOrderValue: {
        min: 10000000,
        max: 20000000,
      },
    },
    quickSignals: {
      openCredit: 55000000,
      typicalPaymentCycle: "45 days",
      orderFrequency: "high",
      riskFlag: "low",
    },
    aiInsights: [
      {
        id: "ai4",
        type: "conversion",
        title: "Fast Decision Maker",
        message: "This buyer converts in 3.5 days on average. Present options quickly with clear delivery timelines.",
        confidenceLevel: "high",
      },
      {
        id: "ai5",
        type: "negotiation",
        title: "Premium Segment",
        message: "Buyer prioritizes quality over price. Emphasize supplier reliability and product specifications.",
        confidenceLevel: "high",
      },
      {
        id: "ai6",
        type: "followup",
        title: "Follow-up Strategy",
        message: "Buyer responds best to follow-ups within 24 hours. Schedule next touchpoint tomorrow morning.",
        confidenceLevel: "medium",
      },
    ],
  },
  p_buyer_3: {
    entityType: "buyer",
    entityId: "buyer_3",
    personaId: "p_buyer_3",
    displayName: "TechnoSteel Corp",
    contact: {
      email: "contact@technosteelcorp.com",
      phone: "+91 98765 43212",
    },
    overview: {
      legalName: "TechnoSteel Corp",
      entityType: "Public Limited",
      primaryLocation: "Chennai, Tamil Nadu",
      gstin: "33AAACG1234A1Z5",
      status: "active",
      relationship: {
        assignedTo: "Arjun Mehta",
        assignedToRole: "BDM",
      },
      stats: {
        activeEnquiries: 4,
        lastActivity: new Date(2026, 0, 30, 11, 0),
      },
    },
    credit: {
      creditLimit: 75000000,
      creditUsed: 52000000,
      creditAvailable: 23000000,
      utilizationPercent: 69,
      paymentTerms: "60 days credit",
      avgPaymentDays: 12.5,
      breakup: [
        {
          enquiryId: "ENQ-2406",
          amount: 30000000,
          daysOutstanding: 20,
        },
        {
          enquiryId: "ENQ-2407",
          amount: 22000000,
          daysOutstanding: 15,
        },
      ],
      conversionSignal: "Price-sensitive buyer",
      instruments: [
        {
          id: "ci3",
          type: "lc",
          amount: 75000000,
          provider: "L&T Construction",
          idd: "LC-001",
        },
      ],
    },
    activity: {
      recentMilestones: [
        {
          id: "m6",
          timestamp: new Date(2026, 0, 30, 11, 0),
          type: "message_sent",
          description: "Negotiating payment terms",
          enquiryId: "ENQ-2406",
        },
        {
          id: "m7",
          timestamp: new Date(2026, 0, 28, 14, 20),
          type: "quote_shared",
          description: "Quote shared for Cement",
          enquiryId: "ENQ-2407",
        },
      ],
      engagementScore: 68,
      avgResponseTime: "8 hours",
      responseRate: 85,
      conversionRate: 60,
      avgTimeToConversion: "5.5 days",
    },
    risk: {
      paymentRisk: "medium",
      disputeHistory: 1,
      internalNotes: [
        "Monitor payment delays closely",
        "Requires approval from regional head for credit extension",
      ],
      flags: [
        {
          id: "f1",
          severity: "warning",
          label: "Payment Delay",
          description: "Average payment delay of 12.5 days - monitor closely",
        },
      ],
    },
    businessOverview: {
      primaryCategories: ["Infrastructure", "Construction"],
      topDeliveryLocations: ["Chennai", "Coimbatore"],
      preferredSellers: ["JSW Steel", "UltraTech Cement"],
      lastOrderDate: new Date(2026, 0, 26),
      avgOrderValue: {
        min: 7000000,
        max: 15000000,
      },
    },
    quickSignals: {
      openCredit: 23000000,
      typicalPaymentCycle: "60 days",
      orderFrequency: "medium",
      riskFlag: "medium",
    },
    aiInsights: [
      {
        id: "ai7",
        type: "credit",
        title: "Credit Monitor Alert",
        message: "Buyer using 69% of credit limit. Consider proposing advance payment for faster processing.",
        confidenceLevel: "high",
      },
      {
        id: "ai8",
        type: "negotiation",
        title: "Price Sensitivity",
        message: "Buyer has renegotiated 4 of last 5 quotes. Lead with competitive pricing and volume discounts.",
        confidenceLevel: "high",
      },
      {
        id: "ai9",
        type: "followup",
        title: "Silent Period Pattern",
        message: "Buyer usually goes silent for 2-3 days post quote before PO. Follow-up after 48 hours works best.",
        confidenceLevel: "medium",
      },
    ],
  },
};

/**
 * Mock Seller Profile Data
 */
const SELLER_PROFILES: Record<string, ProfileData> = {
  s_1: {
    entityType: "seller",
    entityId: "s_1",
    personaId: "s_1",
    displayName: "Suresh Industries",
    overview: {
      legalName: "Suresh Industries Private Limited",
      entityType: "Manufacturer",
      primaryLocation: "Mumbai, Maharashtra",
      sellerType: "manufacturer",
      categoriesSupplied: ["Steel", "TMT Bars", "Steel Angles"],
      onboardingLevel: "verified",
      status: "active",
      relationship: {
        assignedTo: "Priya Sharma",
        assignedToRole: "CM",
      },
      stats: {
        activeEnquiries: 8,
        lastActivity: new Date(2026, 1, 2, 16, 45),
      },
    },
    activity: {
      recentMilestones: [
        {
          id: "sm1",
          timestamp: new Date(2026, 1, 2, 16, 45),
          type: "quote_shared",
          description: "Quote submitted for TMT Bars",
          enquiryId: "ENQ-2401",
        },
        {
          id: "sm2",
          timestamp: new Date(2026, 1, 1, 10, 30),
          type: "response_received",
          description: "Responded to pricing query",
          enquiryId: "ENQ-2403",
        },
      ],
      engagementScore: 88,
      avgResponseTime: "4 hours",
      responseRate: 90,
      conversionRate: 75,
      avgTimeToConversion: "3.5 days",
      quoteResponsiveness: "Excellent - avg response time 4 hours",
    },
    risk: {
      deliveryRisk: "low",
      disputeHistory: 0,
      internalNotes: [
        "Tier-1 supplier - highly reliable",
        "Competitive pricing with good quality",
      ],
      flags: [],
    },
    sellerQuickSignals: {
      quoteSpeedHours: 4,
      deliveryReliabilityPercent: 92,
      priceCompetitiveness: "competitive",
      riskLevel: "low",
    },
    sellerAIInsights: [
      {
        id: "sai1",
        type: "routing",
        title: "Fast Quote for Urgent Orders",
        message: "Seller responds fastest for urgent enquiries under 500 MT. Average response time is 2 hours for high-priority requests.",
        confidenceLevel: "high",
      },
      {
        id: "sai2",
        type: "pricing",
        title: "Competitive Pricing in Steel",
        message: "Seller usually matches or undercuts market by 2-4% in Steel Pipes and TMT Bars categories.",
        confidenceLevel: "high",
      },
    ],
    sellerPerformance: {
      quoteAcceptanceRate: 75,
      orderConversionRate: 68,
      avgDispatchDays: 5,
    },
    sellerHistory: {
      totalEnquiriesRouted: 45,
      totalOrdersConverted: 32,
      lastOrderValue: 8500000,
      lastOrderDate: new Date(2026, 0, 28),
    },
    sellerOverview: {
      primaryCategories: ["Steel", "TMT Bars", "Steel Angles"],
      typicalOrderSizeRange: {
        min: 5000000,
        max: 20000000,
      },
      preferredDeliveryRegions: ["North", "West"],
      creditSupportAvailable: true,
      lastActiveDate: new Date(2026, 1, 2),
    },
  },
  s_2: {
    entityType: "seller",
    entityId: "s_2",
    personaId: "s_2",
    displayName: "Om Steel Traders",
    overview: {
      legalName: "Om Steel Traders",
      entityType: "Trader",
      primaryLocation: "Delhi, NCR",
      sellerType: "trader",
      categoriesSupplied: ["Steel", "Steel Bars", "Reinforcement Steel"],
      onboardingLevel: "partially_verified",
      status: "blocked",
      relationship: {
        assignedTo: "Priya Sharma",
        assignedToRole: "CM",
      },
      stats: {
        activeEnquiries: 0,
        lastActivity: new Date(2026, 0, 15, 14, 20),
      },
    },
    activity: {
      recentMilestones: [
        {
          id: "sm3",
          timestamp: new Date(2026, 0, 15, 14, 20),
          type: "quote_shared",
          description: "Quote submitted for Steel Bars",
          enquiryId: "ENQ-2320",
        },
      ],
      engagementScore: 45,
      avgResponseTime: "25 hours",
      responseRate: 60,
      conversionRate: 35,
      avgTimeToConversion: "8 days",
      quoteResponsiveness: "Poor - avg response time 25 hours",
    },
    risk: {
      deliveryRisk: "high",
      disputeHistory: 2,
      internalNotes: [
        "Multiple delivery delays - currently blocked",
        "Pending resolution of quality issues",
      ],
      flags: [
        {
          id: "f3",
          severity: "critical",
          label: "Quality Issues",
          description: "2 pending disputes regarding quality - seller blocked until resolution",
        },
      ],
    },
    sellerQuickSignals: {
      quoteSpeedHours: 25,
      deliveryReliabilityPercent: 55,
      priceCompetitiveness: "budget",
      riskLevel: "high",
    },
    sellerAIInsights: [
      {
        id: "sai3",
        type: "risk",
        title: "High Delivery Risk",
        message: "Seller has consistent delivery delays. Not recommended for time-sensitive orders.",
        confidenceLevel: "high",
      },
      {
        id: "sai4",
        type: "pricing",
        title: "Low Pricing but Quality Concerns",
        message: "Seller prices 15-20% below market but has quality issues. Use with caution.",
        confidenceLevel: "high",
      },
    ],
    sellerPerformance: {
      quoteAcceptanceRate: 35,
      orderConversionRate: 28,
      avgDispatchDays: 12,
    },
    sellerHistory: {
      totalEnquiriesRouted: 18,
      totalOrdersConverted: 5,
      lastOrderValue: 3200000,
      lastOrderDate: new Date(2026, 0, 10),
    },
    sellerOverview: {
      primaryCategories: ["Steel", "Steel Bars", "Reinforcement Steel"],
      typicalOrderSizeRange: {
        min: 2000000,
        max: 8000000,
      },
      preferredDeliveryRegions: ["North"],
      creditSupportAvailable: false,
      lastActiveDate: new Date(2026, 0, 15),
    },
  },
  s_3: {
    entityType: "seller",
    entityId: "s_3",
    personaId: "s_3",
    displayName: "Rathi Metals",
    overview: {
      legalName: "Rathi Metals Limited",
      entityType: "Manufacturer",
      primaryLocation: "Pune, Maharashtra",
      sellerType: "manufacturer",
      categoriesSupplied: ["Steel", "Metal Alloys", "Copper"],
      onboardingLevel: "verified",
      status: "active",
      relationship: {
        assignedTo: "Rajesh Kumar",
        assignedToRole: "CM",
      },
      stats: {
        activeEnquiries: 6,
        lastActivity: new Date(2026, 1, 1, 11, 15),
      },
    },
    activity: {
      recentMilestones: [
        {
          id: "sm4",
          timestamp: new Date(2026, 1, 1, 11, 15),
          type: "quote_shared",
          description: "Quote submitted for Metal Alloys",
          enquiryId: "ENQ-2402",
        },
      ],
      engagementScore: 92,
      avgResponseTime: "5 hours",
      responseRate: 85,
      conversionRate: 78,
      avgTimeToConversion: "3 days",
      quoteResponsiveness: "Excellent - avg response time 5 hours",
    },
    risk: {
      deliveryRisk: "low",
      disputeHistory: 0,
      internalNotes: [
        "Excellent supplier with fast turnaround",
        "Strong delivery track record",
      ],
      flags: [],
    },
    sellerQuickSignals: {
      quoteSpeedHours: 5,
      deliveryReliabilityPercent: 94,
      priceCompetitiveness: "competitive",
      riskLevel: "low",
    },
    sellerAIInsights: [
      {
        id: "sai5",
        type: "routing",
        title: "Best for Specialty Metals",
        message: "Seller specializes in metal alloys and specialty products. Strong performance on custom orders.",
        confidenceLevel: "high",
      },
      {
        id: "sai6",
        type: "pricing",
        title: "Competitive Specialty Pricing",
        message: "Seller offers competitive pricing on specialty metals with flexible MOQ requirements.",
        confidenceLevel: "high",
      },
    ],
    sellerPerformance: {
      quoteAcceptanceRate: 78,
      orderConversionRate: 72,
      avgDispatchDays: 4,
    },
    sellerHistory: {
      totalEnquiriesRouted: 38,
      totalOrdersConverted: 27,
      lastOrderValue: 6500000,
      lastOrderDate: new Date(2026, 0, 25),
    },
    sellerOverview: {
      primaryCategories: ["Steel", "Metal Alloys", "Copper"],
      typicalOrderSizeRange: {
        min: 3000000,
        max: 15000000,
      },
      preferredDeliveryRegions: ["West", "South"],
      creditSupportAvailable: true,
      lastActiveDate: new Date(2026, 1, 1),
    },
  },
  s_4: {
    entityType: "seller",
    entityId: "s_4",
    personaId: "s_4",
    displayName: "Apex Alloys",
    overview: {
      legalName: "Apex Alloys Private Limited",
      entityType: "Manufacturer",
      primaryLocation: "Bangalore, Karnataka",
      sellerType: "manufacturer",
      categoriesSupplied: ["Alloys", "Specialty Steel", "Aluminum"],
      onboardingLevel: "verified",
      status: "active",
      relationship: {
        assignedTo: "Neha Gupta",
        assignedToRole: "CM",
      },
      stats: {
        activeEnquiries: 5,
        lastActivity: new Date(2026, 0, 31, 15, 0),
      },
    },
    activity: {
      recentMilestones: [
        {
          id: "sm5",
          timestamp: new Date(2026, 0, 31, 15, 0),
          type: "response_received",
          description: "Responded to delivery timeline query",
          enquiryId: "ENQ-2407",
        },
      ],
      engagementScore: 80,
      avgResponseTime: "12 hours",
      responseRate: 78,
      conversionRate: 68,
      avgTimeToConversion: "4.5 days",
      quoteResponsiveness: "Good - avg response time 12 hours",
    },
    risk: {
      deliveryRisk: "low",
      disputeHistory: 0,
      internalNotes: [
        "Reliable supplier for specialty alloys",
        "Competitive pricing on bulk orders",
      ],
      flags: [],
    },
    sellerQuickSignals: {
      quoteSpeedHours: 12,
      deliveryReliabilityPercent: 86,
      priceCompetitiveness: "competitive",
      riskLevel: "low",
    },
    sellerAIInsights: [
      {
        id: "sai7",
        type: "routing",
        title: "Specialty Alloys Expert",
        message: "Seller excels in specialty alloys and custom specifications. Best for technical requirements.",
        confidenceLevel: "high",
      },
      {
        id: "sai8",
        type: "pricing",
        title: "Volume Discount Available",
        message: "Seller offers 8-12% discount on bulk orders above 100 MT. Negotiate for larger volumes.",
        confidenceLevel: "high",
      },
    ],
    sellerPerformance: {
      quoteAcceptanceRate: 68,
      orderConversionRate: 62,
      avgDispatchDays: 6,
    },
    sellerHistory: {
      totalEnquiriesRouted: 28,
      totalOrdersConverted: 17,
      lastOrderValue: 4500000,
      lastOrderDate: new Date(2026, 0, 22),
    },
    sellerOverview: {
      primaryCategories: ["Alloys", "Specialty Steel", "Aluminum"],
      typicalOrderSizeRange: {
        min: 2000000,
        max: 10000000,
      },
      preferredDeliveryRegions: ["South", "East"],
      creditSupportAvailable: true,
      lastActiveDate: new Date(2026, 0, 31),
    },
  },
  s_5: {
    entityType: "seller",
    entityId: "s_5",
    personaId: "s_5",
    displayName: "National Steel Corp",
    overview: {
      legalName: "National Steel Corporation",
      entityType: "Manufacturer",
      primaryLocation: "Jamshedpur, Jharkhand",
      sellerType: "manufacturer",
      categoriesSupplied: ["Construction Steel", "TMT Bars", "Wire Rods"],
      onboardingLevel: "verified",
      status: "blocked",
      relationship: {
        assignedTo: "Priya Sharma",
        assignedToRole: "CM",
      },
      stats: {
        activeEnquiries: 0,
        lastActivity: new Date(2025, 11, 20, 10, 0),
      },
    },
    activity: {
      recentMilestones: [
        {
          id: "sm6",
          timestamp: new Date(2025, 11, 20, 10, 0),
          type: "response_received",
          description: "Last response before suspension",
          enquiryId: "ENQ-2301",
        },
      ],
      engagementScore: 38,
      avgResponseTime: "45 hours",
      responseRate: 50,
      conversionRate: 25,
      avgTimeToConversion: "12 days",
      quoteResponsiveness: "Very Poor - avg response time 45 hours",
    },
    risk: {
      deliveryRisk: "high",
      disputeHistory: 3,
      internalNotes: [
        "Multiple delayed shipments - currently suspended",
        "Payment disputes pending resolution",
        "Do not route new enquiries until issues resolved",
      ],
      flags: [
        {
          id: "f4",
          severity: "critical",
          label: "Suspended Seller",
          description: "3 pending disputes - seller suspended until resolution",
        },
        {
          id: "f5",
          severity: "warning",
          label: "Payment Issues",
          description: "Delayed payments causing supply chain disruptions",
        },
      ],
    },
    sellerQuickSignals: {
      quoteSpeedHours: 45,
      deliveryReliabilityPercent: 45,
      priceCompetitiveness: "budget",
      riskLevel: "high",
    },
    sellerAIInsights: [
      {
        id: "sai9",
        type: "risk",
        title: "High Risk - Avoid",
        message: "Seller has multiple unresolved disputes and poor delivery track record. Not recommended for new enquiries.",
        confidenceLevel: "high",
      },
    ],
    sellerPerformance: {
      quoteAcceptanceRate: 25,
      orderConversionRate: 18,
      avgDispatchDays: 15,
    },
    sellerHistory: {
      totalEnquiriesRouted: 22,
      totalOrdersConverted: 4,
      lastOrderValue: 2800000,
      lastOrderDate: new Date(2025, 11, 5),
    },
    sellerOverview: {
      primaryCategories: ["Construction Steel", "TMT Bars", "Wire Rods"],
      typicalOrderSizeRange: {
        min: 1500000,
        max: 7000000,
      },
      preferredDeliveryRegions: ["East"],
      creditSupportAvailable: false,
      lastActiveDate: new Date(2025, 11, 20),
    },
  },
};

/**
 * Get profile data for a persona
 */
export function getProfileData(personaId: string): ProfileData | null {
  // Check buyers first
  if (personaId.startsWith("p_buyer_")) {
    return BUYER_PROFILES[personaId] || null;
  }
  
  // Check sellers - support both seller IDs (s_1) and persona IDs (p_seller_1)
  if (personaId.startsWith("s_")) {
    return SELLER_PROFILES[personaId] || null;
  }
  
  // Map seller persona IDs to seller IDs
  if (personaId.startsWith("p_seller_")) {
    // Extract number from p_seller_1 -> 1
    const sellerNum = personaId.replace("p_seller_", "");
    const sellerId = `s_${sellerNum}`;
    return SELLER_PROFILES[sellerId] || null;
  }
  
  // Check CMs (internal team members) - return basic profile
  if (personaId.startsWith("p_cm_")) {
    return getCMProfileData(personaId);
  }
  
  // Check CX (internal team members) - return basic profile  
  if (personaId.startsWith("p_cx_")) {
    return getCXProfileData(personaId);
  }
  
  // Check BDMs (internal team members) - return basic profile
  if (personaId.startsWith("p_bdm_")) {
    return getBDMProfileData(personaId);
  }
  
  return null;
}

/**
 * Get CM profile data (internal team member)
 */
function getCMProfileData(personaId: string): ProfileData | null {
  const cmData: Record<string, { name: string; category: string; email: string; phone: string }> = {
    p_cm_north: { name: "Priya Sharma", category: "Steel", email: "priya.sharma@birlapivot.com", phone: "+91 98765 00210" },
    p_cm_south: { name: "Meera Iyer", category: "Polymer", email: "meera.iyer@birlapivot.com", phone: "+91 98765 00211" },
    p_cm_east: { name: "Rajesh Kumar", category: "Cement", email: "rajesh.kumar@birlapivot.com", phone: "+91 98765 00212" },
    p_cm_west: { name: "Aditya Verma", category: "Bitumen", email: "aditya.verma@birlapivot.com", phone: "+91 98765 00213" },
  };

  const cm = cmData[personaId];
  if (!cm) return null;

  return {
    entityType: "seller", // Use seller type as workaround for internal profiles
    entityId: personaId,
    personaId: personaId,
    displayName: cm.name,
    contact: {
      email: cm.email,
      phone: cm.phone,
    },
    overview: {
      legalName: `${cm.name}`,
      entityType: "Category Manager",
      primaryLocation: "Birla Pivot - Internal Team",
      status: "active",
      relationship: {
        assignedTo: "Internal Team",
        assignedToRole: "CM",
      },
      stats: {
        activeEnquiries: 0, // Will be calculated dynamically
        lastActivity: new Date(),
      },
      categoriesSupplied: [cm.category],
    },
    activity: {
      recentMilestones: [],
      engagementScore: 85,
      avgResponseTime: "5 hours",
      responseRate: 90,
      conversionRate: 75,
      avgTimeToConversion: "4 days",
    },
    risk: {
      internalNotes: [`Category Manager for ${cm.category}`],
      disputeHistory: 0,
      flags: [],
    },
  };
}

/**
 * Get CX profile data (internal team member)
 */
function getCXProfileData(personaId: string): ProfileData | null {
  if (personaId !== "p_cx_1") return null;

  return {
    entityType: "seller", // Use seller type as workaround for internal profiles
    entityId: personaId,
    personaId: personaId,
    displayName: "Sneha Reddy",
    contact: {
      email: "sneha.reddy@birlapivot.com",
      phone: "+91 98765 00301",
    },
    overview: {
      legalName: "Sneha Reddy",
      entityType: "Customer Experience Manager",
      primaryLocation: "Birla Pivot - Internal Team",
      status: "active",
      relationship: {
        assignedTo: "Internal Team",
        assignedToRole: "CX",
      },
      stats: {
        activeEnquiries: 0,
        lastActivity: new Date(),
      },
    },
    activity: {
      recentMilestones: [],
      engagementScore: 90,
      avgResponseTime: "15 minutes",
      responseRate: 95,
      conversionRate: 80,
      avgTimeToConversion: "3 days",
    },
    risk: {
      internalNotes: ["Customer Experience Manager - ensures buyer satisfaction"],
      disputeHistory: 0,
      flags: [],
    },
  };
}

/**
 * Get BDM profile data (internal team member)
 */
function getBDMProfileData(personaId: string): ProfileData | null {
  const bdmData: Record<string, { name: string; email: string; phone: string }> = {
    p_bdm_1: { name: "Amit Kumar", email: "amit.kumar@birlapivot.com", phone: "+91 98765 00101" },
    p_bdm_2: { name: "Priya Singh", email: "priya.singh@birlapivot.com", phone: "+91 98765 00102" },
  };

  const bdm = bdmData[personaId];
  if (!bdm) return null;

  return {
    entityType: "seller", // Use seller type as workaround for internal profiles
    entityId: personaId,
    personaId: personaId,
    displayName: bdm.name,
    contact: {
      email: bdm.email,
      phone: bdm.phone,
    },
    overview: {
      legalName: bdm.name,
      entityType: "Business Development Manager",
      primaryLocation: "Birla Pivot - Internal Team",
      status: "active",
      relationship: {
        assignedTo: "Internal Team",
        assignedToRole: "BDM",
      },
      stats: {
        activeEnquiries: 0,
        lastActivity: new Date(),
      },
    },
    activity: {
      recentMilestones: [],
      engagementScore: 88,
      avgResponseTime: "3 hours",
      responseRate: 92,
      conversionRate: 78,
      avgTimeToConversion: "3.5 days",
    },
    risk: {
      internalNotes: ["Business Development Manager - client relationship owner"],
      disputeHistory: 0,
      flags: [],
    },
  };
}

/**
 * Get available pages for a profile based on entity type and role
 */
export function getAvailablePages(
  entityType: "buyer" | "seller",
  viewerRole: Role
): ProfileCardPage[] {
  // Insights first for buyers
  if (entityType === "buyer") {
    const pages: ProfileCardPage[] = ["activity", "overview"];
    pages.push("credit");
    
    // Risk page only for internal roles
    if (viewerRole === "BDM" || viewerRole === "CM" || viewerRole === "CX") {
      pages.push("risk");
    }
    
    return pages;
  }
  
  // Seller pages
  const pages: ProfileCardPage[] = ["overview", "activity"];
  
  // Risk page only for internal roles
  if (viewerRole === "BDM" || viewerRole === "CM" || viewerRole === "CX") {
    pages.push("risk");
  }
  
  return pages;
}
