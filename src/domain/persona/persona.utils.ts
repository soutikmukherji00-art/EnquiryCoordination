/**
 * Persona Validation and Lookup Utilities
 * 
 * Optimized functions for persona lookups with caching
 */

import { Persona } from "@/domain/enquiry/enquiry.types";
import { getPersonaById } from "@/domain/persona/persona.data";

// Cache for persona lookups
const personaCache = new Map<string, Persona | null>();

/**
 * Get persona with caching
 */
export function getCachedPersona(personaId: string): Persona | null {
  // Check cache first
  if (personaCache.has(personaId)) {
    return personaCache.get(personaId) || null;
  }

  // Fetch and cache
  const persona = getPersonaById(personaId);
  personaCache.set(personaId, persona || null);
  
  return persona || null;
}

/**
 * Get multiple personas efficiently
 */
export function getMultiplePersonas(personaIds: string[]): Map<string, Persona> {
  const result = new Map<string, Persona>();
  
  for (const id of personaIds) {
    const persona = getCachedPersona(id);
    if (persona) {
      result.set(id, persona);
    }
  }
  
  return result;
}

/**
 * Clear persona cache (useful for testing or after data updates)
 */
export function clearPersonaCache(): void {
  personaCache.clear();
}

/**
 * Get persona initials for avatar display
 */
export function getPersonaInitials(persona: Persona | null | undefined): string {
  if (!persona) return "?";
  
  return persona.displayName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Check if persona has specific role
 */
export function hasRole(persona: Persona | null, role: string): boolean {
  return persona?.role === role;
}
