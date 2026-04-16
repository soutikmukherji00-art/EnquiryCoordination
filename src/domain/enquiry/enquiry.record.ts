/**
 * Domain: Enquiry Record
 *
 * Rich metadata snapshot for an enquiry. Populated from EnquiryIntake and buyer defaults.
 * Single source of truth for structured fields across clients; not tied to any UI shell.
 */

import { EnquiryIntake } from "./enquiry.intake";
import { getPersonaById } from "@/domain/persona/persona.data";
import { resolveIntakeBuyerName } from "./enquiry.intake";
import { getBuyerDefaultsForEnquiry, type EnquiryCreationType } from "./enquiry.schema";
import { getBuyerById, getPrimaryContactForBuyer } from "@/domain/buyer/buyer.mock-data";
import type { DraftEnquiryDocument, DraftVoiceNote } from "./enquiry.creation";

/** Rich preview of an inbound email (mock / hydration); optional on EnquiryRecord. */
export interface EnquirySourceEmailCorrespondence {
  kind: "email";
  subject: string;
  from: string;
  to: string;
  receivedAt: string;
  body: string;
}

/** Neutral provenance for an enquiry record (no workspace/product surface names). */
export type EnquiryRecordOrigin =
  | "detailed_rfq"
  | "quick_rfq"
  | "direct_order"
  | "manual"
  | "mail_intake"
  | "whatsapp_intake"
  | "website_intake"
  | "thread_tag"
  | "share";

/** Persisted BDM-selected response mode for routing after initial draft preview. */
export type EnquiryResponseMode = "quick" | "detailed" | "direct";

const LEGACY_ORIGIN_MAP: Record<string, EnquiryRecordOrigin> = {
  "pluto-detailed-rfq": "detailed_rfq",
  "pluto-quick-rfq": "quick_rfq",
  "pluto-direct-order": "direct_order",
  "prism-manual": "manual",
  "mail-intake": "mail_intake",
  "whatsapp-intake": "whatsapp_intake",
  "website-intake": "website_intake",
  "thread-tag": "thread_tag",
  share: "share",
};

/** Normalize persisted or legacy labels to EnquiryRecordOrigin. */
export function coerceEnquiryRecordOrigin(raw: string | undefined): EnquiryRecordOrigin | undefined {
  if (!raw) return undefined;
  if (LEGACY_ORIGIN_MAP[raw]) return LEGACY_ORIGIN_MAP[raw];
  const known: EnquiryRecordOrigin[] = [
    "detailed_rfq",
    "quick_rfq",
    "direct_order",
    "manual",
    "mail_intake",
    "whatsapp_intake",
    "website_intake",
    "thread_tag",
    "share",
  ];
  if (known.includes(raw as EnquiryRecordOrigin)) return raw as EnquiryRecordOrigin;
  return undefined;
}

/** Normalize persisted or legacy labels to EnquiryResponseMode. */
export function coerceEnquiryResponseMode(raw: string | undefined): EnquiryResponseMode | undefined {
  if (!raw) return undefined;

  const map: Record<string, EnquiryResponseMode> = {
    quick: "quick",
    quick_rfq: "quick",
    detailed: "detailed",
    detailed_rfq: "detailed",
    direct: "direct",
    direct_order: "direct",
  };

  return map[raw];
}

export function resolveEnquiryCreationTypeForDefaults(intake: EnquiryIntake): EnquiryCreationType {
  if (intake.source.orderIntent === "direct_order") return "DirectOrder";
  if (intake.source.medium === "share") return "ShareIntake";
  if (intake.source.rfqMode === "quick") return "QuickRFQ";
  return "DetailedRFQ";
}

export function resolveRecordOriginFromIntake(intake: EnquiryIntake): EnquiryRecordOrigin {
  if (intake.source.orderIntent === "direct_order") return "direct_order";
  switch (intake.source.medium) {
    case "mail":
      return "mail_intake";
    case "whatsapp":
      return "whatsapp_intake";
    case "website":
      return "website_intake";
    case "thread":
      return "thread_tag";
    case "share":
      return "share";
    case "internal":
      return intake.source.rfqMode === "quick" ? "quick_rfq" : "detailed_rfq";
    case "manual":
      return intake.source.rfqMode === "quick" ? "quick_rfq" : "manual";
    default:
      return "manual";
  }
}

