/**
 * Domain: Policy Enforcement
 * 
 * Pure functions to evaluate policies.
 * UI reads decisions, never decides.
 */

import { Role, Persona } from "../enquiry/enquiry.types";
import { ComponentId, ActionId, PolicyContext, MessageDisplayStrategy } from "./policy.types";
import { getPolicyForRole, isInternalRole } from "./policy.registry";
import { stripRoleSuffix } from "@/domain/utils/name-utils";

/**
 * Check if component is visible for role
 */
export const isComponentVisible = (
  role: Role,
  componentId: ComponentId
): boolean => {
  const policy = getPolicyForRole(role);
  return policy.visibleComponents.includes(componentId);
};

/**
 * Check if action is allowed for role
 */
export const isActionAllowed = (
  role: Role,
  actionId: ActionId
): boolean => {
  const policy = getPolicyForRole(role);
  return policy.allowedActions.includes(actionId);
};

/**
 * Check if message sharing is allowed
 */
export const canShareMessages = (role: Role): boolean => {
  const policy = getPolicyForRole(role);
  return policy.messageRules.allowSharing;
};

/**
 * Check if member tagging is allowed
 */
export const canTagMembers = (role: Role): boolean => {
  const policy = getPolicyForRole(role);
  return policy.messageRules.allowTagging;
};

/**
 * Check if message editing is allowed
 */
export const canEditMessages = (role: Role): boolean => {
  const policy = getPolicyForRole(role);
  return policy.messageRules.allowEditing;
};

/**
 * Get message display strategy for role
 */
export const getMessageDisplayStrategy = (role: Role): MessageDisplayStrategy => {
  const policy = getPolicyForRole(role);
  return policy.messageRules.displaySenderAs;
};

/**
 * Resolve how to display message sender based on role policy
 * 
 * @param viewerRole - Role of the person viewing the message
 * @param senderPersona - Persona who sent the message
 * @param senderRole - Role of the sender
 * @param isCurrentUser - Whether sender is the current user
 */
export const resolveMessageDisplaySender = (
  viewerRole: Role,
  senderPersona: Persona | undefined,
  senderRole: Role | undefined,
  isCurrentUser: boolean
): string => {
  // Always show "You" for current user's messages
  if (isCurrentUser) {
    return "You";
  }

  // If no persona info, fall back to role-based label
  if (!senderPersona || !senderRole) {
    return "Unknown";
  }

  const strategy = getMessageDisplayStrategy(viewerRole);

  switch (strategy) {
    case "persona":
      // Show full persona name
      return stripRoleSuffix(senderPersona.displayName);

    case "company":
      // Show company name for internal team, persona for external
      if (isInternalRole(senderRole)) {
        return "Birla Pivot";
      }
      return stripRoleSuffix(senderPersona.displayName);

    case "masked":
      // Show generic role-based label
      return getMaskedSenderLabel(senderRole);

    default:
      return stripRoleSuffix(senderPersona.displayName);
  }
};

/**
 * Get masked sender label for role
 */
const getMaskedSenderLabel = (role: Role): string => {
  switch (role) {
    case "BDM":
      return "Business Development";
    case "CM":
      return "Category Manager";
    case "CX":
      return "Customer Experience";
    case "Buyer":
      return "Buyer";
    case "Seller":
      return "Seller";
    default:
      return "Team Member";
  }
};

/**
 * Get all visible components for role
 */
export const getVisibleComponents = (role: Role): ComponentId[] => {
  const policy = getPolicyForRole(role);
  return policy.visibleComponents;
};

/**
 * Get all allowed actions for role
 */
export const getAllowedActions = (role: Role): ActionId[] => {
  const policy = getPolicyForRole(role);
  return policy.allowedActions;
};

/**
 * Check if role can see audit trail
 */
export const canViewAudit = (role: Role): boolean => {
  return isActionAllowed(role, "VIEW_AUDIT");
};

/**
 * Check if role can convert to order
 */
export const canRoleConvertToOrder = (role: Role): boolean => {
  return isActionAllowed(role, "CONVERT_TO_ORDER");
};

/**
 * Check if role can manage members
 */
export const canManageMembers = (role: Role): boolean => {
  return isActionAllowed(role, "ADD_MEMBER");
};

/**
 * Check if role can create seller channels
 */
export const canCreateSellerChannels = (role: Role): boolean => {
  return isActionAllowed(role, "CREATE_SELLER_CHANNEL");
};

/**
 * Check if role can change enquiry state
 */
export const canChangeState = (role: Role): boolean => {
  return isActionAllowed(role, "CHANGE_STATE");
};

/**
 * Get policy context from role and optional enquiry
 */
export const createPolicyContext = (
  role: Role,
  enquiryId?: string,
  currentPersonaId?: string
): PolicyContext => {
  return {
    role,
    enquiryId,
    currentPersonaId,
  };
};

/**
 * Batch check multiple components
 */
export const getComponentVisibilityMap = (
  role: Role,
  componentIds: ComponentId[]
): Record<ComponentId, boolean> => {
  const result: Partial<Record<ComponentId, boolean>> = {};
  componentIds.forEach((id) => {
    result[id] = isComponentVisible(role, id);
  });
  return result as Record<ComponentId, boolean>;
};

/**
 * Batch check multiple actions
 */
export const getActionPermissionMap = (
  role: Role,
  actionIds: ActionId[]
): Record<ActionId, boolean> => {
  const result: Partial<Record<ActionId, boolean>> = {};
  actionIds.forEach((id) => {
    result[id] = isActionAllowed(role, id);
  });
  return result as Record<ActionId, boolean>;
};
