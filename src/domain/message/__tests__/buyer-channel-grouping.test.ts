import { describe, expect, it } from "vitest";
import {
  getBuyerChannelKindLabel,
  getBuyerChannelLabel,
  groupBuyerChannels,
} from "../group-display.utils";
import type { GroupChannel } from "../group.types";

describe("buyer channel grouping", () => {
  const groups: GroupChannel[] = [
    {
      id: "grp_buyer_1_whatsapp",
      name: "Ramesh Industries - WhatsApp",
      type: "buyer",
      channelKind: "whatsapp",
      status: "active",
      memberIds: [],
      memberPersonaIds: [],
      messages: [],
      createdBy: "p_bdm_1",
      createdAt: new Date(),
      lastActivity: new Date(),
      buyerId: "buyer_1",
      buyerPersonaId: "p_buyer_1",
    } as GroupChannel,
    {
      id: "grp_buyer_1_mail",
      name: "Ramesh Industries - Mail",
      type: "buyer",
      channelKind: "mail",
      status: "active",
      memberIds: [],
      memberPersonaIds: [],
      messages: [],
      createdBy: "p_bdm_1",
      createdAt: new Date(),
      lastActivity: new Date(),
      buyerId: "buyer_1",
      buyerPersonaId: "p_buyer_1",
    } as GroupChannel,
  ];

  it("groups buyer channels under a single buyer parent", () => {
    const bundles = groupBuyerChannels(groups);

    expect(bundles).toHaveLength(1);
    expect(bundles[0].buyerName).toBe("Ramesh Industries");
    expect(bundles[0].channels.map((channel) => channel.channelKind)).toEqual([
      "whatsapp",
      "mail",
    ]);
  });

  it("labels buyer channel kinds consistently", () => {
    expect(getBuyerChannelKindLabel("whatsapp")).toBe("Buyer WhatsApp");
    expect(getBuyerChannelKindLabel("mail")).toBe("Buyer Mail");
  });

  it("labels buyer connect channels with Birla Pivot group naming", () => {
    expect(getBuyerChannelLabel(groups[0])).toBe(
      "Ramesh Industries - Birla Pivot WA Group",
    );
    expect(getBuyerChannelLabel(groups[1])).toBe(
      "Ramesh Industries - Birla Pivot Mail Group",
    );
  });
});
