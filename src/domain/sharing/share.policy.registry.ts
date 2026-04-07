/**
 * Domain: Share Policy Registry
 *
 * Declarative rule table for share policies.  Rules are evaluated in
 * priority order (highest first).  The first matching rule wins, and
 * its partial policy is merged onto DEFAULT_SHARE_POLICY.
 *
 * To add new rules:
 *   1. Append a SharePolicyRule to SHARE_POLICY_RULES.
 *   2. Assign a priority (higher = checked earlier).
 *   3. Provide only the policy fields that differ from the default.
 *
 * Wildcard `"*"` matches any value for that dimension.
 */

import type {
  SharePolicy,
  SharePolicyRule,
  ShareContext,
  ShareSourceKind,
  ShareTargetKind,
  GroupKind,
} from "./share.policy.types";
import type { UserRole } from "../message/message.types";

// ── Default Policy ───────────────────────────────────────────────────

/**
 * Baseline share policy.  Every resolved policy starts here, then
 * gets overridden by the first matching rule's `policy` partial.
 */
export const DEFAULT_SHARE_POLICY: SharePolicy = {
  allowed: true,

  canEditBeforeShare: true,
  showPreview: true,
  availableRouteModes: ["existing-thread"],

  masking: "none",
  attribution: "original-sender",
  resultMessageType: "shared",

  renderMode: "shared-badge",
  showSourceLabel: true,
  showOriginalTimestamp: true,

  hideSourceAfterShare: false,
  navigateToTarget: true,
};

// ── Rule Table ───────────────────────────────────────────────────────

/**
 * Share policy rules — evaluated in priority order (descending).
 *
 * Cross-type constraint: groups can only share cross-type
 *   internal (custom) → external (buyer/seller) and vice versa.
 * Same-type sharing (custom→custom, buyer→buyer, etc.) is blocked.
 *
 * BDM:    External→Internal: existing threads + new enquiry
 *         Internal→External: existing threads + just share
 * CM:     Both directions: existing threads + just share
 * CX:     Both directions: existing threads + just share
 * Buyer:  Both directions: existing threads + just share
 * Seller: Both directions: existing threads + just share
 */
