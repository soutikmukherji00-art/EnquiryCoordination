import { MoreHorizontal } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import type { Message } from "@/domain/message/message.types";
import {
  getShareWinMarkEligibility,
  type ShareWinMarkValues,
} from "@/domain/message/share.types";

export interface ShareSelectionWinMarksProps {
  enabled: boolean;
  /** Selected message ids in display order (e.g. Set iteration order). */
  orderedMessageIds: string[];
  messagesById: Map<string, Message>;
  marksByMessageId: Record<string, ShareWinMarkValues>;
  onChange: (messageId: string, field: "po" | "buyerConfirmation", value: boolean) => void;
}

export function ShareSelectionWinMarks({
  enabled,
  orderedMessageIds,
  messagesById,
  marksByMessageId,
  onChange,
}: ShareSelectionWinMarksProps) {
  if (!enabled || orderedMessageIds.length === 0) return null;

  return (
    <div className="max-h-[min(220px,40vh)] overflow-y-auto border-t border-blue-100/80 bg-white/60 px-4 py-2">
      <p className="mb-2 text-[11px] font-medium text-gray-600">
        Win signals — apply to original messages when you share (same as marking PO on an attachment in the composer).
      </p>
      <div className="space-y-2">
        {orderedMessageIds.map((id) => {
          const msg = messagesById.get(id);
          if (!msg) return null;
          const el = getShareWinMarkEligibility(msg);
          if (!el.po && !el.buyerConfirmation) return null;
          const marks = marksByMessageId[id] ?? { po: false, buyerConfirmation: false };
          const preview =
            msg.content.trim().slice(0, 100) ||
            msg.attachment?.name ||
            (msg.audioRecording ? "Voice message" : "Message");

          return (
            <div
              key={id}
              className="group flex items-center gap-2 rounded border border-gray-200/80 bg-gray-50/90 px-2.5 py-2"
            >
              <span className="min-w-0 flex-1 truncate text-xs text-gray-800">{preview}</span>
              <div className="flex items-center gap-1">
                {marks.po && (
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-800">
                    PO
                  </span>
                )}
                {marks.buyerConfirmation && (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
                    Buyer confirmation
                  </span>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    aria-label="Message win signal actions"
                  >
                    <MoreHorizontal className="size-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {el.po && (
                    <DropdownMenuCheckboxItem
                      checked={marks.po}
                      onCheckedChange={(checked) => onChange(id, "po", checked === true)}
                    >
                      Mark as PO
                    </DropdownMenuCheckboxItem>
                  )}
                  {el.buyerConfirmation && (
                    <DropdownMenuCheckboxItem
                      checked={marks.buyerConfirmation}
                      onCheckedChange={(checked) =>
                        onChange(id, "buyerConfirmation", checked === true)
                      }
                    >
                      Mark as Buyer confirmation
                    </DropdownMenuCheckboxItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
}
