import { MessageSquare, MoreHorizontal } from "lucide-react";
import { PersonaHoverTrigger } from "@/app/components/PersonaHoverTrigger";

interface BuyerDMHeaderProps {
  buyerName: string;
  buyerPersonaId?: string; // Add buyer persona ID
  bdmName: string;
  currentRole: string;
  buyerCompany?: string;
  onCreateEnquiry?: () => void;
}

// Badge component for DM indicator
function DMBadge() {
  return (
    <div className="bg-[#eef4fd] h-[24px] relative rounded-[1000px] shrink-0">
      <div className="content-stretch flex h-full items-center justify-center overflow-clip px-[8.625px] py-[2.625px] relative rounded-[inherit]">
        <div className="flex items-center gap-[4px]">
          <MessageSquare 
            style={{
              width: "12px",
              height: "12px",
              color: "#1169e5",
              strokeWidth: 2,
            }}
          />
          <p className="font-['Inter',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#1169e5] text-[12px]">
            DM
          </p>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border-[0.625px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[1000px]"
      />
    </div>
  );
}

// Create Enquiry button (for BDM)
function CreateEnquiryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="bg-[#030213] relative rounded-[8px] shrink-0 transition-all hover:bg-[#1a1a2e]"
      onClick={onClick}
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[16px] py-[10px] relative">
        <div className="relative shrink-0 size-[20px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
            <path
              d="M10 4v12M4 10h12"
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.66667"
            />
          </svg>
        </div>
        <p className="font-['Inter',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-white tracking-[-0.1504px]">
          Create Enquiry
        </p>
      </div>
    </button>
  );
}

// More options button
function MoreOptionsButton({ onClick }: { onClick?: () => void }) {
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
        <MoreHorizontal
          style={{
            width: "20px",
            height: "20px",
            color: "#6A7282",
            strokeWidth: 1.5,
          }}
        />
      </div>
    </button>
  );
}

export function BuyerDMHeader({
  buyerName,
  buyerPersonaId,
  bdmName,
  currentRole,
  buyerCompany,
  onCreateEnquiry,
}: BuyerDMHeaderProps) {
  const isBDM = currentRole === "BDM";
  const subtitle = isBDM ? "Direct message" : `Chat with ${bdmName}`;

  return (
    <div
      className="bg-white content-stretch hidden md:flex flex-col items-start pb-[12px] pt-[15.996px] px-[23.994px] relative w-full"
      style={{ minHeight: "80px" }}
    >
      <div
        aria-hidden="true"
        className="absolute border-[#e5e7eb] border-b-[0.625px] border-solid inset-0 pointer-events-none"
      />

      {/* Main container */}
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
        <div className="relative shrink-0 w-full">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[15.996px] items-center relative w-full">
            {/* Left section - Buyer Name and DM Badge */}
            <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
              <div className="flex-[1_0_0] h-full min-h-px min-w-px relative">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
                  <div className="flex-[1_0_0] min-h-px min-w-px relative">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start justify-center relative w-full">
                      {/* Badge only */}
                      <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0">
                        <DMBadge />
                      </div>

                      {/* Buyer Name */}
                      <div className="content-stretch flex items-center relative shrink-0">
                        {buyerPersonaId ? (
                          <PersonaHoverTrigger 
                            personaId={buyerPersonaId}
                            context={{ location: 'buyer-dm-header' }}
                            side="bottom"
                            align="start"
                          >
                            <p className="font-['Inter',sans-serif] font-semibold leading-[32px] not-italic relative shrink-0 text-[#4039ad] text-[20px]">
                              {buyerName}
                            </p>
                          </PersonaHoverTrigger>
                        ) : (
                          <p className="font-['Inter',sans-serif] font-semibold leading-[32px] not-italic relative shrink-0 text-[#4039ad] text-[20px]">
                            {buyerName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right section - Actions */}
            <div className="h-[40px] relative shrink-0">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.992px] h-full items-center justify-end relative">
                {/* Actions removed - not needed for Buyer DM header */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}