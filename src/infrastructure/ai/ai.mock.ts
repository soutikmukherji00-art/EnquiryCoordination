/**
 * Infrastructure: Mock AI Service
 * 
 * Deterministic AI responses for demo purposes.
 */

import { AIService, StructuredData, QuickAction } from "./ai.interface";
import { Message } from "../../domain/message/message.types";
import { Enquiry } from "../../domain/enquiry/enquiry.types";

export class MockAIService implements AIService {
  async extractStructuredData(messages: Message[]): Promise<StructuredData> {
    // Return deterministic mock data
    return {
      buyer: {
        name: "Prashant Sharma",
        contact: "+91-9876543210",
        company: "Acme Manufacturing Ltd",
        aiExtracted: true,
      },
      products: [
        {
          name: "Industrial Steel Pipes",
          quantity: "500 units",
          specifications: "Grade 304, 2-inch diameter, 6-meter length",
          aiExtracted: true,
        },
      ],
      commercial: {
        paymentTerms: "Net 30",
        deliveryTerms: "Ex-works Mumbai",
        validityPeriod: "30 days",
        aiExtracted: true,
      },
    };
  }

  async generateSummary(enquiry: Enquiry, messages: Message[]): Promise<string> {
    return `Procurement enquiry from ${enquiry.buyerName} for industrial steel pipes. Customer requires 500 units of Grade 304 stainless steel pipes with specific dimensions. Payment terms negotiated as Net 30 with ex-works delivery from Mumbai. Currently in ${enquiry.state} stage.`;
  }

  async suggestNextActions(
    enquiry: Enquiry,
    currentChannel: string,
    recentMessages: Message[]
  ): Promise<QuickAction[]> {
    // Return contextual suggestions based on state
    if (enquiry.state === "Draft") {
      return [
        { id: "contact_buyer", label: "Contact buyer", variant: "primary" },
        { id: "add_details", label: "Add more details", variant: "default" },
      ];
    }

    if (enquiry.state === "CM Responded") {
      return [
        { id: "request_po", label: "Request PO from buyer", variant: "primary" },
        { id: "follow_up", label: "Follow up", variant: "default" },
      ];
    }

    return [];
  }

  async suggestStateTransition(
    enquiry: Enquiry,
    messages: Message[]
  ): Promise<string | null> {
    // Simple heuristic: if recent message contains "quote", suggest CM response submission.
    const recentMessage = messages[messages.length - 1];
    if (recentMessage?.content.toLowerCase().includes("quote")) {
      return "CM Responded";
    }
    return null;
  }
}
