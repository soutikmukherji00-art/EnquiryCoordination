import type { UseFormReturn } from "react-hook-form";
import type { RfqDetailsFormValues } from "@/app/rfq/rfq-details.schema";

export interface RfqSectionProps {
  isEditMode: boolean;
  form: UseFormReturn<RfqDetailsFormValues>;
}
