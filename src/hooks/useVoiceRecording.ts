/**
 * Hook: useVoiceRecording
 * 
 * Manages voice recording state and operations.
 */

import { useState, useCallback, useRef } from "react";
import { VoiceService } from "@/infrastructure/voice/voice.interface";
import { useAppStore } from "./useAppStore";

export type RecordingState = "idle" | "recording" | "processing" | "transcribing";

export interface UseVoiceRecordingResult {
  // State
  recordingState: RecordingState;
  isSupported: boolean;
  partialTranscript: string;
  error: string | null;
  permissionState: 'granted' | 'denied' | 'prompt' | 'checking' | null;
  stream: MediaStream | null;

  // Actions
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  checkAndRequestPermission: () => Promise<boolean>;
}

export function useVoiceRecording(
  onComplete: (audioUrl: string, audioBlob: Blob, transcription: string, duration: number) => void
): UseVoiceRecordingResult {
  const { voiceService } = useAppStore();
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'checking' | null>(null);
  const recognitionPromiseRef = useRef<Promise<string> | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const isSupported = voiceService?.isSupported() ?? false;

  const checkAndRequestPermission = useCallback(async (): Promise<boolean> => {
    if (!voiceService) {
      setError("Voice service not available");
      return false;
    }

    try {
      setPermissionState('checking');
      setError(null);

      // First check current permission state
      const currentState = await voiceService.checkPermission();
      
      if (currentState === 'granted') {
        setPermissionState('granted');
        return true;
      }

      if (currentState === 'denied') {
        setPermissionState('denied');
        setError("Microphone permission was previously denied. Please enable it in your browser settings.");
        return false;
      }

      // If prompt state, request permission
      const granted = await voiceService.requestPermission();
      setPermissionState(granted ? 'granted' : 'denied');
      
      if (!granted) {
        setError("Microphone permission denied. Please allow microphone access in your browser settings.");
      }
      
      return granted;
    } catch (err: any) {
      console.error('Permission check error:', err);
      setPermissionState('denied');
      setError(err.message || "Failed to check microphone permission");
      return false;
    }
  }, [voiceService]);

  const startRecording = useCallback(async () => {
    if (!voiceService) {
      setError("Voice service not available");
      return;
    }

    try {
      setError(null);
      setPartialTranscript("");
      
      // Check/request permission first
      const hasPermission = await checkAndRequestPermission();
      if (!hasPermission) {
        return; // Error already set by checkAndRequestPermission
      }

      setRecordingState("recording");
      await voiceService.startRecording();

      // Get the stream for visualization
      setStream(voiceService.getStream());

      // Start transcription (it will run in parallel with recording)
      recognitionPromiseRef.current = voiceService.transcribe((partial) => {
        // DON'T show partial transcript during recording - will show waveforms instead
        // setPartialTranscript(partial);
      });
    } catch (err: any) {
      setError(err.message || "Failed to start recording");
      setRecordingState("idle");
      console.error("Recording error:", err);
    }
  }, [voiceService, checkAndRequestPermission]);

  const stopRecording = useCallback(async () => {
    if (!voiceService) return;

    try {
      setRecordingState("processing");

      // Stop recording and get audio blob
      const { blob, url, duration } = await voiceService.stopRecording();

      // Wait for transcription to complete before sending
      setRecordingState("transcribing");
      let transcription = "";
      
      try {
        if (recognitionPromiseRef.current) {
          transcription = await recognitionPromiseRef.current;
        }
      } catch (transcriptionError) {
        console.error("Transcription error:", transcriptionError);
        // Continue with empty transcription if it fails
      }

      voiceService.stopTranscription();
      setRecordingState("idle");
      setPartialTranscript("");
      setStream(null);

      // Send message once with complete data
      onComplete(url, blob, transcription, duration);
    } catch (err: any) {
      setError(err.message || "Failed to stop recording");
      setRecordingState("idle");
      console.error("Stop recording error:", err);
    }
  }, [voiceService, onComplete]);

  const cancelRecording = useCallback(() => {
    if (!voiceService) return;

    voiceService.cancelRecording();
    voiceService.stopTranscription();
    setRecordingState("idle");
    setPartialTranscript("");
    setError(null);
    setStream(null);
  }, [voiceService]);

  return {
    recordingState,
    isSupported,
    partialTranscript,
    error,
    permissionState,
    stream,
    startRecording,
    stopRecording,
    cancelRecording,
    checkAndRequestPermission,
  };
}