import type { WorkspaceMode } from "@/app/workspace.types";
import { cn } from "@/app/components/ui/utils";

interface AppShellSidebarProps {
  isOpen: boolean;
  workspaceMode: WorkspaceMode;
  onWorkspaceModeChange: (mode: WorkspaceMode) => void;
}

const WORKSPACES: Array<{ id: WorkspaceMode; label: string }> = [
  { id: "pluto", label: "Pluto" },
  { id: "prism", label: "Prism" },
];

export function AppShellSidebar({
  isOpen,
  workspaceMode,
  onWorkspaceModeChange,
}: AppShellSidebarProps) {
  return (
    <aside
      data-testid="app-shell-sidebar"
      className={cn(
        "hidden border-r border-[#d7d4cb] bg-[#f3f0e8] transition-[width,padding] duration-200 ease-out md:flex md:flex-col",
        isOpen ? "w-56 px-3 py-4" : "w-0 px-0 py-4",
      )}
      aria-hidden={!isOpen}
    >
      <div
        className={cn(
          "flex h-full flex-col gap-2 overflow-hidden transition-opacity duration-150",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6a675f]">
          Workspace
        </div>

        <nav aria-label="Workspace navigation" className="flex flex-col gap-1">
          {WORKSPACES.map((workspace) => {
            const isActive = workspaceMode === workspace.id;

            return (
              <button
                key={workspace.id}
                type="button"
                onClick={() => onWorkspaceModeChange(workspace.id)}
                className={cn(
                  "flex items-center rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#1f2126] text-white shadow-sm"
                    : "text-[#38352f] hover:bg-[#e7e1d4]",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {workspace.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