export interface EnquiryRecord {
  enquiryId: string;
  createdAt: Date;
  /** How this record entered the system (neutral provenance). */
  origin: EnquiryRecordOrigin;
  /** BDM-selected mode used to continue response flow after first draft preview. */
  responseMode?: EnquiryResponseMode;
  isNew?: boolean;

  // --- Buyer Block ---
  buyer: {
    id?: string;
    personaId?: string;
    name: string;
    company?: string;
    gstin?: string;
    creditLimit?: number;
    openCreditLimit?: number;
    primaryContact?: string;
  };

  // --- Requirements Block ---
  requirements: {
    categories: string[];
    deliveryLocation?: string;
    deliveryLocations?: string[];
    etaDays?: number;
    paymentTerms?: string;
    billingPreference?: string;
    billingAddress?: string;
    poNumber?: string;
    poReceivedDate?: string;
    poReceivedTime?: string;
    invoiceTermsAndConditions?: string;
    estimatedValue?: number;
    notes?: string;
    isParentQuote?: boolean;
    scopeOfUnloading?: string;
    enhancerTypes?: string[];
    iddDays?: number;
    mddDays?: number;
  };

  // --- Assignment Block ---
  assignment: {
    primaryCMId?: string;
    primaryCMName?: string;
    bdmPersonaId?: string;
  };

  // --- Product Block ---
  products?: Array<{
    category: string;
    brand?: string;
    grade?: string;
    name?: string;
    quantity?: string;
    specifications?: string;
    quantities?: Record<string, number>;
    offeredQuantity?: string;
    sellerBasePrice?: number;
    buyerPrice?: number;
    itemTotalBuyerPrice?: number;
  }>;

  // --- Seller Block ---
  sellerDetails?: {
    sellerId?: string;
    sellerName?: string;
    warehouseName?: string;
    paymentTerms?: "credit" | "advance";
    buyerCreditDays?: number;
    sellerCreditDays?: number;
    deliveryEtaFromOrderDate?: string;
    rateExpiryDate?: string;
  };

  // --- Logistics Block ---
  logisticsDetails?: {
    provider?: "buyer_shipped" | "seller_shipped" | "bp_shipped";
    incoterms?: string;
    estimatedWeight?: number;
    bpShippedPaymentMode?: "foi" | "for" | "to_pay";
    bpShippedRatePerMt?: number;
    totalTonnage?: number;
    minLoadingGuarantee?: number;
    bpShippedRateType?: "per_ton" | "per_vehicle";
    transporterId?: string;
    transporterName?: string;
    logisticsManagerId?: string;
    logisticsManagerName?: string;
    baseShippingChargesToTransporter?: number;
    totalShippingChargesToTransporter?: number;
    totalShippingChargesToBuyer?: number;
  };

  // --- Media Block ---
  attachments?: DraftEnquiryDocument[];
  voiceNote?: DraftVoiceNote | null;

  /** Optional source message shape for email-origin enquiries (demo / intake preview). */
  sourceCorrespondence?: EnquirySourceEmailCorrespondence;
  /** Optional full email chain for mail-origin enquiries (oldest to newest). */
  sourceCorrespondences?: EnquirySourceEmailCorrespondence[];
}

export type EnquiryRecordStore = Record<string, EnquiryRecord>;

export function resolveEnquiryRecord(store: EnquiryRecordStore | undefined, enquiryId: string): EnquiryRecord | undefined {
  if (!store) return undefined;
  return store[enquiryId];
}

/**
 * Builds the rich enquiry record from the creation intake data.
 * Merges explicit intake requirements with the buyer's default data tree.
 */
