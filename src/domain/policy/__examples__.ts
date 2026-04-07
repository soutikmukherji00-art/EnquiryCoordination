/**
 * Example: Using the Role Policy Enforcement System
 * 
 * This file demonstrates how to use the policy system to control
 * UI visibility, action permissions, and message attribution.
 */

import {
  isComponentVisible,
  isActionAllowed,
  canShareMessages,
  canTagMembers,
  resolveMessageDisplaySender,
  getVisibleComponents,
  getAllowedActions,
} from "@/domain/policy/policy.enforcement";
import { getPolicyForRole } from "@/domain/policy/policy.registry";
import { getPersonaById } from "@/domain/persona/persona.data";

/**
 * Example 1: Check component visibility
 */
export function exampleComponentVisibility() {
  console.log("\n=== Component Visibility ===");
  
  // Buyer can only see basic components
  console.log("Buyer can see ChatPanel:", isComponentVisible("Buyer", "ChatPanel")); // true
  console.log("Buyer can see SellerPanel:", isComponentVisible("Buyer", "SellerPanel")); // false
  console.log("Buyer can see AuditPanel:", isComponentVisible("Buyer", "AuditPanel")); // false
  
  // CM can see everything
  console.log("CM can see ChatPanel:", isComponentVisible("CM", "ChatPanel")); // true
  console.log("CM can see SellerPanel:", isComponentVisible("CM", "SellerPanel")); // true
  console.log("CM can see AuditPanel:", isComponentVisible("CM", "AuditPanel")); // true
}

/**
 * Example 2: Check action permissions
 */
export function exampleActionPermissions() {
  console.log("\n=== Action Permissions ===");
  
  // Buyer can only send messages
  console.log("Buyer can SEND_MESSAGE:", isActionAllowed("Buyer", "SEND_MESSAGE")); // true
  console.log("Buyer can SHARE_MESSAGE:", isActionAllowed("Buyer", "SHARE_MESSAGE")); // false
  console.log("Buyer can TAG_MEMBER:", isActionAllowed("Buyer", "TAG_MEMBER")); // false
  
  // CM can do everything
  console.log("CM can SEND_MESSAGE:", isActionAllowed("CM", "SEND_MESSAGE")); // true
  console.log("CM can SHARE_MESSAGE:", isActionAllowed("CM", "SHARE_MESSAGE")); // true
  console.log("CM can CONVERT_TO_ORDER:", isActionAllowed("CM", "CONVERT_TO_ORDER")); // true
  
  // BDM cannot convert to order
  console.log("BDM can CONVERT_TO_ORDER:", isActionAllowed("BDM", "CONVERT_TO_ORDER")); // false
}

/**
 * Example 3: Message policies
 */
export function exampleMessagePolicies() {
  console.log("\n=== Message Policies ===");
  
  // Check message capabilities by role
  console.log("Buyer can share:", canShareMessages("Buyer")); // false
  console.log("CM can share:", canShareMessages("CM")); // true
  
  console.log("Buyer can tag:", canTagMembers("Buyer")); // false
  console.log("CM can tag:", canTagMembers("CM")); // true
}

/**
 * Example 4: Message display attribution
 */
export function exampleMessageAttribution() {
  console.log("\n=== Message Attribution ===");
  
  const bdmPersona = getPersonaById("p_bdm_1");
  const cmPersona = getPersonaById("p_cm_1");
  
  if (!bdmPersona || !cmPersona) return;
  
  // Internal roles see persona names
  console.log(
    "CM viewing BDM message:",
    resolveMessageDisplaySender("CM", bdmPersona, "BDM", false)
  ); // "Amit Kumar"
  
  // External roles see "Birla Pivot" for internal messages
  console.log(
    "Buyer viewing BDM message:",
    resolveMessageDisplaySender("Buyer", bdmPersona, "BDM", false)
  ); // "Birla Pivot"
  
  console.log(
    "Buyer viewing CM message:",
    resolveMessageDisplaySender("Buyer", cmPersona, "CM", false)
  ); // "Birla Pivot"
  
  // Current user always sees "You"
  console.log(
    "Buyer viewing own message:",
    resolveMessageDisplaySender("Buyer", bdmPersona, "Buyer", true)
  ); // "You"
}

/**
 * Example 5: Get all visible components for a role
 */
export function exampleGetVisibleComponents() {
  console.log("\n=== Visible Components ===");
  
  const buyerComponents = getVisibleComponents("Buyer");
  console.log("Buyer can see:", buyerComponents);
  // ["ChatPanel", "MembersIndicator", "VoiceRecorder"]
  
  const cmComponents = getVisibleComponents("CM");
  console.log("CM can see:", cmComponents);
  // All components
}

/**
 * Example 6: Get all allowed actions for a role
 */
