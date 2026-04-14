import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";

interface SummaryActionInputsProps {
  warehouseOptions: string[];
  selectedWarehouse: string;
  estimatedDispatchDays: string;
  additionalTerms: string;
  onWarehouseChange: (value: string) => void;
  onEstimatedDispatchDaysChange: (value: string) => void;
  onAdditionalTermsChange: (value: string) => void;
}

export function SummaryActionInputs({
  warehouseOptions,
  selectedWarehouse,
  estimatedDispatchDays,
  additionalTerms,
  onWarehouseChange,
  onEstimatedDispatchDaysChange,
  onAdditionalTermsChange,
}: SummaryActionInputsProps) {
  return (
    <Card className="gap-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Final Inputs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Choose Seller Warehouse</p>
          <Select value={selectedWarehouse} onValueChange={onWarehouseChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouseOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Estimated Dispatch ETA</p>
          <div className="relative">
            <Input
              type="number"
              value={estimatedDispatchDays}
              onChange={(event) => onEstimatedDispatchDaysChange(event.target.value)}
              placeholder="Enter days"
              min={0}
              className="pr-14"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              Days
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Additional Seller PO Terms</p>
          <Textarea
            value={additionalTerms}
            onChange={(event) => onAdditionalTermsChange(event.target.value)}
            placeholder="Add any final PO terms for seller"
            className="min-h-24"
          />
        </div>
      </CardContent>
    </Card>
  );
}
