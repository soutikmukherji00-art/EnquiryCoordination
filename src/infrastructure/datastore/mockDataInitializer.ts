/**
 * Mock Data Initializer
 * 
 * Converts mock data objects into initial reducer states.
 */

import { EnquiryStateStore } from "@/domain/enquiry/enquiry.reducer";
import { MessageDomainState } from "@/domain/message/message.reducer";
import { 
  MOCK_ENQUIRIES, 
  MOCK_MESSAGES, 
  MOCK_SELLER_CHANNELS, 
  MOCK_BUYER_DM_CHANNELS, 
  MOCK_SELLER_DM_CHANNELS,
  MOCK_SELLER_GROUPS,
  MOCK_BUYER_GROUPS,
  MOCK_INTERNAL_GROUPS,
} from "./mockData";
import { getPersonaById } from "@/domain/persona/persona.data";
import { Member } from "@/domain/enquiry/enquiry.types";
import { generateSellerDMId } from "@/domain/message/seller-dm.types";

/**
 * Initialize EnquiryStateStore from mock enquiries
 */
export function initializeMockEnquiryState(): EnquiryStateStore {
  const state: EnquiryStateStore = {
    enquiries: {},
    membersByEnquiry: {},
    primaryCMByEnquiry: {},
  };

  // Convert enquiries
  MOCK_ENQUIRIES.forEach((enq) => {
    state.enquiries[enq.id] = enq;

    // Convert memberIds to Member objects
    // Member ID format: m_{enquiryId}_{personaId}
    // We need to extract the personaId from the full member ID
    const members: Member[] = (enq.memberIds || []).map((memberId) => {
      // Extract persona ID from member ID (format: m_ENQ-2401_p_bdm_1 -> p_bdm_1)
      const parts = memberId.split('_');
      const personaId = parts.slice(2).join('_'); // Handle persona IDs that might have underscores
      
      const persona = getPersonaById(personaId);
      if (!persona) {
        console.warn(`[initializeMockEnquiryState] Persona not found: ${personaId} (from memberId: ${memberId})`);
        return null;
      }

      return {
        id: memberId, // Keep the full member ID
        userId: persona.userId,
        personaId: persona.id,
        role: persona.role,
        joinedAt: new Date(),
      };
    }).filter((m): m is Member => m !== null);

    state.membersByEnquiry[enq.id] = members;
  });

  return state;
}

/**
 * Initialize MessageDomainState from mock messages, seller channels, and buyer/seller DMs
 */
export function initializeMockMessageState(): MessageDomainState {
  console.log('[initializeMockMessageState] Initializing message state with:', {
    messagesCount: Object.keys(MOCK_MESSAGES).length,
    sellerChannelsCount: Object.keys(MOCK_SELLER_CHANNELS).length,
    sellerDMChannelsCount: MOCK_SELLER_DM_CHANNELS.length,
    buyerDMChannelsCount: MOCK_BUYER_DM_CHANNELS.length,
    sellerGroupsCount: MOCK_SELLER_GROUPS.length,  // NEW
    buyerGroupsCount: MOCK_BUYER_GROUPS.length,  // NEW
    internalGroupsCount: MOCK_INTERNAL_GROUPS.length,  // NEW
    sellerDMChannels: MOCK_SELLER_DM_CHANNELS.map(ch => ({
      id: ch.id,
      sellerId: ch.sellerId,
      sellerName: ch.sellerName,
      cmPersonaId: ch.cmPersonaId
    }))
  });
  
  return {
    messages: MOCK_MESSAGES,
    sellerChannels: MOCK_SELLER_CHANNELS,
    sellerDMChannels: MOCK_SELLER_DM_CHANNELS,
    buyerDMChannels: MOCK_BUYER_DM_CHANNELS,
    groupChannels: [...MOCK_SELLER_GROUPS, ...MOCK_BUYER_GROUPS, ...MOCK_INTERNAL_GROUPS],
    groupInvites: [],
    threads: [],
  };
}