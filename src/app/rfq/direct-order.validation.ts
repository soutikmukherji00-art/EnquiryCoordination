import type { DirectOrderSummaryData } from "@/app/rfq/direct-order.flow";

export function getDirectOrderSummaryValidationErrors(
  data: DirectOrderSummaryData,
  cmOptions: Array<{ id: string; name: string }>,
): string[] {
  const errors: string[] = [];
  const hasCm = data.assignedCmId.trim().length > 0;
  const cmExists = hasCm && cmOptions.some((cm) => cm.id === data.assignedCmId);

  if (!data.buyerAccount.trim()) errors.push("Buyer Account is required.");
  if (data.lineItems.length === 0) errors.push("At least one line item is required.");
  if (!data.shippingAddress.trim()) errors.push("Shipping Address is required.");
  if (!data.billingAddress.trim()) errors.push("Billing Address is required.");
  if (!data.paymentTerms.trim()) errors.push("Payment Terms are required.");
  if (!data.incoterms.trim()) errors.push("INCOTERMS is required.");
  if (!hasCm) {
    errors.push("Assign Category Manager is required.");
  } else if (!cmExists) {
    errors.push("Assigned Category Manager is invalid.");
  }

  return errors;
}
