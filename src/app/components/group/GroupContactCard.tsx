/**
 * Shared Component: Group Contact Card
 * 
 * Reusable card for displaying buyers/sellers in group creation
 */

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/app/components/ui/utils";

export interface GroupContactCardProps {
  name: string;
  subtitle?: string; // Phone, company, etc.
  description?: string; // Additional info line (e.g., phone number)
  avatarText: string; // Initials
  avatarColor?: string;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  badge?: React.ReactNode; // Optional badge (e.g., "Primary Contact")
}

export function GroupContactCard({
  name,
  subtitle,
  description,
  avatarText,
  avatarColor = "bg-blue-100 text-blue-600",
  isSelected,
  onToggle,
  disabled = false,
  badge,
}: GroupContactCardProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
        isSelected
          ? "border-blue-600 bg-blue-50"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
        avatarColor
      )}>
        {avatarText}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 truncate">{name}</p>
          {badge}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 truncate">{subtitle}</p>
        )}
        {description && (
          <p className="text-xs text-gray-400 truncate">{description}</p>
        )}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </button>
  );
}