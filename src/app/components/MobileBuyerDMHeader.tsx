/**
 * MobileBuyerDMHeader Component
 * 
 * Custom header for mobile Buyer DM conversations.
 * Layout:
 * - Line 1: Small "Buyer DM" label
 * - Line 2: Buyer name (clickable for profile)
 */

import * as React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface MobileBuyerDMHeaderProps {
  buyerName: string;
  buyerPersonaId?: string;
  bdmName: string;
  onBackClick: () => void;
  onBuyerClick?: () => void;
  onMoreClick?: () => void;
  onDetailsClick?: () => void; // NEW: For opening details view
  onShareClick?: () => void; // NEW: For entering share/selection mode
}

/**
 * MobileBuyerDMHeader
 * 
 * Displays:
 * - Back button
 * - "Buyer DM" label (small)
 * - Buyer name (larger, clickable)
 * - More button
 */
export function MobileBuyerDMHeader({
  buyerName,
  buyerPersonaId,
  bdmName,
  onBackClick,
  onBuyerClick,
  onMoreClick,
  onDetailsClick,
  onShareClick,
}: MobileBuyerDMHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
      {/* Back Button */}
      <button
        onClick={onBackClick}
        className="p-2 -ml-2 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      
      {/* Title Section */}
      <div className="flex-1 min-w-0">
        {/* Line 1: "Buyer DM" label */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-gray-600">
            Buyer DM
          </span>
        </div>
        
        {/* Line 2: Buyer Name */}
        <button
          onClick={onBuyerClick}
          className="text-base font-semibold text-blue-600 hover:text-blue-700 transition-colors text-left truncate w-full"
        >
          {buyerName}
        </button>
      </div>
      
      {/* More Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {onDetailsClick && (
            <DropdownMenuItem onClick={onDetailsClick} className="cursor-pointer">
              Structured Details
            </DropdownMenuItem>
          )}
          {onMoreClick && (
            <DropdownMenuItem onClick={onMoreClick} className="cursor-pointer">
              More Options
            </DropdownMenuItem>
          )}
          {onShareClick && (
            <DropdownMenuItem onClick={onShareClick} className="cursor-pointer">
              Share
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}