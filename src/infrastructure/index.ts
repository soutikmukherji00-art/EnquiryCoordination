/**
 * Infrastructure Layer Exports
 * 
 * Central export point for all infrastructure adapters.
 */

// DataStore
export * from "./datastore/datastore.interface";
export * from "./datastore/memory.store";
export * from "./datastore/supabase.store";

// AI
export * from "./ai/ai.interface";
export * from "./ai/ai.mock";
export * from "./ai/ai.live";

// Realtime
export * from "./realtime/realtime.interface";
export * from "./realtime/realtime.mock";

// State Management
export * from "./state/EnquiryContext";
export * from "./state/MessageContext";

// Role Management
export * from "./role/RoleContext";

// Policy Enforcement
export * from "./policy/PolicyContext";

// Re-export commonly used policy utilities from domain barrel for convenience
export { isInternalRole } from "@/domain";