/**
 * Reusable Avatar Stack Component
 * 
 * Displays a horizontal stack of avatars with overflow indicator and optional add button
 */

import { Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";

export interface AvatarMember {
  id: string;
  name: string;
  initials?: string;
  color?: string;
}

interface AvatarStackProps {
  members: AvatarMember[];
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
  showAddButton?: boolean;
  onAddClick?: () => void;
  onMemberClick?: (memberId: string) => void;
  className?: string;
}

const sizeClasses = {
  sm: "size-6 text-xs",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
};

const addButtonSizeClasses = {
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
};

function getInitials(name: string, providedInitials?: string): string {
  if (providedInitials) return providedInitials;
  
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function AvatarStack({
  members,
  maxVisible = 5,
  size = "md",
  showAddButton = false,
  onAddClick,
  onMemberClick,
  className = "",
}: AvatarStackProps) {
  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;
  const sizeClass = sizeClasses[size];
  const addButtonSize = addButtonSizeClasses[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex -space-x-2">
        {visibleMembers.map((member) => (
          <Avatar
            key={member.id}
            className={`${sizeClass} border-2 border-white ${
              onMemberClick ? "cursor-pointer hover:z-10" : ""
            }`}
            onClick={() => onMemberClick?.(member.id)}
          >
            <AvatarFallback 
              className={member.color || "bg-blue-500 text-white"}
            >
              {getInitials(member.name, member.initials)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      {remainingCount > 0 && (
        <span className="text-sm text-gray-500">
          +{remainingCount}
        </span>
      )}

      {showAddButton && (
        <button
          onClick={onAddClick}
          className={`${addButtonSize} ml-1 flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors`}
          title="Add member"
        >
          <Plus className="size-4 text-gray-500" />
        </button>
      )}
    </div>
  );
}
