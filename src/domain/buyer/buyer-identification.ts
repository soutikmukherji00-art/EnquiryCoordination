/**
 * Domain: Smart Buyer Identification
 *
 * Resolves buyer information in the context of sharing messages
 * from external groups to internal groups. Uses a multi-priority
 * waterfall to identify the relevant buyer for each enquiry thread.
 *
 * Resolution Priority (per thread):
 *   P1 — Thread's enquiryId → Enquiry.buyerPersonaId → buyer info
 *   P2 — Source group's buyerPersonaId (direct, for buyer groups)
 *   P3 — Source group member traversal (find buyer persona in memberPersonaIds)
 *   P4 — Source group's sellerId → find enquiries linked to seller → buyer from those enquiries
 *   P5 — Target group member traversal (fallback)
 *
 * Share-level resolution (single buyer for the entire share context):
 *   Uses P2→P3→P4 from the source group regardless of thread.
 */

import type { GroupChannel } from "@/domain/message/group.types";
import type { Enquiry } from "@/domain/enquiry/enquiry.types";
import { getBuyerById, getContactsForBuyer } from "./buyer.mock-data";
import { BUYER_PERSONA_TO_BUYER_MAP } from "./buyer-persona-mapping";
import { getPersonaById } from "@/domain/persona/persona.data";

// ── Output Types ─────────────────────────────────────────────────────

export interface ResolvedBuyerInfo {
  /** Buyer persona ID (e.g. "p_buyer_1") */
  buyerPersonaId: string;
  /** Company / persona display name (e.g. "Ramesh Industries") */
  companyName: string;
  /** Buyer data ID (e.g. "buyer_1") */
  buyerDataId?: string;
  /** Region from buyer data */
  region?: string;
  /** Industry from buyer data */
  industry?: string;
  /** Contact persons (name + role) */
  contacts?: { name: string; role: string }[];
  /** Linked enquiry IDs (found in this session) */
  linkedEnquiryIds?: string[];
  /** How the buyer was resolved — useful for telemetry/debugging */
  resolution:
    | "thread-enquiry"       // P1: thread.enquiryId → Enquiry.buyerPersonaId
    | "source-group-direct"  // P2: sourceGroup.buyerPersonaId
    | "source-group-member"  // P3: found buyer persona in sourceGroup.memberPersonaIds
    | "seller-enquiry-link"  // P4: seller group → enquiry linkage
    | "target-group-member"  // P5: found buyer persona in targetGroup.memberPersonaIds
    | "unknown";             // Could not resolve
}

/** Compact info for rendering a small badge. */
export interface BuyerBadgeInfo {
  companyName: string;
  buyerPersonaId: string;
}

// ── Core Resolution Functions ────────────────────────────────────────

/**
 * Resolve buyer info for a specific thread based on its enquiryId.
 * Falls back to share-level buyer if thread has no enquiry link.
 */
export function resolveBuyerForThread(
  threadEnquiryId: string | undefined,
  sourceGroup: GroupChannel | undefined,
  targetGroup: GroupChannel | undefined,
  enquiries: Enquiry[],
  personaMap: Map<string, any>,
): ResolvedBuyerInfo | null {
  // P1: Thread's enquiryId → Enquiry.buyerPersonaId
  if (threadEnquiryId) {
    const enquiry = enquiries.find((e) => e.id === threadEnquiryId);
    if (enquiry?.buyerPersonaId) {
      const info = buildBuyerInfoFromPersonaId(enquiry.buyerPersonaId, personaMap);
      if (info) {
        const linkedIds = enquiries
          .filter((e) => e.buyerPersonaId === enquiry.buyerPersonaId)
          .map((e) => e.id);
        return { ...info, linkedEnquiryIds: linkedIds, resolution: "thread-enquiry" };
      }
    }
  }

  // P2–P5: Fall back to share-level buyer
  return resolveShareLevelBuyer(sourceGroup, targetGroup, enquiries, personaMap);
}

/**
 * Resolve a single buyer for the entire share context (independent of threads).
 * Uses source group properties + member traversal.
 */
