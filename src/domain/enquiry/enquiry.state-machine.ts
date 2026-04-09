/**
 * Enquiry State Machine
 * 
 * Defines the lifecycle states, transitions, and business rules for enquiries.
 */

/**
 * Enquiry lifecycle states (Revised)
 */
export type EnquiryState =
  | "Draft"
  | "Pending Response"
  | "Pending Approval"
  | "Converted to Order";

/**
 * State transition events
 */
export type EnquiryStateEvent =
  | "CM_TAGGED"          // BDM tags a CM
  | "BDM_REQUEST_APPROVAL"
  | "CX_CONVERT_ORDER"   // CX runs command to convert to order
  | "RESET_TO_DRAFT";    // Manual reset (for future use)

/**
 * State transition map
 */
export const STATE_TRANSITIONS: Record<EnquiryState, Partial<Record<EnquiryStateEvent, EnquiryState>>> = {
  "Draft": {
    "CM_TAGGED": "Pending Response",
  },
  "Pending Response": {
    "BDM_REQUEST_APPROVAL": "Pending Approval",
    "CX_CONVERT_ORDER": "Converted to Order",
    "RESET_TO_DRAFT": "Draft",
  },
  "Pending Approval": {
    "CX_CONVERT_ORDER": "Converted to Order",
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
 * Check if an enquiry is awaiting response
 */
export const isPendingResponse = (state: EnquiryState): boolean => {
  return state === "Pending Response";
};

export const isPendingApproval = (state: EnquiryState): boolean => {
  return state === "Pending Approval";
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
 * Check if CX can convert enquiry to order
 */
export const canConvertToOrder = (state: EnquiryState): boolean => {
  return isPendingResponse(state) || isPendingApproval(state);
};

/**
 * Check if a CM has been assigned (enquiry moved beyond Draft)
 */
export const hasCMAssigned = (state: EnquiryState): boolean => {
  return state !== "Draft";
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
    description: "Enquiry created, awaiting CM assignment",
  },
  "Pending Response": {
    label: "Pending Response",
    color: "gray", // Changed from orange to gray
    description: "CM assigned, awaiting seller response",
  },
  "Pending Approval": {
    label: "Pending Approval",
    color: "orange",
    description: "Awaiting CM approval before CX handoff",
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
  const { enquiryState, userRole, event } = context;

  // Check if the transition is valid in the state machine
  const stateMachine = createStateMachine(enquiryState);
  if (!stateMachine.canTransition(event)) {
    return false;
  }

  // Role-based permission checks
  switch (event) {
    case "CM_TAGGED":
      // Only BDM can tag a CM
      return userRole === "BDM";

    case "BDM_REQUEST_APPROVAL":
      return userRole === "BDM";
    
    case "CX_CONVERT_ORDER":
      // Only CX can convert to order
      return userRole === "CX";
    
    case "RESET_TO_DRAFT":
      // Only BDM or CX can reset
      return userRole === "BDM" || userRole === "CX";
    
    default:
      return false;
  }
}
