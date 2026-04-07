/**
 * AppleShareIcon — Apple-style share icon (box with upward arrow).
 *
 * Drop-in replacement for lucide's Share2. Accepts the same className prop
 * for sizing (e.g. "size-4", "size-3.5") and colour utilities.
 */

import React from "react";

interface AppleShareIconProps {
  className?: string;
}

export const AppleShareIcon: React.FC<AppleShareIconProps> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Tray / box open at top */}
    <path d="M4 14v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6" />
    {/* Arrow shaft */}
    <line x1="12" y1="3" x2="12" y2="15" />
    {/* Arrow head */}
    <polyline points="8 7 12 3 16 7" />
  </svg>
);
