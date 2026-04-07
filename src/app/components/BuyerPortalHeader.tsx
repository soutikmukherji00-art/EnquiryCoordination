import { PersonaSwitcher } from "@/app/components/PersonaSwitcher";
import { Persona } from "@/domain/enquiry/enquiry.types";
import { Users } from "lucide-react";

interface BuyerPortalHeaderProps {
  companyName: string;
  subtitle: string;
  currentPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

export function BuyerPortalHeader({
  companyName,
  subtitle,
  currentPersona,
  onPersonaChange,
}: BuyerPortalHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3 flex-1">
        {/* Group Icon */}
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        
        {/* Title */}
        <div className="flex-1">
          <h1 className="font-semibold text-xl text-gray-900">{companyName} &lt;&gt; Birla Pivot</h1>
        </div>
      </div>
      <PersonaSwitcher currentPersona={currentPersona} onPersonaChange={onPersonaChange} />
    </div>
  );
}