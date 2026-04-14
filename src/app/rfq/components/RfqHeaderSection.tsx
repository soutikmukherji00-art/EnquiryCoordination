import { PanelLeftClose, PanelLeftOpen, SquarePen } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

interface RfqHeaderSectionProps {
  rfqId: string;
  isEditMode: boolean;
  isRightRailOpen: boolean;
  canSendForApproval: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onToggleEditMode: () => void;
  onDiscardChanges: () => void;
  onSaveDraft: () => void;
  onSendForApproval: () => void;
  onToggleRightRail: () => void;
  onReviewOrderSummary: () => void;
}

export function RfqHeaderSection({
  rfqId,
  isEditMode,
  isRightRailOpen,
  canSendForApproval: canSendApproval,
  isSubmitting,
  onBack,
  onToggleEditMode,
  onDiscardChanges,
  onSaveDraft,
  onSendForApproval,
  onToggleRightRail,
  onReviewOrderSummary,
}: RfqHeaderSectionProps) {
  return (
    <div className="rounded-xl border bg-card px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold">RFQ Details</h1>
            <p className="text-sm text-muted-foreground">{rfqId}</p>
          </div>
          <Badge variant="secondary">Pending Approval</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={onToggleRightRail}>
            {isRightRailOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
            {isRightRailOpen ? "Hide Rail" : "Show Rail"}
          </Button>

          {!isEditMode ? (
            <>
              <Button type="button" variant="outline" onClick={onReviewOrderSummary}>
                Review Order Summary
              </Button>
              <Button type="button" onClick={onToggleEditMode}>
                <SquarePen />
                Modify Quote
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" onClick={onDiscardChanges} disabled={isSubmitting}>
                Discard Changes
              </Button>
              <Button type="button" variant="outline" onClick={onSaveDraft} disabled={isSubmitting}>
                Save to Draft
              </Button>
              <Button type="button" onClick={onSendForApproval} disabled={!canSendApproval || isSubmitting}>
                Send for Approval
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