export function exampleGetAllowedActions() {
  console.log("\n=== Allowed Actions ===");
  
  const buyerActions = getAllowedActions("Buyer");
  console.log("Buyer can do:", buyerActions);
  // ["SEND_MESSAGE", "SEND_VOICE"]
  
  const cmActions = getAllowedActions("CM");
  console.log("CM can do:", cmActions);
  // All actions
}

/**
 * Example 7: Get complete policy for role
 */
export function exampleGetPolicy() {
  console.log("\n=== Complete Policy ===");
  
  const buyerPolicy = getPolicyForRole("Buyer");
  console.log("Buyer policy:", JSON.stringify(buyerPolicy, null, 2));
  
  const cmPolicy = getPolicyForRole("CM");
  console.log("CM policy:", JSON.stringify(cmPolicy, null, 2));
}

/**
 * Example 8: React component usage
 */
export function exampleReactUsage() {
  // In a React component:
  /*
  
  import {
    usePolicyContext,
    useComponentVisibility,
    useActionPermission,
    useMessagePolicy,
    usePermissions,
  } from '@/infrastructure';
  
  function ConversationActions() {
    // Check if share button should be visible
    const canShowShare = useComponentVisibility("ShareButton");
    const canShare = useActionPermission("SHARE_MESSAGE");
    
    // Get message display rules
    const { canTagMembers, resolveMessageSender } = useMessagePolicy();
    
    // Get common permissions
    const { canConvertToOrder, canManageMembers } = usePermissions();
    
    return (
      <div>
        {canShowShare && canShare && (
          <button>Share</button>
        )}
        
        {canTagMembers && (
          <button>Tag Member</button>
        )}
        
        {canConvertToOrder && (
          <button>Convert to Order</button>
        )}
        
        {canManageMembers && (
          <button>Add Member</button>
        )}
      </div>
    );
  }
  
  // Using HOC for conditional rendering
  import { withComponentPolicy, withActionPolicy } from '@/infrastructure';
  
  const ShareButton = withComponentPolicy(
    withActionPolicy(
      ({ onClick }) => <button onClick={onClick}>Share</button>,
      "SHARE_MESSAGE"
    ),
    "ShareButton"
  );
  
  // Message sender resolution
  function MessageItem({ message, currentPersonaId }) {
    const { resolveMessageSender } = useMessagePolicy();
    
    const senderPersona = getPersonaById(message.senderPersonaId);
    const displayName = resolveMessageSender(
      senderPersona,
      message.senderRole,
      message.senderPersonaId === currentPersonaId
    );
    
    return (
      <div>
        <strong>{displayName}</strong>: {message.text}
      </div>
    );
  }
  
  */
}

/**
 * Example 9: Persona switching (role remains constant)
 */
export function examplePersonaSwitching() {
  console.log("\n=== Persona Switching ===");
  
  // User switches between CM personas, but role stays CM
  const cm1 = getPersonaById("p_cm_1");
  const cm2 = getPersonaById("p_cm_2");
  
  if (!cm1 || !cm2) return;
  
  // Policy is based on role, not persona
  console.log("CM1 can share:", canShareMessages(cm1.role)); // true
  console.log("CM2 can share:", canShareMessages(cm2.role)); // true
  
  // Both have same permissions because same role
  console.log("CM1 actions:", getAllowedActions(cm1.role));
  console.log("CM2 actions:", getAllowedActions(cm2.role));
  // Same list
  
  // Only display name changes
  console.log("CM1 display:", cm1.displayName); // "Rohit Mehra"
  console.log("CM2 display:", cm2.displayName); // "Ananya Iyer"
}

/**
 * Example 10: Role switching (different policies)
 */
export function exampleRoleSwitching() {
  console.log("\n=== Role Switching ===");
  
  // User switches from BDM to CM role
  const bdmActions = getAllowedActions("BDM");
  const cmActions = getAllowedActions("CM");
  
  console.log("BDM actions count:", bdmActions.length);
  console.log("CM actions count:", cmActions.length);
  
  console.log("BDM can convert:", isActionAllowed("BDM", "CONVERT_TO_ORDER")); // false
  console.log("CM can convert:", isActionAllowed("CM", "CONVERT_TO_ORDER")); // true
  
  // Policies change instantly
  const bdmComponents = getVisibleComponents("BDM");
  const cmComponents = getVisibleComponents("CM");
  
  console.log("BDM sees ConvertButton:", bdmComponents.includes("ConvertButton")); // false
  console.log("CM sees ConvertButton:", cmComponents.includes("ConvertButton")); // true
}

// Run examples
if (typeof window === "undefined") {
  console.log("\n========================================");
  console.log("ROLE POLICY ENFORCEMENT EXAMPLES");
  console.log("========================================");
  
  exampleComponentVisibility();
  exampleActionPermissions();
  exampleMessagePolicies();
  exampleMessageAttribution();
  exampleGetVisibleComponents();
  exampleGetAllowedActions();
  exampleGetPolicy();
  examplePersonaSwitching();
  exampleRoleSwitching();
}
