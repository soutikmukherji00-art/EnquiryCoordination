import { ResponsiveScreen } from "@/app/components/ui/Layout/ResponsiveScreen";
import type { PlutoNavigationState } from "@/app/workspace.types";
import type {
  PlutoDetailHeaderViewModel,
  PlutoKpiCardViewModel,
  PlutoListItemViewModel,
  PlutoRoleScreenConfig,
} from "./pluto.types";
import { PlutoEnquiryDetailPage } from "./PlutoEnquiryDetailPage";
import { PlutoEnquiryListPage } from "./PlutoEnquiryListPage";
import { PlutoDetailedRFQFlow } from "./PlutoDetailedRFQFlow";
import { PlutoEnquiryChatPage } from "./PlutoEnquiryChatPage";
import { OrderSummaryPage } from "./OrderSummaryPage";
import { BdmMarkWonStepPage } from "./BdmMarkWonStepPage";
import { DirectOrderOcrSummaryPage } from "@/app/rfq/DirectOrderOcrSummaryPage";
import { CmEnquiryPreviewPage } from "@/app/rfq/CmEnquiryPreviewPage";
import { CmReviewOrderSummaryPage } from "@/app/rfq/CmReviewOrderSummaryPage";
import type { DirectOrderSummaryData } from "@/app/rfq/direct-order.flow";
import { EnquiryIntake } from "@/domain/enquiry/enquiry.intake";
import type { Thread } from "@/domain/message/thread.types";
import type { Message, Attachment } from "@/domain/message/message.types";
import type { Persona } from "@/domain/enquiry/enquiry.types";
import type { EnquiryRecord } from "@/domain/enquiry/enquiry.record";
import type { Category } from "@/domain/category/category.types";
import type { OpenShareModalWinMarkOptions } from "@/domain/message/share.types";
import type {
  WinSignalBuyerConfirmationSnippet,
  WinSignalPODocument,
} from "@/domain/enquiry/enquiry.approval";

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
    options?: OpenShareModalWinMarkOptions,
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

