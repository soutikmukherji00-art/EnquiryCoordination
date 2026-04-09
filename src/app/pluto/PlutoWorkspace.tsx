import { isDesktop, useBreakpoint } from "@/hooks/useBreakpoint";
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
  canManageMembers,
  canChangeState,
  canShareMessages,
}: PlutoWorkspaceProps) {
  const breakpoint = useBreakpoint();
  const useDesktopLayout = isDesktop(breakpoint);

  if (useDesktopLayout) {
    const isPreviewOpen =
      navigation.page === "enquiry-detail" && detailHeader !== null;

    return (
      <div className="h-full w-full overflow-hidden bg-[#f7f5ef]">
        <PlutoEnquiryListPage
          items={listItems}
          selectedEnquiryId={navigation.selectedEnquiryId}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSelectEnquiry={onSelectEnquiry}
          onCreatePlaceholder={onCreatePlaceholder}
          roleConfig={roleConfig}
          kpiCards={kpiCards}
        />

        <Dialog open={isPreviewOpen} onOpenChange={(open) => !open && onBackToList()}>
          <DialogContent
            className="max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden border-[#d7d4cb] bg-[#fcfbf8] p-0 shadow-[0_30px_90px_rgba(31,33,38,0.16)] sm:max-w-[1120px]"
            aria-describedby={undefined}
          >
            <DialogTitle className="sr-only">
              Pluto enquiry preview
            </DialogTitle>
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
    );
  }

  if (navigation.page === "enquiry-detail" && detailHeader) {
    return (
      <div className="h-full w-full overflow-hidden bg-[#f7f5ef]">
        <PlutoEnquiryDetailPage
          header={detailHeader}
          roleConfig={roleConfig}
          canManageMembers={canManageMembers}
          canChangeState={canChangeState}
          canShareMessages={canShareMessages}
          onBack={onBackToList}
          showBackButton
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden bg-[#f7f5ef]">
      <PlutoEnquiryListPage
        items={listItems}
        selectedEnquiryId={navigation.selectedEnquiryId}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onSelectEnquiry={onSelectEnquiry}
        onCreatePlaceholder={onCreatePlaceholder}
        roleConfig={roleConfig}
        kpiCards={kpiCards}
        isMobileLayout
      />
    </div>
  );
}
