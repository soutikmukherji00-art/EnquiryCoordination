/**
 * Hook: Share Draft State
 *
 * Manages the full UI state of the unified share modal.
 * Exposes open / close / update / reset actions consumed by ShareModal.
 *
 * Key changes from v1:
 *   - No separate "new-thread" mode (new enquiry = new thread)
 *   - Messages are concatenated into a single editable block
 *   - Thread title is derived from the shared message content
 */

import { useCallback, useReducer } from "react";
import type { Message } from "@/domain/message/message.types";
import type { GroupChannel } from "@/domain/message/group.types";
import type {
  ShareDraft,
  ShareSourceContext,
  ShareRouteMode,
  NewEnquiryDraft,
  EligibleGroup,
  EligibleThread,
} from "@/domain/message/share.types";
import { EMPTY_SHARE_DRAFT, buildConcatenatedContent } from "@/domain/message/share.types";
import type { Enquiry } from "@/domain/enquiry/enquiry.types";
import { parseSellerDMId } from "@/domain/message/seller-dm.types";

// ── Smart Defaults ───────────────────────────────────────────────────

export interface SmartDefaults {
  targetGroupIds: string[];
  routeMode: ShareRouteMode;
  targetThreadId: string | null;
}

/**
 * Compute smart defaults for the share modal based on source context.
 *
 * Heuristics:
 *   1. Source = buyer-dm  → default to the buyer's external group (match buyerPersonaId)
 *   2. Source = seller-dm → default to the seller's external group (match sellerPersonaId)
 *   3. Source = group     → default to most-recently-active eligible group (not same group)
 *   4. Source = thread    → default to most-recently-active eligible group (not source's group)
 *   5. Source = enquiry-channel → default to group linked to the same enquiry
 *
 * Route mode:
 *   - If target group has threads → "existing-thread", pick most recent thread
 *   - If target group has threads tagged with the source enquiry → prefer that thread
 *   - If target group has no threads → "new-enquiry" (BDM only)
 */
