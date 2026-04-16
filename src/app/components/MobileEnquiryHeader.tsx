/**
 * MobileEnquiryHeader Component
 * 
 * Custom header for mobile enquiry conversations.
 * Layout:
 * - Line 1: Small enquiry ID (#ENQ-2401) + Badge (RM Approved)
 * - Line 2: Buyer name (clickable for profile)
 */

import * as React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { getEnquiryStatusBadgeSurfaceClasses } from '@/app/enquiry/enquiryStatusPresentation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface MobileEnquiryHeaderProps {
  enquiryId: string;
  buyerName: string;
  buyerPersonaId?: string;
  state: string;
  onBackClick: () => void;
  onBuyerClick?: () => void;
  onMoreClick?: () => void;
  onDetailsClick?: () => void; // NEW: For opening details view
  onShareClick?: () => void; // NEW: For entering share/selection mode
}

/**
 * MobileEnquiryHeader
 * 
 * Displays:
 * - Back button
 * - Enquiry ID (small) + State badge
 * - Buyer name (larger, clickable)
 * - More button
 */
export function MobileEnquiryHeader({
  enquiryId,
  buyerName,
  buyerPersonaId,
  state,
  onBackClick,
  onBuyerClick,
  onMoreClick,
  onDetailsClick,
  onShareClick,
}: MobileEnquiryHeaderProps) {
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
        {/* Line 1: Enquiry ID + Badge */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-gray-600">
            #{enquiryId}
          </span>
          <span
            className={cn(
              'inline-flex items-center rounded-full border text-xs px-2 py-0.5 h-5 font-medium',
              getEnquiryStatusBadgeSurfaceClasses(state),
            )}
          >
            {state}
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