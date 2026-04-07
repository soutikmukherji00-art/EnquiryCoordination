/**
 * Infrastructure: Live AI Service
 * 
 * Placeholder for future AI API integration.
 */

import { AIService, StructuredData, QuickAction } from "./ai.interface";
import { Message } from "../../domain/message/message.types";
import { Enquiry } from "../../domain/enquiry/enquiry.types";

export class LiveAIService implements AIService {
  constructor(private apiKey?: string) {
    // Placeholder for API configuration
  }

  async extractStructuredData(messages: Message[]): Promise<StructuredData> {
    throw new Error(
      "LiveAIService not yet implemented. Use MockAIService for now."
    );
  }

  async generateSummary(enquiry: Enquiry, messages: Message[]): Promise<string> {
    throw new Error(
      "LiveAIService not yet implemented. Use MockAIService for now."
    );
  }

  async suggestNextActions(
    enquiry: Enquiry,
    currentChannel: string,
    recentMessages: Message[]
  ): Promise<QuickAction[]> {
    throw new Error(
      "LiveAIService not yet implemented. Use MockAIService for now."
    );
  }

  async suggestStateTransition(
    enquiry: Enquiry,
    messages: Message[]
  ): Promise<string | null> {
    throw new Error(
      "LiveAIService not yet implemented. Use MockAIService for now."
    );
  }
}
