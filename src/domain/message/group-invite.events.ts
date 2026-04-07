/**
 * Group Invite Events
 * 
 * Events for group invitation lifecycle
 */

import { GroupInvite, InviteAcceptance, InviteRejection } from "./group-invite.types";

/**
 * INVITE_SENT - When an invite is sent to an external user
 */
export interface InviteSentEvent {
  type: "INVITE_SENT";
  payload: {
    invite: GroupInvite;
    timestamp: Date;
  };
}

/**
 * INVITE_ACCEPTED - When an external user accepts a group invite
 */
export interface InviteAcceptedEvent {
  type: "INVITE_ACCEPTED";
  payload: {
    acceptance: InviteAcceptance;
    invite: GroupInvite;
    timestamp: Date;
  };
}

/**
 * INVITE_REJECTED - When an external user rejects a group invite
 */
export interface InviteRejectedEvent {
  type: "INVITE_REJECTED";
  payload: {
    rejection: InviteRejection;
    invite: GroupInvite;
    timestamp: Date;
  };
}

/**
 * INVITE_EXPIRED - When an invite expires
 */
export interface InviteExpiredEvent {
  type: "INVITE_EXPIRED";
  payload: {
    inviteId: string;
    groupId: string;
    timestamp: Date;
  };
}

/**
 * Union type for all invite events
 */
export type GroupInviteEvent = 
  | InviteSentEvent
  | InviteAcceptedEvent
  | InviteRejectedEvent
  | InviteExpiredEvent;

/**
 * Create an INVITE_SENT event
 */
export function createInviteSentEvent(invite: GroupInvite): InviteSentEvent {
  return {
    type: "INVITE_SENT",
    payload: {
      invite,
      timestamp: new Date(),
    },
  };
}

/**
 * Create an INVITE_ACCEPTED event
 */
export function createInviteAcceptedEvent(
  inviteId: string,
  groupId: string,
  acceptedBy: string,
  invite: GroupInvite
): InviteAcceptedEvent {
  return {
    type: "INVITE_ACCEPTED",
    payload: {
      acceptance: {
        inviteId,
        groupId,
        acceptedBy,
        acceptedAt: new Date(),
      },
      invite,
      timestamp: new Date(),
    },
  };
}

/**
 * Create an INVITE_REJECTED event
 */
export function createInviteRejectedEvent(
  inviteId: string,
  groupId: string,
  rejectedBy: string,
  reason: string | undefined,
  invite: GroupInvite
): InviteRejectedEvent {
  return {
    type: "INVITE_REJECTED",
    payload: {
      rejection: {
        inviteId,
        groupId,
        rejectedBy,
        rejectedAt: new Date(),
        reason,
      },
      invite,
      timestamp: new Date(),
    },
  };
}

/**
 * Create an INVITE_EXPIRED event
 */
export function createInviteExpiredEvent(
  inviteId: string,
  groupId: string
): InviteExpiredEvent {
  return {
    type: "INVITE_EXPIRED",
    payload: {
      inviteId,
      groupId,
      timestamp: new Date(),
    },
  };
}
