/**
 * Add Member Dialog Component
 * 
 * Searchable modal to add personas as members to enquiry
 * Now uses MultiSelectModal for consistency with group member selection
 */

import { useMemo } from "react";
import { User } from "lucide-react";
import { Persona, Role } from "@/domain/enquiry/enquiry.types";
import { searchPersonas } from "@/domain/persona/persona.data";
import { MultiSelectModal } from "@/app/components/common";

interface AddMemberDialogProps {
  existingMemberPersonaIds: string[];
  onAdd: (personaId: string) => void;
  onClose: () => void;
}

interface PersonaOption {
  id: string;
  name: string;
  role: Role;
  userId: string;
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
 * Get initials from display name
 */
function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function AddMemberDialog({
  existingMemberPersonaIds,
  onAdd,
  onClose,
}: AddMemberDialogProps) {
  // Get available personas (internal only, not already members)
  const availablePersonas = useMemo((): PersonaOption[] => {
    const allPersonas = searchPersonas("");
    return allPersonas
      .filter(p => !existingMemberPersonaIds.includes(p.id) && !p.isExternal)
      .map(p => ({
        id: p.id,
        name: p.displayName,
        role: p.role,
        userId: p.userId,
      }));
  }, [existingMemberPersonaIds]);

  const handleConfirm = (selectedIds: string[]) => {
    // Add all selected personas
    selectedIds.forEach(personaId => {
      onAdd(personaId);
    });
    onClose();
  };

  return (
    <MultiSelectModal<PersonaOption>
      isOpen={true}
      title="Add Member"
      description="Search and select internal Birla Pivot members to add to this enquiry (external buyers and sellers cannot be added)"
      items={availablePersonas}
      onConfirm={handleConfirm}
      onClose={onClose}
      searchPlaceholder="Search by name or role..."
      confirmButtonText="Add Members"
      emptyStateMessage={availablePersonas.length === 0 ? "All personas are already members" : "No personas found"}
      emptyStateIcon={<User className="size-8" />}
      getItemId={(persona) => persona.id}
      getItemSearchText={(persona) => `${persona.name} ${persona.role}`}
      renderItem={(persona) => (
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className={`size-8 rounded-full ${getRoleColor(
              persona.role
            )} flex items-center justify-center text-white text-xs font-medium flex-shrink-0`}
          >
            {getInitials(persona.name)}
          </div>

          {/* Info */}
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900">
              {persona.name}
            </p>
            <p className="text-xs text-gray-500">
              User ID: {persona.userId}
            </p>
          </div>
        </div>
      )}
      groupBy={(persona) => persona.role}
      groupLabel={(role, count) => `${role} (${count})`}
    />
  );
}