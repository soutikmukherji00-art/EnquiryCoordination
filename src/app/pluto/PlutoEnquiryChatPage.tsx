/**
 * PlutoEnquiryChatPage
 *
 * Renders a single-enquiry Prism-style chat view inside Pluto.
 * Reuses ThreadPanel + StructuredPanel from Prism but scoped to one enquiry.
 *
 * Key differences from full Prism:
 *  - No enquiry list sidebar
 *  - Shows exactly one enquiry's thread + structured data
 *  - "Back" button returns to the Pluto enquiry list
 */
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, AtSign, ChevronDown, ChevronUp, MessageSquare, MoreHorizontal } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { ThreadPanel } from "@/app/components/ThreadPanel";
import { StructuredPanel } from "@/app/components/StructuredPanel";
import { cn } from "@/app/components/ui/utils";
import { PersonaHoverTrigger } from "@/app/components/PersonaHoverTrigger";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/app/components/ui/resizable";
import { useBreakpoint, isMobile } from "@/hooks/useBreakpoint";
import { formatCategories } from "@/domain/category/category.types";
import type { Thread } from "@/domain/message/thread.types";
import type { Message, Attachment } from "@/domain/message/message.types";
import type { Persona } from "@/domain/enquiry/enquiry.types";
import type { EnquiryRecord } from "@/domain/enquiry/enquiry.record";
import type { Category } from "@/domain/category/category.types";

interface PlutoEnquiryChatPageProps {
  /** The enquiry being viewed */
  enquiryId: string;

  /** Resolved thread for this enquiry */
  thread: Thread | null;
  selectedThreadId?: string | null;
  rootMessage?: Message;
  groupName: string;
  groupId: string;
  enquiryThreads?: Array<{
    threadId: string;
    groupId: string;
    groupName: string;
    unreadCount: number;
    mentionCount: number;
  }>;
  onSelectEnquiryThread?: (threadId: string, groupId: string) => void;

  /** Current user context */
  currentPersonaId: string;
  currentUser: string;
  currentRole: string;
  personaMap: Map<string, Persona>;

  /** Thread handlers (delegated to App.tsx) */
  onSendReply: (
    threadId: string,
    groupId: string,
    content: string,
    attachment?: Attachment,
    audioRecording?: {
      audioUrl: string;
      audioBlob: Blob;
      transcription: string;
      duration: number;
    },
    mentionedPersonaIds?: string[],
  ) => void;
  onShareMessages?: (
    messageIds: string[],
    toChannel: string,
    editedContents?: Record<string, string>,
  ) => void;
  groupChannels?: any[];
  onOpenShareModal?: (
    sourceContext: any,
    messageIds: string[],
    sourceMessages: Message[],
  ) => void;
  onTagEnquiry?: (threadId: string, enquiryId: string) => void;
  onCreateEnquiryFromThread?: (
    threadId: string,
    buyerId: string,
  ) => void;
  availableEnquiries?: Array<{
    id: string;
    buyerName?: string;
    state?: string;
  }>;
  approvalAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    disabledReason?: string;
  };

  /** Enquiry data for thread header */
  enquiryData?: {
    enquiryId: string;
    buyerName?: string;
    buyerPersonaId?: string;
    state?: string;
    estimatedValue?: number;
    categories?: Category[];
  };
  buyerInfo?: {
    buyerName: string;
    buyerPersonaId?: string;
    groupName?: string;
  };

  /** Structured panel data */
  record: EnquiryRecord | undefined;
  summary: string;
  onDispatchEvent: (event: any) => void;
  messagesByChannel?: Record<string, Message[]> | null;
  validationErrors?: string[];
  cmOptions?: Array<{ id: string; name: string }>;
  showAISummary?: boolean;

  /** Navigation */
  onBack: () => void;
}

