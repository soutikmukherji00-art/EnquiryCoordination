/**
 * Domain: Enquiry Record Selectors
 * 
 * View selectors that project data from the core EnquiryRecord into 
 * surface-specific view models or standard formats.
 */

import { EnquiryRecord } from "./enquiry.record";
import type { StructuredData } from "./enquiry.structured-data";

export interface PlutoRecordFields {
  gstin?: string;
  creditLimit?: string;
  openCreditLimit?: string;
  deliveryLocation?: string;
  paymentTerms?: string;
  etaDays?: string;
  notes?: string;
  isParentQuote?: boolean;
  primaryContactName?: string;
  creationSource?: string;
  assignedCMName?: string;
}

export function buildPlutoDetailFieldsFromRecord(record: EnquiryRecord | undefined): PlutoRecordFields {
  if (!record) return {};

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined) return undefined;
    if (val === 0) return "—";
    return `₹${val.toLocaleString("en-IN")}`;
  };

  return {
    gstin: record.buyer.gstin || "—",
    creditLimit: formatCurrency(record.buyer.creditLimit),
    openCreditLimit: formatCurrency(record.buyer.openCreditLimit),
    deliveryLocation: record.requirements.deliveryLocation || "—",
    paymentTerms: record.requirements.paymentTerms || "—",
    etaDays: record.requirements.etaDays ? `${record.requirements.etaDays} Days` : "—",
    notes: record.requirements.notes || "—",
    isParentQuote: record.requirements.isParentQuote,
    primaryContactName: record.buyer.primaryContact,
    creationSource: record.creationSource,
    assignedCMName: record.assignment.primaryCMName,
  };
}

export function buildPrismStructuredDataFromRecord(record: EnquiryRecord | undefined): StructuredData | null {
  if (!record) return null;

  // Convert real record data into the StructuredData format
  const products = (record.products || []).map((p) => ({
    name: p.name || `${p.category} ${p.brand ? "- " + p.brand : ""}`,
    quantity: p.quantity || "TBD",
    specifications: p.specifications || (p.grade ? `Grade: ${p.grade}` : ""),
    aiExtracted: false, // It's real data
  }));

  // If we have categories but no detailed products, put generic placeholders
  if (products.length === 0 && record.requirements.categories.length > 0) {
    record.requirements.categories.forEach(cat => {
      products.push({
        name: cat,
        quantity: record.requirements.estimatedValue ? `Value: ₹${record.requirements.estimatedValue.toLocaleString('en-IN')}` : "TBD",
        specifications: record.requirements.notes || "No specifications detailed.",
        aiExtracted: false,
      });
    });
  }

  return {
    buyer: {
      name: record.buyer.name,
      company: record.buyer.company || record.buyer.name,
      contact: record.buyer.primaryContact || "—",
      aiExtracted: false,
    },
    products,
    commercial: {
      paymentTerms: record.requirements.paymentTerms || "—",
      deliveryTerms: record.requirements.deliveryLocation || "—",
      validityPeriod: record.requirements.etaDays ? `${record.requirements.etaDays} Days` : "—",
      aiExtracted: false,
    },
    delivery: {
      location: record.requirements.deliveryLocation || "—",
      aiExtracted: false,
    }
  };
}

export function buildPrismSummaryFromRecord(record: EnquiryRecord | undefined): string | null {
  if (!record) return null;

  const cats = record.requirements.categories.join(", ");
  const sourceText = record.creationSource.replace("-", " ");
  let summary = `Enquiry created via ${sourceText} from ${record.buyer.name}.`;
  
  if (cats) summary += ` Categories requested: ${cats}.`;
  if (record.requirements.deliveryLocation) summary += ` Target delivery to ${record.requirements.deliveryLocation}.`;
  
  if (record.requirements.notes) {
    summary += ` Additional notes: "${record.requirements.notes}"`;
  }

  return summary;
}
