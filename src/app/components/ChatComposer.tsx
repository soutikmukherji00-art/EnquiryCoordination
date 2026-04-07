/**
 * Component: ChatComposer
 * 
 * Unified chat composer with text and voice modes.
 * Follows the composer state machine pattern.
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Send, Paperclip, Mic, Square, X, AlertCircle } from "lucide-react";
import { useComposerState } from "@/hooks/useComposerState";
import { useVoiceMessage } from "@/hooks/useVoiceMessage";
import { VoiceMessageData } from "@/domain/message/message.types";
import { MessageAttachment } from "@/domain/message/message.types";

const __DEV_LOG__ = false;
const devError = __DEV_LOG__ ? (label: string, data?: any) => console.error(label, data) : (() => {}) as (label: string, data?: any) => void;

interface ChatComposerProps {
  currentPersonaId: string;
  disabled?: boolean;
  onSendTextMessage: (content: string, attachment?: MessageAttachment) => void;
  onSendVoiceMessage: (voiceData: VoiceMessageData, personaId: string) => void;
  onAttachFile?: () => void;
}

export function ChatComposer({
  currentPersonaId,
  disabled,
  onSendTextMessage,
  onSendVoiceMessage,
  onAttachFile,
}: ChatComposerProps) {
  const [textContent, setTextContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    composerState,
    startVoiceRecording,
    stopVoiceRecording,
    cancelVoiceRecording,
    handleVoiceError,
    closeError,
  } = useComposerState(currentPersonaId);

  const {
    state: voiceState,
    isSupported: isVoiceSupported,
    elapsedTime,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceMessage();

  // Handle voice recording start
  const handleStartVoice = async () => {
    try {
      startVoiceRecording();
      await startRecording();
    } catch (err: any) {
      // Handle permission errors
      if (err.message === "MIC_PERMISSION_DENIED") {
        handleVoiceError(
          "Microphone access denied. Please enable microphone permissions in your browser settings and reload the page."
        );
      } else {
        handleVoiceError(
          "Microphone unavailable. Please check your device and browser settings."
        );
      }
    }
  };

  // Handle voice recording stop
  const handleStopVoice = async () => {
    try {
      const voiceData = await stopRecording();
      stopVoiceRecording();
      
      // Send voice message with locked persona
      onSendVoiceMessage(voiceData, composerState.lockedPersonaId || currentPersonaId);
    } catch (err: any) {
      devError("Failed to stop recording:", err);
      cancelVoiceRecording();
      cancelRecording();
    }
  };

  // Handle voice recording cancel
  const handleCancelVoice = () => {
    cancelVoiceRecording();
    cancelRecording();
  };

  // Handle text message send
  const handleSendText = () => {
    if (!textContent.trim()) return;
    
    onSendTextMessage(textContent);
    setTextContent("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [textContent]);

  // Format elapsed time
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Voice Error Mode
  if (composerState.mode === "voice_error") {
    return (
      <div className="flex items-center gap-3 px-4 py-4 bg-red-50 border-t border-red-200">
        <AlertCircle className="size-5 text-red-600 flex-shrink-0" />
        <p className="text-sm text-red-900 flex-1">{composerState.error}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={closeError}
          className="text-red-700 hover:text-red-900 hover:bg-red-100"
        >
          Close
        </Button>
      </div>
    );
  }

  // Voice Recording Mode
  if (composerState.mode === "voice_recording") {
    return (
      <div className="flex items-center gap-4 px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200">
        {/* Recording indicator */}
        <div className="flex items-center gap-3">
          <div className="relative flex size-12">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-12 bg-red-500 items-center justify-center">
              <Mic className="size-6 text-white" />
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">Recording...</span>
            <span className="text-xs text-gray-600">{formatTime(elapsedTime)}</span>
          </div>
        </div>

        {/* Waveform visualization */}
        <div className="flex items-center gap-1 flex-1">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-blue-500 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 24 + 8}px`,
                animationDelay: `${i * 80}ms`,
                animationDuration: `${Math.random() * 600 + 400}ms`,
              }}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="default"
            onClick={handleStopVoice}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={voiceState !== "recording"}
          >
            <Square className="size-4 mr-2" />
            {voiceState === "processing" ? "Processing..." : voiceState === "transcribing" ? "Transcribing..." : "Stop"}
          </Button>
          <Button
            variant="ghost"
            size="default"
            onClick={handleCancelVoice}
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            disabled={voiceState !== "recording"}
          >
            <X className="size-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Text Mode (Default)
  return (
    <div className="flex items-end gap-2 px-4 py-4 bg-white border-t border-gray-200">
      <Button
        variant="ghost"
        size="icon"
        onClick={onAttachFile}
        disabled={disabled}
        className="flex-shrink-0 text-gray-500 hover:text-gray-700"
      >
        <Paperclip className="size-5" />
      </Button>

      <Textarea
        ref={textareaRef}
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendText();
          }
        }}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 min-h-[40px] max-h-[120px] resize-none"
        rows={1}
      />

      {isVoiceSupported && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleStartVoice}
          disabled={disabled}
          className="flex-shrink-0 text-gray-500 hover:text-gray-700"
        >
          <Mic className="size-5" />
        </Button>
      )}

      <Button
        variant="default"
        size="icon"
        onClick={handleSendText}
        disabled={disabled || !textContent.trim()}
        className="flex-shrink-0"
      >
        <Send className="size-5" />
      </Button>
    </div>
  );
}