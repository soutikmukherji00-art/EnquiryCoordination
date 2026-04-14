import type { Role } from "@/domain/enquiry/enquiry.types";
import type { WorkspaceMode } from "@/app/workspace.types";

export const ROLE_LANDING_WORKSPACE: Record<Role, WorkspaceMode> = {
  BDM: "pluto",
  CM: "pluto",
  CX: "rfq",
  Buyer: "prism",
  Seller: "prism",
};

const DEFAULT_WORKSPACE_MODE: WorkspaceMode = "prism";

export function getLandingWorkspaceModeForRole(role: Role): WorkspaceMode {
  return ROLE_LANDING_WORKSPACE[role] ?? DEFAULT_WORKSPACE_MODE;
}
