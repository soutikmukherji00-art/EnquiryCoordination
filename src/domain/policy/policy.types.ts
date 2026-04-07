/**
 * Domain: Role Policy Types
 * 
 * Declarative policy system for role-based access control.
 * Policies control UI visibility, action availability, and message attribution.
 */

import { Role } from "../enquiry/enquiry.types";

/**
 * Component identifiers for visibility control
 */
export type ComponentId =
  | "ChatPanel"
  | "MembersIndicator"
  | "MembersPanel"
  | "SellerPanel"
  | "AuditEntry"
  | "AuditPanel"
  | "ChannelSidebar"
  | "ConvertButton"
  | "ShareButton"
  | "TagButton"
  | "AddMemberButton"
  | "VoiceRecorder"
  | "SearchBar"
  | "StateSelector";

/**
 * Action identifiers for permission control
 */
export type ActionId =
  | "SEND_MESSAGE"
  | "SEND_VOICE"
  | "SHARE_MESSAGE"
  | "SHARE_TO_INTERNAL"
  | "SHARE_TO_EXTERNAL"
  | "SHARE_TO_DM"
  | "CREATE_ENQUIRY_FROM_SHARE"
  | "TAG_MEMBER"
  | "ADD_MEMBER"
  | "REMOVE_MEMBER"
  | "CONVERT_TO_ORDER"
  | "CHANGE_STATE"
  | "CREATE_SELLER_CHANNEL"
  | "VIEW_AUDIT"
  | "EDIT_MESSAGE"
  | "DELETE_MESSAGE";

/**
 * Message display strategy
 */
export type MessageDisplayStrategy =
  | "persona"    // Show persona name (e.g., "John Smith")
  | "company"    // Show company name (e.g., "Birla Pivot")
  | "masked";    // Show generic label (e.g., "Seller")

/**
 * Message attribution rules for a role
 */
export interface MessagePolicy {
  displaySenderAs: MessageDisplayStrategy;
  allowSharing: boolean;
  allowTagging: boolean;
  allowEditing: boolean;
}

/**
 * Complete policy for a role
 */
export interface RolePolicy {
  role: Role;
  visibleComponents: ComponentId[];
  allowedActions: ActionId[];
  messageRules: MessagePolicy;
}

/**
 * Policy evaluation context
 */
export interface PolicyContext {
  role: Role;
  enquiryId?: string;
  currentPersonaId?: string;
}
