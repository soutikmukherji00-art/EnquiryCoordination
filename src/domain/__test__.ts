/**
 * Domain Layer Validation
 * 
 * Simple compile-time check that all domain logic is correctly typed.
 * This file can be deleted - it's just for validation.
 */

import {
  Enquiry,
  EnquiryState,
  canConvertToOrder,
  enquiryReducer,
  initialEnquiryState,
  EnquiryEvent,
} from "./index";

import {
  Message,
  messageReducer,
  initialMessageState,
  MessageEvent,
  applyMasking,
  prepareSharedMessages,
} from "./index";

import {
  SELLERS,
  findSellerById,
  prepareFanOut,
} from "./index";

import {
  auditReducer,
  initialAuditState,
  formatStateChange,
} from "./index";

// Test enquiry reducer
const testEnquiry = () => {
  const event: EnquiryEvent = {
    type: "ENQUIRY_CREATED",
    payload: {
      enquiryId: "ENQ-TEST",
      buyerName: "Test Buyer",
      createdBy: "Test User",
      createdByRole: "BDM",
      timestamp: new Date(),
    },
  };

  const newState = enquiryReducer(initialEnquiryState, event);
  console.log("Enquiry state updated:", newState);
};

// Test message masking
const testMasking = () => {
  const message: Message = {
    id: "msg-1",
    type: "user",
    sender: "Seller Name",
    senderRole: "Seller",
    content: "Test message",
    timestamp: new Date(),
  };

  const masked = applyMasking(message, "seller-s_1", "internal", "User", "CM");
  console.log("Masked message:", masked);
};

// Test seller fanout
const testFanout = () => {
  const messages: Message[] = [
    {
      id: "msg-1",
      type: "user",
      content: "RFQ message",
      timestamp: new Date(),
    },
  ];

  const result = prepareFanOut(["s_1", "s_2"], messages, "ENQ-TEST", new Date(), []);
  console.log("Fan-out result:", result);
};

export { testEnquiry, testMasking, testFanout };