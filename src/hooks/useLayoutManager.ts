/**
 * Layout Manager Hook
 * 
 * Determines what to render in each column based on current navigation state.
 * Implements the priority logic from PROJECT_CONTEXT.md.
 * 
 * Layout slots:
 * - Left Column: EnquiryList (always shown for internal roles)
 * - Center Column: Primary content (conversation/thread/audit)
 * - Right Column: Structured panel or thread panel
 */

import { useMemo } from "react";
import type { ViewContext } from "@/hooks/useNavigationState";
import type { HeaderContext } from "@/domain/layout/header-layouts";

/**
 * Layout Column Types
 */
export type LeftColumnContent = "enquiry-list" | "none";

export type CenterColumnContent = 
  | "buyer-dm"        // Buyer DM conversation
  | "seller-dm"       // Seller DM conversation
  | "thread-main"     // Thread in main mode (Enquiry Threads tab)
  | "group"           // Group conversation
  | "enquiry"         // Enquiry conversation
  | "audit"           // Audit trail view
  | "empty";          // Nothing selected

export type RightColumnContent = 
  | "thread-panel"    // Thread panel (side-panel mode)
  | "structured"      // Structured panel (enquiry data)
  | "none";           // Nothing

/**
 * Layout State
 */
export interface LayoutState {
  // Column contents
  leftColumn: LeftColumnContent;
  centerColumn: CenterColumnContent;
  rightColumn: RightColumnContent;
  
  // Header context
  headerContext: HeaderContext["type"];
  
  // Computed flags
  isThreeColumn: boolean;    // Desktop: show all 3 columns
  isTwoColumn: boolean;      // Tablet: show left + center OR center + right
  isOneColumn: boolean;      // Mobile: show one column at a time
  
  // Primary view active
  isPrimaryViewActive: boolean;
}

/**
 * Layout Manager Options
 */
export interface LayoutManagerOptions {
  // Navigation context
  viewContext: ViewContext;
  
  // Enquiry state
  showAuditTrail?: boolean;
  
  // Thread state
  threadPanelOpen?: boolean;
  threadViewMode?: "side-panel" | "main";
  
  // Responsive
  breakpoint?: "mobile" | "tablet" | "desktop";
  
  // Role
  isInternalRole?: boolean;
}

/**
 * Use Layout Manager
 * 
 * Determines what to render in each column based on app state.
 * Implements the priority logic from PROJECT_CONTEXT.md:
 * 
 * Center Column Priority:
 * 1. selectedBuyerDMId → BuyerDMHeader + ConversationPanel
 * 2. selectedSellerDMId → SellerDMHeader + ConversationPanel
 * 3. threadViewMode === "main" && threadPanelOpen → ThreadPanel
 * 4. selectedGroupId → GroupHeader + ConversationPanel
 * 5. selectedEnquiryId → EnquiryHeader + (AuditTrailView OR ConversationPanel)
 * 
 * Right Column Priority:
 * 1. threadViewMode === "side-panel" && threadPanelOpen → ThreadPanel
 * 2. threadViewMode === "main" && threadPanelOpen → StructuredPanel (for tagged enquiry)
 * 3. selectedEnquiry && !showAuditTrail → StructuredPanel
 */