export function resolveShareLevelBuyer(
  sourceGroup: GroupChannel | undefined,
  targetGroup: GroupChannel | undefined,
  enquiries: Enquiry[],
  personaMap: Map<string, any>,
): ResolvedBuyerInfo | null {
  if (!sourceGroup) return null;

  // P2: Source group's direct buyerPersonaId (buyer groups)
  if (sourceGroup.buyerPersonaId) {
    const info = buildBuyerInfoFromPersonaId(sourceGroup.buyerPersonaId, personaMap);
    if (info) {
      const linkedIds = enquiries
        .filter((e) => e.buyerPersonaId === sourceGroup.buyerPersonaId)
        .map((e) => e.id);
      return { ...info, linkedEnquiryIds: linkedIds, resolution: "source-group-direct" };
    }
  }

  // P3: Scan source group members for buyer personas
  const buyerFromMembers = findBuyerPersonaInMembers(sourceGroup.memberPersonaIds, personaMap);
  if (buyerFromMembers) {
    const linkedIds = enquiries
      .filter((e) => e.buyerPersonaId === buyerFromMembers.buyerPersonaId)
      .map((e) => e.id);
    return { ...buyerFromMembers, linkedEnquiryIds: linkedIds, resolution: "source-group-member" };
  }

  // P4: Seller group → find enquiries with matching seller link → buyer from those enquiries
  if (sourceGroup.type === "seller" && (sourceGroup.sellerId || sourceGroup.sellerPersonaId)) {
    const buyerFromSeller = resolveBuyerViaSeller(sourceGroup, enquiries, personaMap);
    if (buyerFromSeller) return buyerFromSeller;
  }

  // P5: Scan target group members for buyer personas (fallback)
  if (targetGroup) {
    const buyerFromTarget = findBuyerPersonaInMembers(targetGroup.memberPersonaIds, personaMap);
    if (buyerFromTarget) {
      const linkedIds = enquiries
        .filter((e) => e.buyerPersonaId === buyerFromTarget.buyerPersonaId)
        .map((e) => e.id);
      return { ...buyerFromTarget, linkedEnquiryIds: linkedIds, resolution: "target-group-member" };
    }
  }

  return null;
}

/**
 * Resolve buyer for all eligible threads at once.
 * Returns a Map of threadId → ResolvedBuyerInfo.
 */
export function resolveBuyersForThreads(
  threads: { id: string; enquiryId?: string }[],
  sourceGroup: GroupChannel | undefined,
  targetGroup: GroupChannel | undefined,
  enquiries: Enquiry[],
  personaMap: Map<string, any>,
): Map<string, ResolvedBuyerInfo> {
  const result = new Map<string, ResolvedBuyerInfo>();

  // Pre-compute share-level buyer (used as fallback for threads without their own enquiry link)
  const shareLevelBuyer = resolveShareLevelBuyer(sourceGroup, targetGroup, enquiries, personaMap);

  for (const thread of threads) {
    // Try thread-specific resolution first
    const threadBuyer = thread.enquiryId
      ? resolveBuyerForThread(thread.enquiryId, sourceGroup, targetGroup, enquiries, personaMap)
      : shareLevelBuyer;

    if (threadBuyer) {
      result.set(thread.id, threadBuyer);
    }
  }

  return result;
}

// ── Internal Helpers ─────────────────────────────────────────────────

/** Build full buyer info from a buyer persona ID. */
function buildBuyerInfoFromPersonaId(
  buyerPersonaId: string,
  personaMap: Map<string, any>,
): Omit<ResolvedBuyerInfo, "resolution" | "linkedEnquiryIds"> | null {
  // Get persona display name
  const persona = personaMap.get(buyerPersonaId);
  const companyName = persona?.displayName?.replace(/\s*\(.*?\)\s*$/, "") ?? buyerPersonaId;

  // Map to buyer data ID for enrichment
  const buyerDataId = BUYER_PERSONA_TO_BUYER_MAP[buyerPersonaId];
  let region: string | undefined;
  let industry: string | undefined;
  let contacts: { name: string; role: string }[] | undefined;

  if (buyerDataId) {
    const buyerData = getBuyerById(buyerDataId);
    if (buyerData) {
      region = buyerData.region;
      industry = buyerData.industry;
    }
    const contactList = getContactsForBuyer(buyerDataId);
    if (contactList.length > 0) {
      contacts = contactList.map((c) => ({ name: c.name, role: c.role }));
    }
  }

  return {
    buyerPersonaId,
    companyName,
    buyerDataId,
    region,
    industry,
    contacts,
  };
}

