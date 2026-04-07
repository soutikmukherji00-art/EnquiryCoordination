/**
 * Quick Action Utilities
 * 
 * Helpers for computing available quick actions based on context
 */

import { QuickAction } from "@/app/components/QuickActionChips";

export interface QuickActionContext {
  currentChannel: string;
  currentRole: string;
  isBuyerDM?: boolean;
  hasMessages: boolean;
  canSendToSellers: boolean;
}

/**
 * Get available quick actions for the current context
 */
export function getAvailableQuickActions(context: QuickActionContext): QuickAction[] {
  const actions: QuickAction[] = [];

  // Action: Request Quote (CM -> Sellers in internal channel)
  if (
    context.currentChannel === "internal" &&
    context.currentRole === "Category Manager" &&
    context.canSendToSellers
  ) {
    actions.push({
      id: "request-quote",
      label: "Request Quote",
      icon: "💬",
      description: "Send quote request to sellers",
    });
  }

  // Action: Normalize Quote (CM normalizing seller quotes)
  if (
    context.currentChannel === "seller" &&
    context.currentRole === "Category Manager" &&
    context.hasMessages
  ) {
    actions.push({
      id: "normalize-quote",
      label: "Normalize Quote",
      icon: "📊",
      description: "Format seller quote into standard template",
    });
  }

  // Action: Share with Buyer (Internal -> Buyer channel)
  if (
    context.currentChannel === "internal" &&
    (context.currentRole === "Category Manager" || context.currentRole === "Business Development Manager")
  ) {
    actions.push({
      id: "share-buyer",
      label: "Share with Buyer",
      icon: "📤",
      description: "Share information to buyer channel",
    });
  }

  // Action: Update Enquiry (Change state)
  if (
    context.currentRole === "Category Manager" ||
    context.currentRole === "Business Development Manager"
  ) {
    actions.push({
      id: "update-state",
      label: "Update State",
      icon: "🔄",
      description: "Change enquiry state (e.g., Quote Shared → Negotiation)",
    });
  }

  return actions;
}

/**
 * Check if quick actions should be shown
 */
export function shouldShowQuickActions(context: QuickActionContext): boolean {
  return getAvailableQuickActions(context).length > 0;
}