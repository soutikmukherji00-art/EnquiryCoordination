/**
 * Hook: Enquiry Creation
 * 
 * Manages creation of new enquiries from shared messages.
 */

import { useCallback } from "react";
import { useAppStore } from "./useAppStore";
import { Message, UserRole } from "@/domain/message/message.types";
import {
  createNewEnquiry,
  prepareMessagesForNewEnquiry,
  buildIntakeChannelMessages,
} from "@/domain/enquiry/enquiry.creation";
import { EnquiryIntake, resolveIntakeBuyerName } from "@/domain/enquiry/enquiry.intake";
import { 
  createEnquiryCreatedEvent, 
  createMemberAddedEvent,
  createEnquiryRecordEvent 
} from "@/domain/enquiry/enquiry.events";
import { MessageEvent } from "@/domain/message/message.events";
import { Enquiry, Member, generateMemberId } from "@/domain/enquiry/enquiry.types";
import { 
  buildEnquiryRecordFromIntake, 
  EnquiryCreationSource 
} from "@/domain/enquiry/enquiry.record";
import { getPersonaById } from "@/domain/persona/persona.data";

const __DEV_LOG__ = false;
const devLog = __DEV_LOG__ ? (label: string, data?: any) => console.log(label, data) : (() => {}) as (label: string, data?: any) => void;
const devError = __DEV_LOG__ ? (label: string, data?: any) => console.error(label, data) : (() => {}) as (label: string, data?: any) => void;

export const useEnquiryCreation = () => {
  const { dataStore, realtimeService } = useAppStore();

  /**
   * Create a new enquiry with initial messages
   */
  const createEnquiryWithMessages = useCallback(
    async (
      intake: EnquiryIntake,
      createdBy: string,
      createdByRole: UserRole,
      createdByPersonaId: string,
      existingEnquiries: Enquiry[]
    ): Promise<string> => {
      devLog("[useEnquiryCreation] Creating enquiry from intake", { intake, createdBy, createdByRole, createdByPersonaId });
      
      // Create enquiry
      const result = createNewEnquiry(intake, createdBy, createdByRole, existingEnquiries);
      const { enquiryId } = result;

      devLog("[useEnquiryCreation] Enquiry base created", { enquiryId });

      // Create enquiry event
      const enquiryEvent = createEnquiryCreatedEvent(
        enquiryId,
        createdByPersonaId,
        intake.requirements.deliveryLocation, // Pass region for CM auto-assignment
        resolveIntakeBuyerName(intake.buyer),
        intake.buyer.personaId,
        false, // createdViaBot
        intake.requirements.estimatedValue, // NEW: Pass estimated value
        intake.requirements.categories as string[] // NEW: Pass categories
      );

      // Store enquiry and publish to realtime
      await dataStore.appendEvent(enquiryEvent);
      await realtimeService.publish(enquiryEvent);

      // Add the creator (BDM) as a member of the enquiry
      const persona = getPersonaById(createdByPersonaId);
      if (persona) {
        const memberId = generateMemberId(enquiryId, createdByPersonaId);
        devLog("[useEnquiryCreation] Adding BDM as member", { memberId, personaId: createdByPersonaId });
        
        const member: Member = {
          id: memberId,
          userId: persona.userId,
          personaId: createdByPersonaId,
          role: persona.role,
          joinedAt: new Date(),
        };

        const memberAddedEvent = createMemberAddedEvent(enquiryId, member);

        await dataStore.appendEvent(memberAddedEvent);
        await realtimeService.publish(memberAddedEvent);
      } else {
        devError("[useEnquiryCreation] Persona not found:", createdByPersonaId);
      }

      // NEW: Create and store the rich EnquiryRecord
      const creationSource: EnquiryCreationSource = intake.source.medium === "pluto" 
        ? "pluto-detailed-rfq" 
        : (intake.source.medium === "share" ? "share" : "prism-manual");
      
      const enquiryRecord = buildEnquiryRecordFromIntake(
        enquiryId,
        intake,
        creationSource,
        createdByPersonaId
      );

      const recordEvent = createEnquiryRecordEvent(enquiryId, enquiryRecord);
      await dataStore.appendEvent(recordEvent);
      await realtimeService.publish(recordEvent);

      // Prepare and store initial messages (including attachments and voice notes)
      const intakeMessages = buildIntakeChannelMessages({
        enquiryId,
        intake: {
          attachments: intake.source.attachments || [],
          voiceNote: intake.source.voiceNote,
          markAsPO: (intake.source.attachments || []).some(a => a.markAsPO),
          sourceMode: intake.source.medium === "share" ? "share" : "blank",
        },
        buyerName: resolveIntakeBuyerName(intake.buyer),
        notes: intake.requirements.notes,
        currentUser: createdBy,
        currentRole: createdByRole,
        currentPersonaId: createdByPersonaId,
      });

      const sourceMessages = intake.source.messages || [];
      const allPreparedMessages = [
        ...prepareMessagesForNewEnquiry(sourceMessages, enquiryId, new Date()),
        ...intakeMessages
      ];

      if (allPreparedMessages.length > 0) {
        devLog(`[useEnquiryCreation] Sending ${allPreparedMessages.length} total messages to enquiry ${enquiryId}`);
        
        for (const msg of allPreparedMessages) {
          // Send to buyer channel
          const buyerMessageEvent: MessageEvent = {
            type: "MESSAGE_SENT",
            payload: {
              enquiryId,
              channelId: "buyer",
              message: msg,
              timestamp: msg.timestamp,
            },
          };
          await dataStore.appendEvent(buyerMessageEvent);
          await realtimeService.publish(buyerMessageEvent);
          
          // Also send to internal channel
          const internalMessageEvent: MessageEvent = {
            type: "MESSAGE_SENT",
            payload: {
              enquiryId,
              channelId: "internal",
              message: msg,
              timestamp: msg.timestamp,
            },
          };
          await dataStore.appendEvent(internalMessageEvent);
          await realtimeService.publish(internalMessageEvent);
        }
        
        devLog(`[useEnquiryCreation] Successfully shared all messages to both buyer and internal channels`);
      } else {
        devLog('[useEnquiryCreation] No messages to share');
      }

      return enquiryId;
    },
    [dataStore, realtimeService]
  );

  return {
    createEnquiryWithMessages,
  };
};