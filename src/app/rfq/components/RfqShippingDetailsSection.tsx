import { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Switch } from "@/app/components/ui/switch";
import { Textarea } from "@/app/components/ui/textarea";
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
  LOGISTICS_OPTIONS,
  SELLER_OPTIONS,
  WAREHOUSE_OPTIONS_BY_SELLER,
} from "@/app/rfq/rfq-details.schema";

function resolveLabel(value: string, options: Array<{ value: string; label: string }>) {
  return options.find((item) => item.value === value)?.label ?? "—";
}

export function RfqShippingDetailsSection({ isEditMode, form }: RfqSectionProps) {
  const values = form.watch();
  const sellerId = form.watch("sellerId");

  const warehouseOptions = useMemo(
    () => WAREHOUSE_OPTIONS_BY_SELLER[sellerId] ?? [],
    [sellerId],
  );

  useEffect(() => {
    if (!sellerId) return;
    const currentWarehouse = form.getValues("warehouseId");
    const isValidWarehouse = warehouseOptions.some(
      (warehouse) => warehouse.value === currentWarehouse,
    );
    if (!isValidWarehouse) {
      form.setValue("warehouseId", "");
    }
  }, [form, sellerId, warehouseOptions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Shipping Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <DualRenderField
          className="md:col-span-2"
          label="Buyer Shipping Address"
          isEditMode={isEditMode}
          required
          errorMessage={form.formState.errors.buyerShippingAddress?.message}
          viewContent={<span>{values.buyerShippingAddress || "—"}</span>}
          editContent={<Textarea rows={3} {...form.register("buyerShippingAddress")} />}
        />

        <DualRenderField
          label="Seller"
          isEditMode={isEditMode}
          required
          errorMessage={form.formState.errors.sellerId?.message}
          viewContent={<span>{resolveLabel(values.sellerId, SELLER_OPTIONS)}</span>}
          editContent={
            <Controller
              control={form.control}
              name="sellerId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select seller" />
                  </SelectTrigger>
                  <SelectContent>
                    {SELLER_OPTIONS.map((seller) => (
                      <SelectItem key={seller.value} value={seller.value}>
                        {seller.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          }
        />

        <DualRenderField
          label="Warehouse"
          isEditMode={isEditMode}
          required
          errorMessage={form.formState.errors.warehouseId?.message}
          viewContent={<span>{resolveLabel(values.warehouseId, warehouseOptions)}</span>}
          editContent={
            <Controller
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={warehouseOptions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouseOptions.map((warehouse) => (
                      <SelectItem key={warehouse.value} value={warehouse.value}>
                        {warehouse.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          }
        />

        <DualRenderField
          label="Logistics Details"
          isEditMode={isEditMode}
          errorMessage={form.formState.errors.logisticsMode?.message}
          viewContent={<span>{resolveLabel(values.logisticsMode, LOGISTICS_OPTIONS)}</span>}
          editContent={
            <Controller
              control={form.control}
              name="logisticsMode"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select logistics mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOGISTICS_OPTIONS.map((option) => (
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
          label="Seller Shipping Landmark"
          isEditMode={isEditMode}
          viewContent={<span>{values.warehouseId || "—"}</span>}
          editContent={<Input value={resolveLabel(values.warehouseId, warehouseOptions)} disabled />}
        />

        <div className="flex min-h-10 items-center justify-between rounded-md border px-3 py-2">
          <span className="text-sm font-medium">Program Flag</span>
          {isEditMode ? (
            <Controller
              control={form.control}
              name="programFlag"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Program flag toggle"
                />
              )}
            />
          ) : (
            <span className="text-sm text-muted-foreground">
              {values.programFlag ? "Enabled" : "Disabled"}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
