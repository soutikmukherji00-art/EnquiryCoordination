/**
 * Domain: Enquiry Record
 * 
 * Defines the rich metadata snapshot captured at the moment of enquiry creation.
 * This record is populated from the EnquiryIntake and any relevant buyer 
 * default data. It acts as the single source of truth for UI surfaces (Pluto, Prism)
 * to project structured information without cluttering the lean state-machine Enquiry entity.
 */

import { EnquiryIntake } from "./enquiry.intake";
import { getPersonaById } from "@/domain/persona/persona.data";
import { resolveIntakeBuyerName } from "./enquiry.intake";
import { getBuyerDefaultsForEnquiry } from "./enquiry.schema";

export type EnquiryCreationSource = 
  | "pluto-detailed-rfq"
  | "pluto-quick-rfq"
  | "pluto-direct-order"
  | "prism-manual"
  | "mail-intake"
  | "whatsapp-intake"
  | "thread-tag"
  | "share";

export interface EnquiryRecord {
  enquiryId: string;
  createdAt: Date;
  creationSource: EnquiryCreationSource;

  // --- Buyer Block ---
  buyer: {
    id?: string;          // buyerId
    personaId?: string;
    name: string;         // resolved display name
    company?: string;
    gstin?: string;
    creditLimit?: number;
    openCreditLimit?: number;
    primaryContact?: string; // primary contact name/phone
  };

  // --- Requirements Block ---
  requirements: {
    categories: string[];
    deliveryLocation?: string;
    deliveryLocations?: string[];  // All buyer locations for reference
    etaDays?: number;
    paymentTerms?: string;
    estimatedValue?: number;
    notes?: string;
    isParentQuote?: boolean;
    scopeOfUnloading?: string;    // From Detailed RFQ step 1
  };

  // --- Assignment Block ---
  assignment: {
    primaryCMId?: string;
    primaryCMName?: string;
    bdmPersonaId?: string;
  };

  // --- Product Block (populated from Detailed RFQ step 2) ---
  products?: Array<{
    category: string;
    brand?: string;
    grade?: string;
    name?: string;     // Generic descriptor if available
    quantity?: string; // e.g., "50 MT"
    specifications?: string;
    quantities?: Record<string, number>; // diameter -> qty in MT
  }>;
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
  source: EnquiryCreationSource,
  bdmPersonaId?: string
): EnquiryRecord {
  const buyerId = intake.buyer.buyerId;
  const defaults = buyerId ? getBuyerDefaultsForEnquiry(buyerId, "DetailedRFQ") : undefined;

  let cmName: string | undefined;
  if (intake.requirements.primaryCMId) {
    const cmPersona = getPersonaById(intake.requirements.primaryCMId);
    cmName = cmPersona?.displayName;
  }

  // Use values from intake if available, otherwise fallback to defaults, otherwise undefined.
  return {
    enquiryId,
    createdAt: new Date(),
    creationSource: source,
    buyer: {
      id: buyerId,
      personaId: intake.buyer.personaId,
      name: intake.buyer.resolvedName || resolveIntakeBuyerName(intake.buyer),
      company: intake.buyer.resolvedCompany || intake.buyer.manualCompany,
      gstin: intake.buyer.gstin || defaults?.gstin,
      creditLimit: intake.buyer.creditLimit ?? defaults?.creditLimit,
      openCreditLimit: intake.buyer.openCreditLimit ?? defaults?.openCreditLimit,
      primaryContact: intake.buyer.primaryContact,
    },
    requirements: {
      categories: intake.requirements.categories as string[],
      deliveryLocation: intake.requirements.deliveryLocation || defaults?.deliveryLocation,
      deliveryLocations: defaults?.deliveryLocations,
      etaDays: intake.requirements.etaDays,
      paymentTerms: intake.requirements.paymentTerms || defaults?.paymentTerms,
      estimatedValue: intake.requirements.estimatedValue,
      notes: intake.requirements.notes,
      isParentQuote: intake.requirements.isParentQuote,
    },
    assignment: {
      primaryCMId: intake.requirements.primaryCMId,
      primaryCMName: cmName,
      bdmPersonaId,
    },
    // Future expansion: map specific product details from intake if we extend the Intake type.
    products: undefined, 
  };
}
