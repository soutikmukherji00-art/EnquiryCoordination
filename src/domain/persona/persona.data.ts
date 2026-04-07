/**
 * Domain: Persona
 * 
 * Manages user personas (role-based identities).
 * A user can have multiple personas (e.g., same user as BDM and CM).
 */

import { Persona, Role } from "../enquiry/enquiry.types";

/**
 * Mock persona data
 * In production, this would come from authentication service
 */
export const PERSONAS: Persona[] = [
  // BDM personas
  {
    id: "p_bdm_1",
    userId: "u_101",
    displayName: "Amit Kumar",
    role: "BDM",
    isExternal: false,
    isActive: true,
    avgResponseTimeMinutes: 3,
  },
  {
    id: "p_bdm_2",
    userId: "u_102",
    displayName: "Priya Singh",
    role: "BDM",
    isExternal: false,
    isActive: true,
    avgResponseTimeMinutes: 4,
  },
  
  // Category Manager personas (4 CMs, one per category)
  {
    id: "p_cm_north",
    userId: "u_210",
    displayName: "Priya Sharma",
    role: "CM",
    isExternal: false,
    isActive: true,
    avgResponseTimeMinutes: 4,
  },
  {
    id: "p_cm_south",
    userId: "u_211",
    displayName: "Meera Iyer",
    role: "CM",
    isExternal: false,
    isActive: true,
    avgResponseTimeMinutes: 5,
  },
  {
    id: "p_cm_east",
    userId: "u_212",
    displayName: "Rajesh Kumar",
    role: "CM",
    isExternal: false,
    isActive: true,
    avgResponseTimeMinutes: 6,
  },
  {
    id: "p_cm_west",
    userId: "u_213",
    displayName: "Aditya Verma",
    role: "CM",
    isExternal: false,
    isActive: true,
    avgResponseTimeMinutes: 5,
  },
  
  // CX personas
  {
    id: "p_cx_1",
    userId: "u_301",
    displayName: "Sneha Reddy",
    role: "CX",
    isExternal: false,
    isActive: true,
    avgResponseTimeMinutes: 15,
  },
  
  // Buyer personas - EXTERNAL to Birla Pivot
  {
    id: "p_buyer_1",
    userId: "u_401",
    displayName: "Ramesh Industries",
    role: "Buyer",
    isExternal: true,
    isActive: true,
  },
  {
    id: "p_buyer_2",
    userId: "u_402",
    displayName: "Global Manufacturing Ltd",
    role: "Buyer",
    isExternal: true,
    isActive: false,
  },
  {
    id: "p_buyer_3",
    userId: "u_403",
    displayName: "TechnoSteel Corp",
    role: "Buyer",
    isExternal: true,
    isActive: true,
  },
  
  // Seller personas - EXTERNAL to Birla Pivot
  {
    id: "p_seller_1",
    userId: "u_501",
    displayName: "Suresh Industries",
    role: "Seller",
    isExternal: true,
    isActive: true,
  },
  {
    id: "p_seller_2",
    userId: "u_502",
    displayName: "Om Steel Traders",
    role: "Seller",
    isExternal: true,
    isActive: false,
  },
  {
    id: "p_seller_3",
    userId: "u_503",
    displayName: "Rathi Metals",
    role: "Seller",
    isExternal: true,
    isActive: true,
  },
  {
    id: "p_seller_4",
    userId: "u_504",
    displayName: "Apex Alloys",
    role: "Seller",
    isExternal: true,
    isActive: true,
  },
  {
    id: "p_seller_5",
    userId: "u_505",
    displayName: "National Steel Corp",
    role: "Seller",
    isExternal: true,
    isActive: false,
  },
];

/**
 * Get persona by ID
 */
export const getPersonaById = (personaId: string): Persona | undefined => {
  return PERSONAS.find((p) => p.id === personaId);
};

/**
 * Get personas by role
 */
export const getPersonasByRole = (role: Role): Persona[] => {
  return PERSONAS.filter((p) => p.role === role);
};

/**
 * Get personas by user ID
 */
export const getPersonasByUserId = (userId: string): Persona[] => {
  return PERSONAS.filter((p) => p.userId === userId);
};

/**
 * Search personas by display name
 */
export const searchPersonas = (query: string, role?: Role): Persona[] => {
  let personas = PERSONAS;
  
  if (role) {
    personas = personas.filter((p) => p.role === role);
  }
  
  if (!query) return personas;
  
  const normalized = query.toLowerCase();
  return personas.filter((p) =>
    p.displayName.toLowerCase().includes(normalized)
  );
};
