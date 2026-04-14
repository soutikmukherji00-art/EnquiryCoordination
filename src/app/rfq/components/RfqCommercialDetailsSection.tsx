import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { DualRenderField } from "@/app/components/ui/DualRenderField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import type { RfqSectionProps } from "@/app/rfq/components/types";
import {
  ENHANCER_OPTIONS,
  PAYMENT_TERM_OPTIONS,
} from "@/app/rfq/rfq-details.schema";

function resolveLabel(value: string, options: Array<{ value: string; label: string }>) {
  return options.find((item) => item.value === value)?.label ?? "—";
}

export function RfqCommercialDetailsSection({ isEditMode, form }: RfqSectionProps) {
  const values = form.watch();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Commercial Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <DualRenderField
          label="Margin Days"
          isEditMode={isEditMode}
          errorMessage={form.formState.errors.marginDays?.message}
          viewContent={<span>{values.marginDays}</span>}
          editContent={<Input type="number" min={0} {...form.register("marginDays")} />}
        />
        <DualRenderField
          label="Rate of Interest (%)"
          isEditMode={isEditMode}
          errorMessage={form.formState.errors.rateOfInterest?.message}
          viewContent={<span>{values.rateOfInterest}%</span>}
          editContent={
            <Input type="number" min={0} step="0.1" {...form.register("rateOfInterest")} />
          }
        />
        <DualRenderField
          label="Enhancer Type"
          isEditMode={isEditMode}
          errorMessage={form.formState.errors.enhancerType?.message}
          viewContent={<span>{resolveLabel(values.enhancerType, ENHANCER_OPTIONS)}</span>}
          editContent={
            <Controller
              control={form.control}
              name="enhancerType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select enhancer type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENHANCER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          }
        />
        <DualRenderField
          label="Payment Terms"
          isEditMode={isEditMode}
          errorMessage={form.formState.errors.paymentTerms?.message}
          viewContent={<span>{resolveLabel(values.paymentTerms, PAYMENT_TERM_OPTIONS)}</span>}
          editContent={
            <Controller
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERM_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          }
        />
      </CardContent>
    </Card>
  );
}
