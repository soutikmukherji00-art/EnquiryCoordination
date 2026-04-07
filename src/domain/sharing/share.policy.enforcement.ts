/**
 * Domain: Share Policy Enforcement
 *
 * Pure functions that resolve a SharePolicy for a given ShareContext
 * and answer common UI questions ("can this role share from here?",
 * "what targets are available?", "is editing allowed?").
 *
 * These functions are the ONLY place the rest of the codebase should
 * ask "is this share allowed / how should it look?".
 */

import type {
  SharePolicy,
  SharePolicyRule,
  ShareContext,
  ShareSourceKind,
  ShareTargetKind,
  GroupKind,
  ShareTargetDescriptor,
  ShareRouteMode,
} from "./share.policy.types";
import type { UserRole } from "../message/message.types";
import type { GroupChannel } from "../message/group.types";
import { DEFAULT_SHARE_POLICY, getSortedRules } from "./share.policy.registry";

// ── Rule matching ────────────────────────────────────────────────────

function matchesDimension<T extends string>(
  ruleValue: T | "*",
  contextValue: T | undefined,
): boolean {
  if (ruleValue === "*") return true;
  return ruleValue === contextValue;
}

function ruleMatchesContext(
  rule: SharePolicyRule,
  ctx: ShareContext,
): boolean {
  if (!matchesDimension(rule.role, ctx.role)) return false;
  if (!matchesDimension(rule.sourceKind, ctx.sourceKind)) return false;
  if (!matchesDimension(rule.targetKind, ctx.targetKind)) return false;

  // Optional group-kind qualifiers — only checked if specified on the rule
  if (
    rule.sourceGroupKind !== undefined &&
    !matchesDimension(rule.sourceGroupKind, ctx.sourceGroupKind)
  ) {
    return false;
  }
  if (
    rule.targetGroupKind !== undefined &&
    !matchesDimension(rule.targetGroupKind, ctx.targetGroupKind)
  ) {
    return false;
  }

  return true;
}

// ── Core resolution ──────────────────────────────────────────────────

/**
 * Resolve the applicable SharePolicy for a given context.
 *
 * Walks the sorted rule table (highest priority first).  The first
 * matching rule's partial policy is merged onto DEFAULT_SHARE_POLICY.
 * If no rule matches, DEFAULT_SHARE_POLICY is returned as-is.
 */
export function resolveSharePolicy(ctx: ShareContext): SharePolicy {
  const rules = getSortedRules();

  for (const rule of rules) {
    if (ruleMatchesContext(rule, ctx)) {
      return {
        ...DEFAULT_SHARE_POLICY,
        ...rule.policy,
        // Deep-merge array fields (availableRouteModes)
        availableRouteModes:
          rule.policy.availableRouteModes ??
          DEFAULT_SHARE_POLICY.availableRouteModes,
      };
    }
  }

  return { ...DEFAULT_SHARE_POLICY };
}

// ── Convenience queries ──────────────────────────────────────────────

/**
 * Can the given role share messages at all (from any source)?
 * Quick check used to show/hide the ShareButton globally.
 */
export function canRoleShare(role: UserRole): boolean {
  // Resolve with wildcard source/target — if the catch-all for
  // this role is `allowed: false`, sharing is globally disabled.
  const policy = resolveSharePolicy({
    role,
    sourceKind: "group-main",
    targetKind: "group-main",
  });
  return policy.allowed;
}

/**
 * Can the given role share from a specific source kind?
 */
export function canShareFromSource(
  role: UserRole,
  sourceKind: ShareSourceKind,
  sourceGroupKind?: GroupKind,
): boolean {
  // Test against a generic target — if no rule blocks it, it's allowed
  const policy = resolveSharePolicy({
    role,
    sourceKind,
    sourceGroupKind,
    targetKind: "group-main",
  });
  return policy.allowed;
}

/**
 * Is this specific source → target share allowed for the role?
 */
export function canShareToTarget(ctx: ShareContext): boolean {
  const policy = resolveSharePolicy(ctx);
  return policy.allowed;
}

/**
 * Can the user edit message content before sharing in this context?
 */
