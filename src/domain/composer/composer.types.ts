/**
 * Domain: Composer State Machine
 * 
 * Defines composer modes and state transitions.
 */

export type ComposerMode = "text" | "voice_recording" | "voice_error";

export interface ComposerState {
  mode: ComposerMode;
  error?: string;
  recordingStartTime?: number;
  lockedPersonaId?: string;
}

export interface ComposerActions {
  startVoiceRecording: () => void;
  stopVoiceRecording: () => void;
  cancelVoiceRecording: () => void;
  handleVoiceError: (error: string) => void;
  closeError: () => void;
}

// State transition rules
export const COMPOSER_TRANSITIONS: Record<
  ComposerMode,
  Partial<Record<string, ComposerMode>>
> = {
  text: {
    start_recording: "voice_recording",
  },
  voice_recording: {
    stop: "text",
    cancel: "text",
    error: "voice_error",
  },
  voice_error: {
    close: "text",
  },
};
