/**
 * Members Indicator Component
 * 
 * Slack-style member pill showing avatars, count, and add button
 * Feature Group 6: Members Indicator and Management
 */

import { useState } from "react";
import { Users, Plus } from "lucide-react";
import { Member, Persona } from "@/domain/enquiry/enquiry.types";
import { Button } from "@/app/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { MembersPanel } from "./MembersPanel";
import { useActionPermission } from "@/infrastructure";

interface MembersIndicatorProps {
  members: Member[];
  personas: Map<string, Persona>; // Map of personaId -> Persona for quick lookup
  primaryCMId?: string;
  onAddMember?: (personaId: string) => void;
  onRemoveMember?: (memberId: string) => void;
}

/**
 * Get initials from display name
 */
function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Get color for role badge
 */
function getRoleColor(role: string): string {
  switch (role) {
    case "BDM":
      return "bg-blue-500";
    case "CM":
      return "bg-purple-500";
    case "CX":
      return "bg-green-500";
    case "Buyer":
      return "bg-orange-500";
    case "Seller":
      return "bg-teal-500";
    default:
      return "bg-gray-500";
  }
}

export function MembersIndicator({
  members,
  personas,
  primaryCMId,
  onAddMember,
  onRemoveMember,
}: MembersIndicatorProps) {
  const [open, setOpen] = useState(false);
  const canAddMembers = useActionPermission("ADD_MEMBER");

  // Get first 3 members for avatar display
  const displayMembers = members.slice(0, 3);
  const remainingCount = members.length - displayMembers.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 px-3 hover:bg-gray-50"
        >
          {/* Avatar stack */}
          <div className="flex -space-x-2">
            {displayMembers.map((member) => {
              const persona = personas.get(member.personaId);
              if (!persona) return null;

              return (
                <div
                  key={member.id}
                  className={`size-6 rounded-full ${getRoleColor(
                    persona.role
                  )} flex items-center justify-center text-white text-xs font-medium border-2 border-white`}
                  title={persona.displayName}
                >
                  {getInitials(persona.displayName)}
                </div>
              );
            })}
          </div>

          {/* Count */}
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <span className="font-medium">{members.length}</span>
          </div>

          {/* Add button (if permitted) */}
          {canAddMembers && (
            <div className="flex items-center">
              <div className="w-px h-4 bg-gray-300 mx-1" />
              <Plus className="size-4 text-gray-500" />
            </div>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end">
        <MembersPanel
          members={members}
          personas={personas}
          primaryCMId={primaryCMId}
          onAddMember={onAddMember}
          onRemoveMember={onRemoveMember}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}