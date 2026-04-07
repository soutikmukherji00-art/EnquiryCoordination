import { Button } from "@/app/components/ui/button";
import { Paperclip, Mic, Square, X, AlertCircle } from "lucide-react";
import { Attachment, VoiceMessageData } from "@/domain/message/message.types";

interface ShareAttachmentsSectionProps {
  shareAttachments: Attachment[];
  shareAudioNote: VoiceMessageData | null;
  isRecordingShare: boolean;
  shareRecordingError: string | null;
  shareFileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (index: number) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onRemoveAudioNote: () => void;
  onClearError: () => void;
}

export function ShareAttachmentsSection({
  shareAttachments = [],
  shareAudioNote = null,
  isRecordingShare = false,
  shareRecordingError = null,
  shareFileInputRef,
  onFileSelect,
  onRemoveAttachment,
  onStartRecording,
  onStopRecording,
  onRemoveAudioNote,
  onClearError,
}: ShareAttachmentsSectionProps) {
  return (
    <div className="p-6 border-t border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-700">
          Add additional context
        </p>
        <div className="flex gap-2">
          <input
            type="file"
            ref={shareFileInputRef}
            onChange={onFileSelect}
            className="hidden"
            multiple
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => shareFileInputRef.current?.click()}
            className="gap-2"
          >
            <Paperclip className="size-4" />
            Attach Files
          </Button>
          {!shareAudioNote && (
            <Button
              variant="outline"
              size="sm"
              onClick={isRecordingShare ? onStopRecording : onStartRecording}
              className="gap-2"
            >
              {isRecordingShare ? (
                <>
                  <Square className="size-4 fill-red-500 text-red-500" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="size-4" />
                  Audio Note
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Display attached files */}
      {shareAttachments.length > 0 && (
        <div className="space-y-2 mb-3">
          {shareAttachments.map((att, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
              <Paperclip className="size-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 flex-1 truncate">{att.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 flex-shrink-0"
                onClick={() => onRemoveAttachment(index)}
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Display audio note */}
      {shareAudioNote && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded border border-blue-200 mb-3">
          <Mic className="size-4 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">Audio Note Attached</p>
            <p className="text-xs text-blue-600">Will be sent with shared messages</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 flex-shrink-0"
            onClick={onRemoveAudioNote}
          >
            <X className="size-3" />
          </Button>
        </div>
      )}
      
      {/* Recording indicator */}
      {isRecordingShare && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded border border-red-200 mb-3">
          <div className="size-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-red-900 font-medium">Recording audio note...</span>
        </div>
      )}
      
      {/* Recording error */}
      {shareRecordingError && (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded mb-3">
          <AlertCircle className="size-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-900 flex-1">{shareRecordingError}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearError}
            className="text-red-700 hover:text-red-900 hover:bg-red-100 flex-shrink-0"
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
}