/**
 * Contact Utilities
 * 
 * Unified utilities for working with buyer and seller contacts
 */

import { Contact, getBuyerById, getContactById } from "@/domain/buyer/buyer.mock-data";
import { SellerContact, getSellerById, getSellerContactById } from "@/domain/seller/seller.mock-data";

/**
 * Unified contact type that works for both buyers and sellers
 */
export interface UnifiedContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  companyId: string;
  companyName: string;
  type: "buyer" | "seller";
}

/**
 * Convert a buyer contact to unified format
 */
export const buyerContactToUnified = (contact: Contact): UnifiedContact | null => {
  const buyer = getBuyerById(contact.buyerId);
  if (!buyer) return null;
  
  return {
    id: contact.id,
    name: contact.name,
    role: contact.role,
    phone: contact.phone,
    email: contact.email,
    companyId: buyer.id,
    companyName: buyer.name,
    type: "buyer",
  };
};

/**
 * Convert a seller contact to unified format
 */
export const sellerContactToUnified = (contact: SellerContact): UnifiedContact | null => {
  const seller = getSellerById(contact.sellerId);
  if (!seller) return null;
  
  return {
    id: contact.id,
    name: contact.name,
    role: contact.role,
    phone: contact.phone,
    email: contact.email,
    companyId: seller.id,
    companyName: seller.name,
    type: "seller",
  };
};

/**
 * Get unified contact by ID (checks both buyer and seller contacts)
 */
export const getUnifiedContactById = (contactId: string): UnifiedContact | null => {
  // Try buyer contact first
  const buyerContact = getContactById(contactId);
  if (buyerContact) {
    return buyerContactToUnified(buyerContact);
  }
  
  // Try seller contact
  const sellerContact = getSellerContactById(contactId);
  if (sellerContact) {
    return sellerContactToUnified(sellerContact);
  }
  
  return null;
};

/**
 * Get company name for a contact
 */
export const getCompanyNameForContact = (contactId: string): string => {
  const unified = getUnifiedContactById(contactId);
  return unified?.companyName || "Unknown Company";
};

/**
 * Check if a contact is a buyer contact
 */
export const isBuyerContact = (contactId: string): boolean => {
  return contactId.startsWith("c_");
};

/**
 * Check if a contact is a seller contact
 */
export const isSellerContact = (contactId: string): boolean => {
  return contactId.startsWith("sc_");
};