export function computeSmartDefaults(
  sourceContext: ShareSourceContext,
  allGroups: GroupChannel[],
  eligibleGroups: EligibleGroup[],
  currentRole: string,
  sourceEnquiryId?: string | null,
): SmartDefaults {
  // Determine source group type for internal→external suppression
  const sourceGroupId = sourceContext.type === "group"
    ? sourceContext.id
    : sourceContext.type === "thread"
      ? sourceContext.groupId ?? undefined
      : undefined;
  const sourceGroup = sourceGroupId
    ? allGroups.find((g) => g.id === sourceGroupId)
    : undefined;
  const isInternalToExternal = sourceGroup?.type === "custom";

  // BDMs can create new enquiries, but NOT when sharing internal→external
  const canCreateEnquiry = currentRole === "BDM" && !isInternalToExternal;

  const defaults: SmartDefaults = {
    targetGroupIds: [],
    routeMode: canCreateEnquiry ? "new-enquiry" : "existing-thread",
    targetThreadId: null,
  };

  if (eligibleGroups.length === 0) return defaults;

  // ── Step 1: Pick default target group ────────────────────────────

  let targetGroup: GroupChannel | undefined;

  if (sourceContext.type === "buyer-dm") {
    // Extract buyerPersonaId from DM channel ID (format: "dm-{buyerPersonaId}")
    const buyerPersonaId = sourceContext.id.startsWith("dm-")
      ? sourceContext.id.slice(3)
      : sourceContext.id;
    const buyerGroup = allGroups.find(
      (g) =>
        g.type === "buyer" &&
        g.status === "active" &&
        (g.buyerPersonaId === buyerPersonaId || g.buyerId === buyerPersonaId) &&
        eligibleGroups.some((eg) => eg.id === g.id)
    );
    targetGroup =
      buyerGroup ??
      allGroups.find(
        (g) => g.type === "custom" && g.status === "active" && eligibleGroups.some((eg) => eg.id === g.id)
      );
  } else if (sourceContext.type === "seller-dm") {
    // Extract sellerId from DM channel ID (format: "seller-dm-{cmPersonaId}-{sellerId}")
    const parsed = parseSellerDMId(sourceContext.id);
    const sellerId = parsed?.sellerId ?? sourceContext.id;
    const sellerGroup = allGroups.find(
      (g) =>
        g.type === "seller" &&
        g.status === "active" &&
        (g.sellerId === sellerId || g.sellerPersonaId === sourceContext.id) &&
        eligibleGroups.some((eg) => eg.id === g.id)
    );
    targetGroup =
      sellerGroup ??
      allGroups.find(
        (g) => g.type === "custom" && g.status === "active" && eligibleGroups.some((eg) => eg.id === g.id)
      );
  } else if (sourceContext.type === "enquiry-channel" && sourceEnquiryId) {
    const linkedGroup = allGroups.find(
      (g) =>
        g.enquiryId === sourceEnquiryId &&
        g.status === "active" &&
        eligibleGroups.some((eg) => eg.id === g.id)
    );
    targetGroup =
      linkedGroup ??
      pickMostRecentGroup(allGroups, eligibleGroups);
  } else {
    targetGroup = pickMostRecentGroup(allGroups, eligibleGroups);
  }

  if (!targetGroup) {
    const firstEligible = eligibleGroups[0];
    if (firstEligible) {
      defaults.targetGroupIds = [firstEligible.id];
      targetGroup = allGroups.find((g) => g.id === firstEligible.id);
    }
  } else {
    defaults.targetGroupIds = [targetGroup.id];
  }

  if (!targetGroup) return defaults;

  // ── Step 2: Pick route mode + thread ─────────────────────────────

  const threads = targetGroup.threads ?? [];

  if (threads.length > 0) {
    defaults.routeMode = "existing-thread";

    // Prefer thread tagged with the source enquiry (if any)
    let bestThread = sourceEnquiryId
      ? threads.find((t) => t.enquiryId === sourceEnquiryId)
      : undefined;

    // Fallback: most recently active thread
    if (!bestThread) {
      bestThread = [...threads].sort((a, b) => {
        const aTime = a.lastReplyAt ? new Date(a.lastReplyAt).getTime() : 0;
        const bTime = b.lastReplyAt ? new Date(b.lastReplyAt).getTime() : 0;
        return bTime - aTime;
      })[0];
    }

    if (bestThread) {
      defaults.targetThreadId = bestThread.id;
    }
  } else {
    // Only default to new-enquiry if the role permits it
    defaults.routeMode = canCreateEnquiry ? "new-enquiry" : "existing-thread";
  }

  return defaults;
}

function pickMostRecentGroup(
  allGroups: GroupChannel[],
  eligibleGroups: EligibleGroup[]
): GroupChannel | undefined {
  const eligibleIds = new Set(eligibleGroups.map((g) => g.id));
  return [...allGroups]
    .filter((g) => eligibleIds.has(g.id) && g.status === "active")
    .sort((a, b) => {
      const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
      const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
      return bTime - aTime;
    })[0];
}

// ── Actions ──────────────────────────────────────────────────────────

type DraftAction =
  | { type: "OPEN"; payload: { sourceContext: ShareSourceContext; messageIds: string[]; messages: Message[] } }
  | { type: "CLOSE" }
  | { type: "TOGGLE_TARGET_GROUP"; payload: string }
  | { type: "SET_TARGET_GROUPS"; payload: string[] }
  | { type: "SET_ROUTE_MODE"; payload: ShareRouteMode }
  | { type: "SET_TARGET_THREAD"; payload: string | null }
  | { type: "SET_NEW_ENQUIRY_DRAFT"; payload: NewEnquiryDraft | null }
  | { type: "SET_CONCATENATED_CONTENT"; payload: string }
  | { type: "RESET_CONCATENATED_CONTENT" }
  | { type: "SET_DEFAULTS_SNAPSHOT"; payload: { groupIds: string[]; routeMode: ShareRouteMode; threadId: string | null } }
  ;

