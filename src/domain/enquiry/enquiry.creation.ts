/**
 * Domain: Enquiry Creation
 * 
 * Utilities for creating new enquiries and managing creation data.
 */

import type { Category } from "@/domain/category/category.types";
import { Enquiry, EnquiryState, generateEnquiryId } from "./enquiry.types";
import type { Message } from "@/domain/message/message.types";

/**
 * Data required to create a new enquiry
 */
export interface EnquiryCreationData {
  buyerName: string;
  buyerCompany?: string;
  buyerPersonaId?: string;
  deliveryLocation?: string; // Hidden in UI, kept for backward compatibility
  productCategory?: string; // Deprecated, use categories instead
  categories?: Category[]; // Multi-select category-based CM assignment
  notes?: string;
}

/**
 * Result of creating a new enquiry
 */
export interface CreateEnquiryResult {
  enquiryId: string;
  enquiry: Partial<Enquiry>;
  initialMessages: Message[];
}

/**
 * Create a new enquiry from shared messages
 * 
 * @param data - Enquiry creation data from form
 * @param createdBy - User creating the enquiry
 * @param createdByRole - Role of the creator
 * @param existingEnquiries - Existing enquiries to generate unique ID
 * @returns New enquiry object and initial messages
 */
export const createNewEnquiry = (
  data: EnquiryCreationData,
  createdBy: string,
  createdByRole: string,
  existingEnquiries: Enquiry[]
): CreateEnquiryResult => {
  const enquiryId = generateEnquiryId(existingEnquiries);
  const timestamp = new Date();

  const enquiry: Partial<Enquiry> = {
    id: enquiryId,
    buyerName: data.buyerName,
    buyerCompany: data.buyerCompany,
    // NEW: Categories (defaults to empty if not provided)
    categories: data.categories || [],
    // Legacy support
    productCategory: data.productCategory || data.categories?.[0] || "General Inquiry",
    region: data.deliveryLocation, // Set region from delivery location
    state: "Draft" as EnquiryState,
    createdAt: timestamp,
    updatedAt: timestamp,
    priority: "medium",
    tags: [],
    notes: data.notes,
  };

  return {
    enquiryId,
    enquiry,
    initialMessages: [],
  };
};

/**
 * Prepare messages for sharing to a new enquiry
 * Clones messages with new IDs and timestamps
 * 
 * @param messages - Original messages to share
 * @param enquiryId - Target enquiry ID
 * @param timestamp - Timestamp for shared messages
 * @returns Prepared messages with new IDs
 */
export function prepareMessagesForNewEnquiry(
  messages: Message[],
  enquiryId: string,
  timestamp: Date
): Message[] {
  return messages.map((msg, index) => ({
    ...msg,
    id: `${enquiryId}-shared-${Date.now()}-${index}`,
    timestamp: new Date(timestamp.getTime() + index * 1000), // Preserve order with incremental timestamps
  }));
}

/**
 * Extract buyer information from buyer DM messages
 * Used to auto-populate buyer fields in create enquiry modal
 * 
 * @param messages - Messages from buyer DM channel
 * @returns Extracted buyer info or null
 */
export function extractBuyerInfoFromMessages(
  messages: Message[]
): { buyerName: string; buyerCompany?: string } | null {
  // Find first message from buyer (sender role = "Buyer")
  const buyerMessage = messages.find(
    (msg) => msg.type === "user" && msg.senderRole === "Buyer"
  );

  if (buyerMessage && buyerMessage.sender) {
    return {
      buyerName: buyerMessage.sender,
      buyerCompany: undefined, // Could extract from message content if needed
    };
  }

  return null;
}