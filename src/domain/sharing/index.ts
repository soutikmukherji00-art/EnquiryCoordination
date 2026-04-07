/**
 * Domain: Sharing Module
 *
 * Central export for the declarative share policy system.
 *
 * Architecture:
 *   share.policy.types.ts       – Type definitions (ShareContext, SharePolicy, etc.)
 *   share.policy.registry.ts    – Declarative rule table (SHARE_POLICY_RULES)
 *   share.policy.enforcement.ts – Resolution & query functions
 *   share.transforms.ts         – Message transformation pipeline
 */

// Types
export type {
  ShareSourceKind,
  ShareTargetKind,
  GroupKind,
  ShareContext,
  MaskingStrategy,
  AttributionStrategy,
  ShareRenderMode,
  SharePolicy,
  ShareRouteMode,
  ShareTargetDescriptor,
  SharePolicyRule,
} from "./share.policy.types";

// Registry
export {
  DEFAULT_SHARE_POLICY,
  SHARE_POLICY_RULES,
  getSortedRules,
  invalidateRuleCache,
  addSharePolicyRules,
  replaceSharePolicyRules,
} from "./share.policy.registry";

// Enforcement / Resolution
export {
  resolveSharePolicy,
  canRoleShare,
  canShareFromSource,
  canShareToTarget,
  canEditBeforeShare,
  getAvailableRouteModes,
  getAvailableTargets,
  categoriseTargets,
} from "./share.policy.enforcement";

// Transforms
export {
  applyPolicyMasking,
  resolveAttribution,
  transformForShare,
  transformForMultiTarget,
} from "./share.transforms";
export type { ShareTransformConfig } from "./share.transforms";
