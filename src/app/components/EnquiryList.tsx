import { memo, useState, useMemo, useEffect } from "react";
import {
  Search, 
  Plus, 
  MessageSquare, 
  MessageCircle, 
  AtSign, 
  Users, 
  Building2,
  Lock, 
  Globe, 
  ChevronDown, 
  ChevronRight, 
  Hash 
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { Input } from "@/app/components/ui/input";
import { useCurrentRole } from "@/infrastructure";
import { BuyerDMChannel } from "@/domain/message/buyer-dm.types";
import { SellerDMChannel } from "@/domain/message/seller-dm.types";
import { GroupChannel } from "@/domain/message/group.types";
import { EnquiryThreadCluster, EnquiryThreadRef } from "@/domain/message/thread.types";
import { Enquiry as DomainEnquiry } from "@/domain/enquiry/enquiry.types";
import { formatCategories } from "@/domain/category/category.types";
import { useBreakpoint, isMobile } from "@/hooks/useBreakpoint";
import { getPersonaById } from "@/domain/persona/persona.data";
import { getBuyerById } from "@/domain/buyer/buyer.mock-data";
import { getBuyerPersonaFromBuyerId } from "@/domain/buyer/buyer-persona-mapping";
import {
  getBuyerChannelLabel,
  getConnectGroupSectionLabel,
  getVisibleConnectGroupSections,
  groupBuyerChannels,
} from "@/domain/message/group-display.utils";
import { useEnquiryState } from "@/infrastructure";
import { selectAllEnquiries } from "@/domain/enquiry/enquiry.selectors";

// Re-export domain type for backwards compatibility
export type Enquiry = DomainEnquiry;

export interface Channel {
  id: string;
  label: string;
  unread: boolean;
  hasMentions?: boolean;
}

interface EnquiryListProps {
  enquiries: Enquiry[];
  selectedId: string | null;
  selectedChannel: string;
  onSelectEnquiry: (id: string) => void;
  onSelectChannel: (channelId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  channels: Channel[];
  currentPersonaId?: string;
  buyerDMChannels?: BuyerDMChannel[];
  selectedBuyerDMId?: string | null;
  onSelectBuyerDM?: (dmId: string) => void;
  sellerDMChannels?: SellerDMChannel[];
  selectedSellerDMId?: string | null;
  onSelectSellerDM?: (dmId: string) => void;
  groupChannels?: GroupChannel[]; // NEW: Group channels
  selectedGroupId?: string | null; // NEW: Selected group
  onSelectGroup?: (groupId: string) => void; // NEW: Handler for selecting group
  messageDispatch?: (event: any) => void;
  currentPersona?: { id: string; displayName: string };
  currentUser?: string;
  onCreateEnquiry?: () => void; // NEW: Handler for create enquiry
  onCreateGroup?: () => void; // NEW: Handler for create group (role-controlled: BDM→Buyer, CM→Seller)
  // Thread navigation (Enquiry Threads tab)
  selectedThreadId?: string | null;
  onSelectThread?: (threadId: string, groupId: string) => void;
  mailCreatedEnquiryIds?: Set<string>;
  whatsappCreatedEnquiryIds?: Set<string>;
  onRequestTagInternalGroup?: (enquiryId: string) => void;
}

type ViewType = "prism" | "connect";
type ConnectTab = "birla-pivot" | "buyer" | "seller";
type EnquiryThreadClusterWithGroups = EnquiryThreadCluster & { internalGroups: GroupChannel[] };

// Badge color mapping for different states
const getStateBadgeColor = (state: string): string => {
  const stateColors: Record<string, string> = {
    "Draft": "bg-[#eef4fd] text-[#08479e] border-[#0a58c6]",
    "Pending Response": "bg-[rgba(242,241,252,0.6)] text-[#4039ad] border-[#8e88e7]",
    "Converted to Order": "bg-[#e5f7df] text-[#2c541e] border-[#57a53a]",
  };
  
  return stateColors[state] || "bg-gray-100 text-gray-600 border-gray-300";
};

// Format currency in Indian format
const formatCurrency = (amount?: number): string => {
  if (!amount) return "—";
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Classify a GroupChannel as internal or external based on actual membership.
 * Internal = only internal members (all persona IDs are BDM/CM/CX patterns, no linked buyer/seller entity).
 * External = has at least one external member (buyer/seller persona, raw entity ID, or linked buyerId/sellerId).
 */
const isExternalGroup = (group: GroupChannel): boolean => {
  // Definitive: group is linked to a buyer or seller entity
  if (group.buyerId || group.sellerId) return true;
  
  // Check if any memberPersonaId is an external persona (buyer or seller)
  const hasExternalPersona = group.memberPersonaIds.some(id =>
    /^p_(buyer|seller)_/.test(id)
  );
  if (hasExternalPersona) return true;
  
  // Check if memberIds contain non-persona raw IDs (e.g., "s_1", "b_1")
  const hasRawExternalId = group.memberIds.some(id =>
    !id.startsWith("p_")
  );
  if (hasRawExternalId) return true;
  
  return false;
};

export const EnquiryList = memo(function EnquiryList({
  enquiries,
  selectedId,
  onSelectEnquiry,
  searchQuery,
  onSearchChange,
  buyerDMChannels,
  selectedBuyerDMId,
  onSelectBuyerDM,
  sellerDMChannels,
  selectedSellerDMId,
  onSelectSellerDM,
  groupChannels,
  selectedGroupId,
  onSelectGroup,
  onCreateEnquiry,
  onCreateGroup,
  selectedThreadId,
  onSelectThread,
  mailCreatedEnquiryIds,
  whatsappCreatedEnquiryIds,
  onRequestTagInternalGroup,
}: EnquiryListProps) {
  const [activeView, setActiveView] = useState<ViewType>("prism");
  const [activeConnectTab, setActiveConnectTab] = useState<ConnectTab>("birla-pivot");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  // Detect mobile to hide toasts
  const breakpoint = useBreakpoint();
  const isMobileView = isMobile(breakpoint);
  
  // Get current role
  const { currentRole } = useCurrentRole();
  const connectSections = useMemo(() => getVisibleConnectGroupSections(currentRole), [currentRole]);

  useEffect(() => {
    if (!connectSections.includes(activeConnectTab)) {
      setActiveConnectTab(connectSections[0] ?? "birla-pivot");
    }
  }, [activeConnectTab, connectSections]);
  
  // Get FULL (unfiltered) enquiry state for cluster metadata lookups
  // The `enquiries` prop is persona-filtered, so CMs/CX may not see enquiries
  // they aren't members of. The cluster builder needs the full list to resolve
  // buyerName and other metadata for threads visible across groups.
  const enquiryState = useEnquiryState();
  const allEnquiries = useMemo(() => selectAllEnquiries(enquiryState), [enquiryState]);
  
  // Apply search filter to enquiries
  const searchedEnquiries = useMemo(() => {
    if (!searchQuery.trim()) return enquiries;
    
    const query = searchQuery.toLowerCase();
    return enquiries.filter(enq => 
      enq.id.toLowerCase().includes(query) ||
      (enq.buyerName && enq.buyerName.toLowerCase().includes(query))
    );
  }, [enquiries, searchQuery]);
  
  const allGroupChannels = useMemo(() => {
    if (!groupChannels) return [];
    if (!searchQuery.trim()) return groupChannels;
    const query = searchQuery.toLowerCase();
    return groupChannels.filter(g => g.name.toLowerCase().includes(query));
  }, [groupChannels, searchQuery]);
  
  // Segregate groups into Birla Pivot / Buyer / Seller
  const { birlaPivotGroups, buyerGroups, sellerGroups } = useMemo(() => {
    const internal: GroupChannel[] = [];
    const buyers: GroupChannel[] = [];
    const sellers: GroupChannel[] = [];
    
    allGroupChannels.forEach(group => {
      if (group.type === "buyer") {
        buyers.push(group);
      } else if (group.type === "seller") {
        sellers.push(group);
      } else {
        internal.push(group);
      }
    });
    
    return { birlaPivotGroups: internal, buyerGroups: buyers, sellerGroups: sellers };
  }, [allGroupChannels]);

  const buyerChannelBundles = useMemo(() => groupBuyerChannels(buyerGroups), [buyerGroups]);
  
  // Total counts for the view chips
  const totalGroupCount = allGroupChannels.length;

  const connectTabs = useMemo(
    () => connectSections.map((section) => ({
      id: section,
      label: getConnectGroupSectionLabel(section),
    })),
    [connectSections]
  );

  const selectedConnectGroups = useMemo(() => {
    switch (activeConnectTab) {
      case "buyer":
        return [];
      case "seller":
        return sellerGroups;
      default:
        return birlaPivotGroups;
    }
  }, [activeConnectTab, birlaPivotGroups, buyerGroups, sellerGroups]);

  const [expandedBuyerBundles, setExpandedBuyerBundles] = useState<Set<string>>(new Set());

  const toggleBuyerBundle = (buyerId: string) => {
    setExpandedBuyerBundles((prev) => {
      const next = new Set(prev);
      if (next.has(buyerId)) {
        next.delete(buyerId);
      } else {
        next.add(buyerId);
      }
      return next;
    });
  };
  
  // Build Enquiry Thread Clusters from threads across all groups
  const enquiryThreadClusters = useMemo(() => {
    const clusterMap = new Map<string, EnquiryThreadClusterWithGroups>();
    const internalGroupsByEnquiry = new Map<string, GroupChannel[]>();
    
    // Scan all groups for threads tagged with enquiry IDs
    allGroupChannels.forEach(group => {
      const groupIsExternal = isExternalGroup(group);
      if (group.type === "custom" && group.enquiryId) {
        const existing = internalGroupsByEnquiry.get(group.enquiryId) || [];
        internalGroupsByEnquiry.set(group.enquiryId, [...existing, group]);
      }
      const threads = group.threads || [];
      
      threads.forEach(thread => {
        if (!thread.enquiryId) return; // Skip untagged threads
        
        let cluster = clusterMap.get(thread.enquiryId);
        if (!cluster) {
          // Find the matching enquiry for metadata
          const enquiry = allEnquiries.find(e => e.id === thread.enquiryId);
          
          // Resolve buyer name: enquiry.buyerName → enquiry.buyerPersonaId → group buyer → member scan → fallback
          let buyerName = enquiry?.buyerName;
          let buyerPersonaId = enquiry?.buyerPersonaId;
          if (!buyerName && enquiry?.buyerPersonaId) {
            const persona = getPersonaById(enquiry.buyerPersonaId);
            buyerName = persona?.displayName?.replace(/\s*\(.*?\)\s*$/, "");
          }
          if (!buyerName && group.buyerId) {
            const buyer = getBuyerById(group.buyerId);
            buyerName = buyer?.name;
            if (!buyerPersonaId) {
              buyerPersonaId = getBuyerPersonaFromBuyerId(group.buyerId) ?? undefined;
            }
          }
          if (!buyerName && group.buyerPersonaId) {
            const persona = getPersonaById(group.buyerPersonaId);
            buyerName = persona?.displayName?.replace(/\s*\(.*?\)\s*$/, "");
            if (!buyerPersonaId) buyerPersonaId = group.buyerPersonaId;
          }
          // Member traversal: scan group members for buyer personas
          if (!buyerName && group.memberPersonaIds) {
            for (const pid of group.memberPersonaIds) {
              if (pid.startsWith("p_buyer_")) {
                const persona = getPersonaById(pid);
                if (persona) {
                  buyerName = persona.displayName?.replace(/\s*\(.*?\)\s*$/, "");
                  if (!buyerPersonaId) buyerPersonaId = pid;
                  break;
                }
              }
            }
          }
          
          cluster = {
            enquiryId: thread.enquiryId,
            buyerName,
            buyerPersonaId,
            estimatedValue: enquiry?.estimatedValue,
            state: enquiry?.state,
            categories: enquiry?.categories,
            threads: [],
            internalGroups: [],
          };
          clusterMap.set(thread.enquiryId, cluster);
        }
        
        // Backfill: if cluster still has no buyerName, try resolving from this group
        if (!cluster.buyerName) {
          if (group.buyerId) {
            const buyer = getBuyerById(group.buyerId);
            if (buyer?.name) {
              cluster.buyerName = buyer.name;
              if (!cluster.buyerPersonaId) {
                cluster.buyerPersonaId = getBuyerPersonaFromBuyerId(group.buyerId) ?? undefined;
              }
            }
          }
          if (!cluster.buyerName && group.buyerPersonaId) {
            const persona = getPersonaById(group.buyerPersonaId);
            if (persona) {
              cluster.buyerName = persona.displayName?.replace(/\s*\(.*?\)\s*$/, "");
              if (!cluster.buyerPersonaId) cluster.buyerPersonaId = group.buyerPersonaId;
            }
          }
          if (!cluster.buyerName && group.memberPersonaIds) {
            for (const pid of group.memberPersonaIds) {
              if (pid.startsWith("p_buyer_")) {
                const persona = getPersonaById(pid);
                if (persona) {
                  cluster.buyerName = persona.displayName?.replace(/\s*\(.*?\)\s*$/, "");
                  if (!cluster.buyerPersonaId) cluster.buyerPersonaId = pid;
                  break;
                }
              }
            }
          }
        }
        
        cluster.threads.push({
          threadId: thread.id,
          groupId: group.id,
          groupName: group.name,
          groupType: groupIsExternal ? "external" : "internal",
          lastActivity: thread.lastReplyAt,
          unread: thread.unread,
          unreadCount: thread.unreadCount,
          replyCount: thread.replyCount,
          title: thread.title,
        });
      });
    });

    internalGroupsByEnquiry.forEach((groups, enquiryId) => {
      const cluster = clusterMap.get(enquiryId);
      if (cluster) {
        cluster.internalGroups = [...groups];
      }
    });
    
    // Sort clusters by most recent activity
    const clusters = Array.from(clusterMap.values());
    clusters.sort((a, b) => {
      const aLatest = Math.max(...a.threads.map(t => t.lastActivity?.getTime() || 0));
      const bLatest = Math.max(...b.threads.map(t => t.lastActivity?.getTime() || 0));
      return bLatest - aLatest;
    });
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return clusters.filter(c =>
        c.enquiryId.toLowerCase().includes(query) ||
        (c.buyerName && c.buyerName.toLowerCase().includes(query)) ||
        c.threads.some(t => t.groupName.toLowerCase().includes(query) || (t.title && t.title.toLowerCase().includes(query)))
      );
    }
    
    return clusters;
  }, [allGroupChannels, allEnquiries, searchQuery]);
  
  // Track expanded enquiry clusters
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  
  const toggleCluster = (enquiryId: string) => {
    setExpandedClusters(prev => {
      const next = new Set(prev);
      if (next.has(enquiryId)) {
        next.delete(enquiryId);
      } else {
        next.add(enquiryId);
      }
      return next;
    });
  };
  
  // Handle clicking an enquiry cluster header — expand + auto-select first thread
  const handleClusterClick = (cluster: EnquiryThreadCluster) => {
    const wasExpanded = expandedClusters.has(cluster.enquiryId);
    toggleCluster(cluster.enquiryId);
    
    // Auto-select first thread if expanding and has threads
    if (!wasExpanded && cluster.threads.length > 0 && onSelectThread) {
      const first = cluster.threads[0];
      onSelectThread(first.threadId, first.groupId);
    }
  };
  
  const handleSearchIconClick = () => {
    setIsSearchExpanded(true);
  };

  // Render a single Buyer DM row
  const renderBuyerDM = (dmChannel: BuyerDMChannel) => (
    <button
      key={dmChannel.id}
      onClick={() => onSelectBuyerDM?.(dmChannel.id)}
      className={cn(
        "w-full text-left px-6 py-3 transition-colors flex items-center gap-2.5",
        selectedBuyerDMId === dmChannel.id
          ? "bg-[rgba(242,241,252,0.6)]"
          : "hover:bg-gray-50"
      )}
    >
      <MessageCircle
        className={cn(
          "size-5 flex-shrink-0",
          selectedBuyerDMId === dmChannel.id
            ? "text-[#4039ad]"
            : "text-[#25282d]"
        )}
      />
      <span className={cn(
        "flex-1 text-[14px] font-medium leading-[20px] truncate",
        selectedBuyerDMId === dmChannel.id
          ? "text-[#4039ad]"
          : "text-[#25282d]"
      )}>
        {dmChannel.buyerName}
      </span>
      {dmChannel.hasMentions && (
        <div className="size-5 rounded bg-amber-500 flex items-center justify-center flex-shrink-0">
          <AtSign className="size-3 text-white" strokeWidth={2.5} />
        </div>
      )}
      {(dmChannel.unreadCount ?? 0) > 0 && selectedBuyerDMId !== dmChannel.id && (
        <div className="min-w-[20px] h-5 px-1.5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-white">{dmChannel.unreadCount}</span>
        </div>
      )}
      {dmChannel.unread && selectedBuyerDMId !== dmChannel.id && !((dmChannel.unreadCount ?? 0) > 0) && (
        <div className="size-2 rounded-full bg-blue-500 flex-shrink-0 ml-1" />
      )}
    </button>
  );

  // Render a single Seller DM row
  const renderSellerDM = (dmChannel: SellerDMChannel) => (
    <button
      key={dmChannel.id}
      onClick={() => onSelectSellerDM?.(dmChannel.id)}
      className={cn(
        "w-full text-left px-6 py-3 transition-colors flex items-center gap-2.5",
        selectedSellerDMId === dmChannel.id
          ? "bg-[rgba(242,241,252,0.6)]"
          : "hover:bg-gray-50"
      )}
    >
      <MessageCircle
        className={cn(
          "size-5 flex-shrink-0",
          selectedSellerDMId === dmChannel.id
            ? "text-[#4039ad]"
            : "text-[#25282d]"
        )}
      />
      <span className={cn(
        "flex-1 text-[14px] font-medium leading-[20px] truncate",
        selectedSellerDMId === dmChannel.id
          ? "text-[#4039ad]"
          : "text-[#25282d]"
      )}>
        {dmChannel.sellerName}
      </span>
      {dmChannel.hasMentions && (
        <div className="size-5 rounded bg-amber-500 flex items-center justify-center flex-shrink-0">
          <AtSign className="size-3 text-white" strokeWidth={2.5} />
        </div>
      )}
      {(dmChannel.unreadCount ?? 0) > 0 && selectedSellerDMId !== dmChannel.id && (
        <div className="min-w-[20px] h-5 px-1.5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-white">{dmChannel.unreadCount}</span>
        </div>
      )}
      {dmChannel.unread && selectedSellerDMId !== dmChannel.id && !((dmChannel.unreadCount ?? 0) > 0) && (
        <div className="size-2 rounded-full bg-blue-500 flex-shrink-0 ml-1" />
      )}
    </button>
  );

  // Render a single Group Channel row
  const renderGroupChannel = (groupChannel: GroupChannel) => (
    <button
      key={groupChannel.id}
      onClick={() => onSelectGroup?.(groupChannel.id)}
      className={cn(
        "w-full text-left px-6 py-3 transition-colors flex items-center gap-2.5",
        selectedGroupId === groupChannel.id
          ? "bg-[rgba(242,241,252,0.6)]"
          : "hover:bg-gray-50"
      )}
    >
      {groupChannel.type === "custom" ? (
        <Building2
          className={cn(
            "size-5 flex-shrink-0",
            selectedGroupId === groupChannel.id
              ? "text-[#4039ad]"
              : "text-[#25282d]"
          )}
        />
      ) : (
        <Users
          className={cn(
            "size-5 flex-shrink-0",
            selectedGroupId === groupChannel.id
              ? "text-[#4039ad]"
              : "text-[#25282d]"
          )}
        />
      )}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className={cn(
          "text-[14px] font-medium leading-[20px] truncate",
          selectedGroupId === groupChannel.id
            ? "text-[#4039ad]"
            : "text-[#25282d]"
        )}>
          {groupChannel.name}
        </span>
      </div>
      {groupChannel.hasMentions && (
        <div className="size-5 rounded bg-amber-500 flex items-center justify-center flex-shrink-0">
          <AtSign className="size-3 text-white" strokeWidth={2.5} />
        </div>
      )}
      {(groupChannel.unreadCount ?? 0) > 0 && selectedGroupId !== groupChannel.id && (
        <div className="min-w-[20px] h-5 px-1.5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-white">{groupChannel.unreadCount}</span>
        </div>
      )}
      {groupChannel.unread && selectedGroupId !== groupChannel.id && !((groupChannel.unreadCount ?? 0) > 0) && (
        <div className="size-2 rounded-full bg-blue-500 flex-shrink-0 ml-1" />
      )}
    </button>
  );

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white border-r border-[#dfe2e5]">
      {/* Header */}
      <div className="border-b border-[#dfe2e5] flex-shrink-0 px-[16px] pt-[16px] pb-[0px]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-end gap-6">
            <button
              onClick={() => setActiveView("prism")}
              className={cn(
                "pb-3 text-[15px] font-medium transition-colors border-b-2 leading-none",
                activeView === "prism"
                  ? "text-[#5249D2] border-[#5249D2]"
                  : "text-[#33373d] border-transparent hover:text-[#5249D2]"
              )}
            >
              Prism
            </button>
            <button
              onClick={() => setActiveView("connect")}
              className={cn(
                "pb-3 text-[15px] font-medium transition-colors border-b-2 leading-none",
                activeView === "connect"
                  ? "text-[#5249D2] border-[#5249D2]"
                  : "text-[#33373d] border-transparent hover:text-[#5249D2]"
              )}
            >
              Connect
            </button>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {!isSearchExpanded && (
              <button 
                onClick={handleSearchIconClick}
                className="p-0 hover:opacity-70 transition-opacity"
              >
                <Search className="size-6 text-[#4039ad]" />
              </button>
            )}
            
            {/* Create button is tab-aware */}
            {activeView === "prism" && onCreateEnquiry && (
              <button 
                onClick={onCreateEnquiry}
                className="p-0 hover:opacity-70 transition-opacity"
                title="Create New Enquiry"
              >
                <Plus className="size-6 text-[#4039ad]" />
              </button>
            )}
            {activeView === "connect" && onCreateGroup && (
              <button 
                onClick={onCreateGroup}
                className="p-0 hover:opacity-70 transition-opacity"
                title="Create Group"
              >
                <Plus className="size-6 text-[#4039ad]" />
              </button>
            )}
          </div>
        </div>
        
        {/* Search Input - Expands below when clicked */}
        {isSearchExpanded && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder={activeView === "prism" ? "Search enquiries..." : "Search groups..."}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onBlur={() => {
                if (!searchQuery) {
                  setIsSearchExpanded(false);
                }
              }}
              autoFocus
              className="pl-9 h-10"
            />
          </div>
        )}
      </div>
      
      {/* Connect Sub-tabs */}
      <div className="px-4 pt-2 border-b border-[#dfe2e5] flex-shrink-0">
        {activeView === "connect" && connectTabs.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {connectTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveConnectTab(tab.id as ConnectTab)}
                className={cn(
                  "h-8 px-3 py-1 rounded-lg text-[13px] font-medium transition-all border whitespace-nowrap",
                  activeConnectTab === tab.id
                    ? "bg-[rgba(82,73,210,0.08)] text-[#5249D2] border-[#5249D2]"
                    : "bg-white text-[#575f68] border-[#dfe2e5] hover:bg-[#f5f6f8]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area - Full height for whichever view is active */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* ===== Prism View (Cluster-based) ===== */}
        {activeView === "prism" && (
          <div className="py-2">
            {enquiryThreadClusters.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <MessageSquare className="size-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {searchQuery.trim() ? "No enquiry threads match your search" : "No enquiry threads yet"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Reply to messages in groups to create threads, then tag them with enquiry IDs.
                </p>
              </div>
            ) : (
              enquiryThreadClusters.map((cluster) => {
                const isExpanded = expandedClusters.has(cluster.enquiryId);
                const totalUnread = cluster.threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);
                const hasAnyUnread = cluster.threads.some(t => t.unread);
                const expandedRows = [
                  ...cluster.threads.map((threadRef) => ({
                    kind: "thread" as const,
                    key: threadRef.threadId,
                    threadRef,
                  })),
                  ...cluster.internalGroups.map((groupChannel) => ({
                    kind: "group" as const,
                    key: groupChannel.id,
                    groupChannel,
                  })),
                  ...(!cluster.internalGroups.length &&
                  (mailCreatedEnquiryIds?.has(cluster.enquiryId) ||
                    whatsappCreatedEnquiryIds?.has(cluster.enquiryId)) &&
                  onRequestTagInternalGroup
                    ? [
                        {
                          kind: "prompt" as const,
                          key: `prompt-${cluster.enquiryId}`,
                        },
                      ]
                    : []),
                ];
                
              return (
                <div key={cluster.enquiryId} className="border-b border-[rgba(14,30,46,0.1)]">
                    {/* Cluster header (enquiry) */}
                    <button
                      onClick={() => handleClusterClick(cluster)}
                      className={cn(
                        "w-full text-left px-5 py-3.5 transition-colors",
                        isExpanded
                          ? "bg-[rgba(242,241,252,0.4)]"
                          : "hover:bg-gray-50"
                      )}
                    >
                      <div className="flex flex-col gap-1.5">
                        {/* Row 1: Enquiry ID with dropdown */}
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="size-4 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="size-4 text-gray-400 flex-shrink-0" />
                          )}
                          <Hash className="size-3.5 text-[#5249D2]" />
                          <span className="text-[12px] font-light text-[#25282d] leading-[20px]">
                            {cluster.enquiryId}
                          </span>
                        </div>
                        
                        {/* Row 2: Buyer Name */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn(
                            "text-[14px] font-semibold leading-[20px] truncate",
                            isExpanded ? "text-[#4039ad]" : "text-[#33373d]"
                          )}>
                            {cluster.buyerName || "Unknown Buyer"}
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* State Badge */}
                            {cluster.state && (
                              <div className={cn(
                                "text-[11px] px-2 py-0.5 rounded border-[0.5px] font-medium",
                                getStateBadgeColor(cluster.state)
                              )}>
                                <span className="text-[12px] font-normal leading-[20px]">
                                  {cluster.state}
                                </span>
                              </div>
                            )}
                            {totalUnread > 0 && (
                              <div className="min-w-[20px] h-5 px-1.5 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-xs font-semibold text-white">{totalUnread}</span>
                              </div>
                            )}
                            {hasAnyUnread && totalUnread === 0 && (
                              <div className="size-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                        </div>
                        
                        {/* Row 3: Deal Value & Category */}
                        <div className="flex items-center gap-3">
                          <span className="text-[13px] font-medium text-[#25282d] leading-[20px]">
                            {formatCurrency(cluster.estimatedValue)}
                          </span>
                          {cluster.categories && cluster.categories.length > 0 && (
                            <>
                              <span className="text-gray-400">&middot;</span>
                              <span className="text-[13px] font-medium text-gray-600 leading-[20px]">
                                {formatCategories(cluster.categories)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="bg-[rgba(242,241,252,0.15)]">
                        {expandedRows.map((row) => {
                          if (row.kind === "thread") {
                            const threadRef = row.threadRef;
                            const isThreadSelected = selectedThreadId === threadRef.threadId;

                            return (
                              <button
                                key={row.key}
                                onClick={() => onSelectThread?.(threadRef.threadId, threadRef.groupId)}
                                className={cn(
                                  "w-full text-left pl-11 pr-5 py-2 transition-colors flex items-center gap-2",
                                  isThreadSelected
                                    ? "bg-[rgba(82,73,210,0.08)]"
                                    : "hover:bg-[rgba(82,73,210,0.04)]"
                                )}
                              >
                                {threadRef.groupType === "internal" ? (
                                  <Lock
                                    className={cn(
                                      "size-3.5 flex-shrink-0",
                                      isThreadSelected ? "text-[#5249D2]" : "text-gray-400"
                                    )}
                                  />
                                ) : (
                                  <Globe
                                    className={cn(
                                      "size-3.5 flex-shrink-0",
                                      isThreadSelected ? "text-[#5249D2]" : "text-gray-400"
                                    )}
                                  />
                                )}
                                <span
                                  className={cn(
                                    "text-[13px] font-medium truncate flex-1 min-w-0",
                                    isThreadSelected ? "text-[#4039ad]" : "text-[#33373d]"
                                  )}
                                >
                                  {threadRef.groupName}
                                </span>
                                {(threadRef.unreadCount || 0) > 0 && !isThreadSelected && (
                                  <div className="min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[10px] font-semibold text-white">
                                      {threadRef.unreadCount}
                                    </span>
                                  </div>
                                )}
                                {threadRef.unread &&
                                  !isThreadSelected &&
                                  !(threadRef.unreadCount || 0) && (
                                    <div className="size-2 rounded-full bg-blue-500 flex-shrink-0" />
                                  )}
                              </button>
                            );
                          }

                          if (row.kind === "group") {
                            const groupChannel = row.groupChannel;
                            const isSelected = selectedGroupId === groupChannel.id;
                            return (
                              <button
                                key={row.key}
                                onClick={() => onSelectGroup?.(groupChannel.id)}
                                className={cn(
                                  "w-full text-left pl-11 pr-5 py-2 transition-colors flex items-center gap-2",
                                  isSelected
                                    ? "bg-[rgba(82,73,210,0.08)]"
                                    : "hover:bg-[rgba(82,73,210,0.04)]"
                                )}
                              >
                                <Lock
                                  className={cn(
                                    "size-3.5 flex-shrink-0",
                                    isSelected ? "text-[#5249D2]" : "text-gray-400"
                                  )}
                                />
                                <span
                                  className={cn(
                                    "text-[13px] font-medium truncate flex-1 min-w-0",
                                    isSelected ? "text-[#4039ad]" : "text-[#33373d]"
                                  )}
                                >
                                  {groupChannel.name}
                                </span>
                              </button>
                            );
                          }

                          return (
                            <button
                              key={row.key}
                              type="button"
                              onClick={() => onRequestTagInternalGroup?.(cluster.enquiryId)}
                              className={cn(
                                "w-[calc(100%-2rem)] mx-4 my-2 rounded-xl border border-dashed border-[#5249D2]/40 bg-[rgba(82,73,210,0.04)] px-4 py-3 text-left transition-colors flex items-center gap-2",
                                "hover:bg-[rgba(82,73,210,0.07)] hover:border-[#5249D2]/55"
                              )}
                            >
                              <Lock className="size-3.5 flex-shrink-0 text-[#5249D2]" />
                              <span className="text-[13px] font-medium truncate flex-1 min-w-0 text-[#4039ad]">
                                Tag internal group
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ===== Connect View ===== */}
        {activeView === "connect" && (
          <div className="py-2">
            {totalGroupCount === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-500">
                  {searchQuery.trim() ? "No groups match your search" : "No groups found"}
                </p>
              </div>
            ) : (
              <>
                {/* Create button is tab-aware */}
                {onCreateGroup && (
                  <>
                    <button
                      onClick={onCreateGroup}
                      className="w-full text-left px-6 py-4 transition-colors flex items-center gap-3 hover:bg-gray-50"
                    >
                      <Users className="size-5 text-[#4039ad]" />
                      <span className="text-[15px] font-medium leading-[20px] text-[#4039ad]">
                        Create Group
                      </span>
                    </button>
                    {/* Divider after Create Group button */}
                    <div className="border-t border-[rgba(14,30,46,0.1)] mx-4 my-2" />
                  </>
                )}

                {/* Selected Connect section */}
                {activeConnectTab === "buyer" ? (
                  buyerChannelBundles.length > 0 && (
                    <div>
                      <div className="px-6 pt-4 pb-3 flex items-center gap-2">
                        <Globe className="size-3.5 text-[#575f68]" />
                        <h3 className="text-[12px] font-semibold text-[#575f68] leading-[16px] uppercase tracking-wider">
                          {getConnectGroupSectionLabel(activeConnectTab)}
                        </h3>
                        <span className="text-[12px] font-light text-[#575f68] leading-[16px]">
                          {buyerChannelBundles.length}
                        </span>
                      </div>

                      {buyerChannelBundles.map((bundle) => {
                        const isExpanded = expandedBuyerBundles.has(bundle.buyerId);
                        const totalUnread = bundle.channels.reduce((sum, channel) => sum + (channel.unreadCount ?? 0), 0);
                        const hasUnread = bundle.channels.some((channel) => channel.unread);

                        return (
                          <div key={bundle.buyerId} className="border-b border-[rgba(14,30,46,0.1)]">
                            <button
                              onClick={() => {
                                const wasExpanded = expandedBuyerBundles.has(bundle.buyerId);
                                toggleBuyerBundle(bundle.buyerId);
                                if (!wasExpanded && bundle.channels.length > 0 && onSelectGroup) {
                                  onSelectGroup(bundle.channels[0].id);
                                }
                              }}
                              className={cn(
                                "w-full text-left px-5 py-3.5 transition-colors",
                                isExpanded
                                  ? "bg-[rgba(242,241,252,0.4)]"
                                  : "hover:bg-gray-50"
                              )}
                            >
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  {isExpanded ? (
                                    <ChevronDown className="size-4 text-gray-400 flex-shrink-0" />
                                  ) : (
                                    <ChevronRight className="size-4 text-gray-400 flex-shrink-0" />
                                  )}
                                  <Users className="size-3.5 text-[#5249D2]" />
                                  <span className="text-[12px] font-light text-[#25282d] leading-[20px]">
                                    {bundle.buyerName}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                  <span className={cn(
                                    "text-[14px] font-semibold leading-[20px] truncate",
                                    isExpanded ? "text-[#4039ad]" : "text-[#33373d]"
                                  )}>
                                    Buyer
                                  </span>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {totalUnread > 0 && (
                                      <div className="min-w-[20px] h-5 px-1.5 rounded-full bg-blue-500 flex items-center justify-center">
                                        <span className="text-xs font-semibold text-white">{totalUnread}</span>
                                      </div>
                                    )}
                                    {hasUnread && totalUnread === 0 && (
                                      <div className="size-2 rounded-full bg-blue-500" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="bg-[rgba(242,241,252,0.15)]">
                                {bundle.channels.map((groupChannel) => {
                                  const isSelected = selectedGroupId === groupChannel.id;
                                  return (
                                    <button
                                      key={groupChannel.id}
                                      onClick={() => onSelectGroup?.(groupChannel.id)}
                                      className={cn(
                                        "w-full text-left pl-11 pr-5 py-2 transition-colors flex items-center gap-2",
                                        isSelected
                                          ? "bg-[rgba(82,73,210,0.08)]"
                                          : "hover:bg-[rgba(82,73,210,0.04)]"
                                      )}
                                    >
                                      <Globe className={cn(
                                        "size-3.5 flex-shrink-0",
                                        isSelected ? "text-[#5249D2]" : "text-gray-400"
                                      )} />
                                      <span className={cn(
                                        "text-[13px] font-medium truncate flex-1 min-w-0",
                                        isSelected ? "text-[#4039ad]" : "text-[#33373d]"
                                      )}>
                                        {getBuyerChannelLabel(groupChannel)}
                                      </span>
                                      {(groupChannel.unreadCount ?? 0) > 0 && !isSelected && (
                                        <div className="min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                          <span className="text-[10px] font-semibold text-white">{groupChannel.unreadCount}</span>
                                        </div>
                                      )}
                                      {groupChannel.unread && !isSelected && !(groupChannel.unreadCount || 0) && (
                                        <div className="size-2 rounded-full bg-blue-500 flex-shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  selectedConnectGroups.length > 0 && (
                    <div>
                      <div className="px-6 pt-4 pb-3 flex items-center gap-2">
                        {activeConnectTab === "birla-pivot" ? (
                          <Lock className="size-3.5 text-[#575f68]" />
                        ) : (
                          <Globe className="size-3.5 text-[#575f68]" />
                        )}
                        <h3 className="text-[12px] font-semibold text-[#575f68] leading-[16px] uppercase tracking-wider">
                          {getConnectGroupSectionLabel(activeConnectTab)}
                        </h3>
                        <span className="text-[12px] font-light text-[#575f68] leading-[16px]">
                          {selectedConnectGroups.length}
                        </span>
                      </div>
                      {selectedConnectGroups.map(renderGroupChannel)}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
