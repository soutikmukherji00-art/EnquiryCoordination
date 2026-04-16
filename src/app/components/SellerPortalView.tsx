/**
 * Seller Portal View
 * 
 * Full seller experience with:
 * - DM channels with CMs
 * - Group channels they're part of
 * - Pending group invitations
 */

import React, { useState, useEffect } from "react";
import { ConversationPanel } from "./ConversationPanel";
import { SellerInvitesList } from "./invite/SellerInvitesList";
import { GroupHeader } from "./GroupHeader";
import { SellerDMChatHeader } from "./SellerDMChatHeader";
import { PersonaSwitcher } from "./PersonaSwitcher";
import { SellerDMChannel } from "@/domain/message/seller-dm.types";
import { GroupChannel } from "@/domain/message/group.types";
import { Message } from "@/domain/message/message.types";
import { Persona } from "@/domain/enquiry/enquiry.types";
import { MessageCircle, Users, Mail, Clock, Store } from "lucide-react";
import { cn } from "./ui/utils";
import { InviteBadge } from "./invite/InviteBadge";
import { useMessageState, useMessageDispatch } from "@/infrastructure";
import { useSellerDMChannels, useSendSellerDMMessage } from "@/hooks/useSellerDMChannels";
import { getSellerIdByPersonaName } from "@/domain/seller/seller.types";
import { getSellerIdFromPersona } from "@/domain/buyer/buyer-persona-mapping";
import { getContactsForSeller } from "@/domain/seller/seller.mock-data";
import { createMessageSentEvent } from "@/domain/message/message.events";
import { stripRoleSuffix } from "@/domain/utils/name-utils";

interface SellerPortalViewProps {
  currentPersona: Persona;
  currentUser: string;
  currentRole: string;
  onPersonaChange: (persona: Persona) => void;
  showPersonaSwitcher?: boolean;
  showToast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
  personaMap: Map<string, Persona>;
  allGroupChannels: GroupChannel[];
  handleShareMessages: (messageIds: string[], toChannel: string, editedContents?: Record<string, string>) => void;
  onCreateThreadFromMessage?: (messageId: string) => void;
  setMobileComposer?: (composer: React.ReactNode) => void;
  handleMobileShareTrigger?: (trigger: (() => void) | null) => void;
  mobileComposer?: React.ReactNode;
}

type ViewMode = "dm" | "group" | "invites";

