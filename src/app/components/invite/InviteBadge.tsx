/**
 * Invite Badge
 * 
 * Small notification badge showing pending invite count
 */

import React from "react";
import { cn } from "../ui/utils";

interface InviteBadgeProps {
  count: number;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning";
}

export function InviteBadge({ count, className, variant = "warning" }: InviteBadgeProps) {
  if (count === 0) return null;

  const variantClasses = {
    default: "bg-gray-100 text-gray-700",
    primary: "bg-purple-100 text-purple-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold",
        variantClasses[variant],
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
