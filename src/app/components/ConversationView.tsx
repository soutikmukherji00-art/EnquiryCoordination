/**
 * Component: Conversation View
 * 
 * Renders the appropriate conversation panel based on the current navigation context
 */

import React, { useMemo } from 'react';
import { ConversationPanel } from './ConversationPanel';
import { EnquiryHeader } from './EnquiryHeader';
import { BuyerDMHeader } from './BuyerDMHeader';
import { SellerDMHeader } from './SellerDMHeader';
import { GroupHeader } from './GroupHeader';
import { AuditTrailView } from './AuditTrailView';
import { maskInternalForSellerGroup } from '@/domain/message/message.masking';
import type { Enquiry } from '@/domain/enquiry/enquiry.types';
import type { Message } from '@/domain/message/message.types';
import type { BuyerDMChannel } from '@/domain/message/buyer-dm.types';
import type { SellerDMChannel } from '@/domain/message/seller-dm.types';
import type { GroupChannel } from '@/domain/message/group.types';

export interface ConversationViewProps {
  // Current context
  selectedEnquiry?: Enquiry;
  selectedBuyerDM?: BuyerDMChannel;
  selectedSellerDM?: SellerDMChannel;
  selectedGroup?: GroupChannel;
  
  // Common props
  currentChannel: string;
  currentRole: string;
  currentPersona: any;
  currentUser: string;
  personaMap: Map<string, any>;
  
  // Messages and data
  messages: Message[];
  enquiryMembers: any[];
  auditEntries?: any[];
  showAuditTrail?: boolean;
  
  // Available options
  availableChannels: { id: string; label: string }[];
  enrichedEnquiries?: Enquiry[];
  allGroupChannels: GroupChannel[];
  