export const SHARE_POLICY_RULES: SharePolicyRule[] = [

  // ═══════════════════════════════════════════════════════════════════
  //  BLOCK: Same-type group sharing (highest priority)
  // ═══════════════════════════════════════════════════════════════════

  // Internal → Internal: blocked
  {
    role: "*",
    sourceKind: "group-main",
    targetKind: "group-main",
    sourceGroupKind: "custom",
    targetGroupKind: "custom",
    priority: 900,
    policy: {
      allowed: false,
      denialReason: "Cannot share between groups of the same type",
    },
  },
  {
    role: "*",
    sourceKind: "thread",
    targetKind: "group-main",
    sourceGroupKind: "custom",
    targetGroupKind: "custom",
    priority: 900,
    policy: {
      allowed: false,
      denialReason: "Cannot share between groups of the same type",
    },
  },

  // Buyer → Buyer: blocked
  {
    role: "*",
    sourceKind: "group-main",
    targetKind: "group-main",
    sourceGroupKind: "buyer",
    targetGroupKind: "buyer",
    priority: 900,
    policy: {
      allowed: false,
      denialReason: "Cannot share between groups of the same type",
    },
  },
  {
    role: "*",
    sourceKind: "thread",
    targetKind: "group-main",
    sourceGroupKind: "buyer",
    targetGroupKind: "buyer",
    priority: 900,
    policy: {
      allowed: false,
      denialReason: "Cannot share between groups of the same type",
    },
  },

  // Seller → Seller: blocked
  {
    role: "*",
    sourceKind: "group-main",
    targetKind: "group-main",
    sourceGroupKind: "seller",
    targetGroupKind: "seller",
    priority: 900,
    policy: {
      allowed: false,
      denialReason: "Cannot share between groups of the same type",
    },
  },
  {
    role: "*",
    sourceKind: "thread",
    targetKind: "group-main",
    sourceGroupKind: "seller",
    targetGroupKind: "seller",
    priority: 900,
    policy: {
      allowed: false,
      denialReason: "Cannot share between groups of the same type",
    },
  },

  // Buyer ↔ Seller cross-external: blocked (both are external types)
  {
    role: "*",
    sourceKind: "group-main",
    targetKind: "group-main",
    sourceGroupKind: "buyer",
    targetGroupKind: "seller",
    priority: 900,
    policy: {
      allowed: false,
      denialReason: "Cannot share between external groups",
    },
  },
  {
    role: "*",
    sourceKind: "group-main",
    targetKind: "group-main",
    sourceGroupKind: "seller",
    targetGroupKind: "buyer",
    priority: 900,
    policy: {
      allowed: false,
      denialReason: "Cannot share between external groups",
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  //  BDM: External → Internal — can create new enquiry
  // ═══════════════════════════════════════════════════════════════════

  {
    role: "BDM",
    sourceKind: "group-main",
    targetKind: "new-thread",
    sourceGroupKind: "buyer",
    priority: 800,
    policy: {
      allowed: true,
      availableRouteModes: ["existing-thread", "new-enquiry"],
    },
  },
  {
    role: "BDM",
    sourceKind: "thread",
    targetKind: "new-thread",
    sourceGroupKind: "buyer",
    priority: 800,
    policy: {
      allowed: true,
      availableRouteModes: ["existing-thread", "new-enquiry"],
    },
  },
  // BDM: seller-external → internal also gets new-enquiry
  {
    role: "BDM",
    sourceKind: "group-main",
    targetKind: "new-thread",
    sourceGroupKind: "seller",
    priority: 800,
    policy: {
      allowed: true,
      availableRouteModes: ["existing-thread", "new-enquiry"],
    },
  },
  {
    role: "BDM",
    sourceKind: "*",
    targetKind: "new-thread",
    priority: 700,
    policy: {
      allowed: true,
      availableRouteModes: ["existing-thread", "new-enquiry"],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  //  Non-BDM: cannot create new enquiries via share
  // ═══════════════════════════════════════════════════════════════════

  {
    role: "CM",
    sourceKind: "*",
    targetKind: "new-thread",
    priority: 700,
    policy: {
      allowed: false,
      denialReason: "Only BDMs can create new enquiries",
    },
  },
  {
    role: "CX",
    sourceKind: "*",
    targetKind: "new-thread",
    priority: 700,
    policy: {
      allowed: false,
      denialReason: "Only BDMs can create new enquiries",
    },
  },
  {
    role: "Buyer",
    sourceKind: "*",
    targetKind: "new-thread",
    priority: 700,
    policy: {
      allowed: false,
      denialReason: "Only BDMs can create new enquiries",
    },
  },
  {
    role: "Seller",
    sourceKind: "*",
    targetKind: "new-thread",
    priority: 700,
    policy: {
      allowed: false,
      denialReason: "Only BDMs can create new enquiries",
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  //  Masking: Internal → Seller group — rebrand internal senders
  // ═══════════════════════════════════════════════════════════════════

  {
    role: "*",
    sourceKind: "group-main",
    targetKind: "group-main",
    sourceGroupKind: "custom",
    targetGroupKind: "seller",
    priority: 400,
    policy: {
      masking: "company-rebrand",
      attribution: "company",
    },
  },
  {
    role: "*",
    sourceKind: "thread",
    targetKind: "group-main",
    sourceGroupKind: "custom",
    targetGroupKind: "seller",
    priority: 400,
    policy: {
      masking: "company-rebrand",
      attribution: "company",
    },
  },

  // Masking: Internal → Seller group (thread target) — rebrand internal senders
  // Mirrors the group-main rules above, for when the target is a thread within a seller group
  {
    role: "*",
    sourceKind: "group-main",
    targetKind: "thread",
    sourceGroupKind: "custom",
    targetGroupKind: "seller",
    priority: 400,
    policy: {
      masking: "company-rebrand",
      attribution: "company",
    },
  },
  {
    role: "*",
    sourceKind: "thread",
    targetKind: "thread",
    sourceGroupKind: "custom",
    targetGroupKind: "seller",
    priority: 400,
    policy: {
      masking: "company-rebrand",
      attribution: "company",
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  //  Masking: Seller DM → Enquiry Internal — anonymise seller
  // ═══════════════════════════════════════════════════════════════════

  {
    role: "*",
    sourceKind: "seller-dm",
    targetKind: "enquiry-internal",
    priority: 500,
    policy: {
      masking: "seller-anonymous",
      attribution: "sharer",
      hideSourceAfterShare: false,
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  //  Masking: Internal → External enquiry channels — inline as user
  // ═══════════════════════════════════════════════════════════════════

  {
    role: "*",
    sourceKind: "enquiry-internal",
    targetKind: "enquiry-buyer",
    priority: 500,
    policy: {
      masking: "current-user",
      attribution: "sharer",
      resultMessageType: "user",
      renderMode: "inline",
      showSourceLabel: false,
      showOriginalTimestamp: false,
    },
  },
  {
    role: "*",
    sourceKind: "enquiry-internal",
    targetKind: "enquiry-seller",
    priority: 500,
    policy: {
      masking: "current-user",
      attribution: "sharer",
      resultMessageType: "user",
      renderMode: "inline",
      showSourceLabel: false,
      showOriginalTimestamp: false,
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  //  Buyer DM → Enquiry Internal — preserve sender
  // ═══════════════════════════════════════════════════════════════════

  {
    role: "*",
    sourceKind: "buyer-dm",
    targetKind: "enquiry-internal",
    priority: 500,
    policy: {
      masking: "none",
      attribution: "original-sender",
      hideSourceAfterShare: false,
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  //  Default cross-group sharing — standard shared badge
  // ═══════════════════════════════════════════════════════════════════

  {
    role: "*",
    sourceKind: "group-main",
    targetKind: "group-main",
    priority: 200,
    policy: {
      renderMode: "shared-badge",
    },
  },
  {
    role: "*",
    sourceKind: "thread",
    targetKind: "group-main",
    priority: 200,
    policy: {
      renderMode: "shared-badge",
    },
  },

  // Default cross-group sharing to threads — standard shared badge
  {
    role: "*",
    sourceKind: "group-main",
    targetKind: "thread",
    priority: 200,
    policy: {
      renderMode: "shared-badge",
    },
  },
  {
    role: "*",
    sourceKind: "thread",
    targetKind: "thread",
    priority: 200,
    policy: {
      renderMode: "shared-badge",
    },
  },
];

// ── Sorted cache (pre-sorted descending by priority) ─────────────

let _sortedRules: SharePolicyRule[] | null = null;

export function getSortedRules(): SharePolicyRule[] {
  if (!_sortedRules) {
    _sortedRules = [...SHARE_POLICY_RULES].sort(
      (a, b) => b.priority - a.priority,
    );
  }
  return _sortedRules;
}

/**
 * Invalidate the sorted cache.  Call this if you programmatically
 * mutate SHARE_POLICY_RULES at runtime (e.g., in tests).
 */
export function invalidateRuleCache(): void {
  _sortedRules = null;
}

// ── Helpers for external consumers ───────────────────────────────────

/**
 * Add rules at runtime (e.g., from feature flags or tests).
 * Automatically invalidates the sorted cache.
 */
export function addSharePolicyRules(...rules: SharePolicyRule[]): void {
  SHARE_POLICY_RULES.push(...rules);
  invalidateRuleCache();
}

/**
 * Replace ALL rules (useful for tests or complete reconfiguration).
 */
export function replaceSharePolicyRules(rules: SharePolicyRule[]): void {
  SHARE_POLICY_RULES.length = 0;
  SHARE_POLICY_RULES.push(...rules);
  invalidateRuleCache();
}