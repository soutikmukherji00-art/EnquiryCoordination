/**
 * Enquiry handling business logic
 * Extracts enquiry-related handlers from App.tsx
 */

import { toast } from "sonner";
import { useEnquiries } from "./useEnquiries";
import { useEnquiryCreation } from "./useEnquiryCreation";
import { useEnquiryDispatch } from "@/infrastructure";
import { getPersonaById } from "@/domain/persona/persona.data";
import { getCMForRegion, type Region } from "@/domain/cm/cm.region";
import { generateMemberId, Enquiry } from "@/domain/enquiry/enquiry.types";
import { EnquiryCreationData } from "@/domain/enquiry/enquiry.creation";
import { Message } from "@/domain/message/message.types";
import {
  createMemberAddedEvent,
  createMemberRemovedEvent,
  createEnquiryCreatedEvent,
  createPrimaryCMAssignedEvent,
} from "@/domain/enquiry/enquiry.events";

const __DEV_LOG__ = false;
const devLog = __DEV_LOG__
  ? (label: string, data?: any) => console.log(label, data)
  : (() => {}) as (label: string, data?: any) => void;
const devWarn = __DEV_LOG__
  ? (label: string, data?: any) => console.warn(label, data)
  : (() => {}) as (label: string, data?: any) => void;
const devError = __DEV_LOG__
  ? (label: string, data?: any) => console.error(label, data)
  : (() => {}) as (label: string, data?: any) => void;

export interface EnquiryHandlerOptions {
  currentUser: string;
  currentRole: string;
  currentPersonaId: string;
  enquiries: Enquiry[];
  reloadMessages: () => Promise<void>;
  setSelectedBuyerDMId: (id: string) => void;
  setSelectedEnquiryId: (id: string) => void;
  setCurrentChannel: (channel: string) => void;
}

