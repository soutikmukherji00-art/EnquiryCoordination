import { Mail, MessageCircle } from "lucide-react";
import type { EnquiryRecord, EnquirySourceEmailCorrespondence } from "@/domain/enquiry/enquiry.record";
import type { Message } from "@/domain/message/message.types";

interface EnquirySourcePreviewProps {
  record?: EnquiryRecord;
  summary?: string;
  messagesByChannel?: Record<string, Message[]> | null;
  className?: string;
}

function resolveSourceEmails(record?: EnquiryRecord): EnquirySourceEmailCorrespondence[] {
  if (!record) return [];
  if (record.sourceCorrespondences && record.sourceCorrespondences.length > 0) {
    return record.sourceCorrespondences.filter((entry) => entry.kind === "email");
  }
  if (record.sourceCorrespondence?.kind === "email") {
    return [record.sourceCorrespondence];
  }
  return [];
}

function resolveWhatsappPreviewText(
  record: EnquiryRecord,
  messagesByChannel?: Record<string, Message[]> | null,
  summary?: string,
): string {
  const combinedMessageText = Object.values(messagesByChannel ?? {})
    .flat()
    .filter((message) => message.type !== "system")
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join("\n");

  if (combinedMessageText) {
    return combinedMessageText;
  }

  return record.requirements.notes?.trim() || summary?.trim() || "";
}

export function EnquirySourcePreview({
  record,
  summary,
  messagesByChannel,
  className = "",
}: EnquirySourcePreviewProps) {
  if (!record) return null;

  const origin = record.origin;
  const fallbackText = record.requirements.notes?.trim() || summary?.trim() || "";

  if (origin === "whatsapp_intake") {
    const whatsappText = resolveWhatsappPreviewText(record, messagesByChannel, summary);
    if (!whatsappText) return null;
    return (
      <section className={`rounded-2xl border border-border/40 bg-card p-4 md:p-5 shadow-sm ${className}`.trim()}>
        <h2 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
          <MessageCircle className="w-3.5 h-3.5" />
          Preview
        </h2>
        <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap text-foreground/90">
          {whatsappText}
        </div>
      </section>
    );
  }

  if (origin !== "mail_intake") {
    return null;
  }

  const sourceEmails = resolveSourceEmails(record);
  if (sourceEmails.length === 0 && !fallbackText) {
    return null;
  }

  const latestEmail =
    sourceEmails.length > 0
      ? sourceEmails[0]
      : {
          kind: "email" as const,
          subject: "Email enquiry",
          from: "Buyer",
          to: "Birla Pivot RFQ Inbox",
          receivedAt: "—",
          body: fallbackText,
        };

  return (
    <section className={`rounded-2xl border border-border/40 bg-card p-4 md:p-5 shadow-sm ${className}`.trim()}>
      <h2 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
        <Mail className="w-3.5 h-3.5" />
        Preview
      </h2>
      <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm space-y-2">
        <div className="grid gap-1 sm:grid-cols-[4.5rem_1fr]">
          <span className="text-muted-foreground text-xs uppercase">Subject</span>
          <span className="font-medium text-foreground">{latestEmail.subject || "—"}</span>
        </div>
        <div className="grid gap-1 sm:grid-cols-[4.5rem_1fr]">
          <span className="text-muted-foreground text-xs uppercase">From</span>
          <span className="text-foreground/90 break-all">{latestEmail.from || "—"}</span>
        </div>
        <div className="grid gap-1 sm:grid-cols-[4.5rem_1fr]">
          <span className="text-muted-foreground text-xs uppercase">To</span>
          <span className="text-foreground/90 break-all">{latestEmail.to || "—"}</span>
        </div>
        <div className="grid gap-1 sm:grid-cols-[4.5rem_1fr]">
          <span className="text-muted-foreground text-xs uppercase">Date</span>
          <span className="text-foreground/90">{latestEmail.receivedAt || "—"}</span>
        </div>
        <div className="mt-3 border-t border-border/40 pt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/85">
          {latestEmail.body || fallbackText || "No email body captured."}
        </div>
      </div>
    </section>
  );
}
