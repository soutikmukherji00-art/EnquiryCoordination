/**
 * PersonaHoverTrigger Component
 * 
 * Lightweight wrapper that triggers ProfileHoverCard on hover.
 * Handles:
 * - Hover intent detection
 * - Portal rendering
 * - Keyboard accessibility
 * - Data fetching and caching
 */

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { EntityProfileCard } from "@/app/components/EntityProfileCard";
import { getProfileData, type ProfileData } from "@/domain/persona/persona.profile-data";
import { useCurrentRole } from "@/infrastructure";
import { useHoverCardManager } from "@/hooks/useHoverCardManager";

const __DEV_LOG__ = false;
const devLog = __DEV_LOG__ ? (label: string, data?: any) => console.log(label, data) : (() => {}) as (label: string, data?: any) => void;
const devError = __DEV_LOG__ ? (label: string, data?: any) => console.error(label, data) : (() => {}) as (label: string, data?: any) => void;

export interface PersonaHoverTriggerProps {
  personaId: string;
  children: React.ReactNode;
  context?: {
    enquiryId?: string;
    channelId?: string;
    location?: string; // NEW: to differentiate trigger locations (sidebar, header, message, etc.)
  };
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

/**
 * Cache for persona profile data to avoid repeated lookups
 */
const profileDataCache = new Map<string, ProfileData | null>();

/**
 * PersonaHoverTrigger Component
 */
export function PersonaHoverTrigger({
  personaId,
  children,
  context,
  side = "right",
  align = "start",
}: PersonaHoverTriggerProps) {
  const [profileData, setProfileData] = React.useState<ProfileData | null>(null);
  const { currentRole } = useCurrentRole();
  
  // Use global hover card manager to ensure only one card is open at a time
  const cardId = React.useMemo(() => {
    const enquiryPart = context?.enquiryId || 'no-enquiry';
    const channelPart = context?.channelId || 'no-channel';
    const locationPart = context?.location || 'default'; // Include location to make IDs unique
    return `persona-${personaId}-${enquiryPart}-${channelPart}-${locationPart}`;
  }, [personaId, context?.enquiryId, context?.channelId, context?.location]);
  const { isOpen, setOpen } = useHoverCardManager(cardId);
  
  // Fetch profile data on mount or when personaId changes
  React.useEffect(() => {
    try {
      // Always fetch fresh data (no caching) to ensure sync
      const data = getProfileData(personaId);
      setProfileData(data);
    } catch (error) {
      devError('[PersonaHoverTrigger] Error fetching profile data:', error);
      setProfileData(null);
    }
  }, [personaId]); // Re-fetch whenever personaId changes
  
  // Don't render hover card if no data available
  if (!profileData) {
    return <>{children}</>;
  }
  
  return (
    <HoverCardPrimitive.Root
      open={isOpen}
      onOpenChange={setOpen}
      openDelay={300}
      closeDelay={150}
    >
      <HoverCardPrimitive.Trigger asChild={false}>
        <span className="cursor-pointer hover:underline decoration-dotted decoration-gray-400 underline-offset-2">
          {children}
        </span>
      </HoverCardPrimitive.Trigger>
      
      <HoverCardPrimitive.Portal>
        <HoverCardPrimitive.Content
          side={side}
          align={align}
          sideOffset={8}
          alignOffset={0}
          className="z-50 animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          onEscapeKeyDown={() => setOpen(false)}
        >
          <EntityProfileCard 
            profileData={profileData} 
            viewerRole={currentRole}
            onNavigate={(page) => {
              devLog('[PersonaHoverTrigger] Navigated to page:', page);
            }}
          />
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Portal>
    </HoverCardPrimitive.Root>
  );
}