function draftReducer(state: ShareDraft, action: DraftAction): ShareDraft {
  switch (action.type) {
    case "OPEN": {
      const concatenated = buildConcatenatedContent(action.payload.messages);
      return {
        ...EMPTY_SHARE_DRAFT,
        isOpen: true,
        sourceContext: action.payload.sourceContext,
        selectedMessageIds: action.payload.messageIds,
        sourceMessages: action.payload.messages,
        concatenatedContent: concatenated,
      };
    }

    case "CLOSE":
      return { ...EMPTY_SHARE_DRAFT };

    case "TOGGLE_TARGET_GROUP": {
      const groupId = action.payload;
      const current = state.targetGroupIds;
      const isSelected = current.includes(groupId);
      const next = isSelected
        ? current.filter((id) => id !== groupId)
        : [...current, groupId];
      return {
        ...state,
        targetGroupIds: next,
        // Reset thread selection when group selection changes
        targetThreadId: null,
        // Reset route mode when going from single to multi or vice versa
        routeMode: next.length !== 1 ? "existing-thread" : state.routeMode,
        newEnquiryDraft: next.length !== 1 ? null : state.newEnquiryDraft,
      };
    }

    case "SET_TARGET_GROUPS":
      return {
        ...state,
        targetGroupIds: action.payload,
        targetThreadId: null,
        routeMode: action.payload.length !== 1 ? "existing-thread" : state.routeMode,
        newEnquiryDraft: action.payload.length !== 1 ? null : state.newEnquiryDraft,
      };

    case "SET_ROUTE_MODE":
      return {
        ...state,
        routeMode: action.payload,
        // Clear thread selection when switching to new-enquiry
        targetThreadId: action.payload === "new-enquiry" ? null : state.targetThreadId,
        newEnquiryDraft: action.payload === "new-enquiry"
          ? (state.newEnquiryDraft ?? { title: "" })
          : null,
      };

    case "SET_TARGET_THREAD":
      return { ...state, targetThreadId: action.payload };

    case "SET_NEW_ENQUIRY_DRAFT":
      return { ...state, newEnquiryDraft: action.payload };

    case "SET_CONCATENATED_CONTENT":
      return { ...state, concatenatedContent: action.payload };

    case "RESET_CONCATENATED_CONTENT": {
      const original = buildConcatenatedContent(state.sourceMessages);
      return { ...state, concatenatedContent: original };
    }

    case "SET_DEFAULTS_SNAPSHOT":
      return {
        ...state,
        _defaultGroupIds: action.payload.groupIds,
        _defaultRouteMode: action.payload.routeMode,
        _defaultThreadId: action.payload.threadId,
      };

    default:
      return state;
  }
}

// ── Hook ─────────────────────────────────────────────────────────────

export interface UseShareDraftReturn {
  draft: ShareDraft;
  open: (ctx: ShareSourceContext, messageIds: string[], messages: Message[]) => void;
  close: () => void;
  toggleTargetGroup: (groupId: string) => void;
  setTargetGroups: (groupIds: string[]) => void;
  setRouteMode: (mode: ShareRouteMode) => void;
  setTargetThread: (threadId: string | null) => void;
  setNewEnquiryDraft: (draft: NewEnquiryDraft | null) => void;
  setConcatenatedContent: (content: string) => void;
  resetConcatenatedContent: () => void;
  setDefaultsSnapshot: (groupIds: string[], routeMode: ShareRouteMode, threadId: string | null) => void;
}

export function useShareDraft(): UseShareDraftReturn {
  const [draft, dispatch] = useReducer(draftReducer, EMPTY_SHARE_DRAFT);

  const open = useCallback(
    (ctx: ShareSourceContext, messageIds: string[], messages: Message[]) =>
      dispatch({ type: "OPEN", payload: { sourceContext: ctx, messageIds, messages } }),
    []
  );

  const close = useCallback(() => dispatch({ type: "CLOSE" }), []);

  const toggleTargetGroup = useCallback(
    (groupId: string) => dispatch({ type: "TOGGLE_TARGET_GROUP", payload: groupId }),
    []
  );

  const setTargetGroups = useCallback(
    (groupIds: string[]) => dispatch({ type: "SET_TARGET_GROUPS", payload: groupIds }),
    []
  );

  const setRouteMode = useCallback(
    (mode: ShareRouteMode) => dispatch({ type: "SET_ROUTE_MODE", payload: mode }),
    []
  );

  const setTargetThread = useCallback(
    (threadId: string | null) => dispatch({ type: "SET_TARGET_THREAD", payload: threadId }),
    []
  );

  const setNewEnquiryDraft = useCallback(
    (d: NewEnquiryDraft | null) => dispatch({ type: "SET_NEW_ENQUIRY_DRAFT", payload: d }),
    []
  );

  const setConcatenatedContent = useCallback(
    (content: string) => dispatch({ type: "SET_CONCATENATED_CONTENT", payload: content }),
    []
  );

  const resetConcatenatedContent = useCallback(
    () => dispatch({ type: "RESET_CONCATENATED_CONTENT" }),
    []
  );

  const setDefaultsSnapshot = useCallback(
    (groupIds: string[], routeMode: ShareRouteMode, threadId: string | null) =>
      dispatch({ type: "SET_DEFAULTS_SNAPSHOT", payload: { groupIds, routeMode, threadId } }),
    []
  );

  return {
    draft,
    open,
    close,
    toggleTargetGroup,
    setTargetGroups,
    setRouteMode,
    setTargetThread,
    setNewEnquiryDraft,
    setConcatenatedContent,
    resetConcatenatedContent,
    setDefaultsSnapshot,
  };
}

