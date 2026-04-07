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
import { MessageSquarePlus } from "lucide-react";
import { AppleShareIcon } from "@/app/components/icons/AppleShareIcon";
import type { Message, Persona } from "@/domain/enquiry/enquiry.types";
import { RoleBadge } from "@/app/components/RoleBadge";

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
            <div className="bg-[#F0EFFC] text-gray-900 px-4 py-2 rounded-lg max-w-[85%]">
              <div className="text-sm text-gray-900">
                {renderMessageContent(message)}
              </div>
            </div>
          ) : (
            <div className="inline-block max-w-[85%] rounded-2xl px-4 py-2.5 bg-gray-100 text-gray-900">
              <div className="text-sm text-gray-900">
                {renderMessageContent(message)}
              </div>
            </div>
          )}

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
