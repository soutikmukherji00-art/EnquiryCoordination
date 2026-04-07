/**
 * Message AI Wrapper
 * 
 * Wraps message rendering and adds AI insight layer.
 * Zero changes to message core component.
 * 
 * @version 1.0.1
 */

import React, { useMemo } from "react";
import { Message } from "@/domain/message/message.types";
import { detectEntitiesInMessage } from "@/domain/message/message-ai-context";
import { AIInsightChip } from "./AIInsightChip";
import { SKUHighlightLayer } from "./SKUHighlightLayer";

interface MessageAIWrapperProps {
  message: Message;
  currentRole: string;
  children: React.ReactNode; // Original message content
}

export function MessageAIWrapper({
  message,
  currentRole,
  children,
}: MessageAIWrapperProps) {
  // Passive entity detection - runs after render
  const aiContext = useMemo(() => {
    // Only detect on text messages
    if (!message.content || typeof message.content !== "string") {
      return null;
    }
    
    return detectEntitiesInMessage(message.content);
  }, [message.content]);
  
  return (
    <div className="message-with-ai">
      {/* Original message content */}
      {children}
      
      {/* AI Insight Chip (appears below message) */}
      {aiContext && (
        <AIInsightChip
          aiContext={aiContext}
          currentRole={currentRole}
        />
      )}
    </div>
  );
}

/**
 * Hook to get AI-enhanced message content
 * 
 * Returns the message content with SKU/PO highlights applied.
 */
export function useMessageWithHighlights(message: Message) {
  const aiContext = useMemo(() => {
    if (!message.content || typeof message.content !== "string") {
      return null;
    }
    
    return detectEntitiesInMessage(message.content);
  }, [message.content]);
  
  return {
    aiContext,
    renderContent: (text: string) => (
      <SKUHighlightLayer text={text} aiContext={aiContext} />
    ),
  };
}