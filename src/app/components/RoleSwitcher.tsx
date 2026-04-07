import { useState } from "react";
import { ChevronDown, User } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Role } from "@/domain/enquiry/enquiry.types";

interface RoleSwitcherProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

const ROLES: Role[] = ["BDM", "CM", "CX", "Buyer", "Seller"];

const ROLE_LABELS: Record<Role, string> = {
  BDM: "Business Development Manager",
  CM: "Category Manager",
  CX: "Customer Experience",
  Buyer: "Buyer (Demo)",
  Seller: "Seller (Demo)",
};

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <User className="size-4" />
        <span className="font-medium">Role: {currentRole}</span>
        <ChevronDown className="size-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onRoleChange(role);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center justify-between ${
                    role === currentRole ? "bg-blue-50" : ""
                  }`}
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900">
                      {role}
                    </div>
                    <div className="text-xs text-gray-500">
                      {ROLE_LABELS[role]}
                    </div>
                  </div>
                  {role === currentRole && (
                    <div className="size-2 rounded-full bg-blue-600" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
              Demo only - Switch roles to see different views
            </div>
          </div>
        </>
      )}
    </div>
  );
}