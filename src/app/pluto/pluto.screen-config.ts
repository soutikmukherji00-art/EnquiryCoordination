import type { Role } from "@/domain/enquiry/enquiry.types";
import type { PlutoRoleScreenConfig } from "./pluto.types";

export const PLUTO_ROLE_SCREEN_CONFIG: Record<Role, PlutoRoleScreenConfig> = {
  BDM: {
    role: "BDM",
    roleLabel: "Business Development",
    intro:
      "Use Pluto to turn enquiry threads into structured intake, commercials, and handoff checkpoints.",
    emptyStateTitle: "Pick an enquiry to start qualifying it",
    emptyStateBody:
      "The structured shell will mirror the same enquiry state as Prism, but in a form-led layout for fast qualification.",
    sections: [
      {
        id: "buyer-intent",
        title: "Buyer Intent",
        description:
          "Capture the business need, urgency, and context already shared in Prism conversations.",
        fields: ["Buyer requirement summary", "Need-by date", "Decision context"],
      },
      {
        id: "commercial-scope",
        title: "Commercial Scope",
        description:
          "Stage the value, product mix, and commercial asks before the sourcing team picks it up.",
        fields: ["Indicative value", "Category scope", "Commercial notes"],
      },
      {
        id: "handoff",
        title: "Team Handoff",
        description:
          "Make the next owner and downstream actions explicit without leaving the shared enquiry record.",
        fields: ["Primary CM owner", "Follow-up checklist", "Buyer-facing next step"],
      },
    ],
  },
  CM: {
    role: "CM",
    roleLabel: "Category Manager",
    intro:
      "Pluto gives CMs a sourcing-oriented shell over the same enquiry and permission model used in Prism.",
    emptyStateTitle: "Open an enquiry to review sourcing structure",
    emptyStateBody:
      "This placeholder is where seller outreach, pricing structure, and commercial validation will diverge by role.",
    sections: [
      {
        id: "sourcing-plan",
        title: "Sourcing Plan",
        description:
          "Document the category strategy and supply plan for the selected enquiry.",
        fields: ["Supply strategy", "Target sellers", "Lead time risks"],
      },
      {
        id: "quotation-stack",
        title: "Quotation Stack",
        description:
          "Hold placeholder slots for quote comparison, negotiated numbers, and recommendation logic.",
        fields: ["Quote snapshot", "Negotiation notes", "Recommendation"],
      },
      {
        id: "approval-readiness",
        title: "Approval Readiness",
        description:
          "Keep structured checkpoints aligned with the same workflow state and team permissions.",
        fields: ["Approval blockers", "Document checklist", "Escalation notes"],
      },
    ],
  },
  CX: {
    role: "CX",
    roleLabel: "Customer Experience",
    intro:
      "CX sees the same enquiry universe, with a shell focused on validation, operations, and readiness to convert.",
    emptyStateTitle: "Choose an enquiry to review downstream readiness",
    emptyStateBody:
      "Future Pluto flows for CX can diverge without branching the rest of the module shell.",
    sections: [
      {
        id: "ops-checks",
        title: "Ops Checks",
        description:
          "Track fulfilment, documentation, and servicing risks before final confirmation.",
        fields: ["Delivery readiness", "Service dependencies", "Exception log"],
      },
      {
        id: "validation",
        title: "Validation",
        description:
          "Structure the checks CX needs before the order is treated as ready.",
        fields: ["Credit validation", "Policy checks", "Operational sign-off"],
      },
      {
        id: "customer-closeout",
        title: "Customer Closeout",
        description:
          "Reserve space for proactive buyer communication and issue resolution planning.",
        fields: ["Buyer update", "Issue watchlist", "Post-confirmation handoff"],
      },
    ],
  },
  Buyer: {
    role: "Buyer",
    roleLabel: "Buyer",
    intro:
      "Buyer-facing Pluto is a structured summary of the same enquiries the buyer can already access in Prism.",
    emptyStateTitle: "Select one of your enquiries",
    emptyStateBody:
      "This placeholder will evolve into a form-style progress view without creating a second enquiry record.",
    sections: [
      {
        id: "requirement-summary",
        title: "Requirement Summary",
        description:
          "A structured mirror of what the buyer has asked for and what the team is currently processing.",
        fields: ["Requested materials", "Required by", "Project notes"],
      },
      {
        id: "commercial-alignment",
        title: "Commercial Alignment",
        description:
          "Placeholder space for terms, value, and negotiation checkpoints when exposed externally.",
        fields: ["Budget indication", "Quote status", "Commercial comments"],
      },
      {
        id: "documents",
        title: "Documents",
        description:
          "Future space for PO, attachments, and acknowledgement milestones.",
        fields: ["Shared documents", "Pending inputs", "Confirmation status"],
      },
    ],
  },
  Seller: {
    role: "Seller",
    roleLabel: "Seller",
    intro:
      "Seller Pluto stays permission-safe: if a seller has no enquiry access in Prism, the Pluto enquiry list remains empty too.",
    emptyStateTitle: "No Pluto enquiries available for this seller persona",
    emptyStateBody:
      "When seller-facing structured flows are introduced, they will still be derived from the same shared policy and enquiry state.",
    sections: [
      {
        id: "quote-brief",
        title: "Quote Brief",
        description:
          "Future seller structure for requirements, pricing, and constraints.",
        fields: ["Material brief", "Capacity notes", "Quote commitment"],
      },
    ],
  },
};
