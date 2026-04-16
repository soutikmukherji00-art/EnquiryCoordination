/**
 * Integration Tests: Enquiry Flow
 * 
 * End-to-end tests for complete enquiry lifecycle:
 * 1. BDM creates enquiry with buyer
 * 2. CM gets assigned based on region/category
 * 3. Internal team communicates
 * 4. Messages forwarded to buyer
 * 5. Seller channels created
 * 6. Enquiry converted to order
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  EnquiryStateStore,
  enquiryReducer,
  initialEnquiryState,
} from '@/domain/enquiry/enquiry.reducer';
import {
  MessageDomainState,
  messageReducer,
  initialMessageState,
} from '@/domain/message/message.reducer';
import {
  createEnquiryCreatedEvent,
  createMemberAddedEvent,
  createPrimaryCMAssignedEvent,
  createEnquiryStateChangedEvent,
  createEnquiryConvertedEvent,
} from '@/domain/enquiry/enquiry.events';
import {
  createMessageSentEvent,
  createSellerChannelCreatedEvent,
} from '@/domain/message/message.events';
import { Member, generateMemberId } from '@/domain/enquiry/enquiry.types';
import { Message } from '@/domain/message/message.types';

describe('Integration: Complete Enquiry Flow', () => {
  let enquiryState: EnquiryStateStore;
  let messageState: MessageDomainState;

  beforeEach(() => {
    enquiryState = { ...initialEnquiryState };
    messageState = { ...initialMessageState };
  });

  it('completes full enquiry lifecycle', () => {
    const enquiryId = 'ENQ-001';
    const bdmPersonaId = 'p_bdm_1';
    const cmPersonaId = 'p_cm_1';
    const buyerPersonaId = 'p_buyer_1';
    
    // Step 1: BDM creates enquiry
    console.log('Step 1: Create enquiry');
    enquiryState = enquiryReducer(
      enquiryState,
      createEnquiryCreatedEvent(
        enquiryId,
        bdmPersonaId,
        'North',
        'Acme Corp',
        buyerPersonaId
      )
    );

    expect(enquiryState.enquiries[enquiryId]).toBeDefined();
    expect(enquiryState.enquiries[enquiryId].state).toBe('Draft');
    expect(enquiryState.enquiries[enquiryId].region).toBe('North');

    // Step 2: Add BDM as member
    console.log('Step 2: Add BDM member');
    const bdmMember: Member = {
      id: generateMemberId(enquiryId, bdmPersonaId),
      userId: 'u_101',
      personaId: bdmPersonaId,
      role: 'BDM',
      joinedAt: new Date(),
    };

    enquiryState = enquiryReducer(
      enquiryState,
      createMemberAddedEvent(enquiryId, bdmMember)
    );

    expect(enquiryState.membersByEnquiry[enquiryId]).toHaveLength(1);

    // Step 3: Add CM and assign as primary
    console.log('Step 3: Add CM and assign as primary');
    const cmMember: Member = {
      id: generateMemberId(enquiryId, cmPersonaId),
      userId: 'u_201',
      personaId: cmPersonaId,
      role: 'CM',
      joinedAt: new Date(),
    };

    enquiryState = enquiryReducer(
      enquiryState,
      createMemberAddedEvent(enquiryId, cmMember)
    );

    enquiryState = enquiryReducer(
      enquiryState,
      createPrimaryCMAssignedEvent(enquiryId, cmMember.id)
    );

    expect(enquiryState.membersByEnquiry[enquiryId]).toHaveLength(2);
    expect(enquiryState.enquiries[enquiryId].primaryCMId).toBe(cmMember.id);

    // Step 4: Send internal message
    console.log('Step 4: Send internal message');
    const internalMsg: Message = {
      id: 'msg_001',
      type: 'user',
      sender: 'Rajesh Kumar (BDM)',
      senderPersonaId: bdmPersonaId,
      senderRole: 'BDM',
      content: 'Need Electronics CM for this enquiry @p_cm_1',
      timestamp: new Date(),
      mentions: [cmPersonaId],
    };

    messageState = messageReducer(
      messageState,
      createMessageSentEvent(enquiryId, 'internal', internalMsg)
    );

    expect(messageState.messages[enquiryId]['internal']).toHaveLength(1);
    expect(messageState.messages[enquiryId]['internal'][0].mentions).toContain(cmPersonaId);

    // Step 5: CM responds internally
    console.log('Step 5: CM responds');
    const cmResponse: Message = {
      id: 'msg_002',
      type: 'user',
      sender: 'Arjun Patel (CM)',
      senderPersonaId: cmPersonaId,
      senderRole: 'CM',
      content: 'I can handle this. What are the requirements?',
      timestamp: new Date(),
    };

    messageState = messageReducer(
      messageState,
      createMessageSentEvent(enquiryId, 'internal', cmResponse)
    );

    expect(messageState.messages[enquiryId]['internal']).toHaveLength(2);

    // Step 6: BDM submits requirement
    console.log('Step 6: Change state to Awaiting Response');
    enquiryState = enquiryReducer(
      enquiryState,
      createEnquiryStateChangedEvent(enquiryId, 'Awaiting Response', bdmPersonaId, 'Draft')
    );

    expect(enquiryState.enquiries[enquiryId].state).toBe('Awaiting Response');

    // Step 7: Send message to buyer channel
    console.log('Step 7: Send message to buyer');
    const buyerMsg: Message = {
      id: 'msg_003',
      type: 'user',
      sender: 'Rajesh Kumar (BDM)',
      senderPersonaId: bdmPersonaId,
      senderRole: 'BDM',
      content: 'Hi, we received your requirements. Working on quotations.',
      timestamp: new Date(),
    };

    messageState = messageReducer(
      messageState,
      createMessageSentEvent(enquiryId, 'buyer', buyerMsg)
    );

    expect(messageState.messages[enquiryId]['buyer']).toHaveLength(1);

    // Step 8: Create seller channel
    console.log('Step 8: Create seller channel');
    const sellerId = 's_1';
    const sellerName = 'ABC Suppliers';

    messageState = messageReducer(
      messageState,
      createSellerChannelCreatedEvent(enquiryId, sellerId, sellerName)
    );

    expect(messageState.sellerChannels[enquiryId]).toHaveLength(1);
    expect(messageState.sellerChannels[enquiryId][0].sellerName).toBe(sellerName);

    // Step 9: Forward message to seller
    console.log('Step 9: Forward to seller');
    const forwardedMsg: Message = {
      id: 'fwd-' + Date.now() + '-msg_001-i0',
      type: 'forwarded',
      content: internalMsg.content,
      timestamp: new Date(),
      forwardedFrom: {
        channel: 'internal',
        originalSender: internalMsg.sender!,
        originalSenderPersonaId: internalMsg.senderPersonaId,
        originalTimestamp: internalMsg.timestamp,
      },
    };

    messageState = messageReducer(
      messageState,
      createMessageSentEvent(enquiryId, `seller-${sellerId}`, forwardedMsg)
    );

    expect(messageState.sellerChannels[enquiryId][0].messages).toHaveLength(1);
    expect(messageState.sellerChannels[enquiryId][0].messages[0].type).toBe('forwarded');

    // Step 10: CM submits response and BDM marks as won
    console.log('Step 10: Change to CM Responded then RM Approved');
    enquiryState = enquiryReducer(
      enquiryState,
      createEnquiryStateChangedEvent(enquiryId, 'CM Responded', cmPersonaId, 'Awaiting Response')
    );
    enquiryState = enquiryReducer(
      enquiryState,
      createEnquiryStateChangedEvent(enquiryId, 'RM Approved', bdmPersonaId, 'CM Responded')
    );

    expect(enquiryState.enquiries[enquiryId].state).toBe('RM Approved');

    // Step 11: Convert to order
    console.log('Step 11: Convert to order');
    enquiryState = enquiryReducer(
      enquiryState,
      createEnquiryConvertedEvent(enquiryId, cmPersonaId)
    );

    expect(enquiryState.enquiries[enquiryId].state).toBe('Converted to Order');
    expect(enquiryState.enquiries[enquiryId].convertedAt).toBeDefined();

    // Final verification
    console.log('Final verification');
    expect(enquiryState.membersByEnquiry[enquiryId]).toHaveLength(2); // BDM + CM
    expect(messageState.messages[enquiryId]['internal']).toHaveLength(2);
    expect(messageState.messages[enquiryId]['buyer']).toHaveLength(1);
    expect(messageState.sellerChannels[enquiryId]).toHaveLength(1);
    expect(messageState.sellerChannels[enquiryId][0].messages).toHaveLength(1);
  });

  it('handles multiple sellers independently', () => {
    const enquiryId = 'ENQ-002';
    const cmPersonaId = 'p_cm_1';

    // Create enquiry
    enquiryState = enquiryReducer(
      enquiryState,
      createEnquiryCreatedEvent(enquiryId, cmPersonaId)
    );

    // Create multiple seller channels
    const sellers = [
      { id: 's_1', name: 'Seller A' },
      { id: 's_2', name: 'Seller B' },
      { id: 's_3', name: 'Seller C' },
    ];

    sellers.forEach((seller) => {
      messageState = messageReducer(
        messageState,
        createSellerChannelCreatedEvent(enquiryId, seller.id, seller.name)
      );
    });

    expect(messageState.sellerChannels[enquiryId]).toHaveLength(3);

    // Send different messages to each seller
    sellers.forEach((seller, index) => {
      const msg: Message = {
        id: `msg_seller_${index}`,
        type: 'user',
        content: `Message for ${seller.name}`,
        timestamp: new Date(),
      };

      messageState = messageReducer(
        messageState,
        createMessageSentEvent(enquiryId, `seller-${seller.id}`, msg)
      );
    });

    // Verify each seller has their own messages
    expect(messageState.sellerChannels[enquiryId][0].messages).toHaveLength(1);
    expect(messageState.sellerChannels[enquiryId][1].messages).toHaveLength(1);
    expect(messageState.sellerChannels[enquiryId][2].messages).toHaveLength(1);

    expect(messageState.sellerChannels[enquiryId][0].messages[0].content).toContain('Seller A');
    expect(messageState.sellerChannels[enquiryId][1].messages[0].content).toContain('Seller B');
    expect(messageState.sellerChannels[enquiryId][2].messages[0].content).toContain('Seller C');
  });

  it('prevents duplicate operations in concurrent scenarios', () => {
    const enquiryId = 'ENQ-003';
    const bdmPersonaId = 'p_bdm_1';

    // Create enquiry
    enquiryState = enquiryReducer(
      enquiryState,
      createEnquiryCreatedEvent(enquiryId, bdmPersonaId)
    );

    const member: Member = {
      id: generateMemberId(enquiryId, 'p_cm_1'),
      userId: 'u_201',
      personaId: 'p_cm_1',
      role: 'CM',
      joinedAt: new Date(),
    };

    // Try to add same member multiple times (simulating concurrent requests)
    const addEvent = createMemberAddedEvent(enquiryId, member);
    
    enquiryState = enquiryReducer(enquiryState, addEvent);
    enquiryState = enquiryReducer(enquiryState, addEvent);
    enquiryState = enquiryReducer(enquiryState, addEvent);

    // Should still have only 1 member
    expect(enquiryState.membersByEnquiry[enquiryId]).toHaveLength(1);

    // Try to send same message multiple times
    const message: Message = {
      id: 'msg_001',
      type: 'user',
      content: 'Test message',
      timestamp: new Date(),
    };

    const msgEvent = createMessageSentEvent(enquiryId, 'internal', message);
    
    messageState = messageReducer(messageState, msgEvent);
    messageState = messageReducer(messageState, msgEvent);
    messageState = messageReducer(messageState, msgEvent);

    // Should still have only 1 message
    expect(messageState.messages[enquiryId]['internal']).toHaveLength(1);
  });
});
