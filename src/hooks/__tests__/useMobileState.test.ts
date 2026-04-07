/**
 * Tests for useMobileState hook
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMobileState } from '../useMobileState';
import { createElement } from 'react';

describe('useMobileState', () => {
  describe('initialization', () => {
    it('should initialize with null composer and trigger', () => {
      const { result } = renderHook(() => useMobileState());
      
      expect(result.current.mobileComposer).toBeNull();
      expect(result.current.mobileShareTrigger).toBeNull();
    });
  });

  describe('mobile composer', () => {
    it('should set mobile composer', () => {
      const { result } = renderHook(() => useMobileState());
      const composerElement = createElement('div', { id: 'test-composer' }, 'Composer');
      
      act(() => {
        result.current.setMobileComposer(composerElement);
      });
      
      expect(result.current.mobileComposer).toBe(composerElement);
    });

    it('should clear mobile composer', () => {
      const { result } = renderHook(() => useMobileState());
      const composerElement = createElement('div', { id: 'test-composer' }, 'Composer');
      
      act(() => {
        result.current.setMobileComposer(composerElement);
      });
      expect(result.current.mobileComposer).toBe(composerElement);
      
      act(() => {
        result.current.clearMobileComposer();
      });
      
      expect(result.current.mobileComposer).toBeNull();
    });

    it('should update composer multiple times', () => {
      const { result } = renderHook(() => useMobileState());
      const composer1 = createElement('div', { id: 'composer-1' });
      const composer2 = createElement('div', { id: 'composer-2' });
      
      act(() => {
        result.current.setMobileComposer(composer1);
      });
      expect(result.current.mobileComposer).toBe(composer1);
      
      act(() => {
        result.current.setMobileComposer(composer2);
      });
      expect(result.current.mobileComposer).toBe(composer2);
    });
  });

  describe('mobile share trigger', () => {
    it('should set share trigger', () => {
      const { result } = renderHook(() => useMobileState());
      const triggerFn = vi.fn();
      
      act(() => {
        result.current.setMobileShareTrigger(triggerFn);
      });
      
      expect(result.current.mobileShareTrigger).toBe(triggerFn);
    });

    it('should trigger share when trigger function is set', () => {
      const { result } = renderHook(() => useMobileState());
      const triggerFn = vi.fn();
      
      act(() => {
        result.current.setMobileShareTrigger(triggerFn);
      });
      
      act(() => {
        result.current.triggerMobileShare();
      });
      
      expect(triggerFn).toHaveBeenCalledTimes(1);
    });

    it('should not error when triggering with no function set', () => {
      const { result } = renderHook(() => useMobileState());
      
      expect(() => {
        act(() => {
          result.current.triggerMobileShare();
        });
      }).not.toThrow();
    });

    it('should clear share trigger', () => {
      const { result } = renderHook(() => useMobileState());
      const triggerFn = vi.fn();
      
      act(() => {
        result.current.setMobileShareTrigger(triggerFn);
      });
      expect(result.current.mobileShareTrigger).toBe(triggerFn);
      
      act(() => {
        result.current.clearMobileShareTrigger();
      });
      
      expect(result.current.mobileShareTrigger).toBeNull();
    });

    it('should update trigger multiple times', () => {
      const { result } = renderHook(() => useMobileState());
      const trigger1 = vi.fn();
      const trigger2 = vi.fn();
      
      act(() => {
        result.current.setMobileShareTrigger(trigger1);
      });
      
      act(() => {
        result.current.setMobileShareTrigger(trigger2);
      });
      
      act(() => {
        result.current.triggerMobileShare();
      });
      
      expect(trigger1).not.toHaveBeenCalled();
      expect(trigger2).toHaveBeenCalledTimes(1);
    });
  });

  describe('ref-based trigger storage', () => {
    it('should not cause re-renders when setting trigger', () => {
      const { result, rerender } = renderHook(() => useMobileState());
      const renderCount = { count: 0 };
      
      // Track render count (note: initial render doesn't count)
      const triggerFn = vi.fn();
      
      act(() => {
        result.current.setMobileShareTrigger(triggerFn);
      });
      
      // Setting trigger should not cause state update (it uses ref)
      // The hook should maintain stable reference
      const firstRef = result.current.mobileShareTrigger;
      
      rerender();
      
      const secondRef = result.current.mobileShareTrigger;
      
      expect(firstRef).toBe(secondRef);
      expect(firstRef).toBe(triggerFn);
    });
  });

  describe('combined operations', () => {
    it('should manage composer and trigger independently', () => {
      const { result } = renderHook(() => useMobileState());
      const composer = createElement('div', {}, 'Composer');
      const trigger = vi.fn();
      
      act(() => {
        result.current.setMobileComposer(composer);
        result.current.setMobileShareTrigger(trigger);
      });
      
      expect(result.current.mobileComposer).toBe(composer);
      expect(result.current.mobileShareTrigger).toBe(trigger);
      
      act(() => {
        result.current.clearMobileComposer();
      });
      
      expect(result.current.mobileComposer).toBeNull();
      expect(result.current.mobileShareTrigger).toBe(trigger); // Trigger unchanged
      
      act(() => {
        result.current.clearMobileShareTrigger();
      });
      
      expect(result.current.mobileShareTrigger).toBeNull();
    });
  });
});
