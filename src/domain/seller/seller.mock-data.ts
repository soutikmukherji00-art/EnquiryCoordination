/**
 * Mock Seller and Contact Data
 * 
 * SYNCED with persona.data.ts seller personas:
 * - p_seller_1: Suresh Industries (2 contacts)
 * - p_seller_2: Om Steel Traders (2 contacts, inactive)
 * - p_seller_3: Rathi Metals (2 contacts)
 * - p_seller_4: Apex Alloys (2 contacts)
 * - p_seller_5: National Steel Corp (2 contacts, inactive)
 * 
 * Each seller has exactly 2 contacts for group invitations
 */

export interface SellerContact {
  id: string;
  sellerId: string;
  name: string;
  phone: string;
  role: string;
  email?: string;
}

export interface Seller {
  id: string;
  name: string;
  contactIds: string[];
  region?: string;
  industry?: string;
  isActive: boolean;
}

export const MOCK_SELLER_CONTACTS: SellerContact[] = [
  // Suresh Industries contacts (seller_1 -> p_seller_1)
  {
    id: "sc_1",
    sellerId: "seller_1",
    name: "Suresh Patil",
    phone: "+91 98765 50001",
    role: "Owner",
    email: "suresh@sureshindustries.com",
  },
  {
    id: "sc_2",
    sellerId: "seller_1",
    name: "Geeta Patil",
    phone: "+91 98765 50002",
    role: "Sales Manager",
    email: "geeta@sureshindustries.com",
  },

  // Om Steel Traders contacts (seller_2 -> p_seller_2) - INACTIVE
  {
    id: "sc_4",
    sellerId: "seller_2",
    name: "Omprakash Sharma",
    phone: "+91 98765 50004",
    role: "Proprietor",
    email: "om@omsteel.com",
  },
  {
    id: "sc_5",
    sellerId: "seller_2",
    name: "Rakesh Sharma",
    phone: "+91 98765 50005",
    role: "Sales Executive",
    email: "rakesh@omsteel.com",
  },

  // Rathi Metals contacts (seller_3 -> p_seller_3)
  {
    id: "sc_6",
    sellerId: "seller_3",
    name: "Ashok Rathi",
    phone: "+91 98765 50006",
    role: "Managing Director",
    email: "ashok@rathimetals.in",
  },
  {
    id: "sc_7",
    sellerId: "seller_3",
    name: "Neha Rathi",
    phone: "+91 98765 50007",
    role: "Director - Operations",
    email: "neha@rathimetals.in",
  },

  // Apex Alloys contacts (seller_4 -> p_seller_4)
  {
    id: "sc_9",
    sellerId: "seller_4",
    name: "Mohan Gupta",
    phone: "+91 98765 50009",
    role: "CEO",
    email: "mohan.gupta@apexalloys.com",
  },
  {
    id: "sc_10",
    sellerId: "seller_4",
    name: "Sunita Gupta",
    phone: "+91 98765 50010",
    role: "Business Head",
    email: "sunita@apexalloys.com",
  },

  // National Steel Corp contacts (seller_5 -> p_seller_5) - INACTIVE
  {
    id: "sc_12",
    sellerId: "seller_5",
    name: "Alok Verma",
    phone: "+91 98765 50012",
    role: "Director",
    email: "alok@nationalsteel.in",
  },
  {
    id: "sc_13",
    sellerId: "seller_5",
    name: "Pooja Verma",
    phone: "+91 98765 50013",
    role: "Sales Manager",
    email: "pooja@nationalsteel.in",
  },
];

export const MOCK_SELLERS: Seller[] = [
  {
    id: "seller_1",
    name: "Suresh Industries",
    contactIds: ["sc_1", "sc_2"],
    region: "Maharashtra",
    industry: "Steel Manufacturing",
    isActive: true,
  },
  {
    id: "seller_2",
    name: "Om Steel Traders",
    contactIds: ["sc_4", "sc_5"],
    region: "Rajasthan",
    industry: "Steel Trading",
    isActive: false,
  },
  {
    id: "seller_3",
    name: "Rathi Metals",
    contactIds: ["sc_6", "sc_7"],
    region: "Gujarat",
    industry: "Metal Products",
    isActive: true,
  },
  {
    id: "seller_4",
    name: "Apex Alloys",
    contactIds: ["sc_9", "sc_10"],
    region: "Tamil Nadu",
    industry: "Alloy Manufacturing",
    isActive: true,
  },
  {
    id: "seller_5",
    name: "National Steel Corp",
    contactIds: ["sc_12", "sc_13"],
    region: "West Bengal",
    industry: "Steel Products",
    isActive: false,
  },
];

/**
 * Helper function to get contacts for a seller
 */
export const getContactsForSeller = (sellerId: string): SellerContact[] => {
  return MOCK_SELLER_CONTACTS.filter((contact) => contact.sellerId === sellerId);
};

/**
 * Helper function to get seller by ID
 */
export const getSellerById = (sellerId: string): Seller | undefined => {
  return MOCK_SELLERS.find((seller) => seller.id === sellerId);
};

/**
 * Helper function to get seller contact by ID
 */
export const getSellerContactById = (contactId: string): SellerContact | undefined => {
  return MOCK_SELLER_CONTACTS.find((contact) => contact.id === contactId);
};