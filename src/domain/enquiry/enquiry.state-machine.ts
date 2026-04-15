/**
 * Enquiry State Machine
 * 
 * Defines the lifecycle states, transitions, and business rules for enquiries.
 */

/**
 * Enquiry lifecycle states
 */
export type EnquiryState =
  | "Draft"
  | "Awaiting Response"
  | "CM Responded"
  | "Pending Response"
  | "Converted to Order";

/**
 * State transition events
 */
export type EnquiryStateEvent =
  | "SUBMIT_REQUIREMENT"
  | "SUBMIT_RESPONSE"
  | "MARK_AS_WON"
  | "CM_CONFIRM_ORDER"
  | "RESET_TO_DRAFT";

/**
 * State transition map
 */
export const STATE_TRANSITIONS: Record<EnquiryState, Partial<Record<EnquiryStateEvent, EnquiryState>>> = {
  "Draft": {
    "SUBMIT_REQUIREMENT": "Awaiting Response",
  },
  "Awaiting Response": {
    "SUBMIT_RESPONSE": "CM Responded",
    "RESET_TO_DRAFT": "Draft",
  },
  "CM Responded": {
    "MARK_AS_WON": "Pending Response",
    "RESET_TO_DRAFT": "Draft",
  },
  "Pending Response": {
    "CM_CONFIRM_ORDER": "Converted to Order",
    "RESET_TO_DRAFT": "Draft",
  },
  "Converted to Order": {
    // Terminal state - no transitions
  },
};

/**
 * State machine interface
 */
export interface EnquiryStateMachine {
  currentState: EnquiryState;
  canTransition: (event: EnquiryStateEvent) => boolean;
  transition: (event: EnquiryStateEvent) => EnquiryState | null;
  getAvailableTransitions: () => EnquiryStateEvent[];
}

/**
 * Create a state machine instance for an enquiry
 */
export function createStateMachine(initialState: EnquiryState): EnquiryStateMachine {
  let currentState = initialState;

  return {
    currentState,

    canTransition(event: EnquiryStateEvent): boolean {
      const transitions = STATE_TRANSITIONS[currentState];
      return transitions ? event in transitions : false;
    },

    transition(event: EnquiryStateEvent): EnquiryState | null {
      const transitions = STATE_TRANSITIONS[currentState];
      if (!transitions || !(event in transitions)) {
        return null;
      }

      const nextState = transitions[event];
      if (nextState) {
        currentState = nextState;
        return nextState;
      }

      return null;
    },

    getAvailableTransitions(): EnquiryStateEvent[] {
      const transitions = STATE_TRANSITIONS[currentState];
      return transitions ? (Object.keys(transitions) as EnquiryStateEvent[]) : [];
    },
  };
}

/**
 * Business rules
 */

/**
 * Check if an enquiry is in draft state
 */
export const isDraft = (state: EnquiryState): boolean => {
  return state === "Draft";
};

/**
 * Check if an enquiry is awaiting CM response
 */
export const isAwaitingResponse = (state: EnquiryState): boolean => {
  return state === "Awaiting Response";
};

/**
 * Check if CM has submitted a response to BDM
 */
export const isCMResponded = (state: EnquiryState): boolean => {
  return state === "CM Responded";
};

/**
 * Check if an enquiry is pending order confirmation by CM
 */
export const isPendingResponse = (state: EnquiryState): boolean => {
  return state === "Pending Response";
};

/**
 * Check if an enquiry has been converted to order (terminal state)
 */
export const isConvertedToOrder = (state: EnquiryState): boolean => {
  return state === "Converted to Order";
};

/**
 * Check if a state is terminal (no further transitions)
 */
export const isTerminalState = (state: EnquiryState): boolean => {
  return isConvertedToOrder(state);
};

/**
 * Check if CM can convert enquiry to order
 */
export const canConvertToOrder = (state: EnquiryState): boolean => {
  return isPendingResponse(state);
};

/**
 * Check if a CM has been assigned (enquiry moved beyond Draft)
 */
export const hasCMAssigned = (state: EnquiryState): boolean => {
  return state !== "Draft";
};

const KNOWN_STATES: readonly EnquiryState[] = [
  "Draft",
  "Awaiting Response",
  "CM Responded",
  "Pending Response",
  "Converted to Order",
] as const;

const LEGACY_STATE_ALIASES: Record<string, EnquiryState> = {
  "Pending Approval": "Pending Response",
  "CM Tagged": "Awaiting Response",
  "Converted to order": "Converted to Order",
  "Buyer responding": "Awaiting Response",
  "Seller quoting": "Awaiting Response",
  "Quote shared": "CM Responded",
  "Awaiting PO": "CM Responded",
  "PO received": "Pending Response",
  "CX validated": "Pending Response",
  "New": "Draft",
  "In Progress": "Awaiting Response",
};

export const isKnownEnquiryState = (state: string): state is EnquiryState => {
  return (KNOWN_STATES as readonly string[]).includes(state);
};

/**
 * Maps legacy/variant states to the canonical lifecycle.
 */
export const normalizeEnquiryState = (state: string | EnquiryState): EnquiryState => {
  if (isKnownEnquiryState(state)) return state;
  return LEGACY_STATE_ALIASES[state] ?? "Draft";
};

/**
 * State display configuration
 */
export const STATE_CONFIG: Record<EnquiryState, {
  label: string;
  color: "gray" | "blue" | "green" | "yellow" | "orange" | "red";
  description: string;
}> = {
  "Draft": {
    label: "Draft",
    color: "gray",
    description: "BDM intake is created and editable",
  },
  "Awaiting Response": {
    label: "Awaiting Response",
    color: "blue",
    description: "Requirement submitted by BDM, CM to source and respond",
  },
  "CM Responded": {
    label: "CM Responded",
    color: "orange",
    description: "CM has submitted response, awaiting BDM mark as won",
  },
  "Pending Response": {
    label: "Pending Response",
    color: "yellow",
    description: "Marked won by BDM, awaiting CM order confirmation",
  },
  "Converted to Order": {
    label: "Converted to Order",
    color: "green",
    description: "Successfully converted to order",
  },
};

/**
 * Get display label for a state
 */
export const getStateLabel = (state: EnquiryState): string => {
  return STATE_CONFIG[state]?.label || state;
};

/**
 * Get color variant for a state
 */
export const getStateColor = (state: EnquiryState): string => {
  return STATE_CONFIG[state]?.color || "gray";
};

/**
 * Get description for a state
 */
export const getStateDescription = (state: EnquiryState): string => {
  return STATE_CONFIG[state]?.description || "";
};

/**
 * Validate state transition with role-based permissions
 */
export interface StateTransitionContext {
  enquiryState: EnquiryState;
  userRole: "BDM" | "CM" | "CX" | "Buyer" | "Seller";
  event: EnquiryStateEvent;
}

export function canPerformTransition(context: StateTransitionContext): boolean {
  const { userRole, event } = context;
  const enquiryState = normalizeEnquiryState(context.enquiryState);

  // Check if the transition is valid in the state machine
  const stateMachine = createStateMachine(enquiryState);
  if (!stateMachine.canTransition(event)) {
    return false;
  }

  // Role-based permission checks
  switch (event) {
    case "SUBMIT_REQUIREMENT":
      return userRole === "BDM";

    case "SUBMIT_RESPONSE":
      return userRole === "CM";

    case "MARK_AS_WON":
      return userRole === "BDM";

    case "CM_CONFIRM_ORDER":
      return userRole === "CM";

    case "RESET_TO_DRAFT":
      return userRole === "BDM" || userRole === "CM";

    default:
      return false;
  }
}
