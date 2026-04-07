/**
 * Domain: Buyer Types
 * 
 * Buyer and Contact entities for the procurement system.
 */

/**
 * Contact - Represents a person associated with a Buyer organization
 */
export interface Contact {
  id: string; // e.g., "c_1"
  buyerId: string; // e.g., "buyer_1"
  name: string; // e.g., "Rajesh Kumar"
  phone: string; // e.g., "+91 98765 43210"
  role: string; // e.g., "Sales Manager", "Warehouse Admin", "Procurement Head"
  email?: string; // Optional email
}

/**
 * Buyer - Main entity representing a buyer organization
 */
export interface Buyer {
  id: string; // e.g., "buyer_1"
  name: string; // e.g., "Birla Pivot"
  contactIds: string[]; // References Contact.id[]
  region?: string; // e.g., "North"
  industry?: string; // e.g., "Construction"
}
