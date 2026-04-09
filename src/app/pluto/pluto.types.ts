import type { Role } from "@/domain/enquiry/enquiry.types";

export type PlutoStateTone = "neutral" | "accent" | "warning" | "success";

export interface PlutoListItemViewModel {
  id: string;
  buyerName: string;
  status: string;
  stateTone: PlutoStateTone;
  ageLabel: string;
  lastActivityLabel: string;
  assignedCMName: string;
  valueLabel: string;
  categoriesLabel: string;
  summary: string;
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
}

export interface PlutoKpiCardViewModel {
  id: string;
  label: string;
  value: string;
  caption: string;
  tone: PlutoStateTone;
}

export interface PlutoDetailSectionConfig {
  id: string;
  title: string;
  description: string;
  fields: string[];
}

export interface PlutoRoleScreenConfig {
  role: Role;
  roleLabel: string;
  intro: string;
  emptyStateTitle: string;
  emptyStateBody: string;
  sections: PlutoDetailSectionConfig[];
}
