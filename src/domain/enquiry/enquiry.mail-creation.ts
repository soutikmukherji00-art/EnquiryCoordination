/**
 * Domain service for creating enquiries from buyer email intake.
 *
 * The bot/classifier routes an incoming buyer email into a Buyer Mail group,
 * creates the new enquiry, and tags the forwarded mail body as the root of a
 * new enquiry thread.
 */

import type { Enquiry } from "./enquiry.types";
import type { GroupChannel } from "@/domain/message/group.types";
import {
  createEnquiryFromBuyerIntake,
  findBuyerIntakeGroup,
} from "./enquiry.buyer-intake";
import type {
  BuyerIntakeChannelKind,
  CreateEnquiryFromBuyerIntakeResult,
} from "./enquiry.buyer-intake";

export interface CreateEnquiryFromBuyerMailParams {
  buyerPersonaId: string;
  buyerId: string;
  buyerName?: string;
  subject?: string;
  body: string;
  existingEnquiries: Enquiry[];
  allGroupChannels: GroupChannel[];
}

export type CreateEnquiryFromBuyerMailResult = CreateEnquiryFromBuyerIntakeResult;

export function findBuyerMailGroup(
  allGroupChannels: GroupChannel[],
  buyerId: string,
  buyerPersonaId?: string,
): GroupChannel | null {
  return findBuyerIntakeGroup(allGroupChannels, buyerId, buyerPersonaId, "mail");
}

export function createEnquiryFromBuyerMail(
  params: CreateEnquiryFromBuyerMailParams
): CreateEnquiryFromBuyerMailResult {
  return createEnquiryFromBuyerIntake({
    ...params,
    channelKind: "mail" as BuyerIntakeChannelKind,
  });
}
