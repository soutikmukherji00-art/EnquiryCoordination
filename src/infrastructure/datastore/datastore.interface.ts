/**
 * Infrastructure: DataStore Interface
 *
 * Port definition for data persistence.
 * Implementations can be in-memory, Supabase, or any other backend.
 *
 * Enquiry structured payloads (`EnquiryRecord`) are persisted via the same event log:
 * `ENQUIRY_RECORD_CREATED` and `ENQUIRY_RECORD_UPDATED`. A future backend (e.g. Indra) can
 * subscribe to those events or add a dedicated `EnquiryRecordPersistencePort` implementation without changing domain types.
 */

import { Enquiry, Member } from "../../domain/enquiry/enquiry.types";
import { Message, SellerChannel } from "../../domain/message/message.types";
import { AuditEntry } from "../../domain/audit/audit.types";
import { EnquiryEvent } from "../../domain/enquiry/enquiry.events";
import { MessageEvent } from "../../domain/message/message.events";

export interface DataStore {
  // Events (source of truth)
  appendEvent(event: EnquiryEvent | MessageEvent): Promise<void>;
  getEvents(enquiryId: string): Promise<Array<EnquiryEvent | MessageEvent>>;

  // Enquiries
  getEnquiry(id: string): Promise<Enquiry | null>;
  getAllEnquiries(): Promise<Enquiry[]>;
  getEnquiryMembers(enquiryId: string): Promise<Member[]>;

  // Messages
  getMessages(enquiryId: string, channelId: string): Promise<Message[]>;
  getSellerChannels(enquiryId: string): Promise<SellerChannel[]>;

  // Audit
  getAuditEntries(enquiryId: string): Promise<AuditEntry[]>;

  // Search
  searchEnquiries(query: string): Promise<Enquiry[]>;
}