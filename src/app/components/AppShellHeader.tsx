import { PanelLeft } from "lucide-react";
import { APP_CONFIG } from "@/domain/utils/constants";
import { Persona } from "@/domain/enquiry/enquiry.types";
import { PersonaSwitcher } from "@/app/components/PersonaSwitcher";
import type { WorkspaceMode } from "@/app/workspace.types";
import { cn } from "@/app/components/ui/utils";

interface AppShellHeaderProps {
  currentPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
  workspaceMode: WorkspaceMode;
  onWorkspaceModeChange: (mode: WorkspaceMode) => void;
}

export function AppShellHeader({
  currentPersona,
  onPersonaChange,
  workspaceMode,
  onWorkspaceModeChange,
}: AppShellHeaderProps) {
  return (
    <header
      data-testid="app-shell-header"
      className="min-h-[72px] shrink-0 border-b border-white/10 bg-[#1f2126] px-4 py-3 md:px-6"
    >
      <div className="flex h-full flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex size-10 items-center justify-center rounded-lg bg-white/10 text-white">
            <PanelLeft className="size-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 text-white">
            <div className="text-[22px] font-semibold tracking-[-0.04em]">
              {APP_CONFIG.COMPANY_NAME}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div
            className="inline-flex rounded-full border border-white/10 bg-white/5 p-1"
            role="tablist"
            aria-label="Workspace switch"
          >
            {([
              { id: "prism", label: "Prism" },
              { id: "pluto", label: "Pluto" },
            ] as const).map((workspace) => {
              const isActive = workspaceMode === workspace.id;
              return (
                <button
                  key={workspace.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-pressed={isActive}
                  onClick={() => onWorkspaceModeChange(workspace.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white text-[#1f2126]"
                      : "text-white/72 hover:text-white",
                  )}
                >
                  {workspace.label}
                </button>
              );
            })}
          </div>

          <PersonaSwitcher
            currentPersona={currentPersona}
            onPersonaChange={onPersonaChange}
            triggerClassName="min-w-[180px] border-white/10 bg-white/10 text-white hover:bg-white/15 hover:text-white"
            avatarClassName="ring-1 ring-white/10"
            labelClassName="text-white"
            popoverClassName="border-gray-200 shadow-xl"
          />
        </div>
      </div>
    </header>
  );
}
