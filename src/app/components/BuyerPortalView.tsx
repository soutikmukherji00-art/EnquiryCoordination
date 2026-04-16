/**
 * Buyer Portal View
 * 
 * Full buyer experience with:
 * - DM with their BDM
 * - Group channels they're part of
 * - Pending group invitations
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ConversationPanel } from "./ConversationPanel";
import { BuyerInvitesList } from "./invite/BuyerInvitesList";
import { GroupHeader } from "./GroupHeader";
import { ThreadPanel } from "./ThreadPanel";
import { CreateThreadModal } from "./CreateThreadModal";
import { PersonaSwitcher } from "./PersonaSwitcher";
import { BuyerDMChannel } from "@/domain/message/buyer-dm.types";
import { GroupChannel } from "@/domain/message/group.types";
import { Attachment, Message } from "@/domain/message/message.types";
import { Persona } from "@/domain/enquiry/enquiry.types";
import { MessageCircle, Users, Mail, Clock, Send } from "lucide-react";
import { cn } from "./ui/utils";
import { InviteBadge } from "./invite/InviteBadge";
import { useMessageState, useMessageDispatch } from "@/infrastructure";
import { useBuyerDMForBuyer } from "@/hooks/useBuyerDMChannels";
import { useBuyerDMMessages } from "@/hooks/useBuyerDMMessages";
import {
  createMessageSentEvent,
  createThreadCreatedEvent,
  createThreadMessageSentEvent,
  createThreadViewedEvent,
} from "@/domain/message/message.events";
import { getBuyerIdFromPersona } from "@/domain/buyer/buyer-persona-mapping";
import { getContactsForBuyer, getPrimaryContactForBuyer } from "@/domain/buyer/buyer.mock-data";
import { stripRoleSuffix } from "@/domain/utils/name-utils";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Input } from "@/app/components/ui/input";

interface BuyerPortalViewProps {
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
  onSendBuyerMail?: (params: { subject?: string; body: string }) => Promise<void> | void;
  onSendBuyerWhatsApp?: (params: { body: string }) => Promise<void> | void;
  setMobileComposer?: (composer: React.ReactNode) => void;
  handleMobileShareTrigger?: (trigger: (() => void) | null) => void;
  mobileComposer?: React.ReactNode;
}

type ViewMode = "dm" | "group" | "invites" | "mail" | "whatsapp";

export function BuyerPortalView({
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
  onSendBuyerMail,
  onSendBuyerWhatsApp,
  setMobileComposer,
  handleMobileShareTrigger,
  mobileComposer,
}: BuyerPortalViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("dm");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [threadCreationMessageId, setThreadCreationMessageId] = useState<string | null>(null);
  const [threadCreationMessage, setThreadCreationMessage] = useState<Message | null>(null);
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [mailSending, setMailSending] = useState(false);
  const [mailSentAt, setMailSentAt] = useState<Date | null>(null);
  const [whatsappBody, setWhatsappBody] = useState("");
  const [whatsappSending, setWhatsappSending] = useState(false);
  const [whatsappSentAt, setWhatsappSentAt] = useState<Date | null>(null);
  const messageState = useMessageState();
  const messageDispatch = useMessageDispatch();
  
  // Get buyer's DM channel with their BDM
  const buyerDMChannel = useBuyerDMForBuyer(currentPersona.id);
  const buyerDMMessages = useBuyerDMMessages(buyerDMChannel?.id || "");
  
  // Get buyer data ID (buyer_N format) for invite matching
  const buyerDataId = getBuyerIdFromPersona(currentPersona.id);
  
  // Get all buyer contact IDs for this buyer (c_1, c_2, etc.)
  const buyerContactIds = buyerDataId 
    ? getContactsForBuyer(buyerDataId).map(c => c.id) 
    : [];
  const primaryBuyerContact = buyerDataId ? getPrimaryContactForBuyer(buyerDataId) : undefined;
  
  // Filter groups for this buyer persona using memberPersonaIds and memberIds
  const groupChannels = (allGroupChannels || []).filter(group => {
    // Check memberPersonaIds (includes both persona IDs and mapped contact IDs)
    if (group.memberPersonaIds?.includes(currentPersona.id)) return true;
    // Also check memberIds for contact-based membership
    if (group.memberIds?.includes(currentPersona.id)) return true;
    // Check if group was created by this persona
    if (group.createdBy === currentPersona.id) return true;
    return false;
  });
  
  // Get pending invites count - match by recipientPersonaId, companyId (buyer_N format), or contactId
  const pendingInvitesCount = (messageState.groupInvites || []).filter(
    inv => inv.recipientType === "buyer" && 
           inv.status === "pending" &&
           (
             inv.recipientPersonaId === currentPersona.id ||
             (buyerDataId && inv.companyId === buyerDataId) ||
             buyerContactIds.includes(inv.contactId)
           )
  ).length;

  const selectedGroup = groupChannels.find(g => g.id === selectedGroupId);
  const selectedThread = useMemo(
    () => selectedGroup?.threads?.find((thread) => thread.id === selectedThreadId),
    [selectedGroup, selectedThreadId],
  );
  const threadRootMessage = useMemo(
    () =>
      selectedThread
        ? selectedGroup?.messages.find((message) => message.id === selectedThread.rootMessageId) ??
          selectedThread.rootMessage
        : undefined,
    [selectedGroup, selectedThread],
  );

  // Auto-select first group if in group mode and no group selected
  useEffect(() => {
    if (viewMode === "group" && !selectedGroupId && groupChannels.length > 0) {
      setSelectedGroupId(groupChannels[0].id);
    }
  }, [viewMode, selectedGroupId, groupChannels]);

  // If switching away from groups, clear selection
  useEffect(() => {
    if (viewMode !== "group") {
      setSelectedGroupId(null);
    }
  }, [viewMode]);

  useEffect(() => {
    setSelectedThreadId(null);
  }, [selectedGroupId, viewMode]);

  useEffect(() => {
    if (selectedThreadId && !selectedThread) {
      setSelectedThreadId(null);
    }
  }, [selectedThreadId, selectedThread]);

  const handleBuyerMailSend = async () => {
    if (!onSendBuyerMail) return;

    const body = mailBody.trim();
    if (!body) return;

    setMailSending(true);
    try {
      await onSendBuyerMail({
        subject: mailSubject.trim() || undefined,
        body,
      });
      setMailSubject("");
      setMailBody("");
      setMailSentAt(new Date());
    } finally {
      setMailSending(false);
    }
  };

  const handleBuyerWhatsAppSend = async () => {
    if (!onSendBuyerWhatsApp) return;

    const body = whatsappBody.trim();
    if (!body) return;

    setWhatsappSending(true);
    try {
      await onSendBuyerWhatsApp({ body });
      setWhatsappBody("");
      setWhatsappSentAt(new Date());
    } finally {
      setWhatsappSending(false);
    }
  };

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
      sender: primaryBuyerContact?.name || stripRoleSuffix(currentPersona.displayName),
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

  // Handle adding members to group (no-op for buyers - they can't add members)
  const handleAddMembersToGroup = (memberIds: string[]) => {
    showToast.info("Only internal team members can add people to groups");
  };

  const handleOpenThread = useCallback((threadId: string) => {
    if (!selectedGroup?.threads?.some((thread) => thread.id === threadId)) return;
    setSelectedThreadId(threadId);
    messageDispatch(createThreadViewedEvent(threadId, currentPersona.id));
  }, [selectedGroup, messageDispatch, currentPersona.id]);

  const handleCloseThread = useCallback(() => {
    setSelectedThreadId(null);
  }, []);

  const handleCreateThreadFromMessageLocal = useCallback((messageId: string) => {
    if (!selectedGroup) return;
    const sourceMessage = selectedGroup.messages.find((message) => message.id === messageId);
    if (!sourceMessage) return;
    setThreadCreationMessageId(messageId);
    setThreadCreationMessage(sourceMessage);
    setShowThreadModal(true);
  }, [selectedGroup]);

  const handleConfirmThreadCreation = useCallback((params: { enquiryId?: string }) => {
    if (!selectedGroup || !threadCreationMessageId || !threadCreationMessage) return;

    const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    messageDispatch(
      createThreadCreatedEvent(
        threadId,
        selectedGroup.id,
        currentPersona.id,
        undefined,
        params.enquiryId ?? selectedGroup.enquiryId,
        threadCreationMessageId,
        threadCreationMessage,
      ),
    );
    messageDispatch(createThreadViewedEvent(threadId, currentPersona.id));
    setSelectedThreadId(threadId);
    setShowThreadModal(false);
    setThreadCreationMessageId(null);
    setThreadCreationMessage(null);
    showToast.success("Thread created successfully");
  }, [
    selectedGroup,
    threadCreationMessageId,
    threadCreationMessage,
    messageDispatch,
    currentPersona.id,
    showToast,
  ]);

  const handleCancelThreadCreation = useCallback(() => {
    setShowThreadModal(false);
    setThreadCreationMessageId(null);
    setThreadCreationMessage(null);
  }, []);

  const handleSendThreadReply = useCallback(async (
    threadId: string,
    groupId: string,
    content: string,
    attachment?: Attachment,
    audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number },
    mentionedPersonaIds?: string[],
  ) => {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "user",
      sender: primaryBuyerContact?.name || stripRoleSuffix(currentPersona.displayName),
      senderPersonaId: currentPersona.id,
      senderRole: currentRole,
      content,
      timestamp: new Date(),
      attachment,
      mentions: mentionedPersonaIds,
      audioRecording: audioRecording
        ? {
            blob: audioRecording.audioBlob,
            url: audioRecording.audioUrl,
            durationMs: audioRecording.duration,
            transcription: {
              text: audioRecording.transcription,
              status: "complete",
            },
          }
        : undefined,
    };

    messageDispatch(createThreadMessageSentEvent(threadId, groupId, message));
    showToast.success("Reply sent");
  }, [
    primaryBuyerContact?.name,
    currentPersona.displayName,
    currentPersona.id,
    currentRole,
    messageDispatch,
    showToast,
  ]);

  // Render the content based on view mode
  const renderContent = () => {
    if (viewMode === "invites") {
      return (
        <BuyerInvitesList
          currentPersonaId={currentPersona.id}
          className="flex-1"
        />
      );
    }

    if (viewMode === "mail") {
      return (
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Send mail to BP enquiry</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Your email will be classified by the bot and forwarded to the Buyer Mail group.
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <Input
                    value={mailSubject}
                    onChange={(e) => setMailSubject(e.target.value)}
                    placeholder="Subject line for the buyer enquiry"
                    className="h-11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mail body</label>
                  <Textarea
                    value={mailBody}
                    onChange={(e) => setMailBody(e.target.value)}
                    placeholder="Write the buyer mail body here..."
                    className="min-h-40 resize-none"
                  />
                </div>

                {mailSentAt && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                    Mail sent successfully at {mailSentAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    The buyer mail is send-only here. BDMs will see it inside Buyer Mail.
                  </p>
                  <Button
                    type="button"
                    onClick={handleBuyerMailSend}
                    disabled={mailSending || !mailBody.trim() || !onSendBuyerMail}
                    className="gap-2"
                  >
                    <Send className="size-4" />
                    {mailSending ? "Sending..." : "Send mail"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (viewMode === "whatsapp") {
      return (
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Send WhatsApp to BP enquiry</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Your WhatsApp message will be classified by the bot and forwarded to the Buyer WhatsApp group.
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp message</label>
                  <Textarea
                    value={whatsappBody}
                    onChange={(e) => setWhatsappBody(e.target.value)}
                    placeholder="Write the buyer WhatsApp message here..."
                    className="min-h-40 resize-none"
                  />
                </div>

                {whatsappSentAt && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                    WhatsApp sent successfully at {whatsappSentAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    The WhatsApp bot is send-only here. BDMs will see it inside Buyer WhatsApp.
                  </p>
                  <Button
                    type="button"
                    onClick={handleBuyerWhatsAppSend}
                    disabled={whatsappSending || !whatsappBody.trim() || !onSendBuyerWhatsApp}
                    className="gap-2"
                  >
                    <Send className="size-4" />
                    {whatsappSending ? "Sending..." : "Send WhatsApp"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 min-w-0">
              <ConversationPanel
                messages={selectedGroup.messages || []}
                currentChannel={selectedGroup.id}
                currentRole="Buyer"
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
                onOpenThread={handleOpenThread}
                onCreateThreadFromMessage={handleCreateThreadFromMessageLocal}
              />
            </div>
            {selectedThread && (
              <div className="w-[420px] max-w-[45%] min-w-[360px] border-l border-gray-200 bg-white">
                <ThreadPanel
                  thread={selectedThread}
                  rootMessage={threadRootMessage}
                  groupName={selectedGroup.name}
                  groupId={selectedGroup.id}
                  currentPersonaId={currentPersona.id}
                  currentUser={currentUser}
                  currentRole="Buyer"
                  personaMap={personaMap}
                  onSendReply={handleSendThreadReply}
                  onClose={handleCloseThread}
                  onShareMessages={handleShareMessages}
                  groupChannels={allGroupChannels}
                  mentionRosterPersonaIds={selectedGroup.memberPersonaIds ?? []}
                />
              </div>
            )}
          </div>
          <CreateThreadModal
            isOpen={showThreadModal}
            onClose={handleCancelThreadCreation}
            onConfirm={handleConfirmThreadCreation}
            messagePreview={threadCreationMessage?.content ?? ""}
          />
        </>
      );
    }

    // DM Mode
    if (!buyerDMChannel) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md px-6">
            <div className="text-gray-400 mb-4">
              <MessageCircle className="mx-auto h-16 w-16" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to Birla Pivot
            </h3>
            <p className="text-sm text-gray-500">
              Start a conversation with your Business Development Manager to begin.
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="font-semibold text-xl text-gray-900">
                Chat with {buyerDMChannel.bdmName}
              </h1>
              <p className="text-sm text-gray-500">Direct message</p>
            </div>
          </div>
        </div>
        <ConversationPanel
          messages={buyerDMChannel.messages || []}
          currentChannel="buyer-dm"
          currentRole="Buyer"
          enquiryId={buyerDMChannel.id}
          enquiryMembers={[]}
          mentionParticipantPersonaIds={[
            buyerDMChannel.buyerPersonaId,
            buyerDMChannel.bdmPersonaId,
          ]}
          personaMap={personaMap}
          availableChannels={[]}
          onSendMessage={async (content, attachment, audioRecording, mentions) => {
            await buyerDMMessages.sendBuyerDMMessage(content, currentUser, currentRole, attachment, audioRecording, mentions);
            showToast.success("Message sent");
          }}
          onQuickAction={(actionId) => showToast.info(`Action: ${actionId}`)}
          onShareMessages={handleShareMessages}
          isBuyerDM={true}
          buyerDMChannel={buyerDMChannel}
          groupChannels={allGroupChannels}
          currentPersonaId={currentPersona.id}
          channelKind={undefined}
          onCreateThreadFromMessage={onCreateThreadFromMessage}
        />
      </>
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          <div className="flex-1">
              <h1 className="font-semibold text-lg text-gray-900">
                {buyerDMChannel?.buyerName || currentPersona.displayName} Portal
              </h1>
              <p className="text-xs text-gray-500">Welcome back</p>
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
          {/* Direct Message */}
          <div className="py-2">
            <div className="px-3 py-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Direct Message
              </div>
            </div>
            {buyerDMChannel && (
              <button
                onClick={() => setViewMode("dm")}
                className={cn(
                  "w-full text-left px-3 py-2 transition-colors flex items-center gap-2",
                  viewMode === "dm"
                    ? "bg-white text-blue-700"
                    : "text-gray-700 hover:bg-white/50"
                )}
              >
                <MessageCircle
                  className={cn(
                    "size-4 flex-shrink-0",
                    viewMode === "dm" ? "text-blue-600" : "text-gray-400"
                  )}
                />
                <span className="flex-1 text-sm truncate font-medium">
                  {buyerDMChannel.bdmName}
                </span>
                {buyerDMChannel.unread && viewMode !== "dm" && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                )}
              </button>
            )}
            {!buyerDMChannel && (
              <div className="px-3 py-2 text-sm text-gray-400 italic">
                No DM channel available
              </div>
            )}
          </div>

          {/* Mail */}
          <div className="py-2 border-t border-gray-200">
            <button
              onClick={() => setViewMode("mail")}
              className={cn(
                "w-full text-left px-3 py-2 transition-colors flex items-center gap-2",
                viewMode === "mail"
                  ? "bg-white text-blue-700"
                  : "text-gray-700 hover:bg-white/50"
              )}
            >
              <Mail
                className={cn(
                  "size-4 flex-shrink-0",
                  viewMode === "mail" ? "text-blue-600" : "text-gray-400"
                )}
              />
              <span className="flex-1 text-sm truncate font-medium">
                Mail to BP enquiry
              </span>
            </button>
          </div>

          {/* WhatsApp Bot */}
          <div className="py-2 border-t border-gray-200">
            <button
              onClick={() => setViewMode("whatsapp")}
              className={cn(
                "w-full text-left px-3 py-2 transition-colors flex items-center gap-2",
                viewMode === "whatsapp"
                  ? "bg-white text-blue-700"
                  : "text-gray-700 hover:bg-white/50"
              )}
            >
              <MessageCircle
                className={cn(
                  "size-4 flex-shrink-0",
                  viewMode === "whatsapp" ? "text-blue-600" : "text-gray-400"
                )}
              />
              <span className="flex-1 text-sm truncate font-medium">
                WhatsApp to BP enquiry
              </span>
            </button>
          </div>

          {/* Groups */}
          {groupChannels.length > 0 && (
            <div className="py-2 border-t border-gray-200">
              <div className="px-3 py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Groups ({groupChannels.length})
                </div>
              </div>
              {groupChannels.map(group => (
                <button
                  key={group.id}
                  onClick={() => {
                    setViewMode("group");
                    setSelectedGroupId(group.id);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 transition-colors flex items-center gap-2",
                    viewMode === "group" && selectedGroupId === group.id
                      ? "bg-white text-blue-700"
                      : "text-gray-700 hover:bg-white/50"
                  )}
                >
                  <Users
                    className={cn(
                      "size-4 flex-shrink-0",
                      viewMode === "group" && selectedGroupId === group.id
                        ? "text-blue-600"
                        : "text-gray-400"
                    )}
                  />
                  <span className="flex-1 text-sm truncate font-medium">
                    {group.name}
                  </span>
                  {group.status === "pending" && (
                    <Clock className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                  )}
                  {group.unread && !(viewMode === "group" && selectedGroupId === group.id) && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Invitations */}
          <div className="py-2 border-t border-gray-200">
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
