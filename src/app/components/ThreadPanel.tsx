/**
 * ThreadPanel Component
 *
 * Displays a thread (reply chain) from a group's main chat.
 * Shows:
 * - Root message pinned at top (with group context)
 * - Thread replies below (scrollable)
 * - Composer at bottom for new replies
 * - Optional collapsible enquiry structured data when thread is tagged with an enquiry
 * - Sharing support for messages
 *
 * Used in two contexts:
 * 1. Groups view → right panel (replaces StructuredPanel when thread is open)
 * 2. Enquiry Threads view → middle column (thread is the main content)
 */

import { useState, useRef, useEffect, useCallback, memo } from "react";
import {
  X,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Send,
  Hash,
  Lock,
  Globe,
  Plus,
} from "lucide-react";
import { AppleShareIcon } from "@/app/components/icons/AppleShareIcon";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Checkbox } from "@/app/components/ui/checkbox";
import { AvatarWithStatus } from "@/app/components/AvatarWithStatus";
import { cn } from "@/app/components/ui/utils";
import { PersonaHoverTrigger } from "@/app/components/PersonaHoverTrigger";
import { PersonaMentionDropdown } from "@/app/components/PersonaMentionDropdown";
import { RoleBadge } from "@/app/components/RoleBadge";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Thread } from "@/domain/message/thread.types";
import { Message } from "@/domain/message/message.types";
import { Persona } from "@/domain/enquiry/enquiry.types";
import { getPersonaById } from "@/domain/persona/persona.data";
import { formatTime } from "@/domain/utils/formatting";
import { formatCategories, type Category } from "@/domain/category/category.types";
import { MOCK_BUYERS } from "@/domain/buyer/buyer.mock-data";
import { getConnectGroupSectionLabel } from "@/domain/message/group-display.utils";

// Command groups for @ menu - ONLY action/state commands, NOT member tagging
const COMMAND_GROUPS = [
  {
    label: "Actions",
    commands: [
      {
        id: "@normalize-quote",
        label: "@normalize-quote",
        description: "Normalize seller quote",
        notifies: "CM",
      },
      {
        id: "@share-quote",
        label: "@share-quote",
        description: "Share quote with buyer",
        notifies: "Buyer",
      },
      {
        id: "@request-po",
        label: "@request-po",
        description: "Request PO from buyer",
        notifies: "Buyer",
      },
      {
        id: "@add-margin",
        label: "@add-margin",
        description: "Add margin to quote",
        notifies: "CM",
      },
    ],
  },
  {
    label: "Information",
    commands: [
      {
        id: "@show-summary",
        label: "@show-summary",
        description: "Show AI summary",
      },
      {
        id: "@show-timeline",
        label: "@show-timeline",
        description: "Show full timeline",
      },
      {
        id: "@show-quotes",
        label: "@show-quotes",
        description: "Display all quotes",
      },
    ],
  },
  {
    label: "State Changes",
    commands: [
      {
        id: "@change-state",
        label: "@change-state",
        description: "Change enquiry state",
        changesState: true,
        notifies: "Team",
      },
      {
        id: "@buyer-responding",
        label: "@buyer-responding",
        description: "Mark as buyer responding",
        changesState: true,
        notifies: "Buyer, Team",
      },
      {
        id: "@seller-quoting",
        label: "@seller-quoting",
        description: "Sellers are quoting",
        changesState: true,
        notifies: "Sellers, CM",
      },
      {
        id: "@quote-shared",
        label: "@quote-shared",
        description: "Quote shared with buyer",
        changesState: true,
        notifies: "Buyer",
      },
      {
        id: "@awaiting-po",
        label: "@awaiting-po",
        description: "Waiting for PO",
        changesState: true,
        notifies: "Buyer",
      },
      {
        id: "@po-received",
        label: "@po-received",
        description: "PO received",
        changesState: true,
        notifies: "CX, Team",
      },
      {
        id: "@cx-validated",
        label: "@cx-validated",
        description: "CX validated PO",
        changesState: true,
        notifies: "BDM, CM",
      },
      {
        id: "@convert-to-order",
        label: "@convert-to-order",
        description: "Convert to order",
        changesState: true,
        notifies: "All",
      },
    ],
  },
];

// Tagging commands (including those in renderMessageContent) - for highlighting
const ALL_TAGGING_COMMANDS = [
  { id: "@bdm", label: "@bdm" },
  { id: "@cm", label: "@cm" },
  { id: "@cx", label: "@cx" },
];

