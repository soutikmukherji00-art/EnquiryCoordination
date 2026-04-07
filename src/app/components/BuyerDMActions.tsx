/**
 * BuyerDMActions Component
 * 
 * Shows action buttons for BDMs in buyer DM conversations:
 * - Share to existing enquiry
 * - Create new enquiry from selected messages
 */

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Plus } from "lucide-react";
import { AppleShareIcon } from "@/app/components/icons/AppleShareIcon";

interface BuyerDMActionsProps {
  selectedMessageCount: number;
  onShareToEnquiry: () => void;
  onCreateEnquiry: () => void;
  disabled?: boolean;
}

export function BuyerDMActions({
  selectedMessageCount,
  onShareToEnquiry,
  onCreateEnquiry,
  disabled = false,
}: BuyerDMActionsProps) {
  if (selectedMessageCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-200">
      <span className="text-sm text-gray-700 mr-2">
        {selectedMessageCount} message{selectedMessageCount > 1 ? "s" : ""} selected
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onShareToEnquiry}
        disabled={disabled}
        className="gap-2"
      >
        <AppleShareIcon className="size-4" />
        Share to Enquiry
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={onCreateEnquiry}
        disabled={disabled}
        className="gap-2"
      >
        <Plus className="size-4" />
        Create New Enquiry
      </Button>
    </div>
  );
}