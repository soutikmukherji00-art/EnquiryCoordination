/**
 * User Types - Barrel re-export
 * 
 * Re-exports UserRole from the message domain.
 * This barrel exists to support imports like:
 *   import { UserRole } from "@/domain/user/user.types"
 * from hooks and other modules.
 */

export { UserRole } from "@/domain/message/message.types";
