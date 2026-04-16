/**
 * Group Display Utilities
 * 
 * Helper functions for displaying group information with contact-based members
 */

import type { Role } from "@/domain/enquiry/enquiry.types";
import { GroupChannel } from "./group.types";
import { getUnifiedContactById } from "@/domain/contact/contact.utils";
import { getPersonaById } from "@/domain/persona/persona.data";
import { getBuyerById } from "@/domain/buyer/buyer.mock-data";
import { getBuyerPersonaFromBuyerId } from "@/domain/buyer/buyer-persona-mapping";

/** Chat canvas tint for Connect internal groups / threads */
export const CHAT_SURFACE_INTERNAL = "#F7F5F3";
/** Chat canvas tint for Connect external groups / threads */
export const CHAT_SURFACE_EXTERNAL = "#ffefee60";

/**
 * Classify a GroupChannel as external (buyer/seller-facing) vs internal-only.
 * Matches list/sidebar semantics in EnquiryList.
 */
export function isExternalGroupChannel(group: GroupChannel): boolean {
  if (group.buyerId || group.sellerId) return true;

  const hasExternalPersona = (group.memberPersonaIds || []).some((id) =>
    /^p_(buyer|seller)_/.test(id),
  );
  if (hasExternalPersona) return true;

  const hasRawExternalId = (group.memberIds || []).some((id) => !id.startsWith("p_"));
  if (hasRawExternalId) return true;

  return false;
}

/**
 * Get display name for a group member (contact or persona)
 */
export function getMemberDisplayName(memberId: string): string {
  // Try as contact first
  const contact = getUnifiedContactById(memberId);
  if (contact) {
    return contact.name;
  }
  
  // Try as persona
  const persona = getPersonaById(memberId);
  if (persona) {
    return persona.displayName;
  }
  
  return "Unknown Member";
}

/**
 * Get display info for a group member
 */
export interface MemberDisplayInfo {
  id: string;
  name: string;
  role?: string;
  company?: string;
  type: "contact" | "persona";
  avatarText: string;
}

export function getMemberDisplayInfo(memberId: string): MemberDisplayInfo | null {
  // Try as contact first
  const contact = getUnifiedContactById(memberId);
  if (contact) {
    return {
      id: contact.id,
      name: contact.name,
      role: contact.role,
      company: contact.companyName,
      type: "contact",
      avatarText: contact.name.substring(0, 2).toUpperCase(),
    };
  }
  
  // Try as persona
  const persona = getPersonaById(memberId);
  if (persona) {
    return {
      id: persona.id,
      name: persona.displayName,
      role: persona.role,
      type: "persona",
      avatarText: persona.displayName.substring(0, 2).toUpperCase(),
    };
  }
  
  return null;
}

/**
 * Get all member display info for a group
 */
export function getGroupMembersDisplayInfo(group: GroupChannel): MemberDisplayInfo[] {
  return group.memberIds
    .map(getMemberDisplayInfo)
    .filter((info): info is MemberDisplayInfo => info !== null);
}

/**
 * Get group member count summary
 */
export function getGroupMemberSummary(group: GroupChannel): string {
  const members = getGroupMembersDisplayInfo(group);
  const contacts = members.filter(m => m.type === "contact");
  const personas = members.filter(m => m.type === "persona");
  
  if (contacts.length === 0 && personas.length === 0) {
    return "No members";
  }
  
  const parts: string[] = [];
  if (contacts.length > 0) {
    parts.push(`${contacts.length} contact${contacts.length > 1 ? "s" : ""}`);
  }
  if (personas.length > 0) {
    parts.push(`${personas.length} team`);
  }
  
  return parts.join(" + ");
}

/**
 * Get group subtitle for channel list (e.g., "2 contacts + 1 team")
 */
export function getGroupChannelSubtitle(group: GroupChannel): string {
  const summary = getGroupMemberSummary(group);
  
  if (group.status === "pending") {
    return `${summary} • Pending`;
  }
  
  return summary;
}

/**
 * Get contact names in group (external members only)
 */
export function getGroupContactNames(group: GroupChannel): string[] {
  const members = getGroupMembersDisplayInfo(group);
  return members
    .filter(m => m.type === "contact")
    .map(m => m.name);
}

/**
 * Get team member names in group (internal members only)
 */
export function getGroupTeamNames(group: GroupChannel): string[] {
  const members = getGroupMembersDisplayInfo(group);
  return members
    .filter(m => m.type === "persona")
    .map(m => m.name);
}

export type ConnectGroupSection = "birla-pivot" | "buyer" | "seller";

