/**
 * Members Panel Component
 * 
 * Displays full member list grouped by role with add/remove actions
 * Feature Group 6: Members Indicator and Management
 */

import { useState } from "react";
import { X, Crown, Plus, Search } from "lucide-react";
import { Member, Persona, Role } from "@/domain/enquiry/enquiry.types";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Separator } from "@/app/components/ui/separator";
import { AddMemberDialog } from "./AddMemberDialog";
import { useActionPermission } from "@/infrastructure";

interface MembersPanelProps {
  members: Member[];
  personas: Map<string, Persona>;
  primaryCMId?: string;
  onAddMember?: (personaId: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onClose?: () => void;
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
 * Get color for role
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

/**
 * Get role display name
 */
function getRoleDisplayName(role: string): string {
  return role;
}

/**
 * Group members by role
 */
function groupMembersByRole(
  members: Member[],
  personas: Map<string, Persona>
): Record<Role, Member[]> {
  const grouped: Record<Role, Member[]> = {
    BDM: [],
    CM: [],
    CX: [],
    Buyer: [],
    Seller: [],
  };

  members.forEach((member) => {
    const persona = personas.get(member.personaId);
    if (persona && persona.role) {
      // Check if the role is a valid Role type
      if (grouped[persona.role as Role]) {
        grouped[persona.role as Role].push(member);
      }
    }
  });

  return grouped;
}

export function MembersPanel({
  members,
  personas,
  primaryCMId,
  onAddMember,
  onRemoveMember,
  onClose,
}: MembersPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const canAddMembers = useActionPermission("ADD_MEMBER");
  const canRemoveMembers = useActionPermission("REMOVE_MEMBER");

  // Group members by role
  const groupedMembers = groupMembersByRole(members, personas);

  // Filter members by search query
  const filteredGroupedMembers = Object.entries(groupedMembers).reduce(
    (acc, [role, roleMembers]) => {
      const filtered = roleMembers.filter((member) => {
        const persona = personas.get(member.personaId);
        if (!persona) return false;
        return persona.displayName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      });
      acc[role as Role] = filtered;
      return acc;
    },
    {} as Record<Role, Member[]>
  );

  const handleAddMember = (personaId: string) => {
    onAddMember?.(personaId);
    setShowAddDialog(false);
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold text-base">Members</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {members.length} {members.length === 1 ? "member" : "members"}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Member list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {(Object.keys(filteredGroupedMembers) as Role[]).map((role) => {
            const roleMembers = filteredGroupedMembers[role];
            if (roleMembers.length === 0) return null;

            return (
              <div key={role} className="mb-4">
                {/* Role header */}
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                  {getRoleDisplayName(role)} ({roleMembers.length})
                </div>

                {/* Members in this role */}
                {roleMembers.map((member) => {
                  const persona = personas.get(member.personaId);
                  if (!persona) return null;

                  const isPrimaryCM = member.id === primaryCMId;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 group"
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
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {persona.displayName}
                          </span>
                          {isPrimaryCM && (
                            <Crown className="size-3.5 text-yellow-500 flex-shrink-0" title="Primary CM" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Remove button */}
                      {canRemoveMembers && !isPrimaryCM && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2"
                          onClick={() => onRemoveMember?.(member.id)}
                        >
                          <X className="size-3.5 text-gray-500" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Empty state */}
          {members.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No members yet</p>
            </div>
          )}

          {/* No search results */}
          {searchQuery &&
            members.length > 0 &&
            Object.values(filteredGroupedMembers).every(
              (arr) => arr.length === 0
            ) && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No members found for "{searchQuery}"</p>
              </div>
            )}
        </div>
      </ScrollArea>

      {/* Footer - Add member button */}
      {canAddMembers && (
        <>
          <Separator />
          <div className="p-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="size-4 mr-2" />
              Add member
            </Button>
          </div>
        </>
      )}

      {/* Add member dialog */}
      {showAddDialog && (
        <AddMemberDialog
          existingMemberPersonaIds={members.map((m) => m.personaId)}
          onAdd={handleAddMember}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </div>
  );
}