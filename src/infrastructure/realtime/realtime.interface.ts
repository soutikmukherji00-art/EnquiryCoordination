/**
 * Infrastructure: Realtime Service Interface
 * 
 * Port definition for realtime/subscription capabilities.
 */

import { EnquiryEvent } from "../../domain/enquiry/enquiry.events";
import { MessageEvent } from "../../domain/message/message.events";

export type DomainEvent = EnquiryEvent | MessageEvent;

export interface RealtimeService {
  /**
   * Subscribe to events for a specific enquiry
   */
  subscribe(
    enquiryId: string,
    callback: (event: DomainEvent) => void
  ): () => void;

  /**
   * Subscribe to all events
   */
  subscribeAll(callback: (event: DomainEvent) => void): () => void;

  /**
   * Publish an event (for multi-user sync)
   */
  publish(event: DomainEvent): Promise<void>;
}
