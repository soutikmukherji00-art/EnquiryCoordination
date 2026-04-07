/**
 * Infrastructure: Optimized Memory DataStore
 * 
 * Indexed in-memory implementation with O(1) lookups.
 * Adds lookup maps for enquiries, messages, and channels.
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

// Optimization: Lookup indexes for O(1) access
interface MemoryStoreIndexes {
  enquiryById: Map<string, Enquiry>;
  membersByEnquiry: Map<string, Member[]>;
  messagesByEnquiry: Map<string, Map<string, Message[]>>; // enquiryId -> channelId -> messages
  sellerChannelsByEnquiry: Map<string, SellerChannel[]>;
  buyerDMById: Map<string, BuyerDMChannel>;
  sellerDMById: Map<string, SellerDMChannel>;
}

export class OptimizedMemoryStore implements DataStore {
  private enquiryState: EnquiryStateStore = initialEnquiryState;
  private messageState: MessageDomainState = initialMessageState;
  private auditState: AuditDomainState = initialAuditState;
  private events: Array<EnquiryEvent | MessageEvent> = [];
  
  // Optimization: Indexed lookups
  private indexes: MemoryStoreIndexes = {
    enquiryById: new Map(),
    membersByEnquiry: new Map(),
    messagesByEnquiry: new Map(),
    sellerChannelsByEnquiry: new Map(),
    buyerDMById: new Map(),
    sellerDMById: new Map(),
  };

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
        
        // Build index
        this.indexes.enquiryById.set(enq.id, enq);
        this.indexes.membersByEnquiry.set(enq.id, []);
      });
    }

    if (initialData?.messages) {
      this.messageState.messages = initialData.messages;
      
      // Build message index
      Object.entries(initialData.messages).forEach(([enquiryId, channels]) => {
        const channelMap = new Map<string, Message[]>();
        Object.entries(channels).forEach(([channelId, messages]) => {
          channelMap.set(channelId, messages);
        });
        this.indexes.messagesByEnquiry.set(enquiryId, channelMap);
      });
    }

    if (initialData?.sellerChannels) {
      this.messageState.sellerChannels = initialData.sellerChannels;
      
      // Build seller channel index
      Object.entries(initialData.sellerChannels).forEach(([enquiryId, channels]) => {
        this.indexes.sellerChannelsByEnquiry.set(enquiryId, channels);
      });
    }

    if (initialData?.auditEntries) {
      this.auditState.entries = initialData.auditEntries;
    }

    if (initialData?.buyerDMChannels) {
      this.messageState.buyerDMChannels = initialData.buyerDMChannels;
      
      // Build buyer DM index
      initialData.buyerDMChannels.forEach(dm => {
        this.indexes.buyerDMById.set(dm.id, dm);
      });
    }

    if (initialData?.sellerDMChannels) {
      this.messageState.sellerDMChannels = initialData.sellerDMChannels;
      
      // Build seller DM index
      initialData.sellerDMChannels.forEach(dm => {
        this.indexes.sellerDMById.set(dm.id, dm);
      });
      
      console.log('[OptimizedMemoryStore] Initialized with seller DM channels:', initialData.sellerDMChannels.length);
    }
  }

  async appendEvent(event: EnquiryEvent | MessageEvent): Promise<void> {
    console.log('[OptimizedMemoryStore.appendEvent] Received event:', event.type, event.payload);
    this.events.push(event);

    // Apply event to relevant reducer
    if ('enquiryId' in event.payload && event.type.startsWith('ENQUIRY_')) {
      const oldState = this.enquiryState;
      this.enquiryState = enquiryReducer(this.enquiryState, event as EnquiryEvent);
      
      // Update indexes after state change
      this.updateEnquiryIndexes(oldState, this.enquiryState);
      
      // Create audit entry
      const auditEvent = {
        type: 'AUDIT_ENTRY_ADDED' as const,
        payload: {
          enquiryId: event.payload.enquiryId,
          entry: {
            id: `audit-${Date.now()}`,
            enquiryId: event.payload.enquiryId,
            action: event.type,
            performedBy: 'payload' in event ? ((event.payload as any).performedBy || 'system') : 'system',
            timestamp: new Date(),
            details: event.payload,
          },
        },
      };
      this.auditState = auditReducer(this.auditState, auditEvent);
    }

    if (event.type.includes('MESSAGE') || event.type.includes('SELLER')) {
      const oldState = this.messageState;
      this.messageState = messageReducer(this.messageState, event as MessageEvent);
      
      // Update indexes after state change
      this.updateMessageIndexes(oldState, this.messageState);
    }

    console.log('[OptimizedMemoryStore.appendEvent] Event applied. Updated state.');
  }

  // Optimization: Update enquiry indexes efficiently
  private updateEnquiryIndexes(oldState: EnquiryStateStore, newState: EnquiryStateStore): void {
    // Check which enquiries changed
    Object.keys(newState.enquiries).forEach(enquiryId => {
      const oldEnq = oldState.enquiries[enquiryId];
      const newEnq = newState.enquiries[enquiryId];
      
      if (oldEnq !== newEnq) {
        this.indexes.enquiryById.set(enquiryId, newEnq);
      }
    });
    
    // Check which members changed
    Object.keys(newState.membersByEnquiry).forEach(enquiryId => {
      const oldMembers = oldState.membersByEnquiry[enquiryId];
      const newMembers = newState.membersByEnquiry[enquiryId];
      
      if (oldMembers !== newMembers) {
        this.indexes.membersByEnquiry.set(enquiryId, newMembers);
      }
    });
  }

  // Optimization: Update message indexes efficiently
  private updateMessageIndexes(oldState: MessageDomainState, newState: MessageDomainState): void {
    // Update message indexes
    Object.entries(newState.messages).forEach(([enquiryId, channels]) => {
      const oldChannels = oldState.messages[enquiryId];
      
      if (oldChannels !== channels) {
        const channelMap = new Map<string, Message[]>();
        Object.entries(channels).forEach(([channelId, messages]) => {
          channelMap.set(channelId, messages);
        });
        this.indexes.messagesByEnquiry.set(enquiryId, channelMap);
      }
    });
    
    // Update seller channel indexes
    Object.entries(newState.sellerChannels).forEach(([enquiryId, channels]) => {
      const oldChannels = oldState.sellerChannels[enquiryId];
      
      if (oldChannels !== channels) {
        this.indexes.sellerChannelsByEnquiry.set(enquiryId, channels);
      }
    });
    
    // Update buyer DM index
    if (oldState.buyerDMChannels !== newState.buyerDMChannels) {
      this.indexes.buyerDMById.clear();
      newState.buyerDMChannels.forEach(dm => {
        this.indexes.buyerDMById.set(dm.id, dm);
      });
    }
    
    // Update seller DM index
    if (oldState.sellerDMChannels !== newState.sellerDMChannels) {
      this.indexes.sellerDMById.clear();
      newState.sellerDMChannels.forEach(dm => {
        this.indexes.sellerDMById.set(dm.id, dm);
      });
    }
  }

  // Optimized: O(1) lookup
  async getEnquiryById(id: string): Promise<Enquiry | null> {
    return this.indexes.enquiryById.get(id) || null;
  }

  // Optimized: O(1) lookup
  async getEnquiryMembers(enquiryId: string): Promise<Member[]> {
    return this.indexes.membersByEnquiry.get(enquiryId) || [];
  }

  // Optimized: O(1) lookup for channel messages
  async getMessages(enquiryId: string, channelId: string): Promise<Message[]> {
    const enquiryMessages = this.indexes.messagesByEnquiry.get(enquiryId);
    if (!enquiryMessages) return [];
    
    return enquiryMessages.get(channelId) || [];
  }

  // Optimized: O(1) lookup
  async getSellerChannels(enquiryId: string): Promise<SellerChannel[]> {
    return this.indexes.sellerChannelsByEnquiry.get(enquiryId) || [];
  }

  // Optimized: O(1) lookup
  async getBuyerDMById(dmId: string): Promise<BuyerDMChannel | null> {
    return this.indexes.buyerDMById.get(dmId) || null;
  }

  // Optimized: O(1) lookup
  async getSellerDMById(dmId: string): Promise<SellerDMChannel | null> {
    return this.indexes.sellerDMById.get(dmId) || null;
  }

  // Batch operations for performance
  async getEnquiriesByIds(ids: string[]): Promise<Enquiry[]> {
    return ids.map(id => this.indexes.enquiryById.get(id)).filter(Boolean) as Enquiry[];
  }

  // Original methods delegated to state
  async getAllEnquiries(): Promise<Enquiry[]> {
    return Object.values(this.enquiryState.enquiries);
  }

  async getAuditLog(enquiryId: string): Promise<AuditEntry[]> {
    return this.auditState.entries[enquiryId] || [];
  }

  async getAllBuyerDMs(): Promise<BuyerDMChannel[]> {
    return this.messageState.buyerDMChannels;
  }

  async getAllSellerDMs(): Promise<SellerDMChannel[]> {
    return this.messageState.sellerDMChannels;
  }

  async query(params: any): Promise<any[]> {
    // Placeholder for complex queries
    return [];
  }
}