export function SellerPortalView({
  currentPersona,
  currentUser,
  currentRole,
  onPersonaChange,
  showPersonaSwitcher = true,
  showToast,
  personaMap,
  allGroupChannels,
  handleShareMessages,
  onCreateThreadFromMessage,
  setMobileComposer,
  handleMobileShareTrigger,
  mobileComposer,
}: SellerPortalViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("dm");
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const messageState = useMessageState();
  const messageDispatch = useMessageDispatch();
  
  // Get seller ID for this persona (s_1 format for DM channels and group sellerId)
  const sellerId = getSellerIdByPersonaName(currentPersona.displayName) || "";
  
  // Get seller data ID (seller_1 format) for invite company matching
  const sellerDataId = getSellerIdFromPersona(currentPersona.id);
  
  // Get all seller contact IDs for this seller (sc_1, sc_2, etc.)
  const sellerContactIds = sellerDataId 
    ? getContactsForSeller(sellerDataId).map(c => c.id) 
    : [];
  
  // Get seller DM channels
  const sellerDMChannels = useSellerDMChannels(sellerId);
  const { sendSellerDMMessage } = useSendSellerDMMessage();
  
  // Filter groups for this seller using memberPersonaIds, memberIds, and sellerId
  const groupChannels = (allGroupChannels || []).filter(group => {
    // Check if seller is a member by persona ID
    if (group.memberPersonaIds?.includes(currentPersona.id)) return true;
    // Check by seller ID in memberIds
    if (sellerId && group.memberIds?.includes(sellerId)) return true;
    // Check if this is a seller group for this seller
    if (group.type === "seller" && group.sellerId === sellerId) return true;
    // Check by persona ID in memberIds
    if (group.memberIds?.includes(currentPersona.id)) return true;
    return false;
  });
  
  // Get pending invites count - match by companyId (seller_N format), contactId, or legacy sellerId
  const pendingInvitesCount = (messageState.groupInvites || []).filter(
    inv => inv.recipientType === "seller" && 
           inv.status === "pending" &&
           (
             (sellerDataId && inv.companyId === sellerDataId) ||
             sellerContactIds.includes(inv.contactId) ||
             inv.contactId === sellerId
           )
  ).length;

  // Auto-select first channel based on view mode
  useEffect(() => {
    if (viewMode === "dm" && !selectedChannelId && sellerDMChannels.length > 0) {
      setSelectedChannelId(sellerDMChannels[0].id);
    } else if (viewMode === "group" && !selectedChannelId && groupChannels.length > 0) {
      setSelectedChannelId(groupChannels[0].id);
    }
  }, [viewMode, selectedChannelId, sellerDMChannels, groupChannels]);

  // Clear selection when switching to invites
  useEffect(() => {
    if (viewMode === "invites") {
      setSelectedChannelId(null);
    }
  }, [viewMode]);

  const selectedDMChannel = sellerDMChannels.find(ch => ch.id === selectedChannelId);
  const selectedGroup = groupChannels.find(g => g.id === selectedChannelId);

  // Handle sending group messages
  const handleGroupSendMessage = async (
    content: string,
    attachment?: any,
    audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number },
    mentions?: string[]
  ) => {
    if (!selectedGroup) return;
    
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "user",
      sender: stripRoleSuffix(currentPersona.displayName),
      senderPersonaId: currentPersona.id,
      senderRole: currentRole,
      content,
      timestamp: new Date(),
      attachment,
      mentions,
      audioRecording: audioRecording ? {
        audioUrl: audioRecording.audioUrl,
        transcription: audioRecording.transcription,
        duration: audioRecording.duration,
      } : undefined,
    };

    const event = createMessageSentEvent(
      selectedGroup.enquiryId || selectedGroup.id,
      selectedGroup.id,
      message
    );
    messageDispatch(event);
    showToast.success("Message sent");
  };

  // Handle adding members to group (no-op for sellers)
  const handleAddMembersToGroup = (memberIds: string[]) => {
    showToast.info("Only internal team members can add people to groups");
  };

  // Handle sending seller DM messages with correct API
  const handleSellerDMSend = async (
    content: string,
    attachment?: any,
    audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number },
    mentions?: string[]
  ) => {
    if (!selectedDMChannel || !sellerId) {
      showToast.error("Channel not found");
      return;
    }
    
    // Call sendSellerDMMessage with correct parameters:
    // (sellerId, sellerName, cmPersonaId, cmName, content, sender, senderRole, attachment, audioRecording, mentions, sourceEnquiryId, senderPersonaId)
    await sendSellerDMMessage(
      selectedDMChannel.sellerId,
      selectedDMChannel.sellerName,
      selectedDMChannel.cmPersonaId,
      selectedDMChannel.cmName,
      content,
      currentPersona.displayName,
      currentRole,
      attachment,
      audioRecording,
      mentions,
      selectedDMChannel.sourceEnquiryId,
      currentPersona.id
    );
    showToast.success("Message sent");
  };

  // Render the content based on view mode
  const renderContent = () => {
    if (viewMode === "invites") {
      return (
        <SellerInvitesList
          currentSellerId={sellerId}
          currentPersonaId={currentPersona.id}
          className="flex-1"
        />
      );
    }

    if (viewMode === "group") {
      if (!selectedGroup) {
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <div className="text-center max-w-md px-6">
              <div className="text-gray-400 mb-4">
                <Users className="mx-auto h-16 w-16" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No groups yet
              </h3>
              <p className="text-sm text-gray-500">
                When you accept a group invitation, the group conversation will appear here.
              </p>
            </div>
          </div>
        );
      }

      return (
        <>
          <GroupHeader
            group={selectedGroup}
            onAddMembers={handleAddMembersToGroup}
          />
          <ConversationPanel
            messages={selectedGroup.messages || []}
            currentChannel={selectedGroup.id}
            currentRole="Seller"
            enquiryId={selectedGroup.enquiryId || selectedGroup.id}
            enquiryMembers={[]}
            mentionParticipantPersonaIds={selectedGroup.memberPersonaIds ?? []}
            personaMap={personaMap}
            availableChannels={[]}
            onSendMessage={handleGroupSendMessage}
            onQuickAction={(actionId) => showToast.info(`Action: ${actionId}`)}
            onShareMessages={handleShareMessages}
            groupChannels={allGroupChannels}
            currentPersonaId={currentPersona.id}
            channelKind={selectedGroup.channelKind}
            onCreateThreadFromMessage={onCreateThreadFromMessage}
          />
        </>
      );
    }

    // DM Mode
    if (!selectedDMChannel) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md px-6">
            <div className="text-gray-400 mb-4">
              <MessageCircle className="mx-auto h-16 w-16" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No conversations yet
            </h3>
            <p className="text-sm text-gray-500">
              When a Category Manager sends you messages, they will appear here.
            </p>
          </div>
        </div>
      );
    }

    // Filter system messages for external users
    const visibleMessages = (selectedDMChannel.messages || []).filter(
      (msg) => msg.type !== "system"
    ) as Message[];

    return (
      <>
        <SellerDMChatHeader
          sellerName={selectedDMChannel.sellerName}
          cmName={selectedDMChannel.cmName}
          currentRole="Seller"
        />
        <ConversationPanel
          messages={visibleMessages}
          currentChannel={selectedDMChannel.id}
          currentRole="Seller"
          enquiryId={selectedDMChannel.sourceEnquiryId || selectedDMChannel.id}
          enquiryMembers={[]}
          mentionParticipantPersonaIds={[selectedDMChannel.cmPersonaId]}
          personaMap={personaMap}
          availableChannels={[]}
          onSendMessage={handleSellerDMSend}
          onQuickAction={(actionId) => showToast.info(`Action: ${actionId}`)}
          onShareMessages={handleShareMessages}
          isSellerDM={true}
          currentPersonaId={currentPersona.id}
          channelKind={undefined}
          onCreateThreadFromMessage={onCreateThreadFromMessage}
        />
      </>
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      {/* Header bar */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col flex-shrink-0">
        {/* Portal Header */}
        <div className="px-4 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-teal-600" />
            </div>
          <div className="flex-1">
              <h1 className="font-semibold text-lg text-gray-900">
                Seller Portal
              </h1>
              <p className="text-xs text-gray-500">{currentPersona.displayName}</p>
            </div>
          </div>
          {showPersonaSwitcher ? (
            <PersonaSwitcher
              currentPersona={currentPersona}
              onPersonaChange={onPersonaChange}
            />
          ) : null}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          {/* Direct Messages Section */}
          <div className="py-2">
            <div className="px-3 py-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Direct Messages {sellerDMChannels.length > 0 && `(${sellerDMChannels.length})`}
              </div>
            </div>
            {sellerDMChannels.length > 0 ? (
              sellerDMChannels.map((channel) => {
                const isActive = viewMode === "dm" && channel.id === selectedChannelId;
                
                return (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setViewMode("dm");
                      setSelectedChannelId(channel.id);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 transition-colors flex items-center gap-2",
                      isActive
                        ? "bg-white text-blue-700"
                        : "text-gray-700 hover:bg-white/50"
                    )}
                  >
                    <MessageCircle
                      className={cn(
                        "size-4 flex-shrink-0",
                        isActive ? "text-blue-600" : "text-gray-400"
                      )}
                    />
                    <span className="flex-1 text-sm truncate font-medium">
                      {channel.cmName}
                    </span>
                    {channel.unread && !isActive && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400 italic">
                No conversations yet
              </div>
            )}
          </div>

          {/* Groups Section */}
          {groupChannels.length > 0 && (
            <div className="py-2 border-t border-gray-200">
              <div className="px-3 py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Groups ({groupChannels.length})
                </div>
              </div>
              {groupChannels.map((group) => {
                const isActive = viewMode === "group" && group.id === selectedChannelId;
                
                return (
                  <button
                    key={group.id}
                    onClick={() => {
                      setViewMode("group");
                      setSelectedChannelId(group.id);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 transition-colors flex items-center gap-2",
                      isActive
                        ? "bg-white text-blue-700"
                        : "text-gray-700 hover:bg-white/50"
                    )}
                  >
                    <Users
                      className={cn(
                        "size-4 flex-shrink-0",
                        isActive ? "text-blue-600" : "text-gray-400"
                      )}
                    />
                    <span className="flex-1 text-sm truncate font-medium">
                      {group.name}
                    </span>
                    {group.status === "pending" && (
                      <Clock className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                    )}
                    {group.unread && !isActive && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Invitations Section */}
          <div className="py-2 border-t border-gray-200 mt-auto">
            <button
              onClick={() => setViewMode("invites")}
              className={cn(
                "w-full text-left px-3 py-2 transition-colors flex items-center gap-2",
                viewMode === "invites"
                  ? "bg-white text-blue-700"
                  : "text-gray-700 hover:bg-white/50"
              )}
            >
              <Mail
                className={cn(
                  "size-4 flex-shrink-0",
                  viewMode === "invites" ? "text-blue-600" : "text-gray-400"
                )}
              />
              <span className="flex-1 text-sm truncate font-medium">
                Group Invitations
              </span>
              {pendingInvitesCount > 0 && (
                <InviteBadge count={pendingInvitesCount} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}
