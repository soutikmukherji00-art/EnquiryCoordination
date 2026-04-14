import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { RfqAdditionalInputsSection } from "@/app/rfq/components/RfqAdditionalInputsSection";
import { RfqAssignmentSection } from "@/app/rfq/components/RfqAssignmentSection";
import { RfqBuyerDetailsSection } from "@/app/rfq/components/RfqBuyerDetailsSection";
import { RfqCommercialDetailsSection } from "@/app/rfq/components/RfqCommercialDetailsSection";
import { RfqHeaderSection } from "@/app/rfq/components/RfqHeaderSection";
import { RfqLineItemsSection } from "@/app/rfq/components/RfqLineItemsSection";
import { RfqOrderBillingSection } from "@/app/rfq/components/RfqOrderBillingSection";
import { RfqRightRail } from "@/app/rfq/components/RfqRightRail";
import { RfqShippingDetailsSection } from "@/app/rfq/components/RfqShippingDetailsSection";
import {
  canSendForApproval,
  rfqDetailsSchema,
  type RfqDetailsFormValues,
} from "@/app/rfq/rfq-details.schema";
import { buildRfqDetailsInitialValues } from "@/app/rfq/rfq-details.view-models";

interface RfqDetailsPageProps {
  rfqId: string;
  onBack: () => void;
}

export function RfqDetailsPage({ rfqId, onBack }: RfqDetailsPageProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isRightRailOpen, setIsRightRailOpen] = useState(true);
  const [activeRailTab, setActiveRailTab] = useState<"chat" | "documents">("chat");
  const [initialSnapshot, setInitialSnapshot] = useState<RfqDetailsFormValues>(() =>
    buildRfqDetailsInitialValues(rfqId),
  );

  const form = useForm<RfqDetailsFormValues>({
    resolver: zodResolver(rfqDetailsSchema),
    defaultValues: initialSnapshot,
    mode: "onChange",
  });

  useEffect(() => {
    const values = buildRfqDetailsInitialValues(rfqId);
    setInitialSnapshot(values);
    setIsEditMode(false);
    form.reset(values);
  }, [form, rfqId]);

  const values = form.watch();
  const canSubmitForApproval = canSendForApproval(
    values,
    form.formState.isDirty,
    form.formState.isValid,
  );

  const handleDiscardChanges = () => {
    form.reset(initialSnapshot);
    setIsEditMode(false);
  };

  const saveAction = useMemo(
    () =>
      form.handleSubmit((nextValues) => {
        setInitialSnapshot(nextValues);
        form.reset(nextValues);
        setIsEditMode(false);
        toast.success("RFQ saved to draft");
      }),
    [form],
  );

  const approvalAction = useMemo(
    () =>
      form.handleSubmit((nextValues) => {
        setInitialSnapshot(nextValues);
        form.reset(nextValues);
        setIsEditMode(false);
        toast.success("RFQ sent for approval");
      }),
    [form],
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex h-full w-full max-w-[1540px] flex-1 flex-col gap-4 px-4 py-4 md:px-6">
        <RfqHeaderSection
          rfqId={rfqId}
          isEditMode={isEditMode}
          isRightRailOpen={isRightRailOpen}
          canSendForApproval={canSubmitForApproval}
          isSubmitting={form.formState.isSubmitting}
          onBack={onBack}
          onToggleEditMode={() => setIsEditMode(true)}
          onDiscardChanges={handleDiscardChanges}
          onSaveDraft={saveAction}
          onSendForApproval={approvalAction}
          onToggleRightRail={() => setIsRightRailOpen((current) => !current)}
        />

        <div
          className="grid min-h-0 flex-1 gap-4"
          style={{ gridTemplateColumns: isRightRailOpen ? "minmax(0, 1fr) 360px" : "minmax(0, 1fr)" }}
        >
          <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
            <RfqBuyerDetailsSection isEditMode={isEditMode} form={form} />
            <RfqAssignmentSection isEditMode={isEditMode} form={form} />
            <RfqCommercialDetailsSection isEditMode={isEditMode} form={form} />
            <RfqOrderBillingSection isEditMode={isEditMode} form={form} />
            <RfqAdditionalInputsSection isEditMode={isEditMode} form={form} />
            <RfqShippingDetailsSection isEditMode={isEditMode} form={form} />
            <RfqLineItemsSection isEditMode={isEditMode} form={form} />
          </div>

          {isRightRailOpen ? (
            <div className="min-h-0 overflow-y-auto">
              <RfqRightRail activeTab={activeRailTab} onTabChange={setActiveRailTab} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
