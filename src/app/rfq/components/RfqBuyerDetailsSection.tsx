import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Switch } from "@/app/components/ui/switch";
import { DualRenderField } from "@/app/components/ui/DualRenderField";
import type { RfqSectionProps } from "@/app/rfq/components/types";

export function RfqBuyerDetailsSection({ isEditMode, form }: RfqSectionProps) {
  const values = form.watch();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Buyer Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <DualRenderField
          label="RFQ Number"
          isEditMode={isEditMode}
          required
          errorMessage={form.formState.errors.rfqNumber?.message}
          viewContent={<span>{values.rfqNumber || "—"}</span>}
          editContent={<Input {...form.register("rfqNumber")} />}
        />
        <DualRenderField
          label="Buyer Name"
          isEditMode={isEditMode}
          required
          errorMessage={form.formState.errors.buyerName?.message}
          viewContent={<span>{values.buyerName || "—"}</span>}
          editContent={<Input {...form.register("buyerName")} />}
        />
        <DualRenderField
          label="Ticket Reference"
          isEditMode={isEditMode}
          viewContent={<span>{values.ticketReference || "—"}</span>}
          editContent={<Input {...form.register("ticketReference")} />}
        />
        <DualRenderField
          label="RFQ Dependency"
          isEditMode={isEditMode}
          viewContent={<span>{values.dependencyReason || "—"}</span>}
          editContent={<Input {...form.register("dependencyReason")} />}
        />

        <div className="flex min-h-10 items-center justify-between rounded-md border px-3 py-2">
          <span className="text-sm font-medium">Is SEZ</span>
          {isEditMode ? (
            <Controller
              control={form.control}
              name="isSez"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="SEZ toggle"
                />
              )}
            />
          ) : (
            <span className="text-sm text-muted-foreground">{values.isSez ? "Yes" : "No"}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
