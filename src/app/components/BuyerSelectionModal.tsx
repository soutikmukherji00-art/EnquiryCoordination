/**
 * Buyer Selection Modal
 * 
 * Allows sharing messages to multiple buyer DM channels
 * Now uses the generic MultiSelectModal for consistency
 */

import { Users } from "lucide-react";
import { BuyerDMChannel } from "@/domain/message/buyer-dm.types";
import { MultiSelectModal } from "@/app/components/common";

const __DEV_LOG__ = false;
const devLog = __DEV_LOG__ ? (label: string, data?: any) => console.log(label, data) : (() => {}) as (label: string, data?: any) => void;

interface BuyerSelectionModalProps {
  buyerDMChannels: BuyerDMChannel[];
  onConfirm: (selectedBuyerDMIds: string[]) => void;
  onClose: () => void;
  messagePreview?: string;
}

export function BuyerSelectionModal({
  buyerDMChannels,
  onConfirm,
  onClose,
  messagePreview,
}: BuyerSelectionModalProps) {
  const handleConfirm = (selectedIds: string[]) => {
    devLog('[BuyerSelectionModal] handleConfirm called with:', selectedIds);
    devLog('[BuyerSelectionModal] Selected buyer DMs:', selectedIds.map(id => {
      const dm = buyerDMChannels.find(dm => dm.id === id);
      return dm ? `${dm.buyerName} (${id})` : `Unknown (${id})`;
    }));
    onConfirm(selectedIds);
  };

  return (
    <MultiSelectModal<BuyerDMChannel>
      isOpen={true}
      title="Share to Buyers"
      description="Select one or more buyers to share your message"
      items={buyerDMChannels}
      onConfirm={handleConfirm}
      onClose={onClose}
      searchPlaceholder="Search buyers..."
      confirmButtonText="Share"
      emptyStateMessage="No buyers found"
      emptyStateIcon={<Users className="size-8" />}
      messagePreview={messagePreview}
      getItemId={(dm) => dm.id}
      getItemSearchText={(dm) => `${dm.buyerName} ${dm.bdmName}`}
      renderItem={(dm) => (
        <>
          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900">
              {dm.buyerName}
            </p>
            <p className="text-xs text-gray-500">{dm.bdmName}</p>
          </div>
        </>
      )}
    />
  );
}