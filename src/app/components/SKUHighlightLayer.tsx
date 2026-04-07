/**
 * SKU Highlight Layer
 * 
 * Wraps message text and highlights detected SKUs/POs inline.
 */

import React from "react";
import { MessageAIContext } from "@/domain/message/message-ai-context";

interface SKUHighlightLayerProps {
  text: string;
  aiContext: MessageAIContext | null;
}

export function SKUHighlightLayer({ text, aiContext }: SKUHighlightLayerProps) {
  // If no AI context, render text as-is
  if (!aiContext) {
    return <>{text}</>;
  }
  
  // Collect all highlight ranges
  const highlights: Array<{
    start: number;
    end: number;
    type: "sku" | "po";
    label: string;
  }> = [];
  
  // Add SKU highlights
  if (aiContext.detectedSKUs) {
    aiContext.detectedSKUs.forEach((sku) => {
      if (sku.highlightStart !== undefined && sku.highlightEnd !== undefined) {
        highlights.push({
          start: sku.highlightStart,
          end: sku.highlightEnd,
          type: "sku",
          label: sku.skuName,
        });
      }
    });
  }
  
  // Add PO highlights
  if (aiContext.detectedPO) {
    const po = aiContext.detectedPO;
    if (po.highlightStart !== undefined && po.highlightEnd !== undefined) {
      highlights.push({
        start: po.highlightStart,
        end: po.highlightEnd,
        type: "po",
        label: po.poNumber,
      });
    }
  }
  
  // If no highlights, render text as-is
  if (highlights.length === 0) {
    return <>{text}</>;
  }
  
  // Sort highlights by start position
  highlights.sort((a, b) => a.start - b.start);
  
  // Build segments
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  
  highlights.forEach((highlight, i) => {
    // Add text before highlight
    if (highlight.start > lastIndex) {
      segments.push(
        <span key={`text-${i}`}>
          {text.substring(lastIndex, highlight.start)}
        </span>
      );
    }
    
    // Add highlighted text
    const highlightedText = text.substring(highlight.start, highlight.end);
    
    segments.push(
      <span
        key={`highlight-${i}`}
        className={
          highlight.type === "sku"
            ? "bg-blue-100 text-blue-900 px-0.5 rounded"
            : "bg-purple-100 text-purple-900 px-0.5 rounded"
        }
      >
        {highlightedText}
      </span>
    );
    
    lastIndex = highlight.end;
  });
  
  // Add remaining text
  if (lastIndex < text.length) {
    segments.push(
      <span key="text-end">
        {text.substring(lastIndex)}
      </span>
    );
  }
  
  return <>{segments}</>;
}
