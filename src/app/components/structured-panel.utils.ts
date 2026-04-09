import type { Message } from "@/domain/message/message.types";

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  url: string;
  sourceLabel: string;
  isDefault?: boolean;
  markAsPO?: boolean;
}

const QUOTE_DETAILS_PDF_URL =
  "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO8CjEgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDMwMCAxNDQgXSAvQ29udGVudHMgNCAwIFIvUmVzb3VyY2VzIDw8L0ZvbnQgPDwvRjEgNSAwIFI+Pj4+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggNDQ+PnN0cmVhbQpCVApGMSAyNCBUZgo3MiA3MCBUZAooUXVvdGUgRGV0YWlscykgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8L1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9OYW1lIC9GMSAvQmFzZUZvbnQgL0hlbHZldGljYT4+CmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTAgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyMTMgMDAwMDAgbiAKMDAwMDAwMDMwOCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNi9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjM3OQolJUVPRg==";

const DEFAULT_DOCUMENT: DocumentItem = {
  id: "quote-details",
  name: "Quote Details",
  type: "application/pdf",
  url: QUOTE_DETAILS_PDF_URL,
  sourceLabel: "Default document",
  isDefault: true,
};

export function buildStructuredDocuments(
  messagesByChannel?: Record<string, Message[]> | null,
): DocumentItem[] {
  const uploadedDocuments = new Map<string, DocumentItem>();

  Object.entries(messagesByChannel ?? {}).forEach(([channelId, channelMessages]) => {
    channelMessages.forEach((message) => {
      if (!message.attachment) return;

      const attachment = message.attachment;
      const key = [
        attachment.name.trim().toLowerCase(),
        attachment.type.trim().toLowerCase(),
        attachment.markAsPO ? "po" : "doc",
      ].join("|");

      const sourceLabel = getChannelLabel(channelId);
      const existing = uploadedDocuments.get(key);
      if (!existing) {
        uploadedDocuments.set(key, {
          id: `${channelId}-${message.id}-${message.attachment.name}`,
          name: attachment.name,
          type: attachment.type,
          url: attachment.url || "#",
          sourceLabel,
          markAsPO: attachment.markAsPO,
        });
        return;
      }

      const sourceLabels = new Set(existing.sourceLabel.split(" • ").map((label) => label.trim()).filter(Boolean));
      sourceLabels.add(sourceLabel);
      uploadedDocuments.set(key, {
        ...existing,
        sourceLabel: Array.from(sourceLabels).join(" • "),
      });
    });
  });

  return [DEFAULT_DOCUMENT, ...uploadedDocuments.values()];
}

export function getChannelLabel(channelId: string): string {
  if (channelId === "thread" || channelId.startsWith("thread_")) return "Thread replies";
  if (channelId === "internal") return "Internal chat";
  if (channelId === "buyer") return "Buyer chat";
  if (channelId === "seller") return "Seller chat";
  if (channelId.startsWith("seller-")) return "Seller chat";
  if (channelId.startsWith("buyer-dm")) return "Buyer DM";
  if (channelId.startsWith("seller-dm")) return "Seller DM";
  if (channelId.startsWith("grp_") || channelId.startsWith("group_")) return "Group chat";
  return "Chat upload";
}
