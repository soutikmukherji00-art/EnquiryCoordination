/**
 * Component: VoiceRecorder
 * 
 * UI for recording voice messages with live transcription preview.
 */

import { Mic, Square, X, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { cn } from "@/app/components/ui/utils";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

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
    permissionState,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecording(onRecordingComplete);

  // Show error alert if there's an error
  if (error) {
    return (
      <div className="w-full">
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="size-4" />
          <AlertDescription className="ml-2">
            <div className="font-medium mb-1">{error}</div>
            {error.includes("permission") && (
              <div className="text-xs text-red-700 mt-2 space-y-2">
                <div>
                  <strong>How to enable microphone access:</strong>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Chrome/Edge:</strong> Look for a camera/microphone icon in the address bar → Click it → Select "Always allow" → Click "Done"</li>
                  <li><strong>Firefox:</strong> Look for a microphone icon in the address bar → Click the X next to "Blocked Temporarily" → Reload the page</li>
                  <li><strong>Safari:</strong> Safari menu → Settings for This Website → Microphone → Allow</li>
                </ul>
                <div className="mt-2 p-2 bg-red-100 rounded text-red-900">
                  <strong>After changing settings:</strong> You may need to reload this page for changes to take effect.
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.location.reload()}
          title="Reload page to retry"
          className="size-9 hover:bg-blue-50 hover:text-blue-600"
        >
          <Mic className="size-5" />
        </Button>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        title="Voice recording not supported in this browser"
        className="size-9"
      >
        <Mic className="size-5 text-gray-300" />
      </Button>
    );
  }

  if (recordingState === "idle") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={startRecording}
        disabled={disabled}
        title="Record voice message"
        className="size-9 hover:bg-blue-50 hover:text-blue-600"
      >
        <Mic className="size-5" />
      </Button>
    );
  }

  if (recordingState === "recording") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2">
          {/* Pulsing red dot */}
          <div className="relative flex size-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-3 bg-red-500"></span>
          </div>
          <span className="text-sm font-medium text-red-900">Recording...</span>
        </div>

        {/* Audio waveform visualization instead of transcript */}
        <div className="ml-4 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-red-500 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 16 + 8}px`,
                animationDelay: `${i * 100}ms`,
                animationDuration: `${Math.random() * 500 + 500}ms`,
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={stopRecording}
            className="h-8 px-3 text-red-700 hover:text-red-900 hover:bg-red-100"
          >
            <Square className="size-4 mr-1" />
            Stop
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={cancelRecording}
            className="h-8 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <X className="size-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (recordingState === "processing" || recordingState === "transcribing") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="size-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-blue-900">
            {recordingState === "processing" ? "Processing..." : "Transcribing..."}
          </span>
        </div>

        {partialTranscript && recordingState === "transcribing" && (
          <div className="ml-4 text-xs text-gray-600 italic max-w-md truncate">
            {partialTranscript}
          </div>
        )}
      </div>
    );
  }

  return null;
}