/**
 * BuyerInfoBadge — Compact buyer chip with rich hover card.
 *
 * Shown next to enquiry threads in the ShareModal when sharing
 * from an external group to an internal group. The badge shows
 * the buyer company name, and on hover reveals full details:
 * contacts, region, industry, linked enquiries.
 */

import React from "react";
import { Building2, MapPin, Factory, Users, Hash } from "lucide-react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/app/components/ui/hover-card";
import type { ResolvedBuyerInfo } from "@/domain/buyer/buyer-identification";

interface BuyerInfoBadgeProps {
  /** Resolved buyer info — if null/undefined, nothing is rendered */
  buyerInfo: ResolvedBuyerInfo | undefined | null;
  /** Persona map for fallback display name lookup */
  personaMap?: Map<string, any>;
}

export const BuyerInfoBadge = React.memo(function BuyerInfoBadge({
  buyerInfo,
}: BuyerInfoBadgeProps) {
  if (!buyerInfo) return null;

  // Truncate long names for badge display
  const shortName =
    buyerInfo.companyName.length > 20
      ? buyerInfo.companyName.slice(0, 18) + "..."
      : buyerInfo.companyName;

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200/80 text-amber-700 text-[10px] cursor-default hover:bg-amber-100 hover:border-amber-300 transition-colors whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
          role="note"
          tabIndex={0}
        >
          <Building2 className="size-2.5 flex-shrink-0" />
          <span className="max-w-[100px] truncate">{shortName}</span>
        </span>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-[280px] p-0 z-50"
      >
        <BuyerDetailCard buyer={buyerInfo} />
      </HoverCardContent>
    </HoverCard>
  );
});

// ── Expanded Detail Card ─────────────────────────────────────────────

function BuyerDetailCard({ buyer }: { buyer: ResolvedBuyerInfo }) {
  const resolutionLabel: Record<ResolvedBuyerInfo["resolution"], string> = {
    "thread-enquiry": "Identified from enquiry",
    "source-group-direct": "Source group buyer",
    "source-group-member": "Found in group members",
    "seller-enquiry-link": "Linked via seller enquiry",
    "target-group-member": "Found in target members",
    "unknown": "Unknown",
  };

  return (
    <div className="divide-y divide-gray-100">
      {/* Header */}
      <div className="px-3.5 py-3 flex items-start gap-2.5">
        <div className="size-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
          <Building2 className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-900 truncate">{buyer.companyName}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {resolutionLabel[buyer.resolution]}
          </p>
        </div>
      </div>

      {/* Details grid */}
      {(buyer.region || buyer.industry || (buyer.contacts && buyer.contacts.length > 0)) && (
        <div className="px-3.5 py-2.5 space-y-2">
          {/* Region */}
          {buyer.region && (
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="size-3 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">{buyer.region}</span>
            </div>
          )}

          {/* Industry */}
          {buyer.industry && (
            <div className="flex items-center gap-2 text-xs">
              <Factory className="size-3 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">{buyer.industry}</span>
            </div>
          )}

          {/* Contacts */}
          {buyer.contacts && buyer.contacts.length > 0 && (
            <div className="flex items-start gap-2 text-xs">
              <Users className="size-3 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                {buyer.contacts.slice(0, 3).map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-gray-700 truncate">{c.name}</span>
                    <span className="text-gray-400">&middot;</span>
                    <span className="text-gray-400 truncate">{c.role}</span>
                  </div>
                ))}
                {buyer.contacts.length > 3 && (
                  <span className="text-gray-400">+{buyer.contacts.length - 3} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Linked enquiries */}
      {buyer.linkedEnquiryIds && buyer.linkedEnquiryIds.length > 0 && (
        <div className="px-3.5 py-2.5">
          <p className="text-[10px] text-gray-400 mb-1.5 flex items-center gap-1">
            <Hash className="size-2.5" />
            Linked Enquiries
          </p>
          <div className="flex flex-wrap gap-1">
            {buyer.linkedEnquiryIds.slice(0, 5).map((eid) => (
              <span
                key={eid}
                className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#5249D2]/8 text-[#5249D2] text-[10px] font-mono"
              >
                {eid}
              </span>
            ))}
            {buyer.linkedEnquiryIds.length > 5 && (
              <span className="text-[10px] text-gray-400">
                +{buyer.linkedEnquiryIds.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
