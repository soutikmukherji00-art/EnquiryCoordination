/**
 * Infrastructure: Mock Realtime Service
 * 
 * Simple in-memory event bus for single-user demo.
 */

import { RealtimeService, DomainEvent } from "./realtime.interface";

export class MockRealtimeService implements RealtimeService {
  private subscribers: Map<string, Set<(event: DomainEvent) => void>> = new Map();
  private globalSubscribers: Set<(event: DomainEvent) => void> = new Set();

  subscribe(enquiryId: string, callback: (event: DomainEvent) => void): () => void {
    console.log('[MockRealtimeService.subscribe] Subscribing to enquiryId:', enquiryId);
    if (!this.subscribers.has(enquiryId)) {
      this.subscribers.set(enquiryId, new Set());
    }
    this.subscribers.get(enquiryId)!.add(callback);
    console.log('[MockRealtimeService.subscribe] Total subscribers for', enquiryId, ':', this.subscribers.get(enquiryId)!.size);

    // Return unsubscribe function
    return () => {
      console.log('[MockRealtimeService.unsubscribe] Unsubscribing from enquiryId:', enquiryId);
      this.subscribers.get(enquiryId)?.delete(callback);
    };
  }

  subscribeAll(callback: (event: DomainEvent) => void): () => void {
    this.globalSubscribers.add(callback);

    return () => {
      this.globalSubscribers.delete(callback);
    };
  }

  async publish(event: DomainEvent): Promise<void> {
    console.log('[MockRealtimeService.publish] Publishing event:', event.type);
    
    // Notify global subscribers
    this.globalSubscribers.forEach((cb) => cb(event));
    console.log('[MockRealtimeService.publish] Notified', this.globalSubscribers.size, 'global subscribers');

    // Notify enquiry-specific subscribers
    if ("payload" in event && "enquiryId" in event.payload) {
      const enquiryId = (event.payload as any).enquiryId;
      const subscriberCount = this.subscribers.get(enquiryId)?.size || 0;
      console.log('[MockRealtimeService.publish] Notifying', subscriberCount, 'subscribers for enquiryId:', enquiryId);
      this.subscribers.get(enquiryId)?.forEach((cb) => cb(event));
    }
  }
}