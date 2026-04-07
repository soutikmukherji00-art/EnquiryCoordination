/**
 * Tests: Share Policy System
 *
 * Validates the rule resolution, enforcement functions, and
 * transformation pipeline.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  resolveSharePolicy,
  canRoleShare,
  canShareFromSource,
  canShareToTarget,
  canEditBeforeShare,
  getAvailableRouteModes,
  getAvailableTargets,
  categoriseTargets,
} from "../share.policy.enforcement";
import {
  DEFAULT_SHARE_POLICY,
  replaceSharePolicyRules,
  SHARE_POLICY_RULES,
  invalidateRuleCache,
} from "../share.policy.registry";
import { transformForShare, applyPolicyMasking, resolveAttribution } from "../share.transforms";
import type { ShareContext, SharePolicy, SharePolicyRule } from "../share.policy.types";
import type { Message } from "../../message/message.types";
import type { GroupChannel } from "../../message/group.types";

// ── Helpers ──────────────────────────────────────────────────────────

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: `msg-${Math.random().toString(36).substr(2, 6)}`,
    type: "user",
    sender: "Test User",
    senderPersonaId: "p_test",
    senderRole: "CM",
    content: "Hello world",
    timestamp: new Date("2026-01-01"),
    ...overrides,
  };
}

function makeGroup(overrides: Partial<GroupChannel> = {}): GroupChannel {
  return {
    id: `grp_${Math.random().toString(36).substr(2, 6)}`,
    name: "Test Group",
    type: "custom",
    status: "active",
    memberIds: [],
    memberPersonaIds: ["p_test"],
    messages: [],
    createdBy: "p_test",
    createdAt: new Date(),
    ...overrides,
  };
}

// Store original rules to restore after tests
let originalRules: SharePolicyRule[];

beforeEach(() => {
  // Save and restore rules to avoid test pollution
  originalRules = [...SHARE_POLICY_RULES];
  return () => {
    replaceSharePolicyRules(originalRules);
  };
});

// ── Resolution ───────────────────────────────────────────────────────

describe("resolveSharePolicy", () => {
  it("returns DEFAULT_SHARE_POLICY when no rules match", () => {
    replaceSharePolicyRules([]);
    const ctx: ShareContext = {
      role: "BDM",
      sourceKind: "group-main",
      targetKind: "group-main",
    };
    const policy = resolveSharePolicy(ctx);
    expect(policy).toEqual({ ...DEFAULT_SHARE_POLICY });
  });

  it("merges matching rule onto defaults", () => {
    replaceSharePolicyRules([
      {
        role: "BDM",
        sourceKind: "group-main",
        targetKind: "group-main",
        priority: 100,
        policy: { showPreview: false },
      },
    ]);
    const ctx: ShareContext = {
      role: "BDM",
      sourceKind: "group-main",
      targetKind: "group-main",
    };
    const policy = resolveSharePolicy(ctx);
    expect(policy.showPreview).toBe(false);
    // Other defaults still apply
    expect(policy.allowed).toBe(true);
    expect(policy.canEditBeforeShare).toBe(true);
  });

  it("higher priority rule wins over lower priority", () => {
    replaceSharePolicyRules([
      {
        role: "BDM",
        sourceKind: "group-main",
        targetKind: "group-main",
        priority: 50,
        policy: { masking: "none" },
      },
      {
        role: "BDM",
        sourceKind: "group-main",
        targetKind: "group-main",
        priority: 200,
        policy: { masking: "company-rebrand" },
      },
    ]);
    const ctx: ShareContext = {
      role: "BDM",
      sourceKind: "group-main",
      targetKind: "group-main",
    };
    const policy = resolveSharePolicy(ctx);
    expect(policy.masking).toBe("company-rebrand");
  });

  it("wildcard role matches any role", () => {
    replaceSharePolicyRules([
      {
        role: "*",
        sourceKind: "seller-dm",
        targetKind: "enquiry-internal",
        priority: 100,
        policy: { masking: "seller-anonymous" },
      },
    ]);

    for (const role of ["BDM", "CM", "CX"] as const) {
      const ctx: ShareContext = {
        role,
        sourceKind: "seller-dm",
        targetKind: "enquiry-internal",
      };
      expect(resolveSharePolicy(ctx).masking).toBe("seller-anonymous");
    }
  });

  it("group-kind qualifiers narrow the match", () => {
    replaceSharePolicyRules([
      {
        role: "*",
        sourceKind: "group-main",
        targetKind: "group-main",
        sourceGroupKind: "custom",
        targetGroupKind: "seller",
        priority: 300,
        policy: { masking: "company-rebrand" },
      },
      {
        role: "*",
        sourceKind: "group-main",
        targetKind: "group-main",
        priority: 100,
        policy: { masking: "none" },
      },
    ]);

    // Matches specific rule
    const sellerCtx: ShareContext = {
      role: "CM",
      sourceKind: "group-main",
      sourceGroupKind: "custom",
      targetKind: "group-main",
      targetGroupKind: "seller",
    };
    expect(resolveSharePolicy(sellerCtx).masking).toBe("company-rebrand");

    // Falls through to general rule
    const customCtx: ShareContext = {
      role: "CM",
      sourceKind: "group-main",
      sourceGroupKind: "custom",
      targetKind: "group-main",
      targetGroupKind: "custom",
    };
    expect(resolveSharePolicy(customCtx).masking).toBe("none");
  });
});

// ── Convenience queries ──────────────────────────────────────────────

describe("canRoleShare", () => {
  it("returns true for all roles (sharing now enabled for everyone)", () => {
    expect(canRoleShare("BDM")).toBe(true);
    expect(canRoleShare("CM")).toBe(true);
    expect(canRoleShare("CX")).toBe(true);
    expect(canRoleShare("Buyer")).toBe(true);
    expect(canRoleShare("Seller")).toBe(true);
  });
});

describe("canShareToTarget", () => {
  it("blocks same-type group sharing (internal→internal)", () => {
    const ctx: ShareContext = {
      role: "CM",
      sourceKind: "group-main",
      sourceGroupKind: "custom",
      targetKind: "group-main",
      targetGroupKind: "custom",
    };
    expect(canShareToTarget(ctx)).toBe(false);
  });

  it("allows cross-type group sharing (internal→external)", () => {
    const ctx: ShareContext = {
      role: "CM",
      sourceKind: "group-main",
      sourceGroupKind: "custom",
      targetKind: "group-main",
      targetGroupKind: "seller",
    };
    expect(canShareToTarget(ctx)).toBe(true);
  });

  it("allows CM sharing seller-dm → enquiry-internal", () => {
    const ctx: ShareContext = {
      role: "CM",
      sourceKind: "seller-dm",
      targetKind: "enquiry-internal",
    };
    expect(canShareToTarget(ctx)).toBe(true);
  });
});

describe("getAvailableRouteModes", () => {
  it("BDM gets new-enquiry as an option for new-thread target", () => {
    const ctx: ShareContext = {
      role: "BDM",
      sourceKind: "group-main",
      targetKind: "new-thread",
    };
    const modes = getAvailableRouteModes(ctx);
    expect(modes).toContain("new-enquiry");
  });

  it("CM gets empty array for new-thread target (blocked)", () => {
    const ctx: ShareContext = {
      role: "CM",
      sourceKind: "group-main",
      targetKind: "new-thread",
    };
    const modes = getAvailableRouteModes(ctx);
    expect(modes).toEqual([]);
  });
});

// ── Target enumeration ───────────────────────────────────────────────

describe("getAvailableTargets", () => {
  it("filters groups by resolved policy", () => {
    const groups: GroupChannel[] = [
      makeGroup({ id: "grp_1", name: "Internal Group", type: "custom" }),
      makeGroup({ id: "grp_2", name: "Buyer Group", type: "buyer" }),
    ];

    const targets = getAvailableTargets({
      role: "CM",
      sourceKind: "group-main",
      allGroups: groups,
    });

    // Both should be allowed for CM (no rule blocks them)
    expect(targets.length).toBe(2);
    expect(targets.every((t) => t.policy.allowed)).toBe(true);
  });

  it("excludes inactive groups", () => {
    const groups: GroupChannel[] = [
      makeGroup({ id: "grp_1", status: "active" }),
      makeGroup({ id: "grp_2", status: "pending" }),
    ];

    const targets = getAvailableTargets({
      role: "CM",
      sourceKind: "group-main",
      allGroups: groups,
    });

    expect(targets.length).toBe(1);
    expect(targets[0].id).toBe("grp_1");
  });

  it("excludes the source group when excludeGroupId is set", () => {
    const groups: GroupChannel[] = [
      makeGroup({ id: "grp_1" }),
      makeGroup({ id: "grp_2" }),
    ];

    const targets = getAvailableTargets({
      role: "CM",
      sourceKind: "group-main",
      allGroups: groups,
      excludeGroupId: "grp_1",
    });

    expect(targets.length).toBe(1);
    expect(targets[0].id).toBe("grp_2");
  });

  it("includes additional targets filtered by policy", () => {
    const targets = getAvailableTargets({
      role: "CM",
      sourceKind: "seller-dm",
      allGroups: [],
      additionalTargets: [
        { kind: "enquiry-internal", id: "ENQ-001", label: "ENQ-001 Internal" },
      ],
    });

    expect(targets.length).toBe(1);
    expect(targets[0].id).toBe("ENQ-001");
    expect(targets[0].policy.masking).toBe("seller-anonymous");
  });
});

describe("categoriseTargets", () => {
  it("groups targets by category", () => {
    const targets = getAvailableTargets({
      role: "CM",
      sourceKind: "group-main",
      allGroups: [
        makeGroup({ id: "grp_1", type: "custom", name: "Internal" }),
        makeGroup({ id: "grp_2", type: "seller", name: "Seller Group" }),
      ],
      additionalTargets: [
        { kind: "seller-dm", id: "sdm_1", label: "Seller DM" },
      ],
    });

    const categories = categoriseTargets(targets);
    expect(Object.keys(categories).sort()).toEqual(
      ["Birla Pivot", "Seller", "Seller DMs"].sort(),
    );
  });
});

// ── Masking ──────────────────────────────────────────────────────────

describe("applyPolicyMasking", () => {
  it("seller-anonymous removes sender and sets displaySender", () => {
    const msg = makeMessage({ sender: "Suresh Industries" });
    const result = applyPolicyMasking(msg, "seller-anonymous", "Priya", "CM");
    expect(result.sender).toBeUndefined();
    expect(result.displaySender).toBe("Seller response");
    expect(result.masked).toBe(true);
  });

  it("company-rebrand replaces internal sender with company name", () => {
    const msg = makeMessage({ sender: "Priya Sharma", senderRole: "CM" });
    const result = applyPolicyMasking(msg, "company-rebrand", "Priya", "CM");
    expect(result.sender).toBe("Birla Pivot");
    expect(result.masked).toBe(true);
  });

  it("company-rebrand does NOT mask external senders", () => {
    const msg = makeMessage({ sender: "Suresh", senderRole: "Seller" });
    const result = applyPolicyMasking(msg, "company-rebrand", "Priya", "CM");
    expect(result.sender).toBe("Suresh");
    expect(result.masked).toBeUndefined();
  });

  it("current-user replaces sender with sharer", () => {
    const msg = makeMessage({ sender: "Original Sender" });
    const result = applyPolicyMasking(msg, "current-user", "Priya", "CM");
    expect(result.sender).toBe("Priya");
    expect(result.senderRole).toBe("CM");
  });

  it("none returns message unchanged", () => {
    const msg = makeMessage();
    const result = applyPolicyMasking(msg, "none", "Priya", "CM");
    expect(result).toBe(msg);
  });
});

// ── Attribution ──────────────────────────────────────────────────────

describe("resolveAttribution", () => {
  it("original-sender returns the original sender name", () => {
    expect(resolveAttribution("original-sender", "Alice", "Bob")).toBe("Alice");
  });

  it("sharer returns the sharer name", () => {
    expect(resolveAttribution("sharer", "Alice", "Bob")).toBe("Bob");
  });

  it("company returns the company name", () => {
    expect(resolveAttribution("company", "Alice", "Bob")).toBe("Birla Pivot");
  });

  it("anonymous returns generic label", () => {
    expect(resolveAttribution("anonymous", "Alice", "Bob")).toBe("Shared message");
  });
});

// ── Full transform ───────────────────────────────────────────────────

describe("transformForShare", () => {
  it("produces a single concatenated shared message", () => {
    replaceSharePolicyRules([]);

    const messages = [
      makeMessage({ id: "m1", content: "First message" }),
      makeMessage({ id: "m2", content: "Second message" }),
    ];

    const result = transformForShare(messages, {
      context: {
        role: "CM",
        sourceKind: "group-main",
        targetKind: "group-main",
      },
      sharerName: "Priya",
      sharerPersonaId: "p_cm_1",
      sharerRole: "CM",
    });

    expect(result.content).toBe("First message\nSecond message");
    expect(result.type).toBe("shared");
    expect(result.id).toMatch(/^msg-/);
  });

  it("applies edited contents before concatenating", () => {
    replaceSharePolicyRules([]);

    const messages = [
      makeMessage({ id: "m1", content: "Original" }),
    ];

    const result = transformForShare(messages, {
      context: {
        role: "CM",
        sourceKind: "group-main",
        targetKind: "group-main",
      },
      sharerName: "Priya",
      sharerPersonaId: "p_cm_1",
      sharerRole: "CM",
      editedContents: { m1: "Edited content" },
    });

    expect(result.content).toBe("Edited content");
    expect(result.edited).toBe(true);
  });

  it("applies seller-anonymous masking from registry rules", () => {
    // Use the standard rules (Buyer/Seller blocked + seller-dm → enquiry-internal masked)
    const messages = [
      makeMessage({ id: "m1", content: "Quote: $500/MT", sender: "Suresh Industries", senderRole: "Seller" }),
    ];

    const result = transformForShare(messages, {
      context: {
        role: "CM",
        sourceKind: "seller-dm",
        targetKind: "enquiry-internal",
      },
      sharerName: "Priya",
      sharerPersonaId: "p_cm_1",
      sharerRole: "CM",
    });

    expect(result.masked).toBe(true);
    expect(result.sender).toBe("Priya"); // attribution: "sharer"
  });
});
