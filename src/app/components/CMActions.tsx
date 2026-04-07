/**
 * CMActions Component
 * 
 * Shows action buttons for CMs in enquiry conversations:
 * - Share to seller (creates or uses existing seller DM)
 */

import { Button } from "@/app/components/ui/button";
import { AppleShareIcon } from "@/app/components/icons/AppleShareIcon";

interface CMActionsProps {
  selectedMessageCount: number;
  onShareToSeller: () => void;
  disabled?: boolean;
}

export function CMActions({
  selectedMessageCount,
  onShareToSeller,
  disabled = false,
}: CMActionsProps) {
  if (selectedMessageCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-200">
      <span className="text-sm text-gray-700 mr-2">
        {selectedMessageCount} message{selectedMessageCount > 1 ? "s" : ""} selected
      </span>
      <Button
        variant="default"
        size="sm"
        onClick={onShareToSeller}
        disabled={disabled}
        className="gap-2"
      >
        <AppleShareIcon className="size-4" />
        Share to Seller
      </Button>
    </div>
  );
}