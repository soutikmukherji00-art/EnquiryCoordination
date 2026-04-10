/**
 * Infrastructure: Memory DataStore
 * 
 * In-memory implementation of DataStore interface.
 * Used for demo and development.
 */

import { DataStore } from "./datastore.interface";
import { Enquiry, Member } from "../../domain/enquiry/enquiry.types";
import { Message, SellerChannel } from "../../domain/message/message.types";
import { AuditEntry } from "../../domain/audit/audit.types";
import { EnquiryEvent } from "../../domain/enquiry/enquiry.events";
import { MessageEvent } from "../../domain/message/message.events";
import { enquiryReducer, initialEnquiryState, EnquiryStateStore } from "../../domain/enquiry/enquiry.reducer";
import { messageReducer, initialMessageState, MessageDomainState } from "../../domain/message/message.reducer";
import { auditReducer, initialAuditState, AuditDomainState } from "../../domain/audit/audit.reducer";
import { BuyerDMChannel } from "../../domain/message/buyer-dm.types";
import { SellerDMChannel } from "../../domain/message/seller-dm.types";

export class MemoryStore implements DataStore {
  private enquiryState: EnquiryStateStore = initialEnquiryState;
  private messageState: MessageDomainState = initialMessageState;
  private auditState: AuditDomainState = initialAuditState;
  private events: Array<EnquiryEvent | MessageEvent> = [];

  constructor(initialData?: {
    enquiries?: Enquiry[];
    messages?: Record<string, Record<string, Message[]>>;
    sellerChannels?: Record<string, SellerChannel[]>;
    auditEntries?: Record<string, AuditEntry[]>;
    buyerDMChannels?: BuyerDMChannel[];
    sellerDMChannels?: SellerDMChannel[];
  }) {
    // Initialize with mock data if provided
    if (initialData?.enquiries) {
      initialData.enquiries.forEach((enq) => {
        this.enquiryState.enquiries[enq.id] = enq;
        this.enquiryState.membersByEnquiry[enq.id] = [];
      });
    }

    if (initialData?.messages) {
      this.messageState.messages = initialData.messages;
    }

    if (initialData?.sellerChannels) {
      this.messageState.sellerChannels = initialData.sellerChannels;
    }

    if (initialData?.auditEntries) {
      this.auditState.entries = initialData.auditEntries;
    }

    if (initialData?.buyerDMChannels) {
      this.messageState.buyerDMChannels = initialData.buyerDMChannels;
    }

    if (initialData?.sellerDMChannels) {
      this.messageState.sellerDMChannels = initialData.sellerDMChannels;
      console.log('[MemoryStore] Initialized with seller DM channels:', initialData.sellerDMChannels.length);
    }
  }

  async appendEvent(event: EnquiryEvent | MessageEvent): Promise<void> {
    console.log('[MemoryStore.appendEvent] Received event:', event.type, event.payload);
    this.events.push(event);

    // Apply event to reducers
    if (this.isEnquiryEvent(event)) {
      console.log('[MemoryStore.appendEvent] Processing as EnquiryEvent');
      this.enquiryState = enquiryReducer(this.enquiryState, event);
      this.auditState = auditReducer(this.auditState, event);
    }

    if (this.isMessageEvent(event)) {
      console.log('[MemoryStore.appendEvent] Processing as MessageEvent');
      const oldState = this.messageState;
      this.messageState = messageReducer(this.messageState, event);
      
      // Log what changed
      if (event.type === 'MESSAGE_SENT' && 'payload' in event) {
        const { enquiryId, channelId } = (event.payload as any);
        const oldCount = oldState.messages[enquiryId]?.[channelId]?.length || 0;
        const newCount = this.messageState.messages[enquiryId]?.[channelId]?.length || 0;
        console.log('[MemoryStore.appendEvent] Message count changed:', {
          enquiryId,
          channelId,
          oldCount,
          newCount,
          diff: newCount - oldCount
        });
      }
      
      this.auditState = auditReducer(this.auditState, event);
    }
    
    console.log('[MemoryStore.appendEvent] Event processing complete');
  }

  async getEvents(enquiryId: string): Promise<Array<EnquiryEvent | MessageEvent>> {
    return this.events.filter((event) => {
      if ("payload" in event && "enquiryId" in event.payload) {
        return event.payload.enquiryId === enquiryId;
      }
      return false;
    });
  }

  async getEnquiry(id: string): Promise<Enquiry | null> {
    return this.enquiryState.enquiries[id] || null;
  }

  async getAllEnquiries(): Promise<Enquiry[]> {
    return Object.values(this.enquiryState.enquiries);
  }

  async getEnquiryMembers(enquiryId: string): Promise<Member[]> {
    return this.enquiryState.membersByEnquiry[enquiryId] || [];
  }

  async getMessages(enquiryId: string, channelId: string): Promise<Message[]> {
    const messages = this.messageState.messages[enquiryId]?.[channelId] || [];
    console.log('[MemoryStore.getMessages]', {
      enquiryId,
      channelId,
      messageCount: messages.length,
      availableEnquiries: Object.keys(this.messageState.messages),
      channelsForEnquiry: enquiryId in this.messageState.messages 
        ? Object.keys(this.messageState.messages[enquiryId])
        : []
    });
    return messages;
  }

  async getSellerChannels(enquiryId: string): Promise<SellerChannel[]> {
    return this.messageState.sellerChannels[enquiryId] || [];
  }

  async getAuditEntries(enquiryId: string): Promise<AuditEntry[]> {
    return this.auditState.entries[enquiryId] || [];
  }

  async searchEnquiries(query: string): Promise<Enquiry[]> {
    const allEnquiries = Object.values(this.enquiryState.enquiries);
    if (!query) return allEnquiries;

    const lowerQuery = query.toLowerCase();
    return allEnquiries.filter(
      (enq) =>
        enq.id.toLowerCase().includes(lowerQuery) ||
        (enq.buyerName && enq.buyerName.toLowerCase().includes(lowerQuery)) ||
        enq.state.toLowerCase().includes(lowerQuery)
    );
  }

  // Helper methods
  private isEnquiryEvent(event: any): event is EnquiryEvent {
    return [
      "ENQUIRY_CREATED",
      "ENQUIRY_REGION_ASSIGNED",
      "PRIMARY_CM_ASSIGNED",
      "MEMBER_ADDED",
      "MEMBER_REMOVED",
      "MEMBER_TAGGED",
      "MEMBER_ROLE_UPDATED",
      "ENQUIRY_STATE_CHANGED",
      "ENQUIRY_CONVERTED",
      "ENQUIRY_PARTICIPANT_ADDED", // Legacy
      "ENQUIRY_RECORD_CREATED",
    ].includes(event.type);
  }

  private isMessageEvent(event: any): event is MessageEvent {
    return [
      "MESSAGE_SENT",
      "MESSAGE_SHARED",
      "MESSAGE_EDITED",
      "SELLER_CHANNEL_CREATED",
      "MESSAGES_FAN_OUT",
    ].includes(event.type);
  }

  // Direct access for legacy compatibility (will be removed)
  getEnquiryState(): EnquiryStateStore {
    return this.enquiryState;
  }

  getMessageState(): MessageDomainState {
    return this.messageState;
  }

  getAuditState(): AuditDomainState {
    return this.auditState;
  }
}