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
  gstin?: string; // e.g., "04AAACS5123K1ZL"
  defaultPaymentTerms?: string; // e.g., "advance", "credit"
  creditLimit?: number; // e.g., 3056247.73
  openCreditLimit?: number; // e.g., 2000000.00
  deliveryLocations?: string[]; // array of saved addresses
}
