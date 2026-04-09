/**
 * Main Application Component (New Architecture)
 *
 * Uses hooks and event-driven architecture.
 */

import * as React from "react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Toaster } from "@/app/components/ui/sonner";
import { MessageSquare } from "lucide-react";
import { AppProviders } from "./AppProviders";
import type { WorkspaceMode } from "@/app/workspace.types";
import { useEnquiries } from "@/hooks/useEnquiries";
import { useMessages } from "@/hooks/useMessages";
import { useSellerChannels } from "@/hooks/useSellerChannels";
import { useEnquiryCreation } from "@/hooks/useEnquiryCreation";
import {
  useCurrentRole,
  useComponentVisibility,
  useActionPermission,
  isInternalRole,
  useEnquiryDispatch,
  useEnquiryState,
  useMessageDispatch,
  useMessageState,
  useMessagePolicy,
  usePermissions,
} from "@/infrastructure";
import { EnquiryList } from "@/app/components/EnquiryList";
import { SelectedMember } from "@/app/components/GroupCreationModal";
import { GroupCreationFlow } from "@/app/components/GroupCreationFlow";
import { BuyerPortalView } from "@/app/components/BuyerPortalView";
import { SellerPortalView } from "@/app/components/SellerPortalView";
import { handleBuyerGroupCreation, handleSellerGroupCreation } from "@/app/handlers/group-creation.handlers";
import { BuyerDMHeader } from "@/app/components/BuyerDMHeader";
import { SellerDMHeader } from "@/app/components/SellerDMHeader";
import { GroupHeader } from "@/app/components/GroupHeader";
import { ThreadPanel } from "@/app/components/ThreadPanel";
import { TagInternalGroupModal } from "@/app/components/TagInternalGroupModal";
import { MobileBuyerDMHeader } from "@/app/components/MobileBuyerDMHeader";
import { ProfileBottomSheet } from "@/app/components/ProfileBottomSheet";
import { EntityProfileCard } from "@/app/components/EntityProfileCard";
import { ConversationPanel } from "@/app/components/ConversationPanel";
import { StructuredPanel } from "@/app/components/StructuredPanel";
import { AppShellHeader } from "@/app/components/AppShellHeader";
import { ResponsiveApp } from "@/app/components/ResponsiveApp";
import { InlineDeliveryWidget } from "@/app/components/InlineDeliveryWidget"; // NEW: AI delivery widget
import { CreateThreadModal } from "@/app/components/CreateThreadModal"; // NEW: Thread creation modal
import { CreateEnquiryModal } from "@/app/components/CreateEnquiryModal";
import { PlutoWorkspace } from "@/app/pluto/PlutoWorkspace";
import { PLUTO_ROLE_SCREEN_CONFIG } from "@/app/pluto/pluto.screen-config";
import {
  buildPlutoDetailHeaderViewModel,
  buildPlutoKpiCards,
  buildPlutoListItemViewModels,
  filterPlutoListItemViewModels,
  selectPlutoAccessibleEnquiries,
} from "@/app/pluto/pluto.view-models";
import { useBreakpoint, isMobile } from "@/hooks/useBreakpoint";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { STATIC_CHANNELS, CHANNEL_VISIBILITY } from "@/domain/message/message.types";
import { SELLERS, CM_USERS, getSellerIdByPersonaName } from "@/domain/seller/seller.types";
import { Enquiry } from "@/domain/enquiry/enquiry.types";
import type { EnquiryState } from "@/domain/enquiry/enquiry.state-machine";
import { PERSONAS, getPersonaById } from "@/domain/persona/persona.data";
import { getProfileData } from "@/domain/persona/persona.profile-data"; // NEW: Get profile data
import { filterEnquiriesByPersona } from "@/domain/enquiry/enquiry.filters";
import { useBuyerDMChannels, useBuyerDMChannel, useBuyerDMForBuyer } from "@/hooks/useBuyerDMChannels";
import { useBuyerDMMessages } from "@/hooks/useBuyerDMMessages";
import { useSellerDMChannels, useSellerDMChannelsForCM, useSendSellerDMMessage } from "@/hooks/useSellerDMChannels";
import { useAppStore } from "@/hooks/useAppStore";
import { useGroupChannels } from "@/hooks/useGroupChannels";
import { Message, type Attachment, type UserRole } from "@/domain/message/message.types";
import { EnquiryCreationSubmission, buildIntakeChannelMessages, buildInternalEnquiryThread } from "@/domain/enquiry/enquiry.creation";
import type { BuyerDMChannel } from "@/domain/message/buyer-dm.types";
import { getCMForRegion, type Region } from "@/domain/cm/cm.region";
import { getCMForCategory } from "@/domain/cm/cm.assignment"; // NEW: Category-based CM assignment
import { autoAssignTeamMembers } from "@/domain/enquiry/enquiry.member-assignment"; // NEW: Team assignment utilities
import { generateStructuredData, generateAISummary } from "@/domain/enquiry/enquiry.structured-data"; // NEW: Structured data utilities
import { generateMemberId } from "@/domain/enquiry/enquiry.types";
import { hasUnreadMentions } from "@/domain/utils/mention-utils"; // Import mention utility
import { stripRoleSuffix } from "@/domain/utils/name-utils";
import { createBuyerDMViewedEvent, createSellerDMViewedEvent, createGroupCreatedEvent, createGroupMembersAddedEvent, createGroupTaggedEvent, createGroupViewedEvent, createThreadViewedEvent, createThreadCreatedEvent, MessageEvent, createMessageSentEvent } from "@/domain/message/message.events"; // Import DM viewed events
import { type EnquiryEvent } from "@/domain/enquiry/enquiry.events"; // Import enquiry viewed event
import { maskInternalForSellerGroup } from "@/domain/message/message.masking"; // NEW: Seller group message masking
import {
  createMemberAddedEvent,
  createMemberRemovedEvent,
  createEnquiryCreatedEvent,
  createPrimaryCMAssignedEvent,
} from "@/domain/enquiry/enquiry.events";
import { checkCMTaggedTransition, checkConvertOrderTransition } from "@/domain/enquiry/enquiry.auto-transitions"; // Import auto-transition logic
import { enquiryHasPOTaggedAttachment, getApprovalTargets } from "@/domain/enquiry/enquiry.approval";
import {
  createEnquiryFromThread,
  getNavigationStateAfterCreation,
} from "@/domain/enquiry/enquiry.thread-creation";
import { createEnquiryFromBuyerMail } from "@/domain/enquiry/enquiry.mail-creation";
import { createEnquiryFromBuyerIntake } from "@/domain/enquiry/enquiry.buyer-intake";
import { generateGroupName, generateGroupId } from "@/domain/message/group.utils";
import { getBuyerIdFromPersona, getBuyerPersonaFromBuyerId, getSellerIdFromPersona } from "@/domain/buyer/buyer-persona-mapping";
import { MOCK_CONTACTS, getBuyerById } from "@/domain/buyer/buyer.mock-data";
import { resolveBuyerFromPersonaId } from "@/domain/buyer/buyer-identification";

// Import optimized computation hooks
import { useFilteredEnquiries } from "@/hooks/useFilteredEnquiries";
import { useEnrichedEnquiries } from "@/hooks/useEnrichedEnquiries";
import { useChannelMessages } from "@/hooks/useChannelMessages";
import { useEnrichedChannels } from "@/hooks/useEnrichedChannels";

// Import refactored handler hooks
import { useShareMessages } from "@/hooks/useShareMessages";

// NEW: Unified share modal
import { useShareDraft, computeSmartDefaults, getEligibleGroups, getCrossTypeGroups } from "@/hooks/useShareDraft";
import { useShareTelemetry } from "@/hooks/useShareTelemetry";
import { ShareModal } from "@/app/components/share/ShareModal";
import type { ShareSourceContext } from "@/domain/message/share.types";
import { validateShareDraft, isShareValid } from "@/domain/message/share.types";
import { transformForShare } from "@/domain/sharing";
import type { ShareContext, GroupKind } from "@/domain/sharing";
import { getShareSourceKindFromContext } from "@/domain/sharing/share.channel-kinds";

// Export constants for compatibility
export { SELLERS, CM_USERS };

// Performance: Debug logging flag - set to true to enable verbose logging
const __DEV_LOG__ = false;
const devLog = __DEV_LOG__ ? (label: string, data?: any) => console.log(label, data) : (() => {}) as (label: string, data?: any) => void;
const devWarn = __DEV_LOG__ ? (label: string, data?: any) => console.warn(label, data) : (() => {}) as (label: string, data?: any) => void;
const devError = __DEV_LOG__ ? (label: string, data?: any) => console.error(label, data) : (() => {}) as (label: string, data?: any) => void;

type HeaderApprovalAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string;
};

const ENQUIRY_EVENT_TYPES = new Set<EnquiryEvent["type"]>([
  "ENQUIRY_CREATED",
  "ENQUIRY_REGION_ASSIGNED",
  "PRIMARY_CM_ASSIGNED",
  "MEMBER_ADDED",
  "MEMBER_REMOVED",
  "MEMBER_TAGGED",
  "MEMBER_ROLE_UPDATED",
  "ENQUIRY_STATE_CHANGED",
  "ENQUIRY_CONVERTED",
  "ENQUIRY_VIEWED",
]);

function isEnquiryEvent(event: { type: string }): event is EnquiryEvent {
  return ENQUIRY_EVENT_TYPES.has(event.type as EnquiryEvent["type"]);
}

// Performance: Extracted from IIFE in JSX to avoid creating new functions on every render
const ProfileBottomSheetContent = React.memo(function ProfileBottomSheetContent({
  personaId,
  viewerRole,
}: {
  personaId: string | null;
  viewerRole: string;
}) {
  if (!personaId) return null;
  const profileData = getProfileData(personaId);
  if (!profileData) return null;
  return <EntityProfileCard profileData={profileData} viewerRole={viewerRole} />;
});

