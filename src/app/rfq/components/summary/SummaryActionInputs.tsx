import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";

interface WarehouseOption {
  value: string;
  label: string;
}

interface SummaryActionInputsProps {
  warehouseOptions: WarehouseOption[];
  selectedWarehouse: string;
  dispatchEtaDays: string;
  additionalTerms: string;
  onWarehouseChange: (value: string) => void;
  onDispatchEtaDaysChange: (value: string) => void;
  onAdditionalTermsChange: (value: string) => void;
}

export function SummaryActionInputs({
  warehouseOptions,
  selectedWarehouse,
  dispatchEtaDays,
  additionalTerms,
  onWarehouseChange,
  onDispatchEtaDaysChange,
  onAdditionalTermsChange,
}: SummaryActionInputsProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-sm md:p-5">
      <h2 className="mb-4 text-base font-semibold">Final Inputs</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Choose Seller Warehouse</Label>
          <Select value={selectedWarehouse} onValueChange={onWarehouseChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouseOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dispatch-eta">Estimated Dispatch ETA</Label>
          <div className="relative">
            <Input
              id="dispatch-eta"
              value={dispatchEtaDays}
              onChange={(event) => onDispatchEtaDaysChange(event.target.value)}
              inputMode="numeric"
              className="pr-14"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              Days
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional-seller-terms">Additional Seller PO Terms</Label>
          <Textarea
            id="additional-seller-terms"
            value={additionalTerms}
            onChange={(event) => onAdditionalTermsChange(event.target.value)}
            placeholder="Add any custom terms for the seller PO"
            rows={4}
          />
        </div>
      </div>
    </section>
  );
}
