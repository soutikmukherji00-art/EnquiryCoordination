/**
 * Component: AudioMessage
 * 
 * Displays audio player with transcription below (can appear asynchronously).
 * Implements 5-line collapse logic per spec.
 */

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface AudioMessageProps {
  audioUrl: string;
  transcription?: {
    text: string;
    status: "complete" | "partial" | "failed";
  };
  durationMs?: number;
}

export function AudioMessage({ audioUrl, transcription, durationMs }: AudioMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsCollapse, setNeedsCollapse] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Check if transcription exceeds 5 lines
  useEffect(() => {
    if (transcriptRef.current && transcription?.text) {
      const lineHeight = parseInt(window.getComputedStyle(transcriptRef.current).lineHeight);
      const height = transcriptRef.current.scrollHeight;
      const lines = Math.round(height / lineHeight);
      
      setNeedsCollapse(lines > 5);
    }
  }, [transcription?.text]);

  const formatDuration = (ms?: number) => {
    if (!ms) return "0:00";
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
      {/* Audio Player */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500">Voice message</span>
          {durationMs && (
            <span className="text-xs text-gray-400">• {formatDuration(durationMs)}</span>
          )}
        </div>
        <audio 
          controls 
          src={audioUrl}
          className="w-full h-10"
          controlsList="nodownload"
        >
          Your browser does not support the audio element.
        </audio>
      </div>

      {/* Transcription section */}
      {transcription && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-200">
          {transcription.status === "failed" && (
            <div className="text-sm text-gray-500 italic">
              Transcription unavailable
            </div>
          )}

          {transcription.status === "partial" && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="size-3 animate-spin" />
              <span>Transcribing...</span>
            </div>
          )}

          {transcription.status === "complete" && transcription.text && (
            <>
              <div
                ref={transcriptRef}
                className={`text-sm text-gray-700 whitespace-pre-wrap ${
                  !isExpanded && needsCollapse ? "line-clamp-5" : ""
                }`}
              >
                {transcription.text}
              </div>
              
              {needsCollapse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 h-auto py-1 px-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="size-3 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="size-3 mr-1" />
                      Show more
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}