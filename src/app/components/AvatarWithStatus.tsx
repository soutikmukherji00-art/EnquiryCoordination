/**
 * Avatar With Status Component
 * 
 * Displays an avatar with an online status indicator
 * - Green filled circle for active users
 * - Gray outlined circle for inactive users
 */

import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { cn } from "@/app/components/ui/utils";

interface AvatarWithStatusProps {
  initials: string;
  isActive?: boolean;
  className?: string;
  avatarClassName?: string;
  statusSize?: "sm" | "md" | "lg";
  showStatus?: boolean; // Option to hide status indicator
}

export function AvatarWithStatus({
  initials,
  isActive = true,
  className,
  avatarClassName,
  statusSize = "md",
  showStatus = true,
}: AvatarWithStatusProps) {
  const statusSizeClasses = {
    sm: "size-2",
    md: "size-2.5",
    lg: "size-3",
  };

  const statusPositionClasses = {
    sm: "bottom-0 right-0",
    md: "bottom-0 right-0",
    lg: "bottom-0.5 right-0.5",
  };

  return (
    <div className={cn("relative inline-block flex-shrink-0", className)}>
      <Avatar className={cn("size-8", avatarClassName)}>
        <AvatarFallback className={avatarClassName || "bg-blue-100 text-blue-700 text-xs"}>
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {/* Status indicator */}
      {showStatus && (
        <div
          className={cn(
            "absolute rounded-full border-2 border-white",
            statusSizeClasses[statusSize],
            statusPositionClasses[statusSize],
            isActive
              ? "bg-green-500"
              : "bg-white border-gray-400"
          )}
        />
      )}
    </div>
  );
}