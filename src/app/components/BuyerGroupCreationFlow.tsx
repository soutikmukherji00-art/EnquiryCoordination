/**
 * Buyer Group Creation Flow
 * 
 * Uses UnifiedGroupModal for creating buyer groups with contact invites
 * Contacts are selected individually from buyer companies
 */

import React from "react";
import { UnifiedGroupModal, GroupCreationResult } from "./group/UnifiedGroupModal";
import { GroupContactCard } from "./group/GroupContactCard";
import { Persona } from "@/domain/enquiry/enquiry.types";
import { Contact, MOCK_CONTACTS, getBuyerById } from "@/domain/buyer/buyer.mock-data";

interface BuyerGroupCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: GroupCreationResult) => void;
  personas: Persona[];
}

export function BuyerGroupCreationFlow({
  isOpen,
  onClose,
  onComplete,
  personas,
}: BuyerGroupCreationFlowProps) {
  // Filter internal personas (team members)
  const internalPersonas = personas.filter(p => !p.isExternal);

  // Generate group name based on selected contacts
  const generateGroupName = (selectedContacts: Contact[]): string => {
    if (selectedContacts.length === 0) return "New Buyer Group";
    
    // Get unique companies from selected contacts
    const companies = new Set(selectedContacts.map(c => {
      const buyer = getBuyerById(c.buyerId);
      return buyer?.name || "Unknown";
    }));
    
    if (companies.size === 1) {
      const companyName = Array.from(companies)[0];
      return `${companyName} Group`;
    }
    
    return `Multi-Buyer Group (${companies.size} companies)`;
  };

  return (
    <UnifiedGroupModal<Contact, Persona>
      isOpen={isOpen}
      onClose={onClose}
      onComplete={onComplete}
      title="Create Buyer Group"
      groupType="buyer"
      
      // External contacts (buyer contacts)
      externalContacts={MOCK_CONTACTS}
      getExternalContactId={(contact) => contact.id}
      getExternalContactName={(contact) => contact.name}
      renderExternalContact={(contact, isSelected, onToggle) => {
        const buyer = getBuyerById(contact.buyerId);
        return (
          <GroupContactCard
            name={contact.name}
            subtitle={`${contact.role} • ${buyer?.name || 'Unknown Company'}`}
            description={contact.phone}
            avatarText={contact.name.substring(0, 2).toUpperCase()}
            isSelected={isSelected}
            onToggle={onToggle}
          />
        );
      }}
      
      // Internal members (team)
      internalMembers={internalPersonas}
      getInternalMemberId={(persona) => persona.id}
      getInternalMemberName={(persona) => persona.displayName}
      renderInternalMember={(persona, isSelected, onToggle) => (
        <GroupContactCard
          name={persona.displayName}
          subtitle={persona.role}
          avatarText={persona.displayName.substring(0, 2).toUpperCase()}
          isSelected={isSelected}
          onToggle={onToggle}
        />
      )}
      
      // Steps configuration
      steps={[
        {
          id: "contacts",
          title: "Select Buyer Contacts",
          description: "Choose contacts from buyer companies",
          type: "external",
        },
        {
          id: "name",
          title: "Name & Invite",
          description: "Review members and send invitations",
          type: "name",
        },
      ]}
      
      generateGroupName={generateGroupName}
      allowSkipInternal={true}
      externalSearchPlaceholder="Search buyer contacts..."
      internalSearchPlaceholder="Search team members..."
    />
  );
}