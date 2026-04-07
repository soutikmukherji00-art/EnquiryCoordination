/**
 * Example: Using the Enquiry + Members Reducer System
 * 
 * This file demonstrates how to use the new reducer-based
 * enquiry and membership system according to the specification.
 */

import {
  EnquiryStateStore,
  enquiryReducer,
  initialEnquiryState,
} from "@/domain/enquiry/enquiry.reducer";
import {
  createEnquiryWithCreator,
  addPersonaAsMember,
  assignPrimaryCM,
  assignRegion,
  autoAssignCMByRegion,
} from "@/domain/enquiry/enquiry.utils";
import {
  selectMembers,
  selectPrimaryCM,
  selectVisibleMembers,
  selectMemberCount,
} from "@/domain/enquiry/enquiry.selectors";
import { getPersonasByRole } from "@/domain/persona/persona.data";

/**
 * Example 1: Create enquiry with BDM as creator
 */
export function exampleCreateEnquiry() {
  let state: EnquiryStateStore = initialEnquiryState;

  // Create enquiry with BDM as creator
  const events = createEnquiryWithCreator(
    "enq_001",
    "p_bdm_1", // BDM persona
    "North",
    "Ramesh Industries"
  );

  // Apply events
  events.forEach((event) => {
    state = enquiryReducer(state, event);
  });

  console.log("After creation:");
  console.log("Members:", selectMembers(state, "enq_001"));
  console.log("Member count:", selectMemberCount(state, "enq_001"));
  // Output: 1 member (the BDM creator)

  return state;
}

/**
 * Example 2: Add CM and assign as primary
 */
export function exampleAddCMAndAssignPrimary() {
  let state = exampleCreateEnquiry();

  // Add CM as member
  const addCMEvent = addPersonaAsMember("enq_001", "p_cm_1");
  state = enquiryReducer(state, addCMEvent);

  console.log("After adding CM:");
  console.log("Members:", selectMembers(state, "enq_001"));
  console.log("Member count:", selectMemberCount(state, "enq_001"));
  // Output: 2 members (BDM + CM)

  // Get CM member ID
  const members = selectMembers(state, "enq_001");
  const cmMember = members.find((m) => m.role === "CM");

  if (cmMember) {
    // Assign as primary CM
    const assignPrimaryEvent = assignPrimaryCM("enq_001", cmMember.id);
    state = enquiryReducer(state, assignPrimaryEvent);

    console.log("After assigning primary CM:");
    console.log("Primary CM:", selectPrimaryCM(state, "enq_001"));
    // Output: CM member with isPrimaryCM: true
  }

  return state;
}

/**
 * Example 3: Add multiple members
 */
export function exampleAddMultipleMembers() {
  let state = exampleCreateEnquiry();

  // Add CM
  state = enquiryReducer(state, addPersonaAsMember("enq_001", "p_cm_1"));

  // Add another CM
  state = enquiryReducer(state, addPersonaAsMember("enq_001", "p_cm_2"));

  // Add CX
  state = enquiryReducer(state, addPersonaAsMember("enq_001", "p_cx_1"));

  // Add buyer
  state = enquiryReducer(state, addPersonaAsMember("enq_001", "p_buyer_1"));

  console.log("After adding multiple members:");
  console.log("All members:", selectMembers(state, "enq_001"));
  console.log("Member count:", selectMemberCount(state, "enq_001"));
  // Output: 5 members (BDM + 2 CMs + CX + Buyer)

  return state;
}

/**
 * Example 4: Role-based visibility
 */
export function exampleRoleBasedVisibility() {
  let state = exampleAddMultipleMembers();

  // Add sellers
  state = enquiryReducer(state, addPersonaAsMember("enq_001", "p_seller_1"));
  state = enquiryReducer(state, addPersonaAsMember("enq_001", "p_seller_2"));

  console.log("All members:", selectMembers(state, "enq_001"));
  console.log("Total count:", selectMemberCount(state, "enq_001"));
  // Output: 7 members

  // What CM sees (all members)
  const cmView = selectVisibleMembers(state, "enq_001", "CM");
  console.log("CM sees:", cmView);
  // Output: All 7 members

  // What Buyer sees (no sellers)
  const buyerView = selectVisibleMembers(state, "enq_001", "Buyer");
  console.log("Buyer sees:", buyerView);
  // Output: 5 members (no sellers)

  // What Seller sees (no other sellers)
  const sellerView = selectVisibleMembers(state, "enq_001", "Seller");
  console.log("Seller sees:", sellerView);
  // Output: 5 members (no other sellers)

  return state;
}

