/**
 * MessageBubble Component
 * 
 * Chat bubble for rendering messages in ConversationPanel.
 * Supports current user vs other user styling, selection mode, and mobile view.
 * Checkboxes are always aligned to the left for consistency.
 */

import { memo } from "react";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { FileText, ImageIcon, MessageSquarePlus, Paperclip } from "lucide-react";
import { AppleShareIcon } from "@/app/components/icons/AppleShareIcon";
import { Badge } from "@/app/components/ui/badge";
import type { Message, Persona } from "@/domain/enquiry/enquiry.types";
import { RoleBadge } from "@/app/components/RoleBadge";
import { SellerRfqBadge } from "@/app/components/SellerRfqBadge";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  isMobileView: boolean;
  currentChannel: string;
  currentRole: string;
  enquiryId: string;
  selectionMode: boolean;
  isSelected: boolean;
  getMessageSenderDisplay: (message: Message) => { sender: string; role: string };
  getPersonaById: (id: string) => Persona | undefined;
  personaMap: Map<string, Persona>;
  renderSharedIndicator: (sharedFrom: any, masked?: boolean) => JSX.Element | null;
  renderMessageContent: (message: Message) => JSX.Element;
  isImage: (filename: string) => boolean;
  onQuickAction?: (messageId: string, action: string) => void;
  onOpenThread?: (threadId: string) => void;
  onCreateThreadFromMessage?: (messageId: string) => void;
  channelKind?: "whatsapp" | "mail";
  toggleMessageSelection: (messageId: string) => void;
  setSelectionMode: (mode: boolean) => void;
  setSelectedMessages: (messages: Set<string>) => void;
  observe?: (element: HTMLElement | null, message: Message) => void;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isCurrentUser,
  isMobileView,
  selectionMode,
  isSelected,
  getMessageSenderDisplay,
  renderSharedIndicator,
  renderMessageContent,
  toggleMessageSelection,
  observe,
  onOpenThread,
  onCreateThreadFromMessage,
  channelKind,
  setSelectionMode,
  setSelectedMessages,
}: MessageBubbleProps) {
  const displayData = getMessageSenderDisplay(message);
  const initials = displayData.sender && displayData.sender.length > 0 
    ? displayData.sender[0].toUpperCase() 
    : "?";
  const hasThread = !!message.threadId || (message.replyCount ?? 0) > 0;
  const canStartThread = channelKind !== "mail" && !!onCreateThreadFromMessage && !hasThread;
  const attachment = message.attachment;
  const isImageAttachment = !!attachment && attachment.type.startsWith("image/");
  const isPdfAttachment = !!attachment && attachment.type.includes("pdf");
  const hasTextContent = message.content.trim().length > 0;

  const renderAttachmentCard = () => {
    if (!attachment) return null;

    return (
      <a
        href={attachment.url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-2 inline-flex max-w-[85%] items-center gap-3 rounded-xl border bg-white px-3 py-2.5 text-left shadow-sm transition-colors hover:bg-gray-50 ${isCurrentUser ? "self-end" : ""}`}
      >
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${isPdfAttachment ? "border-red-200 bg-red-50 text-red-600" : isImageAttachment ? "border-blue-200 bg-blue-50 text-blue-600" : "border-gray-200 bg-gray-50 text-gray-600"}`}>
          {isImageAttachment ? (
            <ImageIcon className="size-4" />
          ) : isPdfAttachment ? (
            <FileText className="size-4" />
          ) : (
            <Paperclip className="size-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-gray-900">
              {attachment.name}
            </span>
            {attachment.markAsPO && (
              <Badge className="h-5 rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white hover:bg-rose-500">
                PO
              </Badge>
            )}
          </div>
          <div className="mt-0.5 text-xs text-gray-500">
            Document attachment
          </div>
        </div>
      </a>
    );
  };

  // System messages (no bubble, centered)
  if (message.type === "system") {
    return (
      <div
        ref={(element) => observe?.(element, message)}
        className="flex justify-center py-2"
      >
        <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={(element) => observe?.(element, message)}
      className={`flex gap-3 ${isSelected ? "bg-blue-50/50" : ""} ${
        selectionMode ? "cursor-pointer" : ""
      } ${isMobileView ? "px-3 py-1.5" : "px-4 py-1.5"} transition-colors`}
      onClick={() => selectionMode && toggleMessageSelection(message.id)}
    >
      {/* Selection checkbox - always on the left */}
      {selectionMode && (
        <div className="flex items-start pt-1 flex-shrink-0 transition-all" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleMessageSelection(message.id)}
          />
        </div>
      )}

      {/* Message content wrapper - this gets reversed for current user */}
      <div className={`flex gap-3 flex-1 min-w-0 group ${isCurrentUser ? "flex-row-reverse" : ""}`}>
        {/* Avatar - only show for other users */}
        {!isCurrentUser && (
          <div className="flex-shrink-0">
            <Avatar className={isMobileView ? "size-8" : "size-9"}>
              <AvatarFallback className="bg-gray-200 text-gray-700">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Message content */}
        <div className={`flex-1 min-w-0 ${isCurrentUser ? "flex flex-col items-end" : ""}`}>
          {/* Header */}
          <div className={`flex items-baseline gap-2 mb-1 ${isCurrentUser ? "justify-end" : ""}`}>
            <span className={`font-semibold text-gray-900 ${isMobileView ? "text-[15px]" : "text-sm"}`}>
              {displayData.sender}
            </span>
            <RoleBadge role={displayData.role} />
            <span className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: "2-digit", 
                minute: "2-digit" 
              })}
            </span>
            {/* Shared indicator */}
            {message.sharedFrom && renderSharedIndicator(message.sharedFrom, message.masked)}
          </div>

          {/* Message content - bubble for others, plain for current user */}
          {isCurrentUser ? (
            hasTextContent ? (
              <div className="bg-[#5249D2] text-white px-4 py-2 rounded-lg max-w-[85%] shadow-sm shadow-black/10">
                {message.sellerRfq && <SellerRfqBadge className="mb-1" />}
                <div className="text-sm text-white">
                  {renderMessageContent(message)}
                </div>
              </div>
            ) : null
          ) : (
            hasTextContent ? (
              <div className="inline-block max-w-[85%] rounded-2xl px-4 py-2.5 bg-white text-gray-900 shadow-sm shadow-black/[0.07]">
                {message.sellerRfq && <SellerRfqBadge />}
                <div className="text-sm text-gray-900">
                  {renderMessageContent(message)}
                </div>
              </div>
            ) : null
          )}

          {renderAttachmentCard()}

          {/* Thread indicator (if applicable) */}
          {message.threadId && (message.replyCount ?? 0) === 0 && (
            <div
              className="mt-1 text-xs text-blue-600 font-medium cursor-pointer hover:text-blue-700 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onOpenThread?.(message.threadId || message.id);
              }}
            >
              Open thread
            </div>
          )}
          {(message.replyCount ?? 0) > 0 && (
            <div 
              className="mt-1 text-xs text-blue-600 font-medium cursor-pointer hover:text-blue-700 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onOpenThread?.(message.threadId || message.id);
              }}
            >
              View {message.replyCount} {message.replyCount === 1 ? "reply" : "replies"}
            </div>
          )}
        </div>

        {/* Hover actions — Share / Start thread (only when not in selection mode) */}
        {!selectionMode && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-0.5">
            {canStartThread && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateThreadFromMessage(message.id);
                }}
                className="p-1.5 hover:bg-gray-200 rounded transition-all"
                title="Start thread"
              >
                <MessageSquarePlus className="size-3.5 text-gray-500" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectionMode(true);
                setSelectedMessages(new Set([message.id]));
              }}
              className="p-1.5 hover:bg-gray-200 rounded transition-all"
              title="Share message"
            >
              <AppleShareIcon className="size-3.5 text-gray-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
