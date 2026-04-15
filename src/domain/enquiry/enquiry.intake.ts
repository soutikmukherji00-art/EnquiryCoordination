/**
 * Domain: Enquiry Intake
 *
 * Unified model for creating enquiries from any medium. Surface-agnostic: no workspace names.
 */

import type { Category } from "@/domain/category/category.types";
import type { Message } from "@/domain/message/message.types";
import type { DraftEnquiryDocument, DraftVoiceNote } from "./enquiry.creation";

/**
 * Unified Buyer Info for intake
 */
export interface EnquiryIntakeBuyer {
  personaId?: string; // Existing persona ID
  buyerId?: string;   // Existing buyer data ID
  manualName?: string;    // Name for new/unresolved buyer
  manualCompany?: string; // Company for new/unresolved buyer
  // Resolved at creation from buyer data tree:
  resolvedName?: string;
  resolvedCompany?: string;
  gstin?: string;
  creditLimit?: number;
  openCreditLimit?: number;
  primaryContact?: string;
}

/**
 * Unified Requirements for intake
 */
export interface EnquiryIntakeRequirements {
  categories: Category[];
  estimatedValue?: number;
  paymentTerms?: string;
  etaDays?: number;
  notes?: string;
  isParentQuote?: boolean;
  deliveryLocation?: string;
  primaryCMId?: string;
  scopeOfUnloading?: string;
  enhancerTypes?: string[];
  iddDays?: number;
  mddDays?: number;
}

export interface EnquiryIntakeDirectOrderLineItem {
  category: string;
  brand?: string;
  grade?: string;
  name?: string;
  quantity?: string;
  specifications?: string;
  quantities?: Record<string, number>;
}

export interface EnquiryIntakeDirectOrderSnapshot {
  rfqNumber: string;
  buyerCrmCode: string;
  poNumber: string;
  shippingAddress: string;
  billingAddress: string;
  paymentTerms: string;
  incoterms: string;
  assignedCmId: string;
  lineItems: EnquiryIntakeDirectOrderLineItem[];
}

/**
 * Unified Source Metadata
 */
export interface EnquiryIntakeSource {
  /**
   * Where intake was captured. `internal` = in-app guided RFQ flows; `manual` = generic create form.
   */
  medium: "manual" | "share" | "mail" | "whatsapp" | "website" | "thread" | "internal";
  /** Quick vs detailed RFQ when applicable (any client can set this). */
  rfqMode?: "quick" | "detailed";
  /** When set, record origin becomes direct_order and defaults use DirectOrder schema. */
  orderIntent?: "direct_order";
  threadId?: string;
  messages?: Message[];
  attachments?: DraftEnquiryDocument[];
  voiceNote?: DraftVoiceNote | null;
  directOrderSnapshot?: EnquiryIntakeDirectOrderSnapshot;
}

/**
 * Unified Enquiry Intake Model
 */
export interface EnquiryIntake {
  buyer: EnquiryIntakeBuyer;
  requirements: EnquiryIntakeRequirements;
  source: EnquiryIntakeSource;
}

/**
 * Helper to resolve buyer name for display
 */
export function resolveIntakeBuyerName(buyer: EnquiryIntakeBuyer): string {
  return buyer.manualName || "Unknown Buyer";
}
