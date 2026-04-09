export interface ConversationCommandItem {
  id: string;
  label: string;
  description: string;
  notifies?: string;
  changesState?: boolean;
}

export interface ConversationCommandGroup {
  label: string;
  commands: ConversationCommandItem[];
}

export const COMMAND_GROUPS: ConversationCommandGroup[] = [
  {
    label: "Actions",
    commands: [
      { id: "@normalize-quote", label: "@normalize-quote", description: "Normalize seller quote", notifies: "CM" },
      { id: "@share-quote", label: "@share-quote", description: "Share quote with buyer", notifies: "Buyer" },
      { id: "@request-po", label: "@request-po", description: "Request PO from buyer", notifies: "Buyer" },
      { id: "@add-margin", label: "@add-margin", description: "Add margin to quote", notifies: "CM" },
    ],
  },
  {
    label: "Information",
    commands: [
      { id: "@show-summary", label: "@show-summary", description: "Show AI summary" },
      { id: "@show-timeline", label: "@show-timeline", description: "Show full timeline" },
      { id: "@show-quotes", label: "@show-quotes", description: "Display all quotes" },
    ],
  },
  {
    label: "State Changes",
    commands: [
      { id: "@change-state", label: "@change-state", description: "Change enquiry state", changesState: true, notifies: "Team" },
      { id: "@buyer-responding", label: "@buyer-responding", description: "Mark as buyer responding", changesState: true, notifies: "Buyer, Team" },
      { id: "@seller-quoting", label: "@seller-quoting", description: "Sellers are quoting", changesState: true, notifies: "Sellers, CM" },
      { id: "@quote-shared", label: "@quote-shared", description: "Quote shared with buyer", changesState: true, notifies: "Buyer" },
      { id: "@awaiting-po", label: "@awaiting-po", description: "Waiting for PO", changesState: true, notifies: "Buyer" },
      { id: "@po-received", label: "@po-received", description: "PO received", changesState: true, notifies: "CX, Team" },
      { id: "@cx-validated", label: "@cx-validated", description: "CX validated PO", changesState: true, notifies: "BDM, CM" },
      { id: "@convert-to-order", label: "@convert-to-order", description: "Convert to order", changesState: true, notifies: "All" },
    ],
  },
];

export const ALL_TAGGING_COMMANDS = [
  { id: "@bdm", label: "@bdm" },
  { id: "@cm", label: "@cm" },
  { id: "@cx", label: "@cx" },
];