  // Handlers
  onSendMessage: (content: string, attachment?: any, audioRecording?: any, mentions?: string[]) => Promise<void>;
  onShareMessages: (messageIds: string[], toChannel: string, editedContents?: Record<string, string>) => Promise<void>;
  onQuickAction: (actionId: string) => void;
  onStateChange?: (newState: string) => void;
  onConvertToOrder?: () => void;
  onToggleAuditTrail?: () => void;
  onAddMember?: (personaId: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onCreateSellerChannel?: () => void;
  onCreateEnquiry?: (data: any, messages: Message[]) => Promise<void>;
  onAddMembersToGroup?: (memberIds: string[]) => void;
  onSendToSellers?: (sellerIds: string[], content: string) => Promise<void>;
  onMentionSeller?: (sellerId: string, sellerName: string, content: string, attachment?: any) => Promise<void>;
  onCreateThreadFromMessage?: (messageId: string) => void;
  
  // Mobile
  mobileComposerRenderer?: (composer: React.ReactNode) => void;
  onMobileShareTrigger?: (trigger: () => void) => void;
}

export function ConversationView(props: ConversationViewProps) {
  const {
    selectedEnquiry,
    selectedBuyerDM,
    selectedSellerDM,
    selectedGroup,
    currentChannel,
    currentRole,
    currentPersona,
    personaMap,
    messages,
    enquiryMembers,
    auditEntries,
    showAuditTrail,
    availableChannels,
    enrichedEnquiries,
    allGroupChannels,
    onSendMessage,
    onShareMessages,
    onQuickAction,
    onStateChange,
    onConvertToOrder,
    onToggleAuditTrail,
    onAddMember,
    onRemoveMember,
    onCreateSellerChannel,
    onCreateEnquiry,
    onAddMembersToGroup,
    onSendToSellers,
    onMentionSeller,
    onCreateThreadFromMessage,
    mobileComposerRenderer,
    onMobileShareTrigger,
  } = props;

  // Determine the view type and ID
  const viewContext = useMemo(() => {
    if (selectedBuyerDM) return { type: 'buyerDM' as const, id: selectedBuyerDM.id };
    if (selectedSellerDM) return { type: 'sellerDM' as const, id: selectedSellerDM.id };
    if (selectedGroup) return { type: 'group' as const, id: selectedGroup.id };
    if (selectedEnquiry) return { type: 'enquiry' as const, id: selectedEnquiry.id };
    return null;
  }, [selectedBuyerDM, selectedSellerDM, selectedGroup, selectedEnquiry]);

  if (!viewContext) {
    return null;
  }

  // Render Buyer DM View
  if (viewContext.type === 'buyerDM' && selectedBuyerDM) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          <BuyerDMHeader
            buyerName={selectedBuyerDM.buyerName}
            buyerPersonaId={selectedBuyerDM.buyerPersonaId}
            bdmName={selectedBuyerDM.bdmName}
            currentRole={currentRole}
            buyerCompany="Birla Pivot"
            onCreateEnquiry={() => console.log('Create enquiry from DM')}
          />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ConversationPanel
            messages={selectedBuyerDM.messages}
            currentChannel="buyer-dm"
            currentRole={currentRole}
            enquiryId={selectedBuyerDM.id}
            enquiryMembers={[]}
            personaMap={personaMap}
            availableChannels={[]}
            onSendMessage={onSendMessage}
            onQuickAction={onQuickAction}
            onShareMessages={onShareMessages}
            isBuyerDM={true}
            buyerDMChannel={selectedBuyerDM}
            onCreateEnquiry={onCreateEnquiry}
            availableEnquiries={enrichedEnquiries}
            groupChannels={allGroupChannels}
            currentPersonaId={currentPersona.id}
            channelKind={selectedGroup.channelKind}
            onCreateThreadFromMessage={onCreateThreadFromMessage}
            mobileComposerRenderer={mobileComposerRenderer}
            onMobileShareTrigger={onMobileShareTrigger}
          />
        </div>
      </div>
    );
  }

  // Render Seller DM View
  if (viewContext.type === 'sellerDM' && selectedSellerDM) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          <SellerDMHeader
            sellerName={selectedSellerDM.sellerName}
            sellerId={selectedSellerDM.sellerId}
            cmName={selectedSellerDM.cmName}
            currentRole={currentRole}
          />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ConversationPanel
            messages={selectedSellerDM.messages}
            currentChannel="seller-dm"
            currentRole={currentRole}
            enquiryId={selectedSellerDM.id}
            enquiryMembers={[]}
            personaMap={personaMap}
            availableChannels={[]}
            isSellerDM={true}
            availableEnquiries={currentRole === "CM" ? enrichedEnquiries : undefined}
            onSendMessage={onSendMessage}
            onQuickAction={onQuickAction}
            onShareMessages={onShareMessages}
            groupChannels={allGroupChannels}
            currentPersonaId={currentPersona.id}
            channelKind={selectedGroup.channelKind}
            onCreateThreadFromMessage={onCreateThreadFromMessage}
            mobileComposerRenderer={mobileComposerRenderer}
            onMobileShareTrigger={onMobileShareTrigger}
          />
        </div>
      </div>
    );
  }

  // Render Group View
  if (viewContext.type === 'group' && selectedGroup) {
    const groupMessages = useMemo(() => {
      const rawMessages = selectedGroup.status === "pending" && selectedGroup.pendingMessage ? [
        {
          id: `system-pending-${selectedGroup.id}`,
          type: "system" as const,
          content: selectedGroup.pendingMessage,
          timestamp: selectedGroup.createdAt,
        },
        ...(selectedGroup.messages || [])
      ] : selectedGroup.messages || [];
      
      // Apply seller group masking if this is a seller group
      if (selectedGroup.type === "seller") {
        return rawMessages.map(msg => 
          maskInternalForSellerGroup(msg, currentRole, true)
        );
      }
      
      return rawMessages;
    }, [selectedGroup, currentRole]);

    return (
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          <GroupHeader
            group={selectedGroup}
            onAddMembers={onAddMembersToGroup}
          />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ConversationPanel
            messages={groupMessages}
            currentChannel="group"
            currentRole={currentRole}
            enquiryId={selectedGroup.id}
            enquiryMembers={[]}
            personaMap={personaMap}
            availableChannels={[]}
            onSendMessage={onSendMessage}
            onQuickAction={onQuickAction}
            onShareMessages={onShareMessages}
            groupChannels={allGroupChannels}
            currentPersonaId={currentPersona.id}
            mobileComposerRenderer={mobileComposerRenderer}
            onMobileShareTrigger={onMobileShareTrigger}
          />
        </div>
      </div>
    );
  }

  // Render Enquiry View
  if (viewContext.type === 'enquiry' && selectedEnquiry) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          <EnquiryHeader
            enquiry={selectedEnquiry}
            currentState={selectedEnquiry.state}
            members={enquiryMembers || []}
            personas={personaMap}
            onStateChange={onStateChange}
            onConvertToOrder={onConvertToOrder}
            onToggleAuditTrail={onToggleAuditTrail}
            showAuditTrail={showAuditTrail}
            onAddMember={onAddMember}
            onRemoveMember={onRemoveMember}
            onCreateSellerChannel={onCreateSellerChannel}
          />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          {showAuditTrail ? (
            <AuditTrailView
              entries={auditEntries || []}
              enquiryId={selectedEnquiry.id}
              onClose={onToggleAuditTrail}
            />
          ) : (
            <ConversationPanel
              messages={messages}
              currentChannel={currentChannel}
              currentRole={currentRole}
              enquiryId={selectedEnquiry.id}
              enquiryMembers={enquiryMembers}
              personaMap={personaMap}
              availableChannels={availableChannels}
              onSendMessage={onSendMessage}
              onShareMessages={onShareMessages}
              onSendToSellers={onSendToSellers}
              onMentionSeller={onMentionSeller}
              onCreateEnquiry={onCreateEnquiry}
              buyerDMChannels={[]}
              groupChannels={allGroupChannels}
              currentPersonaId={currentPersona.id}
              onCreateThreadFromMessage={onCreateThreadFromMessage}
              mobileComposerRenderer={mobileComposerRenderer}
              onMobileShareTrigger={onMobileShareTrigger}
            />
          )}
        </div>
      </div>
    );
  }

  return null;
}
