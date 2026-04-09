/**
 * Domain: Enquiry Schema Layer
 * 
 * Defines data requirements based on specific Enquiry Types,
 * and fetches the necessary default data from mapped buyer data trees.
 */

import { getBuyerById } from "@/domain/buyer/buyer.mock-data";
import { EnquiryIntakeRequirements } from "./enquiry.intake";

export type EnquiryCreationType = "DetailedRFQ" | "QuickRFQ" | "DirectOrder" | "ShareIntake";

export interface EnquiryFieldDef {
  key: keyof EnquiryIntakeRequirements;
  label: string;
  required: boolean;
  type: "string" | "number" | "boolean" | "category_array" | "select";
  options?: string[]; // optionally for selects
}

export interface EnquiryMappedDefaults {
  deliveryLocation?: string;
  paymentTerms?: string;
  creditLimit?: number;
  openCreditLimit?: number;
  gstin?: string;
  etaDays?: string; // Default SLA ETA
  deliveryLocations?: string[];
}

/**
 * Get schema of fields required for a specific type of Enquiry Creation.
 */
export function getEnquirySchema(type: EnquiryCreationType): EnquiryFieldDef[] {
  switch (type) {
    case "DetailedRFQ":
      return [
        { key: "categories", label: "Category", required: true, type: "category_array" },
        { key: "deliveryLocation", label: "Delivery Location", required: true, type: "select" },
        { key: "notes", label: "Additional Notes", required: false, type: "string" },
        { key: "isParentQuote", label: "Is Parent Quote", required: false, type: "boolean" },
      ];
    case "QuickRFQ":
      return [
        { key: "categories", label: "Category", required: true, type: "category_array" },
        { key: "deliveryLocation", label: "State/Region", required: false, type: "select" },
        { key: "notes", label: "Description", required: true, type: "string" },
      ];
    case "DirectOrder":
      return [
        { key: "categories", label: "Category", required: true, type: "category_array" },
        { key: "deliveryLocation", label: "Delivery Location", required: true, type: "select" },
        { key: "estimatedValue", label: "Order Amount", required: true, type: "number" },
        { key: "paymentTerms", label: "Payment Terms", required: true, type: "select" },
      ];
    case "ShareIntake":
      return [
        { key: "notes", label: "Notes", required: false, type: "string" },
      ];
    default:
      return [];
  }
}

/**
 * Central logic layer to fetch mapped defaults off the Buyer data tree 
 * specifically tailored for the selected enquiry creation type.
 */
export function getBuyerDefaultsForEnquiry(
  buyerId: string | undefined, 
  type: EnquiryCreationType
): EnquiryMappedDefaults {
  const defaultPayload: EnquiryMappedDefaults = {
    deliveryLocation: "Select location",
    paymentTerms: "advance",
    creditLimit: 0,
    openCreditLimit: 0,
    gstin: "Not Available",
    etaDays: "7",
    deliveryLocations: [],
  };

  if (!buyerId) return defaultPayload;

  const buyer = getBuyerById(buyerId);
  if (!buyer) return defaultPayload;

  // Specific overriding logic based on EnquiryType can go here,
  // currently we just populate everything from the unified Buyer mapping.
  
  if (buyer.deliveryLocations && buyer.deliveryLocations.length > 0) {
    defaultPayload.deliveryLocations = buyer.deliveryLocations;
    defaultPayload.deliveryLocation = buyer.deliveryLocations[0];
  }
  
  if (buyer.defaultPaymentTerms) {
      defaultPayload.paymentTerms = buyer.defaultPaymentTerms;
  }
  
  if (buyer.creditLimit) {
      defaultPayload.creditLimit = buyer.creditLimit;
  }
  
  if (buyer.openCreditLimit) {
      defaultPayload.openCreditLimit = buyer.openCreditLimit;
  }
  
  if (buyer.gstin) {
      defaultPayload.gstin = buyer.gstin;
  }

  // Example of type-specific defaulting
  if (type === "DetailedRFQ") {
      defaultPayload.etaDays = "14"; // Default for Detailed RFQs
  } else if (type === "QuickRFQ") {
      defaultPayload.etaDays = "3";
  }

  return defaultPayload;
}
