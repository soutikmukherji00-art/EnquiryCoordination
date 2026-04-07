/**
 * MessageItem Component
 * 
 * Renders a single message with all its features:
 * - Selection checkbox
 * - Sender info with hover card
 * - Content display
 * - Attachments
 * - Voice messages
 * - AI insights
 * - Sharing indicators
 * 
 * Mobile optimizations:
 * - Cleaner Slack-inspired design
 * - Hidden role badges
 * - Hidden sharing tags
 */

import { memo } from "react";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { Paperclip, ImageIcon } from "lucide-react";
import { AppleShareIcon } from "@/app/components/icons/AppleShareIcon";
import { RoleBadge } from "@/app/components/RoleBadge";
import { Message, Attachment, VoiceMessageData } from "@/domain/message/message.types";
import { Persona } from "@/domain/enquiry/enquiry.types";
import { PersonaHoverTrigger } from "@/app/components/PersonaHoverTrigger";
import { AudioMessage } from "@/app/components/AudioMessage";
import { MessageContentWithAI } from "@/app/components/MessageContentWithAI";
import { formatTime } from "@/domain/utils/formatting";
import { resolveMessageDisplay } from "@/domain/message/message.display";
import { useBreakpoint, isMobile } from "@/hooks/useBreakpoint";

interface MessageItemProps {
  message: Message;
  isSelected: boolean;
  isOwnMessage: boolean;
  selectionMode: boolean;
  senderPersona: Persona | undefined;
  currentChannel: string;
  enquiryId: string;
  onToggleSelection: (messageId: string) => void;
}

export const MessageItem = memo(function MessageItem({
  message,
  isSelected,
  isOwnMessage,
  selectionMode,
  senderPersona,
  currentChannel,
  enquiryId,
  onToggleSelection,
}: MessageItemProps) {
  const displayData = resolveMessageDisplay(message);
  const initials = displayData.sender?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  const breakpoint = useBreakpoint();
  const isMobileView = isMobile(breakpoint);

  return (
    <div
      className={`flex gap-3 group ${isSelected ? "bg-blue-50" : ""} ${selectionMode ? "cursor-pointer" : ""} ${isMobileView ? 'px-3 py-3' : 'px-4 py-2'} hover:bg-gray-50 transition-colors`}
      onClick={() => selectionMode && onToggleSelection(message.id)}
    >
      {/* Selection checkbox */}
      {selectionMode && (
        <div className="flex items-start pt-1" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(message.id)}
          />
        </div>
      )}

      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className={isMobileView ? "size-8" : "size-9"}>
          <AvatarFallback
            className={isOwnMessage ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Header - Slack-inspired with better hierarchy */}
        <div className="flex items-baseline gap-2 mb-0.5">
          {senderPersona ? (
            <PersonaHoverTrigger
              personaId={senderPersona.id}
              context={{ enquiryId, channelId: currentChannel, location: 'message-item' }}
            >
              <span className={`font-semibold text-gray-900 ${isMobileView ? 'text-[15px]' : 'text-sm'}`}>
                {displayData.sender}
              </span>
            </PersonaHoverTrigger>
          ) : (
            <span className={`font-semibold text-gray-900 ${isMobileView ? 'text-[15px]' : 'text-sm'}`}>
              {displayData.sender}
            </span>
          )}
          <RoleBadge role={message.senderRole} />
          <span className={`text-gray-500 ${isMobileView ? 'text-[11px]' : 'text-xs'}`}>
            {formatTime(message.timestamp)}
          </span>
          {/* Hide sharing tag on mobile */}
          {!isMobileView && message.sharedFrom && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <AppleShareIcon className="size-3" />
              <span>Shared from {message.sharedFrom}</span>
            </div>
          )}
        </div>

        {/* Content with AI insights - improved spacing */}
        <div className={isMobileView ? 'text-[15px] leading-relaxed text-gray-900' : 'text-sm text-gray-700'}>
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>

        {/* Voice message */}
        {message.voiceMessage && (
          <div className="mt-2">
            <AudioMessage
              audioUrl={message.voiceMessage.audioUrl}
              duration={message.voiceMessage.duration}
              transcription={message.voiceMessage.transcription}
            />
          </div>
        )}

        {/* Attachment */}
        {message.attachment && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
            {message.attachment.type.startsWith("image/") ? (
              <ImageIcon className="size-4 text-blue-600" />
            ) : (
              <Paperclip className="size-4 text-blue-600" />
            )}
            <a
              href={message.attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {message.attachment.name}
            </a>
          </div>
        )}
      </div>
    </div>
  );
});
