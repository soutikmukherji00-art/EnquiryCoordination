/**
 * Header Layout System
 * 
 * Provides standardized header layouts for all channel types.
 * Replaces ad-hoc header implementations with composable patterns.
 * 
 * Benefits:
 * - Consistent visual hierarchy
 * - Reusable layout patterns
 * - Type-safe composition
 * - Easy to extend
 */

import type { ReactNode } from "react";
import type { Member, Persona } from "@/domain/enquiry/enquiry.types";

/**
 * Header Layout Types
 */
export type HeaderLayout = 
  | "enquiry"      // ENQ-ID (P2) → Buyer Name (P0) → Value • Category • State (P1)
  | "thread"       // ENQ-ID (P2) → Buyer Name (P0) → Value • Category • State (P1) + close
  | "group"        // Group Name (P0) + members
  | "dm"           // Participant Name (P0) + status
  | "custom";      // Fully custom

/**
 * Common Header Props
 */
export interface HeaderLayoutProps {
  layout: HeaderLayout;
  className?: string;
  
  // Content props
  title?: string;           // P2: Small label (e.g., "ENQ-1234", "Buyer Group")
  subtitle?: ReactNode;     // P0: Primary label (large, prominent)
  metadata?: ReactNode;     // P1: Secondary info (value, category, state)
  badge?: ReactNode;        // Badge next to title
  
  // Actions
  actions?: ReactNode;      // Right-side actions (close, members, etc.)
  
  // Members (for group/enquiry headers)
  members?: Member[];
  personas?: Map<string, Persona>;
  onAddMember?: (personaId: string) => void;
  onRemoveMember?: (memberId: string) => void;
  
  // Layout options
  hideTitle?: boolean;      // Hide P2 title (useful for groups)
  hideMetadata?: boolean;   // Hide P1 metadata row
  
  // Callbacks
  onClose?: () => void;     // Show close button
}

/**
 * Layout Presets
 * 
 * Pre-configured layouts for common scenarios.
 */

/**
 * Enquiry Header Layout
 * 
 * Visual hierarchy:
 * - P2: Enquiry ID (subdued, small)
 * - P0: Buyer Name (prominent, large, blue)
 * - P1: Value • Category • State (inline, gray)
 * - Right: Members indicator
 * 
 * @example
 * <EnquiryHeaderLayout
 *   enquiryId="ENQ-1234"
 *   buyerName="Ramesh Industries"
 *   value={450000}
 *   categories={['Steel']}
 *   state="Pending Response"
 *   members={members}
 *   personas={personaMap}
 * />
 */
export interface EnquiryHeaderLayoutProps {
  enquiryId: string;
  buyerName: string;
  buyerPersonaId?: string;
  value?: number;
  categories?: Array<{ name: string }>;
  state?: string;
  members?: Member[];
  personas?: Map<string, Persona>;
  onAddMember?: (personaId: string) => void;
  onRemoveMember?: (memberId: string) => void;
}

/**
 * Thread Header Layout
 * 
 * Same as Enquiry but with close button and optional group context.
 * 
 * @example
 * <ThreadHeaderLayout
 *   enquiryId="ENQ-1234"
 *   buyerName="Ramesh Industries"
 *   groupName="Buyer Group"
 *   mode="side-panel"
 *   onClose={() => closeThread()}
 * />
 */
export interface ThreadHeaderLayoutProps extends EnquiryHeaderLayoutProps {
  groupName?: string;       // Show group context
  groupId?: string;
  mode?: "side-panel" | "main";
  onClose?: () => void;
}

/**
 * Group Header Layout
 * 
 * Visual hierarchy:
 * - P0: Group Name (prominent, large, blue)
 * - Right: Members indicator with add button
 * 
 * @example
 * <GroupHeaderLayout
 *   groupName="Ramesh Industries"
 *   groupType="Buyer Group"
 *   members={members}
 *   personas={personaMap}
 *   onAddMembers={handleAddMembers}
 * />
 */
export interface GroupHeaderLayoutProps {
  groupName: string;
  groupType?: string;       // "Buyer Group", "Seller Group", etc. (hidden by default)
  groupPersonaId?: string;  // For hover trigger
  members?: Member[];
  personas?: Map<string, Persona>;
  onAddMembers?: (memberIds: string[]) => void;
}

