/**
 * Group Header Component
 * 
 * Displays group information and member management
 * Updated to work with contact-based groups
 */

import { useState, useMemo } from "react";
import { Plus, UserPlus } from "lucide-react";
import { GroupChannel } from "@/domain/message/group.types";
import { getPersonaById } from "@/domain/persona/persona.data";
import { getGroupMembersDisplayInfo } from "@/domain/message/group-display.utils";
import { BaseHeader } from "@/app/components/common";
import { Button } from "@/app/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { AddMemberModal } from "@/app/components/AddMemberModal";
import { Member, Persona, Role } from "@/domain/enquiry/enquiry.types";
import { useActionPermission } from "@/infrastructure";
import { PersonaHoverTrigger } from "@/app/components/PersonaHoverTrigger";
import { PERSONAS } from "@/domain/persona/persona.data";

interface GroupHeaderProps {
  group: GroupChannel;
  onAddMembers: (memberIds: string[]) => void;
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

export function GroupHeader({ group, onAddMembers }: GroupHeaderProps) {
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const canAddMembers = useActionPermission("ADD_MEMBER");

  // Get group type label
  const getGroupTypeLabel = () => {
    switch (group.type) {
      case "buyer":
        return "Buyer Group";
      case "seller":
        return "Seller Group";
      case "custom":
        return "Birla Pivot";
      default:
        return "Group";
    }
  };

  // Convert group members to Member format for MembersIndicator
  const members: Member[] = useMemo(() => {
    const membersInfo = getGroupMembersDisplayInfo(group);
    
    return membersInfo.map(info => {
      const persona = getPersonaById(info.id);
      
      return {
        id: info.id,
        userId: persona?.userId || info.id,
        personaId: info.id,
        role: (info.role || "Buyer") as Role,
        joinedAt: new Date(),
      };
    });
  }, [group]);

  // Create personas map
  const personasMap = useMemo(() => {
    const map = new Map<string, Persona>();
    const membersInfo = getGroupMembersDisplayInfo(group);
    
    membersInfo.forEach(info => {
      const persona = getPersonaById(info.id);
      if (persona) {
        map.set(info.id, persona);
      } else {
        // Convert contact to persona-like structure
        map.set(info.id, {
          id: info.id,
          userId: info.id,
          displayName: info.name,
          role: (info.type === "contact" ? (group.type === "buyer" ? "Buyer" : "Seller") : "BDM") as Role,
          isExternal: info.type === "contact",
        } as Persona);
      }
    });
    return map;
  }, [group]);

  // Get first 3 members for avatar display
  const displayMembers = members.slice(0, 3);

  // Members dropdown with popover
  const customMembersButton = (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 px-3 hover:bg-gray-50"
        >
          {/* Avatar stack */}
          <div className="flex -space-x-2">
            {displayMembers.map((member) => {
              const persona = personasMap.get(member.personaId);
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
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-900">
            People ({members.length})
          </p>
        </div>

        {/* Members List */}
        <ScrollArea className="max-h-80">
          <div className="p-2">
            {members.map((member) => {
              const persona = personasMap.get(member.personaId);
              if (!persona) return null;

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className={`size-8 rounded-full ${getRoleColor(
                      persona.role
                    )} flex items-center justify-center text-white text-xs font-medium flex-shrink-0`}
                  >
                    {getInitials(persona.displayName)}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {persona.displayName}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Add Member button */}
        {canAddMembers && (
          <div className="border-t border-gray-200">
            <button
              onClick={() => {
                setIsPopoverOpen(false);
                setIsAddMemberModalOpen(true);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <UserPlus className="size-4" />
              Add people
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );

  // Build subtitle with hover trigger for seller/buyer groups
  const subtitleContent = (() => {
    // Seller group: show seller insights on hover
    if (group.type === "seller" && group.sellerId) {
      return (
        <PersonaHoverTrigger
          personaId={group.sellerId}
          context={{ location: "seller-group-header" }}
          side="bottom"
          align="start"
        >
          {group.name}
        </PersonaHoverTrigger>
      );
    }
    // Buyer group: show buyer insights on hover
    if (group.type === "buyer" && group.buyerPersonaId) {
      return (
        <PersonaHoverTrigger
          personaId={group.buyerPersonaId}
          context={{ location: "buyer-group-header" }}
          side="bottom"
          align="start"
        >
          {group.name}
        </PersonaHoverTrigger>
      );
    }
    return group.name;
  })();

  return (
    <>
      <BaseHeader
        title={getGroupTypeLabel()}
        subtitle={subtitleContent}
        hideTitle={true}
        actions={customMembersButton}
      />
    </>
  );
}
