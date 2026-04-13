import { useState, useRef, memo, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { AvatarWithStatus } from "@/app/components/AvatarWithStatus";
import { Checkbox } from "@/app/components/ui/checkbox";
import { 
  Store, 
  Mic, 
  Send, 
  Paperclip, 
  MoreVertical, 
  X, 
  AlertCircle, 
  Square, 
  ImageIcon,
  MessageSquare
} from "lucide-react";
import { AppleShareIcon } from "@/app/components/icons/AppleShareIcon";
import { QuickActionChips, type QuickAction } from "@/app/components/QuickActionChips";
import { PersonaMentionDropdown } from "@/app/components/PersonaMentionDropdown";
import { SellerSelectionModal } from "@/app/components/SellerSelectionModal";
import { BuyerSelectionModal } from "@/app/components/BuyerSelectionModal";
import { CreateEnquiryModal } from "@/app/components/CreateEnquiryModal"; // NEW: Enquiry creation
import { CM_USERS, SELLERS } from "@/domain/seller/seller.types";
import { useActionPermission, useMessagePolicy, useEnquiry, useEnquiryDispatch, useCurrentRole } from "@/infrastructure";
import { PERSONAS, getPersonaById, searchPersonas } from "@/domain/persona/persona.data";
import { Role, Persona, Member } from "@/domain/enquiry/enquiry.types";
import { createMemberTaggedEvent } from "@/domain/enquiry/enquiry.events";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useComposerState } from "@/hooks/useComposerState";
import { useVoiceMessage } from "@/hooks/useVoiceMessage";
import { useMessageVisibility } from "@/hooks/useMessageVisibility"; // NEW: Mention read tracking
import { useBreakpoint, isMobile } from "@/hooks/useBreakpoint"; // NEW: Mobile detection
import { AudioMessage } from "@/app/components/AudioMessage";
import { DynamicWaveform } from "@/app/components/DynamicWaveform";
import { EnquiryIntake } from "@/domain/enquiry/enquiry.intake";
import { resolveMessageDisplay } from "@/domain/message/message.display"; // NEW: Use domain logic
import { formatTime, formatElapsedTime } from "@/domain/utils/formatting"; // NEW: Use domain utilities
import { Message, Attachment, VoiceMessageData } from "@/domain/message/message.types";
import { PersonaHoverTrigger } from "@/app/components/PersonaHoverTrigger";
import { ShareAttachmentsSection } from "@/app/components/ShareAttachmentsSection";
import { RoleBadge } from "@/app/components/RoleBadge";
import { SellerRfqBadge } from "@/app/components/SellerRfqBadge";
import { toast } from "sonner";
import { MessageContentWithAI } from "@/app/components/MessageContentWithAI"; // AI Insights
import { MessageBubble } from "./MessageBubble"; // Teams-style bubbles
import { COMMAND_GROUPS, ALL_TAGGING_COMMANDS } from "./conversation-panel.commands";
import {
  CHAT_SURFACE_EXTERNAL,
  CHAT_SURFACE_INTERNAL,
} from "@/domain/message/group-display.utils";
const __DEV_LOG__ = false;
const devLog = __DEV_LOG__ ? (label: string, data?: any) => console.log(label, data) : (() => {}) as (label: string, data?: any) => void;
const devError = __DEV_LOG__ ? (label: string, data?: any) => console.error(label, data) : (() => {}) as (label: string, data?: any) => void;

interface ConversationPanelProps {
  messages: Message[];
  currentChannel: string;
  currentRole: string;
  enquiryId: string;
  enquiryMembers: Member[];
  personaMap: Map<string, Persona>;
  availableChannels: { id: string; label: string }[];
  onSendMessage: (content: string, attachment?: Attachment, audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number }, mentionedPersonaIds?: string[]) => void;
  onQuickAction: (actionId: string) => void;
  onShareMessages: (messageIds: string[], toChannel: string, editedContents?: Record<string, string>) => void;
  onSendToSellers?: (sellerIds: string[], content: string, attachment?: Attachment) => void;
  onMentionSeller?: (sellerId: string, sellerName: string, content: string, attachment?: Attachment) => void;
  onCreateEnquiry?: (intake: EnquiryIntake) => Promise<void> | void; // NEW
  isBuyerDM?: boolean;
  isSellerDM?: boolean; // NEW: Flag to indicate seller DM mode
  buyerDMChannel?: any; // BuyerDMChannel type
  availableEnquiries?: any[]; // Array of enquiries for sharing from buyer DM or seller DM
  buyerDMChannels?: any[]; // Array of buyer DM channels for sharing (BDM use case)
  groupChannels?: any[]; // NEW: Array of group channels for sharing to seller groups
  currentPersonaId?: string; // NEW: Current persona ID for filtering groups
  mobileComposerRenderer?: (composerJSX: React.ReactNode) => void; // Callback to pass composer to parent on mobile
  onMobileShareTrigger?: (enterSelectionMode: () => void) => void; // NEW: Callback to wire up mobile share trigger
  onOpenThread?: (threadId: string) => void; // NEW: Opens thread panel when clicking reply indicator
  onCreateThreadFromMessage?: (messageId: string) => void; // NEW: Creates a thread from a non-threaded message
  onOpenShareModal?: (sourceContext: any, messageIds: string[], sourceMessages: Message[]) => void; // NEW: Unified share modal
  customInlineWidget?: React.ReactNode; // NEW: Custom inline widget (e.g., delivery widget)
  channelKind?: "whatsapp" | "mail";
  /** Connect group main chat only: tint canvas for internal vs external groups */
  connectGroupChatTone?: "internal" | "external";
}