/** Handlers + data for standalone Buyer PO / direct order under Pluto (FAB entry) */
export interface PlutoDirectOrderFlowProps {
  summaryData: DirectOrderSummaryData;
  cmOptions: Array<{ id: string; name: string }>;
  assignedCmName: string;
  /** Label for OCR page back control (e.g. "Back") */
  ocrBackButtonLabel: string;
  onOcrBack: () => void;
  onMarkAsWon: (next: DirectOrderSummaryData) => void;
  onCmPreviewBack: () => void;
  onCmPreviewReview: () => void;
  onCmReviewBack: () => void;
  onEditLineItems: () => void;
  onAssignSeller: () => void;
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
  /** List FAB + enquiry detail “Direct Order” — standalone PO / OCR flow under Pluto */
  onFabDirectOrder: () => void;
  onSelectQuickRfq?: () => void;
  onSelectDetailedRfq?: () => void;
  onSelectDirectOrder?: () => void;
  plutoDirectOrderFlow: PlutoDirectOrderFlowProps;
  onCreateDetailedRFQ: (intake: EnquiryIntake) => void;
  onBackFromOrderSummary: () => void;
  onConfirmForOrderFromSummary: (enquiryId: string) => void | Promise<void>;
  confirmOrderSubmitting?: boolean;
  canManageMembers: boolean;
  canChangeState: boolean;
  canShareMessages: boolean;
  /** Props for the inline single-enquiry chat page (when page === "enquiry-chat") */
  enquiryChatProps?: PlutoEnquiryChatProps | null;
  /** Puts user into the chat view for a given enquiry */
  onOpenEnquiryChat?: (enquiryId: string) => void;
  /** Rich record + summary for the enquiry detail page */
  plutoContextRecord?: EnquiryRecord;
  plutoContextSummary?: string;
  canReviewOrderSummaryFromPreview?: boolean;
  onReviewOrderSummaryFromPreview?: (enquiryId: string) => void;
  bdmOptions?: Array<{ id: string; name: string }>;
  onReassignPrimaryBdm?: (enquiryId: string, personaId: string) => void;
  /** When page === "bdm-mark-won" */
  bdmMarkWonProps?: {
    enquiryId: string;
    record?: EnquiryRecord;
    hasWinSignals: boolean;
    poDocuments: WinSignalPODocument[];
    buyerConfirmations: WinSignalBuyerConfirmationSnippet[];
    onRecordUpdate: (nextRecord: EnquiryRecord) => void | Promise<void>;
    onRunPoExtraction: (attachment: {
      name?: string;
      type?: string;
      url?: string;
      markAsPO?: boolean;
    }) => Promise<{ themes: string[]; prefilledFields: string[] }>;
    onBack: () => void;
    onConfirm: () => void | Promise<void>;
    confirmSubmitting?: boolean;
    cmOptions?: Array<{ id: string; name: string }>;
  } | null;
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
  onFabDirectOrder,
  onSelectQuickRfq,
  onSelectDetailedRfq,
  onSelectDirectOrder,
  plutoDirectOrderFlow,
  onCreateDetailedRFQ,
  onBackFromOrderSummary,
  onConfirmForOrderFromSummary,
  confirmOrderSubmitting = false,
  canManageMembers,
  canChangeState,
  canShareMessages,
  enquiryChatProps,
  plutoContextRecord,
  plutoContextSummary,
  canReviewOrderSummaryFromPreview = false,
  onReviewOrderSummaryFromPreview,
  bdmOptions,
  onReassignPrimaryBdm,
  bdmMarkWonProps,
}: PlutoWorkspaceProps) {
  if (navigation.page === "bdm-mark-won" && bdmMarkWonProps) {
    return (
      <BdmMarkWonStepPage
        enquiryId={bdmMarkWonProps.enquiryId}
        record={bdmMarkWonProps.record}
        hasWinSignals={bdmMarkWonProps.hasWinSignals}
        poDocuments={bdmMarkWonProps.poDocuments}
        buyerConfirmations={bdmMarkWonProps.buyerConfirmations}
        onRecordUpdate={bdmMarkWonProps.onRecordUpdate}
        onRunPoExtraction={bdmMarkWonProps.onRunPoExtraction}
        onBack={bdmMarkWonProps.onBack}
        onConfirm={bdmMarkWonProps.onConfirm}
        confirmSubmitting={bdmMarkWonProps.confirmSubmitting}
        cmOptions={bdmMarkWonProps.cmOptions}
      />
    );
  }

  if (navigation.page === "direct-order-ocr") {
    return (
      <DirectOrderOcrSummaryPage
        initialData={plutoDirectOrderFlow.summaryData}
        cmOptions={plutoDirectOrderFlow.cmOptions}
        onBack={plutoDirectOrderFlow.onOcrBack}
        onMarkAsWon={plutoDirectOrderFlow.onMarkAsWon}
        backButtonLabel={plutoDirectOrderFlow.ocrBackButtonLabel}
      />
    );
  }

  if (navigation.page === "cm-enquiry-preview") {
    return (
      <CmEnquiryPreviewPage
        rfqNumber={plutoDirectOrderFlow.summaryData.rfqNumber}
        onBack={plutoDirectOrderFlow.onCmPreviewBack}
        onReviewOrderSummary={plutoDirectOrderFlow.onCmPreviewReview}
      />
    );
  }

  if (navigation.page === "cm-review-order-summary") {
    return (
      <CmReviewOrderSummaryPage
        summaryData={plutoDirectOrderFlow.summaryData}
        assignedCmName={plutoDirectOrderFlow.assignedCmName}
        onBack={plutoDirectOrderFlow.onCmReviewBack}
        onEditLineItems={plutoDirectOrderFlow.onEditLineItems}
        onAssignSeller={plutoDirectOrderFlow.onAssignSeller}
      />
    );
  }

  if (navigation.page === "order-summary" && navigation.selectedEnquiryId) {
    return (
      <OrderSummaryPage
        enquiryId={navigation.selectedEnquiryId}
        record={plutoContextRecord ?? enquiryChatProps?.record}
        onBack={onBackFromOrderSummary}
        onConfirm={() => onConfirmForOrderFromSummary(navigation.selectedEnquiryId)}
        confirmSubmitting={confirmOrderSubmitting}
      />
    );
  }

  // Special Flow: Create RFQ (always highest priority)
  if (navigation.page === "create-detailed-rfq") {
    return (
      <PlutoDetailedRFQFlow
        onBack={onBackToList}
        prefillRecord={plutoContextRecord}
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
    onOpenDetailedRFQCreation();
  };

  const isDetailOpen = navigation.page === "enquiry-detail" && detailHeader !== null;
  const selectedId = navigation.selectedEnquiryId ?? "";

  const detailPage =
    isDetailOpen && detailHeader ? (
    <PlutoEnquiryDetailPage
      enquiryId={selectedId}
      header={detailHeader}
      roleConfig={roleConfig}
      canManageMembers={canManageMembers}
      canChangeState={canChangeState}
      canShareMessages={canShareMessages}
      onBack={onBackToList}
      showBackButton
      record={plutoContextRecord ?? enquiryChatProps?.record}
      summary={plutoContextSummary ?? enquiryChatProps?.summary}
      showReviewOrderSummaryAction={canReviewOrderSummaryFromPreview}
      onReviewOrderSummary={
        navigation.selectedEnquiryId && onReviewOrderSummaryFromPreview
          ? () => onReviewOrderSummaryFromPreview(navigation.selectedEnquiryId)
          : undefined
      }
      onCreatePlaceholder={onCreatePlaceholder}
      onOpenDetailedRFQCreation={handleDetailedRFQAction}
      onFabDirectOrder={onFabDirectOrder}
      onSelectQuickRfq={onSelectQuickRfq}
      onSelectDetailedRfq={onSelectDetailedRfq}
      onSelectDirectOrder={onSelectDirectOrder}
      bdmOptions={bdmOptions}
      onReassignPrimaryBdm={onReassignPrimaryBdm}
    />
  ) : null;

  return (
    <ResponsiveScreen
      expanded={
        <div className="h-full w-full overflow-hidden bg-background">
          {detailPage ? (
            <div className="h-full w-full min-h-0 overflow-hidden">{detailPage}</div>
          ) : (
            <PlutoEnquiryListPage
              items={listItems}
              selectedEnquiryId={navigation.selectedEnquiryId}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              onSelectEnquiry={onSelectEnquiry}
              onCreatePlaceholder={onCreatePlaceholder}
              onOpenDetailedRFQCreation={onOpenDetailedRFQCreation}
              onFabDirectOrder={onFabDirectOrder}
              roleConfig={roleConfig}
              kpiCards={kpiCards}
            />
          )}
        </div>
      }
      compact={
        detailPage ? (
          <div className="h-full w-full min-h-0 overflow-hidden bg-background">{detailPage}</div>
        ) : (
          <PlutoEnquiryListPage
            items={listItems}
            selectedEnquiryId={navigation.selectedEnquiryId}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSelectEnquiry={onSelectEnquiry}
            onCreatePlaceholder={onCreatePlaceholder}
            onOpenDetailedRFQCreation={onOpenDetailedRFQCreation}
            onFabDirectOrder={onFabDirectOrder}
            roleConfig={roleConfig}
            kpiCards={kpiCards}
            isMobileLayout
          />
        )
      }
    />
  );
}
