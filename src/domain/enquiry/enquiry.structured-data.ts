/**
 * Structured Data Utilities
 * 
 * Handles generation of contextual structured data for enquiries
 * based on category and product type.
 */

import { Enquiry } from "./enquiry.types";

export interface StructuredData {
  buyer: {
    name: string;
    contact: string;
    company: string;
    aiExtracted: boolean;
  };
  products: Array<{
    name: string;
    quantity: string;
    specifications: string;
    aiExtracted: boolean;
  }>;
  commercial: {
    paymentTerms: string;
    deliveryTerms: string;
    validityPeriod: string;
    aiExtracted: boolean;
  };
}

const EMPTY_STRUCTURED_DATA: StructuredData = {
  buyer: {
    name: "",
    contact: "",
    company: "",
    aiExtracted: false,
  },
  products: [],
  commercial: {
    paymentTerms: "",
    deliveryTerms: "",
    validityPeriod: "",
    aiExtracted: false,
  },
};

/**
 * Determine enquiry category from product category or ID
 */
function getEnquiryCategory(enquiry: Enquiry): 'steel' | 'polymer' | 'cement' | 'other' {
  const category = enquiry.productCategory?.toLowerCase() || '';
  
  if (category.includes('steel') || enquiry.id.includes('2502')) {
    return 'steel';
  }
  if (category.includes('polymer')) {
    return 'polymer';
  }
  if (category.includes('cement')) {
    return 'cement';
  }
  return 'other';
}

/**
 * Get products for each category
 */
function getProductsByCategory(category: ReturnType<typeof getEnquiryCategory>) {
  switch (category) {
    case 'steel':
      return [
        {
          name: "TMT Steel Bars - Grade 500D",
          quantity: "50 MT",
          specifications: "12mm, 16mm, 20mm dia, IS 1786:2008 certified",
          aiExtracted: true,
        },
        {
          name: "MS Angle - ISMC 100",
          quantity: "25 MT",
          specifications: "100x100x8mm, IS 808:1989",
          aiExtracted: true,
        },
      ];
    case 'polymer':
      return [
        {
          name: "HDPE Granules - Virgin Grade",
          quantity: "10 MT",
          specifications: "Injection molding grade, MFI: 0.3-0.4 g/10min",
          aiExtracted: true,
        },
      ];
    case 'cement':
      return [
        {
          name: "OPC 53 Grade Cement",
          quantity: "500 bags (25 MT)",
          specifications: "IS 12269:2013 certified, 28-day strength >53 MPa",
          aiExtracted: true,
        },
      ];
    default:
      return [
        {
          name: "Industrial Raw Materials",
          quantity: "TBD",
          specifications: "As per technical specifications",
          aiExtracted: false,
        },
      ];
  }
}

/**
 * Get delivery terms by category
 */
function getDeliveryTerms(category: ReturnType<typeof getEnquiryCategory>): string {
  switch (category) {
    case 'steel':
      return "Ex-works, Jamshedpur";
    case 'polymer':
      return "FOB Mumbai Port";
    case 'cement':
      return "Door delivery within 15 days";
    default:
      return "As per agreement";
  }
}

/**
 * Generate contextual structured data for an enquiry
 */
export function generateStructuredData(enquiry: Enquiry | null): StructuredData {
  if (!enquiry) {
    return EMPTY_STRUCTURED_DATA;
  }

  const category = getEnquiryCategory(enquiry);
  
  return {
    buyer: {
      name: enquiry.buyerName || "Ramesh Industries",
      contact: "+91 98765 43210",
      company: enquiry.buyerName || "Ramesh Industries",
      aiExtracted: true,
    },
    products: getProductsByCategory(category),
    commercial: {
      paymentTerms: "30% advance, 70% against delivery",
      deliveryTerms: getDeliveryTerms(category),
      validityPeriod: "15 days from quote date",
      aiExtracted: true,
    },
  };
}

/**
 * Generate AI summary based on enquiry category
 */
export function generateAISummary(enquiry: Enquiry | null): string {
  if (!enquiry) {
    return "Select an enquiry to view AI-generated summary...";
  }

  const category = getEnquiryCategory(enquiry);

  switch (category) {
    case 'steel':
      return "Enquiry for 75 MT of construction steel materials including TMT bars (50 MT) in various diameters and MS angles (25 MT). Buyer requires IS-certified products for an ongoing infrastructure project in North India. Delivery timeline is critical - need within 2 weeks. Previous orders suggest buyer prefers JSW/SAIL brands.";
    
    case 'polymer':
      return "Request for 10 MT virgin HDPE granules for injection molding applications. Buyer manufactures automotive components and requires consistent quality with MFI specifications. Looking for long-term supplier relationship with monthly volumes of 10-15 MT. Price sensitivity moderate, quality is primary concern.";
    
    case 'cement':
      return "Bulk order for 500 bags (25 MT) of OPC 53 grade cement for residential construction project. Buyer is a mid-sized contractor working on 3-story apartment complex. Requires IS-certified product with door delivery. Has potential for repeat orders - project will need ~200 MT total over 6 months.";
    
    default:
      return `Enquiry from ${enquiry.buyerName} for ${enquiry.productCategory || 'industrial materials'}. Analyzing conversation history to extract product requirements, quantities, and commercial terms. This summary will be automatically updated as more information becomes available through the conversation.`;
  }
}