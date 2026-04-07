import { PersonaSwitcher } from "@/app/components/PersonaSwitcher";
import { Persona } from "@/domain/enquiry/enquiry.types";

interface SellerPortalHeaderProps {
  title: string;
  subtitle?: string;
  currentPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

export function SellerPortalHeader({
  title,
  subtitle,
  currentPersona,
  onPersonaChange,
}: SellerPortalHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="font-semibold text-xl text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <PersonaSwitcher currentPersona={currentPersona} onPersonaChange={onPersonaChange} />
    </div>
  );
}
