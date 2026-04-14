import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { DualRenderField } from "@/app/components/ui/DualRenderField";
import type { RfqSectionProps } from "@/app/rfq/components/types";

export function RfqOrderBillingSection({ isEditMode, form }: RfqSectionProps) {
  const values = form.watch();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Order & Billing</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <DualRenderField
          label="Quote Delivery ETA"
          isEditMode={isEditMode}
          required
          errorMessage={form.formState.errors.quoteDeliveryEta?.message}
          viewContent={<span>{values.quoteDeliveryEta || "—"}</span>}
          editContent={<Input type="date" {...form.register("quoteDeliveryEta")} />}
        />
        <DualRenderField
          label="PO Number"
          isEditMode={isEditMode}
          viewContent={<span>{values.poNumber || "—"}</span>}
          editContent={<Input {...form.register("poNumber")} />}
        />
        <DualRenderField
          label="PO Date"
          isEditMode={isEditMode}
          viewContent={<span>{values.poDate || "—"}</span>}
          editContent={<Input type="date" {...form.register("poDate")} />}
        />
        <DualRenderField
          label="PO Document"
          isEditMode={isEditMode}
          viewContent={<span>{values.poDocumentName || "No file uploaded"}</span>}
          editContent={
            <Input
              placeholder="PO_Draft_v2.pdf"
              {...form.register("poDocumentName")}
            />
          }
        />
        <DualRenderField
          className="md:col-span-2"
          label="Billing Address"
          isEditMode={isEditMode}
          required
          errorMessage={form.formState.errors.billingAddress?.message}
          viewContent={<span>{values.billingAddress || "—"}</span>}
          editContent={<Textarea rows={3} {...form.register("billingAddress")} />}
        />
      </CardContent>
    </Card>
  );
}
