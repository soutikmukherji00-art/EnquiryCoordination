/**
 * InlineDeliveryWidget Component
 * 
 * AI-like conversational widget that appears inline in the conversation
 * when BDM shares information to a new thread. Asks for delivery information
 * and then animates to the structured data panel.
 */

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { Sparkles, MapPin, Send, ArrowRight } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";

interface InlineDeliveryWidgetProps {
  /** Unique ID for this widget instance */
  widgetId: string;
  /** Callback when user submits delivery location */
  onSubmit: (location: string) => void;
  /** Callback when widget is animating out */
  onAnimateOut?: () => void;
  /** Whether widget should start collapsed in structured panel */
  inStructuredPanel?: boolean;
}

export function InlineDeliveryWidget({
  widgetId,
  onSubmit,
  onAnimateOut,
  inStructuredPanel = false,
}: InlineDeliveryWidgetProps) {
  const [location, setLocation] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);

  const handleSubmit = () => {
    if (!location.trim()) return;
    
    setIsSubmitted(true);
    
    // Calculate target position (approximate position in structured panel)
    // In a real implementation, this would calculate the actual DOM position
    const structuredPanel = document.querySelector('[data-structured-panel]');
    if (structuredPanel && widgetRef.current) {
      const widgetRect = widgetRef.current.getBoundingClientRect();
      const panelRect = structuredPanel.getBoundingClientRect();
      
      setTargetPosition({
        x: panelRect.left - widgetRect.left + 24, // 24px padding
        y: panelRect.top - widgetRect.top + 200, // Approximate position below AI summary
      });
    }

    // Trigger animation
    setTimeout(() => {
      setIsAnimating(true);
      onAnimateOut?.();
      
      // Complete the submission after animation
      setTimeout(() => {
        onSubmit(location);
      }, 600);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Structured panel collapsed view
  if (inStructuredPanel) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-[#5249D2]" />
            <span className="font-medium text-sm text-gray-900">Delivery Location</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-[#5249D2]" />
            <span className="text-xs text-gray-500">AI Captured</span>
          </div>
        </div>
        <div className="px-4 pb-4">
          <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2">
            <p className="text-sm text-gray-900">{location}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Inline conversation view with animation
  return (
    <motion.div
      ref={widgetRef}
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={
        isAnimating && targetPosition
          ? {
              opacity: 0,
              scale: 0.8,
              x: targetPosition.x,
              y: targetPosition.y,
              transition: {
                duration: 0.6,
                ease: [0.32, 0.72, 0, 1], // Custom easing for smooth transition
              },
            }
          : { opacity: 1, scale: 1, y: 0 }
      }
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative bg-gradient-to-br from-[#f8f7fe] to-white rounded-xl border-2 border-[#5249D2]/20 shadow-sm overflow-hidden",
        "mb-4 mx-4"
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#5249D2]/5 to-transparent pointer-events-none" />
      
      <div className="relative p-5">
        {/* AI Agent Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0">
            <div className="size-9 rounded-full bg-gradient-to-br from-[#5249D2] to-[#6b5dd6] flex items-center justify-center shadow-sm">
              <Sparkles className="size-4.5 text-white" />
            </div>
          </div>
          <div className="flex-1 pt-0.5">
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[15px] text-gray-900 leading-relaxed"
            >
              {isSubmitted ? (
                <span className="flex items-center gap-2">
                  <span>Perfect! I've captured the delivery location.</span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 500, damping: 15 }}
                  >
                    ✓
                  </motion.span>
                </span>
              ) : (
                "I noticed this is a new enquiry. Where should we deliver this order?"
              )}
            </motion.p>
          </div>
        </div>

        {/* Input Section */}
        {!isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., Mumbai, Maharashtra"
                  className="pl-10 bg-white border-gray-200 focus:border-[#5249D2] focus:ring-[#5249D2]/20 transition-all"
                  autoFocus
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!location.trim()}
                className="bg-[#5249D2] hover:bg-[#4039ad] text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                size="default"
              >
                <Send className="size-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 pl-1">
              <span className="inline-block size-1 rounded-full bg-gray-400" />
              Press Enter to submit
            </p>
          </motion.div>
        )}

        {/* Submitted state with animation hint */}
        {isSubmitted && !isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 text-sm text-gray-600 pl-12"
          >
            <ArrowRight className="size-4 text-[#5249D2] animate-pulse" />
            <span>Moving to structured data...</span>
          </motion.div>
        )}
      </div>

      {/* Animated border pulse effect */}
      {!isSubmitted && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-[#5249D2]/30 pointer-events-none"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.div>
  );
}

/**
 * Compact version for display in structured panel
 */
export function DeliveryDataField({ location }: { location: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white rounded-lg border border-gray-200"
    >
      <div className="w-full px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-[#5249D2]" />
          <span className="font-medium text-sm text-gray-900">Delivery Location</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-[#5249D2]" />
          <span className="text-xs text-gray-500">AI Captured</span>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2.5">
          <p className="text-sm text-gray-900">{location}</p>
        </div>
      </div>
    </motion.div>
  );
}
