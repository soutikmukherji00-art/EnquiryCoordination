import * as React from "react";
import { useState, useEffect } from "react";
import { PersonaSwitcher } from "@/app/components/PersonaSwitcher";
import { SellerPortalHeader } from "@/app/components/SellerPortalHeader";
import { SellerDMChatHeader } from "@/app/components/SellerDMChatHeader";
import { ConversationPanel } from "@/app/components/ConversationPanel";
import { Toaster } from "@/app/components/ui/sonner";
import { SellerChannel, Message } from "@/domain/message/message.types";
import { SellerDMChannel } from "@/domain/message/seller-dm.types";
import { Role, Persona } from "@/domain/enquiry/enquiry.types";
import { ArrowRight, MessageCircle } from "lucide-react";
import { cn } from "@/app/components/ui/utils";

const __DEV_LOG__ = false;
const devLog = __DEV_LOG__ ? (label: string, data?: any) => console.log(label, data) : (() => {}) as (label: string, data?: any) => void;

interface SellerViewProps {
  selectedEnquiryId: string;
  currentRole: Role;
  currentPersona: Persona;
  sellerChannels: SellerDMChannel[]; // Updated to use SellerDMChannel (DM model)
  onPersonaChange: (persona: Persona) => void;
  onSendMessage: (sellerId: string, content: string, attachment?: { name: string; type: string; url?: string }, audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number }) => void;
  onQuickAction: (actionId: string) => void;
  onShareMessages: (messageIds: string[], toChannel: string, editedContents?: Record<string, string>) => void;
}

export function SellerView({
  selectedEnquiryId,
  currentRole,
  currentPersona,
  sellerChannels,
  onPersonaChange,
  onSendMessage,
  onQuickAction,
  onShareMessages,
}: SellerViewProps) {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  // Update selected channel when channels change
  useEffect(() => {
    devLog('[SellerView] Channels updated:', {
      channelCount: sellerChannels.length,
      channels: sellerChannels.map(ch => ({
        id: ch.id,
        sellerName: ch.sellerName,
        cmName: ch.cmName,
        messageCount: ch.messages.length
      })),
      currentSelectedId: selectedChannelId
    });

    // If channels array is empty, clear selection
    if (sellerChannels.length === 0) {
      if (selectedChannelId !== null) {
        devLog('[SellerView] No channels available, clearing selection');
        setSelectedChannelId(null);
      }
      return;
    }

    // If no channel is selected, select the first one
    if (!selectedChannelId) {
      devLog('[SellerView] Auto-selecting first channel:', sellerChannels[0].id);
      setSelectedChannelId(sellerChannels[0].id);
      return;
    }
    
    // If selected channel no longer exists, switch to first available
    const channelExists = sellerChannels.find(ch => ch.id === selectedChannelId);
    if (!channelExists) {
      devLog('[SellerView] Selected channel no longer exists, switching to first available');
      setSelectedChannelId(sellerChannels[0].id);
    }
  }, [sellerChannels, selectedChannelId]); // Add selectedChannelId to dependencies

  devLog('[SellerView] Rendering with channels:', {
    channelCount: sellerChannels.length,
    channels: sellerChannels.map(ch => ({
      id: ch.id,
      sellerName: ch.sellerName,
      cmName: ch.cmName,
      messageCount: ch.messages.length
    })),
    selectedChannelId
  });

  // If no seller channels exist, show empty state
  if (sellerChannels.length === 0) {
    return (
      <div className="h-full w-full flex flex-col bg-gray-50 overflow-hidden">
        <SellerPortalHeader
          title="Seller Portal"
          subtitle="No conversations yet"
          currentPersona={currentPersona}
          onPersonaChange={onPersonaChange}
        />
        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center">
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

        <Toaster />
      </div>
    );
  }

  // Wait for channel selection to be set by useEffect
  if (!selectedChannelId) {
    devLog('[SellerView] Waiting for channel selection...');
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Find the active seller channel
  const activeSellerChannel = sellerChannels.find((ch) => ch.id === selectedChannelId);

  if (!activeSellerChannel) {
    // This can happen during state updates - the useEffect will fix it in the next render
    // Show loading state silently without warning
    devLog('[SellerView] Channel selection updating, waiting for sync...', { 
      selectedChannelId,
      availableChannels: sellerChannels.map(ch => ch.id)
    });
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading conversation...</div>
      </div>
    );
  }

  devLog('[SellerView] Active channel:', {
    id: activeSellerChannel.id,
    sellerName: activeSellerChannel.sellerName,
    cmName: activeSellerChannel.cmName,
    messageCount: activeSellerChannel.messages.length
  });

  // Filter system messages for external users - policy-driven display handles sender masking
  const visibleMessages = activeSellerChannel.messages.filter(
    (msg) => msg.type !== "system"
  ) as Message[];

  devLog('[SellerView] Visible messages:', visibleMessages.length);

  return (
    <div className="h-screen flex flex-col bg-white">
      <SellerPortalHeader
        title="Seller Portal"
        currentPersona={currentPersona}
        onPersonaChange={onPersonaChange}
      />
      {/* Main Content: 2-column layout (conversation list + chat) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Conversation List - Same design as Buyer DM */}
        <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
          {/* Header with section title */}
          <div className="px-3 py-3 border-b border-gray-200 bg-white">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Direct Messages
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto py-2">
            {sellerChannels.map((channel) => {
              const isActive = channel.id === selectedChannelId;
              const lastMessage = channel.messages[channel.messages.length - 1];
              const unreadCount = 0; // TODO: Implement unread tracking

              return (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannelId(channel.id)}
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
                      isActive
                        ? "text-blue-600"
                        : "text-gray-400"
                    )}
                  />
                  <span className="flex-1 text-sm truncate font-medium">{channel.cmName}</span>
                  {channel.unread && !isActive && (
                    <div className="size-2 rounded-full bg-blue-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Chat Panel */}
        <div className="flex-1 flex flex-col">
          <SellerDMChatHeader
            cmName={activeSellerChannel.cmName}
            role="Category Manager"
          />
          <ConversationPanel
            messages={visibleMessages}
            currentChannel={activeSellerChannel.id}
            currentRole={currentRole}
            enquiryId={selectedEnquiryId}
            enquiryMembers={[]}
            mentionParticipantPersonaIds={[activeSellerChannel.cmPersonaId]}
            personaMap={new Map()}
            availableChannels={[]}
            onSendMessage={(content, attachment, audioRecording) => {
              // Send as the active seller
              onSendMessage(
                activeSellerChannel.sellerId,
                content,
                attachment,
                audioRecording
              );
            }}
            onQuickAction={onQuickAction}
            onShareMessages={onShareMessages}
          />
        </div>
      </div>

      <Toaster />
    </div>
  );
}