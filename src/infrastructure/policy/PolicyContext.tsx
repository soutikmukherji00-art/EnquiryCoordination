/**
 * Infrastructure: Policy Context
 * 
 * Provides role-based policy enforcement.
 */

import * as React from "react";
import { createContext, useContext, useMemo } from "react";
import { Role, Persona } from "@/domain/enquiry/enquiry.types";
import {
  isComponentVisible,
  isActionAllowed,
  canTagMembers,
  canEditMessages,
  getMessageDisplayStrategy,
  resolveMessageDisplaySender,
  getVisibleComponents,
  getAllowedActions,
  canViewAudit,
  canRoleConvertToOrder,
  canManageMembers,
  canCreateSellerChannels,
  canChangeState,
  getComponentVisibilityMap,
  getActionPermissionMap,
} from "@/domain/policy/policy.enforcement";
import { ComponentId, ActionId } from "@/domain/policy/policy.types";
import { canRoleShare } from "@/domain/sharing/share.policy.enforcement";

/**
 * Policy context value
 */
interface PolicyContextValue {
  role: Role;
  
  // Component visibility
  isComponentVisible: (componentId: ComponentId) => boolean;
  visibleComponents: ComponentId[];
  
  // Action permissions
  isActionAllowed: (actionId: ActionId) => boolean;
  allowedActions: ActionId[];
  
  // Message policies
  canShareMessages: boolean;
  canTagMembers: boolean;
  canEditMessages: boolean;
  messageDisplayStrategy: ReturnType<typeof getMessageDisplayStrategy>;
  resolveMessageSender: (
    senderPersona: Persona | undefined,
    senderRole: Role | undefined,
    isCurrentUser: boolean
  ) => string;
  
  // Common permission checks
  canViewAudit: boolean;
  canConvertToOrder: boolean;
  canManageMembers: boolean;
  canCreateSellerChannels: boolean;
  canChangeState: boolean;
}

/**
 * Context
 */
const PolicyContext = createContext<PolicyContextValue | undefined>(undefined);

/**
 * Provider props
 */
interface PolicyProviderProps {
  children: React.ReactNode;
  role: Role;
}

/**
 * Provider component
 */
export function PolicyProvider({ children, role }: PolicyProviderProps) {
  const contextValue = useMemo<PolicyContextValue>(
    () => ({
      role,
      
      // Component visibility
      isComponentVisible: (componentId: ComponentId) =>
        isComponentVisible(role, componentId),
      visibleComponents: getVisibleComponents(role),
      
      // Action permissions
      isActionAllowed: (actionId: ActionId) =>
        isActionAllowed(role, actionId),
      allowedActions: getAllowedActions(role),
      
      // Message policies
      canShareMessages: canRoleShare(role),
      canTagMembers: canTagMembers(role),
      canEditMessages: canEditMessages(role),
      messageDisplayStrategy: getMessageDisplayStrategy(role),
      resolveMessageSender: (senderPersona, senderRole, isCurrentUser) =>
        resolveMessageDisplaySender(role, senderPersona, senderRole, isCurrentUser),
      
      // Common permissions
      canViewAudit: canViewAudit(role),
      canConvertToOrder: canRoleConvertToOrder(role),
      canManageMembers: canManageMembers(role),
      canCreateSellerChannels: canCreateSellerChannels(role),
      canChangeState: canChangeState(role),
    }),
    [role]
  );

  return (
    <PolicyContext.Provider value={contextValue}>
      {children}
    </PolicyContext.Provider>
  );
}

/**
 * Hook to access policy context
 */
export function usePolicyContext() {
  const context = useContext(PolicyContext);
  if (!context) {
    throw new Error("usePolicyContext must be used within PolicyProvider");
  }
  return context;
}

/**
 * Hook to check component visibility
 */
export function useComponentVisibility(componentId: ComponentId): boolean {
  const { isComponentVisible } = usePolicyContext();
  return isComponentVisible(componentId);
}

/**
 * Hook to check action permission
 */
export function useActionPermission(actionId: ActionId): boolean {
  const { isActionAllowed } = usePolicyContext();
  return isActionAllowed(actionId);
}

/**
 * Hook to get message display rules
 */
export function useMessagePolicy() {
  const {
    canShareMessages,
    canTagMembers,
    canEditMessages,
    messageDisplayStrategy,
    resolveMessageSender,
  } = usePolicyContext();
  
  return {
    canShareMessages,
    canTagMembers,
    canEditMessages,
    messageDisplayStrategy,
    resolveMessageSender,
  };
}

/**
 * Hook to get common permissions
 */
export function usePermissions() {
  const {
    canViewAudit,
    canConvertToOrder,
    canManageMembers,
    canCreateSellerChannels,
    canChangeState,
  } = usePolicyContext();
  
  return {
    canViewAudit,
    canConvertToOrder,
    canManageMembers,
    canCreateSellerChannels,
    canChangeState,
  };
}

/**
 * Hook to batch check multiple components
 */
export function useComponentVisibilityMap(componentIds: ComponentId[]) {
  const { role } = usePolicyContext();
  return useMemo(
    () => getComponentVisibilityMap(role, componentIds),
    [role, componentIds]
  );
}

/**
 * Hook to batch check multiple actions
 */
export function useActionPermissionMap(actionIds: ActionId[]) {
  const { role } = usePolicyContext();
  return useMemo(
    () => getActionPermissionMap(role, actionIds),
    [role, actionIds]
  );
}

/**
 * HOC to conditionally render based on component visibility
 */
export function withComponentPolicy<P extends object>(
  Component: React.ComponentType<P>,
  componentId: ComponentId
) {
  return function PolicyGuardedComponent(props: P) {
    const isVisible = useComponentVisibility(componentId);
    
    if (!isVisible) {
      return null;
    }
    
    return <Component {...props} />;
  };
}

/**
 * HOC to conditionally render based on action permission
 */
export function withActionPolicy<P extends object>(
  Component: React.ComponentType<P>,
  actionId: ActionId
) {
  return function ActionGuardedComponent(props: P) {
    const isAllowed = useActionPermission(actionId);
    
    if (!isAllowed) {
      return null;
    }
    
    return <Component {...props} />;
  };
}