// ── Helpers: eligible groups & threads ───────────────────────────────

/**
 * @deprecated Prefer `getAvailableTargets()` from `@/domain/sharing` which
 * applies the full share policy matrix (role × source × target × groupKind).
 *
 * Filter groups by role-based visibility rules:
 *   BDM → buyer-facing external groups + internal groups where member
 *   CM  → seller-facing external groups + internal groups where member
 *   CX  → both buyer and seller external groups + internal groups where member
 */
export function getEligibleGroups(
  allGroups: GroupChannel[],
  currentRole: string,
  currentPersonaId: string,
  excludeGroupId?: string | null
): EligibleGroup[] {
  return allGroups
    .filter((g) => {
      if (excludeGroupId && g.id === excludeGroupId) return false;
      if (g.status !== "active") return false;

      const isMember = g.memberPersonaIds?.includes(currentPersonaId);

      if (g.type === "custom") {
        return isMember;
      }

      if (g.type === "buyer") {
        return currentRole === "BDM" || currentRole === "CX";
      }

      if (g.type === "seller") {
        return currentRole === "CM" || currentRole === "CX";
      }

      return false;
    })
    .map((g) => ({
      id: g.id,
      name: g.name,
      type: g.type,
      category: g.type === "custom" ? ("internal" as const) : ("external" as const),
      threadCount: (g.threads ?? []).length,
      lastActivity: g.lastActivity,
    }));
}

/**
 * Get threads within a selected group.
 */
export function getEligibleThreads(
  group: GroupChannel | undefined
): EligibleThread[] {
  if (!group?.threads) return [];
  return group.threads.map((t) => ({
    id: t.id,
    title: t.title,
    enquiryId: t.enquiryId,
    replyCount: t.replyCount,
    lastReplyAt: t.lastReplyAt,
    participants: t.participants,
  }));
}

// ── Cross-type filtering ─────────────────────────────────────────────

/**
 * Filter eligible groups to only show cross-type targets.
 * If source is internal (custom), show only external (buyer/seller) targets.
 * If source is external (buyer/seller), show only internal (custom) targets.
 * For non-group sources (DMs, enquiry channels), show all groups.
 */
export function getCrossTypeGroups(
  eligibleGroups: EligibleGroup[],
  sourceGroupType: "buyer" | "seller" | "custom" | null
): EligibleGroup[] {
  if (!sourceGroupType) return eligibleGroups; // Non-group source, no filtering

  if (sourceGroupType === "custom") {
    // Internal source → only external targets
    return eligibleGroups.filter((g) => g.type !== "custom");
  }
  // External source (buyer or seller) → only internal targets
  return eligibleGroups.filter((g) => g.type === "custom");
}

// ── Thread preselection for cross-type shares ────────────────────────

/**
 * Result of the smart thread preselection algorithm.
 */
export interface ThreadPreselection {
  routeMode: ShareRouteMode;
  threadId: string | null;
  /** Why this was chosen — useful for telemetry / debugging */
  reason:
    | "source-enquiry-match"
    | "source-group-enquiry-match"
    | "counterparty-enquiry-match"
    | "most-recent-thread"
    | "new-enquiry-fallback"
    | "no-options";
}