export function PlutoEnquiryChatPage({
  enquiryId,
  thread,
  selectedThreadId,
  rootMessage,
  groupName,
  groupId,
  enquiryThreads,
  onSelectEnquiryThread,
  currentPersonaId,
  currentUser,
  currentRole,
  personaMap,
  onSendReply,
  onShareMessages,
  groupChannels,
  onOpenShareModal,
  onTagEnquiry,
  onCreateEnquiryFromThread,
  availableEnquiries,
  approvalAction,
  enquiryData,
  buyerInfo,
  record,
  summary,
  onDispatchEvent,
  messagesByChannel,
  validationErrors,
  cmOptions,
  showAISummary,
  onBack,
}: PlutoEnquiryChatPageProps) {
  const breakpoint = useBreakpoint();
  const isMobileView = isMobile(breakpoint);
  const [mobileViewTab, setMobileViewTab] = useState<"chat" | "details">("chat");
  const [mobileHeaderExpanded, setMobileHeaderExpanded] = useState(false);

  useEffect(() => {
    setMobileHeaderExpanded(false);
  }, [enquiryId]);

  const channelTabs = useMemo(() => {
    if (enquiryThreads && enquiryThreads.length > 0) {
      return enquiryThreads.map((item, index) => ({
        id: item.threadId,
        label: item.groupName || `Group ${index + 1}`,
        groupId: item.groupId,
        unreadCount: item.unreadCount,
        mentionCount: item.mentionCount,
      }));
    }
    return [{
      id: thread?.id ?? "thread",
      label: groupName || "Thread",
      groupId,
      unreadCount: thread?.unreadCount ?? 0,
      mentionCount: 0,
    }];
  }, [enquiryThreads, groupId, groupName, thread?.id, thread?.unreadCount]);

  const [activeChannelId, setActiveChannelId] = useState<string>(
    selectedThreadId || thread?.id || channelTabs[0]?.id || "thread",
  );
  const [visitedChannels, setVisitedChannels] = useState<Set<string>>(
    new Set([selectedThreadId || thread?.id || channelTabs[0]?.id || "thread"]),
  );

  // New enquiry: reset tab state so channel tabs match the loaded thread list.
  // (Thread order can change without an enquiry id change — handled via selectedThreadId sync below.)
  useEffect(() => {
    const seed = selectedThreadId || thread?.id || channelTabs[0]?.id || "thread";
    setActiveChannelId(seed);
    setVisitedChannels(
      new Set(channelTabs.length > 0 ? channelTabs.map((t) => t.id) : [seed]),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reset when switching enquiries
  }, [enquiryId]);

  useEffect(() => {
    if (!channelTabs.length) {
      return;
    }
    if (selectedThreadId && channelTabs.some((tab) => tab.id === selectedThreadId)) {
      setActiveChannelId(selectedThreadId);
      return;
    }
    if (!channelTabs.some((tab) => tab.id === activeChannelId)) {
      setActiveChannelId(channelTabs[0].id);
    }
  }, [activeChannelId, channelTabs, selectedThreadId]);

  useEffect(() => {
    if (!activeChannelId) return;
    setVisitedChannels((prev) => {
      if (prev.has(activeChannelId)) return prev;
      const next = new Set(prev);
      next.add(activeChannelId);
      return next;
    });
  }, [activeChannelId]);

  const activeTab = channelTabs.find((tab) => tab.id === activeChannelId) ?? channelTabs[0];
  const buyerName = buyerInfo?.buyerName || enquiryData?.buyerName || "Enquiry";
  const categoryLabel = formatCategories(enquiryData?.categories ?? []);
  const valueLabel = formatDealValue(enquiryData?.estimatedValue);
  const statusLabel = enquiryData?.state || "Draft";
  const markAsWonAction = approvalAction;

  // Empty state when thread hasn't been resolved yet
  if (!thread) {
    return (
      <div className="flex h-full flex-col bg-background">
        <EnquiryHeader
          buyerName={buyerName}
          buyerPersonaId={buyerInfo?.buyerPersonaId || enquiryData?.buyerPersonaId}
          headerGroupId={groupId}
          enquiryId={enquiryId}
          status={statusLabel}
          categoryLabel={categoryLabel}
          valueLabel={valueLabel}
          onBack={onBack}
          onPrimaryAction={markAsWonAction?.onClick}
          primaryActionDisabled={markAsWonAction?.disabled}
          primaryActionLabel={markAsWonAction?.label}
          isMobileView={isMobileView}
          mobileExpanded={mobileHeaderExpanded}
          onToggleMobileExpanded={() => setMobileHeaderExpanded((prev) => !prev)}
        />

        {/* Loading / empty state */}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-8">
          <div
            className="flex size-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(82,73,210,0.08)" }}
          >
            <MessageSquare className="size-7 text-[#5249D2]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Setting up conversation
            </h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-[300px]">
              The enquiry thread is being initialised. This may take a moment.
            </p>
          </div>
          <Button variant="outline" onClick={onBack} className="mt-2">
            Back to Enquiries
          </Button>
        </div>
      </div>
    );
  }

  const structuredPanelNode = (
    <StructuredDataPanel
      enquiryId={enquiryId}
      record={record}
      summary={summary}
      showAISummary={showAISummary}
      onDispatchEvent={onDispatchEvent}
      messagesByChannel={messagesByChannel ?? undefined}
      validationErrors={validationErrors}
      cmOptions={cmOptions}
    />
  );

  const chatPanelsNode = (
    <div className="relative flex-1 min-h-0">
      {channelTabs.map((tab) => {
        if (!visitedChannels.has(tab.id)) return null;
        return (
          <div
            key={tab.id}
            className={cn(
              "absolute inset-0 min-h-0",
              tab.id === activeTab?.id ? "block" : "hidden",
            )}
          >
            <ChatView
              thread={thread}
              rootMessage={rootMessage}
              groupName={tab.label}
              groupId={tab.groupId}
              currentPersonaId={currentPersonaId}
              currentUser={currentUser}
              currentRole={currentRole}
              personaMap={personaMap}
              onSendReply={onSendReply}
              onBack={onBack}
              onShareMessages={onShareMessages}
              groupChannels={groupChannels}
              enquiryData={enquiryData}
              buyerInfo={buyerInfo}
              onOpenShareModal={onOpenShareModal}
              onTagEnquiry={onTagEnquiry}
              onCreateEnquiryFromThread={onCreateEnquiryFromThread}
              availableEnquiries={availableEnquiries}
              approvalAction={approvalAction}
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-background overflow-hidden">
      <div className="sticky top-0 z-20 bg-card">
        <EnquiryHeader
          buyerName={buyerName}
          buyerPersonaId={buyerInfo?.buyerPersonaId || enquiryData?.buyerPersonaId}
          headerGroupId={groupId}
          enquiryId={enquiryId}
          status={statusLabel}
          categoryLabel={categoryLabel}
          valueLabel={valueLabel}
          onBack={onBack}
          onPrimaryAction={markAsWonAction?.onClick}
          primaryActionDisabled={markAsWonAction?.disabled}
          primaryActionLabel={markAsWonAction?.label}
          isMobileView={isMobileView}
          mobileExpanded={mobileHeaderExpanded}
          onToggleMobileExpanded={() => setMobileHeaderExpanded((prev) => !prev)}
        />
        {isMobileView && (
          <div className="flex gap-2 border-b border-border/55 px-4 py-2">
            <Button
              type="button"
              variant={mobileViewTab === "details" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setMobileViewTab("details")}
            >
              Details
            </Button>
            <Button
              type="button"
              variant={mobileViewTab === "chat" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setMobileViewTab("chat")}
            >
              Chat
            </Button>
          </div>
        )}
        {(!isMobileView || mobileViewTab === "chat") && (
          <ChannelTabs
            tabs={channelTabs.map((tab) => ({
              id: tab.id,
              label: tab.label,
              unreadCount: tab.unreadCount,
              mentionCount: tab.mentionCount,
            }))}
            activeTabId={activeTab?.id ?? ""}
            onTabChange={(tabId) => {
              setActiveChannelId(tabId);
              const match = channelTabs.find((tab) => tab.id === tabId);
              if (match && onSelectEnquiryThread) {
                onSelectEnquiryThread(match.id, match.groupId);
              }
            }}
          />
        )}
      </div>

      <div
        className={cn(
          "flex flex-1 min-h-0 overflow-hidden relative z-0",
          isMobileView && "flex-col",
        )}
      >
        {!isMobileView ? (
          <ResizablePanelGroup direction="horizontal" className="h-full w-full z-0">
            <ResizablePanel defaultSize={60} minSize={30} className="flex-1 min-w-0 overflow-hidden flex flex-col border-r border-border/55">
              {chatPanelsNode}
            </ResizablePanel>

            <ResizableHandle withHandle className="z-10" />

            <ResizablePanel defaultSize={40} minSize={20} maxSize={50} className="min-w-[300px] overflow-hidden flex flex-col">
              {structuredPanelNode}
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
            {mobileViewTab === "chat" ? chatPanelsNode : structuredPanelNode}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDealValue(value?: number): string {
  if (!value) return "Value not set";
  return `₹${value.toLocaleString("en-IN")}`;
}

function EnquiryHeader({
  buyerName,
  buyerPersonaId,
  headerGroupId,
  enquiryId,
  status,
  categoryLabel,
  valueLabel,
  onBack,
  onPrimaryAction,
  primaryActionDisabled,
  primaryActionLabel,
  isMobileView = false,
  mobileExpanded = false,
  onToggleMobileExpanded,
}: {
  buyerName: string;
  buyerPersonaId?: string;
  headerGroupId: string;
  enquiryId: string;
  status: string;
  categoryLabel: string;
  valueLabel: string;
  onBack: () => void;
  onPrimaryAction?: () => void;
  primaryActionDisabled?: boolean;
  primaryActionLabel?: string;
  isMobileView?: boolean;
  mobileExpanded?: boolean;
  onToggleMobileExpanded?: () => void;
}) {
  return (
    <div className={cn("border-b border-border/55 bg-card md:px-5", isMobileView ? "px-3 py-2" : "px-4 py-3")}>
      <div className={cn("flex gap-3", isMobileView ? "items-center" : "items-start")}>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onBack}
          className={cn(
            "rounded-full border-border bg-background text-muted-foreground flex-shrink-0",
            isMobileView ? "size-8" : "size-9",
          )}
          aria-label="Back to enquiries"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {buyerPersonaId ? (
              <PersonaHoverTrigger
                personaId={buyerPersonaId}
                context={{ channelId: headerGroupId, location: "pluto-enquiry-header" }}
                side="bottom"
                align="start"
              >
                <h1 className={cn(
                  "cursor-default truncate font-semibold text-foreground",
                  isMobileView ? "text-[16px]" : "text-[18px] md:text-[22px]",
                )} title={buyerName}>
                  {buyerName}
                </h1>
              </PersonaHoverTrigger>
            ) : (
              <h1 className={cn(
                "truncate font-semibold text-foreground",
                isMobileView ? "text-[16px]" : "text-[18px] md:text-[22px]",
              )} title={buyerName}>
                {buyerName}
              </h1>
            )}
            <span className={cn(
              "rounded-full bg-primary/10 font-semibold text-primary",
              isMobileView ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]",
            )}>
              {status}
            </span>
          </div>
          {(!isMobileView || mobileExpanded) && (
            <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] font-medium text-muted-foreground">
              <span className="truncate" title={`#${enquiryId}`}>#{enquiryId}</span>
              <span>•</span>
              <span className="truncate" title={categoryLabel}>{categoryLabel || "Category pending"}</span>
              <span>•</span>
              <span className="truncate" title={valueLabel}>{valueLabel}</span>
            </div>
          )}
        </div>
        <div className={cn("flex items-center gap-2 flex-shrink-0", isMobileView && "gap-1")}>
          {isMobileView && onToggleMobileExpanded ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              onClick={onToggleMobileExpanded}
              aria-label={mobileExpanded ? "Collapse enquiry details" : "Expand enquiry details"}
            >
              {mobileExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>
          ) : null}
          {onPrimaryAction && primaryActionLabel ? (
            <Button
              type="button"
              size="sm"
              className={cn(isMobileView ? "h-8 px-2.5 text-xs" : "h-9 px-3")}
              onClick={onPrimaryAction}
              disabled={primaryActionDisabled}
            >
              {primaryActionLabel}
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="icon" className={cn(isMobileView ? "size-8" : "size-9")} aria-label="More actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChannelTabs({
  tabs,
  activeTabId,
  onTabChange,
}: {
  tabs: Array<{ id: string; label: string; unreadCount: number; mentionCount: number }>;
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}) {
  return (
    <div className="border-b border-border/55 bg-card px-3 pt-2 md:px-5">
      <div className="flex overflow-x-auto whitespace-nowrap gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            aria-pressed={tab.id === activeTabId}
            className={cn(
              "shrink-0 rounded-t-xl border border-b-0 px-3.5 py-2 text-sm font-medium transition-all",
              tab.id === activeTabId
                ? "bg-background text-foreground border-border/60 shadow-[0_-1px_0_0_rgba(0,0,0,0.05)]"
                : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/70",
            )}
          >
            <span>{tab.label}</span>
            {tab.mentionCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                <AtSign className="size-3" />
                {tab.mentionCount}
              </span>
            )}
            {tab.unreadCount > 0 && (
              <span className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {tab.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}


function ChatView({
  thread,
  rootMessage,
  groupName,
  groupId,
  currentPersonaId,
  currentUser,
  currentRole,
  personaMap,
  onSendReply,
  onBack,
  onShareMessages,
  groupChannels,
  enquiryData,
  buyerInfo,
  onOpenShareModal,
  onTagEnquiry,
  onCreateEnquiryFromThread,
  availableEnquiries,
  approvalAction,
}: {
  thread: Thread;
  rootMessage?: Message;
  groupName: string;
  groupId: string;
  currentPersonaId: string;
  currentUser: string;
  currentRole: string;
  personaMap: Map<string, Persona>;
  onSendReply: PlutoEnquiryChatPageProps["onSendReply"];
  onBack: () => void;
  onShareMessages?: PlutoEnquiryChatPageProps["onShareMessages"];
  groupChannels?: any[];
  enquiryData?: PlutoEnquiryChatPageProps["enquiryData"];
  buyerInfo?: PlutoEnquiryChatPageProps["buyerInfo"];
  onOpenShareModal?: PlutoEnquiryChatPageProps["onOpenShareModal"];
  onTagEnquiry?: PlutoEnquiryChatPageProps["onTagEnquiry"];
  onCreateEnquiryFromThread?: PlutoEnquiryChatPageProps["onCreateEnquiryFromThread"];
  availableEnquiries?: PlutoEnquiryChatPageProps["availableEnquiries"];
  approvalAction?: PlutoEnquiryChatPageProps["approvalAction"];
}) {
  return (
    <ThreadPanel
      thread={thread}
      rootMessage={rootMessage}
      groupName={groupName}
      groupId={groupId}
      currentPersonaId={currentPersonaId}
      currentUser={currentUser}
      currentRole={currentRole}
      personaMap={personaMap}
      onSendReply={onSendReply}
      onClose={onBack}
      onShareMessages={onShareMessages}
      groupChannels={groupChannels}
      enquiryData={enquiryData}
      buyerInfo={buyerInfo}
      mode="main"
      onOpenShareModal={onOpenShareModal}
      onTagEnquiry={onTagEnquiry}
      onCreateEnquiryFromThread={onCreateEnquiryFromThread}
      availableEnquiries={availableEnquiries}
      approvalAction={approvalAction}
      hideEnquiryHeader
    />
  );
}

function StructuredDataPanel({
  enquiryId,
  record,
  summary,
  showAISummary,
  onDispatchEvent,
  messagesByChannel,
  validationErrors,
  cmOptions,
}: {
  enquiryId: string;
  record: EnquiryRecord | undefined;
  summary: string;
  showAISummary?: boolean;
  onDispatchEvent: (event: any) => void;
  messagesByChannel?: Record<string, Message[]> | null;
  validationErrors?: string[];
  cmOptions?: Array<{ id: string; name: string }>;
}) {
  return (
    <StructuredPanel
      enquiryId={enquiryId}
      record={record}
      summary={summary}
      showAISummary={showAISummary}
      onDispatchEvent={onDispatchEvent}
      messagesByChannel={messagesByChannel ?? undefined}
      validationErrors={validationErrors}
      cmOptions={cmOptions}
      suppressHeaderDuplicates
    />
  );
}
