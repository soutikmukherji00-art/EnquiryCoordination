/**
 * Integration Tests: Group Creation Modal
 * 
 * Tests the complete data flow from persona selection to group creation
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GroupCreationModal, SelectedMember } from '../GroupCreationModal';
import { PERSONAS } from '@/domain/persona/persona.data';
import { getBuyerIdFromPersona } from '@/domain/buyer/buyer-persona-mapping';
import { getContactsForBuyer } from '@/domain/buyer/buyer.mock-data';

describe('GroupCreationModal - Data Integration', () => {
  const mockOnClose = vi.fn();
  const mockOnCreateGroup = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onCreateGroup: mockOnCreateGroup,
    personas: PERSONAS,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('External Users - Buyer Personas', () => {
    it('displays buyer personas correctly', () => {
      render(<GroupCreationModal {...defaultProps} />);

      // Should show External Users tab by default
      expect(screen.getByText('External Users')).toBeInTheDocument();

      // Should display buyer personas
      expect(screen.getByText('Ramesh Industries')).toBeInTheDocument();
      expect(screen.getByText('Global Manufacturing Ltd')).toBeInTheDocument();
      expect(screen.getByText('TechnoSteel Corp')).toBeInTheDocument();
    });

    it('shows correct contact count for each buyer', () => {
      render(<GroupCreationModal {...defaultProps} />);

      // Ramesh Industries has 3 contacts
      const rameshIndustries = screen.getByText('Ramesh Industries').closest('button');
      expect(rameshIndustries).toHaveTextContent('3 contacts');

      // Global Manufacturing Ltd has 4 contacts
      const globalMfg = screen.getByText('Global Manufacturing Ltd').closest('button');
      expect(globalMfg).toHaveTextContent('4 contacts');

      // TechnoSteel Corp has 3 contacts
      const technoSteel = screen.getByText('TechnoSteel Corp').closest('button');
      expect(technoSteel).toHaveTextContent('3 contacts');
    });

    it('navigates to buyer contacts when clicked', async () => {
      render(<GroupCreationModal {...defaultProps} />);

      // Click on Ramesh Industries
      const rameshButton = screen.getByText('Ramesh Industries').closest('button');
      fireEvent.click(rameshButton!);

      // Should show back button and buyer name
      await waitFor(() => {
        expect(screen.getByText('Ramesh Industries Contacts')).toBeInTheDocument();
      });

      // Should show contacts
      expect(screen.getByText('Ramesh Patel')).toBeInTheDocument();
      expect(screen.getByText('Owner & MD')).toBeInTheDocument();
      expect(screen.getByText('Kavita Ramesh')).toBeInTheDocument();
      expect(screen.getByText('Operations Manager')).toBeInTheDocument();
    });

    it('allows selecting multiple contacts from same buyer', async () => {
      render(<GroupCreationModal {...defaultProps} />);

      // Navigate to Ramesh Industries contacts
      fireEvent.click(screen.getByText('Ramesh Industries').closest('button')!);

      await waitFor(() => {
        expect(screen.getByText('Ramesh Patel')).toBeInTheDocument();
      });

      // Select two contacts
      const rameshCheckbox = screen.getByLabelText(/Ramesh Patel/i);
      const kavitaCheckbox = screen.getByLabelText(/Kavita Ramesh/i);

      fireEvent.click(rameshCheckbox);
      fireEvent.click(kavitaCheckbox);

      // Should show 2 members selected
      expect(screen.getByText('2 members selected')).toBeInTheDocument();
    });

    it('warns when selecting contacts from multiple buyers', async () => {
      render(<GroupCreationModal {...defaultProps} />);

      // Select contact from first buyer
      fireEvent.click(screen.getByText('Ramesh Industries').closest('button')!);
      await waitFor(() => {
        expect(screen.getByText('Ramesh Patel')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByLabelText(/Ramesh Patel/i));

      // Go back and select from second buyer
      fireEvent.click(screen.getByRole('button', { name: /back/i }));
      fireEvent.click(screen.getByText('Global Manufacturing Ltd').closest('button')!);
      await waitFor(() => {
        expect(screen.getByText('Vikram Malhotra')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByLabelText(/Vikram Malhotra/i));

      // Should show multi-buyer warning
      expect(screen.getByText('Multiple buyers selected')).toBeInTheDocument();
      expect(screen.getByText(/group name will be generic/i)).toBeInTheDocument();
    });
  });

  describe('Internal Users - Team Personas', () => {
    it('displays internal personas with dual CTAs', () => {
      render(<GroupCreationModal {...defaultProps} />);

      // Switch to Internal Users tab
      fireEvent.click(screen.getByText('Internal Users'));

      // Should show BDMs
      expect(screen.getByText('Amit Kumar')).toBeInTheDocument();
      expect(screen.getByText('Priya Singh')).toBeInTheDocument();

      // Should show CMs
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
      expect(screen.getByText('Meera Iyer')).toBeInTheDocument();

      // Each should have two buttons
      const amitRow = screen.getByText('Amit Kumar').closest('div');
      expect(amitRow).toHaveTextContent('Add Internally');
      expect(amitRow).toHaveTextContent('WhatsApp');
    });

    it('allows selecting internal user with "Add Internally"', () => {
      render(<GroupCreationModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Internal Users'));

      // Find and click "Add Internally" for Amit Kumar
      const amitRow = screen.getByText('Amit Kumar').closest('div');
      const addInternallyBtn = amitRow?.querySelector('button:has-text("Add Internally")');
      
      if (addInternallyBtn) {
        fireEvent.click(addInternallyBtn);
      }

      // Should show 1 member selected
      expect(screen.getByText('1 member selected')).toBeInTheDocument();
    });

    it('allows selecting internal user with "WhatsApp"', () => {
      render(<GroupCreationModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Internal Users'));

      // Find and click "WhatsApp" for Amit Kumar
      const amitRow = screen.getByText('Amit Kumar').closest('div');
      const whatsappBtn = amitRow?.querySelector('button:has-text("WhatsApp")');
      
      if (whatsappBtn) {
        fireEvent.click(whatsappBtn);
      }

      // Should show 1 member selected
      expect(screen.getByText('1 member selected')).toBeInTheDocument();
    });

    it('allows selecting both invitation methods', () => {
      render(<GroupCreationModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Internal Users'));

      const amitRow = screen.getByText('Amit Kumar').closest('div');
      const addInternallyBtn = amitRow?.querySelector('button:has-text("Add Internally")');
      const whatsappBtn = amitRow?.querySelector('button:has-text("WhatsApp")');
      
      // Click both buttons
      if (addInternallyBtn) fireEvent.click(addInternallyBtn);
      if (whatsappBtn) fireEvent.click(whatsappBtn);

      // Should still show 1 member (same person, two methods)
      expect(screen.getByText('1 member selected')).toBeInTheDocument();
    });
  });

  describe('Group Creation Flow', () => {
    it('creates group with correct data structure', async () => {
      render(<GroupCreationModal {...defaultProps} />);

      // Select external contact
      fireEvent.click(screen.getByText('Ramesh Industries').closest('button')!);
      await waitFor(() => {
        expect(screen.getByText('Ramesh Patel')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByLabelText(/Ramesh Patel/i));

      // Switch to internal users and select one
      fireEvent.click(screen.getByText('Internal Users'));
      const amitRow = screen.getByText('Amit Kumar').closest('div');
      const addInternallyBtn = amitRow?.querySelector('button:has-text("Add Internally")');
      if (addInternallyBtn) fireEvent.click(addInternallyBtn);

      // Click Request Group Creation
      fireEvent.click(screen.getByText('Request Group Creation'));

      // Should call onCreateGroup with correct structure
      expect(mockOnCreateGroup).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'contact',
            name: 'Ramesh Patel',
            invitationMethod: 'whatsapp',
          }),
          expect.objectContaining({
            type: 'persona',
            name: 'Amit Kumar',
            invitationMethod: 'internal',
          }),
        ])
      );
    });

    it('disables create button when no members selected', () => {
      render(<GroupCreationModal {...defaultProps} />);

      const createButton = screen.getByText('Request Group Creation');
      expect(createButton).toBeDisabled();
      expect(createButton).toHaveClass('cursor-not-allowed');
    });

    it('closes modal after group creation', async () => {
      render(<GroupCreationModal {...defaultProps} />);

      // Select a contact
      fireEvent.click(screen.getByText('Ramesh Industries').closest('button')!);
      await waitFor(() => {
        expect(screen.getByText('Ramesh Patel')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByLabelText(/Ramesh Patel/i));

      // Create group
      fireEvent.click(screen.getByText('Request Group Creation'));

      // Should call both callbacks
      expect(mockOnCreateGroup).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Data Mapping Verification', () => {
    it('correctly maps buyer persona to buyer ID', () => {
      // Verify the mapping function works
      const buyerId = getBuyerIdFromPersona('p_buyer_1');
      expect(buyerId).toBe('buyer_1');

      const contacts = getContactsForBuyer(buyerId!);
      expect(contacts).toHaveLength(3);
      expect(contacts[0].name).toBe('Ramesh Patel');
    });

    it('handles all buyer personas correctly', () => {
      const buyerMappings = [
        { personaId: 'p_buyer_1', buyerId: 'buyer_1', name: 'Ramesh Industries' },
        { personaId: 'p_buyer_2', buyerId: 'buyer_2', name: 'Global Manufacturing Ltd' },
        { personaId: 'p_buyer_3', buyerId: 'buyer_3', name: 'TechnoSteel Corp' },
      ];

      buyerMappings.forEach(mapping => {
        const buyerId = getBuyerIdFromPersona(mapping.personaId);
        expect(buyerId).toBe(mapping.buyerId);

        const contacts = getContactsForBuyer(buyerId!);
        expect(contacts.length).toBeGreaterThan(0);
      });
    });
  });
});
