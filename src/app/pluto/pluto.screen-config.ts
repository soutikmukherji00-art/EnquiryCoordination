import type { Role } from "@/domain/enquiry/enquiry.types";
import type { PlutoRoleScreenConfig } from "./pluto.types";

export const PLUTO_ROLE_SCREEN_CONFIG: Record<Role, PlutoRoleScreenConfig> = {
  BDM: {
    role: "BDM",
    emptyStateTitle: "Pick an enquiry",
    sections: [
      {
        id: "buyer-intent",
        title: "Buyer Intent",
        fields: ["Buyer requirement summary", "Need-by date", "Decision context"],
      },
      {
        id: "commercial-scope",
        title: "Commercial Scope",
        fields: ["Indicative value", "Category scope", "Commercial notes"],
      },
      {
        id: "handoff",
        title: "Team Handoff",
        fields: ["Primary CM owner", "Follow-up checklist", "Buyer-facing next step"],
      },
    ],
  },
  CM: {
    role: "CM",
    emptyStateTitle: "Pick an enquiry",
    sections: [
      {
        id: "sourcing-plan",
        title: "Sourcing Plan",
        fields: ["Supply strategy", "Target sellers", "Lead time risks"],
      },
      {
        id: "quotation-stack",
        title: "Quotation Stack",
        fields: ["Quote snapshot", "Negotiation notes", "Recommendation"],
      },
      {
        id: "approval-readiness",
        title: "Approval Readiness",
        fields: ["Approval blockers", "Document checklist", "Escalation notes"],
      },
    ],
  },
  CX: {
    role: "CX",
    emptyStateTitle: "Pick an enquiry",
    sections: [
      {
        id: "ops-checks",
        title: "Ops Checks",
        fields: ["Delivery readiness", "Service dependencies", "Exception log"],
      },
      {
        id: "validation",
        title: "Validation",
        fields: ["Credit validation", "Policy checks", "Operational sign-off"],
      },
      {
        id: "customer-closeout",
        title: "Customer Closeout",
        fields: ["Buyer update", "Issue watchlist", "Post-confirmation handoff"],
      },
    ],
  },
  Buyer: {
    role: "Buyer",
    emptyStateTitle: "Pick an enquiry",
    sections: [
      {
        id: "requirement-summary",
        title: "Requirement Summary",
        fields: ["Requested materials", "Required by", "Project notes"],
      },
      {
        id: "commercial-alignment",
        title: "Commercial Alignment",
        fields: ["Budget indication", "Quote status", "Commercial comments"],
      },
      {
        id: "documents",
        title: "Documents",
        fields: ["Shared documents", "Pending inputs", "Confirmation status"],
      },
    ],
  },
  Seller: {
    role: "Seller",
    emptyStateTitle: "No enquiries available",
    sections: [
      {
        id: "quote-brief",
        title: "Quote Brief",
        fields: ["Material brief", "Capacity notes", "Quote commitment"],
      },
    ],
  },
};
