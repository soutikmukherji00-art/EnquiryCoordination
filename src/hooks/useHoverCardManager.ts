/**
 * useHoverCardManager Hook
 * 
 * Global state manager for hover cards to ensure only one hover card is open at a time.
 * Prevents hover card synchronization issues where multiple cards could be open simultaneously.
 */

import { useState, useEffect, useCallback } from "react";

interface HoverCardState {
  openId: string | null;
  setOpen: (id: string | null) => void;
}

// Global state - shared across all hover card instances
let globalOpenId: string | null = null;
const listeners = new Set<(id: string | null) => void>();

/**
 * Subscribe to global hover card state changes
 */
function subscribe(listener: (id: string | null) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Update global hover card state
 */
function setGlobalOpenId(id: string | null) {
  globalOpenId = id;
  listeners.forEach((listener) => listener(id));
}

/**
 * Hook to manage hover card state with global synchronization
 * 
 * @param cardId - Unique identifier for this hover card instance
 * @returns Object with isOpen state and setOpen function
 */
export function useHoverCardManager(cardId: string) {
  const [isOpen, setIsOpen] = useState(false);

  // Subscribe to global state changes
  useEffect(() => {
    const unsubscribe = subscribe((openId) => {
      // Update local state based on global state
      setIsOpen(openId === cardId);
    });

    return unsubscribe;
  }, [cardId]);

  // Update global state when this card opens/closes
  const setOpen = useCallback(
    (open: boolean) => {
      if (open) {
        // Opening this card - close any other open cards
        setGlobalOpenId(cardId);
      } else if (globalOpenId === cardId) {
        // Closing this card - only if it's currently open
        setGlobalOpenId(null);
      }
    },
    [cardId]
  );

  return {
    isOpen,
    setOpen,
  };
}

/**
 * Get the currently open hover card ID
 */
export function getCurrentOpenHoverCard(): string | null {
  return globalOpenId;
}

/**
 * Close all hover cards
 */
export function closeAllHoverCards() {
  setGlobalOpenId(null);
}