interface ThreadPanelProps {
  thread: Thread;
  rootMessage?: Message; // The original message that started the thread
  groupName: string;
  groupId: string;
  currentPersonaId: string;
  currentUser: string;
  currentRole: string;
  personaMap: Map<string, Persona>;
  onSendReply: (threadId: string, groupId: string, content: string) => void;
  onClose: () => void;
  // Sharing support
  onShareMessages?: (messageIds: string[], toChannel: string, editedContents?: Record<string, string>) => void;
  groupChannels?: any[]; // All group channels for share target selection
  // Optional: Enquiry structured data (shown when thread is tagged)
  enquiryData?: {
    enquiryId: string;
    buyerName?: string;
    buyerPersonaId?: string; // NEW: For PersonaHoverTrigger
    state?: string;
    estimatedValue?: number;
    categories?: Category[]; // NEW: Categories for display
  };
  // Buyer info for main-mode header (derived from source group)
  buyerInfo?: {
    buyerName: string;
    buyerPersonaId?: string; // For PersonaHoverTrigger
    groupName?: string;      // "Buyer Group" label
  };
  // Layout mode
  mode?: "side-panel" | "main"; // side-panel = right column in Groups, main = middle column in Enquiry Threads
  onOpenShareModal?: (sourceContext: any, messageIds: string[], sourceMessages: Message[]) => void; // NEW: Unified share modal
  customInlineWidget?: React.ReactNode; // NEW: Custom inline widget (e.g., delivery widget)
  // Tag enquiry post facto
  onTagEnquiry?: (threadId: string, enquiryId: string) => void;
  onCreateEnquiryFromThread?: (threadId: string, buyerId: string) => void; // NEW: Create new enquiry from thread
  availableEnquiries?: Array<{
    id: string;
    buyerName?: string;
    state?: string;
  }>;
}

const formatCurrency = (amount?: number): string => {
  if (!amount) return "";
  return `₹${amount.toLocaleString("en-IN")}`;
};

const getStateBadgeColor = (state: string): string => {
  const stateColors: Record<string, string> = {
    "Draft": "bg-[#eef4fd] text-[#08479e] border-[#0a58c6]",
    "Pending Response": "bg-[rgba(242,241,252,0.6)] text-[#4039ad] border-[#8e88e7]",
    "Converted to Order": "bg-[#e5f7df] text-[#2c541e] border-[#57a53a]",
  };
  
  return stateColors[state] || "bg-gray-100 text-gray-600 border-gray-300";
};

