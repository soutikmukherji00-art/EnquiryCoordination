/**
 * Seller Group Creation Flow
 * 
 * Uses UnifiedGroupModal for creating seller groups with contact invites
 * Contacts are selected individually from seller companies
 */

import React from "react";
import { UnifiedGroupModal, GroupCreationResult } from "./group/UnifiedGroupModal";
import { GroupContactCard } from "./group/GroupContactCard";
import { Persona } from "@/domain/enquiry/enquiry.types";
import { SellerContact, MOCK_SELLER_CONTACTS, getSellerById } from "@/domain/seller/seller.mock-data";

interface SellerGroupCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: GroupCreationResult) => void;
  personas: Persona[];
}

export function SellerGroupCreationFlow({
  isOpen,
  onClose,
  onComplete,
  personas,
}: SellerGroupCreationFlowProps) {
  // Filter internal personas (CMs, BDMs, etc.)
  const internalPersonas = personas.filter(p => !p.isExternal);

  // Generate group name based on selected contacts
  const generateGroupName = (selectedContacts: SellerContact[]): string => {
    if (selectedContacts.length === 0) return "New Seller Group";
    
    // Get unique companies from selected contacts
    const companies = new Set(selectedContacts.map(c => {
      const seller = getSellerById(c.sellerId);
      return seller?.name || "Unknown";
    }));
    
    if (companies.size === 1) {
      const companyName = Array.from(companies)[0];
      return `${companyName} Pricing Discussion`;
    }
    
    return `Seller Group - ${companies.size} companies`;
  };

  return (
    <UnifiedGroupModal<SellerContact, Persona>
      isOpen={isOpen}
      onClose={onClose}
      onComplete={onComplete}
      title="Create Seller Group"
      groupType="seller"
      
      // External contacts (seller contacts)
      externalContacts={MOCK_SELLER_CONTACTS}
      getExternalContactId={(contact) => contact.id}
      getExternalContactName={(contact) => contact.name}
      renderExternalContact={(contact, isSelected, onToggle) => {
        const seller = getSellerById(contact.sellerId);
        return (
          <GroupContactCard
            name={contact.name}
            subtitle={`${contact.role} • ${seller?.name || 'Unknown Company'}`}
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
          badge={persona.role === "CM" ? "Category Manager" : undefined}
        />
      )}
      
      // Steps configuration
      steps={[
        {
          id: "contacts",
          title: "Select Seller Contacts",
          description: "Choose contacts from seller companies",
          type: "external",
        },
        {
          id: "team",
          title: "Add Team Members",
          description: "Add CMs, BDMs, or CX members",
          type: "internal",
        },
        {
          id: "name",
          title: "Name & Invite",
          description: "Review and send invitation",
          type: "name",
        },
      ]}
      
      generateGroupName={generateGroupName}
      allowSkipInternal={false}  // Seller groups require at least one internal member
      externalSearchPlaceholder="Search seller contacts..."
      internalSearchPlaceholder="Search team members..."
    />
  );
}