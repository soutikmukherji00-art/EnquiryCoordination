import { z } from "zod";

export interface RfqOption {
  value: string;
  label: string;
}

export const RM_OPTIONS: RfqOption[] = [
  { value: "aarya-shah", label: "Aarya Shah" },
  { value: "kartik-singh", label: "Kartik Singh" },
  { value: "riya-sen", label: "Riya Sen" },
];

export const CM_OPTIONS: RfqOption[] = [
  { value: "mohit-jain", label: "Mohit Jain" },
  { value: "khushi-iyer", label: "Khushi Iyer" },
  { value: "vansh-bedi", label: "Vansh Bedi" },
];

export const SELLER_OPTIONS: RfqOption[] = [
  { value: "seller-alpha", label: "Alpha Metals Pvt Ltd" },
  { value: "seller-beta", label: "Beta Alloys LLP" },
  { value: "seller-gamma", label: "Gamma Steel Works" },
];

export const WAREHOUSE_OPTIONS_BY_SELLER: Record<string, RfqOption[]> = {
  "seller-alpha": [
    { value: "alpha-vasai", label: "Vasai Warehouse" },
    { value: "alpha-bhiwandi", label: "Bhiwandi Warehouse" },
  ],
  "seller-beta": [
    { value: "beta-taloja", label: "Taloja Hub" },
    { value: "beta-kalamboli", label: "Kalamboli Dispatch Point" },
  ],
  "seller-gamma": [
    { value: "gamma-pune", label: "Pune Central Warehouse" },
    { value: "gamma-chakan", label: "Chakan Yard" },
  ],
};

export const ENHANCER_OPTIONS: RfqOption[] = [
  { value: "none", label: "None" },
  { value: "bg", label: "Bank Guarantee" },
  { value: "lc", label: "Letter of Credit" },
];

export const PAYMENT_TERM_OPTIONS: RfqOption[] = [
  { value: "advance", label: "100% Advance" },
  { value: "30-days", label: "30 Days Credit" },
  { value: "45-days", label: "45 Days Credit" },
];

export const LOGISTICS_OPTIONS: RfqOption[] = [
  { value: "buyer-arranged", label: "Buyer Arranged" },
  { value: "seller-arranged", label: "Seller Arranged" },
  { value: "third-party", label: "Third Party Logistics" },
];

export const lineItemSchema = z.object({
  id: z.string().min(1),
  productName: z.string().trim().min(1, "Product name is required"),
  quantity: z.coerce.number().min(1, "Qty must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative"),
  cnToBuyer: z.boolean(),
  cnFromSeller: z.boolean(),
});

export const rfqDetailsSchema = z
  .object({
    rfqNumber: z.string().trim().min(1, "RFQ number is required"),
    buyerName: z.string().trim().min(1, "Buyer name is required"),
    ticketReference: z.string().trim().optional(),
    dependencyReason: z.string().trim().optional(),
    isSez: z.boolean(),
    rmName: z.string().trim().min(1, "RM Name is required"),
    cmName: z.string().trim().min(1, "CM Name is required"),
    marginDays: z.coerce.number().min(0, "Margin days cannot be negative"),
    enhancerType: z.string().trim().min(1, "Enhancer type is required"),
    rateOfInterest: z.coerce.number().min(0, "Rate of interest cannot be negative"),
    paymentTerms: z.string().trim().min(1, "Payment terms are required"),
    quoteDeliveryEta: z.string().trim().min(1, "Quote delivery ETA is required"),
    billingAddress: z.string().trim().min(1, "Billing address is required"),
    poNumber: z.string().trim().optional(),
    poDate: z.string().trim().optional(),
    poDocumentName: z.string().trim().optional(),
    scopeOfUnloading: z.string().trim().optional(),
    parentQuote: z.string().trim().optional(),
    remarks: z.string().trim().optional(),
    invoiceTerms: z.string().trim().optional(),
    buyerShippingAddress: z.string().trim().min(1, "Buyer shipping address is required"),
    sellerId: z.string().trim().min(1, "Seller is required"),
    warehouseId: z.string().trim().min(1, "Warehouse is required"),
    logisticsMode: z.string().trim().min(1, "Logistics mode is required"),
    programFlag: z.boolean(),
    lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  })
  .superRefine((values, ctx) => {
    const warehouses = WAREHOUSE_OPTIONS_BY_SELLER[values.sellerId] ?? [];
    const isWarehouseValid = warehouses.some(
      (warehouse) => warehouse.value === values.warehouseId,
    );
    if (!isWarehouseValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["warehouseId"],
        message: "Select a warehouse mapped to the selected seller",
      });
    }
  });

export type RfqLineItemFormValue = z.infer<typeof lineItemSchema>;
export type RfqDetailsFormValues = z.infer<typeof rfqDetailsSchema>;

export function canSendForApproval(
  values: RfqDetailsFormValues,
  isDirty: boolean,
  isValid: boolean,
): boolean {
  if (!isDirty || !isValid) {
    return false;
  }

  if (!values.rmName || !values.cmName) {
    return false;
  }

  return true;
}
