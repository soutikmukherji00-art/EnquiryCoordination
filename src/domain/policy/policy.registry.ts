/**
 * Domain: Role Policy Registry
 * 
 * Single source of truth for role policies.
 * All role-based rules are declared here.
 */

import { Role } from "../enquiry/enquiry.types";
import { RolePolicy } from "./policy.types";

/**
 * Policy Registry
 * Defines what each role can see and do
 */
export const ROLE_POLICIES: Record<Role, RolePolicy> = {
  /**
   * BDM (Business Development Manager)
   * - Internal team member
   * - Can see all channels and members
   * - Can share messages and tag members
   * - Full access to internal tools
   */
  BDM: {
    role: "BDM",
    visibleComponents: [
      "ChatPanel",
      "MembersIndicator",
      "MembersPanel",
      "SellerPanel",
      "AuditEntry",
      "AuditPanel",
      "ChannelSidebar",
      "ShareButton",
      "TagButton",
      "AddMemberButton",
      "VoiceRecorder",
      "SearchBar",
      "StateSelector",
    ],
    allowedActions: [
      "SEND_MESSAGE",
      "SEND_VOICE",
      "SHARE_MESSAGE",
      "SHARE_TO_INTERNAL",
      "SHARE_TO_EXTERNAL",
      "SHARE_TO_DM",
      "CREATE_ENQUIRY_FROM_SHARE",
      "TAG_MEMBER",
      "ADD_MEMBER",
      "CHANGE_STATE",
      "VIEW_AUDIT",
      "EDIT_MESSAGE",
    ],
    messageRules: {
      displaySenderAs: "persona",
      allowSharing: true,
      allowTagging: true,
      allowEditing: true,
    },
  },

  /**
   * CM (Category Manager)
   * - Internal team member
   * - Primary coordinator for enquiries
   * - Can convert to orders
   * - Full access to all features
   */
  CM: {
    role: "CM",
    visibleComponents: [
      "ChatPanel",
      "MembersIndicator",
      "MembersPanel",
      "SellerPanel",
      "AuditEntry",
      "AuditPanel",
      "ChannelSidebar",
      "ConvertButton",
      "ShareButton",
      "TagButton",
      "AddMemberButton",
      "VoiceRecorder",
      "SearchBar",
      "StateSelector",
    ],
    allowedActions: [
      "SEND_MESSAGE",
      "SEND_VOICE",
      "SHARE_MESSAGE",
      "SHARE_TO_INTERNAL",
      "SHARE_TO_EXTERNAL",
      "SHARE_TO_DM",
      "TAG_MEMBER",
      "ADD_MEMBER",
      "REMOVE_MEMBER",
      "CONVERT_TO_ORDER",
      "CHANGE_STATE",
      "CREATE_SELLER_CHANNEL",
      "VIEW_AUDIT",
      "EDIT_MESSAGE",
    ],
    messageRules: {
      displaySenderAs: "persona",
      allowSharing: true,
      allowTagging: true,
      allowEditing: true,
    },
  },

  /**
   * CX (Customer Experience)
   * - Internal team member
   * - Can validate and convert orders
   * - Full visibility but focused on quality
   */
  CX: {
    role: "CX",
    visibleComponents: [
      "ChatPanel",
      "MembersIndicator",
      "MembersPanel",
      "SellerPanel",
      "AuditEntry",
      "AuditPanel",
      "ChannelSidebar",
      "ConvertButton",
      "ShareButton",
      "TagButton",
      "VoiceRecorder",
      "SearchBar",
      "StateSelector",
    ],
    allowedActions: [
      "SEND_MESSAGE",
      "SEND_VOICE",
      "SHARE_MESSAGE",
      "SHARE_TO_INTERNAL",
      "TAG_MEMBER",
      "CONVERT_TO_ORDER",
      "CHANGE_STATE",
      "VIEW_AUDIT",
      "EDIT_MESSAGE",
    ],
    messageRules: {
      displaySenderAs: "persona",
      allowSharing: true,
      allowTagging: true,
      allowEditing: true,
    },
  },

  /**
   * Buyer
   * - External customer
   * - Simplified chat-first interface
   * - Can share messages to cross-type groups
   * - Messages appear to come from "Birla Pivot" company
   */
  Buyer: {
    role: "Buyer",
    visibleComponents: [
      "ChatPanel",
      "MembersIndicator",
      "ShareButton",
      "VoiceRecorder",
    ],
    allowedActions: [
      "SEND_MESSAGE",
      "SEND_VOICE",
      "SHARE_MESSAGE",
      "SHARE_TO_INTERNAL",
    ],
    messageRules: {
      displaySenderAs: "company", // Messages from team appear as "Birla Pivot"
      allowSharing: true,
      allowTagging: false,
      allowEditing: false,
    },
  },

  /**
   * Seller
   * - External vendor
   * - Simplified chat-first interface
   * - Can share messages to cross-type groups
   * - Messages appear to come from "Birla Pivot" company
   */
  Seller: {
    role: "Seller",
    visibleComponents: [
      "ChatPanel",
      "MembersIndicator",
      "ShareButton",
      "VoiceRecorder",
    ],
    allowedActions: [
      "SEND_MESSAGE",
      "SEND_VOICE",
      "SHARE_MESSAGE",
      "SHARE_TO_INTERNAL",
    ],
    messageRules: {
      displaySenderAs: "company", // Messages from team appear as "Birla Pivot"
      allowSharing: true,
      allowTagging: false,
      allowEditing: false,
    },
  },
};

/**
 * Get policy for a role
 */
export const getPolicyForRole = (role: Role): RolePolicy => {
  return ROLE_POLICIES[role];
};

/**
 * Check if role is internal team member
 */
export const isInternalRole = (role: Role): boolean => {
  return role === "BDM" || role === "CM" || role === "CX";
};

/**
 * Check if role is external party
 */
export const isExternalRole = (role: Role): boolean => {
  return role === "Buyer" || role === "Seller";
};

/**
 * Get all internal roles
 */
export const getInternalRoles = (): Role[] => {
  return ["BDM", "CM", "CX"];
};

/**
 * Get all external roles
 */
export const getExternalRoles = (): Role[] => {
  return ["Buyer", "Seller"];
};