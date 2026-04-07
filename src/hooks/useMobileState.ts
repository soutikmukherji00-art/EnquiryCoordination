/**
 * Mobile State Hook
 * 
 * Centralized state manager for mobile-specific UI concerns.
 * Handles composer management, share triggers, and mobile-only UI states.
 */

import { useState, useCallback, useRef, ReactNode } from "react";

export interface MobileState {
  // Mobile composer (injected from ConversationPanel)
  mobileComposer: ReactNode;
  
  // Share trigger callback (ref-based to avoid re-renders)
  mobileShareTrigger: (() => void) | null;
}

export interface MobileActions {
  // Composer management
  setMobileComposer: (composer: ReactNode) => void;
  clearMobileComposer: () => void;
  
  // Share trigger management
  setMobileShareTrigger: (trigger: () => void) => void;
  clearMobileShareTrigger: () => void;
  triggerMobileShare: () => void;
}

export function useMobileState(): MobileState & MobileActions {
  const [mobileComposer, setMobileComposerState] = useState<ReactNode>(null);
  const mobileShareTriggerRef = useRef<(() => void) | null>(null);
  
  // Composer management
  const setMobileComposer = useCallback((composer: ReactNode) => {
    setMobileComposerState(composer);
  }, []);
  
  const clearMobileComposer = useCallback(() => {
    setMobileComposerState(null);
  }, []);
  
  // Share trigger management (uses ref to avoid re-renders)
  const setMobileShareTrigger = useCallback((trigger: () => void) => {
    mobileShareTriggerRef.current = trigger;
  }, []);
  
  const clearMobileShareTrigger = useCallback(() => {
    mobileShareTriggerRef.current = null;
  }, []);
  
  const triggerMobileShare = useCallback(() => {
    if (mobileShareTriggerRef.current) {
      mobileShareTriggerRef.current();
    }
  }, []);
  
  return {
    mobileComposer,
    mobileShareTrigger: mobileShareTriggerRef.current,
    setMobileComposer,
    clearMobileComposer,
    setMobileShareTrigger,
    clearMobileShareTrigger,
    triggerMobileShare,
  };
}
