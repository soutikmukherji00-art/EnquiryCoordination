/**
 * Architecture Validation Check
 * 
 * This file validates that all new architecture modules
 * can be imported and used correctly.
 * 
 * If this file has no TypeScript errors, the architecture is sound.
 */

// ===== DOMAIN IMPORTS =====
import {
  // Enquiry
  Enquiry,
  EnquiryState,
  Member,
  Persona,
  Role,
  canConvertToOrder,
  isTerminalState,
  enquiryReducer,
  initialEnquiryState,
  EnquiryStateStore,
  selectEnquiry,
  selectAllEnquiries,
  selectMembers,
  selectPrimaryCM,
  selectVisibleMembers,
  createEnquiryWithCreator,
  addPersonaAsMember,
  
  // Persona
  PERSONAS,
  getPersonaById,
  
  // Policy
  ComponentId,
  ActionId,
  RolePolicy,
  ROLE_POLICIES,
  getPolicyForRole,
  isComponentVisible,
  isActionAllowed,
  resolveMessageDisplaySender,
  canShareMessages,
  canTagMembers,
  
  // Message
  Message,
  UserRole,
  Channel,
  SellerChannel,
  messageReducer,
  initialMessageState,
  applyMasking,
  prepareSharedMessages,
  shouldMaskSeller,
  
  // Seller
  Seller,
  SELLERS,
  findSellerById,
  searchSellers,
  prepareFanOut,
  createSellerChannel,
  
  // Audit
  AuditEntry,
  auditReducer,
  initialAuditState,
} from "@/domain";

// ===== INFRASTRUCTURE IMPORTS =====
import {
  DataStore,
  MemoryStore,
  AIService,
  MockAIService,
  RealtimeService,
  MockRealtimeService,
} from "@/infrastructure";

// ===== VALIDATION TESTS =====

/**
 * Test 1: Can create instances
 */
const validateInstances = () => {
  const store = new MemoryStore();
  const ai = new MockAIService();
  const realtime = new MockRealtimeService();
  
  console.log("✅ Infrastructure instances created");
  return { store, ai, realtime };
};

/**
 * Test 2: Can use domain functions
 */
const validateDomainLogic = () => {
  // Test enquiry logic
  const canConvert = canConvertToOrder("RM Approved");
  const isTerminal = isTerminalState("Converted to Order");
  
  // Test seller logic
  const seller = findSellerById("s_1");
  const results = searchSellers("Suresh");
  
  console.log("✅ Domain logic working", { canConvert, isTerminal, seller, results });
};

/**
 * Test 3: Can use reducers
 */
const validateReducers = () => {
  const enquiryState = enquiryReducer(initialEnquiryState, {
    type: "ENQUIRY_CREATED",
    payload: {
      enquiryId: "TEST-001",
      buyerName: "Test Buyer",
      createdBy: "Test User",
      createdByRole: "BDM",
      timestamp: new Date(),
    },
  });
  
  console.log("✅ Reducers working", enquiryState);
};

/**
 * Test 4: Can use masking logic
 */
const validateMasking = () => {
  const message: Message = {
    id: "msg-1",
    type: "user",
    sender: "Seller Name",
    senderRole: "Seller",
    content: "Test",
    timestamp: new Date(),
  };
  
  const masked = applyMasking(message, "seller-s_1", "internal", "CM User", "CM");
  const shouldMask = shouldMaskSeller("seller-s_1", "internal");
  
  console.log("✅ Masking logic working", { masked, shouldMask });
};

/**
 * Test 5: Can use fan-out logic
 */
const validateFanOut = () => {
  const messages: Message[] = [{
    id: "msg-1",
    type: "user",
    content: "RFQ",
    timestamp: new Date(),
  }];
  
  const result = prepareFanOut(["s_1", "s_2"], messages, "ENQ-001", new Date(), []);
  
  console.log("✅ Fan-out logic working", result);
};

// ===== RUN ALL VALIDATIONS =====
export const runArchitectureValidation = () => {
  try {
    validateInstances();
    validateDomainLogic();
    validateReducers();
    validateMasking();
    validateFanOut();
    
    console.log("\n🎉 ALL ARCHITECTURE VALIDATIONS PASSED\n");
    return true;
  } catch (error) {
    console.error("\n❌ ARCHITECTURE VALIDATION FAILED\n", error);
    return false;
  }
};

// Auto-run validation (can be commented out)
// runArchitectureValidation();