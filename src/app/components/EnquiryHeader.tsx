import { Plus, FileText, ArrowRightCircle, MoreVertical, Users } from "lucide-react";
import { useState } from "react";
import { useActionPermission } from "@/infrastructure";
import { Enquiry, Member, Persona } from "@/domain/enquiry/enquiry.types";
import { MembersIndicator } from "./MembersIndicator";
import { PersonaHoverTrigger } from "@/app/components/PersonaHoverTrigger";

function formatCurrency(amount?: number): string {
  if (!amount || Number.isNaN(amount)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

interface EnquiryHeaderProps {
  enquiry: Enquiry;
  currentState: string;
  members: Member[];
  personas: Map<string, Persona>;
  onStateChange: (newState: string) => void;
  onConvertToOrder: () => void;
  onToggleAuditTrail: () => void;
  showAuditTrail: boolean;
  onAddMember?: (personaId: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onCreateSellerChannel?: () => void; // New prop for creating seller channels
}

// Badge component for state (no actions in header)
function StateBadge({ state }: { state: string }) {
  // Use light gray secondary style for all states
  return (
    <div className="relative shrink-0 rounded-[1000px] border border-[#b9c0ff] bg-[#f4f5ff]">
      <div className="content-stretch flex h-full items-center justify-center overflow-clip px-[10px] py-[3px] relative rounded-[inherit]">
        <p className="font-['Inter',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-[#5f55e6]">
          {state}
        </p>
      </div>
    </div>
  );
}

// Add member button
function AddMemberButton({ onClick }: { onClick?: () => void }) {
  return (
    <div className="h-[20px] relative shrink-0" onClick={onClick}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.994px] h-full items-center cursor-pointer">
        <div className="bg-[#d1d5dc] h-[15.996px] shrink-0 w-[0.996px]" />
        <div className="relative shrink-0 size-[15.996px]">
          <Plus
            style={{
              width: "15.996px",
              height: "15.996px",
              color: "#6A7282",
              strokeWidth: 1.333,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Audit trail button
function AuditTrailButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="bg-white h-[40px] relative rounded-[8px] shrink-0 hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div
        aria-hidden="true"
        className="absolute border-[0.625px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]"
      />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] h-full items-center px-[11px] py-[8px] relative">
        <FileText className="size-4 text-[#0A0A0A]" strokeWidth={1.333} />
      </div>
    </button>
  );
}

// Convert to Order button
function ConvertButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      className={`bg-[#030213] relative rounded-[8px] shrink-0 transition-all ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#1a1a2e]"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[16px] py-[10px] relative">
        <ArrowRightCircle className="size-5 text-white" strokeWidth={1.67} />
        <p className="font-['Inter',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-white tracking-[-0.1504px]">
          Convert to Order
        </p>
      </div>
    </button>
  );
}

export function EnquiryHeader({
  enquiry,
  currentState,
  members,
  personas,
  onStateChange,
  onConvertToOrder,
  onToggleAuditTrail,
  showAuditTrail,
  onAddMember,
  onRemoveMember,
  onCreateSellerChannel,
}: EnquiryHeaderProps) {
  // Use policy hook to determine if convert button should be visible
  const canConvertToOrder = useActionPermission("CONVERT_TO_ORDER");
  const categoryLabel = enquiry.categories?.[0] || enquiry.productCategory || "General";
  const valueLabel = enquiry.estimatedValue ? formatCurrency(enquiry.estimatedValue) : "₹0.00";

  return (
    <div
      className="hidden md:flex w-full flex-col border-b border-gray-200 bg-white px-6 py-4"
    >
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-[#4039ad]">
              #{enquiry.id}
            </p>
            <StateBadge state={currentState} />
          </div>
          <div className="mt-1">
            {enquiry.buyerPersonaId ? (
              <PersonaHoverTrigger
                personaId={enquiry.buyerPersonaId}
                context={{ enquiryId: enquiry.id, location: "header" }}
                side="bottom"
                align="start"
              >
                <h1 className="truncate text-[20px] font-semibold leading-8 tracking-[-0.02em] text-[#4039ad]">
                  {enquiry.buyerName}
                </h1>
              </PersonaHoverTrigger>
            ) : (
              <h1 className="truncate text-[20px] font-semibold leading-8 tracking-[-0.02em] text-[#4039ad]">
                {enquiry.buyerName}
              </h1>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-700">
            <span>{valueLabel}</span>
            <span className="px-2 text-gray-400">•</span>
            <span>{categoryLabel}</span>
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-3">
          <MembersIndicator
            members={members}
            personas={personas}
            onAddMember={onAddMember}
            onRemoveMember={onRemoveMember}
          />

          <AuditTrailButton onClick={onToggleAuditTrail} />

          {canConvertToOrder && (
            <ConvertButton
              onClick={onConvertToOrder}
              disabled={currentState === "converted"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
