/**
 * Mock Buyer and Contact Data
 * 
 * SYNCED with persona.data.ts buyer personas:
 * - p_buyer_1: Ramesh Industries (2 contacts)
 * - p_buyer_2: Global Manufacturing Ltd (2 contacts)
 * - p_buyer_3: TechnoSteel Corp (2 contacts)
 * 
 * Each buyer has exactly 2 contacts for group invitations
 */

import { Buyer, Contact } from "./buyer.types";

export const MOCK_CONTACTS: Contact[] = [
  // Ramesh Industries contacts (buyer_1 -> p_buyer_1)
  {
    id: "c_1",
    buyerId: "buyer_1",
    name: "Ramesh Patel",
    phone: "+91 98765 43210",
    role: "Owner & MD",
    email: "ramesh.patel@rameshindustries.com",
  },
  {
    id: "c_2",
    buyerId: "buyer_1",
    name: "Kavita Ramesh",
    phone: "+91 98765 43211",
    role: "Operations Manager",
    email: "kavita@rameshindustries.com",
  },

  // Global Manufacturing Ltd contacts (buyer_2 -> p_buyer_2)
  {
    id: "c_4",
    buyerId: "buyer_2",
    name: "Vikram Malhotra",
    phone: "+91 98765 43213",
    role: "CEO",
    email: "vikram.malhotra@globalmfg.com",
  },
  {
    id: "c_5",
    buyerId: "buyer_2",
    name: "Anjali Kapoor",
    phone: "+91 98765 43214",
    role: "Purchase Manager",
    email: "anjali.kapoor@globalmfg.com",
  },

  // TechnoSteel Corp contacts (buyer_3 -> p_buyer_3)
  {
    id: "c_8",
    buyerId: "buyer_3",
    name: "Arun Kumar",
    phone: "+91 98765 43217",
    role: "Managing Director",
    email: "arun.kumar@technosteel.in",
  },
  {
    id: "c_9",
    buyerId: "buyer_3",
    name: "Deepa Iyer",
    phone: "+91 98765 43218",
    role: "Procurement Officer",
    email: "deepa.iyer@technosteel.in",
  },
];

export const MOCK_BUYERS: Buyer[] = [
  {
    id: "buyer_1",
    name: "Ramesh Industries",
    contactIds: ["c_1", "c_2"],
    region: "Maharashtra",
    industry: "Manufacturing",
  },
  {
    id: "buyer_2",
    name: "Global Manufacturing Ltd",
    contactIds: ["c_4", "c_5"],
    region: "Delhi NCR",
    industry: "Industrial Equipment",
  },
  {
    id: "buyer_3",
    name: "TechnoSteel Corp",
    contactIds: ["c_8", "c_9"],
    region: "Karnataka",
    industry: "Steel Products",
  },
];

/**
 * Helper function to get contacts for a buyer
 */
export const getContactsForBuyer = (buyerId: string): Contact[] => {
  return MOCK_CONTACTS.filter((contact) => contact.buyerId === buyerId);
};

/**
 * Helper function to get the primary contact for a buyer.
 * Used when we need a human sender name instead of the company name.
 */
export const getPrimaryContactForBuyer = (buyerId: string): Contact | undefined => {
  return getContactsForBuyer(buyerId)[0];
};

/**
 * Helper function to get buyer by ID
 */
export const getBuyerById = (buyerId: string): Buyer | undefined => {
  return MOCK_BUYERS.find((buyer) => buyer.id === buyerId);
};

/**
 * Helper function to get contact by ID
 */
export const getContactById = (contactId: string): Contact | undefined => {
  return MOCK_CONTACTS.find((contact) => contact.id === contactId);
};