export function useEnquiryHandlers(options: EnquiryHandlerOptions) {
  const {
    currentUser,
    currentRole,
    currentPersonaId,
    enquiries,
    reloadMessages,
    setSelectedBuyerDMId,
    setSelectedEnquiryId,
    setCurrentChannel,
  } = options;

  const { changeEnquiryState, convertEnquiry } = useEnquiries();
  const { createEnquiryWithMessages } = useEnquiryCreation();
  const dispatch = useEnquiryDispatch();

  /**
   * Handle enquiry state change
   */
  const handleStateChange = async (enquiryId: string, newState: string) => {
    await changeEnquiryState(enquiryId, newState as any, currentUser, currentRole);
    toast.success(`State changed to: ${newState}`);
  };

  /**
   * Handle convert enquiry to order
   */
  const handleConvertToOrder = async (enquiryId: string) => {
    await convertEnquiry(enquiryId, currentUser, currentRole);
    toast.success("Enquiry converted to order!");
  };

  /**
   * Handle add member to enquiry
   */
  const handleAddMember = (enquiryId: string, personaId: string) => {
    const persona = getPersonaById(personaId);
    if (!persona) {
      toast.error("Persona not found");
      return;
    }

    const memberId = generateMemberId(enquiryId, personaId);
    const member = {
      id: memberId,
      userId: persona.userId,
      personaId: persona.id,
      role: persona.role,
      joinedAt: new Date(),
    };

    const event = createMemberAddedEvent(enquiryId, member);
    dispatch(event);
    toast.success(`Added ${persona.displayName}`);
  };

  /**
   * Handle remove member from enquiry
   */
  const handleRemoveMember = (enquiryId: string, memberId: string) => {
    const event = createMemberRemovedEvent(enquiryId, memberId);
    dispatch(event);
    toast.success("Member removed");
  };

  /**
   * Handle create new enquiry with auto-assignment of CM and CX
   */
  const handleCreateEnquiry = async (data: EnquiryCreationData, messages: Message[]) => {
    try {
      devLog("[handleCreateEnquiry] Starting enquiry creation", { data });

      const newEnquiryId = await createEnquiryWithMessages(
        data,
        messages,
        currentUser,
        currentRole as any,
        currentPersonaId,
        enquiries
      );

      devLog("[handleCreateEnquiry] Enquiry created:", newEnquiryId);

      // Dispatch events to update local state
      const enquiryEvent = createEnquiryCreatedEvent(
        newEnquiryId,
        currentPersonaId,
        data.deliveryLocation,
        data.buyerName
      );
      dispatch(enquiryEvent);
      devLog("[handleCreateEnquiry] ENQUIRY_CREATED event dispatched");

      // Add creator (BDM) as member
      const persona = getPersonaById(currentPersonaId);
      if (persona) {
        const memberId = generateMemberId(newEnquiryId, persona.id);
        const member = {
          id: memberId,
          userId: persona.userId,
          personaId: persona.id,
          role: persona.role,
          joinedAt: new Date(),
        };
        const memberAddedEvent = createMemberAddedEvent(newEnquiryId, member);
        dispatch(memberAddedEvent);
        devLog("[handleCreateEnquiry] BDM added as member:", persona.displayName);
      }

      // Auto-assign CM based on delivery location/region
      let assignedCMName = "";
      if (data.deliveryLocation) {
        const region = data.deliveryLocation as Region;
        devLog("[handleCreateEnquiry] Looking for CM for region:", region);

        const cmPersonaId = getCMForRegion(region);
        if (cmPersonaId) {
          const cmPersona = getPersonaById(cmPersonaId);
          if (cmPersona) {
            devLog("[handleCreateEnquiry] Found CM:", cmPersona.displayName);

            // Add CM as member
            const cmMemberId = generateMemberId(newEnquiryId, cmPersonaId);
            const cmMember = {
              id: cmMemberId,
              userId: cmPersona.userId,
              personaId: cmPersonaId,
              role: cmPersona.role,
              joinedAt: new Date(),
              isPrimaryCM: true, // Mark as primary CM
            };

            const cmMemberAddedEvent = createMemberAddedEvent(newEnquiryId, cmMember);
            dispatch(cmMemberAddedEvent);
            devLog("[handleCreateEnquiry] CM added as member:", cmPersona.displayName);

            // Assign as primary CM
            const primaryCMEvent = createPrimaryCMAssignedEvent(newEnquiryId, cmMemberId);
            dispatch(primaryCMEvent);
            devLog("[handleCreateEnquiry] CM assigned as primary");

            assignedCMName = cmPersona.displayName;
          } else {
            devWarn("[handleCreateEnquiry] CM persona not found:", cmPersonaId);
          }
        } else {
          devWarn("[handleCreateEnquiry] No CM found for region:", region);
        }
      } else {
        devLog("[handleCreateEnquiry] No delivery location provided, skipping CM assignment");
      }

      // Auto-assign CX to all enquiries (p_cx_1 - Sneha Reddy)
      const cxPersonaId = "p_cx_1";
      const cxPersona = getPersonaById(cxPersonaId);
      if (cxPersona) {
        devLog("[handleCreateEnquiry] Auto-assigning CX:", cxPersona.displayName);

        const cxMemberId = generateMemberId(newEnquiryId, cxPersonaId);
        const cxMember = {
          id: cxMemberId,
          userId: cxPersona.userId,
          personaId: cxPersonaId,
          role: cxPersona.role,
          joinedAt: new Date(),
        };

        const cxMemberAddedEvent = createMemberAddedEvent(newEnquiryId, cxMember);
        dispatch(cxMemberAddedEvent);
        devLog("[handleCreateEnquiry] CX added as member:", cxPersona.displayName);
      } else {
        devWarn("[handleCreateEnquiry] CX persona not found:", cxPersonaId);
      }

      // Show success message
      if (assignedCMName) {
        toast.success(`Created enquiry ${newEnquiryId} • Assigned to ${assignedCMName} + CX`);
      } else {
        toast.success(`Created enquiry ${newEnquiryId} • CX assigned`);
      }

      // Navigate to the new enquiry - clear Buyer DM selection first for clean transition
      setSelectedBuyerDMId(""); // Clear DM selection
      setSelectedEnquiryId(newEnquiryId); // Set new enquiry
      setCurrentChannel("internal"); // Start in internal channel to see shared messages

      // Immediate reload without setTimeout - events are already dispatched
      devLog("[handleCreateEnquiry] Reloading messages for new enquiry");
      await reloadMessages();
    } catch (error) {
      devError("Failed to create enquiry:", error);
      toast.error("Failed to create enquiry");
    }
  };

  return {
    handleStateChange,
    handleConvertToOrder,
    handleAddMember,
    handleRemoveMember,
    handleCreateEnquiry,
  };
}