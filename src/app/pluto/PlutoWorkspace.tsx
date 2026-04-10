import { useBreakpoint, isDesktop } from "@/hooks/useBreakpoint";
import { ResponsiveScreen } from "@/app/components/ui/Layout/ResponsiveScreen";
import type { PlutoNavigationState } from "@/app/workspace.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/app/components/ui/dialog";
import type {
  PlutoDetailHeaderViewModel,
  PlutoKpiCardViewModel,
  PlutoListItemViewModel,
  PlutoRoleScreenConfig,
} from "./pluto.types";
import { PlutoEnquiryDetailPage } from "./PlutoEnquiryDetailPage";
import { PlutoEnquiryListPage } from "./PlutoEnquiryListPage";
import { PlutoDetailedRFQFlow } from "./PlutoDetailedRFQFlow";
import { EnquiryIntake } from "@/domain/enquiry/enquiry.intake";

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
              className="max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden border-border bg-card p-0 shadow-2xl sm:max-w-[1120px]"
              aria-describedby={undefined}
            >
              <DialogTitle className="sr-only">Pluto enquiry preview</DialogTitle>
              <DialogDescription className="sr-only">
                Preview the structured Pluto surface for the selected enquiry.
              </DialogDescription>

              <div className="min-h-0">
                <PlutoEnquiryDetailPage
                  header={detailHeader}
                  roleConfig={roleConfig}
                  canManageMembers={canManageMembers}
                  canChangeState={canChangeState}
                  canShareMessages={canShareMessages}
                  onBack={onBackToList}
                  displayMode="modal"
                />
              </div>
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
