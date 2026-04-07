/**
 * Infrastructure: Role Context
 * 
 * Manages current role and persona state.
 */

import * as React from "react";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Role, Persona } from "@/domain/enquiry/enquiry.types";
import { PERSONAS } from "@/domain/persona/persona.data";

/**
 * Default personas for each role (for backward compatibility)
 */
const DEFAULT_PERSONAS: Record<Role, Persona> = {
  BDM: PERSONAS.find(p => p.role === "BDM") || PERSONAS[0],
  CM: PERSONAS.find(p => p.role === "CM") || PERSONAS[1],
  CX: PERSONAS.find(p => p.role === "CX") || PERSONAS[2],
  Buyer: PERSONAS.find(p => p.role === "Buyer") || PERSONAS[3],
  Seller: PERSONAS.find(p => p.role === "Seller") || PERSONAS[4],
};

/**
 * Role context value
 */
interface RoleContextValue {
  currentRole: Role;
  currentPersona: Persona;
  currentUserName: string;
  setRole: (role: Role) => void;
  setPersona: (persona: Persona) => void;
}

/**
 * Context
 */
const RoleContext = createContext<RoleContextValue | undefined>(undefined);

/**
 * Provider props
 */
interface RoleProviderProps {
  children: ReactNode;
  initialRole?: Role;
}

/**
 * Provider component
 */
export function RoleProvider({ children, initialRole = "BDM" }: RoleProviderProps) {
  console.log('[RoleProvider] Rendering with initialRole:', initialRole);
  
  const [currentRole, setCurrentRole] = useState<Role>(initialRole);
  const [currentPersona, setCurrentPersona] = useState<Persona>(DEFAULT_PERSONAS[initialRole]);

  const setRole = useCallback((role: Role) => {
    console.log('[RoleProvider] Setting role to:', role);
    setCurrentRole(role);
    setCurrentPersona(DEFAULT_PERSONAS[role]);
  }, []);

  const setPersona = useCallback((persona: Persona) => {
    console.log('[RoleProvider] Setting persona to:', persona.displayName);
    setCurrentPersona(persona);
    setCurrentRole(persona.role); // Update role to match persona
  }, []);

  const currentUserName = currentPersona.displayName;
  
  console.log('[RoleProvider] Context value:', { currentRole, currentPersona: currentPersona.displayName, currentUserName });

  return (
    <RoleContext.Provider value={{ currentRole, currentPersona, currentUserName, setRole, setPersona }}>
      {children}
    </RoleContext.Provider>
  );
}

/**
 * Hook to access role context
 */
export function useRoleContext() {
  const context = useContext(RoleContext);
  if (!context) {
    // During HMR (Hot Module Replacement), the context might temporarily be undefined
    // Log detailed error to help with debugging
    console.error('[useRoleContext] Context is undefined. Make sure the component is wrapped in RoleProvider.');
    console.error('[useRoleContext] Stack trace:', new Error().stack);
    throw new Error("useRoleContext must be used within RoleProvider");
  }
  return context;
}

/**
 * Hook for role and persona management
 */
export function useCurrentRole() {
  const context = useRoleContext();
  
  // Additional safety check (should never happen after useRoleContext check)
  if (!context) {
    throw new Error("useCurrentRole: RoleContext is undefined");
  }
  
  const { currentRole, currentPersona, currentUserName, setRole, setPersona } = context;

  return {
    currentRole,
    currentPersona,
    currentUser: currentUserName,
    changeRole: setRole,
    changePersona: setPersona,
    roleName: currentUserName,
  };
}

/**
 * Hook to get current persona
 */
export function useCurrentPersona() {
  const context = useRoleContext();
  
  if (!context) {
    throw new Error("useCurrentPersona: RoleContext is undefined");
  }
  
  return context.currentPersona;
}
