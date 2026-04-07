/**
 * Persona Switcher Component
 * 
 * Two-step selection: Role → Persona
 * Feature Group 7: Persona Switching System
 */

import { useState, useMemo } from "react";
import { ChevronDown, User, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Persona, Role } from "@/domain/enquiry/enquiry.types";
import { PERSONAS, getPersonasByRole } from "@/domain/persona/persona.data";
import { cn } from "@/app/components/ui/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Separator } from "@/app/components/ui/separator";

interface PersonaSwitcherProps {
  currentPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
  triggerClassName?: string;
  avatarClassName?: string;
  labelClassName?: string;
  popoverClassName?: string;
}

const ROLE_LABELS: Record<Role, string> = {
  BDM: "Business Development Manager",
  CM: "Category Manager",
  CX: "Customer Experience",
  Buyer: "Buyer (External)",
  Seller: "Seller (External)",
};

/**
 * Get color for role badge
 */
function getRoleColor(role: Role): string {
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

export function PersonaSwitcher({
  currentPersona,
  onPersonaChange,
  triggerClassName,
  avatarClassName,
  labelClassName,
  popoverClassName,
}: PersonaSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // All available roles
  const availableRoles = useMemo(() => {
    const roles = new Set<Role>();
    PERSONAS.forEach((p) => roles.add(p.role));
    return Array.from(roles).sort();
  }, []);

  // Personas for selected role
  const rolePersonas = useMemo(() => {
    if (!selectedRole) return [];
    return getPersonasByRole(selectedRole);
  }, [selectedRole]);

  // Handle role selection (step 1)
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  // Handle persona selection (step 2)
  const handlePersonaSelect = (persona: Persona) => {
    onPersonaChange(persona);
    setOpen(false);
    setSelectedRole(null); // Reset for next open
  };

  // Go back to role selection
  const handleBack = () => {
    setSelectedRole(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2 min-w-[200px]", triggerClassName)}
        >
          {/* Current persona avatar */}
          <div
            className={cn(
              "size-6 rounded-full flex items-center justify-center text-white text-xs font-medium",
              getRoleColor(currentPersona.role),
              avatarClassName,
            )}
          >
            {getInitials(currentPersona.displayName)}
          </div>
          
          {/* Current persona info */}
          <div className="flex-1 text-left min-w-0">
            <div className={cn("text-sm font-medium truncate", labelClassName)}>
              {currentPersona.displayName}
            </div>
          </div>
          
          <ChevronDown className="size-4 flex-shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className={cn("w-80 p-0", popoverClassName)} align="end">
        <div className="flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">
              {selectedRole ? "Select Persona" : "Switch Persona"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedRole
                ? `Choose a ${ROLE_LABELS[selectedRole]}`
                : "Select a role to view personas"}
            </p>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            {!selectedRole ? (
              /* Step 1: Role Selection */
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-500 uppercase px-2 py-1.5 mb-1">
                  Select Role
                </div>
                {availableRoles.map((role) => {
                  const count = getPersonasByRole(role).length;
                  const isCurrentRole = role === currentPersona.role;

                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleSelect(role)}
                      className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 transition-colors ${
                        isCurrentRole ? "bg-gray-50" : ""
                      }`}
                    >
                      <div
                        className={`size-8 rounded ${getRoleColor(
                          role
                        )} flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {role.slice(0, 2)}
                      </div>

                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm text-gray-900">
                          {role}
                        </div>
                        <div className="text-xs text-gray-500">
                          {count} {count === 1 ? "persona" : "personas"}
                        </div>
                      </div>

                      {isCurrentRole && (
                        <div className="size-2 rounded-full bg-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Step 2: Persona Selection */
              <div className="p-2">
                {/* Back button */}
                <button
                  onClick={handleBack}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg mb-2"
                >
                  <svg
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to roles
                </button>

                <Separator className="my-2" />

                {/* Persona list */}
                <div className="text-xs font-semibold text-gray-500 uppercase px-2 py-1.5 mb-1">
                  {ROLE_LABELS[selectedRole]}
                </div>
                {rolePersonas.map((persona) => {
                  const isCurrent = persona.id === currentPersona.id;

                  return (
                    <button
                      key={persona.id}
                      onClick={() => handlePersonaSelect(persona)}
                      className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 transition-colors ${
                        isCurrent ? "bg-blue-50 ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <div
                        className={`size-8 rounded-full ${getRoleColor(
                          persona.role
                        )} flex items-center justify-center text-white text-xs font-medium`}
                      >
                        {getInitials(persona.displayName)}
                      </div>

                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {persona.displayName}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {persona.userId}
                        </div>
                      </div>

                      {isCurrent && (
                        <Check className="size-5 text-blue-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="border-t px-3 py-2.5 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Demo Mode • Persona switching for realistic demos
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