/**
 * Smart thread preselection for cross-type shares (BDM & CM).
 *
 * Called when a BDM or CM shares between external↔internal groups.
 * The algorithm ensures the modal always opens with a sensible thread
 * (or "New Enquiry") pre-selected, so "share to main chat" never appears
 * as the default for cross-type shares.
 *
 * Priority waterfall:
 *   P1 — Exact enquiryId match from the source thread/context
 *   P2 — Source group's own enquiryId field
 *   P3 — Counterparty-linked enquiry match:
 *         • For buyer groups: buyerPersonaId → Enquiry.buyerPersonaId → thread.enquiryId
 *         • For seller groups: skipped (Enquiry lacks sellerPersonaId)
 *         • Looks at BOTH source and target group counterparty fields
 *   P4 — Most recently active thread (by lastReplyAt)
 *   P5 — Fallback to "new-enquiry" if canCreateEnquiry, else no-options
 */
export function computeThreadPreselection(
  sourceContext: ShareSourceContext,
  sourceGroup: GroupChannel | undefined,
  targetGroup: GroupChannel | undefined,
  eligibleThreads: EligibleThread[],
  enquiries: Enquiry[],
  canCreateEnquiry: boolean,
): ThreadPreselection {
  // ── No threads available ───────────────────────────────────────────
  if (eligibleThreads.length === 0) {
    if (canCreateEnquiry) {
      return { routeMode: "new-enquiry", threadId: null, reason: "new-enquiry-fallback" };
    }
    // No threads, can't create enquiry → caller should allow main-chat fallback
    return { routeMode: "existing-thread", threadId: null, reason: "no-options" };
  }

  // ── P1: Exact enquiryId from source thread/context ─────────────────
  if (sourceContext.enquiryId) {
    const match = eligibleThreads.find(t => t.enquiryId === sourceContext.enquiryId);
    if (match) {
      return { routeMode: "existing-thread", threadId: match.id, reason: "source-enquiry-match" };
    }
  }

  // ── P2: Source group's own enquiryId ───────────────────────────────
  if (sourceGroup?.enquiryId) {
    const match = eligibleThreads.find(t => t.enquiryId === sourceGroup.enquiryId);
    if (match) {
      return { routeMode: "existing-thread", threadId: match.id, reason: "source-group-enquiry-match" };
    }
  }

  // ── P3: Counterparty-linked enquiry match ──────────────────────────
  // Collect buyerPersonaIds from both source and target groups
  const buyerPersonaIds = new Set<string>();
  if (sourceGroup?.buyerPersonaId) buyerPersonaIds.add(sourceGroup.buyerPersonaId);
  if (targetGroup?.buyerPersonaId) buyerPersonaIds.add(targetGroup.buyerPersonaId);

  if (buyerPersonaIds.size > 0) {
    // Find all enquiry IDs linked to these buyers
    const linkedEnquiryIds = new Set<string>();
    for (const enq of enquiries) {
      if (enq.buyerPersonaId && buyerPersonaIds.has(enq.buyerPersonaId)) {
        linkedEnquiryIds.add(enq.id);
      }
    }

    if (linkedEnquiryIds.size > 0) {
      const matches = eligibleThreads
        .filter(t => t.enquiryId && linkedEnquiryIds.has(t.enquiryId))
        .sort((a, b) => toTime(b.lastReplyAt) - toTime(a.lastReplyAt));
      if (matches.length > 0) {
        return { routeMode: "existing-thread", threadId: matches[0].id, reason: "counterparty-enquiry-match" };
      }
    }
  }

  // (Seller counterparty matching is skipped — Enquiry type lacks sellerPersonaId.
  //  Falls through to P4: most-recent thread.)

  // ── P4: Most recently active thread ────────────────────────────────
  const sorted = [...eligibleThreads].sort(
    (a, b) => toTime(b.lastReplyAt) - toTime(a.lastReplyAt)
  );
  return { routeMode: "existing-thread", threadId: sorted[0].id, reason: "most-recent-thread" };
}

/** Convert optional Date to epoch ms (0 if undefined). */
function toTime(d: Date | undefined): number {
  return d ? new Date(d).getTime() : 0;
}
