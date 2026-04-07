/**
 * Data Flow Validation Tests
 * 
 * Validates that data flows correctly through the application:
 * 1. Events are properly created
 * 2. Reducers update state correctly
 * 3. Selectors retrieve correct data
 * 4. State is immutable
 * 5. No side effects in reducers
 */

import { describe, it, expect } from 'vitest';
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
} from '@/domain/enquiry/enquiry.events';
import {
  createMessageSentEvent,
} from '@/domain/message/message.events';
import {
  selectAllEnquiries,
  selectEnquiryById,
  selectMembers,
  selectPrimaryCM,
} from '@/domain/enquiry/enquiry.selectors';
import { Member, generateMemberId } from '@/domain/enquiry/enquiry.types';
import { Message } from '@/domain/message/message.types';

describe('Data Flow Validation', () => {
  describe('Immutability Tests', () => {
    it('enquiry reducer does not mutate original state', () => {
      const originalState = { ...initialEnquiryState };
      const enquiryId = 'ENQ-001';
      
      const event = createEnquiryCreatedEvent(enquiryId, 'p_bdm_1');
      const newState = enquiryReducer(originalState, event);

      // Original state should be unchanged
      expect(originalState).toEqual(initialEnquiryState);
      expect(originalState).not.toBe(newState);
      expect(originalState.enquiries[enquiryId]).toBeUndefined();
      expect(newState.enquiries[enquiryId]).toBeDefined();
    });

    it('message reducer does not mutate original state', () => {
      const originalState = { ...initialMessageState };
      const message: Message = {
        id: 'msg_001',
        type: 'user',
        content: 'Test',
        timestamp: new Date(),
      };

      const event = createMessageSentEvent('ENQ-001', 'internal', message);
      const newState = messageReducer(originalState, event);

      // Original state should be unchanged
      expect(originalState).toEqual(initialMessageState);
      expect(originalState).not.toBe(newState);
      expect(originalState.messages['ENQ-001']).toBeUndefined();
      expect(newState.messages['ENQ-001']).toBeDefined();
    });

    it('nested state updates do not mutate parent objects', () => {
      let state: EnquiryStateStore = { ...initialEnquiryState };
      
      // Create enquiry
      state = enquiryReducer(
        state,
        createEnquiryCreatedEvent('ENQ-001', 'p_bdm_1')
      );
      
      const stateAfterCreate = state;

      // Add member
      const member: Member = {
        id: generateMemberId('ENQ-001', 'p_cm_1'),
        userId: 'u_201',
        personaId: 'p_cm_1',
        role: 'CM',
        joinedAt: new Date(),
      };

      state = enquiryReducer(
        state,
        createMemberAddedEvent('ENQ-001', member)
      );

      // Previous state should be unchanged
      expect(stateAfterCreate.membersByEnquiry['ENQ-001']).toHaveLength(0);
      expect(state.membersByEnquiry['ENQ-001']).toHaveLength(1);
      expect(stateAfterCreate).not.toBe(state);
    });
  });

  describe('Selector Tests', () => {
    it('selectAllEnquiries returns all enquiries', () => {
      let state: EnquiryStateStore = { ...initialEnquiryState };

      state = enquiryReducer(state, createEnquiryCreatedEvent('ENQ-001', 'p_bdm_1'));
      state = enquiryReducer(state, createEnquiryCreatedEvent('ENQ-002', 'p_bdm_2'));
      state = enquiryReducer(state, createEnquiryCreatedEvent('ENQ-003', 'p_bdm_3'));

      const enquiries = selectAllEnquiries(state);

      expect(enquiries).toHaveLength(3);
      expect(enquiries.map(e => e.id)).toContain('ENQ-001');
      expect(enquiries.map(e => e.id)).toContain('ENQ-002');
      expect(enquiries.map(e => e.id)).toContain('ENQ-003');
    });

    it('selectEnquiryById returns correct enquiry', () => {
      let state: EnquiryStateStore = { ...initialEnquiryState };

      state = enquiryReducer(state, createEnquiryCreatedEvent('ENQ-001', 'p_bdm_1'));
      state = enquiryReducer(state, createEnquiryCreatedEvent('ENQ-002', 'p_bdm_2'));

      const enquiry = selectEnquiryById(state, 'ENQ-001');

      expect(enquiry).toBeDefined();
      expect(enquiry?.id).toBe('ENQ-001');
    });

    it('selectMembers returns all members for enquiry', () => {
      let state: EnquiryStateStore = { ...initialEnquiryState };

      state = enquiryReducer(state, createEnquiryCreatedEvent('ENQ-001', 'p_bdm_1'));

      const member1: Member = {
        id: generateMemberId('ENQ-001', 'p_bdm_1'),
        userId: 'u_101',
        personaId: 'p_bdm_1',
        role: 'BDM',
        joinedAt: new Date(),
      };

      const member2: Member = {
        id: generateMemberId('ENQ-001', 'p_cm_1'),
        userId: 'u_201',
        personaId: 'p_cm_1',
        role: 'CM',
        joinedAt: new Date(),
      };

      state = enquiryReducer(state, createMemberAddedEvent('ENQ-001', member1));
      state = enquiryReducer(state, createMemberAddedEvent('ENQ-001', member2));

      const members = selectMembers(state, 'ENQ-001');

      expect(members).toHaveLength(2);
      expect(members.map(m => m.personaId)).toContain('p_bdm_1');
      expect(members.map(m => m.personaId)).toContain('p_cm_1');
    });

    it('selectPrimaryCM returns correct primary CM', () => {
      let state: EnquiryStateStore = { ...initialEnquiryState };

      state = enquiryReducer(state, createEnquiryCreatedEvent('ENQ-001', 'p_bdm_1'));

      const cmMember: Member = {
        id: generateMemberId('ENQ-001', 'p_cm_1'),
        userId: 'u_201',
        personaId: 'p_cm_1',
        role: 'CM',
        isPrimaryCM: true,
        joinedAt: new Date(),
      };

      state = enquiryReducer(state, createMemberAddedEvent('ENQ-001', cmMember));

      const primaryCM = selectPrimaryCM(state, 'ENQ-001');

      expect(primaryCM).toBeDefined();
      expect(primaryCM?.personaId).toBe('p_cm_1');
      expect(primaryCM?.isPrimaryCM).toBe(true);
    });
  });

  describe('Event Creation Tests', () => {
    it('creates enquiry created event with correct structure', () => {
      const event = createEnquiryCreatedEvent(
        'ENQ-001',
        'p_bdm_1',
        'North',
        'Acme Corp',
        'p_buyer_1'
      );

      expect(event.type).toBe('ENQUIRY_CREATED');
      expect(event.payload.enquiryId).toBe('ENQ-001');
      expect(event.payload.createdByPersonaId).toBe('p_bdm_1');
      expect(event.payload.region).toBe('North');
      expect(event.payload.buyerName).toBe('Acme Corp');
      expect(event.payload.buyerPersonaId).toBe('p_buyer_1');
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('creates member added event with correct structure', () => {
      const member: Member = {
        id: 'member_001',
        userId: 'u_101',
        personaId: 'p_bdm_1',
        role: 'BDM',
        joinedAt: new Date(),
      };

      const event = createMemberAddedEvent('ENQ-001', member);

      expect(event.type).toBe('MEMBER_ADDED');
      expect(event.payload.enquiryId).toBe('ENQ-001');
      expect(event.payload.member).toEqual(member);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('creates message sent event with correct structure', () => {
      const message: Message = {
        id: 'msg_001',
        type: 'user',
        sender: 'John Doe',
        senderPersonaId: 'p_bdm_1',
        senderRole: 'BDM',
        content: 'Test message',
        timestamp: new Date(),
      };

      const event = createMessageSentEvent('ENQ-001', 'internal', message);

      expect(event.type).toBe('MESSAGE_SENT');
      expect(event.payload.enquiryId).toBe('ENQ-001');
      expect(event.payload.channelId).toBe('internal');
      expect(event.payload.message).toEqual(message);
      expect(event.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('State Consistency Tests', () => {
    it('maintains referential integrity between enquiries and members', () => {
      let state: EnquiryStateStore = { ...initialEnquiryState };

      state = enquiryReducer(state, createEnquiryCreatedEvent('ENQ-001', 'p_bdm_1'));

      const member: Member = {
        id: generateMemberId('ENQ-001', 'p_cm_1'),
        userId: 'u_201',
        personaId: 'p_cm_1',
        role: 'CM',
        joinedAt: new Date(),
      };

      state = enquiryReducer(state, createMemberAddedEvent('ENQ-001', member));

      // Enquiry should reference member
      expect(state.enquiries['ENQ-001'].memberIds).toContain(member.id);

      // Members list should contain member
      expect(state.membersByEnquiry['ENQ-001']).toContainEqual(member);
    });

    it('maintains message ordering', () => {
      let state: MessageDomainState = { ...initialMessageState };

      const messages: Message[] = [
        {
          id: 'msg_001',
          type: 'user',
          content: 'First',
          timestamp: new Date('2024-01-01T10:00:00Z'),
        },
        {
          id: 'msg_002',
          type: 'user',
          content: 'Second',
          timestamp: new Date('2024-01-01T10:01:00Z'),
        },
        {
          id: 'msg_003',
          type: 'user',
          content: 'Third',
          timestamp: new Date('2024-01-01T10:02:00Z'),
        },
      ];

      messages.forEach((msg) => {
        state = messageReducer(state, createMessageSentEvent('ENQ-001', 'internal', msg));
      });

      const channelMessages = state.messages['ENQ-001']['internal'];

      expect(channelMessages).toHaveLength(3);
      expect(channelMessages[0].content).toBe('First');
      expect(channelMessages[1].content).toBe('Second');
      expect(channelMessages[2].content).toBe('Third');
    });

    it('isolates state between different enquiries', () => {
      let enquiryState: EnquiryStateStore = { ...initialEnquiryState };
      let messageState: MessageDomainState = { ...initialMessageState };

      // Create two enquiries
      enquiryState = enquiryReducer(
        enquiryState,
        createEnquiryCreatedEvent('ENQ-001', 'p_bdm_1')
      );
      enquiryState = enquiryReducer(
        enquiryState,
        createEnquiryCreatedEvent('ENQ-002', 'p_bdm_2')
      );

      // Add members to each
      const member1: Member = {
        id: generateMemberId('ENQ-001', 'p_cm_1'),
        userId: 'u_201',
        personaId: 'p_cm_1',
        role: 'CM',
        joinedAt: new Date(),
      };

      const member2: Member = {
        id: generateMemberId('ENQ-002', 'p_cm_2'),
        userId: 'u_202',
        personaId: 'p_cm_2',
        role: 'CM',
        joinedAt: new Date(),
      };

      enquiryState = enquiryReducer(enquiryState, createMemberAddedEvent('ENQ-001', member1));
      enquiryState = enquiryReducer(enquiryState, createMemberAddedEvent('ENQ-002', member2));

      // Add messages to each
      const msg1: Message = {
        id: 'msg_001',
        type: 'user',
        content: 'Message for ENQ-001',
        timestamp: new Date(),
      };

      const msg2: Message = {
        id: 'msg_002',
        type: 'user',
        content: 'Message for ENQ-002',
        timestamp: new Date(),
      };

      messageState = messageReducer(messageState, createMessageSentEvent('ENQ-001', 'internal', msg1));
      messageState = messageReducer(messageState, createMessageSentEvent('ENQ-002', 'internal', msg2));

      // Verify isolation
      expect(selectMembers(enquiryState, 'ENQ-001')).toHaveLength(1);
      expect(selectMembers(enquiryState, 'ENQ-002')).toHaveLength(1);
      expect(selectMembers(enquiryState, 'ENQ-001')[0].personaId).toBe('p_cm_1');
      expect(selectMembers(enquiryState, 'ENQ-002')[0].personaId).toBe('p_cm_2');

      expect(messageState.messages['ENQ-001']['internal']).toHaveLength(1);
      expect(messageState.messages['ENQ-002']['internal']).toHaveLength(1);
      expect(messageState.messages['ENQ-001']['internal'][0].content).toContain('ENQ-001');
      expect(messageState.messages['ENQ-002']['internal'][0].content).toContain('ENQ-002');
    });
  });

  describe('Performance & Scalability Tests', () => {
    it('handles large number of enquiries efficiently', () => {
      let state: EnquiryStateStore = { ...initialEnquiryState };
      const startTime = Date.now();

      // Create 1000 enquiries
      for (let i = 0; i < 1000; i++) {
        state = enquiryReducer(
          state,
          createEnquiryCreatedEvent(`ENQ-${i.toString().padStart(4, '0')}`, 'p_bdm_1')
        );
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
      expect(Object.keys(state.enquiries)).toHaveLength(1000);
    });

    it('handles large number of messages efficiently', () => {
      let state: MessageDomainState = { ...initialMessageState };
      const startTime = Date.now();

      // Send 1000 messages
      for (let i = 0; i < 1000; i++) {
        const message: Message = {
          id: `msg_${i}`,
          type: 'user',
          content: `Message ${i}`,
          timestamp: new Date(),
        };

        state = messageReducer(
          state,
          createMessageSentEvent('ENQ-001', 'internal', message)
        );
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
      expect(state.messages['ENQ-001']['internal']).toHaveLength(1000);
    });
  });
});
