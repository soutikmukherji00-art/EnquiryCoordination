/**
 * useBreakpoint Hook
 * 
 * Detects current device breakpoint for responsive layouts.
 * Breakpoints: Mobile (<=767px), Tablet (768-1023px), Desktop (>=1024px)
 * 
 * Performance optimizations:
 * - Uses useSyncExternalStore to share a SINGLE resize listener across ALL subscribers
 * - Previously, each component calling useBreakpoint() registered its own resize listener
 * - With 100 MessageItems, that was 100 duplicate event listeners
 */

import { useSyncExternalStore } from "react";

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

function getBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// Module-level shared state
let currentBreakpoint: Breakpoint = getBreakpoint();
const listeners = new Set<() => void>();

// Single resize handler for the entire app
if (typeof window !== 'undefined') {
  let rafId: number | null = null;
  
  window.addEventListener('resize', () => {
    // Debounce via requestAnimationFrame
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const next = getBreakpoint();
      if (next !== currentBreakpoint) {
        currentBreakpoint = next;
        listeners.forEach(cb => cb());
      }
    });
  });
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
}

function getSnapshot(): Breakpoint {
  return currentBreakpoint;
}

function getServerSnapshot(): Breakpoint {
  return 'desktop';
}

export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Helper functions for breakpoint checks
 */
export function isMobile(breakpoint: Breakpoint): boolean {
  return breakpoint === 'mobile';
}

export function isTablet(breakpoint: Breakpoint): boolean {
  return breakpoint === 'tablet';
}

export function isDesktop(breakpoint: Breakpoint): boolean {
  return breakpoint === 'desktop';
}

export function isMobileOrTablet(breakpoint: Breakpoint): boolean {
  return breakpoint === 'mobile' || breakpoint === 'tablet';
}
