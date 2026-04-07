/**
 * User Types - Barrel re-export for message domain
 * 
 * Re-exports UserRole from message.types.ts.
 * This barrel exists to support imports like:
 *   import { UserRole } from "./user.types"
 * within the message domain directory.
 */

export { UserRole } from "./message.types";