export function useLayoutManager(options: LayoutManagerOptions): LayoutState {
  const {
    viewContext,
    showAuditTrail = false,
    threadPanelOpen = false,
    threadViewMode = "side-panel",
    breakpoint = "desktop",
    isInternalRole = true,
  } = options;
  
  // Determine columns
  const layout = useMemo<LayoutState>(() => {
    // Left column (always enquiry list for internal roles)
    const leftColumn: LeftColumnContent = isInternalRole ? "enquiry-list" : "none";
    
    // Responsive flags
    const isThreeColumn = breakpoint === "desktop";
    const isTwoColumn = breakpoint === "tablet";
    const isOneColumn = breakpoint === "mobile";
    
    // Center column (priority logic)
    let centerColumn: CenterColumnContent = "empty";
    let headerContext: HeaderContext["type"] = "none";
    
    // Priority 1: Buyer DM
    if (viewContext.type === "buyer-dm") {
      centerColumn = "buyer-dm";
      headerContext = "dm";
    }
    // Priority 2: Seller DM
    else if (viewContext.type === "seller-dm") {
      centerColumn = "seller-dm";
      headerContext = "dm";
    }
    // Priority 3: Thread main mode
    else if (viewContext.type === "thread" && viewContext.mode === "main") {
      centerColumn = "thread-main";
      headerContext = "thread";
    }
    // Priority 4: Group
    else if (viewContext.type === "group") {
      centerColumn = "group";
      headerContext = "group";
    }
    // Priority 5: Enquiry
    else if (viewContext.type === "enquiry") {
      centerColumn = showAuditTrail ? "audit" : "enquiry";
      headerContext = "enquiry";
    }
    
    // Right column (priority logic)
    let rightColumn: RightColumnContent = "none";
    
    // Priority 1: Thread panel (side-panel mode)
    if (threadPanelOpen && threadViewMode === "side-panel") {
      rightColumn = "thread-panel";
    }
    // Priority 2: Structured panel (thread main mode with tagged enquiry)
    else if (threadPanelOpen && threadViewMode === "main" && viewContext.type === "thread") {
      rightColumn = "structured"; // Show enquiry data for tagged thread
    }
    // Priority 3: Structured panel (enquiry selected, not audit)
    else if (viewContext.type === "enquiry" && !showAuditTrail) {
      rightColumn = "structured";
    }
    
    // Primary view active
    const isPrimaryViewActive = centerColumn !== "empty";
    
    return {
      leftColumn,
      centerColumn,
      rightColumn,
      headerContext,
      isThreeColumn,
      isTwoColumn,
      isOneColumn,
      isPrimaryViewActive,
    };
  }, [viewContext, showAuditTrail, threadPanelOpen, threadViewMode, breakpoint, isInternalRole]);
  
  return layout;
}

/**
 * Layout Utilities
 */

/**
 * Check if a specific column should be visible
 */
export function isColumnVisible(
  column: LeftColumnContent | CenterColumnContent | RightColumnContent
): boolean {
  if (column === "none" || column === "empty") {
    return false;
  }
  return true;
}

/**
 * Get CSS classes for column visibility
 */
export function getColumnClasses(
  column: LeftColumnContent | CenterColumnContent | RightColumnContent,
  breakpoint: "mobile" | "tablet" | "desktop"
): string {
  if (!isColumnVisible(column)) {
    return "hidden";
  }
  
  // Desktop: always show if not "none"
  if (breakpoint === "desktop") {
    return "";
  }
  
  // Tablet/Mobile: conditional visibility
  return ""; // Let ResponsiveApp handle this
}

/**
 * Determine if we need to show the thread panel
 */
export function shouldShowThreadPanel(
  threadPanelOpen: boolean,
  threadViewMode: "side-panel" | "main",
  viewContext: ViewContext
): boolean {
  if (!threadPanelOpen) return false;
  
  // Side-panel mode: show as right panel (only when group selected)
  if (threadViewMode === "side-panel") {
    return viewContext.type === "group" || viewContext.type === "thread";
  }
  
  // Main mode: show as center content
  return threadViewMode === "main";
}

/**
 * Determine if structured panel should be visible
 */
export function shouldShowStructuredPanel(
  viewContext: ViewContext,
  showAuditTrail: boolean,
  threadPanelOpen: boolean,
  threadViewMode: "side-panel" | "main"
): boolean {
  // Hide if audit trail is shown
  if (showAuditTrail) return false;
  
  // Hide if thread panel is in side-panel mode
  if (threadPanelOpen && threadViewMode === "side-panel") return false;
  
  // Show for enquiry view
  if (viewContext.type === "enquiry") return true;
  
  // Show for thread main mode (shows tagged enquiry data)
  if (viewContext.type === "thread" && threadViewMode === "main") return true;
  
  return false;
}
