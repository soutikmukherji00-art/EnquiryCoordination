/**
 * Seller Types - Barrel re-export for message domain
 * 
 * Re-exports SellerChannel from message.types.ts.
 * This barrel exists to support imports like:
 *   import { SellerChannel } from "./seller.types"
 * within the message domain directory.
 */

export { SellerChannel } from "./message.types";
