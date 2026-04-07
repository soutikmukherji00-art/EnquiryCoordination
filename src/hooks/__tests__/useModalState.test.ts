/**
 * Tests for useModalState hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModalState, hasOpenModal } from '../useModalState';
import type { Message } from '@/domain/message/message.types';

describe('useModalState', () => {
  describe('initialization', () => {
    it('should initialize with all modals closed', () => {
      const { result } = renderHook(() => useModalState());
      
      expect(result.current.isGroupModalOpen).toBe(false);
      expect(result.current.showThreadModal).toBe(false);
      expect(result.current.threadCreationMessageId).toBeNull();
      expect(result.current.threadCreationMessage).toBeNull();
      expect(result.current.showDeliveryWidget).toBe(false);
      expect(result.current.deliveryWidgetEnquiryId).toBeNull();
      expect(result.current.deliveryLocation).toBeNull();
      expect(result.current.profileBottomSheetOpen).toBe(false);
      expect(result.current.profilePersonaId).toBeNull();
    });
  });

  describe('group modal', () => {
    it('should open group modal', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.openGroupModal();
      });
      
      expect(result.current.isGroupModalOpen).toBe(true);
    });

    it('should close group modal', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.openGroupModal();
      });
      expect(result.current.isGroupModalOpen).toBe(true);
      
      act(() => {
        result.current.closeGroupModal();
      });
      
      expect(result.current.isGroupModalOpen).toBe(false);
    });
  });

  describe('thread modal', () => {
    const mockMessage: Message = {
      id: 'msg-1',
      sender: 'Test User',
      senderPersonaId: 'p-1',
      senderRole: 'BDM',
      content: 'Test message',
      timestamp: new Date(),
    };

    it('should open thread modal with message', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.openThreadModal(mockMessage);
      });
      
      expect(result.current.showThreadModal).toBe(true);
      expect(result.current.threadCreationMessageId).toBe('msg-1');
      expect(result.current.threadCreationMessage).toEqual(mockMessage);
    });

    it('should close thread modal and clear message', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.openThreadModal(mockMessage);
      });
      
      act(() => {
        result.current.closeThreadModal();
      });
      
      expect(result.current.showThreadModal).toBe(false);
      expect(result.current.threadCreationMessageId).toBeNull();
      expect(result.current.threadCreationMessage).toBeNull();
    });
  });

  describe('delivery widget', () => {
    it('should open delivery widget with enquiry and location', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.openDeliveryWidget('ENQ-1234', 'Mumbai');
      });
      
      expect(result.current.showDeliveryWidget).toBe(true);
      expect(result.current.deliveryWidgetEnquiryId).toBe('ENQ-1234');
      expect(result.current.deliveryLocation).toBe('Mumbai');
    });

    it('should close delivery widget and clear data', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.openDeliveryWidget('ENQ-1234', 'Mumbai');
      });
      
      act(() => {
        result.current.closeDeliveryWidget();
      });
      
      expect(result.current.showDeliveryWidget).toBe(false);
      expect(result.current.deliveryWidgetEnquiryId).toBeNull();
      expect(result.current.deliveryLocation).toBeNull();
    });
  });

  describe('profile sheet', () => {
    it('should open profile sheet with persona ID', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.openProfileSheet('p_buyer_1');
      });
      
      expect(result.current.profileBottomSheetOpen).toBe(true);
      expect(result.current.profilePersonaId).toBe('p_buyer_1');
    });

    it('should close profile sheet and clear persona', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.openProfileSheet('p_buyer_1');
      });
      
      act(() => {
        result.current.closeProfileSheet();
      });
      
      expect(result.current.profileBottomSheetOpen).toBe(false);
      expect(result.current.profilePersonaId).toBeNull();
    });
  });

  describe('closeAllModals', () => {
    it('should close all modals and reset state', () => {
      const { result } = renderHook(() => useModalState());
      
      const mockMessage: Message = {
        id: 'msg-1',
        sender: 'Test User',
        senderPersonaId: 'p-1',
        senderRole: 'BDM',
        content: 'Test message',
        timestamp: new Date(),
      };
      
      // Open all modals
      act(() => {
        result.current.openGroupModal();
        result.current.openThreadModal(mockMessage);
        result.current.openDeliveryWidget('ENQ-1234', 'Mumbai');
        result.current.openProfileSheet('p_buyer_1');
      });
      
      // Close all
      act(() => {
        result.current.closeAllModals();
      });
      
      expect(result.current.isGroupModalOpen).toBe(false);
      expect(result.current.showThreadModal).toBe(false);
      expect(result.current.threadCreationMessageId).toBeNull();
      expect(result.current.threadCreationMessage).toBeNull();
      expect(result.current.showDeliveryWidget).toBe(false);
      expect(result.current.deliveryWidgetEnquiryId).toBeNull();
      expect(result.current.deliveryLocation).toBeNull();
      expect(result.current.profileBottomSheetOpen).toBe(false);
      expect(result.current.profilePersonaId).toBeNull();
    });
  });

  describe('multiple modals', () => {
    it('should allow multiple modals to be open simultaneously', () => {
      const { result } = renderHook(() => useModalState());
      
      act(() => {
        result.current.openGroupModal();
        result.current.openDeliveryWidget('ENQ-1234', 'Mumbai');
      });
      
      expect(result.current.isGroupModalOpen).toBe(true);
      expect(result.current.showDeliveryWidget).toBe(true);
    });
  });
});

describe('hasOpenModal utility', () => {
  it('should return false when no modals open', () => {
    const { result } = renderHook(() => useModalState());
    
    expect(hasOpenModal(result.current)).toBe(false);
  });

  it('should return true when group modal is open', () => {
    const { result } = renderHook(() => useModalState());
    
    act(() => {
      result.current.openGroupModal();
    });
    
    expect(hasOpenModal(result.current)).toBe(true);
  });

  it('should return true when thread modal is open', () => {
    const { result } = renderHook(() => useModalState());
    
    const mockMessage: Message = {
      id: 'msg-1',
      sender: 'Test User',
      senderPersonaId: 'p-1',
      senderRole: 'BDM',
      content: 'Test message',
      timestamp: new Date(),
    };
    
    act(() => {
      result.current.openThreadModal(mockMessage);
    });
    
    expect(hasOpenModal(result.current)).toBe(true);
  });

  it('should return true when delivery widget is open', () => {
    const { result } = renderHook(() => useModalState());
    
    act(() => {
      result.current.openDeliveryWidget('ENQ-1234', 'Mumbai');
    });
    
    expect(hasOpenModal(result.current)).toBe(true);
  });

  it('should return true when profile sheet is open', () => {
    const { result } = renderHook(() => useModalState());
    
    act(() => {
      result.current.openProfileSheet('p_buyer_1');
    });
    
    expect(hasOpenModal(result.current)).toBe(true);
  });

  it('should return true when multiple modals are open', () => {
    const { result } = renderHook(() => useModalState());
    
    act(() => {
      result.current.openGroupModal();
      result.current.openDeliveryWidget('ENQ-1234', 'Mumbai');
    });
    
    expect(hasOpenModal(result.current)).toBe(true);
  });
});
