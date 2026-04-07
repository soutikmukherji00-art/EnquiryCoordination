/**
 * Domain: Audit Types
 * 
 * Audit trail for tracking all actions in the system.
 */

export type AuditEntryType =
  | "state_change"
  | "field_update"
  | "share"
  | "message"
  | "system";

export interface AuditEntry {
  id: string;
  type: AuditEntryType;
  timestamp: Date;
  content: string;
  actor: string;
  actorRole: string;
  channel?: string;
  metadata?: AuditMetadata;
}

export interface AuditMetadata {
  sellerIds?: string[];
  sellerCount?: number;
  hasEdits?: boolean;
  masked?: boolean;
  fromChannel?: string;
  toChannel?: string;
  messageCount?: number;
  field?: string;
  oldValue?: string;
  newValue?: string;
}