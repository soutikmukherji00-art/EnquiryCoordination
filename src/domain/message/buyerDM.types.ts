/**
 * buyerDM.types - Case-variant barrel re-export
 * 
 * Re-exports from buyer-dm.types.ts to support case-variant imports like:
 *   import { BuyerDMChannel } from "@/domain/message/buyerDM.types"
 */

export { BuyerDMChannel, generateBuyerDMId, createBuyerDMChannel, canAccessBuyerDM } from "./buyer-dm.types";
