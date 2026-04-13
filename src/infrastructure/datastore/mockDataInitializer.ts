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
import { EnquiryRecord } from "@/domain/enquiry/enquiry.record";
import { getPersonaById } from "@/domain/persona/persona.data";
import { Member, Enquiry } from "@/domain/enquiry/enquiry.types";
import { getBuyerDefaultsForEnquiry } from "@/domain/enquiry/enquiry.schema";

/**
 * Creates a mock EnquiryRecord for a given Enquiry.
 * Populates it with specific details for demo data continuity.
 */
function createMockRecordForEnquiry(enq: Enquiry): EnquiryRecord {
  const buyerDefaults = getBuyerDefaultsForEnquiry(enq.buyerId, "DetailedRFQ");
  const etaDays = buyerDefaults.etaDays ? parseInt(buyerDefaults.etaDays, 10) : undefined;
  const resolvedPrimaryCMPersonaId = (enq.memberIds || [])
    .map((memberId) => memberId.split("_").slice(2).join("_"))
    .find((personaId) => getPersonaById(personaId)?.role === "CM");
  const resolvedPrimaryCMName = resolvedPrimaryCMPersonaId
    ? getPersonaById(resolvedPrimaryCMPersonaId)?.displayName
    : undefined;

  const common = {
    enquiryId: enq.id,
    createdAt: enq.createdAt || new Date(),
    creationSource: "prism-manual" as const,
    isNew: false,
    buyer: {
      id: enq.buyerId,
      personaId: enq.buyerPersonaId,
      name: enq.buyerName || "Unknown Buyer",
      company: enq.buyerName || undefined,
      gstin: buyerDefaults.gstin,
      creditLimit: buyerDefaults.creditLimit,
      openCreditLimit: buyerDefaults.openCreditLimit,
    },
    requirements: {
      categories: enq.categories || [],
      deliveryLocation: buyerDefaults.deliveryLocation,
      deliveryLocations: buyerDefaults.deliveryLocations,
      etaDays: Number.isFinite(etaDays) ? etaDays : undefined,
      paymentTerms: buyerDefaults.paymentTerms,
      estimatedValue: enq.estimatedValue,
      enhancerTypes: ["primary"],
      iddDays: 10,
      mddDays: 15,
    },
    assignment: {
      primaryCMId: resolvedPrimaryCMPersonaId,
      primaryCMName: resolvedPrimaryCMName,
      bdmPersonaId: enq.bdmPersonaId,
    },
  };

  // Specific overrides for key mock enquiries
  switch (enq.id) {
    case "ENQ-2401":
      return {
        ...common,
        creationSource: "whatsapp-intake",
        isNew: true,
        requirements: { 
          ...common.requirements, 
          deliveryLocation: "Delhi Project Site",
          scopeOfUnloading: "Buyer Scope",
          notes: "Urgent sourcing for TMT bars and steel pipes."
        },
        products: [
          { category: "Steel", name: "TMT 500D", quantity: "200 MT", specifications: "Standard construction grade" },
          { category: "Steel", name: "Steel Pipe 4 inch", quantity: "50 MT", specifications: "Industrial grade" }
        ]
      };
    case "ENQ-2402":
      return {
        ...common,
        creationSource: "mail-intake",
        isNew: false,
        requirements: { 
          ...common.requirements, 
          deliveryLocation: "Bangalore Facility",
          scopeOfUnloading: "Buyer Scope",
          notes: "Requires SS 316L grade, 4-inch diameter for industrial use."
        },
        products: [
          { category: "Steel", name: "SS 316L Pipes", quantity: "1000m", specifications: "4-inch diameter, Industrial grade" }
        ]
      };
    case "ENQ-2403":
      return {
        ...common,
        creationSource: "prism-manual",
        isNew: false,
        requirements: { 
          ...common.requirements, 
          deliveryLocation: "Mumbai Warehouse",
          scopeOfUnloading: "Buyer Scope",
          notes: "Need fast delivery. 5mm thickness sheets required."
        },
        products: [
          { category: "Steel", name: "Aluminum Sheets", quantity: "1000 sq m", specifications: "5mm thick, Aerospace grade" }
        ]
      };
    case "ENQ-2404":
      return {
        ...common,
        creationSource: "website-intake",
        isNew: true,
        requirements: { 
          ...common.requirements, 
          deliveryLocation: "Chennai Site",
          scopeOfUnloading: "Buyer Scope",
          notes: "Looking for grade 304 industrial pipes and OPC 53 cement."
        },
        products: [
          { category: "Steel", name: "Industrial Steel Pipes", quantity: "500 units", specifications: "Grade 304, 2-inch diameter" },
          { category: "Cement", name: "Cement OPC 53", quantity: "50 bags", specifications: "Standard construction use" }
        ]
      };
    default:
      return {
        ...common,
        requirements: {
          ...common.requirements,
          notes: "Sourcing for standard construction materials."
        }
      };
  }
}

/**
 * Initialize EnquiryStateStore from mock enquiries
 */
export function initializeMockEnquiryState(): EnquiryStateStore {
  const state: EnquiryStateStore = {
    enquiries: {},
    membersByEnquiry: {},
    records: {},
  };

  // Convert enquiries
  MOCK_ENQUIRIES.forEach((enq) => {
    state.enquiries[enq.id] = enq;
    // Generate a structured record for each mock enquiry
    state.records[enq.id] = createMockRecordForEnquiry(enq);

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

  return state as EnquiryStateStore;
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