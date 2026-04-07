/**
 * Infrastructure: AI Service Interface
 * 
 * Port definition for AI capabilities.
 * Implementations can be mock (deterministic) or live (API calls).
 */

import { Message } from "../../domain/message/message.types";
import { Enquiry } from "../../domain/enquiry/enquiry.types";

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

export interface QuickAction {
  id: string;
  label: string;
  variant?: "primary" | "secondary" | "success" | "destructive" | "default";
}

export interface AIService {
  /**
   * Extract structured data from message history
   */
  extractStructuredData(messages: Message[]): Promise<StructuredData>;

  /**
   * Generate summary of enquiry state
   */
  generateSummary(enquiry: Enquiry, messages: Message[]): Promise<string>;

  /**
   * Suggest next actions based on context
   */
  suggestNextActions(
    enquiry: Enquiry,
    currentChannel: string,
    recentMessages: Message[]
  ): Promise<QuickAction[]>;

  /**
   * Suggest state transition based on conversation
   */
  suggestStateTransition(
    enquiry: Enquiry,
    messages: Message[]
  ): Promise<string | null>;
}