export function buildEnquiryRecordFromIntake(
  enquiryId: string,
  intake: EnquiryIntake,
  bdmPersonaId?: string,
  options?: { originOverride?: EnquiryRecordOrigin },
): EnquiryRecord {
  const buyerId = intake.buyer.buyerId;
  const creationType = resolveEnquiryCreationTypeForDefaults(intake);
  const defaults = buyerId ? getBuyerDefaultsForEnquiry(buyerId, creationType) : undefined;
  const buyerFromTree = buyerId ? getBuyerById(buyerId) : undefined;
  const primaryContact = buyerId ? getPrimaryContactForBuyer(buyerId) : undefined;

  let cmName: string | undefined;
  if (intake.requirements.primaryCMId) {
    const cmPersona = getPersonaById(intake.requirements.primaryCMId);
    cmName = cmPersona?.displayName;
  }

  const origin = options?.originOverride ?? resolveRecordOriginFromIntake(intake);
  const directOrderSnapshot = intake.source.directOrderSnapshot;
  const directOrderProducts = directOrderSnapshot?.lineItems?.length
    ? directOrderSnapshot.lineItems.map((line) => ({
        category: line.category,
        brand: line.brand,
        grade: line.grade,
        name: line.name,
        quantity: line.quantity,
        specifications: line.specifications,
        quantities: line.quantities,
        offeredQuantity: line.quantity,
        sellerBasePrice: undefined,
        buyerPrice: undefined,
        itemTotalBuyerPrice: undefined,
      }))
    : undefined;
  const buyerCreditDays = resolveBuyerCreditDays(defaults?.paymentTerms);
  const sellerPaymentTerms = (intake.requirements.paymentTerms || defaults?.paymentTerms || "advance").toLowerCase() === "credit"
    ? "credit"
    : "advance";

  return {
    enquiryId,
    createdAt: new Date(),
    origin,
    isNew: true,
    buyer: {
      id: buyerId,
      personaId: intake.buyer.personaId,
      name: buyerFromTree?.name || intake.buyer.resolvedName || resolveIntakeBuyerName(intake.buyer),
      company: intake.buyer.resolvedCompany || intake.buyer.manualCompany || buyerFromTree?.name,
      gstin: intake.buyer.gstin || defaults?.gstin,
      creditLimit: intake.buyer.creditLimit ?? defaults?.creditLimit,
      openCreditLimit: intake.buyer.openCreditLimit ?? defaults?.openCreditLimit,
      primaryContact: intake.buyer.primaryContact || primaryContact?.name,
    },
    requirements: {
      categories: intake.requirements.categories as string[],
      deliveryLocation:
        intake.requirements.deliveryLocation ||
        directOrderSnapshot?.shippingAddress ||
        defaults?.deliveryLocation,
      deliveryLocations: defaults?.deliveryLocations,
      etaDays: intake.requirements.etaDays,
      paymentTerms: intake.requirements.paymentTerms || defaults?.paymentTerms,
      billingPreference: undefined,
      billingAddress: undefined,
      poNumber: directOrderSnapshot?.poNumber,
      poReceivedDate: undefined,
      poReceivedTime: undefined,
      invoiceTermsAndConditions: undefined,
      estimatedValue: intake.requirements.estimatedValue,
      notes: intake.requirements.notes,
      isParentQuote: intake.requirements.isParentQuote,
      scopeOfUnloading: intake.requirements.scopeOfUnloading,
      enhancerTypes: intake.requirements.enhancerTypes,
      iddDays: intake.requirements.iddDays,
      mddDays: intake.requirements.mddDays,
    },
    assignment: {
      primaryCMId: intake.requirements.primaryCMId,
      primaryCMName: cmName,
      bdmPersonaId,
    },
    sellerDetails: {
      sellerId: undefined,
      sellerName: undefined,
      warehouseName: defaults?.deliveryLocations?.[0],
      paymentTerms: sellerPaymentTerms,
      buyerCreditDays,
      sellerCreditDays: sellerPaymentTerms === "credit" ? buyerCreditDays : 0,
      deliveryEtaFromOrderDate: undefined,
      rateExpiryDate: undefined,
    },
    logisticsDetails: {
      provider: undefined,
      incoterms: undefined,
      estimatedWeight: undefined,
      bpShippedPaymentMode: undefined,
      bpShippedRatePerMt: undefined,
      totalTonnage: undefined,
      minLoadingGuarantee: undefined,
      bpShippedRateType: undefined,
      transporterId: undefined,
      transporterName: undefined,
      logisticsManagerId: undefined,
      logisticsManagerName: undefined,
      baseShippingChargesToTransporter: undefined,
      totalShippingChargesToTransporter: undefined,
      totalShippingChargesToBuyer: undefined,
    },
    products: directOrderProducts,
    attachments: intake.source.attachments,
    voiceNote: intake.source.voiceNote,
  };
}

function resolveBuyerCreditDays(paymentTerms?: string): number {
  if (!paymentTerms) return 0;
  const match = paymentTerms.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}
