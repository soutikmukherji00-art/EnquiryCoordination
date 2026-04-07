/**
 * Hook: useVoiceMessage
 * 
 * Orchestrates voice message creation following the message assembly pipeline.
 * This hook coordinates audio recording and transcription services.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useAppStore } from "./useAppStore";
import { VoiceMessageData } from "@/domain/message/message.types";

export type VoiceRecordingState = "idle" | "recording" | "processing" | "transcribing";

export interface UseVoiceMessageResult {
  state: VoiceRecordingState;
  isSupported: boolean;
  error: string | null;
  elapsedTime: number;
  stream: MediaStream | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<VoiceMessageData>;
  cancelRecording: () => void;
}

export function useVoiceMessage(): UseVoiceMessageResult {
  const { voiceService } = useAppStore();
  const [state, setState] = useState<VoiceRecordingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const recognitionPromiseRef = useRef<Promise<string> | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const isSupported = voiceService?.isSupported() ?? false;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, []);

  const updateTimer = useCallback(() => {
    if (state === "recording") {
      setElapsedTime(Date.now() - startTimeRef.current);
      timerRef.current = requestAnimationFrame(updateTimer);
    }
  }, [state]);

  const startRecording = useCallback(async () => {
    if (!voiceService) {
      throw new Error("MIC_UNAVAILABLE");
    }

    try {
      setError(null);
      setElapsedTime(0);
      
      // Check permission first
      const permissionState = await voiceService.checkPermission();
      
      if (permissionState === "denied") {
        throw new Error("MIC_PERMISSION_DENIED");
      }

      if (permissionState === "prompt") {
        const granted = await voiceService.requestPermission();
        if (!granted) {
          throw new Error("MIC_PERMISSION_DENIED");
        }
      }

      // Start recording
      setState("recording");
      startTimeRef.current = Date.now();
      
      await voiceService.startRecording();

      // Get the stream for visualization
      setStream(voiceService.getStream());

      // Start transcription in parallel
      recognitionPromiseRef.current = voiceService.transcribe(() => {
        // No interim results needed per spec
      });

      // Start timer
      timerRef.current = requestAnimationFrame(updateTimer);
    } catch (err: any) {
      setState("idle");
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
      
      // Normalize error messages
      if (err.message?.includes("permission") || err.message === "MIC_PERMISSION_DENIED") {
        throw new Error("MIC_PERMISSION_DENIED");
      }
      throw new Error("MIC_UNAVAILABLE");
    }
  }, [voiceService, updateTimer]);

  const stopRecording = useCallback(async (): Promise<VoiceMessageData> => {
    if (!voiceService) {
      throw new Error("MIC_UNAVAILABLE");
    }

    try {
      // Stop timer
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }

      setState("processing");

      // Stop recording and get audio blob
      const { blob, url, duration } = await voiceService.stopRecording();
      const durationMs = duration * 1000;

      // Check minimum duration (500ms per spec)
      if (durationMs < 500) {
        setState("idle");
        throw new Error("Recording too short (minimum 500ms)");
      }

      // Wait for transcription to complete
      setState("transcribing");
      let transcriptionText = "";
      let transcriptionStatus: "complete" | "partial" | "failed" = "failed";
      
      try {
        if (recognitionPromiseRef.current) {
          transcriptionText = await recognitionPromiseRef.current;
          transcriptionStatus = transcriptionText ? "complete" : "failed";
        }
      } catch (transcriptionError) {
        console.error("Transcription error:", transcriptionError);
        transcriptionStatus = "failed";
      }

      voiceService.stopTranscription();
      setState("idle");
      setElapsedTime(0);
      setStream(null);

      // Assemble voice message data
      return {
        blob,
        url,
        durationMs,
        transcription: {
          text: transcriptionText,
          status: transcriptionStatus,
        },
      };
    } catch (err: any) {
      setState("idle");
      setElapsedTime(0);
      throw err;
    }
  }, [voiceService]);

  const cancelRecording = useCallback(() => {
    if (!voiceService) return;

    // Stop timer
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }

    voiceService.cancelRecording();
    voiceService.stopTranscription();
    setState("idle");
    setElapsedTime(0);
    setError(null);
    setStream(null);
  }, [voiceService]);

  return {
    state,
    isSupported,
    error,
    elapsedTime,
    stream,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}