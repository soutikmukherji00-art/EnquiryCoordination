/**
 * Component: Conversation View
 * 
 * Renders the appropriate conversation panel based on the current navigation context
 */

import React, { useMemo } from 'react';
import { ConversationPanel } from './ConversationPanel';
import { BuyerDMHeader } from './BuyerDMHeader';
import { SellerDMHeader } from './SellerDMHeader';
import { GroupHeader } from './GroupHeader';
import { maskInternalForSellerGroup } from '@/domain/message/message.masking';
import type { Message } from '@/domain/message/message.types';
import type { BuyerDMChannel } from '@/domain/message/buyer-dm.types';
import type { SellerDMChannel } from '@/domain/message/seller-dm.types';
import type { GroupChannel } from '@/domain/message/group.types';
import { isExternalGroupChannel } from '@/domain/message/group-display.utils';

export interface ConversationViewProps {
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
  
  // Available options
  availableChannels: { id: string; label: string }[];
  allGroupChannels: GroupChannel[];
  
  // Handlers
  onSendMessage: (content: string, attachment?: any, audioRecording?: any, mentions?: string[]) => Promise<void>;
  onShareMessages: (messageIds: string[], toChannel: string, editedContents?: Record<string, string>) => Promise<void>;
  onQuickAction: (actionId: string) => void;
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
    selectedBuyerDM,
    selectedSellerDM,
    selectedGroup,
    currentChannel,
    currentRole,
    currentPersona,
    personaMap,
    messages,
    availableChannels,
    allGroupChannels,
    onSendMessage,
    onShareMessages,
    onQuickAction,
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
    return null;
  }, [selectedBuyerDM, selectedSellerDM, selectedGroup]);

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
            mentionParticipantPersonaIds={[
              selectedBuyerDM.buyerPersonaId,
              selectedBuyerDM.bdmPersonaId,
            ]}
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
            mentionParticipantPersonaIds={[selectedSellerDM.cmPersonaId]}
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
            mentionParticipantPersonaIds={selectedGroup.memberPersonaIds ?? []}
            personaMap={personaMap}
            availableChannels={[]}
            onSendMessage={onSendMessage}
            onQuickAction={onQuickAction}
            onShareMessages={onShareMessages}
            groupChannels={allGroupChannels}
            currentPersonaId={currentPersona.id}
            mobileComposerRenderer={mobileComposerRenderer}
            onMobileShareTrigger={onMobileShareTrigger}
            connectGroupChatTone={
              isExternalGroupChannel(selectedGroup) ? "external" : "internal"
            }
          />
        </div>
      </div>
    );
  }

  return null;
}
