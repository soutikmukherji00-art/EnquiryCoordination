/**
 * SellerDMHeader Component
 * 
 * Header for CM-Seller direct message conversations
 * Shows seller name and CM name
 */

import { Store } from "lucide-react";
import { PersonaHoverTrigger } from "@/app/components/PersonaHoverTrigger";

interface SellerDMHeaderProps {
  sellerName: string;
  sellerId?: string; // Add seller ID for hover card
  cmName: string;
  currentRole: string;
}

export function SellerDMHeader({
  sellerName,
  sellerId,
  cmName,
  currentRole,
}: SellerDMHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-orange-100 flex items-center justify-center">
          <Store className="size-5 text-orange-600" />
        </div>
        <div>
          {sellerId ? (
            <PersonaHoverTrigger 
              personaId={sellerId}
              context={{ location: 'seller-dm-header' }}
              side="bottom"
              align="start"
            >
              <h2 className="font-semibold text-lg text-gray-900">{sellerName}</h2>
            </PersonaHoverTrigger>
          ) : (
            <h2 className="font-semibold text-lg text-gray-900">{sellerName}</h2>
          )}
        </div>
      </div>
    </div>
  );
}