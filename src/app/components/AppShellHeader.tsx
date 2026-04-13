import { PanelLeft } from "lucide-react";
import { APP_CONFIG } from "@/domain/utils/constants";
import { Persona } from "@/domain/enquiry/enquiry.types";
import { PersonaSwitcher } from "@/app/components/PersonaSwitcher";

interface AppShellHeaderProps {
  currentPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export function AppShellHeader({
  currentPersona,
  onPersonaChange,
  isSidebarOpen,
  onSidebarToggle,
}: AppShellHeaderProps) {
  return (
    <header
      data-testid="app-shell-header"
      className="min-h-[64px] shrink-0 border-b border-white/10 bg-[#1f2126] px-3 py-2 md:min-h-[72px] md:px-6 md:py-3"
    >
      <div className="flex h-full flex-wrap items-center justify-between gap-2 md:gap-4">
        <div className="flex min-w-0 items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={onSidebarToggle}
            aria-label={isSidebarOpen ? "Collapse navigation" : "Expand navigation"}
            aria-pressed={isSidebarOpen}
            className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/15 md:size-10"
          >
            <PanelLeft className="size-4.5 md:size-5" strokeWidth={1.75} />
          </button>
          <div className="min-w-0 text-white">
            <div className="text-[20px] leading-none font-semibold tracking-[-0.03em] md:text-[22px]">
              {APP_CONFIG.COMPANY_NAME}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 md:gap-3">
          <PersonaSwitcher
            currentPersona={currentPersona}
            onPersonaChange={onPersonaChange}
            triggerClassName="h-9 min-w-[136px] border-white/10 bg-white/10 px-2.5 text-white hover:bg-white/15 hover:text-white md:min-w-[180px]"
            avatarClassName="ring-1 ring-white/10"
            labelClassName="text-white"
            popoverClassName="border-gray-200 shadow-xl"
          />
        </div>
      </div>
    </header>
  );
}
