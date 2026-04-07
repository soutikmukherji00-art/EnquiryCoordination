/**
 * DM Types - Barrel re-export
 * 
 * Re-exports buyer and seller DM types from their respective files.
 * This barrel exists to support imports like:
 *   import { BuyerDMChannel, SellerDMChannel } from "./dm.types"
 */

export { BuyerDMChannel, generateBuyerDMId, canAccessBuyerDM } from "./buyer-dm.types";
export { SellerDMChannel, generateSellerDMId, parseSellerDMId } from "./seller-dm.types";
