import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { DualRenderField } from "@/app/components/ui/DualRenderField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import type { RfqSectionProps } from "@/app/rfq/components/types";
import { CM_OPTIONS, RM_OPTIONS } from "@/app/rfq/rfq-details.schema";

function resolveLabel(value: string, options: Array<{ value: string; label: string }>) {
  return options.find((item) => item.value === value)?.label ?? "—";
}

export function RfqAssignmentSection({ isEditMode, form }: RfqSectionProps) {
  const values = form.watch();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Assignment</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <DualRenderField
          label="RM Name"
          isEditMode={isEditMode}
          required
          errorMessage={form.formState.errors.rmName?.message}
          viewContent={<span>{resolveLabel(values.rmName, RM_OPTIONS)}</span>}
          editContent={
            <Controller
              control={form.control}
              name="rmName"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select RM" />
                  </SelectTrigger>
                  <SelectContent>
                    {RM_OPTIONS.map((rm) => (
                      <SelectItem key={rm.value} value={rm.value}>
                        {rm.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          }
        />
        <DualRenderField
          label="CM Name"
          isEditMode={isEditMode}
          required
          errorMessage={form.formState.errors.cmName?.message}
          viewContent={<span>{resolveLabel(values.cmName, CM_OPTIONS)}</span>}
          editContent={
            <Controller
              control={form.control}
              name="cmName"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select CM" />
                  </SelectTrigger>
                  <SelectContent>
                    {CM_OPTIONS.map((cm) => (
                      <SelectItem key={cm.value} value={cm.value}>
                        {cm.label}
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