// Main App Content (uses hooks, must be inside providers)
function AppContent() {
  // State
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null); // No default — user navigates via Enquiry Threads or Groups
  const [searchQuery, setSearchQuery] = useState("");
  const [plutoSearchQuery, setPlutoSearchQuery] = useState("");
  const [currentChannel, setCurrentChannel] = useState("internal"); // Default to internal channel
  const [selectedBuyerDMId, setSelectedBuyerDMId] = useState<string | null>(null);
  const [selectedSellerDMId, setSelectedSellerDMId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null); // NEW: Selected group channel
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null); // Thread panel state
  const [threadPanelOpen, setThreadPanelOpen] = useState(false); // Whether right panel shows thread
  const [threadViewMode, setThreadViewMode] = useState<"side-panel" | "main">("side-panel"); // side-panel = Groups tab (right col), main = Enquiry Threads tab (middle col)
  const [mobileComposer, setMobileComposer] = useState<React.ReactNode>(null); // Mobile composer from ConversationPanel
  const mobileShareTriggerRef = useRef<(() => void) | null>(null); // Mobile share trigger callback (using ref to avoid re-renders)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false); // Unified group creation modal (role-controlled: BDM→buyer, CM→seller)
  const [mailCreatedEnquiryIds, setMailCreatedEnquiryIds] = useState<Set<string>>(() => new Set());
  const [whatsappCreatedEnquiryIds, setWhatsappCreatedEnquiryIds] = useState<Set<string>>(() => new Set());
  const [tagInternalGroupModalOpen, setTagInternalGroupModalOpen] = useState(false);
  const [tagInternalGroupEnquiryId, setTagInternalGroupEnquiryId] = useState<string | null>(null);
  
  // NEW: Delivery widget state
  const [showDeliveryWidget, setShowDeliveryWidget] = useState(false);
  const [deliveryWidgetEnquiryId, setDeliveryWidgetEnquiryId] = useState<string | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<string | null>(null);

  // NEW: Thread creation modal state
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [threadCreationMessageId, setThreadCreationMessageId] = useState<string | null>(null);
  const [threadCreationMessage, setThreadCreationMessage] = useState<Message | null>(null);

  // NEW: Enquiry creation modal state
  const [showEnquiryCreationModal, setShowEnquiryCreationModal] = useState(false);
  const [enquiryCreationMode, setEnquiryCreationMode] = useState<"blank" | "share">("blank");
  const [enquiryCreationBuyerDMChannel, setEnquiryCreationBuyerDMChannel] = useState<BuyerDMChannel | null>(null);
  const [enquiryCreationMessages, setEnquiryCreationMessages] = useState<Message[]>([]);

  // NEW: Unified share modal state
  const shareDraft = useShareDraft();
  const shareTelemetry = useShareTelemetry();
  const {
    workspaceMode,
    pluto,
    setWorkspaceMode,
    goToPlutoList,
    openPlutoEnquiry,
    clearPlutoSelection,
  } = useWorkspaceNavigation();

  // Hooks - Use new role and policy hooks
  const { currentRole, currentPersona, currentUser, changeRole, changePersona } = useCurrentRole();
  const showChannelSidebar = useComponentVisibility("ChannelSidebar");
  const showSellerPanel = useComponentVisibility("SellerPanel");
  const canCreateSellerChannels = useActionPermission("CREATE_SELLER_CHANNEL");
  const { canShareMessages: canShareInCurrentPolicy } = useMessagePolicy();
  const { canManageMembers, canChangeState } = usePermissions();
  const isInternal = isInternalRole(currentRole);
  
  const { dataStore, realtimeService } = useAppStore();
  
  // Responsive - detect mobile to hide toasts
  const breakpoint = useBreakpoint();
  const isMobileView = isMobile(breakpoint);
  
  // Helper function to show toast only on desktop (memoized to prevent handler re-creation)
  const showToast = useMemo(() => ({
    success: (message: string) => {
      if (!isMobileView) toast.success(message);
    },
    error: (message: string) => {
      if (!isMobileView) toast.error(message);
    },
    info: (message: string) => {
      if (!isMobileView) toast.info(message);
    },
  }), [isMobileView]);
  
  // Get enquiries and message state
  const { enquiries, changeEnquiryState, convertEnquiry } = useEnquiries();
  const { messages, sendMessage, shareMessages, reload: reloadMessages } = 
    useMessages(selectedEnquiryId ?? "", currentChannel);
  
  const { sellerChannels, fanOutMessages, sendToSellerChannel, createSellerChannel, reload: reloadSellerChannels } = 
    useSellerChannels(selectedEnquiryId ?? "");
  const { createEnquiryWithMessages } = useEnquiryCreation();
  
  // Buyer DM channels - get all channels visible to current persona
  const buyerDMChannels = useBuyerDMChannels(currentPersona.id);
  const selectedBuyerDM = useBuyerDMChannel(selectedBuyerDMId || "");
  const buyerDMMessages = useBuyerDMMessages(selectedBuyerDMId || "");
  
  // For buyers, get their DM channel with their BDM
  const buyerDMForCurrentBuyer = useBuyerDMForBuyer(currentRole === "Buyer" ? currentPersona.id : "");
  
  // For buyer DM sending (buyer's own DM)
  const buyerOwnDMMessages = useBuyerDMMessages(buyerDMForCurrentBuyer?.id || "");
  
  // For sellers, get all their DM channels across all enquiries
  const sellerPersonaSellerId = currentRole === "Seller" ? getSellerIdByPersonaName(currentPersona.displayName) : "";
  const sellerDMChannels = useSellerDMChannels(sellerPersonaSellerId || "");
  
  // For CMs, get all their seller DM channels
  const cmSellerDMChannels = useSellerDMChannelsForCM(currentRole === "CM" ? currentPersona.id : "");
  const selectedSellerDM = cmSellerDMChannels.find(ch => ch.id === selectedSellerDMId);
  
  // Get group channels
  const allGroupChannels = useGroupChannels(); // Get ALL groups, not just pending
  const selectedGroup = allGroupChannels.find(g => g.id === selectedGroupId);
  const eligibleInternalGroupsForTagging = useMemo(
    () => allGroupChannels.filter((group) => group.type === "custom" && !group.enquiryId),
    [allGroupChannels]
  );
  
  // Debug logging (can be removed in production)
  // console.log('[App.tsx] Group channels state:', {
  //   selectedGroupId,
  //   allGroupChannelsCount: allGroupChannels.length,
  //   allGroupChannelIds: allGroupChannels.map(g => g.id),
  //   selectedGroup: selectedGroup ? { id: selectedGroup.id, name: selectedGroup.name, messageCount: selectedGroup.messages?.length } : null
  // });
  
  // Seller DM message sending
  const { sendSellerDMMessage } = useSendSellerDMMessage();
  
  const dispatch = useEnquiryDispatch();
  const enquiryState = useEnquiryState();
  const messageDispatch = useMessageDispatch();
  const enquiryMembers: Array<{ personaId: string }> = [];
  
  // Get full message state for mention detection and sharing
  const messageState = useMessageState();

  const syncDomainEvent = useCallback(
    async (event: EnquiryEvent | MessageEvent) => {
      if (isEnquiryEvent(event)) {
        dispatch(event);
      } else {
        messageDispatch(event as MessageEvent);
      }

      await dataStore.appendEvent(event);
      await realtimeService.publish(event);
    },
    [dataStore, dispatch, messageDispatch, realtimeService]
  );
  
  // Auto-select first group if none is selected and groups are available
  useEffect(() => {
    if (!selectedGroupId && !selectedEnquiryId && !selectedBuyerDMId && !selectedSellerDMId && allGroupChannels.length > 0) {
      console.log('[App.tsx] Auto-selecting first group:', allGroupChannels[0].id);
      setSelectedGroupId(allGroupChannels[0].id);
      messageDispatch(createGroupViewedEvent(allGroupChannels[0].id, currentPersona.id));
    }
  }, [selectedGroupId, selectedEnquiryId, selectedBuyerDMId, selectedSellerDMId, allGroupChannels, currentPersona.id, messageDispatch]);
  
  // Create persona map for quick lookup
  const personaMap = useMemo(() => {
    const map = new Map();
    PERSONAS.forEach(persona => map.set(persona.id, persona));
    return map;
  }, []);
  
  // Selected enquiry
  const selectedEnquiry = useMemo(
    () => enquiries.find((e) => e.id === selectedEnquiryId),
    [enquiries, selectedEnquiryId]
  );

  // Visible channels based on role (memoized to prevent recalculation)
  const visibleChannelIds = useMemo(() => CHANNEL_VISIBILITY[currentRole], [currentRole]);
  const visibleChannels = useMemo(
    () => STATIC_CHANNELS.filter((ch) => visibleChannelIds.includes(ch.id)),
    [visibleChannelIds]
  );

  // Combined channels (static + seller channels)
  const allChannels = useMemo(() => {
    const channels = [...visibleChannels];
    
    // Add seller channels for CM role (using policy hook)
    if (canCreateSellerChannels) {
      sellerChannels.forEach((sc) => {
        channels.push({
          id: sc.id,
          label: sc.sellerName,
          icon: null,
          unread: false,
          type: "communication" as const,
        });
      });
    }

    return channels;
  }, [visibleChannels, sellerChannels, canCreateSellerChannels]);

  // Available channels for sharing (convert to simple format for ConversationPanel)
  const availableChannelsSimple = useMemo(() => {
    return allChannels.map(ch => ({ id: ch.id, label: ch.label }));
  }, [allChannels]);

  // Enrich channels with mention detection for sidebar @ badges
  // This enriches channels for ALL enquiries, not just the selected one
  // Enrich channels with mention indicators
  const enrichedChannels = useEnrichedChannels({
    channels: visibleChannels,
    selectedEnquiryId,
    currentPersonaId: currentPersona.id,
    messagesByEnquiry: messageState.messages,
  });

  // Handle role change
  const handleRoleChange = useCallback((newRole: typeof currentRole) => {
    changeRole(newRole);
    
    // Update channel visibility based on new role
    const newVisibleChannels = CHANNEL_VISIBILITY[newRole];
    if (!newVisibleChannels.includes(currentChannel) && !currentChannel.startsWith("seller-")) {
      setCurrentChannel(newVisibleChannels[0] || "internal");
    }
  }, [changeRole, currentChannel]);

  // Handle persona change
  const handlePersonaChange = useCallback((newPersona: typeof currentPersona) => {
    changePersona(newPersona);
    
    // Clear enquiry selection on persona switch — the old EnquiryHeader detail
    // view should only appear when the user explicitly navigates to it (e.g. via
    // Create Enquiry). The default landing is now the Enquiry Threads / Groups sidebar.
    setSelectedEnquiryId(null);
    setSelectedThreadId(null);
    setThreadPanelOpen(false);
    setThreadViewMode("side-panel");
    setSelectedGroupId(null);
    setSelectedBuyerDMId(null);
    setSelectedSellerDMId(null);
    
    // Update channel to appropriate default for the new role
    const newVisibleChannels = CHANNEL_VISIBILITY[newPersona.role];
    if (!newVisibleChannels.includes(currentChannel) && !currentChannel.startsWith("seller-")) {
      setCurrentChannel(newVisibleChannels[0] || "buyer");
    }
  }, [changePersona, currentChannel]);

  const handleWorkspaceModeChange = useCallback(
    (mode: WorkspaceMode) => {
      setWorkspaceMode(mode);
    },
    [setWorkspaceMode],
  );

  const handlePlutoCreatePlaceholder = useCallback(() => {
    if (currentRole === "BDM") {
      showToast.info("Use Prism to create a new enquiry for now.");
      return;
    }

    showToast.info("Pluto create flow is a placeholder in this pass.");
  }, [currentRole, showToast]);

  // Handle state change
  const handleStateChange = useCallback(async (enquiryId: string, newState: string) => {
    await changeEnquiryState(
      enquiryId,
      newState as EnquiryState,
      currentUser,
      currentRole,
      realtimeService
    );
    showToast.success(`Enquiry state updated to ${newState}`);
  }, [changeEnquiryState, currentUser, currentRole, realtimeService, showToast]);
  
  // Handle channel selection
  const handleChannelSelection = useCallback((channelId: string) => {
    setCurrentChannel(channelId);
  }, []);

  // Handle open enquiry creation modal
  const handleOpenEnquiryCreation = useCallback((options?: {
    mode?: "blank" | "share";
    buyerDMChannel?: BuyerDMChannel | null;
    messages?: Message[];
  }) => {
    setEnquiryCreationMode(options?.mode || "blank");
    setEnquiryCreationBuyerDMChannel(options?.buyerDMChannel || selectedBuyerDM || null);
    setEnquiryCreationMessages(options?.messages || []);
    setShowEnquiryCreationModal(true);
  }, [selectedBuyerDM]);

  const handleCloseEnquiryCreationModal = useCallback(() => {
    setShowEnquiryCreationModal(false);
    setEnquiryCreationMode("blank");
    setEnquiryCreationBuyerDMChannel(null);
    setEnquiryCreationMessages([]);
  }, []);

  // Handle create group
  const handleCreateGroup = useCallback((members: SelectedMember[]) => {
    
    // Convert SelectedMember[] to GroupMember[]
    // Map buyerPersonaId to actual buyerId for contacts
    const groupMembers = members.map(member => {
      // For contacts with buyerPersonaId, map to actual buyerId
      let buyerId = member.buyerPersonaId;
      if (member.type === "contact" && member.buyerPersonaId) {
        buyerId = getBuyerIdFromPersona(member.buyerPersonaId);
      }
      
      return {
        id: member.id,
        type: member.type,
        name: member.name,
        phone: member.phone,
        role: member.role,
        buyerId,
      };
    });
    
    // Generate group name based on selected buyers
    const groupName = generateGroupName(groupMembers);
    const groupId = generateGroupId();
    
    // Determine group type based on members
    const hasExternalContacts = groupMembers.some(m => m.type === "contact");
    const groupType = hasExternalContacts ? "buyer" : "custom";
    
    // Check if any members need WhatsApp invitations
    const hasWhatsAppInvitations = members.some(
      m => m.invitationMethod === "whatsapp" || m.invitationMethod === "both"
    );
    
    // Create group with pending status and message
    const event = createGroupCreatedEvent(
      groupId,
      groupName,
      groupType,
      "pending",
      groupMembers,
      currentPersona.id,
      "Waiting for members to join" // Pending message
    );
    
    // Dispatch to message context
    messageDispatch(event);
    
    showToast.success(`Group "${groupName}" creation requested! Waiting for members to join.`);
  }, [currentPersona.id, messageDispatch, showToast]);

  // Handle create seller group
  const handleCreateSellerGroup = useCallback((
    sellerId: string,
    sellerName: string,
    groupName: string,
    memberPersonaIds: string[]
  ) => {
    
    // Build GroupMember array
    const groupMembers: any[] = [
      // Seller contact
      {
        id: sellerId,
        type: "contact",
        name: sellerName,
        role: "Seller",
        sellerId: sellerId,
      },
      // Internal members
      ...memberPersonaIds.map(personaId => {
        const persona = getPersonaById(personaId);
        return {
          id: personaId,
          type: "persona",
          name: persona?.displayName || "",
          role: persona?.role || "CM",
        };
      }),
    ];
    
    const groupId = generateGroupId();
    
    // Create seller group with active status (auto-approved)
    const event = createGroupCreatedEvent(
      groupId,
      groupName,
      "seller",
      "active", // Auto-approved
      groupMembers,
      currentPersona.id
    );
    
    // Dispatch to message context
    messageDispatch(event);
    
    showToast.success(`Seller group "${groupName}" created successfully!`);
  }, [currentPersona.id, messageDispatch, showToast]);

  // Handle add members to group
  const handleAddMembersToGroup = useCallback((groupId: string, memberIds: string[]) => {
    
    // Convert member IDs to GroupMember format
    const groupMembers = memberIds.map(id => {
      // Check if it's a persona (internal user)
      const persona = getPersonaById(id);
      if (persona) {
        return {
          id: id,
          type: "persona" as const,
          name: persona.displayName,
          role: persona.role,
        };
      }
      
      // Check if it's a contact from buyer mock data
      const contact = MOCK_CONTACTS.find(c => c.id === id);
      if (contact) {
        return {
          id: id,
          type: "contact" as const,
          name: contact.name,
          phone: contact.phone,
          role: contact.role,
          buyerId: contact.buyerId,
        };
      }
      
      // Fallback - treat as persona
      return {
        id: id,
        type: "persona" as const,
        name: id,
      };
    });
    
    // Dispatch event to add members
    const event = createGroupMembersAddedEvent(groupId, groupMembers, currentPersona.id);
    messageDispatch(event);
    
    showToast.success(`${memberIds.length} member(s) added to group`);
  }, [currentPersona.id, messageDispatch, showToast]);

  // Handle convert to order
  const handleConvertToOrder = useCallback(async (enquiryId: string) => {
    await convertEnquiry(enquiryId, currentUser, currentRole);
    showToast.success("Enquiry converted to order!");
  }, [convertEnquiry, currentUser, currentRole, showToast]);

  const dispatchSystemEnquiryMention = useCallback(async (
    enquiryId: string,
    content: string,
    mentions: string[]
  ) => {
    const message: Message = {
      id: `system-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: "system",
      content,
      timestamp: new Date(),
      mentions,
    };

    const event = createMessageSentEvent(enquiryId, "internal", message);
    messageDispatch(event);
    await realtimeService.publish(event);
  }, [messageDispatch, realtimeService]);

  const handleRequestOrderApproval = useCallback(async (enquiryId: string) => {
    if (!enquiryHasPOTaggedAttachment(messageState, enquiryId)) {
      showToast.error("Mark as Won is only available after a PO-tagged file is added.");
      return;
    }

    const { primaryCM } = getApprovalTargets(enquiryState, enquiryId);
    if (!primaryCM) {
      showToast.error("Assign a primary CM before requesting approval.");
      return;
    }

    const primaryCMPersona = getPersonaById(primaryCM.personaId);
    await changeEnquiryState(enquiryId, "Pending Approval", currentUser, currentRole);
    await dispatchSystemEnquiryMention(
      enquiryId,
      `@${primaryCMPersona?.displayName || "CM"} BDM is asking for approval.`,
      [primaryCM.personaId]
    );
    showToast.success("Approval request sent to CM.");
  }, [
    changeEnquiryState,
    currentRole,
    currentUser,
    dispatchSystemEnquiryMention,
    enquiryState,
    messageState,
    showToast,
  ]);

  const handleConfirmForOrder = useCallback(async (enquiryId: string) => {
    const { cxMembers } = getApprovalTargets(enquiryState, enquiryId);
    if (cxMembers.length === 0) {
      showToast.error("Add a CX member to this enquiry before confirming for order.");
      return;
    }

    const mentions = cxMembers.map((member) => member.personaId);
    const mentionLabels = mentions.map((personaId) => `@${getPersonaById(personaId)?.displayName || "CX"}`);
    await dispatchSystemEnquiryMention(
      enquiryId,
      `${mentionLabels.join(" ")} CM has confirmed for order.`,
      mentions
    );
    showToast.success("CX team notified.");
  }, [dispatchSystemEnquiryMention, enquiryState, showToast]);

  // Handle send message (memoized)
  const handleSendMessage = useCallback(async (
    content: string, 
    attachment?: any, 
    audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number },
    mentions?: string[]
  ) => {
    // Check if we're in a buyer DM context (BDM sending to a selected buyer DM)
    if (selectedBuyerDMId && buyerDMMessages) {
      devLog('[handleSendMessage] Sending buyer DM message:', { selectedBuyerDMId, content });
      await buyerDMMessages.sendBuyerDMMessage(content, currentUser, currentRole, attachment, audioRecording, mentions);
      // Immediately clear unread since the sender is already viewing this DM
      messageDispatch(createBuyerDMViewedEvent(selectedBuyerDMId, currentPersona.id));
      showToast.success("Message sent");
      return;
    }
    
    // Check if we're in a group context
    devLog('[handleSendMessage] Group context check:', { 
      selectedGroupId, 
      hasSelectedGroup: !!selectedGroup,
      allGroupChannelsCount: allGroupChannels.length,
    });
    
    if (selectedGroupId && selectedGroup) {
      devLog('[handleSendMessage] Sending group message:', { selectedGroupId, content });
      
      const message: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "user",
        sender: stripRoleSuffix(currentUser),
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

      const event: MessageEvent = {
        type: "MESSAGE_SENT",
        payload: {
          enquiryId: selectedGroupId,
          channelId: selectedGroupId,
          message,
          timestamp: new Date(),
        },
      };

      messageDispatch(event);
      // Immediately clear unread since the sender is already viewing this group
      messageDispatch(createGroupViewedEvent(selectedGroupId, currentPersona.id));
      await realtimeService.publish(event);
      showToast.success("Message sent");
      return;
    }
    
    // Check for command-based state changes
    if (selectedEnquiryId && content.includes('@')) {
      const commandStateMap: Record<string, string> = {
        '@buyer-responding': 'Buyer responding',
        '@seller-quoting': 'Seller quoting',
        '@quote-shared': 'Quote shared',
        '@awaiting-po': 'Awaiting PO',
        '@po-received': 'PO received',
        '@cx-validated': 'CX validated',
        '@convert-to-order': 'Converted to order',
      };
      
      for (const [command, newState] of Object.entries(commandStateMap)) {
        if (content.includes(command)) {
          devLog(`[handleSendMessage] Detected command ${command}, changing state to: ${newState}`);
          await changeEnquiryState(selectedEnquiryId, newState as EnquiryState, currentUser, currentRole, realtimeService);
          showToast.success(`Enquiry state updated to ${newState}`);
          break;
        }
      }
    }
    
    // For enquiry messages: Auto-add mentioned members if they're not already in the enquiry
    if (mentions && mentions.length > 0 && selectedEnquiryId && enquiryMembers) {
      devLog('[handleSendMessage] Processing mentions:', { mentions });
      const currentMemberPersonaIds = enquiryMembers.map(m => m.personaId);
      const newMemberPersonaIds = mentions.filter(personaId => !currentMemberPersonaIds.includes(personaId));
      
      if (newMemberPersonaIds.length > 0) {
        devLog('[handleSendMessage] Auto-adding mentioned members:', newMemberPersonaIds);
        for (const personaId of newMemberPersonaIds) {
          const persona = getPersonaById(personaId);
          if (persona) {
            const member = {
              id: generateMemberId(selectedEnquiryId, personaId),
              userId: persona.userId,
              personaId: persona.id,
              role: persona.role,
              joinedAt: new Date(),
            };
            const event = createMemberAddedEvent(selectedEnquiryId, member);
            dispatch(event);
            await dataStore.appendEvent(event);
            await realtimeService.publish(event);
          }
        }
        showToast.success(mentions.length > 1 ? `Added ${newMemberPersonaIds.length} mentioned member(s)` : `Added mentioned member`);
      }
    }
    
    // Check for automatic state transitions
    if (selectedEnquiry && mentions && mentions.length > 0) {
      const transitionCheck = checkCMTaggedTransition(selectedEnquiry, mentions, currentRole);
      if (transitionCheck.shouldTransition) {
        devLog('[handleSendMessage] Auto-transitioning state:', transitionCheck.reason);
        await changeEnquiryState(selectedEnquiry.id, "Pending Response" as EnquiryState, currentUser, currentRole);
        showToast.success(`State changed to: Pending Response (${transitionCheck.reason})`);
      }
    }
    
    // Otherwise use regular enquiry message sending
    await sendMessage(content, currentUser, currentRole, attachment, audioRecording, mentions);
    showToast.success("Message sent");
  }, [selectedBuyerDMId, buyerDMMessages, selectedGroupId, selectedGroup, allGroupChannels.length, currentUser, currentPersona.id, currentRole, selectedEnquiryId, enquiryMembers, selectedEnquiry, messageDispatch, realtimeService, changeEnquiryState, dispatch, dataStore, sendMessage, showToast]);

  // Handle share messages - extracted to useShareMessages hook (Pass 3)
  const handleShareMessages = useShareMessages({
    selectedSellerDMId,
    selectedSellerDM,
    selectedBuyerDMId,
    selectedBuyerDM,
    selectedGroupId,
    allGroupChannels,
    currentUser,
    currentRole,
    currentPersonaId: currentPersona.id,
    currentPersonaDisplayName: currentPersona.displayName,
    currentChannel,
    selectedEnquiryId,
    messages,
    buyerDMChannels,
    sellerDMChannels: messageState.sellerDMChannels || [],
    messageDispatch,
    showToast,
    reloadMessages,
    shareMessages,
    setSelectedSellerDMId,
    setSelectedBuyerDMId: (id) => setSelectedBuyerDMId(id as string | null),
    setSelectedEnquiryId: (id) => setSelectedEnquiryId(id),
    setCurrentChannel,
  });

  // ── NEW: Unified Share Modal handlers ──────────────────────────────

  /** Open the unified share modal from any context, with smart defaults */
  const handleOpenShareModal = useCallback((
    sourceContext: ShareSourceContext,
    messageIds: string[],
    sourceMessages: Message[]
  ) => {
    // 1. Open the modal (resets state, computes concatenated content)
    shareDraft.open(sourceContext, messageIds, sourceMessages);

    // 2. Compute smart defaults
    const sourceGroupId = sourceContext.type === "group"
      ? sourceContext.id
      : sourceContext.groupId ?? null;

    const eligibleRaw = getEligibleGroups(
      allGroupChannels, currentRole, currentPersona.id, sourceGroupId
    );

    // Apply cross-type filtering based on source group type
    const sourceGroup = allGroupChannels.find(g => g.id === sourceGroupId);
    const sourceGroupType = (sourceContext.type === "group" || sourceContext.type === "thread")
      ? (sourceGroup?.type ?? null)
      : null;
    const eligible = getCrossTypeGroups(eligibleRaw, sourceGroupType);

    // Determine if there's a source enquiry to match against
    // Thread sources carry their own enquiryId for cross-group clustering
    const sourceEnquiryId = sourceContext.type === "enquiry-channel"
      ? sourceContext.id
      : sourceContext.enquiryId ?? undefined;

    const defaults = computeSmartDefaults(
      sourceContext,
      allGroupChannels,
      eligible,
      currentRole,
      sourceEnquiryId
    );

    // 3. Apply defaults
    if (defaults.targetGroupIds.length > 0) {
      shareDraft.setTargetGroups(defaults.targetGroupIds);
    }
    shareDraft.setRouteMode(defaults.routeMode);
    if (defaults.targetThreadId) {
      shareDraft.setTargetThread(defaults.targetThreadId);
    }

    // 4. Store defaults snapshot for telemetry comparison at submit time
    shareDraft.setDefaultsSnapshot(
      defaults.targetGroupIds,
      defaults.routeMode,
      defaults.targetThreadId
    );

    // 5. Telemetry
    shareTelemetry.track("share_modal_opened", {
      source: sourceContext.type,
      messageCount: messageIds.length,
      defaultGroupIds: defaults.targetGroupIds,
      defaultRouteMode: defaults.routeMode,
      defaultThreadId: defaults.targetThreadId,
    });
  }, [shareDraft, shareTelemetry, allGroupChannels, currentRole, currentPersona.id]);

  /** Submit from the unified share modal */
  const handleShareModalSubmit = useCallback(() => {
    const { draft } = shareDraft;
    if (draft.targetGroupIds.length === 0) return;

    const errors = validateShareDraft(draft);
    if (!isShareValid(errors)) return;

    const shareSourceGroupId = draft.sourceContext.type === "group"
      ? draft.sourceContext.id
      : draft.sourceContext.groupId ?? undefined;
    const shareSourceGroup = shareSourceGroupId
      ? allGroupChannels.find(g => g.id === shareSourceGroupId)
      : undefined;
    const sellerRfqEligible = currentRole === "CM" && (
      shareSourceGroup?.type === "buyer" || shareSourceGroup?.type === "seller"
    );

    const isSingleGroup = draft.targetGroupIds.length === 1;
    if (isSingleGroup && draft.routeMode === "existing-thread" && !draft.targetThreadId) {
      showToast.error("Select a thread or create a new enquiry");
      return;
    }

    // The concatenated (possibly edited) message content
    const content = draft.concatenatedContent.trim();
    const originalContent = draft.sourceMessages.map((m) => m.content).filter(Boolean).join("\n");
    const wasEdited = content !== originalContent;

    const primaryGroupId = draft.targetGroupIds[0];

    // ── Derive share policy context from the modal's source context ──
    const sourceKind = getShareSourceKindFromContext(draft.sourceContext);
    const sourceGroupId = draft.sourceContext.type === "group"
      ? draft.sourceContext.id
      : draft.sourceContext.groupId ?? undefined;
    const sourceGroup = sourceGroupId
      ? allGroupChannels.find(g => g.id === sourceGroupId)
      : undefined;
    const sourceGroupKind = sourceGroup?.type as GroupKind | undefined;

    // Feature disabled: parent-main-chat route mode

    if (isSingleGroup && draft.routeMode === "existing-thread" && draft.targetThreadId) {
      // ── Single group + thread selected → share to thread ──────
      const destGroup = allGroupChannels.find(g => g.id === primaryGroupId);
      const targetGroupKind = (destGroup?.type ?? "custom") as GroupKind;

      const shareCtx: ShareContext = {
        role: currentRole as UserRole,
        sourceKind,
        sourceGroupKind,
        targetKind: "thread",
        targetGroupKind,
        sourceId: draft.sourceContext.enquiryId || sourceGroupId, // Carry source enquiry for sharedFrom metadata
        targetId: primaryGroupId,
      };

      const transformedMsg = transformForShare(draft.sourceMessages, {
        context: shareCtx,
        sharerName: currentPersona.displayName,
        sharerPersonaId: currentPersona.id,
        sharerRole: currentRole as UserRole,
        timestamp: new Date(),
        sellerRfq: draft.sellerRfq && sellerRfqEligible,
      });

      // Override content if user edited it in the modal
      const replyMsg: Message = wasEdited
        ? { ...transformedMsg, content, edited: true }
        : transformedMsg;

      const event: MessageEvent = {
        type: "THREAD_MESSAGE_SENT",
        payload: {
          threadId: draft.targetThreadId,
          channelId: primaryGroupId,
          message: replyMsg,
          timestamp: new Date(),
        },
      };
      void syncDomainEvent(event);
      showToast.success("Message shared to thread");

    } else if (isSingleGroup && draft.routeMode === "new-enquiry") {
      // ── Single group + new enquiry → create enquiry + thread ──
      if (currentRole !== "BDM") {
        showToast.error("Only BDMs can create new enquiries");
        return;
      }
      const enquiryTitle = content.split("\n")[0]?.substring(0, 120) || "New Enquiry";
      // Generate incremental enquiry ID matching existing format (ENQ-XXXX)
      const existingNums = enquiries
        .map(e => {
          const match = e.id.match(/^ENQ-(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => n > 0);
      const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 2401;
      const newEnquiryId = `ENQ-${nextNum}`;
      const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const threadTitle = enquiryTitle;

      // Resolve buyer info from the SOURCE group first (external→internal: source has the buyer)
      // then fall back to the target group
      let resolvedBuyerName: string | undefined;
      let resolvedBuyerPersonaId: string | undefined;

      // 1. Try source group's buyer data (source is the external group we're sharing FROM)
      if (sourceGroup?.buyerId) {
        const buyer = getBuyerById(sourceGroup.buyerId);
        resolvedBuyerName = buyer?.name;
        resolvedBuyerPersonaId = getBuyerPersonaFromBuyerId(sourceGroup.buyerId) || sourceGroup.buyerPersonaId;
      } else if (sourceGroup?.buyerPersonaId) {
        const persona = getPersonaById(sourceGroup.buyerPersonaId);
        resolvedBuyerName = persona?.displayName?.replace(/\s*\(.*?\)\s*$/, "");
        resolvedBuyerPersonaId = sourceGroup.buyerPersonaId;
      }

      // 2. Source group member traversal (find buyer persona in members)
      if (!resolvedBuyerPersonaId && sourceGroup?.memberPersonaIds) {
        for (const pid of sourceGroup.memberPersonaIds) {
          if (pid.startsWith("p_buyer_")) {
            const persona = getPersonaById(pid);
            resolvedBuyerName = persona?.displayName?.replace(/\s*\(.*?\)\s*$/, "");
            resolvedBuyerPersonaId = pid;
            break;
          }
        }
      }

      // 3. Fall back to target group if source didn't resolve
      if (!resolvedBuyerPersonaId) {
        const targetGroup = allGroupChannels.find(g => g.id === primaryGroupId);
        if (targetGroup?.buyerId) {
          const buyer = getBuyerById(targetGroup.buyerId);
          resolvedBuyerName = buyer?.name;
          resolvedBuyerPersonaId = getBuyerPersonaFromBuyerId(targetGroup.buyerId) || targetGroup.buyerPersonaId;
        } else if (targetGroup?.buyerPersonaId) {
          const persona = getPersonaById(targetGroup.buyerPersonaId);
          resolvedBuyerName = persona?.displayName?.replace(/\s*\(.*?\)\s*$/, "");
          resolvedBuyerPersonaId = targetGroup.buyerPersonaId;
        }
      }

      // 1. Create Enquiry entity
      const enquiryEvent = createEnquiryCreatedEvent(
        newEnquiryId,
        currentPersona.id,
        undefined,
        resolvedBuyerName || enquiryTitle,
        resolvedBuyerPersonaId,
      );
      void syncDomainEvent(enquiryEvent);

      // 2. Root message in group main chat (thread anchor)
      const rootMsg: Message = {
        id: `msg-root-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "user",
        sender: stripRoleSuffix(currentPersona.displayName),
        senderPersonaId: currentPersona.id,
        senderRole: currentRole,
        content,
        timestamp: new Date(),
      };

      void syncDomainEvent({
        type: "MESSAGE_SENT",
        payload: {
          enquiryId: primaryGroupId,
          channelId: primaryGroupId,
          message: { ...rootMsg, threadId, replyCount: 0 },
          timestamp: new Date(),
        },
      });

      // 3. Create thread tagged with new enquiry ID
      void syncDomainEvent({
        type: "THREAD_CREATED",
        payload: {
          threadId,
          channelId: primaryGroupId,
          creatorId: currentPersona.id,
          timestamp: new Date(),
          title: threadTitle,
          enquiryId: newEnquiryId,
          rootMessageId: rootMsg.id,
        },
      });

      // 4. Auto-assign team members (BDM creator + CX; CM if categories known)
      // This ensures the enquiry is visible to all internal roles via persona filtering
      const assignmentResult = autoAssignTeamMembers(newEnquiryId, currentPersona.id);
      assignmentResult.events.forEach(evt => void syncDomainEvent(evt));

      // 5. Show delivery widget for BDM
      setShowDeliveryWidget(true);
      setDeliveryWidgetEnquiryId(newEnquiryId);

      showToast.success(`Created enquiry ${newEnquiryId} with thread`);
      
      // 6. Navigate to the new enquiry and thread
      setSelectedEnquiryId(newEnquiryId);
      setSelectedThreadId(threadId);
      setThreadViewMode("main"); // Show thread in main conversation panel
      setThreadPanelOpen(true); // Open the thread panel
      setSelectedGroupId(primaryGroupId); // Set to the group containing the thread
      setSelectedBuyerDMId(null);
      setSelectedSellerDMId(null);
      setCurrentChannel("internal"); // Start in internal channel

    } else if (!isSingleGroup) {
      // ── Multi-group shares → share directly to each target group main chat ──
      // If the source is a thread tagged with an enquiryId, auto-route to
      // a matching enquiry-tagged thread in each target group (find or create).
      const sourceEnquiryIdFromThread = draft.sourceContext.enquiryId;

      for (let i = 0; i < draft.targetGroupIds.length; i++) {
        const groupId = draft.targetGroupIds[i];
        const destGroup = allGroupChannels.find(g => g.id === groupId);
        if (!destGroup) continue;

        const targetGroupKind = (destGroup.type ?? "custom") as GroupKind;

        const shareCtx: ShareContext = {
          role: currentRole as UserRole,
          sourceKind,
          sourceGroupKind,
          targetKind: sourceEnquiryIdFromThread ? "thread" : "group-main",
          targetGroupKind,
          sourceId: sourceEnquiryIdFromThread || undefined, // Carry enquiry ID into sharedFrom metadata
          targetId: groupId,
        };

        const transformedMsg = transformForShare(draft.sourceMessages, {
          context: shareCtx,
          sharerName: currentPersona.displayName,
          sharerPersonaId: currentPersona.id,
          sharerRole: currentRole as UserRole,
          timestamp: new Date(),
          sellerRfq: draft.sellerRfq && sellerRfqEligible,
        });

        // Override content if user edited it; ensure unique ID per target
        const sharedMsg: Message = {
          ...transformedMsg,
          id: `${transformedMsg.id}-${i}`,
          ...(wasEdited ? { content, edited: true } : {}),
        };

        // ── Enquiry-thread clustering: auto-route to a tagged thread ──
        if (sourceEnquiryIdFromThread) {
          // Look for an existing thread in the target group tagged with the same enquiryId
          const existingThread = (destGroup.threads || []).find(
            (t: any) => t.enquiryId === sourceEnquiryIdFromThread
          );

          if (existingThread) {
            // Route the shared message into the existing enquiry thread
            const threadEvent: MessageEvent = {
              type: "THREAD_MESSAGE_SENT",
              payload: {
                threadId: existingThread.id,
                channelId: groupId,
                message: sharedMsg,
                timestamp: new Date(),
              },
            };
            void syncDomainEvent(threadEvent);
          } else {
            // No matching thread — create a root message + new enquiry-tagged thread
            const rootMsgId = `msg-root-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`;
            const newThreadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 6)}_${i}`;

            // 1. Root message in group main chat (thread anchor)
            const rootMsg: Message = {
              ...sharedMsg,
              id: rootMsgId,
              threadId: newThreadId,
              replyCount: 0,
            };

            void syncDomainEvent({
              type: "MESSAGE_SENT",
              payload: {
                enquiryId: groupId,
                channelId: groupId,
                message: rootMsg,
                timestamp: new Date(),
              },
            });

            // 2. Create thread tagged with the source enquiryId
            void syncDomainEvent(createThreadCreatedEvent(
              newThreadId,
              groupId,
              currentPersona.id,
              `${sourceEnquiryIdFromThread} — shared thread`,
              sourceEnquiryIdFromThread,
              rootMsgId,
              rootMsg,
            ));
          }
        } else {
          // No enquiry context — share to group main chat (existing behaviour)
          const event: MessageEvent = {
            type: "MESSAGE_SENT",
            payload: {
              enquiryId: groupId,
              channelId: groupId,
              message: sharedMsg,
              timestamp: new Date(),
            },
          };
          void syncDomainEvent(event);
        }
      }

      const groupCount = draft.targetGroupIds.length;
      if (sourceEnquiryIdFromThread) {
        showToast.success(
          groupCount === 1
            ? `Shared to enquiry thread ${sourceEnquiryIdFromThread}`
            : `Shared to ${groupCount} groups (${sourceEnquiryIdFromThread} threads)`
        );
      } else {
        showToast.success(
          groupCount === 1
            ? "Message shared to group"
            : `Message shared to ${groupCount} groups`
        );
      }
    } else {
      showToast.error("Select a thread or create a new enquiry");
      return;
    }

    // Telemetry: track submit with defaults comparison
    shareTelemetry.track("share_submitted", {
      routeMode: draft.routeMode,
      sourceType: draft.sourceContext.type,
      messageCount: draft.sourceMessages.length,
      targetGroupCount: draft.targetGroupIds.length,
      edited: wasEdited,
      defaultGroupsAccepted: JSON.stringify(draft.targetGroupIds) === JSON.stringify(draft._defaultGroupIds),
      defaultModeAccepted: draft.routeMode === draft._defaultRouteMode,
      defaultThreadAccepted: draft.routeMode === "existing-thread"
        ? draft.targetThreadId === draft._defaultThreadId
        : true,
      newEnquiryCreated: draft.routeMode === "new-enquiry",
    });

    if (draft.routeMode === "new-enquiry") {
      shareTelemetry.track("share_enquiry_created", {
        targetGroupId: primaryGroupId,
        messageCount: draft.sourceMessages.length,
      });
    }

    // Close modal
    shareDraft.close();
  }, [shareDraft, shareTelemetry, currentPersona, currentRole, messageDispatch, dispatch, showToast, allGroupChannels]);

  /** Handle delivery widget submission */
  const handleDeliveryWidgetSubmit = useCallback((location: string) => {
    setDeliveryLocation(location);
    setShowDeliveryWidget(false);
    
    // Optional: Save to enquiry structured data or dispatch an event
    if (deliveryWidgetEnquiryId) {
      // You can dispatch an event here to store the delivery location
      // For now, we just store it in component state
      showToast.success("Delivery location captured");
    }
  }, [deliveryWidgetEnquiryId, showToast]);

  // Handle fan-out
  const handleFanOut = useCallback(async (sellerIds: string[], content: string) => {
    await fanOutMessages(sellerIds, content, currentUser, currentRole);
    showToast.success(`Sent to ${sellerIds.length} seller(s)`);
    reloadSellerChannels();
  }, [fanOutMessages, currentUser, currentRole, showToast, reloadSellerChannels]);

  // Handle seller channel message (for sellers sending DM messages to CMs)
  const handleSellerChannelMessage = useCallback(async (
    sellerId: string,
    content: string,
    attachment?: any,
    audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number }
  ) => {
    // For seller DM model, find the channel for this seller
    const channel = sellerDMChannels.find(ch => ch.sellerId === sellerId);
    
    if (!channel) {
      devError('[handleSellerChannelMessage] No channel found for seller:', sellerId);
      showToast.error("Channel not found");
      return;
    }
    
    devLog('[handleSellerChannelMessage] Sending seller DM message:', {
      channelId: channel.id,
      sellerId,
      sellerName: channel.sellerName,
      cmName: channel.cmName
    });
    
    // Send message via seller DM with all required parameters
    await sendSellerDMMessage(
      sellerId,
      channel.sellerName,
      channel.cmPersonaId,
      channel.cmName,
      content,
      currentUser,
      currentRole,
      attachment,
      audioRecording,
      undefined, // mentions
      undefined, // sourceEnquiryId
      currentPersona.id // senderPersonaId
    );
    
    showToast.success("Message sent");
  }, [sellerDMChannels, sendSellerDMMessage, currentUser, currentRole, currentPersona.id, showToast]);
  
  // Handle group message sending
  const handleGroupMessageSend = useCallback(async (
    groupId: string,
    content: string,
    attachment?: any,
    audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number },
    mentions?: string[]
  ) => {
    const group = allGroupChannels.find(g => g.id === groupId);
    
    if (!group) {
      devError('[handleGroupMessageSend] No group found for:', groupId);
      showToast.error("Group not found");
      return;
    }
    
    devLog('[handleGroupMessageSend] Sending group message:', {
      groupId,
      groupName: group.name,
      content: content.substring(0, 50)
    });
    
    // Create message
      const message: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "user",
        sender: stripRoleSuffix(currentPersona.displayName),
        senderRole: currentRole,
        senderPersonaId: currentPersona.id,
        content,
      timestamp: new Date(),
      attachment,
      audioRecording,
      mentions,
    };
    
    // Dispatch MESSAGE_SENT event for group
    const event = createMessageSentEvent(
      group.enquiryId || groupId,
      groupId,
      message
    );
    messageDispatch(event);
    
    showToast.success("Message sent");
  }, [allGroupChannels, currentPersona.displayName, currentPersona.id, currentRole, messageDispatch, showToast]);
  
  // Handle seller mention - creates channel if needed and sends message
  const handleSellerMention = useCallback(async (
    sellerId: string,
    sellerName: string,
    content: string,
    attachment?: Attachment
  ) => {
    try {
      devLog('[handleSellerMention] Starting:', { sellerId, sellerName, content, selectedEnquiryId });
      
      // Send message via seller DM (this will auto-create channel if needed)
      await sendSellerDMMessage(
        sellerId,
        sellerName,
        currentPersona.id, // CM persona ID
        currentPersona.displayName, // CM name
        content,
        currentUser,
        currentRole,
        attachment,
        undefined, // no audio recording
        undefined, // no mentions
        selectedEnquiryId ?? undefined, // Pass the source enquiry ID for UI grouping (null → undefined)
        currentPersona.id // senderPersonaId
      );
      
      devLog('[handleSellerMention] Message sent via seller DM');
      showToast.success(`Message sent to ${sellerName}`);
    } catch (error) {
      devError("Failed to send message to seller:", error);
      showToast.error("Failed to send message to seller");
    }
  }, [sendSellerDMMessage, currentPersona.id, currentPersona.displayName, currentUser, currentRole, selectedEnquiryId, showToast]);
  
  // Handle add member
  const handleAddMember = useCallback((personaId: string) => {
    if (!selectedEnquiryId) {
      showToast.error("No enquiry selected");
      return;
    }
    const persona = getPersonaById(personaId);
    if (!persona) {
      showToast.error("Persona not found");
      return;
    }
    
    const memberId = generateMemberId(selectedEnquiryId, personaId);
    const member = {
      id: memberId,
      userId: persona.userId,
      personaId: persona.id,
      role: persona.role,
      joinedAt: new Date(),
    };
    
    const event = createMemberAddedEvent(selectedEnquiryId, member);
    dispatch(event);
    showToast.success(`Added ${persona.displayName}`);
  }, [selectedEnquiryId, dispatch, showToast]);
  
  // Handle remove member
  const handleRemoveMember = useCallback((memberId: string) => {
    if (!selectedEnquiryId) {
      showToast.error("No enquiry selected");
      return;
    }
    const event = createMemberRemovedEvent(selectedEnquiryId, memberId);
    dispatch(event);
    showToast.success("Member removed");
  }, [selectedEnquiryId, dispatch, showToast]);
  
  // Handle create enquiry
  const handleCreateEnquiry = useCallback(async (submission: EnquiryCreationSubmission) => {
    const { data, sourceMessages, intake } = submission;
    try {
      devLog("[handleCreateEnquiry] Starting enquiry creation", { data });
      
      const newEnquiryId = await createEnquiryWithMessages(
        data,
        sourceMessages,
        currentUser,
        currentRole as UserRole,
        currentPersona?.id || "unknown",
        enquiries
      );
      
      devLog("[handleCreateEnquiry] Enquiry created:", newEnquiryId);
      
      // Dispatch enquiry created event
      const enquiryEvent = createEnquiryCreatedEvent(
        newEnquiryId,
        currentPersona?.id || "unknown",
        data.deliveryLocation,
        data.buyerName,
        data.buyerPersonaId // NEW: Pass buyerPersonaId to event
      );
      await syncDomainEvent(enquiryEvent);
      devLog("[handleCreateEnquiry] ENQUIRY_CREATED event dispatched");
      
      // Auto-assign team members (BDM, CM, CX)
      const assignmentResult = autoAssignTeamMembers(
        newEnquiryId,
        currentPersona?.id || "unknown",
        data.categories // Use categories array instead of single category
      );
      
      // Dispatch all assignment events
      for (const event of assignmentResult.events) {
        await syncDomainEvent(event);
      }

      const intakeMessages = buildIntakeChannelMessages({
        enquiryId: newEnquiryId,
        intake,
        buyerName: data.buyerName,
        notes: data.notes,
        currentUser,
        currentRole: currentRole as UserRole,
        currentPersonaId: currentPersona?.id || "unknown",
      });

      for (const message of intakeMessages) {
        await syncDomainEvent({
          type: "MESSAGE_SENT",
          payload: {
            enquiryId: newEnquiryId,
            channelId: "internal",
            message,
            timestamp: message.timestamp,
          },
        });
      }

      const threadResult = buildInternalEnquiryThread({
        enquiryId: newEnquiryId,
        data,
        creatorPersonaId: currentPersona?.id || "unknown",
        creatorRole: currentRole as UserRole,
        allGroupChannels,
        sourceMessages: intakeMessages,
      });

      if (threadResult) {
        for (const event of threadResult.events) {
          await syncDomainEvent(event);
        }
      }
      
      // Show success message
      const assignedNames = [assignmentResult.assignedCMName, "CX"].filter(Boolean).join(" + ");
      if (assignedNames) {
        showToast.success(`Created enquiry ${newEnquiryId} • Assigned to ${assignedNames}`);
      } else {
        showToast.success(`Created enquiry ${newEnquiryId}`);
      }
      
      // Navigate to the new enquiry — clear all other selections for clean transition
      setSelectedBuyerDMId(null);
      setSelectedSellerDMId(null);
      setSelectedGroupId(null);
      setSelectedThreadId(null);
      setThreadPanelOpen(false);
      setThreadViewMode("side-panel");
      setSelectedEnquiryId(newEnquiryId);
      setCurrentChannel("internal"); // Start in internal channel to see shared messages
      setShowEnquiryCreationModal(false);
      setEnquiryCreationMessages([]);
      setEnquiryCreationBuyerDMChannel(null);
      setEnquiryCreationMode("blank");
      
      // Immediate reload without setTimeout - events are already dispatched
      devLog("[handleCreateEnquiry] Reloading messages for new enquiry");
      await reloadMessages();
    } catch (error) {
      devError("Failed to create enquiry:", error);
      showToast.error("Failed to create enquiry");
    }
  }, [createEnquiryWithMessages, currentUser, currentRole, currentPersona?.id, enquiries, reloadMessages, showToast, syncDomainEvent]);

  // Filter enquiries by search
  const filteredEnquiries = useFilteredEnquiries(enquiries, currentPersona, searchQuery);
  const plutoRoleConfig = useMemo(
    () => PLUTO_ROLE_SCREEN_CONFIG[currentRole],
    [currentRole],
  );
  const plutoAccessibleEnquiries = useMemo(
    () => selectPlutoAccessibleEnquiries({ enquiries, currentPersona }),
    [enquiries, currentPersona],
  );
  const plutoListItems = useMemo(
    () =>
      buildPlutoListItemViewModels({
        enquiries: plutoAccessibleEnquiries,
        enquiryState,
      }),
    [enquiryState, plutoAccessibleEnquiries],
  );
  const plutoFilteredItems = useMemo(
    () => filterPlutoListItemViewModels(plutoListItems, plutoSearchQuery),
    [plutoListItems, plutoSearchQuery],
  );
  const plutoKpiCards = useMemo(
    () => buildPlutoKpiCards(plutoListItems),
    [plutoListItems],
  );
  const plutoDetailHeader = useMemo(
    () =>
      pluto.selectedEnquiryId
        ? buildPlutoDetailHeaderViewModel({
            enquiryId: pluto.selectedEnquiryId,
            enquiryState,
          })
        : null,
    [enquiryState, pluto.selectedEnquiryId],
  );

  useEffect(() => {
    if (!pluto.selectedEnquiryId) {
      return;
    }

    const canStillAccessSelectedEnquiry = plutoAccessibleEnquiries.some(
      (enquiry) => enquiry.id === pluto.selectedEnquiryId,
    );

    if (!canStillAccessSelectedEnquiry) {
      clearPlutoSelection();
    }
  }, [clearPlutoSelection, pluto.selectedEnquiryId, plutoAccessibleEnquiries]);
  
  // Enrich enquiries with mention detection for UI display
  const enrichedEnquiries = useEnrichedEnquiries(filteredEnquiries, currentPersona.id);
  
  // Further enrich enquiries with per-enquiry mention detection
  const enquiriesWithMentionFlags = useMemo(() => {
    return enrichedEnquiries.map(enquiry => {
      // Check all channels in this enquiry for mentions
      let hasAnyMentions = false;
      
      // Use the already-memoized visibleChannelIds (avoids shadowing + redundant lookup)
      
      // Check each visible channel for mentions
      for (const channelId of visibleChannelIds) {
        const channelMessages = messageState.messages[enquiry.id]?.[channelId];
        
        // Only check if channel exists and has messages
        if (channelMessages && channelMessages.length > 0) {
          if (hasUnreadMentions(channelMessages, currentPersona.id)) {
            hasAnyMentions = true;
            break;
          }
        }
      }
      
      // Also check seller DM channels for this enquiry (only for CMs)
      if (!hasAnyMentions && cmSellerDMChannels && cmSellerDMChannels.length > 0) {
        const sellerDMsForEnquiry = cmSellerDMChannels.filter(dm => dm.sourceEnquiryId === enquiry.id);
        
        for (const dm of sellerDMsForEnquiry) {
          if (dm.messages && dm.messages.length > 0 && hasUnreadMentions(dm.messages, currentPersona.id)) {
            hasAnyMentions = true;
            break;
          }
        }
      }
      
      return {
        ...enquiry,
        hasMentions: hasAnyMentions,
      };
    });
  }, [enrichedEnquiries, messageState.messages, currentPersona.id, currentRole, cmSellerDMChannels]);
  
  // Enrich buyer DM channels with mention detection
  const enrichedBuyerDMs = useMemo(() => {
    return buyerDMChannels.map(dm => {
      const dmHasMentions = hasUnreadMentions(dm.messages, currentPersona.id);
      
      // Determine the correct unread count based on current persona
      const isBuyer = currentPersona.id === dm.buyerPersonaId;
      const unreadCount = isBuyer ? dm.unreadForBuyer : dm.unreadForBDM;
      
      return {
        ...dm,
        hasMentions: dmHasMentions,
        unreadCount, // Override with the correct per-participant count
      };
    });
  }, [buyerDMChannels, currentPersona.id]);
  
  // Enrich seller DM channels with mention detection
  const enrichedSellerDMs = useMemo(() => {
    return cmSellerDMChannels.map(dm => {
      const dmHasMentions = hasUnreadMentions(dm.messages, currentPersona.id);
      
      // Determine the correct unread count based on current persona
      const isCM = currentPersona.id === dm.cmPersonaId;
      const unreadCount = isCM ? dm.unreadForCM : dm.unreadForSeller;
      
      return {
        ...dm,
        hasMentions: dmHasMentions,
        unreadCount, // Override with the correct per-participant count
      };
    });
  }, [cmSellerDMChannels, currentPersona.id]);
  
  // Get messages for current channel
  const currentMessages = useChannelMessages(currentChannel, messages, sellerChannels);

  // Reload messages when channel or enquiry changes
  useEffect(() => {
    reloadMessages();
  }, [selectedEnquiryId, currentChannel, reloadMessages]);

  // Mobile-specific title and badge
  const mobileTitle = useMemo(() => {
    if (selectedBuyerDMId && selectedBuyerDM) return selectedBuyerDM.buyerName;
    if (selectedSellerDMId && selectedSellerDM) return selectedSellerDM.sellerName;
    if (selectedThreadId) return selectedGroup?.name || "Thread";
    if (selectedGroupId && selectedGroup) return selectedGroup.name;
    return 'Conversation';
  }, [selectedBuyerDMId, selectedBuyerDM, selectedSellerDMId, selectedSellerDM, selectedThreadId, selectedGroupId, selectedGroup]);

  const mobileSubtitle = useMemo(() => {
    if (selectedBuyerDMId) return 'Buyer DM';
    if (selectedSellerDMId) return 'Seller DM';
    if (selectedThreadId) return threadViewMode === "main" ? "Thread main view" : "Thread side panel";
    if (selectedGroupId && selectedGroup) return selectedGroup.type === "seller" ? "Seller group" : "Group";
    return undefined;
  }, [selectedBuyerDMId, selectedSellerDMId, selectedThreadId, threadViewMode, selectedGroupId, selectedGroup]);

  const mobileBadge = useMemo(() => {
    if (selectedEnquiryId) {
      return <span className="inline-flex items-center rounded-full border border-[#b9c0ff] bg-[#f4f5ff] px-2 py-0.5 text-[12px] font-medium text-[#5f55e6]">
        {selectedEnquiryId}
      </span>;
    }
    return undefined;
  }, [selectedEnquiryId]);

  // Mobile-specific: Profile bottom sheet state
  const [profileBottomSheetOpen, setProfileBottomSheetOpen] = useState(false);
  const [profilePersonaId, setProfilePersonaId] = useState<string | null>(null);

  // Mobile share trigger - stable callback that stores function in ref to avoid re-renders
  const handleMobileShareTrigger = useCallback((enterSelectionMode: () => void) => {
    mobileShareTriggerRef.current = enterSelectionMode;
  }, []);

  // Mobile-specific: Custom header for Buyer DMs
  const mobileBuyerDMCustomHeader = useMemo(() => {
    if (!selectedBuyerDM) return undefined;
    
    // Return a function that receives onBackClick and onDetailsClick from MobileApp
    return (onBackClick: () => void, onDetailsClick: () => void) => (
      <MobileBuyerDMHeader
        buyerName={selectedBuyerDM.buyerName}
        buyerPersonaId={selectedBuyerDM.buyerPersonaId}
        bdmName={selectedBuyerDM.bdmName}
        onBackClick={onBackClick}
        onDetailsClick={onDetailsClick} // NEW: Wire up details navigation
        onBuyerClick={() => {
          // Open profile bottom sheet for buyer
          if (selectedBuyerDM.buyerPersonaId) {
            setProfilePersonaId(selectedBuyerDM.buyerPersonaId);
            setProfileBottomSheetOpen(true);
          }
        }}
        onShareClick={() => {
          // Trigger selection mode using ref
          if (mobileShareTriggerRef.current) {
            mobileShareTriggerRef.current();
          }
        }}
      />
    );
  }, [selectedBuyerDM]); // No need to include ref in deps

  // Mobile-specific: Unified custom header (switches between Buyer DM and Enquiry headers)
  const unifiedMobileCustomHeader = useMemo(() => {
    // Priority: Buyer DM > undefined
    if (selectedBuyerDMId && mobileBuyerDMCustomHeader) {
      return mobileBuyerDMCustomHeader;
    }
    return undefined;
  }, [selectedBuyerDMId, mobileBuyerDMCustomHeader]);

  // Extracted inline JSX callbacks for referential stability
  const handleSelectBuyerDM = useCallback((dmId: string) => {
    setSelectedBuyerDMId(dmId);
    setSelectedSellerDMId(null);
    setSelectedGroupId(null);
    setSelectedEnquiryId(null);
    setSelectedThreadId(null);
    setThreadPanelOpen(false);
    setThreadViewMode("side-panel");
    messageDispatch(createBuyerDMViewedEvent(dmId, currentPersona.id));
  }, [messageDispatch, currentPersona.id]);

  const handleSelectSellerDM = useCallback((dmId: string) => {
    setSelectedSellerDMId(dmId);
    setSelectedBuyerDMId(null);
    setSelectedGroupId(null);
    setSelectedEnquiryId(null);
    setSelectedThreadId(null);
    setThreadPanelOpen(false);
    setThreadViewMode("side-panel");
    messageDispatch(createSellerDMViewedEvent(dmId, currentPersona.id));
  }, [messageDispatch, currentPersona.id]);

  const handleSelectGroup = useCallback((groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedBuyerDMId(null);
    setSelectedSellerDMId(null);
    setSelectedEnquiryId(null);
    setSelectedThreadId(null);
    setThreadPanelOpen(false);
    setThreadViewMode("side-panel");
    messageDispatch(createGroupViewedEvent(groupId, currentPersona.id));
  }, [messageDispatch, currentPersona.id]);

  const findThreadByEnquiryId = useCallback((enquiryId: string) => {
    for (const group of allGroupChannels) {
      const thread = (group.threads || []).find((t) => t.enquiryId === enquiryId);
      if (thread) {
        return { threadId: thread.id, groupId: group.id };
      }
    }
    return null;
  }, [allGroupChannels]);

  const syncPrismSelectionToEnquiry = useCallback((
    enquiryId: string,
    options?: { silentMissingThread?: boolean },
  ) => {
    const threadInfo = findThreadByEnquiryId(enquiryId);

    if (!threadInfo) {
      if (!options?.silentMissingThread) {
        showToast.info("No thread found for this enquiry yet");
        return;
      }

      setSelectedEnquiryId(enquiryId);
      setSelectedBuyerDMId(null);
      setSelectedSellerDMId(null);
      setSelectedGroupId(null);
      setSelectedThreadId(null);
      setThreadPanelOpen(false);
      setThreadViewMode("side-panel");
      setCurrentChannel("internal");
      return;
    }

    setSelectedEnquiryId(enquiryId);
    setSelectedBuyerDMId(null);
    setSelectedSellerDMId(null);
    setSelectedGroupId(threadInfo.groupId);
    setSelectedThreadId(threadInfo.threadId);
    setThreadPanelOpen(true);
    setThreadViewMode("main");
    setCurrentChannel("internal");
    messageDispatch(createThreadViewedEvent(threadInfo.threadId, currentPersona.id));
    messageDispatch(createGroupViewedEvent(threadInfo.groupId, currentPersona.id));
  }, [findThreadByEnquiryId, messageDispatch, currentPersona.id, showToast]);

  // Open a thread from group chat in the right-side panel.
  const handleOpenThread = useCallback((threadId: string) => {
    let threadInfo: { groupId: string; enquiryId?: string | null } | null = null;

    for (const group of allGroupChannels) {
      const thread = (group.threads || []).find((t) => t.id === threadId);
      if (thread) {
        threadInfo = { groupId: group.id, enquiryId: thread.enquiryId ?? null };
        break;
      }
    }

    if (!threadInfo) return;

    setSelectedEnquiryId(threadInfo.enquiryId ?? null);
    setSelectedBuyerDMId(null);
    setSelectedSellerDMId(null);
    setSelectedGroupId(threadInfo.groupId);
    setSelectedThreadId(threadId);
    setThreadPanelOpen(true);
    setThreadViewMode("side-panel");
    messageDispatch(createThreadViewedEvent(threadId, currentPersona.id));
    messageDispatch(createGroupViewedEvent(threadInfo.groupId, currentPersona.id));
  }, [allGroupChannels, messageDispatch, currentPersona.id]);

  const handleSelectEnquiry = useCallback((id: string) => {
    syncPrismSelectionToEnquiry(id);
  }, [syncPrismSelectionToEnquiry]);

  const handleSelectPlutoEnquiry = useCallback((enquiryId: string) => {
    openPlutoEnquiry(enquiryId);
    syncPrismSelectionToEnquiry(enquiryId, { silentMissingThread: true });
  }, [openPlutoEnquiry, syncPrismSelectionToEnquiry]);

  const handleBackToPlutoList = useCallback(() => {
    goToPlutoList();
  }, [goToPlutoList]);

  // Create a new thread from a non-threaded message in group chat
  const handleCreateThreadFromMessage = useCallback((messageId: string) => {
    if (!selectedGroupId || !selectedGroup) return;

    // Find the source message in the group's messages
    const sourceMessage = selectedGroup.messages.find(m => m.id === messageId);
    if (!sourceMessage) return;

    // Store message info and open modal for user input
    setThreadCreationMessageId(messageId);
    setThreadCreationMessage(sourceMessage);
    setShowThreadModal(true);
  }, [selectedGroupId, selectedGroup]);

  // Confirm thread creation from modal
  const handleConfirmThreadCreation = useCallback((params: { title?: string; enquiryId?: string }) => {
    if (!threadCreationMessageId || !threadCreationMessage || !selectedGroupId) return;

    const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Create thread with the message as root
    // THREAD_CREATED handler also links the root message (sets threadId on it)
    messageDispatch(createThreadCreatedEvent(
      threadId,
      selectedGroupId,
      currentPersona.id,
      undefined, // No thread title — threads are identified by enquiry data or "New Thread"
      params.enquiryId, // Optional enquiry ID tag
      threadCreationMessageId, // Root message ID — reducer will link it
      threadCreationMessage, // Snapshot of the root message for resilient docs rendering
    ));

    // Open the thread panel
    setSelectedThreadId(threadId);
    setThreadPanelOpen(true);
    setThreadViewMode("main");
    messageDispatch(createThreadViewedEvent(threadId, currentPersona.id));

    // Clear modal state
    setThreadCreationMessageId(null);
    setThreadCreationMessage(null);
    
    // Show success toast
    showToast.success(
      params.enquiryId 
        ? `Thread created and tagged with ${params.enquiryId}` 
        : "Thread created successfully"
    );
  }, [threadCreationMessageId, threadCreationMessage, selectedGroupId, messageDispatch, currentPersona.id, showToast]);

  // Select thread from Enquiry Threads tab — thread in middle column, structured data in right column
  const handleSelectThread = useCallback((threadId: string, groupId: string) => {
    let enquiryId: string | null = null;
    for (const group of allGroupChannels) {
      const thread = (group.threads || []).find((t) => t.id === threadId);
      if (thread) {
        enquiryId = thread.enquiryId ?? null;
        break;
      }
    }

    setSelectedThreadId(threadId);
    setSelectedGroupId(groupId);
    setSelectedBuyerDMId(null);
    setSelectedSellerDMId(null);
    setSelectedEnquiryId(enquiryId);
    setThreadPanelOpen(true);
    setThreadViewMode("main");
    messageDispatch(createThreadViewedEvent(threadId, currentPersona.id));
    messageDispatch(createGroupViewedEvent(groupId, currentPersona.id));
  }, [allGroupChannels, messageDispatch, currentPersona.id]);

  const handleCloseThread = useCallback(() => {
    setSelectedThreadId(null);
    setSelectedEnquiryId(null);
    setThreadPanelOpen(false);
    setThreadViewMode("side-panel");
  }, []);

  // Send reply in a thread
  const handleSendThreadReply = useCallback((
    threadId: string,
    groupId: string,
    content: string,
    attachment?: Attachment,
    audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number },
    mentionedPersonaIds?: string[],
  ) => {
    const msg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "user",
      sender: stripRoleSuffix(currentPersona.displayName),
      senderPersonaId: currentPersona.id,
      senderRole: currentRole,
      content,
      timestamp: new Date(),
      attachment,
      audioRecording,
      mentions: mentionedPersonaIds,
    };

    const event: MessageEvent = {
      type: "THREAD_MESSAGE_SENT",
      payload: {
        threadId,
        channelId: groupId,
        message: msg,
        timestamp: new Date(),
      },
    };

    void syncDomainEvent(event);
    showToast.success("Reply sent");
  }, [currentPersona.displayName, currentPersona.id, currentRole, showToast, syncDomainEvent]);

  // Tag enquiry to a thread post facto
  const handleTagEnquiry = useCallback((threadId: string, enquiryId: string) => {
    const event: MessageEvent = {
      type: "THREAD_TAGGED",
      payload: {
        threadId,
        enquiryId,
        timestamp: new Date(),
      },
    };
    
    messageDispatch(event);
    showToast.success(`Thread tagged with ${enquiryId}`);
  }, [messageDispatch, showToast]);

  const handleRequestTagInternalGroup = useCallback((enquiryId: string) => {
    setTagInternalGroupEnquiryId(enquiryId);
    setTagInternalGroupModalOpen(true);
  }, []);

  const handleCloseTagInternalGroupModal = useCallback(() => {
    setTagInternalGroupModalOpen(false);
    setTagInternalGroupEnquiryId(null);
  }, []);

  const handleConfirmTagInternalGroup = useCallback(async (groupId: string) => {
    if (!tagInternalGroupEnquiryId) return;

    const event = createGroupTaggedEvent(groupId, tagInternalGroupEnquiryId, currentPersona.id);
    await syncDomainEvent(event);

    setMailCreatedEnquiryIds((prev) => {
      const next = new Set(prev);
      next.delete(tagInternalGroupEnquiryId);
      return next;
    });

    setWhatsappCreatedEnquiryIds((prev) => {
      const next = new Set(prev);
      next.delete(tagInternalGroupEnquiryId);
      return next;
    });

    showToast.success("Internal group tagged");
    handleCloseTagInternalGroupModal();
  }, [currentPersona.id, handleCloseTagInternalGroupModal, showToast, syncDomainEvent, tagInternalGroupEnquiryId]);

  // Create new enquiry from thread
  const handleCreateEnquiryFromThread = useCallback(async (threadId: string, buyerId: string) => {
    devLog(`[handleCreateEnquiryFromThread] Creating enquiry from thread ${threadId} for buyer ${buyerId}`);
    
    // Only BDMs can create enquiries
    if (currentRole !== "BDM") {
      devError("[handleCreateEnquiryFromThread] Permission denied: Only BDMs can create enquiries");
      showToast.error("Only BDMs can create new enquiries");
      return;
    }

    // Use domain service to create enquiry from thread
    const result = createEnquiryFromThread({
      threadId,
      buyerId,
      existingEnquiries: enquiries,
      allGroupChannels,
      creatorPersonaId: currentPersona.id,
    });

    // Handle errors
    if (!result.success) {
      devError(`[handleCreateEnquiryFromThread] Creation failed: ${result.error}`);
      showToast.error(result.error || "Failed to create enquiry");
      return;
    }

    devLog(`[handleCreateEnquiryFromThread] Successfully created enquiry ${result.enquiryId} in group ${result.groupId}`);
    devLog(`[handleCreateEnquiryFromThread] Dispatching ${result.events?.length || 0} events`);

    // Dispatch all events (enquiry creation, thread tagging, team assignment)
    if (result.events) {
      for (const event of result.events) {
        devLog(`[handleCreateEnquiryFromThread] Dispatching ${event.type} event`);
        await syncDomainEvent(event);
      }
    }

    // Get navigation state updates
    const navState = getNavigationStateAfterCreation(
      result.enquiryId!,
      threadId,
      result.groupId!
    );

    devLog(`[handleCreateEnquiryFromThread] Applying navigation state updates`, navState);

    // Apply all navigation state updates
    setSelectedEnquiryId(navState.selectedEnquiryId);
    setSelectedThreadId(navState.selectedThreadId);
    setSelectedGroupId(navState.selectedGroupId);
    setSelectedBuyerDMId(navState.selectedBuyerDMId);
    setSelectedSellerDMId(navState.selectedSellerDMId);
    setThreadViewMode(navState.threadViewMode);
    setThreadPanelOpen(navState.threadPanelOpen);
    setCurrentChannel(navState.currentChannel);

    devLog(`[handleCreateEnquiryFromThread] Enquiry creation complete`);
    showToast.success(`Created enquiry ${result.enquiryId}`);
  }, [
    currentRole,
    enquiries,
    allGroupChannels,
    currentPersona.id,
    showToast,
    syncDomainEvent,
  ]);

  const handleBuyerMailSend = useCallback(async (params: { subject?: string; body: string }) => {
    if (currentRole !== "Buyer") {
      showToast.error("Mail sending is only available for buyers");
      return;
    }

    const buyerId = getBuyerIdFromPersona(currentPersona.id);
    if (!buyerId) {
      showToast.error("Buyer profile not found");
      return;
    }

    const result = createEnquiryFromBuyerMail({
      buyerPersonaId: currentPersona.id,
      buyerId,
      buyerName: currentPersona.displayName,
      subject: params.subject,
      body: params.body,
      existingEnquiries: enquiries,
      allGroupChannels,
    });

    if (!result.success) {
      showToast.error(result.error || "Failed to send buyer mail");
      return;
    }

    for (const event of result.events ?? []) {
      void syncDomainEvent(event);
    }

    if (result.enquiryId) {
      setMailCreatedEnquiryIds((prev) => {
        const next = new Set(prev);
        next.add(result.enquiryId!);
        return next;
      });
    }

    showToast.success(`Mail sent to Buyer Mail as ${result.enquiryId}`);
  }, [
    allGroupChannels,
    currentPersona.displayName,
    currentPersona.id,
    currentRole,
    enquiries,
    showToast,
    syncDomainEvent,
  ]);

  const handleBuyerWhatsAppSend = useCallback(async (params: { body: string }) => {
    if (currentRole !== "Buyer") {
      showToast.error("WhatsApp sending is only available for buyers");
      return;
    }

    const buyerId = getBuyerIdFromPersona(currentPersona.id);
    if (!buyerId) {
      showToast.error("Buyer profile not found");
      return;
    }

    const result = createEnquiryFromBuyerIntake({
      buyerPersonaId: currentPersona.id,
      buyerId,
      buyerName: currentPersona.displayName,
      body: params.body,
      existingEnquiries: enquiries,
      allGroupChannels,
      channelKind: "whatsapp",
    });

    if (!result.success) {
      showToast.error(result.error || "Failed to send WhatsApp message");
      return;
    }

    for (const event of result.events ?? []) {
      void syncDomainEvent(event);
    }

    if (result.enquiryId) {
      setWhatsappCreatedEnquiryIds((prev) => {
        const next = new Set(prev);
        next.add(result.enquiryId!);
        return next;
      });
    }

    showToast.success(`WhatsApp sent to Buyer WhatsApp as ${result.enquiryId}`);
  }, [
    allGroupChannels,
    currentPersona.displayName,
    currentPersona.id,
    currentRole,
    enquiries,
    showToast,
    syncDomainEvent,
  ]);

  // Resolve the currently selected thread object
  const selectedThread = useMemo(() => {
    if (!selectedThreadId) return null;
    for (const group of allGroupChannels) {
      const thread = (group.threads || []).find(t => t.id === selectedThreadId);
      if (thread) return { thread, group };
    }
    return null;
  }, [selectedThreadId, allGroupChannels]);

  // Get root message for currently selected thread
  const threadRootMessage = useMemo(() => {
    if (!selectedThread) return undefined;
    return selectedThread.group.messages.find(
      m => m.id === selectedThread.thread.rootMessageId
    );
  }, [selectedThread]);

  // Get enquiry data for thread (if tagged) — lightweight summary for ThreadPanel header
  const threadEnquiryData = useMemo(() => {
    if (!selectedThread?.thread.enquiryId) return undefined;
    const enq = enquiries.find(e => e.id === selectedThread.thread.enquiryId);
    if (!enq) return undefined;
    return {
      enquiryId: enq.id,
      buyerName: enq.buyerName,
      buyerPersonaId: enq.buyerPersonaId, // NEW: Include buyerPersonaId for hover card
      state: enq.state,
      estimatedValue: enq.estimatedValue,
      categories: enq.categories, // NEW: Include categories for display
    };
  }, [selectedThread, enquiries]);

  // Buyer info for thread header — uses centralized resolveBuyerFromPersonaId utility
  // Resolution waterfall: group.buyerId → group.buyerPersonaId → enquiry.buyerPersonaId → fallback
  const threadBuyerInfo = useMemo(() => {
    if (!selectedThread) return undefined;
    const group = selectedThread.group;

    // Determine buyerPersonaId from multiple sources
    let buyerPersonaId: string | undefined;

    // 1. From group's buyerId → persona mapping
    if (group.buyerId) {
      buyerPersonaId = getBuyerPersonaFromBuyerId(group.buyerId) ?? group.buyerPersonaId ?? undefined;
    }
    // 2. From group's direct buyerPersonaId
    if (!buyerPersonaId && group.buyerPersonaId) {
      buyerPersonaId = group.buyerPersonaId;
    }
    // 3. From the linked enquiry
    if (!buyerPersonaId && selectedThread.thread.enquiryId) {
      const enq = enquiries.find(e => e.id === selectedThread.thread.enquiryId);
      buyerPersonaId = enq?.buyerPersonaId;
    }

    // Use centralized enrichment when we have a persona ID
    if (buyerPersonaId) {
      const resolved = resolveBuyerFromPersonaId(buyerPersonaId, enquiries);
      if (resolved) {
        return {
          buyerName: resolved.companyName,
          buyerPersonaId: resolved.buyerPersonaId,
          groupName: group.name,
        };
      }
    }

    // Fallback to enquiry's raw buyerName
    if (threadEnquiryData?.buyerName) {
      return {
        buyerName: threadEnquiryData.buyerName,
        buyerPersonaId: undefined,
        groupName: group.name,
      };
    }

    return {
      buyerName: "Unknown Buyer",
      groupName: group.name,
    };
  }, [selectedThread, threadEnquiryData, enquiries]);

  // Full enquiry object for thread's enquiry (for StructuredPanel in Enquiry Threads tab)
  const threadEnquiry = useMemo<Enquiry | null>(() => {
    if (!selectedThread?.thread.enquiryId) return null;
    return enquiries.find(e => e.id === selectedThread.thread.enquiryId) || null;
  }, [selectedThread, enquiries]);

  // Structured data derived from the thread's enquiry (right panel in Enquiry Threads tab)
  const threadStructuredData = useMemo(() => {
    return generateStructuredData(threadEnquiry);
  }, [threadEnquiry]);

  const threadAISummary = useMemo(() => {
    return generateAISummary(threadEnquiry);
  }, [threadEnquiry]);

  const threadMessagesByChannel = useMemo(() => {
    if (!selectedThread) return undefined;

    const merged: Record<string, Message[]> = {};
    const enquiryId = selectedThread.thread.enquiryId;
    if (enquiryId && messageState.messages[enquiryId]) {
      Object.assign(merged, messageState.messages[enquiryId]);
    }

    const threadMessages: Message[] = [];
    if (selectedThread.thread.rootMessage) {
      threadMessages.push(selectedThread.thread.rootMessage);
    } else if (threadRootMessage) {
      threadMessages.push(threadRootMessage);
    }
    if (selectedThread.thread.messages.length > 0) {
      threadMessages.push(...selectedThread.thread.messages);
    }
    if (threadMessages.length > 0) {
      merged.thread = threadMessages;
    }

    return Object.keys(merged).length > 0 ? merged : undefined;
  }, [messageState.messages, selectedThread, threadRootMessage]);

  const getHeaderApprovalAction = useCallback((
    enquiryId?: string,
    state?: string,
    isInternalThread?: boolean
  ): HeaderApprovalAction | undefined => {
    if (!enquiryId || !state || !isInternalThread) return undefined;

    if (
      currentRole === "BDM" &&
      state !== "Pending Approval" &&
      state !== "Converted to Order"
    ) {
      const { primaryCM } = getApprovalTargets(enquiryState, enquiryId);
      const hasTaggedPO = enquiryHasPOTaggedAttachment(messageState, enquiryId);

      return {
        label: "Mark as Won",
        onClick: () => {
          void handleRequestOrderApproval(enquiryId);
        },
        disabled: !hasTaggedPO || !primaryCM,
        disabledReason: !hasTaggedPO
          ? "Add at least one PO-tagged file to enable this action."
          : !primaryCM
            ? "Assign a primary CM before requesting approval."
            : undefined,
      };
    }

    if (currentRole === "CM" && state === "Pending Approval") {
      const { cxMembers } = getApprovalTargets(enquiryState, enquiryId);

      return {
        label: "Confirm for Order",
        onClick: () => {
          void handleConfirmForOrder(enquiryId);
        },
        disabled: cxMembers.length === 0,
        disabledReason: cxMembers.length === 0
          ? "Add a CX member to this enquiry before confirming for order."
          : undefined,
      };
    }

    return undefined;
  }, [
    currentRole,
    enquiryState,
    handleConfirmForOrder,
    handleRequestOrderApproval,
    messageState,
  ]);

  const threadApprovalAction = useMemo(
    () => getHeaderApprovalAction(
      threadEnquiryData?.enquiryId,
      threadEnquiryData?.state,
      selectedThread?.group.type === "custom"
    ),
    [getHeaderApprovalAction, threadEnquiryData, selectedThread]
  );

  const handleQuickAction = useCallback((actionId: string) => {
    showToast.info(`Action: ${actionId}`);
  }, [showToast]);

  // Stable seller DM send handler for ConversationPanel
  const handleSellerDMSendMessage = useCallback(async (
    content: string,
    attachment?: any,
    audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number },
    mentions?: string[]
  ) => {
    if (!selectedSellerDM) return;
    await sendSellerDMMessage(
      selectedSellerDM.sellerId,
      selectedSellerDM.sellerName,
      selectedSellerDM.cmPersonaId,
      selectedSellerDM.cmName,
      content,
      currentUser,
      currentRole,
      attachment,
      audioRecording,
      mentions,
      undefined, // sourceEnquiryId
      currentPersona.id // senderPersonaId
    );
    // Immediately clear unread since the sender is already viewing this DM
    if (selectedSellerDMId) {
      messageDispatch(createSellerDMViewedEvent(selectedSellerDMId, currentPersona.id));
    }
    showToast.success("Message sent");
  }, [selectedSellerDM, selectedSellerDMId, sendSellerDMMessage, messageDispatch, currentUser, currentRole, currentPersona.id, showToast]);

  const handleCreateSellerChannelStub = useCallback(() => {
    showToast.info("Seller channel creation UI - Coming soon");
  }, [showToast]);

  const handleUpdateField = useCallback((section: string, field: string, value: any) => {
    devLog(`Update ${section}.${field} =`, value);
  }, []);

  // ResponsiveApp callbacks
  const handleResponsiveEnquirySelect = useCallback((id: string, channel: string) => {
    setCurrentChannel(channel);
    handleSelectEnquiry(id);
  }, [handleSelectEnquiry]);

  const handleResponsiveBuyerDMSelect = useCallback((dmId: string) => {
    setSelectedBuyerDMId(dmId);
    setSelectedSellerDMId(null);
    setSelectedEnquiryId(null);
    messageDispatch(createBuyerDMViewedEvent(dmId, currentPersona.id));
  }, [messageDispatch, currentPersona.id]);

  const handleResponsiveSellerDMSelect = useCallback((dmId: string) => {
    setSelectedSellerDMId(dmId);
    setSelectedBuyerDMId(null);
    setSelectedEnquiryId(null);
    messageDispatch(createSellerDMViewedEvent(dmId, currentPersona.id));
  }, [messageDispatch, currentPersona.id]);

  // Modal callbacks — single unified group modal
  const handleOpenCreateGroup = useCallback(() => {
    if (currentRole === "BDM" || currentRole === "CM") {
      setIsGroupModalOpen(true);
    }
  }, [currentRole]);

  const handleCloseGroupModal = useCallback(() => setIsGroupModalOpen(false), []);

  // Determine groupType based on role (BDM → buyer, CM → seller)
  const groupCreationType = currentRole === "CM" ? "seller" as const : "buyer" as const;

  const handleGroupCreationComplete = useCallback((result: any) => {
    if (groupCreationType === "buyer") {
      handleBuyerGroupCreation(result, currentPersona, messageDispatch, showToast, PERSONAS);
    } else {
      handleSellerGroupCreation(result, currentPersona, messageDispatch, showToast, PERSONAS);
    }
    setIsGroupModalOpen(false);
  }, [groupCreationType, currentPersona, messageDispatch, showToast]);

  // Memoized group messages for ConversationPanel (avoids IIFE in JSX)
  const groupMessages = useMemo(() => {
    if (!selectedGroup) return [];
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

  // If a thread is explicitly open in the main column, do not fall back to the
  // enquiry page while thread data is resolving. That fallback is what produced
  // the "two views of the same page" effect in the desktop screenshots.
  const isMainThreadView = threadViewMode === "main" && threadPanelOpen;

  const handleAddMembersToSelectedGroup = useCallback((memberIds: string[]) => {
    if (selectedGroupId) handleAddMembersToGroup(selectedGroupId, memberIds);
  }, [selectedGroupId, handleAddMembersToGroup]);

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden">
      <AppShellHeader
        currentPersona={currentPersona}
        onPersonaChange={handlePersonaChange}
        workspaceMode={workspaceMode}
        onWorkspaceModeChange={handleWorkspaceModeChange}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {workspaceMode === "pluto" ? (
          <PlutoWorkspace
            navigation={pluto}
            listItems={plutoFilteredItems}
            detailHeader={plutoDetailHeader}
            roleConfig={plutoRoleConfig}
            kpiCards={plutoKpiCards}
            searchQuery={plutoSearchQuery}
            onSearchChange={setPlutoSearchQuery}
            onSelectEnquiry={handleSelectPlutoEnquiry}
            onBackToList={handleBackToPlutoList}
            onCreatePlaceholder={handlePlutoCreatePlaceholder}
            canManageMembers={canManageMembers}
            canChangeState={canChangeState}
            canShareMessages={canShareInCurrentPolicy}
          />
        ) : !isInternal ? (
          currentRole === "Buyer" ? (
              <BuyerPortalView
                currentPersona={currentPersona}
                currentUser={currentUser}
                currentRole={currentRole}
                onPersonaChange={handlePersonaChange}
                showPersonaSwitcher={false}
                showToast={showToast}
                personaMap={personaMap}
                allGroupChannels={allGroupChannels}
                handleShareMessages={handleShareMessages}
                onCreateThreadFromMessage={handleCreateThreadFromMessage}
                onSendBuyerMail={handleBuyerMailSend}
                onSendBuyerWhatsApp={handleBuyerWhatsAppSend}
                setMobileComposer={setMobileComposer}
                handleMobileShareTrigger={handleMobileShareTrigger}
                mobileComposer={mobileComposer}
            />
          ) : (
            <SellerPortalView
              currentPersona={currentPersona}
              currentUser={currentUser}
              currentRole={currentRole}
              onPersonaChange={handlePersonaChange}
              showPersonaSwitcher={false}
              showToast={showToast}
              personaMap={personaMap}
              allGroupChannels={allGroupChannels}
              handleShareMessages={handleShareMessages}
              onCreateThreadFromMessage={handleCreateThreadFromMessage}
              setMobileComposer={setMobileComposer}
              handleMobileShareTrigger={handleMobileShareTrigger}
              mobileComposer={mobileComposer}
            />
          )
        ) : (
          <ResponsiveApp
            enquiryList={
              <EnquiryList
                enquiries={filteredEnquiries}
                selectedId={selectedEnquiryId}
                selectedChannel={currentChannel}
                onSelectChannel={handleChannelSelection}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                channels={enrichedChannels}
                currentPersonaId={currentPersona.id}
                buyerDMChannels={enrichedBuyerDMs}
                selectedBuyerDMId={selectedBuyerDMId}
                onSelectBuyerDM={handleSelectBuyerDM}
                sellerDMChannels={cmSellerDMChannels}
                selectedSellerDMId={selectedSellerDMId}
                onSelectSellerDM={handleSelectSellerDM}
                groupChannels={allGroupChannels}
                selectedGroupId={selectedGroupId}
                onSelectGroup={handleSelectGroup}
                messageDispatch={messageDispatch}
                currentPersona={currentPersona}
                currentUser={currentUser}
                onCreateEnquiry={currentRole === "BDM" ? () => handleOpenEnquiryCreation({ mode: "blank" }) : undefined}
                onCreateGroup={currentRole === "BDM" || currentRole === "CM" ? handleOpenCreateGroup : undefined}
                selectedThreadId={selectedThreadId}
                onSelectThread={handleSelectThread}
                mailCreatedEnquiryIds={mailCreatedEnquiryIds}
                whatsappCreatedEnquiryIds={whatsappCreatedEnquiryIds}
                onRequestTagInternalGroup={handleRequestTagInternalGroup}
              />
            }
            conversationPanel={
              selectedBuyerDMId && selectedBuyerDM ? (
                <div className="flex flex-col h-full min-h-0">
                  <div className="flex-shrink-0">
                    <BuyerDMHeader
                      buyerName={selectedBuyerDM.buyerName}
                      buyerPersonaId={selectedBuyerDM.buyerPersonaId}
                      bdmName={selectedBuyerDM.bdmName}
                      currentRole={currentRole}
                      buyerCompany="Birla Pivot"
                      onCreateEnquiry={currentRole === "BDM" ? () => handleOpenEnquiryCreation({ mode: "blank", buyerDMChannel: selectedBuyerDM }) : undefined}
                    />
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <ConversationPanel
                      messages={selectedBuyerDM.messages}
                      currentChannel="buyer-dm"
                      currentRole={currentRole}
                      enquiryId={selectedBuyerDMId}
                      enquiryMembers={[]}
                      personaMap={personaMap}
                      availableChannels={[]}
                      onSendMessage={handleSendMessage}
                      onQuickAction={handleQuickAction}
                      onShareMessages={handleShareMessages}
                      isBuyerDM={true}
                      buyerDMChannel={selectedBuyerDM}
                      onCreateEnquiry={currentRole === "BDM" ? handleCreateEnquiry : undefined}
                      availableEnquiries={enrichedEnquiries}
                      groupChannels={allGroupChannels}
                      currentPersonaId={currentPersona.id}
                      channelKind={selectedGroup.channelKind}
                      onCreateThreadFromMessage={handleCreateThreadFromMessage}
                      mobileComposerRenderer={setMobileComposer}
                      onMobileShareTrigger={handleMobileShareTrigger}
                      onOpenShareModal={handleOpenShareModal}
                    />
                  </div>
                </div>
              ) : selectedSellerDMId && selectedSellerDM ? (
                <div className="flex flex-col h-full min-h-0">
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
                      enquiryId={selectedSellerDMId}
                      enquiryMembers={[]}
                      personaMap={personaMap}
                      availableChannels={[]}
                      isSellerDM={true}
                      availableEnquiries={currentRole === "CM" ? enrichedEnquiries : undefined}
                      onSendMessage={handleSellerDMSendMessage}
                      onQuickAction={handleQuickAction}
                      onShareMessages={handleShareMessages}
                      groupChannels={allGroupChannels}
                      currentPersonaId={currentPersona.id}
                      onCreateThreadFromMessage={handleCreateThreadFromMessage}
                      mobileComposerRenderer={setMobileComposer}
                      onMobileShareTrigger={handleMobileShareTrigger}
                      onOpenShareModal={handleOpenShareModal}
                    />
                  </div>
                </div>
              ) : threadViewMode === "main" && threadPanelOpen && selectedThread ? (
                /* Enquiry Threads tab: thread IS the conversation in the middle column */
                <ThreadPanel
                  thread={selectedThread.thread}
                  rootMessage={threadRootMessage ?? selectedThread.thread.rootMessage}
                  groupName={selectedThread.group.name}
                  groupId={selectedThread.group.id}
                  currentPersonaId={currentPersona.id}
                  currentUser={currentUser}
                  currentRole={currentRole}
                  personaMap={personaMap}
                  onSendReply={handleSendThreadReply}
                  onClose={handleCloseThread}
                  onShareMessages={handleShareMessages}
                  groupChannels={allGroupChannels}
                  enquiryData={threadEnquiryData}
                  buyerInfo={threadBuyerInfo}
                  mode="main"
                  onOpenShareModal={handleOpenShareModal}
                  onTagEnquiry={handleTagEnquiry}
                  onCreateEnquiryFromThread={handleCreateEnquiryFromThread}
                  availableEnquiries={enrichedEnquiries.map(e => ({
                    id: e.id,
                    buyerName: e.buyerName,
                    state: e.state,
                  }))}
                  approvalAction={threadApprovalAction}
                  customInlineWidget={
                    showDeliveryWidget && 
                    selectedThread.thread.enquiryId && 
                    deliveryWidgetEnquiryId === selectedThread.thread.enquiryId ? (
                      <InlineDeliveryWidget
                        widgetId={`delivery-${deliveryWidgetEnquiryId}`}
                        onSubmit={handleDeliveryWidgetSubmit}
                        onAnimateOut={() => {
                          // Optional: callback when animation starts
                        }}
                      />
                    ) : null
                  }
                />
              ) : !isMainThreadView && selectedGroupId && selectedGroup ? (
                <div className="flex flex-col h-full min-h-0">
                  <div className="flex-shrink-0">
                    <GroupHeader
                      group={selectedGroup}
                      onAddMembers={handleAddMembersToSelectedGroup}
                    />
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <ConversationPanel
                      messages={groupMessages}
                      currentChannel="group"
                      currentRole={currentRole}
                      enquiryId={selectedGroupId}
                      enquiryMembers={[]}
                      personaMap={personaMap}
                      availableChannels={[]}
                      onSendMessage={handleSendMessage}
                      onQuickAction={handleQuickAction}
                      onShareMessages={handleShareMessages}
                      groupChannels={allGroupChannels}
                      currentPersonaId={currentPersona.id}
                      mobileComposerRenderer={setMobileComposer}
                      onMobileShareTrigger={handleMobileShareTrigger}
                      onOpenThread={handleOpenThread}
                      onCreateThreadFromMessage={handleCreateThreadFromMessage}
                      onOpenShareModal={handleOpenShareModal}
                    />
                  </div>
                </div>
              ) : isMainThreadView ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(82,73,210,0.08)" }}
                  >
                    <MessageSquare className="size-7 text-[#5249D2]" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-[#25282d] mb-1">
                    Opening thread
                  </h2>
                  <p className="text-[13px] text-[#575f68] max-w-[280px]">
                    Loading the thread view. The enquiry page stays hidden while the thread is active.
                  </p>
                </div>
              ) : (
                /* Empty state — nothing selected yet */
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(82,73,210,0.08)" }}>
                    <MessageSquare className="size-7 text-[#5249D2]" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-[#25282d] mb-1">
                    Select a conversation
                  </h2>
                  <p className="text-[13px] text-[#575f68] max-w-[280px]">
                    Choose an enquiry thread or group from the sidebar to view the conversation.
                  </p>
                </div>
              )
            }
            structuredPanel={
              /* Groups tab: thread in right panel as side-panel */
              threadViewMode === "side-panel" && threadPanelOpen && selectedThread ? (
                <ThreadPanel
                  thread={selectedThread.thread}
                  rootMessage={threadRootMessage ?? selectedThread.thread.rootMessage}
                  groupName={selectedThread.group.name}
                  groupId={selectedThread.group.id}
                  currentPersonaId={currentPersona.id}
                  currentUser={currentUser}
                  currentRole={currentRole}
                  personaMap={personaMap}
                  onSendReply={handleSendThreadReply}
                  onClose={handleCloseThread}
                  onShareMessages={handleShareMessages}
                  groupChannels={allGroupChannels}
                  enquiryData={threadEnquiryData}
                  mode="side-panel"
                  onOpenShareModal={handleOpenShareModal}
                  onTagEnquiry={handleTagEnquiry}
                  onCreateEnquiryFromThread={handleCreateEnquiryFromThread}
                  availableEnquiries={enrichedEnquiries.map(e => ({
                    id: e.id,
                    buyerName: e.buyerName,
                    state: e.state,
                  }))}
                  approvalAction={threadApprovalAction}
                />
              ) : /* Enquiry Threads tab: structured enquiry data in right panel */
              threadViewMode === "main" && threadPanelOpen && selectedThread ? (
                <StructuredPanel
                  summary={threadAISummary}
                  structuredData={threadStructuredData}
                  onUpdateField={handleUpdateField}
                  deliveryLocation={selectedThread.thread.enquiryId && deliveryWidgetEnquiryId === selectedThread.thread.enquiryId ? deliveryLocation : null}
                  messagesByChannel={threadMessagesByChannel}
                />
              ) : null
            }
            currentEnquiryTitle={mobileTitle}
            currentEnquirySubtitle={mobileSubtitle}
            currentBadge={mobileBadge}
            customHeader={unifiedMobileCustomHeader}
            composer={mobileComposer}
            enquiries={enquiriesWithMentionFlags}
            channels={enrichedChannels}
            sellerChannels={sellerChannels}
            buyerDMChannels={enrichedBuyerDMs}
            sellerDMChannels={enrichedSellerDMs}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentPersonaId={currentPersona.id}
            onEnquirySelect={handleResponsiveEnquirySelect}
            onBuyerDMSelect={handleResponsiveBuyerDMSelect}
            onSellerDMSelect={handleResponsiveSellerDMSelect}
            messageDispatch={messageDispatch}
            currentPersona={currentPersona}
            currentUser={currentUser}
            initialEnquiryId={selectedEnquiryId ?? undefined}
            initialChannel={currentChannel}
          />
        )}
      </div>

      {/* Profile Bottom Sheet (Mobile) */}
      <ProfileBottomSheet
        open={profileBottomSheetOpen}
        onOpenChange={setProfileBottomSheetOpen}
      >
        <ProfileBottomSheetContent personaId={profilePersonaId} viewerRole={currentRole} />
      </ProfileBottomSheet>

      {/* Thread Creation Modal */}
      <CreateThreadModal
        isOpen={showThreadModal}
        onClose={() => setShowThreadModal(false)}
        onConfirm={handleConfirmThreadCreation}
        messagePreview={threadCreationMessage?.content || ""}
        availableEnquiries={enrichedEnquiries.map(enq => ({
          id: enq.id,
          buyerName: enq.buyerName,
          state: enq.state,
        }))}
      />

      {/* Internal group tagging modal */}
      <TagInternalGroupModal
        isOpen={tagInternalGroupModalOpen}
        onClose={handleCloseTagInternalGroupModal}
        onConfirm={handleConfirmTagInternalGroup}
        enquiryId={tagInternalGroupEnquiryId || undefined}
        groups={eligibleInternalGroupsForTagging}
      />

      {/* Unified Group Creation Flow (role-controlled: BDM→buyer, CM→seller) */}
      <GroupCreationFlow
        isOpen={isGroupModalOpen}
        onClose={handleCloseGroupModal}
        onComplete={handleGroupCreationComplete}
        groupType={groupCreationType}
        personas={PERSONAS}
      />

      {/* Unified Share Modal */}
      <ShareModal
        draft={shareDraft.draft}
        allGroupChannels={allGroupChannels}
        enquiries={enquiries}
        currentRole={currentRole}
        currentPersonaId={currentPersona.id}
        personaMap={personaMap}
        onClose={shareDraft.close}
        onToggleTargetGroup={shareDraft.toggleTargetGroup}
        onSetRouteMode={shareDraft.setRouteMode}
        onSetTargetThread={shareDraft.setTargetThread}
        onSetConcatenatedContent={shareDraft.setConcatenatedContent}
        onSetSellerRfq={shareDraft.setSellerRfq}
        onResetConcatenatedContent={shareDraft.resetConcatenatedContent}
        onSubmit={handleShareModalSubmit}
        onTrack={shareTelemetry.track}
      />

      <CreateEnquiryModal
        isOpen={showEnquiryCreationModal}
        mode={enquiryCreationMode}
        messages={enquiryCreationMessages}
        buyerDMChannel={enquiryCreationBuyerDMChannel}
        onClose={handleCloseEnquiryCreationModal}
        onConfirm={handleCreateEnquiry}
      />

      <Toaster />
    </div>
  );
}

// Wrapped App with providers
export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