/**
 * DM Header Layout
 * 
 * Visual hierarchy:
 * - P2: "Direct Message" (subdued, small)
 * - P0: Participant Name (prominent, large, blue)
 * - Role badge shown separately next to the name
 * - P1: Last seen / status (gray)
 * - Right: Info button
 * 
 * @example
 * <DMHeaderLayout
 *   participantName="Amit Kumar"
 *   participantId="p_bdm_1"
 *   dmType="buyer"
 *   lastSeen="2 hours ago"
 * />
 */
export interface DMHeaderLayoutProps {
  participantName: string;
  participantId: string;
  dmType: "buyer" | "seller";
  lastSeen?: string;
  isActive?: boolean;
}

/**
 * Layout Factories
 * 
 * Helper functions to create layout prop objects from raw data.
 */

/**
 * Create EnquiryHeaderLayout props from domain objects
 */
export function createEnquiryHeaderLayout(
  enquiry: { id: string; buyerName: string; buyerPersonaId?: string; estimatedValue?: number; categories?: Array<{ name: string }>; state?: string },
  members?: Member[],
  personas?: Map<string, Persona>
): EnquiryHeaderLayoutProps {
  return {
    enquiryId: enquiry.id,
    buyerName: enquiry.buyerName,
    buyerPersonaId: enquiry.buyerPersonaId,
    value: enquiry.estimatedValue,
    categories: enquiry.categories,
    state: enquiry.state,
    members,
    personas,
  };
}

/**
 * Create ThreadHeaderLayout props from thread + enquiry data
 */
export function createThreadHeaderLayout(
  thread: { id: string; enquiryId?: string; groupId?: string },
  enquiry?: { id: string; buyerName: string; buyerPersonaId?: string; estimatedValue?: number; categories?: Array<{ name: string }>; state?: string },
  group?: { id: string; name: string },
  mode?: "side-panel" | "main",
  onClose?: () => void
): ThreadHeaderLayoutProps {
  if (!enquiry) {
    return {
      enquiryId: thread.enquiryId || "New Thread",
      buyerName: "New Thread",
      groupName: group?.name,
      groupId: group?.id,
      mode,
      onClose,
    };
  }
  
  return {
    ...createEnquiryHeaderLayout(enquiry),
    groupName: group?.name,
    groupId: group?.id,
    mode,
    onClose,
  };
}

/**
 * Create GroupHeaderLayout props from group data
 */
export function createGroupHeaderLayout(
  group: { id: string; name: string; type: string; buyerPersonaId?: string; sellerId?: string },
  members?: Member[],
  personas?: Map<string, Persona>
): GroupHeaderLayoutProps {
  const groupTypeLabel = 
    group.type === "buyer" ? "Buyer Group" :
    group.type === "seller" ? "Seller Group" :
    "Internal Group";
  
  return {
    groupName: group.name,
    groupType: groupTypeLabel,
    groupPersonaId: group.buyerPersonaId || group.sellerId,
    members,
    personas,
  };
}

/**
 * Create DMHeaderLayout props from DM data
 */
export function createDMHeaderLayout(
  dm: { id: string; type: string },
  participant: { id: string; displayName: string; role: string; isActive?: boolean },
  lastSeen?: string
): DMHeaderLayoutProps {
  return {
    participantName: participant.displayName,
    participantId: participant.id,
    dmType: dm.type as "buyer" | "seller",
    lastSeen,
    isActive: participant.isActive,
  };
}

/**
 * Header Context
 * 
 * Runtime context for determining which header to render.
 */
export type HeaderContext = 
  | { type: "enquiry"; data: EnquiryHeaderLayoutProps }
  | { type: "thread"; data: ThreadHeaderLayoutProps }
  | { type: "group"; data: GroupHeaderLayoutProps }
  | { type: "dm"; data: DMHeaderLayoutProps }
  | { type: "none" };

/**
 * Resolve Header Context
 * 
 * Determines which header to render based on current app state.
 */
export function resolveHeaderContext(
  selectedEnquiryId: string | null,
  selectedBuyerDMId: string | null,
  selectedSellerDMId: string | null,
  selectedGroupId: string | null,
  threadPanelOpen: boolean,
  threadViewMode: "side-panel" | "main"
): HeaderContext["type"] {
  if (threadPanelOpen && threadViewMode === "main") {
    return "thread";
  }
  if (selectedBuyerDMId || selectedSellerDMId) {
    return "dm";
  }
  if (selectedGroupId) {
    return "group";
  }
  if (selectedEnquiryId) {
    return "enquiry";
  }
  return "none";
}
