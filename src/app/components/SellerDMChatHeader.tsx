/**
 * Seller DM Chat Header
 * 
 * Displays the chat header for a seller DM conversation,
 * showing the CM name and role for both Seller and CM viewpoints.
 */

import { MessageCircle } from "lucide-react";

interface SellerDMChatHeaderProps {
  sellerName?: string;
  cmName: string;
  currentRole?: string;
  role?: string; // Legacy prop name
}

export function SellerDMChatHeader({
  sellerName,
  cmName,
  currentRole,
  role,
}: SellerDMChatHeaderProps) {
  // Determine which name to display based on role
  const displayRole = currentRole || role || "Category Manager";
  const isSeller = displayRole === "Seller";
  const displayName = isSeller ? cmName : (sellerName || cmName);
  const subtitle = isSeller ? "Category Manager" : "Seller";

  return (
    <div className="bg-white border-b px-6 py-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{displayName}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400">Direct Message</span>
        </div>
      </div>
    </div>
  );
}
