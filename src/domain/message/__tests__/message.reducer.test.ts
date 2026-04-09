/**
 * Tests: Message Reducer
 * 
 * Comprehensive tests for message reducer logic including:
 * - Regular channel messages
 * - Seller channels
 * - Buyer DM channels
 * - Seller DM channels
 * - Group channels
 * - Message forwarding
 * - Duplicate prevention
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MessageDomainState,
  messageReducer,
  initialMessageState,
} from '@/domain/message/message.reducer';
import {
  createMessageSentEvent,
  createMessageForwardedEvent,
  createSellerChannelCreatedEvent,
  createBuyerDMCreatedEvent,
  createSellerDMCreatedEvent,
  createGroupCreatedEvent,
  createThreadCreatedEvent,
} from '@/domain/message/message.events';
import { Message } from '@/domain/message/message.types';

describe('Message Reducer', () => {
  let state: MessageDomainState;

  beforeEach(() => {
    state = { ...initialMessageState };
  });

  describe('MESSAGE_SENT', () => {
    describe('Regular Channels', () => {
      it('adds message to regular channel', () => {
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
        const newState = messageReducer(state, event);

        expect(newState.messages['ENQ-001']?.['internal']).toHaveLength(1);
        expect(newState.messages['ENQ-001']['internal'][0]).toEqual(message);
      });

      it('prevents duplicate messages in regular channels', () => {
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
        
        // Send twice
        state = messageReducer(state, event);
        const newState = messageReducer(state, event);

        // Should still have only 1 message
        expect(newState.messages['ENQ-001']['internal']).toHaveLength(1);
      });

      it('adds multiple messages to the same channel', () => {
        const msg1: Message = {
          id: 'msg_001',
          type: 'user',
          sender: 'John Doe',
          senderPersonaId: 'p_bdm_1',
          senderRole: 'BDM',
          content: 'First message',
          timestamp: new Date(),
        };

        const msg2: Message = {
          id: 'msg_002',
          type: 'user',
          sender: 'Jane Smith',
          senderPersonaId: 'p_cm_1',
          senderRole: 'CM',
          content: 'Second message',
          timestamp: new Date(),
        };

        state = messageReducer(state, createMessageSentEvent('ENQ-001', 'internal', msg1));
        state = messageReducer(state, createMessageSentEvent('ENQ-001', 'internal', msg2));

        expect(state.messages['ENQ-001']['internal']).toHaveLength(2);
        expect(state.messages['ENQ-001']['internal'][0].id).toBe('msg_001');
        expect(state.messages['ENQ-001']['internal'][1].id).toBe('msg_002');
      });
    });

    describe('Seller Channels (Legacy)', () => {
      it('auto-creates seller channel when sending first message', () => {
        const message: Message = {
          id: 'msg_001',
          type: 'user',
          sender: 'CM User',
          senderPersonaId: 'p_cm_1',
          senderRole: 'CM',
          content: 'Hello seller',
          timestamp: new Date(),
        };

        const event = createMessageSentEvent('ENQ-001', 'seller-s_1', message);
        const newState = messageReducer(state, event);

        expect(newState.sellerChannels['ENQ-001']).toHaveLength(1);
        expect(newState.sellerChannels['ENQ-001'][0].id).toBe('seller-s_1');
        expect(newState.sellerChannels['ENQ-001'][0].sellerId).toBe('s_1');
        expect(newState.sellerChannels['ENQ-001'][0].messages).toHaveLength(1);
      });

      it('adds message to existing seller channel', () => {
        const msg1: Message = {
          id: 'msg_001',
          type: 'user',
          sender: 'CM User',
          senderPersonaId: 'p_cm_1',
          senderRole: 'CM',
          content: 'First message',
          timestamp: new Date(),
        };

        const msg2: Message = {
          id: 'msg_002',
          type: 'user',
          sender: 'CM User',
          senderPersonaId: 'p_cm_1',
          senderRole: 'CM',
          content: 'Second message',
          timestamp: new Date(),
        };

        state = messageReducer(state, createMessageSentEvent('ENQ-001', 'seller-s_1', msg1));
        state = messageReducer(state, createMessageSentEvent('ENQ-001', 'seller-s_1', msg2));

        expect(state.sellerChannels['ENQ-001']).toHaveLength(1);
        expect(state.sellerChannels['ENQ-001'][0].messages).toHaveLength(2);
      });

      it('prevents duplicate messages in seller channels', () => {
        const message: Message = {
          id: 'msg_001',
          type: 'user',
          sender: 'CM User',
          senderPersonaId: 'p_cm_1',
          senderRole: 'CM',
          content: 'Test message',
          timestamp: new Date(),
        };

        const event = createMessageSentEvent('ENQ-001', 'seller-s_1', message);
        
        state = messageReducer(state, event);
        const newState = messageReducer(state, event);

        expect(newState.sellerChannels['ENQ-001'][0].messages).toHaveLength(1);
      });
    });
  });

  describe('MESSAGE_FORWARDED', () => {
    describe('Seller Channel Forwarding', () => {
      it('auto-creates seller channel when forwarding to new channel', () => {
        const messages: Message[] = [
          {
            id: 'fwd-123-msg_001-i0',
            type: 'forwarded',
            content: 'Forwarded message',
            timestamp: new Date(),
            forwardedFrom: {
              channel: 'internal',
              originalSender: 'John Doe',
              originalSenderPersonaId: 'p_bdm_1',
              originalTimestamp: new Date(),
            },
          },
        ];

        const event = createMessageForwardedEvent(
          'ENQ-001',
          'internal',
          'seller-s_1',
          messages
        );

        const newState = messageReducer(state, event);

        expect(newState.sellerChannels['ENQ-001']).toHaveLength(1);
        expect(newState.sellerChannels['ENQ-001'][0].id).toBe('seller-s_1');
        expect(newState.sellerChannels['ENQ-001'][0].messages).toHaveLength(1);
      });

      it('prevents duplicate forwarded messages', () => {
        const messages: Message[] = [
          {
            id: 'fwd-123-msg_001-i0',
            type: 'forwarded',
            content: 'Forwarded message',
            timestamp: new Date(),
            forwardedFrom: {
              channel: 'internal',
              originalSender: 'John Doe',
              originalSenderPersonaId: 'p_bdm_1',
              originalTimestamp: new Date(),
            },
          },
        ];

        const event = createMessageForwardedEvent(
          'ENQ-001',
          'internal',
          'seller-s_1',
          messages
        );

        state = messageReducer(state, event);
        const newState = messageReducer(state, event);

        expect(newState.sellerChannels['ENQ-001'][0].messages).toHaveLength(1);
      });

      it('adds new messages and filters duplicates in same forward', () => {
        // Create channel with existing message
        const existingMsg: Message = {
          id: 'msg_001',
          type: 'user',
          content: 'Existing',
          timestamp: new Date(),
        };

        state = messageReducer(
          state,
          createMessageSentEvent('ENQ-001', 'seller-s_1', existingMsg)
        );

        // Forward mix of new and duplicate
        const forwardedMessages: Message[] = [
          {
            id: 'msg_001', // Duplicate
            type: 'forwarded',
            content: 'Existing',
            timestamp: new Date(),
          },
          {
            id: 'msg_002', // New
            type: 'forwarded',
            content: 'New message',
            timestamp: new Date(),
          },
        ];

        const event = createMessageForwardedEvent(
          'ENQ-001',
          'internal',
          'seller-s_1',
          forwardedMessages
        );

        const newState = messageReducer(state, event);

        // Should have 2 messages total (1 existing + 1 new)
        expect(newState.sellerChannels['ENQ-001'][0].messages).toHaveLength(2);
        expect(newState.sellerChannels['ENQ-001'][0].messages[0].id).toBe('msg_001');
        expect(newState.sellerChannels['ENQ-001'][0].messages[1].id).toBe('msg_002');
      });
    });

    describe('Regular Channel Forwarding', () => {
      it('forwards messages to regular channel', () => {
        const messages: Message[] = [
          {
            id: 'fwd-123-msg_001-i0',
            type: 'forwarded',
            content: 'Forwarded to internal',
            timestamp: new Date(),
          },
        ];

        const event = createMessageForwardedEvent(
          'ENQ-001',
          'buyer',
          'internal',
          messages
        );

        const newState = messageReducer(state, event);

        expect(newState.messages['ENQ-001']['internal']).toHaveLength(1);
        expect(newState.messages['ENQ-001']['internal'][0].id).toBe('fwd-123-msg_001-i0');
      });

      it('hides source messages after forwarding', () => {
        // Add original message to buyer channel
        const originalMsg: Message = {
          id: 'msg_001',
          type: 'user',
          content: 'Original message',
          timestamp: new Date(),
        };

        state = messageReducer(
          state,
          createMessageSentEvent('ENQ-001', 'buyer', originalMsg)
        );

        // Forward it to internal
        const forwardedMsg: Message = {
          id: 'fwd-123-msg_001-i0',
          type: 'forwarded',
          content: 'Original message',
          timestamp: new Date(),
        };

        const event = createMessageForwardedEvent(
          'ENQ-001',
          'buyer',
          'internal',
          [forwardedMsg]
        );

        const newState = messageReducer(state, event);

        // Original message should be hidden
        expect(newState.messages['ENQ-001']['buyer'][0].hidden).toBe(true);
        // Forwarded message should exist in internal
        expect(newState.messages['ENQ-001']['internal'][0].id).toBe('fwd-123-msg_001-i0');
      });
    });
  });

  describe('BUYER_DM_CREATED', () => {
    it('creates new buyer DM channel', () => {
      const event = createBuyerDMCreatedEvent(
        'buyer-dm-p_bdm_1-b_1',
        'b_1',
        'Acme Corp',
        'p_bdm_1',
        'John Doe'
      );

      const newState = messageReducer(state, event);

      expect(newState.buyerDMChannels).toHaveLength(1);
      expect(newState.buyerDMChannels[0].id).toBe('buyer-dm-p_bdm_1-b_1');
      expect(newState.buyerDMChannels[0].buyerId).toBe('b_1');
      expect(newState.buyerDMChannels[0].buyerName).toBe('Acme Corp');
      expect(newState.buyerDMChannels[0].messages).toEqual([]);
    });

    it('prevents duplicate buyer DM channels', () => {
      const event = createBuyerDMCreatedEvent(
        'buyer-dm-p_bdm_1-b_1',
        'b_1',
        'Acme Corp',
        'p_bdm_1',
        'John Doe'
      );

      state = messageReducer(state, event);
      const newState = messageReducer(state, event);

      expect(newState.buyerDMChannels).toHaveLength(1);
    });
  });

  describe('SELLER_DM_CREATED', () => {
    it('creates new seller DM channel', () => {
      const event = createSellerDMCreatedEvent(
        'seller-dm-p_cm_1-s_1',
        's_1',
        'ABC Suppliers',
        'p_cm_1',
        'Jane Smith'
      );

      const newState = messageReducer(state, event);

      expect(newState.sellerDMChannels).toHaveLength(1);
      expect(newState.sellerDMChannels[0].id).toBe('seller-dm-p_cm_1-s_1');
      expect(newState.sellerDMChannels[0].sellerId).toBe('s_1');
      expect(newState.sellerDMChannels[0].sellerName).toBe('ABC Suppliers');
      expect(newState.sellerDMChannels[0].messages).toEqual([]);
    });

    it('prevents duplicate seller DM channels', () => {
      const event = createSellerDMCreatedEvent(
        'seller-dm-p_cm_1-s_1',
        's_1',
        'ABC Suppliers',
        'p_cm_1',
        'Jane Smith'
      );

      state = messageReducer(state, event);
      const newState = messageReducer(state, event);

      expect(newState.sellerDMChannels).toHaveLength(1);
    });
  });

  describe('GROUP_CREATED', () => {
    it('creates new group channel', () => {
      const event = createGroupCreatedEvent(
        'group-123',
        'ENQ-001',
        'Logistics Team',
        ['p_cm_1', 'p_cm_2'],
        'p_bdm_1'
      );

      const newState = messageReducer(state, event);

      expect(newState.groupChannels).toHaveLength(1);
      expect(newState.groupChannels[0].id).toBe('group-123');
      expect(newState.groupChannels[0].name).toBe('Logistics Team');
      expect(newState.groupChannels[0].memberPersonaIds).toEqual(['p_cm_1', 'p_cm_2']);
      expect(newState.groupChannels[0].status).toBe('active');
    });

    it('creates pending group channel', () => {
      const event = createGroupCreatedEvent(
        'group-456',
        'ENQ-001',
        'Pricing Discussion',
        ['p_cm_3'],
        'p_bdm_1',
        'pending'
      );

      const newState = messageReducer(state, event);

      expect(newState.groupChannels[0].status).toBe('pending');
    });

    it('persists buyer mail routing metadata on group creation', () => {
      const event = createGroupCreatedEvent(
        'group-mail-001',
        'Acme Corp - Mail',
        'buyer',
        'active',
        [
          {
            id: 'p_bdm_1',
            type: 'persona',
            name: 'Amit Kumar',
            role: 'BDM',
          },
        ],
        'p_bdm_1',
        undefined,
        {
          channelKind: 'mail',
          buyerId: 'buyer_001',
          buyerPersonaId: 'p_buyer_acme_001',
        }
      );

      const newState = messageReducer(state, event);

      expect(newState.groupChannels[0].channelKind).toBe('mail');
      expect(newState.groupChannels[0].buyerId).toBe('buyer_001');
      expect(newState.groupChannels[0].buyerPersonaId).toBe('p_buyer_acme_001');
      expect(newState.groupChannels[0].memberPersonaIds).toContain('p_bdm_1');
    });

    it('prevents duplicate group channels', () => {
      const event = createGroupCreatedEvent(
        'group-123',
        'ENQ-001',
        'Logistics Team',
        ['p_cm_1', 'p_cm_2'],
        'p_bdm_1'
      );

      state = messageReducer(state, event);
      const newState = messageReducer(state, event);

      expect(newState.groupChannels).toHaveLength(1);
    });
  });

  describe('THREAD_CREATED', () => {
    it('stores a root message snapshot on the thread for document rendering', () => {
      const rootMessage: Message = {
        id: 'msg-root-1',
        type: 'user',
        sender: 'Amit Kumar',
        senderPersonaId: 'p_bdm_1',
        senderRole: 'BDM',
        content: 'Root thread message',
        timestamp: new Date(),
        attachment: {
          name: 'first-thread.pdf',
          type: 'application/pdf',
          url: 'https://example.com/first-thread.pdf',
        },
      };

      const groupEvent = createGroupCreatedEvent(
        'group-123',
        'ENQ-001',
        'Logistics Team',
        ['p_cm_1', 'p_cm_2'],
        'p_bdm_1'
      );

      state = messageReducer(state, groupEvent);
      state = messageReducer(state, createMessageSentEvent('ENQ-001', 'group-123', rootMessage));

      const threadEvent = createThreadCreatedEvent(
        'thread-123',
        'group-123',
        'p_bdm_1',
        'Thread title',
        'ENQ-001',
        'msg-root-1',
        rootMessage,
      );

      const newState = messageReducer(state, threadEvent);

      expect(newState.groupChannels[0].threads?.[0].rootMessage?.attachment?.name).toBe('first-thread.pdf');
      expect(newState.groupChannels[0].threads?.[0].rootMessageId).toBe('msg-root-1');
    });

    it('backfills the root message into the group when it is missing so attachments stay visible', () => {
      const rootMessage: Message = {
        id: 'msg-root-2',
        type: 'user',
        sender: 'Amit Kumar',
        senderPersonaId: 'p_bdm_1',
        senderRole: 'BDM',
        content: 'Root thread message with attachment',
        timestamp: new Date(),
        attachment: {
          name: 'steel-spec-sheet.pdf',
          type: 'application/pdf',
          url: 'https://example.com/steel-spec-sheet.pdf',
        },
      };

      const groupEvent = createGroupCreatedEvent(
        'group-124',
        'ENQ-002',
        'Logistics Team',
        ['p_cm_1'],
        'p_bdm_1'
      );

      state = messageReducer(state, groupEvent);

      const threadEvent = createThreadCreatedEvent(
        'thread-124',
        'group-124',
        'p_bdm_1',
        'Thread title',
        'ENQ-002',
        rootMessage.id,
        rootMessage,
      );

      const newState = messageReducer(state, threadEvent);

      const group = newState.groupChannels[0];
      const groupRootMessage = group.messages.find((m) => m.id === 'msg-root-2');

      expect(groupRootMessage?.attachment?.name).toBe('steel-spec-sheet.pdf');
      expect(groupRootMessage?.threadId).toBe('thread-124');
      expect(groupRootMessage?.replyCount).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles unknown event type gracefully', () => {
      const unknownEvent = {
        type: 'UNKNOWN_EVENT',
        payload: {},
        timestamp: new Date(),
      } as any;

      const newState = messageReducer(state, unknownEvent);

      // Should return state unchanged
      expect(newState).toEqual(state);
    });

    it('handles multiple enquiries independently', () => {
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

      state = messageReducer(state, createMessageSentEvent('ENQ-001', 'internal', msg1));
      state = messageReducer(state, createMessageSentEvent('ENQ-002', 'internal', msg2));

      expect(state.messages['ENQ-001']['internal']).toHaveLength(1);
      expect(state.messages['ENQ-002']['internal']).toHaveLength(1);
      expect(state.messages['ENQ-001']['internal'][0].id).toBe('msg_001');
      expect(state.messages['ENQ-002']['internal'][0].id).toBe('msg_002');
    });
  });
});
