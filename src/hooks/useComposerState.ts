/**
 * Hook: useComposerState
 * 
 * Manages composer state machine and mode transitions.
 */

import { useState, useCallback } from "react";
import { ComposerMode, ComposerState } from "@/domain/composer/composer.types";

export function useComposerState(currentPersonaId: string) {
  const [state, setState] = useState<ComposerState>({
    mode: "text" as ComposerMode,
  });

  const startVoiceRecording = useCallback(() => {
    setState({
      mode: "voice_recording",
      recordingStartTime: Date.now(),
      lockedPersonaId: currentPersonaId, // Lock persona at recording start
    });
  }, [currentPersonaId]);

  const stopVoiceRecording = useCallback(() => {
    setState({
      mode: "text",
    });
  }, []);

  const cancelVoiceRecording = useCallback(() => {
    setState({
      mode: "text",
    });
  }, []);

  const handleVoiceError = useCallback((error: string) => {
    setState({
      mode: "voice_error",
      error,
    });
  }, []);

  const closeError = useCallback(() => {
    setState({
      mode: "text",
    });
  }, []);

  return {
    composerState: state,
    startVoiceRecording,
    stopVoiceRecording,
    cancelVoiceRecording,
    handleVoiceError,
    closeError,
  };
}