export const ConversationPanel = memo(function ConversationPanel({
  messages,
  currentChannel,
  currentRole,
  enquiryId,
  enquiryMembers,
  personaMap,
  availableChannels,
  onSendMessage,
  onQuickAction,
  onShareMessages,
  onSendToSellers,
  onMentionSeller,
  onCreateEnquiry, // NEW
  isBuyerDM,
  isSellerDM, // NEW
  buyerDMChannel,
  availableEnquiries,
  buyerDMChannels,
  groupChannels, // NEW: Group channels
  currentPersonaId, // NEW: Current persona ID
  mobileComposerRenderer,
  onMobileShareTrigger, // NEW: Mobile share trigger
  onOpenThread, // NEW: Thread panel opener
  onCreateThreadFromMessage, // NEW: Create thread from non-threaded message
  onOpenShareModal, // NEW: Unified share modal
  customInlineWidget, // NEW: Custom inline widget
  channelKind,
  connectGroupChatTone = "internal",
}: ConversationPanelProps) {
  const [messageInput, setMessageInput] = useState("");
  const [mentionedPersonaIds, setMentionedPersonaIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(
    new Set()
  );
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [editedMessageContents, setEditedMessageContents] = useState<Record<string, string>>({});
  
  // Share-specific attachments and audio
  const [shareAttachments, setShareAttachments] = useState<Attachment[]>([]);
  const [shareAudioNote, setShareAudioNote] = useState<VoiceMessageData | null>(null);
  const [isRecordingShare, setIsRecordingShare] = useState(false);
  const [shareRecordingError, setShareRecordingError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shareFileInputRef = useRef<HTMLInputElement>(null); // Separate ref for share attachments
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scroll to bottom
  const messagesContainerRef = useRef<HTMLDivElement>(null); // Ref for the scrollable container
  
  // Seller selection state for sharing to multiple sellers
  const [showSellerSelectionModal, setShowSellerSelectionModal] = useState(false);
  const [pendingShareToChannel, setPendingShareToChannel] = useState<string | null>(null);
  
  // Buyer selection state for sharing to multiple buyers
  const [showBuyerSelectionModal, setShowBuyerSelectionModal] = useState(false);
  
  // Create enquiry modal state // NEW
  const [showCreateEnquiryModal, setShowCreateEnquiryModal] = useState(false); // NEW
  
  // Mobile detection
  const breakpoint = useBreakpoint();
  const isMobileView = isMobile(breakpoint);
  
  // CM selector dropdown state
  const [showCMDropdown, setShowCMDropdown] = useState(false);
  const [cmDropdownPosition, setCMDropdownPosition] = useState<{ bottom?: number; top?: number; left: number }>({ left: 0 });
  const [cmSearchQuery, setCMSearchQuery] = useState("");
  const [selectedCMIndex, setSelectedCMIndex] = useState(0);

  // Unified mention menu state (shows CMs, Sellers, etc.)
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionSearchQuery, setMentionSearchQuery] = useState("");

  // Policy hooks for message display
  const canShareToSeller = useActionPermission("CREATE_SELLER_CHANNEL");
  const { resolveMessageSender, messageDisplayStrategy } = useMessagePolicy();

  // Voice composer state
  const {
    composerState,
    startVoiceRecording,
    stopVoiceRecording,
    cancelVoiceRecording,
    handleVoiceError,
    closeError,
  } = useComposerState(currentRole);

  const {
    state: voiceState,
    isSupported: isVoiceSupported,
    elapsedTime,
    stream: voiceStream,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceMessage();

  // Get current persona for mention tracking
  const { currentPersona } = useCurrentRole();

  devLog('[ConversationPanel] Current persona for mention tracking:', currentPersona?.id);

  // Track message visibility for mention read
  const { observe, reset, markChannelMentionsAsRead } = useMessageVisibility({
    personaId: currentPersona?.id || '',
    enabled: !!currentPersona?.id,
    sustainedMs: 2000, // 2 seconds before marking as read
  });

  // Reset visibility tracking when channel changes
  // Also mark all mentions in the previous channel as read if user stayed for 2+ seconds
  const prevChannelRef = useRef<{ channel: string; enquiryId: string | null } | null>(null);
  
  useEffect(() => {
    const prevChannel = prevChannelRef.current;
    const currentChannelKey = `${enquiryId}-${currentChannel}`;
    const prevChannelKey = prevChannel ? `${prevChannel.enquiryId}-${prevChannel.channel}` : null;
    
    // If switching channels, mark previous channel's mentions as read
    if (prevChannel && prevChannelKey !== currentChannelKey) {
      devLog('[ConversationPanel] Switching channels - marking previous mentions as read', { from: prevChannelKey, to: currentChannelKey });
      markChannelMentionsAsRead();
    }
    
    // Update the ref
    prevChannelRef.current = { channel: currentChannel, enquiryId };
    
    // Reset visibility tracking for new channel
    reset();
  }, [currentChannel, enquiryId, reset, markChannelMentionsAsRead]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    // Scroll to bottom smoothly
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Check if we're viewing the empty seller channel
  const isEmptySellerChannel = currentChannel === "seller" && messages.length === 0;

  const availableShareChannels = [
    ...availableChannels.filter((ch) => ch.id !== currentChannel),
  ];

  // Add seller channel to share destinations if CM (using policy hook)
  if (canShareToSeller && !availableShareChannels.some(ch => ch.id === "seller")) {
    availableShareChannels.push({ id: "seller", label: "Seller" });
  }
  
  // Add buyer channel to share destinations if BDM (for sharing to buyer DMs)
  if (currentRole === "BDM" && !availableShareChannels.some(ch => ch.id === "buyer")) {
    availableShareChannels.push({ id: "buyer", label: "Buyer" });
  }
  
  // Build categorized group lists for share targets
  const shareableGroups: {
    birlaPivot: { id: string; label: string }[];
    buyer: { id: string; label: string }[];
    seller: { id: string; label: string }[];
  } = {
    birlaPivot: [],
    buyer: [],
    seller: [],
  };

  if (groupChannels && currentPersonaId) {
    groupChannels
      .filter((group: any) =>
        group.memberPersonaIds?.includes(currentPersonaId) &&
        group.id !== enquiryId // Don't show current group/channel
      )
      .forEach((group: any) => {
        const entry = { id: group.id, label: group.name };
        if (group.type === "buyer") {
          shareableGroups.buyer.push(entry);
        } else if (group.type === "seller") {
          shareableGroups.seller.push(entry);
        } else {
          shareableGroups.birlaPivot.push(entry);
        }
      });
  }

  // For non-group contexts, also add groups to the flat availableShareChannels list
  // (backward compat for old enquiry view sharing)
  if (currentChannel !== "group") {
    [...shareableGroups.birlaPivot, ...shareableGroups.buyer, ...shareableGroups.seller].forEach(g => {
      if (!availableShareChannels.some(ch => ch.id === g.id)) {
        availableShareChannels.push(g);
      }
    });
  }

  // Detect if we're in a group context (group chat)
  const isGroupContext = currentChannel === "group";
  
  /**
   * Resolve the display name for a message sender using policy
   */
  const getMessageSenderDisplay = (message: Message): { sender: string; role: string } => {
    // Handle legacy masked messages
    if (message.masked && message.displaySender) {
      return { sender: message.displaySender, role: message.senderRole || '' };
    }

    // Check if this is the current user's message
    // Use senderPersonaId for accurate identification (important for seller DMs where multiple CMs share conversation)
    const isCurrentUser = message.senderPersonaId 
      ? message.senderPersonaId === currentPersona?.id
      : message.senderRole === currentRole;
    
    // Try to find the persona by role and name
    // Since we don't have persona IDs in messages, create a minimal persona-like object
    const senderPersona = message.sender && message.senderRole ? {
      id: message.senderPersonaId || `temp_${message.sender}`,
      userId: `temp_${message.sender}`,
      displayName: message.sender,
      role: message.senderRole as Role,
    } : undefined;
    
    // Use policy to resolve the display name
    const senderName = resolveMessageSender(
      senderPersona,
      message.senderRole as Role | undefined,
      isCurrentUser
    );
    
    return { sender: senderName, role: message.senderRole || '' };
  };

  /**
   * Render shared indicator for a message
   * Shows only "Shared" label with icon, no source details
   */
  const renderSharedIndicator = (sharedFrom: any, masked?: boolean) => {
    return (
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-gray-500">
        <AppleShareIcon className="size-3 text-gray-400" />
        <span>Shared</span>
      </div>
    );
  };

  // Voice recording handlers
  const handleStartVoiceRecording = async () => {
    try {
      startVoiceRecording();
      await startRecording();
    } catch (err: any) {
      if (err.message === "MIC_PERMISSION_DENIED") {
        handleVoiceError(
          "Microphone access denied. Please enable microphone permissions in your browser settings and reload the page."
        );
      } else {
        handleVoiceError(
          "Microphone unavailable. Please check your device and browser settings."
        );
      }
    }
  };

  const handleStopVoiceRecording = async () => {
    try {
      const voiceData = await stopRecording();
      stopVoiceRecording();
      
      // Send voice message
      onSendMessage(
        voiceData.transcription.text || "Voice message",
        undefined,
        {
          audioUrl: voiceData.url,
          audioBlob: voiceData.blob,
          transcription: voiceData.transcription.text,
          duration: voiceData.durationMs / 1000, // convert ms to seconds
        }
      );
    } catch (err: any) {
      devError("Failed to stop recording:", err);
      cancelVoiceRecording();
      cancelRecording();
    }
  };

  const handleCancelVoiceRecording = () => {
    cancelVoiceRecording();
    cancelRecording();
  };

  const handleInputChange = (value: string) => {
    setMessageInput(value);

    // Find the last @ symbol
    const lastAtIndex = value.lastIndexOf('@');
    
    if (lastAtIndex === -1) {
      // No @ found - close dropdown
      setShowCMDropdown(false);
      setCMSearchQuery('');
      return;
    }
    
    // Get text after the last @
    const textAfterAt = value.substring(lastAtIndex + 1);
    
    // Check if cursor is after the @ (only trigger if we're actively typing at the @ mention)
    const cursorPosition = textareaRef.current?.selectionStart || value.length;
    
    if (cursorPosition <= lastAtIndex) {
      // Cursor is before or at the @, don't show dropdown
      setShowCMDropdown(false);
      setCMSearchQuery('');
      return;
    }
    
    // If there's a space after the @, the mention/command is complete - close dropdown
    if (textAfterAt.includes(' ')) {
      setShowCMDropdown(false);
      setCMSearchQuery('');
      return;
    }
    
    if (!textareaRef.current) return;
    
    const rect = textareaRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const bottomPosition = viewportHeight - rect.top + 8;
    
    // Always show the unified dropdown (PersonaMentionDropdown handles both members and commands)
    setCMDropdownPosition({
      bottom: bottomPosition,
      left: rect.left,
    });
    setCMSearchQuery(textAfterAt.toLowerCase());
    setShowCMDropdown(true);
  };

  const handleCommandSelect = (commandLabel: string) => {
    // Find the last @ and replace everything after it with the command
    const lastAtIndex = messageInput.lastIndexOf('@');
    if (lastAtIndex >= 0) {
      const textBeforeAt = messageInput.substring(0, lastAtIndex);
      setMessageInput(textBeforeAt + commandLabel + " ");
    }
    setShowCMDropdown(false);
    setCMSearchQuery('');
    textareaRef.current?.focus();
  };

  const handlePersonaSelect = (persona: Persona) => {
    // Find the @ symbol position and replace with the plain persona name
    const cursorPosition = textareaRef.current?.selectionStart || messageInput.length;
    const textBeforeCursor = messageInput.substring(0, cursorPosition);
    const textAfterCursor = messageInput.substring(cursorPosition);
    
    // Find the last @ symbol
    const atIndex = textBeforeCursor.lastIndexOf("@");
    if (atIndex >= 0) {
      const before = textBeforeCursor.substring(0, atIndex);
      const newText = before + "@" + persona.displayName + " " + textAfterCursor;
      setMessageInput(newText);
      
      // Track the mentioned persona ID
      if (!mentionedPersonaIds.includes(persona.id)) {
        setMentionedPersonaIds([...mentionedPersonaIds, persona.id]);
      }
    }
    
    setShowCMDropdown(false);
    textareaRef.current?.focus();
  };

  const handleCMSelect = (cmName: string) => {
    // Find the @ symbol position and replace @CM or @search with @Name
    const cursorPosition = textareaRef.current?.selectionStart || messageInput.length;
    const textBeforeCursor = messageInput.substring(0, cursorPosition);
    const textAfterCursor = messageInput.substring(cursorPosition);
    
    // Find the last @ symbol
    const atIndex = textBeforeCursor.lastIndexOf("@");
    if (atIndex >= 0) {
      const before = textBeforeCursor.substring(0, atIndex);
      const newText = before + "@" + cmName.replace(/\s+/g, "") + " " + textAfterCursor;
      setMessageInput(newText);
    }
    
    setShowCMDropdown(false);
    textareaRef.current?.focus();
  };

  // Filter CM users based on search query
  const filteredCMUsers = (cmSearchQuery === "cm" || cmSearchQuery === "c")
    ? CM_USERS // Show all CMs when explicitly typing @CM or @c
    : CM_USERS.filter((cm) =>
        cm.name.toLowerCase().includes(cmSearchQuery.toLowerCase())
      );

  // Filter sellers based on search query
  const filteredSellers = SELLERS.filter((seller) =>
    seller.name.toLowerCase().includes(cmSearchQuery.toLowerCase())
  );
  
  devLog('Filtered CM Users:', filteredCMUsers);
  devLog('Filtered Sellers:', filteredSellers);
  devLog('CM Search Query:', cmSearchQuery);
  devLog('showCMDropdown state:', showCMDropdown);

  const handleSellerSelect = (sellerId: string, sellerName: string) => {
    // Find the @ symbol position and replace @seller with @SellerName
    const cursorPosition = textareaRef.current?.selectionStart || messageInput.length;
    const textBeforeCursor = messageInput.substring(0, cursorPosition);
    const textAfterCursor = messageInput.substring(cursorPosition);
    
    // Find the last @ symbol
    const atIndex = textBeforeCursor.lastIndexOf("@");
    if (atIndex >= 0) {
      const before = textBeforeCursor.substring(0, atIndex);
      const newText = before + "@" + sellerName.replace(/\s+/g, "") + " " + textAfterCursor;
      setMessageInput(newText);
    }
    
    setShowCMDropdown(false);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create object URL for preview
    const url = URL.createObjectURL(file);
    setAttachment({
      name: file.name,
      type: file.type,
      url,
      markAsPO: false,
    });
  };
  
  // Handle share attachment selection
  const handleShareFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      newAttachments.push({
        name: file.name,
        type: file.type,
        url,
      });
    }
    
    setShareAttachments(prev => [...prev, ...newAttachments]);
  };
  
  // Remove share attachment
  const removeShareAttachment = (index: number) => {
    setShareAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle share audio recording
  const handleStartShareRecording = async () => {
    // Clear any previous errors
    setShareRecordingError(null);
    
    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setShareRecordingError("Audio recording is not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      const startTime = Date.now();
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const durationMs = Date.now() - startTime;
        
        setShareAudioNote({
          blob,
          url,
          durationMs,
          transcription: {
            text: "",
            status: "partial"
          }
        });
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
        setIsRecordingShare(false);
      };
      
      mediaRecorder.onerror = (e) => {
        devError('MediaRecorder error:', e);
        setShareRecordingError("Recording failed. Please try again.");
        stream.getTracks().forEach(track => track.stop());
        setIsRecordingShare(false);
      };
      
      mediaRecorder.start();
      setIsRecordingShare(true);
      
      // Store mediaRecorder and stream references
      (window as any).__shareMediaRecorder = mediaRecorder;
      (window as any).__shareStream = stream;
      
      setShareRecordingError(null);
    } catch (error: any) {
      // Removed console.error - using UI error bar instead
      
      let errorMessage = "Could not access microphone. Please check your browser settings.";
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = "Microphone permission denied. Please allow microphone access in your browser settings.";
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = "No microphone found. Please connect a microphone and try again.";
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = "Microphone is already in use by another application.";
      }
      
      setShareRecordingError(errorMessage);
      setIsRecordingShare(false);
    }
  };
  
  const handleStopShareRecording = () => {
    const mediaRecorder = (window as any).__shareMediaRecorder;
    const stream = (window as any).__shareStream;
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    // Clean up stream if still active
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    
    setIsRecordingShare(false);
  };
  
  // Cleanup function for share recording
  const cleanupShareRecording = () => {
    const mediaRecorder = (window as any).__shareMediaRecorder;
    const stream = (window as any).__shareStream;
    
    // Stop recording if active
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    // Stop all stream tracks
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    
    // Clear references
    (window as any).__shareMediaRecorder = null;
    (window as any).__shareStream = null;
    
    setIsRecordingShare(false);
    setShareRecordingError(null);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() && !attachment) return;
    
    devLog('[handleSendMessage] Starting with input:', messageInput);
    
    // Detect seller mentions in the message (format: @SellerName without spaces)
    const sellerMentionRegex = /@(\w+)/g;
    const mentions = messageInput.match(sellerMentionRegex);
    
    devLog('[handleSendMessage] Detected mentions:', mentions);
    
    if (mentions && onMentionSeller) {
      // Extract seller names and check against SELLERS array
      const mentionedSellers: Array<{ id: string; name: string }> = [];
      
      mentions.forEach((mention) => {
        const mentionText = mention.substring(1); // Remove @
        devLog('[handleSendMessage] Processing mention:', mentionText);
        
        // Try to find matching seller (compare without spaces)
        const matchedSeller = SELLERS.find((seller) => 
          seller.name.replace(/\s+/g, '').toLowerCase() === mentionText.toLowerCase()
        );
        
        devLog('[handleSendMessage] Matched seller:', matchedSeller);
        
        if (matchedSeller && !mentionedSellers.some(s => s.id === matchedSeller.id)) {
          mentionedSellers.push(matchedSeller);
        }
      });
      
      devLog('[handleSendMessage] Total mentioned sellers:', mentionedSellers);
      
      // If sellers are mentioned, send to each seller channel
      if (mentionedSellers.length > 0) {
        devLog('[handleSendMessage] Calling onMentionSeller for each seller');
        mentionedSellers.forEach((seller) => {
          onMentionSeller(seller.id, seller.name, messageInput, attachment || undefined);
        });
        
        setMessageInput("");
        setAttachment(null);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
    }
    
    devLog('[handleSendMessage] No seller mentions, sending normal message');
    
    // No seller mentions, send normal message
    onSendMessage(messageInput, attachment || undefined, undefined, mentionedPersonaIds.length > 0 ? mentionedPersonaIds : undefined);
    setMessageInput("");
    setAttachment(null);
    setMentionedPersonaIds([]); // Clear mentions after sending
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleMessageSelection = (messageId: string) => {
    const newSelection = new Set(selectedMessages);
    if (newSelection.has(messageId)) {
      newSelection.delete(messageId);
    } else {
      newSelection.add(messageId);
    }
    setSelectedMessages(newSelection);
  };

  const handleShare = () => {
    if (selectedMessages.size === 0) return;

    // NEW: Use unified share modal if available
    if (onOpenShareModal) {
      const selectedMsgs = messages.filter((m) => selectedMessages.has(m.id));
      const ids = selectedMsgs.map((m) => m.id);

      // Build source context
      const sourceType = isBuyerDM ? "buyer-dm" : isSellerDM ? "seller-dm" : isGroupContext ? "group" : "enquiry-channel";
      const sourceName = isBuyerDM
        ? (buyerDMChannel?.buyerName ?? "Buyer DM")
        : isSellerDM
        ? "Seller DM"
        : isGroupContext
        ? (groupChannels?.find((g: any) => g.id === enquiryId)?.name ?? "Group")
        : `#${currentChannel}`;

      onOpenShareModal(
        { type: sourceType, id: enquiryId, name: sourceName, channel: currentChannel },
        ids,
        selectedMsgs
      );

      // Exit selection mode (modal manages its own state now)
      setSelectionMode(false);
      setSelectedMessages(new Set());
      return;
    }

    // Fallback: old inline share dialog
    const initialEditedContent: Record<string, string> = {};
    messages.forEach((msg) => {
      if (selectedMessages.has(msg.id)) {
        initialEditedContent[msg.id] = msg.content;
      }
    });
    setEditedMessageContents(initialEditedContent);
    
    setShowShareDialog(true);
  };

  const confirmShare = (toChannel: string) => {
    devLog('[ConversationPanel] confirmShare called:', { toChannel, isSellerDM, isBuyerDM });
    
    // Check if sharing to seller channel - if so, show seller selection modal
    if (toChannel.toLowerCase() === "seller") {
      devLog('[ConversationPanel] Sharing to seller - showing seller selection modal');
      setPendingShareToChannel(toChannel);
      setShowShareDialog(false);
      setShowSellerSelectionModal(true);
      // Stop any active recording when switching modals
      if (isRecordingShare) {
        handleStopShareRecording();
      }
      return;
    }
    
    // Check if sharing to buyer channel - if so, show buyer selection modal
    if (toChannel.toLowerCase() === "buyer") {
      setPendingShareToChannel(toChannel);
      setShowShareDialog(false);
      setShowBuyerSelectionModal(true);
      // Stop any active recording when switching modals
      if (isRecordingShare) {
        handleStopShareRecording();
      }
      return;
    }
    
    // Regular share to other channels
    if (onShareMessages) {
      // Check if any message was edited
      const selectedMsgs = messages.filter((m) => selectedMessages.has(m.id));
      const hasEdits = selectedMsgs.some((msg) => editedMessageContents[msg.id] !== msg.content);
      
      // TODO: Pass share attachments and audio note to parent handler
      // For now, just log them
      if (shareAttachments.length > 0) {
        devLog('[confirmShare] Share with attachments:', shareAttachments);
      }
      if (shareAudioNote) {
        devLog('[confirmShare] Share with audio note:', shareAudioNote);
      }
      
      // Pass the edited contents along
      onShareMessages(Array.from(selectedMessages), toChannel, hasEdits ? editedMessageContents : undefined);
    }
    setSelectedMessages(new Set());
    setSelectionMode(false);
    setShowShareDialog(false);
    setEditedMessageContents({});
    setShareAttachments([]);
    setShareAudioNote(null);
    cleanupShareRecording();
  };

  const renderMessageContent = (content: string, mentionedPersonaIds?: string[]) => {
    // Highlight both @mentions (blue) and @commands (yellow/gray)
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Combine all commands (action commands + tagging commands)
    const allCommands = [
      ...COMMAND_GROUPS.flatMap(g => g.commands),
      ...ALL_TAGGING_COMMANDS
    ];
    
    // Find all @mention and @command patterns in the content
    const mentionRegex = /@([A-Za-z\s\-]+(?:\([A-Z]+\))?)/g;
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before the mention/command
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      
      const fullText = match[0]; // e.g., "@Sneha Reddy" or "@convert-to-order"
      
      // Check if this is a command
      const matchedCommand = allCommands.find(cmd => fullText === cmd.label);
      
      if (matchedCommand) {
        // Highlight command with yellow background if it changes state
        if (matchedCommand.changesState) {
          parts.push(
            <span key={match.index} className="bg-amber-100 text-amber-800 font-medium px-1 rounded">
              {fullText}
            </span>
          );
        } else {
          // Non-state-changing commands get a subtle gray background
          parts.push(
            <span key={match.index} className="bg-gray-100 text-gray-700 font-medium px-1 rounded">
              {fullText}
            </span>
          );
        }
      } else if (mentionedPersonaIds && mentionedPersonaIds.length > 0) {
        // Check if this mention corresponds to one of the mentioned personas
        const isMentioned = mentionedPersonaIds.some(personaId => {
          const persona = personaMap.get(personaId);
          return persona && fullText.includes(persona.displayName);
        });
        
        // Highlight member mention with blue background
        if (isMentioned) {
          parts.push(
            <span key={match.index} className="bg-blue-100 text-blue-700 font-medium px-1 rounded">
              {fullText}
            </span>
          );
        } else {
          parts.push(fullText);
        }
      } else {
        parts.push(fullText);
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }
    
    return <span>{parts}</span>;
  };

  // Wrapper to adapt renderMessageContent for MessageBubble (expects Message object, not string)
  const renderMessageContentForBubble = (message: Message): JSX.Element => {
    return renderMessageContent(message.content, message.mentions) as JSX.Element;
  };

  const isImage = (type: string) => {
    return type.startsWith("image/");
  };

  // Render the composer JSX (used for both inline desktop and external mobile rendering)
  const renderComposer = () => {
    // Composer ALWAYS renders to anchor the layout at the bottom.
    // The selection toolbar overlays it via absolute positioning + opacity transition.
    const composerContent = composerState.mode === "voice_error" ? (
          /* Voice Error Mode */
          <div className="h-[80px] flex items-center gap-3 px-4 bg-red-50 border-t border-red-200 flex-shrink-0">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-900 flex-1">{composerState.error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeError}
              className="text-red-700 hover:text-red-900 hover:bg-red-100"
            >
              Close
            </Button>
          </div>
        ) : composerState.mode === "voice_recording" ? (
          /* Voice Recording Mode - Replaces entire composer */
          <div className="h-[100px] flex items-center gap-4 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200 flex-shrink-0">
            {/* Recording indicator */}
            <div className="flex items-center gap-3">
              <div className="relative flex size-12">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-12 bg-red-500 items-center justify-center">
                  <Mic className="size-6 text-white" />
                </span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">Recording...</span>
                <span className="text-xs text-gray-600">{formatElapsedTime(elapsedTime)}</span>
              </div>
            </div>

            {/* Waveform visualization */}
            <div className="flex items-center gap-1 flex-1">
              <DynamicWaveform
                stream={voiceStream}
                isRecording={voiceState === "recording"}
                className="w-full h-4"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="default"
                onClick={handleStopVoiceRecording}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={voiceState !== "recording"}
              >
                <Square className="size-4 mr-2" />
                {voiceState === "processing" ? "Processing..." : voiceState === "transcribing" ? "Transcribing..." : "Stop"}
              </Button>
              <Button
                variant="ghost"
                size="default"
                onClick={handleCancelVoiceRecording}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                disabled={voiceState !== "recording"}
              >
                <X className="size-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          /* Text Mode (Default) */
          <div className="border-t border-gray-200 bg-white flex flex-col py-3 px-4 max-md:py-2 max-md:px-3 max-md:min-h-[40px] max-h-[180px]">
            {/* Attachment preview */}
            {attachment && (
              <div className="mb-2 flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                {isImage(attachment.type) ? (
                  <>
                    <ImageIcon className="size-4 text-gray-500" />
                    <span className="text-sm text-gray-700 flex-1">{attachment.name}</span>
                  </>
                ) : (
                  <>
                    <Paperclip className="size-4 text-gray-500" />
                    <span className="text-sm text-gray-700 flex-1">{attachment.name}</span>
                  </>
                )}
                <label className="flex items-center gap-2 text-xs text-gray-700 whitespace-nowrap">
                  <Checkbox
                    checked={!!attachment.markAsPO}
                    onCheckedChange={(checked) =>
                      setAttachment((prev) => (prev ? { ...prev, markAsPO: checked === true } : prev))
                    }
                  />
                  PO
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => {
                    setAttachment(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}

            <div className="flex items-end gap-2 max-md:gap-[8px]">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  placeholder={
                    isEmptySellerChannel
                      ? "Type @SellerName to start a conversation..."
                      : "Type a message... Use @ for commands and mentions"
                  }
                  value={messageInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[40px] max-h-[120px] resize-none pr-12 md:min-h-[44px] max-md:min-h-[44px] max-md:h-[44px] max-md:placeholder:text-transparent md:placeholder:text-gray-400 max-md:bg-[#f3f3f5]"
                  disabled={selectionMode}
                />
                <div className="absolute right-2 bottom-2 max-md:bottom-[10px]">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 max-md:size-8"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={selectionMode}
                  >
                    <Paperclip className="size-4 text-gray-500" />
                  </Button>
                </div>
              </div>
              
              {/* Voice button (only show if supported and no text on mobile) */}
              {isVoiceSupported && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`size-11 flex-shrink-0 text-gray-500 hover:text-gray-700 max-md:size-[44px] ${
                    messageInput.trim() ? "max-md:hidden" : ""
                  }`}
                  onClick={handleStartVoiceRecording}
                  disabled={selectionMode}
                >
                  <Mic className="size-5" />
                </Button>
              )}
              
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="size-11 flex-shrink-0 max-md:size-[44px]"
                disabled={selectionMode}
              >
                <Send className="size-5" />
              </Button>
            </div>
          </div>
        );

    return (
      <div className="flex-shrink-0 flex flex-col">
        {/* Selection bar — slides in above composer when active */}
        <div
          className={`grid transition-[grid-template-rows] duration-200 ease-out ${
            selectionMode ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="h-[48px] px-6 bg-blue-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {selectedMessages.size} message(s) selected
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectionMode(false);
                    setSelectedMessages(new Set());
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleShare}
                  disabled={selectedMessages.size === 0}
                  className="gap-2"
                >
                  <AppleShareIcon className="size-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Composer — always rendered */}
        {composerContent}
      </div>
    );
  };

  // Pass composer to mobile parent if renderer callback is provided
  // Composer always renders (with selection overlay managed internally)
  useEffect(() => {
    if (mobileComposerRenderer) {
      mobileComposerRenderer(renderComposer());
    }
  }, [mobileComposerRenderer, composerState.mode, composerState.error, messageInput, attachment, voiceState, elapsedTime, voiceStream, isEmptySellerChannel, selectionMode, isVoiceSupported, selectedMessages.size]);

  // Wire up mobile share trigger callback
  useEffect(() => {
    if (onMobileShareTrigger) {
      const enterSelectionMode = () => {
        setSelectionMode(true);
        setSelectedMessages(new Set());
      };
      onMobileShareTrigger(enterSelectionMode);
    }
  }, [onMobileShareTrigger]);

  const chatSurfaceColor =
    currentChannel === "group" && connectGroupChatTone === "external"
      ? CHAT_SURFACE_EXTERNAL
      : CHAT_SURFACE_INTERNAL;

  return (
    <div
      className="flex flex-col max-md:h-auto md:h-full min-h-0"
      style={{ backgroundColor: chatSurfaceColor }}
    >
      {/* Messages - scrollable area on desktop, flows naturally on mobile */}
      <div ref={messagesContainerRef} className="max-md:flex-none md:flex-1 min-h-0 md:overflow-y-auto overflow-x-hidden max-md:pb-0">
        {isEmptySellerChannel ? (
          // Empty seller channel state
          <div className="flex items-center justify-center h-full px-6">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center size-16 bg-gray-100 rounded-full mb-4">
                <Store className="size-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No seller conversations yet
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                To start conversations with sellers, go to the Internal channel, select messages, and share them to #Seller. 
                You'll be able to select multiple sellers and create individual channels for each.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg">
                <AppleShareIcon className="size-4" />
                <span>Share messages to #Seller to begin</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={isMobileView ? "px-3 py-3 space-y-3" : "px-6 py-4 space-y-4"}>
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="bg-[#eef4fd] py-2 px-4 rounded-lg inline-block">
                  <p className="text-[#08479e] text-sm font-normal">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              </div>
            )}
            {messages.map((message) => {
                // Check if this is the current user's message
                const isCurrentUser = message.senderPersonaId 
                  ? message.senderPersonaId === currentPersona?.id
                  : message.senderRole === currentRole;
                
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isCurrentUser={isCurrentUser}
                    isMobileView={isMobileView}
                    currentChannel={currentChannel}
                    currentRole={currentRole}
                    enquiryId={enquiryId}
                    selectionMode={selectionMode}
                    isSelected={selectedMessages.has(message.id)}
                    getMessageSenderDisplay={getMessageSenderDisplay}
                    getPersonaById={getPersonaById}
                    personaMap={personaMap}
                    renderSharedIndicator={renderSharedIndicator}
                    renderMessageContent={renderMessageContentForBubble}
                    isImage={isImage}
                    onQuickAction={onQuickAction}
                    onOpenThread={onOpenThread}
                    onCreateThreadFromMessage={onCreateThreadFromMessage}
                    channelKind={channelKind}
                    toggleMessageSelection={toggleMessageSelection}
                    setSelectionMode={setSelectionMode}
                    setSelectedMessages={setSelectedMessages}
                    observe={observe}
                  />
                );
              })}
            
            {/* Custom inline widget (e.g., delivery widget) */}
            {customInlineWidget}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer (always rendered) with selection toolbar overlay */}
      <div className="max-md:hidden md:flex-shrink-0">
        {renderComposer()}
      </div>
      
      {/* Unified @ menu dropdown - shows members and commands */}
      {showCMDropdown && (
        <PersonaMentionDropdown
          members={enquiryMembers}
          personas={personaMap}
          searchQuery={cmSearchQuery}
          position={cmDropdownPosition}
          onSelect={handlePersonaSelect}
          onClose={() => setShowCMDropdown(false)}
          commandGroups={COMMAND_GROUPS}
          onCommandSelect={handleCommandSelect}
        />
      )}
      
      {/* Share dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 text-lg">
                Share Messages
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Review and edit messages before sharing
              </p>
            </div>

            {/* Message previews with edit */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.filter((m) => selectedMessages.has(m.id)).map((message) => (
                <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AvatarWithStatus
                      initials={message.sender?.substring(0, 2).toUpperCase() || "??"}
                      isActive={message.senderPersonaId ? getPersonaById(message.senderPersonaId)?.isActive : true}
                      avatarClassName="size-6"
                      statusSize="sm"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {message.sender}
                    </span>
                    <RoleBadge role={message.senderRole} />
                  </div>
                  {message.sellerRfq && <SellerRfqBadge className="mb-2" />}
                  
                  <Textarea
                    value={editedMessageContents[message.id] || message.content}
                    onChange={(e) => {
                      setEditedMessageContents((prev) => ({
                        ...prev,
                        [message.id]: e.target.value,
                      }));
                    }}
                    className="min-h-[80px] text-sm"
                    placeholder="Edit message content..."
                  />
                  
                  {editedMessageContents[message.id] !== message.content && (
                    <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 bg-amber-100 rounded">edited</span>
                      <span>This message will show as edited when shared</span>
                    </div>
                  )}

                  {message.attachment && (
                    <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 bg-gray-50 rounded border border-gray-200 text-xs">
                      <Paperclip className="size-3 text-gray-500" />
                      <span className="text-gray-600">{message.attachment.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Share Attachments and Audio */}
            <ShareAttachmentsSection
              shareAttachments={shareAttachments}
              shareAudioNote={shareAudioNote}
              isRecordingShare={isRecordingShare}
              shareRecordingError={shareRecordingError}
              shareFileInputRef={shareFileInputRef}
              onFileSelect={handleShareFileSelect}
              onRemoveAttachment={removeShareAttachment}
              onStartRecording={handleStartShareRecording}
              onStopRecording={handleStopShareRecording}
              onRemoveAudioNote={() => setShareAudioNote(null)}
              onClearError={() => setShareRecordingError(null)}
            />

            {/* Channel selection */}
            <div className="p-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">
                {(isBuyerDM || isSellerDM) ? "Select destination enquiry:" : isGroupContext ? "Share to group:" : "Select destination channel:"}
              </p>
              <div className="space-y-2">
                {(isBuyerDM || isSellerDM) && availableEnquiries ? (
                  /* Buyer DM or Seller DM mode - show enquiries + groups */
                  <>
                    {availableEnquiries.map((enquiry: any) => (
                      <Button
                        key={enquiry.id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => confirmShare(enquiry.id)}
                      >
                        <div className="flex flex-col items-start w-full gap-0.5">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{enquiry.id}</span>
                            <span className="text-xs text-gray-500">{enquiry.state}</span>
                          </div>
                          {enquiry.buyerName && (
                            <span className="text-xs text-gray-600">{enquiry.buyerName}</span>
                          )}
                        </div>
                      </Button>
                    ))}
                    {/* Also show groups as targets from DM context */}
                    {(shareableGroups.birlaPivot.length > 0 || shareableGroups.buyer.length > 0 || shareableGroups.seller.length > 0) && (
                      <>
                        <div className="relative my-3">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-400">Or share to a group</span>
                          </div>
                        </div>
                        {shareableGroups.birlaPivot.map((g) => (
                          <Button key={g.id} variant="outline" className="w-full justify-start gap-2" onClick={() => confirmShare(g.id)}>
                            <span className="size-2 rounded-full bg-[#5249D2] flex-shrink-0" />
                            {g.label}
                          </Button>
                        ))}
                        {shareableGroups.buyer.map((g) => (
                          <Button key={g.id} variant="outline" className="w-full justify-start gap-2" onClick={() => confirmShare(g.id)}>
                            <span className="size-2 rounded-full bg-amber-500 flex-shrink-0" />
                            {g.label}
                          </Button>
                        ))}
                        {shareableGroups.seller.map((g) => (
                          <Button key={g.id} variant="outline" className="w-full justify-start gap-2" onClick={() => confirmShare(g.id)}>
                            <span className="size-2 rounded-full bg-teal-500 flex-shrink-0" />
                            {g.label}
                          </Button>
                        ))}
                      </>
                    )}
                  </>
                ) : isGroupContext ? (
                  /* Group context — categorized group targets */
                  <>
                    {shareableGroups.birlaPivot.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Birla Pivot</p>
                        <div className="space-y-1.5">
                          {shareableGroups.birlaPivot.map((g) => (
                            <Button key={g.id} variant="outline" className="w-full justify-start gap-2" onClick={() => confirmShare(g.id)}>
                              <span className="size-2 rounded-full bg-[#5249D2] flex-shrink-0" />
                              {g.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    {shareableGroups.buyer.length > 0 && (
                      <div className={shareableGroups.birlaPivot.length > 0 ? "mt-3" : ""}>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Buyers</p>
                        <div className="space-y-1.5">
                          {shareableGroups.buyer.map((g) => (
                            <Button key={g.id} variant="outline" className="w-full justify-start gap-2" onClick={() => confirmShare(g.id)}>
                              <span className="size-2 rounded-full bg-amber-500 flex-shrink-0" />
                              {g.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    {shareableGroups.seller.length > 0 && (
                      <div className={shareableGroups.birlaPivot.length > 0 || shareableGroups.buyer.length > 0 ? "mt-3" : ""}>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Seller</p>
                        <div className="space-y-1.5">
                          {shareableGroups.seller.map((g) => (
                            <Button key={g.id} variant="outline" className="w-full justify-start gap-2" onClick={() => confirmShare(g.id)}>
                              <span className="size-2 rounded-full bg-teal-500 flex-shrink-0" />
                              {g.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    {shareableGroups.birlaPivot.length === 0 && shareableGroups.buyer.length === 0 && shareableGroups.seller.length === 0 && (
                      <p className="text-sm text-gray-500 py-4 text-center">No other groups available to share to</p>
                    )}
                  </>
                ) : (
                  /* Regular mode - show channels */
                  availableShareChannels.map((channel) => (
                    <Button
                      key={channel.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => confirmShare(channel.id)}
                    >
                      #{channel.label}
                    </Button>
                  ))
                )}
                
                {/* Create New Enquiry Button - Only show for BDM in buyer DM */}
                {onCreateEnquiry && isBuyerDM && currentRole === "BDM" && (
                  <>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                    </div>
                    <Button
                      variant="default"
                      className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        setShowShareDialog(false);
                        setShowCreateEnquiryModal(true);
                      }}
                    >
                      <svg
                        className="size-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Create New Enquiry
                    </Button>
                  </>
                )}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowShareDialog(false);
                    setEditedMessageContents({});
                    setShareAttachments([]);
                    setShareAudioNote(null);
                    cleanupShareRecording();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seller selection modal */}
      {showSellerSelectionModal && (onSendToSellers || pendingShareToChannel) && (
        <SellerSelectionModal
          isOpen={true}
          sellers={SELLERS}
          selectedEnquiryId={enquiryId}
          onClose={() => {
            setShowSellerSelectionModal(false);
            setPendingShareToChannel(null);
            // If closing during share flow, reset selection
            if (pendingShareToChannel) {
              setSelectedMessages(new Set());
              setSelectionMode(false);
              setEditedMessageContents({});
            }
          }}
          onConfirm={(sellerIds) => {
            devLog('[ConversationPanel] SellerSelectionModal onConfirm:', { sellerIds, pendingShareToChannel });
            
            // Check if this is a share operation or new message
            if (pendingShareToChannel) {
              // Sharing to multiple sellers - delegate to parent
              if (onShareMessages) {
                // Share to a temporary "seller-multi" channel with seller IDs metadata
                // App.tsx will handle creating individual seller channels
                const selectedMsgs = messages.filter((m) => selectedMessages.has(m.id));
                const hasEdits = selectedMsgs.some((msg) => editedMessageContents[msg.id] !== msg.content);
                
                const toChannel = `seller-multi:${sellerIds.join(',')}`;
                devLog('[ConversationPanel] Calling onShareMessages:', {
                  messageIds: Array.from(selectedMessages),
                  toChannel,
                  hasEdits
                });
                
                // Pass seller IDs via special channel format
                onShareMessages(
                  Array.from(selectedMessages),
                  toChannel,
                  hasEdits ? editedMessageContents : undefined
                );
              }
              setSelectedMessages(new Set());
              setSelectionMode(false);
              setEditedMessageContents({});
              setPendingShareToChannel(null);
              setShareAttachments([]);
              setShareAudioNote(null);
              cleanupShareRecording();
            } else {
              // New message to sellers (from three dots menu)
              devLog('[ConversationPanel] Sending new message to sellers');
              if (onSendToSellers && (messageInput.trim() || attachment)) {
                onSendToSellers(sellerIds, messageInput, attachment || undefined);
                setMessageInput("");
                setAttachment(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }
            }
            setShowSellerSelectionModal(false);
          }}
          messagePreview={pendingShareToChannel ? "Sharing selected messages" : messageInput}
        />
      )}
      
      {/* Buyer selection modal */}
      {showBuyerSelectionModal && buyerDMChannels && (
        <BuyerSelectionModal
          buyerDMChannels={buyerDMChannels}
          onClose={() => {
            setShowBuyerSelectionModal(false);
            setPendingShareToChannel(null);
            // If closing during share flow, reset selection
            if (pendingShareToChannel) {
              setSelectedMessages(new Set());
              setSelectionMode(false);
              setEditedMessageContents({});
            }
          }}
          onConfirm={(buyerDMIds) => {
            devLog('[ConversationPanel] BuyerSelectionModal onConfirm:', { buyerDMIds, pendingShareToChannel });
            
            // Sharing to multiple buyer DMs
            if (pendingShareToChannel && onShareMessages) {
              const selectedMsgs = messages.filter((m) => selectedMessages.has(m.id));
              const hasEdits = selectedMsgs.some((msg) => editedMessageContents[msg.id] !== msg.content);
              
              const toChannel = `buyer-multi:${buyerDMIds.join(',')}`;
              devLog('[ConversationPanel] Calling onShareMessages:', {
                messageIds: Array.from(selectedMessages),
                toChannel,
                hasEdits
              });
              
              // Pass buyer DM IDs via special channel format
              onShareMessages(
                Array.from(selectedMessages),
                toChannel,
                hasEdits ? editedMessageContents : undefined
              );
              
              setSelectedMessages(new Set());
              setSelectionMode(false);
              setEditedMessageContents({});
              setPendingShareToChannel(null);
              setShareAttachments([]);
              setShareAudioNote(null);
              cleanupShareRecording();
            }
            setShowBuyerSelectionModal(false);
          }}
          messagePreview={pendingShareToChannel ? "Sharing selected messages" : ""}
        />
      )}
      
      {/* Create Enquiry Modal */}
      {showCreateEnquiryModal && onCreateEnquiry && (
        <CreateEnquiryModal
          isOpen={showCreateEnquiryModal}
          mode="share"
          messages={messages.filter((m) => selectedMessages.has(m.id))}
          buyerDMChannel={buyerDMChannel}
          onClose={() => {
            setShowCreateEnquiryModal(false);
            // Reset selection
            setSelectedMessages(new Set());
            setSelectionMode(false);
            setEditedMessageContents({});
          }}
          onConfirm={(intake) => {
            if (onCreateEnquiry) {
              void onCreateEnquiry(intake);
            }
            setShowCreateEnquiryModal(false);
            setSelectedMessages(new Set());
            setSelectionMode(false);
            setEditedMessageContents({});
          }}
        />
      )}
    </div>
  );
});