/**
 * Example 5: Auto-assign CM by region
 */
export function exampleAutoAssignCMByRegion() {
  let state = exampleCreateEnquiry();

  // Add available CMs
  const cmPersonas = getPersonasByRole("CM");
  cmPersonas.forEach((persona) => {
    const event = addPersonaAsMember("enq_001", persona.id);
    state = enquiryReducer(state, event);
  });

  // Auto-assign based on region
  const members = selectMembers(state, "enq_001");
  const cmMembers = members.filter((m) => m.role === "CM");
  const assignEvent = autoAssignCMByRegion("enq_001", "North", cmMembers);

  if (assignEvent) {
    state = enquiryReducer(state, assignEvent);
    console.log("Auto-assigned primary CM:", selectPrimaryCM(state, "enq_001"));
  }

  return state;
}

/**
 * Example 6: Region assignment triggers CM assignment
 */
export function exampleRegionWorkflow() {
  let state: EnquiryStateStore = initialEnquiryState;

  // Create enquiry without region
  const events = createEnquiryWithCreator(
    "enq_002",
    "p_bdm_1",
    undefined, // No region yet
    "Global Manufacturing"
  );

  events.forEach((event) => {
    state = enquiryReducer(state, event);
  });

  // Add CMs
  const cmPersonas = getPersonasByRole("CM");
  cmPersonas.forEach((persona) => {
    const event = addPersonaAsMember("enq_002", persona.id);
    state = enquiryReducer(state, event);
  });

  console.log("Before region assignment:");
  console.log("Primary CM:", selectPrimaryCM(state, "enq_002"));
  // Output: undefined

  // Assign region
  const regionEvent = assignRegion("enq_002", "South");
  state = enquiryReducer(state, regionEvent);

  // Auto-assign CM (would be triggered by side effect in real app)
  const members = selectMembers(state, "enq_002");
  const cmMembers = members.filter((m) => m.role === "CM");
  const assignEvent = autoAssignCMByRegion("enq_002", "South", cmMembers);

  if (assignEvent) {
    state = enquiryReducer(state, assignEvent);
  }

  console.log("After region assignment and auto-CM:");
  console.log("Region:", state.enquiries["enq_002"]?.region);
  console.log("Primary CM:", selectPrimaryCM(state, "enq_002"));
  // Output: CM assigned based on South region

  return state;
}

/**
 * Example 7: Using in React components
 */
export function exampleReactUsage() {
  // In a React component:
  /*
  
  import { useEnquiryMembers, useEnquiryDispatch } from '@/infrastructure';
  import { addPersonaAsMember } from '@/domain';
  
  function EnquiryMembersPanel({ enquiryId, currentRole }) {
    // Read members (filtered by role)
    const { visibleMembers, primaryCM, memberCount } = useEnquiryMembers(
      enquiryId,
      currentRole
    );
    
    // Get dispatch function
    const dispatch = useEnquiryDispatch();
    
    // Add member handler
    const handleAddMember = (personaId: string) => {
      const event = addPersonaAsMember(enquiryId, personaId);
      dispatch(event);
    };
    
    return (
      <div>
        <h3>Members ({memberCount})</h3>
        
        {primaryCM && (
          <div>Primary CM: {primaryCM.personaId}</div>
        )}
        
        <ul>
          {visibleMembers.map((member) => (
            <li key={member.id}>
              {member.personaId} - {member.role}
              {member.isPrimaryCM && ' (Primary)'}
            </li>
          ))}
        </ul>
        
        <button onClick={() => handleAddMember('p_cm_1')}>
          Add CM
        </button>
      </div>
    );
  }
  
  */
}

// Run examples
if (typeof window === "undefined") {
  // Only run in Node.js, not browser
  console.log("\n=== Example 1: Create Enquiry ===");
  exampleCreateEnquiry();

  console.log("\n=== Example 2: Add CM and Assign Primary ===");
  exampleAddCMAndAssignPrimary();

  console.log("\n=== Example 3: Add Multiple Members ===");
  exampleAddMultipleMembers();

  console.log("\n=== Example 4: Role-Based Visibility ===");
  exampleRoleBasedVisibility();

  console.log("\n=== Example 5: Auto-Assign CM by Region ===");
  exampleAutoAssignCMByRegion();

  console.log("\n=== Example 6: Region Workflow ===");
  exampleRegionWorkflow();
}
