/**
 * Domain: Enquiry Intake
 * 
 * Unified model for creating enquiries from any medium (Manual, Share, Mail, WhatsApp, Pluto).
 * This decouples the intake source from the domain creation logic.
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
}

/**
 * Unified Source Metadata
 */
export interface EnquiryIntakeSource {
  medium: "manual" | "share" | "mail" | "whatsapp" | "thread" | "pluto";
  threadId?: string;
  messages?: Message[];
  attachments?: DraftEnquiryDocument[];
  voiceNote?: DraftVoiceNote | null;
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
