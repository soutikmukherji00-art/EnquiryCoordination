/**
 * Infrastructure: Supabase DataStore
 * 
 * Supabase implementation of DataStore interface.
 * Currently a placeholder for future implementation.
 */

import { DataStore } from "./datastore.interface";
import { Enquiry, Member } from "../../domain/enquiry/enquiry.types";
import { Message, SellerChannel } from "../../domain/message/message.types";
import { AuditEntry } from "../../domain/audit/audit.types";
import { EnquiryEvent } from "../../domain/enquiry/enquiry.events";
import { MessageEvent } from "../../domain/message/message.events";

/**
 * Supabase schema mapping:
 * 
 * Tables:
 * - enquiries: Stores enquiry entities
 * - enquiry_members: Tracks members (persona participation)
 * - messages: Stores all messages
 * - seller_channels: Dynamic seller channels
 * - audit_events: Audit trail entries
 * - domain_events: Event sourcing log
 */

export class SupabaseStore implements DataStore {
  // Placeholder - will be implemented when Supabase is connected
  
  constructor() {
    throw new Error(
      "SupabaseStore not yet implemented. Use MemoryStore for now."
    );
  }

  async appendEvent(event: EnquiryEvent | MessageEvent): Promise<void> {
    throw new Error("Not implemented");
  }

  async getEvents(enquiryId: string): Promise<Array<EnquiryEvent | MessageEvent>> {
    throw new Error("Not implemented");
  }

  async getEnquiry(id: string): Promise<Enquiry | null> {
    throw new Error("Not implemented");
  }

  async getAllEnquiries(): Promise<Enquiry[]> {
    throw new Error("Not implemented");
  }

  async getEnquiryMembers(enquiryId: string): Promise<Member[]> {
    throw new Error("Not implemented");
  }

  async getMessages(enquiryId: string, channelId: string): Promise<Message[]> {
    throw new Error("Not implemented");
  }

  async getSellerChannels(enquiryId: string): Promise<SellerChannel[]> {
    throw new Error("Not implemented");
  }

  async getAuditEntries(enquiryId: string): Promise<AuditEntry[]> {
    throw new Error("Not implemented");
  }

  async searchEnquiries(query: string): Promise<Enquiry[]> {
    throw new Error("Not implemented");
  }
}