/**
 * Component: VoiceRecorder
 *
 * UI for recording voice messages with live transcription preview.
 */

import { useMemo } from "react";
import { AlertCircle, Loader2, Mic, Square, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string, audioBlob: Blob, transcription: string, duration: number) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onRecordingComplete, disabled }: VoiceRecorderProps) {
  const {
    recordingState,
    isSupported,
    partialTranscript,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecording(onRecordingComplete);

  const statusText = useMemo(() => {
    if (recordingState === "processing") return "Processing audio";
    if (recordingState === "transcribing") return "Transcribing audio";
    if (recordingState === "recording") return "Recording audio";
    return "Record audio";
  }, [recordingState]);

  if (error) {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="ml-2">
            <div className="mb-1 font-medium">{error}</div>
            {error.includes("permission") && (
              <div className="mt-2 space-y-2 text-xs text-red-700">
                <div>
                  <strong>How to enable microphone access:</strong>
                </div>
                <ul className="list-inside list-disc space-y-1">
                  <li>Chrome/Edge: allow microphone access from the address bar and reload.</li>
                  <li>Firefox: clear the blocked permission from the address bar and reload.</li>
                  <li>Safari: allow microphone access in this website's settings.</li>
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          title="Reload page to retry"
          className="w-full justify-start"
        >
          <Mic className="size-4" />
          Reload and try again
        </Button>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-500">
        Voice recording is not supported in this browser.
      </div>
    );
  }

  if (recordingState === "idle") {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={startRecording}
        disabled={disabled}
        className="justify-start"
      >
        <Mic className="size-4" />
        {statusText}
      </Button>
    );
  }

  if (recordingState === "recording") {
    return (
      <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex size-3 rounded-full bg-red-500" />
          </span>
          <span className="text-sm font-medium text-gray-900">{statusText}</span>
        </div>

        <div className="ml-2 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-gray-400 animate-pulse"
              style={{
                height: `${Math.random() * 16 + 8}px`,
                animationDelay: `${i * 100}ms`,
                animationDuration: `${Math.random() * 500 + 500}ms`,
              }}
            />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={stopRecording}
          >
            <Square className="mr-1 size-4" />
            Stop
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cancelRecording}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="mr-1 size-4" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (recordingState === "processing" || recordingState === "transcribing") {
    return (
      <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
        <Loader2 className="mt-0.5 size-4 animate-spin text-gray-500" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">{statusText}</p>
          {partialTranscript && recordingState === "transcribing" && (
            <p className="mt-1 truncate text-xs text-gray-500">{partialTranscript}</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}
