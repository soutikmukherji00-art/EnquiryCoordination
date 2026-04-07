/**
 * Seller Selection Modal
 * 
 * Allows creating seller channels for multiple sellers
 * Now uses the generic MultiSelectModal for consistency
 */

import { Store } from "lucide-react";
import { MultiSelectModal } from "@/app/components/common";
import { AvatarWithStatus } from "@/app/components/AvatarWithStatus";

const __DEV_LOG__ = false;
const devLog = __DEV_LOG__ ? (label: string, data?: any) => console.log(label, data) : (() => {}) as (label: string, data?: any) => void;

// Mock seller type - in a real app, this would come from a domain type
export interface Seller {
  id: string;
  name: string;
  cmName?: string;
  isActive?: boolean;
  avgResponseTimeMinutes?: number;
}

interface SellerSelectionModalProps {
  isOpen: boolean;
  sellers: Seller[];
  selectedEnquiryId: string | null;
  onConfirm: (selectedSellerIds: string[]) => void;
  onClose: () => void;
}

/**
 * Get initials from seller name
 */
function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Format response time for display
 */
function formatResponseTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  return `${hours} hr${hours !== 1 ? 's' : ''}`;
}

export function SellerSelectionModal({
  isOpen,
  sellers,
  selectedEnquiryId,
  onConfirm,
  onClose,
}: SellerSelectionModalProps) {
  const handleConfirm = (selectedIds: string[]) => {
    devLog('[SellerSelectionModal] handleConfirm called with:', selectedIds);
    devLog('[SellerSelectionModal] Selected sellers:', selectedIds.map(id => {
      const seller = sellers.find(s => s.id === id);
      return seller ? `${seller.name} (${id})` : `Unknown (${id})`;
    }));
    onConfirm(selectedIds);
  };

  return (
    <MultiSelectModal<Seller>
      isOpen={isOpen}
      title="Create Seller Channel"
      description="Select one or more sellers to create channels"
      items={sellers}
      onConfirm={handleConfirm}
      onClose={onClose}
      searchPlaceholder="Search sellers..."
      confirmButtonText="Create Channels"
      emptyStateMessage={sellers.length === 0 ? "All sellers already have channels" : "No sellers found"}
      emptyStateIcon={<Store className="size-8" />}
      getItemId={(seller) => seller.id}
      getItemSearchText={(seller) => `${seller.name} ${seller.cmName || ''}`}
      renderItem={(seller) => (
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar with status indicator */}
          <AvatarWithStatus
            initials={getInitials(seller.name)}
            isActive={seller.isActive !== undefined ? seller.isActive : true}
            avatarClassName="size-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-medium"
            showStatus={seller.isActive !== undefined}
          />
          
          {/* Seller info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">
              {seller.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {/* Active/Inactive status text */}
              {seller.isActive !== undefined && (
                <span className={`text-xs font-medium ${seller.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                  {seller.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              )}
              {/* Response time */}
              {seller.avgResponseTimeMinutes !== undefined && (
                <>
                  {seller.isActive !== undefined && <span className="text-gray-300">•</span>}
                  <span className="text-xs text-gray-500">
                    Avg. response: {formatResponseTime(seller.avgResponseTimeMinutes)}
                  </span>
                </>
              )}
            </div>
            {seller.cmName && (
              <p className="text-xs text-gray-500 mt-0.5">{seller.cmName}</p>
            )}
          </div>
        </div>
      )}
    />
  );
}