/** Scan member persona IDs for buyer personas (p_buyer_*). */
function findBuyerPersonaInMembers(
  memberPersonaIds: string[] | undefined,
  personaMap: Map<string, any>,
): Omit<ResolvedBuyerInfo, "resolution" | "linkedEnquiryIds"> | null {
  if (!memberPersonaIds) return null;

  for (const pid of memberPersonaIds) {
    if (pid.startsWith("p_buyer_")) {
      const info = buildBuyerInfoFromPersonaId(pid, personaMap);
      if (info) return info;
    }
  }

  return null;
}

/**
 * For seller groups: find enquiries where the seller is linked,
 * then get the buyer from those enquiries.
 *
 * Linkage path: sourceGroup.sellerId → member traversal of enquiries
 * that have threads in this seller's group → Enquiry.buyerPersonaId
 */
function resolveBuyerViaSeller(
  sourceGroup: GroupChannel,
  enquiries: Enquiry[],
  personaMap: Map<string, any>,
): ResolvedBuyerInfo | null {
  // Look at threads in the source group for enquiry IDs
  const enquiryIdsFromThreads = new Set<string>();
  for (const thread of sourceGroup.threads ?? []) {
    if (thread.enquiryId) {
      enquiryIdsFromThreads.add(thread.enquiryId);
    }
  }

  // Also check if source group has a direct enquiryId
  if (sourceGroup.enquiryId) {
    enquiryIdsFromThreads.add(sourceGroup.enquiryId);
  }

  // Find buyers from linked enquiries
  for (const eId of enquiryIdsFromThreads) {
    const enquiry = enquiries.find((e) => e.id === eId);
    if (enquiry?.buyerPersonaId) {
      const info = buildBuyerInfoFromPersonaId(enquiry.buyerPersonaId, personaMap);
      if (info) {
        const linkedIds = enquiries
          .filter((e) => e.buyerPersonaId === enquiry.buyerPersonaId)
          .map((e) => e.id);
        return { ...info, linkedEnquiryIds: linkedIds, resolution: "seller-enquiry-link" };
      }
    }
  }

  return null;
}

/**
 * Check if the current share context is an external→internal share.
 * Used to decide whether to show buyer identification UI.
 */
export function isExternalToInternalShare(
  sourceGroupType: "buyer" | "seller" | "custom" | null,
): boolean {
  return sourceGroupType === "buyer" || sourceGroupType === "seller";
}

// ── Standalone Resolution (no personaMap required) ───────────────────

/**
 * Resolve full buyer info from just a buyerPersonaId string.
 * Uses getPersonaById() directly — no personaMap needed.
 * Suitable for EnquiryList, ThreadPanel, and other components that
 * don't carry a full personaMap prop.
 *
 * Optionally accepts enquiries to compute linkedEnquiryIds.
 */
export function resolveBuyerFromPersonaId(
  buyerPersonaId: string,
  enquiries?: Enquiry[],
): ResolvedBuyerInfo | null {
  if (!buyerPersonaId) return null;

  // Build a minimal persona map entry using getPersonaById
  const persona = getPersonaById(buyerPersonaId);
  const companyName = persona?.displayName?.replace(/\s*\(.*?\)\s*$/, "") ?? buyerPersonaId;

  const buyerDataId = BUYER_PERSONA_TO_BUYER_MAP[buyerPersonaId];
  let region: string | undefined;
  let industry: string | undefined;
  let contacts: { name: string; role: string }[] | undefined;

  if (buyerDataId) {
    const buyerData = getBuyerById(buyerDataId);
    if (buyerData) {
      region = buyerData.region;
      industry = buyerData.industry;
    }
    const contactList = getContactsForBuyer(buyerDataId);
    if (contactList.length > 0) {
      contacts = contactList.map((c) => ({ name: c.name, role: c.role }));
    }
  }

  const linkedEnquiryIds = enquiries
    ?.filter((e) => e.buyerPersonaId === buyerPersonaId)
    .map((e) => e.id);

  return {
    buyerPersonaId,
    companyName,
    buyerDataId,
    region,
    industry,
    contacts,
    linkedEnquiryIds: linkedEnquiryIds?.length ? linkedEnquiryIds : undefined,
    resolution: "thread-enquiry",
  };
}