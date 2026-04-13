import { useBreakpoint, isDesktop } from "@/hooks/useBreakpoint";
import { ResponsiveScreen } from "@/app/components/ui/Layout/ResponsiveScreen";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/app/components/ui/dialog";
import type { PlutoNavigationState } from "@/app/workspace.types";
import type {
  PlutoDetailHeaderViewModel,
  PlutoKpiCardViewModel,
  PlutoListItemViewModel,
  PlutoRoleScreenConfig,
} from "./pluto.types";
import { PlutoEnquiryDetailPage } from "./PlutoEnquiryDetailPage";
import { PlutoEnquiryContextPanel } from "./PlutoEnquiryContextPanel";
import { PlutoEnquiryListPage } from "./PlutoEnquiryListPage";
import { PlutoDetailedRFQFlow } from "./PlutoDetailedRFQFlow";
import { PlutoEnquiryChatPage } from "./PlutoEnquiryChatPage";
import { EnquiryIntake } from "@/domain/enquiry/enquiry.intake";
import type { Thread } from "@/domain/message/thread.types";
import type { Message, Attachment } from "@/domain/message/message.types";
import type { Persona } from "@/domain/enquiry/enquiry.types";
import type { EnquiryRecord } from "@/domain/enquiry/enquiry.record";
import type { Category } from "@/domain/category/category.types";

/** Props for the inline single-enquiry chat view */
export interface PlutoEnquiryChatProps {
  enquiryId: string;
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
  currentPersonaId: string;
  currentUser: string;
  currentRole: string;
  personaMap: Map<string, Persona>;
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
  onCreateEnquiryFromThread?: (threadId: string, buyerId: string) => void;
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
  record: EnquiryRecord | undefined;
  summary: string;
  onDispatchEvent: (event: any) => void;
  messagesByChannel?: Record<string, Message[]> | null;
  validationErrors?: string[];
  cmOptions?: Array<{ id: string; name: string }>;
  showAISummary?: boolean;
}

