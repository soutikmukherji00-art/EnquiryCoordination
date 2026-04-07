/**
 * Data Synchronization Tests
 * 
 * Ensures all mock data is properly synced between:
 * - Buyer personas
 * - Buyer contacts
 * - Seller personas
 * - Seller contacts
 * - Internal personas (BDMs, CMs, CX)
 */

import { describe, it, expect } from 'vitest';
import { PERSONAS, getPersonasByRole } from '@/domain/persona/persona.data';
import { MOCK_BUYERS, MOCK_CONTACTS, getContactsForBuyer, getBuyerById } from '@/domain/buyer/buyer.mock-data';
import { MOCK_SELLERS, MOCK_SELLER_CONTACTS, getContactsForSeller, getSellerById } from '@/domain/seller/seller.mock-data';
import { 
  getBuyerIdFromPersona, 
  getSellerIdFromPersona,
  getBuyerPersonaFromBuyerId,
  getSellerPersonaFromSellerId,
  BUYER_PERSONA_TO_BUYER_MAP,
  SELLER_PERSONA_TO_SELLER_MAP
} from '@/domain/buyer/buyer-persona-mapping';

describe('Data Synchronization', () => {
  describe('Buyer Personas and Contacts', () => {
    it('all buyer personas map to valid buyers', () => {
      const buyerPersonas = getPersonasByRole('Buyer');
      
      buyerPersonas.forEach(persona => {
        const buyerId = getBuyerIdFromPersona(persona.id);
        expect(buyerId).toBeDefined();
        
        if (buyerId) {
          const buyer = getBuyerById(buyerId);
          expect(buyer).toBeDefined();
          expect(buyer?.name).toBe(persona.displayName);
        }
      });
    });

    it('all buyers have at least one contact', () => {
      MOCK_BUYERS.forEach(buyer => {
        const contacts = getContactsForBuyer(buyer.id);
        expect(contacts.length).toBeGreaterThan(0);
        expect(contacts.length).toBe(buyer.contactIds.length);
      });
    });

    it('all buyer contacts reference valid buyers', () => {
      MOCK_CONTACTS.forEach(contact => {
        const buyer = getBuyerById(contact.buyerId);
        expect(buyer).toBeDefined();
        expect(buyer?.contactIds).toContain(contact.id);
      });
    });

    it('buyer persona mapping is bidirectional', () => {
      Object.entries(BUYER_PERSONA_TO_BUYER_MAP).forEach(([personaId, buyerId]) => {
        const reverseMapped = getBuyerPersonaFromBuyerId(buyerId);
        expect(reverseMapped).toBe(personaId);
      });
    });
  });

  describe('Seller Personas and Contacts', () => {
    it('all seller personas map to valid sellers', () => {
      const sellerPersonas = getPersonasByRole('Seller');
      
      sellerPersonas.forEach(persona => {
        const sellerId = getSellerIdFromPersona(persona.id);
        expect(sellerId).toBeDefined();
        
        if (sellerId) {
          const seller = getSellerById(sellerId);
          expect(seller).toBeDefined();
          expect(seller?.name).toBe(persona.displayName);
        }
      });
    });

    it('all sellers have at least one contact', () => {
      MOCK_SELLERS.forEach(seller => {
        const contacts = getContactsForSeller(seller.id);
        expect(contacts.length).toBeGreaterThan(0);
        expect(contacts.length).toBe(seller.contactIds.length);
      });
    });

    it('all seller contacts reference valid sellers', () => {
      MOCK_SELLER_CONTACTS.forEach(contact => {
        const seller = getSellerById(contact.sellerId);
        expect(seller).toBeDefined();
        expect(seller?.contactIds).toContain(contact.id);
      });
    });

    it('seller persona mapping is bidirectional', () => {
      Object.entries(SELLER_PERSONA_TO_SELLER_MAP).forEach(([personaId, sellerId]) => {
        const reverseMapped = getSellerPersonaFromSellerId(sellerId);
        expect(reverseMapped).toBe(personaId);
      });
    });

    it('seller active status matches persona active status', () => {
      const sellerPersonas = getPersonasByRole('Seller');
      
      sellerPersonas.forEach(persona => {
        const sellerId = getSellerIdFromPersona(persona.id);
        if (sellerId) {
          const seller = getSellerById(sellerId);
          expect(seller?.isActive).toBe(persona.isActive);
        }
      });
    });
  });

  describe('Internal Personas', () => {
    it('has BDM personas', () => {
      const bdms = getPersonasByRole('BDM');
      expect(bdms.length).toBeGreaterThan(0);
      bdms.forEach(bdm => {
        expect(bdm.isExternal).toBe(false);
      });
    });

    it('has CM personas', () => {
      const cms = getPersonasByRole('CM');
      expect(cms.length).toBeGreaterThan(0);
      cms.forEach(cm => {
        expect(cm.isExternal).toBe(false);
      });
    });

    it('has CX personas', () => {
      const cxs = getPersonasByRole('CX');
      expect(cxs.length).toBeGreaterThan(0);
      cxs.forEach(cx => {
        expect(cx.isExternal).toBe(false);
      });
    });
  });

  describe('Data Integrity', () => {
    it('buyer persona names match buyer data names', () => {
      const expectedMappings = [
        { personaId: 'p_buyer_1', buyerId: 'buyer_1', name: 'Ramesh Industries' },
        { personaId: 'p_buyer_2', buyerId: 'buyer_2', name: 'Global Manufacturing Ltd' },
        { personaId: 'p_buyer_3', buyerId: 'buyer_3', name: 'TechnoSteel Corp' },
      ];

      expectedMappings.forEach(mapping => {
        const persona = PERSONAS.find(p => p.id === mapping.personaId);
        const buyer = getBuyerById(mapping.buyerId);
        
        expect(persona?.displayName).toBe(mapping.name);
        expect(buyer?.name).toBe(mapping.name);
      });
    });

    it('seller persona names match seller data names', () => {
      const expectedMappings = [
        { personaId: 'p_seller_1', sellerId: 'seller_1', name: 'Suresh Industries' },
        { personaId: 'p_seller_3', sellerId: 'seller_3', name: 'Rathi Metals' },
        { personaId: 'p_seller_4', sellerId: 'seller_4', name: 'Apex Alloys' },
      ];

      expectedMappings.forEach(mapping => {
        const persona = PERSONAS.find(p => p.id === mapping.personaId);
        const seller = getSellerById(mapping.sellerId);
        
        expect(persona?.displayName).toBe(mapping.name);
        expect(seller?.name).toBe(mapping.name);
      });
    });

    it('all contact IDs are unique', () => {
      const allContactIds = [...MOCK_CONTACTS.map(c => c.id), ...MOCK_SELLER_CONTACTS.map(c => c.id)];
      const uniqueIds = new Set(allContactIds);
      expect(uniqueIds.size).toBe(allContactIds.length);
    });

    it('all persona IDs are unique', () => {
      const personaIds = PERSONAS.map(p => p.id);
      const uniqueIds = new Set(personaIds);
      expect(uniqueIds.size).toBe(personaIds.length);
    });
  });

  describe('Group Creation Data Flow', () => {
    it('can create group with buyer contacts', () => {
      // Simulate selecting a buyer persona
      const buyerPersona = PERSONAS.find(p => p.id === 'p_buyer_1');
      expect(buyerPersona).toBeDefined();

      // Get buyerId from persona
      const buyerId = getBuyerIdFromPersona(buyerPersona!.id);
      expect(buyerId).toBe('buyer_1');

      // Get contacts for this buyer
      const contacts = getContactsForBuyer(buyerId!);
      expect(contacts.length).toBeGreaterThan(0);

      // Verify contacts have correct buyerId
      contacts.forEach(contact => {
        expect(contact.buyerId).toBe(buyerId);
      });
    });

    it('can create group with internal users', () => {
      const bdms = getPersonasByRole('BDM');
      const cms = getPersonasByRole('CM');
      
      expect(bdms.length).toBeGreaterThan(0);
      expect(cms.length).toBeGreaterThan(0);

      // All internal users should be non-external
      [...bdms, ...cms].forEach(persona => {
        expect(persona.isExternal).toBe(false);
      });
    });

    it('can create mixed group with external and internal users', () => {
      // Get a buyer contact
      const buyerContacts = getContactsForBuyer('buyer_1');
      expect(buyerContacts.length).toBeGreaterThan(0);

      // Get an internal user
      const bdm = getPersonasByRole('BDM')[0];
      expect(bdm).toBeDefined();
      expect(bdm.isExternal).toBe(false);

      // Both should have valid IDs
      expect(buyerContacts[0].id).toBeDefined();
      expect(bdm.id).toBeDefined();
    });
  });
});
