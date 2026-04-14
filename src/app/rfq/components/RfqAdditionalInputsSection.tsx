import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { DualRenderField } from "@/app/components/ui/DualRenderField";
import type { RfqSectionProps } from "@/app/rfq/components/types";

export function RfqAdditionalInputsSection({ isEditMode, form }: RfqSectionProps) {
  const values = form.watch();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Additional Inputs</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <DualRenderField
          label="Scope of Unloading"
          isEditMode={isEditMode}
          viewContent={<span>{values.scopeOfUnloading || "—"}</span>}
          editContent={<Input {...form.register("scopeOfUnloading")} />}
        />
        <DualRenderField
          label="Parent Quote"
          isEditMode={isEditMode}
          viewContent={<span>{values.parentQuote || "—"}</span>}
          editContent={<Input {...form.register("parentQuote")} />}
        />
        <DualRenderField
          className="md:col-span-2"
          label="Remarks"
          isEditMode={isEditMode}
          viewContent={<span>{values.remarks || "—"}</span>}
          editContent={<Textarea rows={3} {...form.register("remarks")} />}
        />
        <DualRenderField
          className="md:col-span-2"
          label="Invoice T&C"
          isEditMode={isEditMode}
          viewContent={<span>{values.invoiceTerms || "—"}</span>}
          editContent={<Textarea rows={3} {...form.register("invoiceTerms")} />}
        />
      </CardContent>
    </Card>
  );
}