interface PlutoWorkspaceProps {
  navigation: PlutoNavigationState;
  listItems: PlutoListItemViewModel[];
  detailHeader: PlutoDetailHeaderViewModel | null;
  roleConfig: PlutoRoleScreenConfig;
  kpiCards: PlutoKpiCardViewModel[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectEnquiry: (enquiryId: string) => void;
  onBackToList: () => void;
  onCreatePlaceholder: () => void;
  onOpenDetailedRFQCreation: () => void;
  onDirectOrder: () => void;
  onCreateDetailedRFQ: (intake: EnquiryIntake) => void;
  canManageMembers: boolean;
  canChangeState: boolean;
  canShareMessages: boolean;
  /** Props for the inline single-enquiry chat page (when page === "enquiry-chat") */
  enquiryChatProps?: PlutoEnquiryChatProps | null;
  /** Puts user into the chat view for a given enquiry */
  onOpenEnquiryChat?: (enquiryId: string) => void;
  /** Rich record + summary for the context panel (desktop) */
  plutoContextRecord?: EnquiryRecord;
  plutoContextSummary?: string;
}

export function PlutoWorkspace({
  navigation,
  listItems,
  detailHeader,
  roleConfig,
  kpiCards,
  searchQuery,
  onSearchChange,
  onSelectEnquiry,
  onBackToList,
  onCreatePlaceholder,
  onOpenDetailedRFQCreation,
  onDirectOrder,
  onCreateDetailedRFQ,
  canManageMembers,
  canChangeState,
  canShareMessages,
  enquiryChatProps,
  onOpenEnquiryChat,
  plutoContextRecord,
  plutoContextSummary,
}: PlutoWorkspaceProps) {
  // Special Flow: Create RFQ (always highest priority)
  if (navigation.page === "create-detailed-rfq") {
    return (
      <PlutoDetailedRFQFlow
        onBack={onBackToList}
        onSubmit={(intake) => {
          onCreateDetailedRFQ(intake);
          onBackToList();
        }}
      />
    );
  }

  // Enquiry Chat: inline Prism-style single-enquiry chat view
  if (navigation.page === "enquiry-chat" && navigation.selectedEnquiryId) {
    return (
      <PlutoEnquiryChatPage
        enquiryId={navigation.selectedEnquiryId}
        thread={enquiryChatProps?.thread ?? null}
        selectedThreadId={enquiryChatProps?.selectedThreadId}
        rootMessage={enquiryChatProps?.rootMessage}
        groupName={enquiryChatProps?.groupName ?? ""}
        groupId={enquiryChatProps?.groupId ?? ""}
        enquiryThreads={enquiryChatProps?.enquiryThreads}
        onSelectEnquiryThread={enquiryChatProps?.onSelectEnquiryThread}
        currentPersonaId={enquiryChatProps?.currentPersonaId ?? ""}
        currentUser={enquiryChatProps?.currentUser ?? ""}
        currentRole={enquiryChatProps?.currentRole ?? ""}
        personaMap={enquiryChatProps?.personaMap ?? new Map()}
        onSendReply={enquiryChatProps?.onSendReply ?? (() => {})}
        onShareMessages={enquiryChatProps?.onShareMessages}
        groupChannels={enquiryChatProps?.groupChannels}
        onOpenShareModal={enquiryChatProps?.onOpenShareModal}
        onTagEnquiry={enquiryChatProps?.onTagEnquiry}
        onCreateEnquiryFromThread={enquiryChatProps?.onCreateEnquiryFromThread}
        availableEnquiries={enquiryChatProps?.availableEnquiries}
        approvalAction={enquiryChatProps?.approvalAction}
        enquiryData={enquiryChatProps?.enquiryData}
        buyerInfo={enquiryChatProps?.buyerInfo}
        record={enquiryChatProps?.record}
        summary={enquiryChatProps?.summary ?? ""}
        onDispatchEvent={enquiryChatProps?.onDispatchEvent ?? (() => {})}
        messagesByChannel={enquiryChatProps?.messagesByChannel}
        validationErrors={enquiryChatProps?.validationErrors}
        cmOptions={enquiryChatProps?.cmOptions}
        showAISummary={enquiryChatProps?.showAISummary}
        onBack={onBackToList}
      />
    );
  }

  const handleDetailedRFQAction = () => {
    // For now, retaining existing behavior just pointing to the creation view.
    onOpenDetailedRFQCreation();
  };

  const handleQuickRFQAction = () => {
    // Instead of creating a new Quick RFQ, for existing enquiries, drop them straight into Prism chat
    if (navigation.selectedEnquiryId && onOpenEnquiryChat) {
      onOpenEnquiryChat(navigation.selectedEnquiryId);
    } else {
      onCreatePlaceholder();
    }
  };

  const isDetailOpen = navigation.page === "enquiry-detail" && detailHeader !== null;

  return (
    <ResponsiveScreen
      expanded={
        <div className="h-full w-full overflow-hidden bg-background">
          <PlutoEnquiryListPage
            items={listItems}
            selectedEnquiryId={navigation.selectedEnquiryId}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSelectEnquiry={onSelectEnquiry}
            onCreatePlaceholder={onCreatePlaceholder}
            onOpenDetailedRFQCreation={onOpenDetailedRFQCreation}
            onDirectOrder={onDirectOrder}
            roleConfig={roleConfig}
            kpiCards={kpiCards}
          />

          <Dialog open={isDetailOpen} onOpenChange={(open) => !open && onBackToList()}>
            <DialogContent
              className="w-[min(760px,calc(100vw-2rem))] max-w-[760px] gap-0 overflow-hidden rounded-lg p-0"
              aria-describedby={undefined}
            >
              <DialogTitle className="sr-only">Pluto enquiry context preview</DialogTitle>
              <DialogDescription className="sr-only">
                Compact contextual enquiry panel with actions.
              </DialogDescription>
              <PlutoEnquiryContextPanel
                header={detailHeader}
                record={plutoContextRecord ?? enquiryChatProps?.record}
                summary={plutoContextSummary ?? enquiryChatProps?.summary}
                onClose={onBackToList}
                onContinueRfq={handleDetailedRFQAction}
                onQuickRfq={handleQuickRFQAction}
                onConvertToOrder={onDirectOrder}
              />
            </DialogContent>
          </Dialog>
        </div>
      }
      compact={
        isDetailOpen ? (
          <div className="h-full w-full overflow-hidden bg-background">
            <PlutoEnquiryDetailPage
              header={detailHeader}
              roleConfig={roleConfig}
              canManageMembers={canManageMembers}
              canChangeState={canChangeState}
              canShareMessages={canShareMessages}
              onBack={onBackToList}
              showBackButton
              displayMode="full-page"
              record={plutoContextRecord ?? enquiryChatProps?.record}
              summary={plutoContextSummary ?? enquiryChatProps?.summary}
              onCreatePlaceholder={handleQuickRFQAction}
              onOpenDetailedRFQCreation={handleDetailedRFQAction}
              onDirectOrder={onDirectOrder}
            />
          </div>
        ) : (
          <PlutoEnquiryListPage
            items={listItems}
            selectedEnquiryId={navigation.selectedEnquiryId}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSelectEnquiry={onSelectEnquiry}
            onCreatePlaceholder={onCreatePlaceholder}
            onOpenDetailedRFQCreation={onOpenDetailedRFQCreation}
            onDirectOrder={onDirectOrder}
            roleConfig={roleConfig}
            kpiCards={kpiCards}
            isMobileLayout
          />
        )
      }
    />
  );
}