export function canEditBeforeShare(ctx: ShareContext): boolean {
  const policy = resolveSharePolicy(ctx);
  return policy.allowed && policy.canEditBeforeShare;
}

/**
 * What route modes are available for this share context?
 * (e.g., BDM gets "existing-thread" + "new-enquiry", CM only "existing-thread")
 */
export function getAvailableRouteModes(ctx: ShareContext): ShareRouteMode[] {
  const policy = resolveSharePolicy(ctx);
  return policy.allowed ? policy.availableRouteModes : [];
}

// ── Target enumeration ───────────────────────────────────────────────

/**
 * Given a role + source context + available groups, returns all
 * eligible share targets with their pre-resolved policies.
 *
 * This replaces the scattered `getEligibleGroups` / `getAvailableEnquiries`
 * logic and centralises it behind the policy system.
 *
 * NOTE: This is the integration point — callers provide the universe
 * of possible targets (groups, DMs, enquiries) and this function
 * filters them through the policy rules.
 */
export function getAvailableTargets(options: {
  role: UserRole;
  sourceKind: ShareSourceKind;
  sourceGroupKind?: GroupKind;
  sourceId?: string;
  /** All group channels the user could potentially target. */
  allGroups: GroupChannel[];
  /** Exclude this group ID (e.g., the source group). */
  excludeGroupId?: string;
  /** Additional custom target descriptors (DMs, enquiries) injected by the caller. */
  additionalTargets?: Array<{
    kind: ShareTargetKind;
    id: string;
    label: string;
    groupKind?: GroupKind;
  }>;
}): ShareTargetDescriptor[] {
  const {
    role,
    sourceKind,
    sourceGroupKind,
    sourceId,
    allGroups,
    excludeGroupId,
    additionalTargets = [],
  } = options;

  const results: ShareTargetDescriptor[] = [];

  // ── Groups as targets ──────────────────────────────────────────

  for (const group of allGroups) {
    if (group.status !== "active") continue;
    if (excludeGroupId && group.id === excludeGroupId) continue;

    const targetGroupKind: GroupKind = group.type;

    const ctx: ShareContext = {
      role,
      sourceKind,
      sourceGroupKind,
      sourceId,
      targetKind: "group-main",
      targetGroupKind,
      targetId: group.id,
    };

    const policy = resolveSharePolicy(ctx);

    if (policy.allowed) {
      results.push({
        kind: "group-main",
        id: group.id,
        label: group.name,
        groupKind: targetGroupKind,
        policy,
      });
    }
  }

  // ── Additional targets (DMs, enquiries, etc.) ──────────────────

  for (const target of additionalTargets) {
    const ctx: ShareContext = {
      role,
      sourceKind,
      sourceGroupKind,
      sourceId,
      targetKind: target.kind,
      targetGroupKind: target.groupKind,
      targetId: target.id,
    };

    const policy = resolveSharePolicy(ctx);

    if (policy.allowed) {
      results.push({
        kind: target.kind,
        id: target.id,
        label: target.label,
        groupKind: target.groupKind,
        policy,
      });
    }
  }

  return results;
}

// ── Categorisation helpers (for UI sections) ─────────────────────────

/**
 * Partition share targets into UI-friendly categories.
 * Returns a map of category label → targets.
 */
export function categoriseTargets(
  targets: ShareTargetDescriptor[],
): Record<string, ShareTargetDescriptor[]> {
  const categories: Record<string, ShareTargetDescriptor[]> = {};

  for (const target of targets) {
    let category: string;

    switch (target.kind) {
      case "group-main":
      case "thread":
      case "new-thread":
        category =
          target.groupKind === "buyer"
            ? "Buyers"
            : target.groupKind === "seller"
              ? "Seller"
              : "Birla Pivot";
        break;
      case "buyer-dm":
        category = "Buyer DMs";
        break;
      case "seller-dm":
        category = "Seller DMs";
        break;
      case "enquiry-internal":
      case "enquiry-buyer":
      case "enquiry-seller":
        category = "Enquiry Channels";
        break;
      default:
        category = "Other";
    }

    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(target);
  }

  return categories;
}