export const getVisibleConnectGroupSections = (role: Role): ConnectGroupSection[] => {
  const sections: ConnectGroupSection[] = ["birla-pivot"];

  if (role === "BDM" || role === "CX" || role === "Buyer" || role === "Seller") {
    sections.push("buyer");
  }
  if (role === "CM" || role === "CX" || role === "Buyer" || role === "Seller") {
    sections.push("seller");
  }

  return sections;
};

export const getConnectGroupSectionLabel = (section: ConnectGroupSection): string => {
  switch (section) {
    case "birla-pivot":
      return "Birla Pivot";
    case "buyer":
      return "Buyers";
    case "seller":
      return "Seller";
    default:
      return "Groups";
  }
};

export const getConnectGroupSectionIcon = (section: ConnectGroupSection): "lock" | "globe" => {
  return section === "birla-pivot" ? "lock" : "globe";
};

export type BuyerChannelKind = "whatsapp" | "mail";

export const getBuyerChannelKindLabel = (kind?: BuyerChannelKind): string => {
  switch (kind) {
    case "whatsapp":
      return "Buyer WhatsApp";
    case "mail":
      return "Buyer Mail";
    default:
      return "Buyer Channel";
  }
};

export interface BuyerChannelBundle {
  buyerId: string;
  buyerName: string;
  buyerPersonaId?: string;
  channels: GroupChannel[];
}

export const groupBuyerChannels = (groups: GroupChannel[]): BuyerChannelBundle[] => {
  const bundles = new Map<string, BuyerChannelBundle>();

  groups.forEach((group) => {
    if (group.type !== "buyer") return;

    const buyerId = group.buyerId || group.buyerPersonaId || group.id;
    const buyerName =
      (group.buyerId ? getBuyerById(group.buyerId)?.name : undefined) ||
      group.name.replace(/\s*-\s*(WhatsApp|Mail|General)$/i, "") ||
      group.name;

    const existing = bundles.get(buyerId);
    if (existing) {
      existing.channels.push(group);
      return;
    }

    bundles.set(buyerId, {
      buyerId,
      buyerName,
      buyerPersonaId: group.buyerPersonaId || (group.buyerId ? getBuyerPersonaFromBuyerId(group.buyerId) : undefined),
      channels: [group],
    });
  });

  return Array.from(bundles.values())
    .map((bundle) => ({
      ...bundle,
      channels: [...bundle.channels].sort((a, b) => {
        const kindRank = (kind?: BuyerChannelKind) => (kind === "whatsapp" ? 0 : kind === "mail" ? 1 : 2);
        const rankDiff = kindRank(a.channelKind) - kindRank(b.channelKind);
        if (rankDiff !== 0) return rankDiff;
        return a.name.localeCompare(b.name);
      }),
    }))
    .sort((a, b) => a.buyerName.localeCompare(b.buyerName));
};

/**
 * Buyer Connect channels: sidebar + chat header use * "[Buyer Name] - Birla Pivot Mail Group" / "... WA Group".
 */
export function getBuyerConnectChannelTitle(group: GroupChannel): string {
  if (group.type !== "buyer") {
    return group.name;
  }

  const buyerName =
    (group.buyerId ? getBuyerById(group.buyerId)?.name : undefined) ||
    group.name.replace(/\s*-\s*(WhatsApp|Mail|General)$/i, "") ||
    group.name;

  if (group.channelKind === "mail") {
    return `${buyerName} - Birla Pivot Mail Group`;
  }
  if (group.channelKind === "whatsapp") {
    return `${buyerName} - Birla Pivot WA Group`;
  }
  return group.name;
}

export const getBuyerChannelLabel = (group: GroupChannel): string => {
  return getBuyerConnectChannelTitle(group);
};

export const getRoleBadgeTone = (role?: string): string => {
  switch (role) {
    case "BDM":
      return "bg-blue-500 text-white";
    case "CM":
      return "bg-violet-500 text-white";
    case "CX":
      return "bg-emerald-500 text-white";
    case "Buyer":
      return "bg-orange-500 text-white";
    case "Seller":
      return "bg-teal-500 text-white";
    case "BOT":
      return "bg-slate-600 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

/**
 * Format group member list for display
 * e.g., "Ramesh Patel, Kavita Ramesh, Arjun"
 */
export function formatGroupMemberList(group: GroupChannel, maxNames: number = 3): string {
  const members = getGroupMembersDisplayInfo(group);
  const names = members.map(m => m.name);
  
  if (names.length === 0) return "No members";
  if (names.length <= maxNames) return names.join(", ");
  
  const shown = names.slice(0, maxNames);
  const remaining = names.length - maxNames;
  return `${shown.join(", ")} +${remaining} more`;
}
