/**
 * Hook: useSharePolicy
 *
 * React integration layer for the declarative share policy system.
 * Provides memoised policy resolution, target enumeration, and
 * convenience booleans that UI components can bind to directly.
 *
 * Usage:
 *   const policy = useSharePolicy({
 *     role: currentRole,
 *     sourceKind: "group-main",
 *     sourceGroupKind: "custom",
 *     allGroups,
 *   });
 *
 *   if (!policy.canShare) return null;          // hide share button
 *   const targets = policy.availableTargets;    // render target list
 *   const categorised = policy.categorisedTargets; // render grouped sections
 */

import { useMemo } from "react";
import type { UserRole } from "@/domain/message/message.types";
import type { GroupChannel } from "@/domain/message/group.types";
import type {
  ShareSourceKind,
  ShareTargetKind,
  GroupKind,
  ShareContext,
  SharePolicy,
  ShareTargetDescriptor,
  ShareRouteMode,
} from "@/domain/sharing/share.policy.types";
import {
  resolveSharePolicy,
  canRoleShare,
  getAvailableTargets,
  categoriseTargets,
  getAvailableRouteModes,
} from "@/domain/sharing/share.policy.enforcement";

// ── Options ──────────────────────────────────────────────────────────

export interface UseSharePolicyOptions {
  /** Current user role. */
  role: UserRole;

  /** Where the user is sharing FROM. */
  sourceKind: ShareSourceKind;
  sourceGroupKind?: GroupKind;
  sourceId?: string;

  /** All group channels available as potential targets. */
  allGroups: GroupChannel[];

  /** Exclude this group from targets (e.g., the current/source group). */
  excludeGroupId?: string;

  /** Extra non-group targets (DMs, enquiry channels) provided by the caller. */
  additionalTargets?: Array<{
    kind: ShareTargetKind;
    id: string;
    label: string;
    groupKind?: GroupKind;
  }>;
}

// ── Return type ──────────────────────────────────────────────────────

export interface UseSharePolicyReturn {
  /** Quick global check — can this role share at all? */
  canShare: boolean;

  /** All eligible targets with pre-resolved policies. */
  availableTargets: ShareTargetDescriptor[];

  /** Targets grouped into UI categories (e.g., "Internal", "External (Buyer)"). */
  categorisedTargets: Record<string, ShareTargetDescriptor[]>;

  /** Available route modes for the current context (existing-thread, new-enquiry). */
  routeModes: ShareRouteMode[];

  /**
   * Resolve a full SharePolicy for a specific target.
   * Useful when the user selects a target and you need the exact policy
   * (masking, attribution, renderMode, etc.) for that target.
   */
  resolveForTarget: (targetKind: ShareTargetKind, targetGroupKind?: GroupKind, targetId?: string) => SharePolicy;
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useSharePolicy(options: UseSharePolicyOptions): UseSharePolicyReturn {
  const {
    role,
    sourceKind,
    sourceGroupKind,
    sourceId,
    allGroups,
    excludeGroupId,
    additionalTargets,
  } = options;

  // 1. Global share permission
  const canShare = useMemo(() => canRoleShare(role), [role]);

  // 2. Available targets (memoised on the full option set)
  const availableTargets = useMemo(() => {
    if (!canShare) return [];
    return getAvailableTargets({
      role,
      sourceKind,
      sourceGroupKind,
      sourceId,
      allGroups,
      excludeGroupId,
      additionalTargets,
    });
  }, [canShare, role, sourceKind, sourceGroupKind, sourceId, allGroups, excludeGroupId, additionalTargets]);

  // 3. Categorised targets
  const categorisedTargets = useMemo(
    () => categoriseTargets(availableTargets),
    [availableTargets],
  );

  // 4. Route modes for current context (uses generic target since actual target isn't known yet)
  const routeModes = useMemo(() => {
    if (!canShare) return [];
    return getAvailableRouteModes({
      role,
      sourceKind,
      sourceGroupKind,
      sourceId,
      targetKind: "new-thread", // Check with new-thread to see if new-enquiry is available
    });
  }, [canShare, role, sourceKind, sourceGroupKind, sourceId]);

  // 5. Per-target resolution helper
  const resolveForTarget = useMemo(() => {
    return (targetKind: ShareTargetKind, targetGroupKind?: GroupKind, targetId?: string): SharePolicy => {
      const ctx: ShareContext = {
        role,
        sourceKind,
        sourceGroupKind,
        sourceId,
        targetKind,
        targetGroupKind,
        targetId,
      };
      return resolveSharePolicy(ctx);
    };
  }, [role, sourceKind, sourceGroupKind, sourceId]);

  return {
    canShare,
    availableTargets,
    categorisedTargets,
    routeModes,
    resolveForTarget,
  };
}
