import type { Role } from "@/domain/enquiry/enquiry.types";

export type PlutoStateTone = "neutral" | "accent" | "warning" | "success";

export interface PlutoListItemViewModel {
  id: string;
  buyerName: string;
  status: string;
  stateTone: PlutoStateTone;
  ageLabel: string;
  lastActivityLabel: string;
  createdAtTime: number;
  assignedCMName: string;
  valueLabel: string;
  categoriesLabel: string;
  regionLabel: string;
  isNew: boolean;
  sourceBadge: "WhatsApp" | "Email" | "Website" | "Prism" | null;
  unreadCount: number;
  mentionCount: number;
}

export interface PlutoDetailHeaderViewModel {
  id: string;
  buyerName: string;
  status: string;
  stateTone: PlutoStateTone;
  assignedCMName: string;
  valueLabel: string;
  categoriesLabel: string;
  createdAtLabel: string;
  lastActivityLabel: string;
  
  // NEW — from EnquiryRecord
  gstin?: string;
  creditLimit?: string;
  openCreditLimit?: string;
  deliveryLocation?: string;
  paymentTerms?: string;
  etaDays?: string;
  notes?: string;
  isParentQuote?: boolean;
  primaryContactName?: string;
  /** Neutral provenance label (from EnquiryRecord.origin). */
  origin?: string;
}

export interface PlutoKpiCardViewModel {
  id: string;
  label: string;
  value: string;
  tone: PlutoStateTone;
}

export interface PlutoDetailSectionConfig {
  id: string;
  title: string;
  fields: string[];
}

export interface PlutoRoleScreenConfig {
  role: Role;
  emptyStateTitle: string;
  sections: PlutoDetailSectionConfig[];
}
