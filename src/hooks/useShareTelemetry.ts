/**
 * Hook: Share Telemetry
 *
 * Captures share-flow analytics events in memory.
 * In production these would be flushed to an analytics backend;
 * in dev they are logged to the console when __DEV_LOG__ is true.
 *
 * Also tracks elapsed time from modal open → submit/cancel.
 */

import { useCallback, useRef } from "react";
import type {
  ShareTelemetryEvent,
  ShareTelemetryEntry,
} from "@/domain/message/share.types";

const __DEV_LOG__ = false;

export function useShareTelemetry() {
  const log = useRef<ShareTelemetryEntry[]>([]);
  const openedAtRef = useRef<number | null>(null);

  const track = useCallback(
    (event: ShareTelemetryEvent, metadata?: Record<string, unknown>) => {
      // Track open timestamp for duration calculation
      if (event === "share_modal_opened") {
        openedAtRef.current = Date.now();
      }

      // Auto-inject durationMs on terminal events (submit, cancel, validation fail)
      const enriched = { ...metadata };
      if (
        (event === "share_submitted" || event === "share_cancelled" || event === "share_validation_failed") &&
        openedAtRef.current !== null
      ) {
        enriched.durationMs = Date.now() - openedAtRef.current;
      }

      // Reset timer on terminal events
      if (event === "share_submitted" || event === "share_cancelled") {
        openedAtRef.current = null;
      }

      const entry: ShareTelemetryEntry = {
        event,
        timestamp: new Date(),
        metadata: Object.keys(enriched).length > 0 ? enriched : undefined,
      };
      log.current.push(entry);
      if (__DEV_LOG__) {
        console.log("[share-telemetry]", event, enriched);
      }
    },
    []
  );

  /** Return a snapshot of the log (mainly for tests / debug panel). */
  const getLog = useCallback(() => [...log.current], []);

  /** Clear the log (e.g. on logout or session reset). */
  const clearLog = useCallback(() => { log.current = []; }, []);

  return { track, getLog, clearLog };
}