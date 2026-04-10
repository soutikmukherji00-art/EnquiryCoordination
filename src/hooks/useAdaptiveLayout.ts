import { useBreakpoint, isMobile, isTablet, isDesktop } from './useBreakpoint';

export enum LayoutMode {
  COMPACT = 'compact', // Mobile
  MEDIUM = 'medium',   // Tablet
  EXPANDED = 'expanded' // Desktop
}

export interface AdaptiveLayout {
  mode: LayoutMode;
  isCompact: boolean;
  isMedium: boolean;
  isExpanded: boolean;
  
  // Dimensions from theme.css
  headerHeight: number;
  tabBarHeight: number;
  
  // Helpers
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * useAdaptiveLayout Hook
 * 
 * Provides high-level layout state for adaptive components.
 * Strictly decoupled from raw pixel values.
 */
export function useAdaptiveLayout(): AdaptiveLayout {
  const breakpoint = useBreakpoint();
  
  const isCompact = isMobile(breakpoint);
  const isMedium = isTablet(breakpoint);
  const isExpanded = isDesktop(breakpoint);
  
  const mode = isCompact 
    ? LayoutMode.COMPACT 
    : isMedium 
      ? LayoutMode.MEDIUM 
      : LayoutMode.EXPANDED;

  return {
    mode,
    isCompact,
    isMedium,
    isExpanded,
    
    // Values matching theme.css
    headerHeight: 56,
    tabBarHeight: 64,
    
    // Passthrough helpers
    isMobile: isCompact,
    isTablet: isMedium,
    isDesktop: isExpanded,
  };
}