export const ThreadPanel = memo(function ThreadPanel({
  thread,
  rootMessage,
  groupName,
  groupId,
  currentPersonaId,
  currentUser,
  currentRole,
  personaMap,
  onSendReply,
  onClose,
  onShareMessages,
  groupChannels,
  enquiryData,
  buyerInfo,
  mode = "side-panel",
  onOpenShareModal,
  customInlineWidget, // NEW: Custom inline widget
  onTagEnquiry,
  onCreateEnquiryFromThread,
  availableEnquiries,
}: ThreadPanelProps) {
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tag enquiry state
  const [showTagEnquiryDialog, setShowTagEnquiryDialog] = useState(false);
  const [selectedTagEnquiryId, setSelectedTagEnquiryId] = useState<string>("__none__");
  const [selectedNewEnquiryBuyer, setSelectedNewEnquiryBuyer] = useState<string>("");

  // Sharing state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [editedMessageContents, setEditedMessageContents] = useState<Record<string, string>>({});

  // @ mention/command dropdown state
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionDropdownPosition, setMentionDropdownPosition] = useState<{ bottom?: number; top?: number; left: number }>({ left: 0 });
  const [mentionSearchQuery, setMentionSearchQuery] = useState("");

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.messages.length]);

  const handleSend = useCallback(() => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    onSendReply(thread.id, groupId, trimmed);
    setReplyText("");
  }, [replyText, thread.id, groupId, onSendReply]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const getInitials = (name?: string) => {
    if (!name || name.length === 0) return "?";
    return name[0].toUpperCase();
  };

  const isSidePanel = mode === "side-panel";
  const canShare = !!onShareMessages;

  // Build categorized group share targets
  const isGroupExternal = (group: any): boolean => {
    if (group.buyerId || group.sellerId) return true;
    return (group.memberPersonaIds || []).some((id: string) => /^p_(buyer|seller)_/.test(id));
  };

  // Determine current group type for icon display
  const currentGroup = groupChannels?.find(g => g.id === groupId);
  const isCurrentGroupExternal = currentGroup ? isGroupExternal(currentGroup) : false;
  const GroupIcon = isCurrentGroupExternal ? Globe : Lock;

  const shareableGroups = (() => {
    const result = {
      birlaPivot: [] as { id: string; label: string }[],
      buyer: [] as { id: string; label: string }[],
      seller: [] as { id: string; label: string }[],
    };
    if (!groupChannels || !currentPersonaId) return result;
    groupChannels
      .filter((g: any) =>
        g.memberPersonaIds?.includes(currentPersonaId) &&
        g.id !== groupId // Exclude current group
      )
      .forEach((g: any) => {
        const entry = { id: g.id, label: g.name };
        if (g.type === "buyer") {
          result.buyer.push(entry);
        } else if (g.type === "seller") {
          result.seller.push(entry);
        } else {
          result.birlaPivot.push(entry);
        }
      });
    return result;
  })();

  const toggleMessageSelection = useCallback((msgId: string) => {
    setSelectedMessages(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  }, []);

  const handleOpenShare = useCallback(() => {
    if (selectedMessages.size === 0) return;

    // NEW: Use unified share modal if available
    if (onOpenShareModal) {
      const allMsgs = [...(rootMessage ? [rootMessage] : []), ...thread.messages];
      const selectedMsgs = allMsgs.filter((m) => selectedMessages.has(m.id));
      const ids = selectedMsgs.map((m) => m.id);

      onOpenShareModal(
        { type: "thread", id: thread.id, name: thread.title || "Thread", groupId, enquiryId: thread.enquiryId },
        ids,
        selectedMsgs
      );

      // Exit selection mode (modal manages its own state now)
      setSelectionMode(false);
      setSelectedMessages(new Set());
      return;
    }

    // Fallback: old inline share dialog
    const initial: Record<string, string> = {};
    thread.messages.forEach(msg => {
      if (selectedMessages.has(msg.id)) {
        initial[msg.id] = msg.content;
      }
    });
    // Also include root message if selected
    if (rootMessage && selectedMessages.has(rootMessage.id)) {
      initial[rootMessage.id] = rootMessage.content;
    }
    setEditedMessageContents(initial);
    setShowShareDialog(true);
  }, [selectedMessages, thread.messages, rootMessage, onOpenShareModal, thread.id, thread.title, groupId, thread.enquiryId]);

  const confirmShare = useCallback((toChannel: string) => {
    if (!onShareMessages) return;
    const msgIds = Array.from(selectedMessages);
    const allMsgs = [...(rootMessage ? [rootMessage] : []), ...thread.messages];
    const selected = allMsgs.filter(m => selectedMessages.has(m.id));
    const hasEdits = selected.some(msg => editedMessageContents[msg.id] !== msg.content);
    onShareMessages(msgIds, toChannel, hasEdits ? editedMessageContents : undefined);
    setSelectedMessages(new Set());
    setSelectionMode(false);
    setShowShareDialog(false);
    setEditedMessageContents({});
  }, [onShareMessages, selectedMessages, editedMessageContents, rootMessage, thread.messages]);

  const cancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedMessages(new Set());
    setShowShareDialog(false);
    setEditedMessageContents({});
  }, []);

  const handleConfirmTagEnquiry = useCallback(() => {
    // Check if creating new enquiry
    if (selectedTagEnquiryId === "__new__") {
      if (!onCreateEnquiryFromThread || !selectedNewEnquiryBuyer) return;
      onCreateEnquiryFromThread(thread.id, selectedNewEnquiryBuyer);
      setShowTagEnquiryDialog(false);
      setSelectedTagEnquiryId("__none__");
      setSelectedNewEnquiryBuyer("");
      return;
    }

    // Otherwise tag to existing enquiry
    if (!onTagEnquiry || selectedTagEnquiryId === "__none__") return;
    onTagEnquiry(thread.id, selectedTagEnquiryId);
    setShowTagEnquiryDialog(false);
    setSelectedTagEnquiryId("__none__");
    setSelectedNewEnquiryBuyer("");
  }, [onTagEnquiry, onCreateEnquiryFromThread, thread.id, selectedTagEnquiryId, selectedNewEnquiryBuyer]);

  const handleCancelTagEnquiry = useCallback(() => {
    setShowTagEnquiryDialog(false);
    setSelectedTagEnquiryId("__none__");
    setSelectedNewEnquiryBuyer("");
  }, []);

  // @ mention/command input handlers
  const handleInputChange = useCallback((value: string) => {
    setReplyText(value);

    // Find the last @ symbol
    const lastAtIndex = value.lastIndexOf('@');
    
    if (lastAtIndex === -1) {
      // No @ found - close dropdown
      setShowMentionDropdown(false);
      setMentionSearchQuery('');
      return;
    }
    
    // Get text after the last @
    const textAfterAt = value.substring(lastAtIndex + 1);
    
    // Check if cursor is after the @ (only trigger if we're actively typing at the @ mention)
    const cursorPosition = textareaRef.current?.selectionStart || value.length;
    
    if (cursorPosition <= lastAtIndex) {
      // Cursor is before or at the @, don't show dropdown
      setShowMentionDropdown(false);
      setMentionSearchQuery('');
      return;
    }
    
    // If there's a space after the @, the mention/command is complete - close dropdown
    if (textAfterAt.includes(' ')) {
      setShowMentionDropdown(false);
      setMentionSearchQuery('');
      return;
    }
    
    if (!textareaRef.current) return;
    
    const rect = textareaRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const bottomPosition = viewportHeight - rect.top + 8;
    
    // Show the unified dropdown
    setMentionDropdownPosition({
      bottom: bottomPosition,
      left: rect.left,
    });
    setMentionSearchQuery(textAfterAt.toLowerCase());
    setShowMentionDropdown(true);
  }, []);

  const handleCommandSelect = useCallback((commandLabel: string) => {
    // Find the last @ and replace everything after it with the command
    const lastAtIndex = replyText.lastIndexOf('@');
    if (lastAtIndex >= 0) {
      const textBeforeAt = replyText.substring(0, lastAtIndex);
      setReplyText(textBeforeAt + commandLabel + " ");
    }
    setShowMentionDropdown(false);
    setMentionSearchQuery('');
    textareaRef.current?.focus();
  }, [replyText]);

  const handlePersonaSelect = useCallback((persona: Persona) => {
    // Find the @ symbol position and replace with the plain persona name
    const lastAtIndex = replyText.lastIndexOf('@');
    if (lastAtIndex >= 0) {
      const textBeforeAt = replyText.substring(0, lastAtIndex);
      const mention = `@${persona.displayName}`;
      setReplyText(textBeforeAt + mention + " ");
    }
    setShowMentionDropdown(false);
    setMentionSearchQuery('');
    textareaRef.current?.focus();
  }, [replyText]);

  // Get thread members for @ mentions (from personaMap)
  const threadMembers = Array.from(personaMap.values()).map((persona) => ({
    id: `member-${persona.id}`,
    userId: persona.userId,
    personaId: persona.id,
    role: persona.role,
    joinedAt: new Date(),
  }));

  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 bg-white overflow-hidden",
        isSidePanel && "border-l border-gray-200"
      )}
    >
      {/* Header - Unified simple header for enquiry threads */}
      {enquiryData ? (
        /* Enquiry thread header - Simple 4-row layout */
        <div className="border-b border-gray-200 flex-shrink-0">
          <div className="px-6 py-3 space-y-2">
            {/* P2: Enquiry ID - subdued, at top */}
            <div className="flex items-center justify-between">
              <p className="font-['Inter',sans-serif] font-medium leading-[20px] not-italic text-gray-500 flex items-center gap-2 text-[13px]">
                <Hash className="size-3.5 text-gray-500" />
                {enquiryData.enquiryId}
                {!isSidePanel && (
                  <>
                    <span className="text-gray-400">&middot;</span>
                    <GroupIcon className="size-3.5 text-gray-500" />
                    {groupName}
                  </>
                )}
              </p>
              {/* Close button - only in side-panel mode */}
              {isSidePanel && (
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Close thread"
                >
                  <X className="size-4 text-gray-500" />
                </button>
              )}
            </div>
            
            {/* P0: Buyer/Seller Name - prominent */}
            {(enquiryData.buyerName || buyerInfo?.buyerName) && (
              <div className="py-0.5">
                {(buyerInfo?.buyerPersonaId || enquiryData.buyerPersonaId) ? (
                  <PersonaHoverTrigger
                    personaId={buyerInfo?.buyerPersonaId || enquiryData.buyerPersonaId!}
                    context={{ channelId: groupId, location: "thread-header" }}
                    side="bottom"
                    align="start"
                  >
                    <p className="font-['Inter',sans-serif] font-semibold leading-[28px] not-italic text-[#4039ad] text-[20px]">
                      {enquiryData.buyerName || buyerInfo?.buyerName}
                    </p>
                  </PersonaHoverTrigger>
                ) : (
                  <p className="font-['Inter',sans-serif] font-semibold leading-[28px] not-italic text-[#4039ad] text-[20px]">
                    {enquiryData.buyerName || buyerInfo?.buyerName}
                  </p>
                )}
              </div>
            )}
            
            {/* P1: Value, Category & Status - below buyer name */}
            <div className="flex items-center gap-2">
              {/* Value */}
              {enquiryData.estimatedValue && (
                <span className="font-medium text-gray-900 text-[16px]">
                  {formatCurrency(enquiryData.estimatedValue)}
                </span>
              )}
              
              {/* Separator dot */}
              {enquiryData.estimatedValue && enquiryData.categories && enquiryData.categories.length > 0 && (
                <span className="text-gray-400">•</span>
              )}
              
              {/* Category */}
              {enquiryData.categories && enquiryData.categories.length > 0 && (
                <span className="font-medium text-gray-900 text-[16px]">
                  {enquiryData.categories.map(cat => typeof cat === 'string' ? cat : cat.name).join(' • ')}
                </span>
              )}
              
              {/* Separator dot */}
              {enquiryData.state && (enquiryData.estimatedValue || (enquiryData.categories && enquiryData.categories.length > 0)) && (
                <span className="text-gray-400">•</span>
              )}
              
              {/* Status */}
              {enquiryData.state && (
                <span
                  className={cn(
                    "text-[11px] px-2 py-0.5 rounded border-[0.5px] font-medium",
                    getStateBadgeColor(enquiryData.state)
                  )}
                >
                  {enquiryData.state}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : !isSidePanel && buyerInfo ? (
        /* Main mode: match BaseHeader styling (title + subtitle pattern) */
        <div
          className="bg-white content-stretch flex flex-col items-start pb-[12px] pt-[15.996px] px-[23.994px] relative w-full flex-shrink-0"
          style={{ minHeight: "80px" }}
        >
          <div
            aria-hidden="true"
            className="absolute border-[#e5e7eb] border-b-[0.625px] border-solid inset-0 pointer-events-none"
          />
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
            <div className="relative shrink-0 w-full">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[15.996px] items-center relative w-full">
                <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
                  <div className="flex-[1_0_0] h-full min-h-px min-w-px relative">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
                      <div className="flex-[1_0_0] min-h-px min-w-px relative">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start justify-center relative w-full">
                          {/* Enquiry ID — title slot */}
                          {thread.enquiryId && (
                            <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0">
                              <p className="font-['Inter',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#33373d] text-[14px]">
                                {thread.enquiryId}
                              </p>
                            </div>
                          )}
                          {/* Buyer Name — subtitle slot */}
                          <div className="content-stretch flex items-center relative shrink-0">
                            {buyerInfo.buyerPersonaId ? (
                              <PersonaHoverTrigger
                                personaId={buyerInfo.buyerPersonaId}
                                context={{ channelId: groupId, location: "thread-header" }}
                                side="bottom"
                                align="start"
                              >
                                <p className="font-['Inter',sans-serif] font-semibold leading-[32px] not-italic relative shrink-0 text-[#4039ad] text-[20px]">
                                  {buyerInfo.buyerName}
                                </p>
                              </PersonaHoverTrigger>
                            ) : (
                              <p className="font-['Inter',sans-serif] font-semibold leading-[32px] not-italic relative shrink-0 text-[#4039ad] text-[20px]">
                                {buyerInfo.buyerName}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* New Thread — untagged thread header */
        <div className="border-b border-gray-200 flex-shrink-0">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between gap-3">
              {/* New Thread label */}
              <p className="font-['Inter',sans-serif] font-semibold leading-[28px] not-italic text-gray-900 text-[20px]">
                New Thread
              </p>
              
              <div className="flex items-center gap-2">
                {/* Tag Enquiry Button */}
                {onTagEnquiry && availableEnquiries && availableEnquiries.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTagEnquiryDialog(true)}
                    className="gap-1.5 text-[11px] h-7 flex-shrink-0"
                  >
                    <Hash className="size-3" />
                    Tag Enquiry
                  </Button>
                )}
                
                {/* Close button only in side-panel mode */}
                {isSidePanel && (
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                    aria-label="Close thread"
                  >
                    <X className="size-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Root message (context) — also shareable */}
      {rootMessage && (
        <div
          className={cn(
            "px-4 py-3 border-b border-gray-200 flex-shrink-0 group/root transition-colors",
            selectionMode && selectedMessages.has(rootMessage.id) ? "bg-blue-50/50" : "bg-gray-50"
          )}
          onClick={selectionMode ? () => toggleMessageSelection(rootMessage.id) : undefined}
        >
          <div className="flex gap-3">
            {/* Selection checkbox - always on the left */}
            {selectionMode && (
              <div className="flex items-start pt-1 flex-shrink-0 transition-all" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedMessages.has(rootMessage.id)}
                  onCheckedChange={() => toggleMessageSelection(rootMessage.id)}
                />
              </div>
            )}

            {/* Message content wrapper - this gets reversed for current user */}
            <div className={cn(
              "flex gap-3 flex-1 min-w-0",
              rootMessage.senderPersonaId === currentPersonaId && "flex-row-reverse"
            )}>
              {/* Avatar - only show for other users */}
              {rootMessage.senderPersonaId !== currentPersonaId && (
                <div className="flex-shrink-0">
                  <AvatarWithStatus
                    initials={getInitials(rootMessage.sender)}
                    isActive={
                      rootMessage.senderPersonaId
                        ? getPersonaById(rootMessage.senderPersonaId)?.isActive
                        : true
                    }
                    avatarClassName="size-9"
                  />
                </div>
              )}

              {/* Message content */}
              <div className={cn(
                "flex-1 min-w-0",
                rootMessage.senderPersonaId === currentPersonaId && "flex flex-col items-end"
              )}>
                {/* Header */}
                <div className={cn(
                  "flex items-baseline gap-2 mb-1",
                  rootMessage.senderPersonaId === currentPersonaId && "justify-end"
                )}>
                  <span className="font-semibold text-gray-900 text-sm">
                    {rootMessage.sender}
                  </span>
                  <RoleBadge
                    role={
                      rootMessage.senderRole ||
                      (rootMessage.senderPersonaId
                        ? (personaMap.get(rootMessage.senderPersonaId) || getPersonaById(rootMessage.senderPersonaId))?.role
                        : undefined)
                    }
                  />
                  <span className="text-xs text-gray-500">
                    {formatTime(rootMessage.timestamp)}
                  </span>
                </div>

                {/* Message content - plain for current user, bubble for others */}
                {rootMessage.senderPersonaId === currentPersonaId ? (
                  <div className="bg-[#F0EFFC] text-gray-900 px-4 py-2 rounded-lg max-w-[85%]">
                    <div className="text-sm text-gray-900">
                      {rootMessage.content}
                    </div>
                  </div>
                ) : (
                  <div className="inline-block max-w-[85%] rounded-2xl px-4 py-2.5 bg-gray-100 text-gray-900">
                    <div className="text-sm text-gray-900">
                      {rootMessage.content}
                    </div>
                  </div>
                )}
              </div>

              {/* Share hover action on root message */}
              {canShare && !selectionMode && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover/root:opacity-100 transition-all flex-shrink-0 mt-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectionMode(true);
                      setSelectedMessages(new Set([rootMessage.id]));
                    }}
                    className="p-1.5 hover:bg-gray-200 rounded transition-all"
                    title="Share message"
                  >
                    <AppleShareIcon className="size-3.5 text-gray-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Thread replies */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {thread.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="size-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No replies yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          thread.messages.map((msg) => {
            const persona = msg.senderPersonaId
              ? personaMap.get(msg.senderPersonaId) ||
                getPersonaById(msg.senderPersonaId)
              : undefined;
            const isOwn = msg.senderPersonaId === currentPersonaId;
            const isSelected = selectedMessages.has(msg.id);
            const initials = getInitials(msg.sender);
            const senderRole = msg.senderRole || persona?.role;

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 group px-4 py-1.5 transition-colors",
                  isSelected ? "bg-blue-50/50" : "",
                  selectionMode ? "cursor-pointer" : ""
                )}
                onClick={selectionMode ? () => toggleMessageSelection(msg.id) : undefined}
              >
                {/* Selection checkbox - always on the left */}
                {selectionMode && (
                  <div className="flex items-start pt-1 flex-shrink-0 transition-all" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleMessageSelection(msg.id)}
                    />
                  </div>
                )}

                {/* Message content wrapper - this gets reversed for current user */}
                <div className={cn(
                  "flex gap-3 flex-1 min-w-0",
                  isOwn && "flex-row-reverse"
                )}>
                  {/* Avatar - only show for other users */}
                  {!isOwn && (
                    <div className="flex-shrink-0">
                      <AvatarWithStatus
                        initials={initials}
                        isActive={persona?.isActive}
                        avatarClassName="size-9"
                      />
                    </div>
                  )}

                  {/* Message content */}
                  <div className={cn(
                    "flex-1 min-w-0",
                    isOwn && "flex flex-col items-end"
                  )}>
                    {/* Header */}
                    <div className={cn(
                      "flex items-baseline gap-2 mb-1",
                      isOwn && "justify-end"
                    )}>
                      <span className="font-semibold text-gray-900 text-sm">
                        {msg.sender}
                      </span>
                      <RoleBadge role={senderRole} />
                      <span className="text-xs text-gray-500">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>

                    {/* Message content - plain for current user, bubble for others */}
                    {isOwn ? (
                      <div className="bg-[#F0EFFC] text-gray-900 px-4 py-2 rounded-lg max-w-[85%]">
                        <div className="text-sm text-gray-900">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div className="inline-block max-w-[85%] rounded-2xl px-4 py-2.5 bg-gray-100 text-gray-900">
                        <div className="text-sm text-gray-900">
                          {msg.content}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hover actions — Share (only when not in selection mode and sharing is enabled) */}
                  {canShare && !selectionMode && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectionMode(true);
                          setSelectedMessages(new Set([msg.id]));
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded transition-all"
                        title="Share message"
                      >
                        <AppleShareIcon className="size-3.5 text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        
        {/* Custom inline widget (e.g., delivery widget) */}
        {customInlineWidget}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Composer + selection bar — both visible, stacked, hug-content */}
      <div className="flex-shrink-0 flex flex-col">
        {/* Selection bar — slides in above composer when active */}
        <div
          className={`grid transition-[grid-template-rows] duration-200 ease-out ${
            selectionMode ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="h-[48px] px-4 bg-blue-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {selectedMessages.size} message(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={cancelSelection}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleOpenShare}
                  disabled={selectedMessages.size === 0}
                  className="gap-1.5 bg-[#5249D2] hover:bg-[#4039ad]"
                >
                  <AppleShareIcon className="size-3.5" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Composer — always rendered */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={replyText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reply in thread..."
              className="min-h-[38px] max-h-[120px] resize-none text-sm"
              rows={1}
              disabled={selectionMode}
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!replyText.trim() || selectionMode}
              className="h-[38px] px-3 bg-[#5249D2] hover:bg-[#4039ad]"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Share dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 text-lg">
                Share Thread Messages
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Review and edit messages before sharing to a group
              </p>
            </div>

            {/* Message previews with edit */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {[...(rootMessage ? [rootMessage] : []), ...thread.messages]
                .filter((m) => selectedMessages.has(m.id))
                .map((message) => (
                  <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AvatarWithStatus
                      initials={getInitials(message.sender)}
                      isActive={
                        message.senderPersonaId
                            ? getPersonaById(message.senderPersonaId)?.isActive
                            : true
                        }
                        avatarClassName="size-6"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {message.sender}
                    </span>
                    <RoleBadge
                      role={
                        message.senderRole ||
                        (message.senderPersonaId
                          ? (personaMap.get(message.senderPersonaId) || getPersonaById(message.senderPersonaId))?.role
                          : undefined)
                      }
                    />
                  </div>

                    <Textarea
                      value={editedMessageContents[message.id] || message.content}
                      onChange={(e) => {
                        setEditedMessageContents((prev) => ({
                          ...prev,
                          [message.id]: e.target.value,
                        }));
                      }}
                      className="min-h-[60px] text-sm"
                      placeholder="Edit message content..."
                    />

                    {editedMessageContents[message.id] !== message.content && (
                      <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-amber-100 rounded">edited</span>
                        <span>This message will show as edited when shared</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* Group selection */}
            <div className="p-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Share to group:
              </p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {shareableGroups.birlaPivot.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      {getConnectGroupSectionLabel("birla-pivot")}
                    </p>
                    <div className="space-y-1.5">
                      {shareableGroups.birlaPivot.map((g) => (
                        <Button
                          key={g.id}
                          variant="outline"
                          className="w-full justify-start gap-2"
                          onClick={() => confirmShare(g.id)}
                        >
                          <span className="size-2 rounded-full bg-[#5249D2] flex-shrink-0" />
                          {g.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {shareableGroups.buyer.length > 0 && (
                  <div className={shareableGroups.birlaPivot.length > 0 ? "mt-3" : ""}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      {getConnectGroupSectionLabel("buyer")}
                    </p>
                    <div className="space-y-1.5">
                      {shareableGroups.buyer.map((g) => (
                        <Button
                          key={g.id}
                          variant="outline"
                          className="w-full justify-start gap-2"
                          onClick={() => confirmShare(g.id)}
                        >
                          <span className="size-2 rounded-full bg-amber-500 flex-shrink-0" />
                          {g.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {shareableGroups.seller.length > 0 && (
                  <div className={shareableGroups.birlaPivot.length > 0 || shareableGroups.buyer.length > 0 ? "mt-3" : ""}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      {getConnectGroupSectionLabel("seller")}
                    </p>
                    <div className="space-y-1.5">
                      {shareableGroups.seller.map((g) => (
                        <Button
                          key={g.id}
                          variant="outline"
                          className="w-full justify-start gap-2"
                          onClick={() => confirmShare(g.id)}
                        >
                          <span className="size-2 rounded-full bg-teal-500 flex-shrink-0" />
                          {g.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {shareableGroups.birlaPivot.length === 0 &&
                  shareableGroups.buyer.length === 0 &&
                  shareableGroups.seller.length === 0 && (
                    <p className="text-sm text-gray-500 py-4 text-center">
                      No other groups available to share to
                    </p>
                  )}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={cancelSelection}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tag Enquiry Dialog */}
      <Dialog open={showTagEnquiryDialog} onOpenChange={handleCancelTagEnquiry}>
        <DialogContent className="sm:max-w-[500px]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="size-5 text-[#5249D2]" />
              Tag Thread to Enquiry
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {availableEnquiries && availableEnquiries.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="tag-enquiry-select">
                  Select Enquiry
                </Label>
                <Select value={selectedTagEnquiryId} onValueChange={(value) => {
                  setSelectedTagEnquiryId(value);
                  // Reset buyer selection when switching to existing enquiry
                  if (value !== "__new__") {
                    setSelectedNewEnquiryBuyer("");
                  }
                }}>
                  <SelectTrigger id="tag-enquiry-select">
                    <SelectValue placeholder="Choose an enquiry" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Create New Enquiry option at the top */}
                    <SelectItem value="__new__">
                      <div className="flex items-center gap-2">
                        <Plus className="size-3 text-[#5249D2]" />
                        <span className="font-medium text-[#5249D2]">Create New Enquiry</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="__none__">
                      <span className="text-gray-500">No enquiry tag</span>
                    </SelectItem>
                    {availableEnquiries.map((enq) => (
                      <SelectItem key={enq.id} value={enq.id}>
                        <div className="flex items-center gap-2">
                          <Hash className="size-3 text-gray-400" />
                          <span className="font-medium">{enq.id}</span>
                          {enq.buyerName && (
                            <span className="text-gray-500">- {enq.buyerName}</span>
                          )}
                          {enq.state && (
                            <span className="text-xs text-gray-400">({enq.state})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Buyer selector - only shown when "Create New Enquiry" is selected */}
            {selectedTagEnquiryId === "__new__" && (
              <div className="space-y-2">
                <Label htmlFor="buyer-select">
                  Choose Buyer
                </Label>
                <Select value={selectedNewEnquiryBuyer} onValueChange={setSelectedNewEnquiryBuyer}>
                  <SelectTrigger id="buyer-select">
                    <SelectValue placeholder="Select a buyer" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_BUYERS.map((buyer) => (
                      <SelectItem key={buyer.id} value={buyer.id}>
                        {buyer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelTagEnquiry}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmTagEnquiry}
              disabled={
                selectedTagEnquiryId === "__none__" || 
                (selectedTagEnquiryId === "__new__" && !selectedNewEnquiryBuyer)
              }
              className="gap-2"
            >
              <Hash className="size-4" />
              {selectedTagEnquiryId === "__new__" ? "Create Enquiry" : "Tag Enquiry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* @ mention/command dropdown */}
      {showMentionDropdown && (
        <PersonaMentionDropdown
          members={threadMembers}
          personas={personaMap}
          searchQuery={mentionSearchQuery}
          position={mentionDropdownPosition}
          onSelect={handlePersonaSelect}
          onClose={() => {
            setShowMentionDropdown(false);
            setMentionSearchQuery('');
          }}
          commandGroups={COMMAND_GROUPS}
          onCommandSelect={handleCommandSelect}
        />
      )}
    </div>
  );
});
