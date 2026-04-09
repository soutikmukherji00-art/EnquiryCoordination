import type { ShareSourceContext, ShareSourceKind, ShareTargetKind } from "./share.policy.types";

/**
 * Map a legacy channel string to a ShareSourceKind.
 */
export function mapChannelToSourceKind(channel: string): ShareSourceKind {
  if (channel === "internal") return "enquiry-internal";
  if (channel.startsWith("buyer-dm") || channel.startsWith("dm-p_buyer")) return "buyer-dm";
  if (channel === "buyer") return "enquiry-buyer";
  if (channel.startsWith("seller-dm")) return "seller-dm";
  if (channel === "seller" || channel.startsWith("seller-")) return "enquiry-seller";
  if (channel.startsWith("grp_") || channel.startsWith("group_")) return "group-main";
  return "group-main";
}

/**
 * Map a legacy channel string to a ShareTargetKind.
 */
export function mapChannelToTargetKind(channel: string): ShareTargetKind {
  if (channel === "internal") return "enquiry-internal";
  if (channel.startsWith("buyer-dm") || channel.startsWith("buyer-multi:")) return "buyer-dm";
  if (channel === "buyer") return "enquiry-buyer";
  if (channel.startsWith("seller-dm") || channel.startsWith("seller-multi:")) return "seller-dm";
  if (channel === "seller" || channel.startsWith("seller-")) return "enquiry-seller";
  if (channel.startsWith("grp_") || channel.startsWith("group_")) return "group-main";
  return "group-main";
}

/**
 * Map share source context to the source kind used by the share policy engine.
 */
export function getShareSourceKindFromContext(ctx: ShareSourceContext): ShareSourceKind {
  switch (ctx.type) {
    case "buyer-dm":
      return "buyer-dm";
    case "seller-dm":
      return "seller-dm";
    case "group":
      return "group-main";
    case "thread":
      return "thread";
    case "enquiry-channel":
      if (ctx.channel === "internal") return "enquiry-internal";
      if (ctx.channel === "buyer") return "enquiry-buyer";
      return "enquiry-seller";
    default:
      return "group-main";
  }
}
