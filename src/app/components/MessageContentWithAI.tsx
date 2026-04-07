/**
 * Message Content with AI Insights
 * 
 * Wrapper component that adds AI insights to message content.
 * Must be a separate component to use hooks properly.
 */

import React from "react";
import { Message } from "@/domain/message/message.types";
import { useMessageWithHighlights } from "@/app/components/MessageAIWrapper";
import { AIInsightChip } from "@/app/components/AIInsightChip";

const __DEV_LOG__ = false;
const devLog = __DEV_LOG__ ? (label: string, data?: any) => console.log(label, data) : (() => {}) as (label: string, data?: any) => void;

interface MessageContentWithAIProps {
  message: Message;
  currentRole: string;
  renderMessageContent: (content: string, mentions?: string[]) => React.ReactNode;
}

export function MessageContentWithAI({
  message,
  currentRole,
  renderMessageContent,
}: MessageContentWithAIProps) {
  // AI Insights: Detect entities and get highlighted content
  const { aiContext, renderContent } = useMessageWithHighlights(message);
  
  devLog('[MessageContentWithAI] Rendering message:', { id: message.id, aiContext });
  
  return (
    <>
      <div className="text-sm text-gray-700 whitespace-pre-wrap">
        {/* Use AI-enhanced content if available, otherwise use default rendering */}
        {aiContext ? renderContent(message.content) : renderMessageContent(message.content, message.mentions)}
      </div>
      
      {/* AI Insight Chip - appears below message content */}
      {aiContext && (
        <AIInsightChip
          aiContext={aiContext}
          currentRole={currentRole}
        />
      )}
    </>
  );
}