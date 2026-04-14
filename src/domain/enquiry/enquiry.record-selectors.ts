/**
 * Domain: Enquiry Record Selectors
 *
 * Pure projections from EnquiryRecord into view models or standard formats.
 */

import type { GroupChannel } from "@/domain/message/group.types";
import { getUnreadMentionCount } from "@/domain/utils/mention-utils";
import { EnquiryRecord, type EnquiryRecordOrigin } from "./enquiry.record";
import type { StructuredData } from "./enquiry.structured-data";

export interface EnquiryDetailFieldsFromRecord {
  gstin?: string;
  creditLimit?: string;
  openCreditLimit?: string;
  deliveryLocation?: string;
  paymentTerms?: string;
  etaDays?: string;
  notes?: string;
  isParentQuote?: boolean;
  primaryContactName?: string;
  origin?: EnquiryRecordOrigin;
  assignedCMName?: string;
}

export interface EnquiryThreadAggregate {
  unreadCount: number;
  mentionCount: number;
}

export interface EnquiryThreadBadgeMeta {
  unreadCount: number;
  mentionCount: number;
}

export function buildEnquiryDetailFieldsFromRecord(record: EnquiryRecord | undefined): EnquiryDetailFieldsFromRecord {
  if (!record) return {};

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined) return undefined;
    if (val === 0) return "—";
    return `\u20B9${val.toLocaleString("en-IN")}`;
  };

  return {
    gstin: record.buyer.gstin || "—",
    creditLimit: formatCurrency(record.buyer.creditLimit),
    openCreditLimit: formatCurrency(record.buyer.openCreditLimit),
    deliveryLocation: record.requirements.deliveryLocation || "—",
    paymentTerms: record.requirements.paymentTerms || "—",
    etaDays: record.requirements.etaDays ? `${record.requirements.etaDays} Days` : "—",
    notes: record.requirements.notes || "—",
    isParentQuote: record.requirements.isParentQuote,
    primaryContactName: record.buyer.primaryContact,
    origin: record.origin,
    assignedCMName: record.assignment.primaryCMName,
  };
}

export function resolveRecordOriginBadge(
  origin: string | undefined,
): "WhatsApp" | "Email" | "Website" | null {
  if (!origin) return null;
  if (origin === "whatsapp_intake" || origin === "whatsapp-intake") return "WhatsApp";
  if (origin === "mail_intake" || origin === "mail-intake") return "Email";
  if (origin === "website_intake" || origin === "website-intake") return "Website";
  return null;
}

export function formatRecordOriginLabel(raw: string | undefined): string {
  if (!raw) return "—";
  const map: Record<string, string> = {
    detailed_rfq: "Detailed RFQ",
    quick_rfq: "Quick RFQ",
    direct_order: "Direct order",
    manual: "Manual",
    mail_intake: "Email",
    "mail-intake": "Email",
    whatsapp_intake: "WhatsApp",
    "whatsapp-intake": "WhatsApp",
    website_intake: "Website",
    "website-intake": "Website",
    thread_tag: "Thread tag",
    "thread-tag": "Thread tag",
    share: "Share",
    "pluto-detailed-rfq": "Detailed RFQ",
    "pluto-quick-rfq": "Quick RFQ",
    "pluto-direct-order": "Direct order",
    "prism-manual": "Manual",
  };
  return map[raw] ?? raw.replace(/-/g, " ");
}

export function computeEnquiryThreadAggregate(
  enquiryId: string,
  allGroups: GroupChannel[],
  currentPersonaId: string,
): EnquiryThreadAggregate {
  let unreadCount = 0;
  let mentionCount = 0;

  for (const group of allGroups) {
    for (const thread of group.threads || []) {
      if (thread.enquiryId !== enquiryId) continue;

      if ((thread.unreadCount ?? 0) > 0) {
        unreadCount += thread.unreadCount ?? 0;
      } else if (thread.unread) {
        unreadCount += 1;
      }

      const rootMessage =
        thread.rootMessage ||
        group.messages.find((message) => message.id === thread.rootMessageId);
      const threadMessages = rootMessage ? [rootMessage, ...thread.messages] : thread.messages;
      mentionCount += getUnreadMentionCount(threadMessages, currentPersonaId);
    }
  }

  return { unreadCount, mentionCount };
}

export function computeThreadBadgeMeta(
  group: GroupChannel,
  threadId: string,
  currentPersonaId: string,
): EnquiryThreadBadgeMeta {
  const thread = (group.threads || []).find((item) => item.id === threadId);
  if (!thread) {
    return { unreadCount: 0, mentionCount: 0 };
  }

  const rootMessage =
    thread.rootMessage ||
    group.messages.find((message) => message.id === thread.rootMessageId);
  const threadMessages = rootMessage ? [rootMessage, ...thread.messages] : thread.messages;

  return {
    unreadCount: thread.unreadCount ?? (thread.unread ? 1 : 0),
    mentionCount: getUnreadMentionCount(threadMessages, currentPersonaId),
  };
}

export function buildStructuredDataViewFromRecord(record: EnquiryRecord | undefined): StructuredData | null {
  if (!record) return null;

  const products = (record.products || []).map((p) => ({
    name: p.name || `${p.category} ${p.brand ? "- " + p.brand : ""}`,
    quantity: p.quantity || "TBD",
    specifications: p.specifications || (p.grade ? `Grade: ${p.grade}` : ""),
    aiExtracted: false,
  }));

  if (products.length === 0 && record.requirements.categories.length > 0) {
    record.requirements.categories.forEach((cat) => {
      products.push({
        name: cat,
        quantity: record.requirements.estimatedValue
          ? `Value: ₹${record.requirements.estimatedValue.toLocaleString("en-IN")}`
          : "TBD",
        specifications: record.requirements.notes || "No specifications detailed.",
        aiExtracted: false,
      });
    });
  }

  return {
    buyer: {
      name: record.buyer.name,
      company: record.buyer.company || record.buyer.name,
      contact: record.buyer.primaryContact || "—",
      aiExtracted: false,
    },
    products,
    commercial: {
      paymentTerms: record.requirements.paymentTerms || "—",
      deliveryTerms: record.requirements.deliveryLocation || "—",
      validityPeriod: record.requirements.etaDays ? `${record.requirements.etaDays} Days` : "—",
      aiExtracted: false,
    },
    delivery: {
      location: record.requirements.deliveryLocation || "—",
      aiExtracted: false,
    },
  };
}

export function buildSummaryFromRecord(record: EnquiryRecord | undefined): string | null {
  if (!record) return null;

  const cats = record.requirements.categories.join(", ");
  const sourceText = formatRecordOriginLabel(record.origin);
  let summary = `Enquiry created via ${sourceText} from ${record.buyer.name}.`;

  if (cats) summary += ` Categories requested: ${cats}.`;
  if (record.requirements.deliveryLocation) summary += ` Target delivery to ${record.requirements.deliveryLocation}.`;

  if (record.requirements.notes) {
    summary += ` Additional notes: "${record.requirements.notes}"`;
  }

  return summary;
}
