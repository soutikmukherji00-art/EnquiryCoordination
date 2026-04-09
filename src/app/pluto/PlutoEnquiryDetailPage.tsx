import { ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import type {
  PlutoDetailHeaderViewModel,
  PlutoRoleScreenConfig,
  PlutoStateTone,
} from "./pluto.types";

interface PlutoEnquiryDetailPageProps {
  header: PlutoDetailHeaderViewModel | null;
  roleConfig: PlutoRoleScreenConfig;
  canManageMembers: boolean;
  canChangeState: boolean;
  canShareMessages: boolean;
  onBack: () => void;
  showBackButton?: boolean;
  displayMode?: "page" | "modal";
}

export function PlutoEnquiryDetailPage({
  header,
  roleConfig,
  canManageMembers: _canManageMembers,
  canChangeState: _canChangeState,
  canShareMessages: _canShareMessages,
  onBack,
  showBackButton = false,
  displayMode = "page",
}: PlutoEnquiryDetailPageProps) {
  const isModal = displayMode === "modal";

  if (!header) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f7f5ef] px-6">
        <div className="rounded-[20px] border border-[#ddd8ce] bg-white px-8 py-10 text-center text-[15px] text-[#5b6068] shadow-[0_18px_48px_rgba(31,33,38,0.05)]">
          {roleConfig.emptyStateTitle}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col bg-[#f7f5ef]",
        isModal ? "h-[min(84vh,920px)]" : "h-full",
      )}
    >
      <div className="border-b border-[#ddd8ce] bg-[#fcfbf8] px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {showBackButton && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onBack}
                  className="rounded-full border-[#d7d4cb] bg-white text-[#4d4942]"
                  aria-label="Back to Pluto enquiry list"
                >
                  <ArrowLeft className="size-4" />
                </Button>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#1f2126]">
                    {header.buyerName}
                  </h1>
                  <span className="text-sm text-[#6d675d]">#{header.id}</span>
                  <span
                    className={cn(
                      "rounded-md px-3 py-1 text-xs font-medium",
                      toneClassMap[header.stateTone],
                    )}
                  >
                    {header.status}
                  </span>
                </div>
              </div>
            </div>
            {!showBackButton && !isModal && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="rounded-full border-[#d7d4cb] bg-white text-[#4d4942]"
              >
                <ArrowLeft className="size-4" />
                Back to list
              </Button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetaCard label="Assigned CM" value={header.assignedCMName} />
            <MetaCard label="Estimated value" value={header.valueLabel} />
            <MetaCard label="Created" value={header.createdAtLabel} />
            <MetaCard label="Last activity" value={header.lastActivityLabel} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_320px]">
          <div className="space-y-4">
            {roleConfig.sections.map((section) => (
              <section
                key={section.id}
                className="rounded-[22px] border border-[#ddd8ce] bg-white p-5 shadow-[0_10px_28px_rgba(31,33,38,0.04)]"
              >
                <h2 className="text-lg font-semibold text-[#1f2126]">{section.title}</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <FieldValue key={field} label={field} value="—" />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="rounded-[22px] border border-[#ddd8ce] bg-white p-5 shadow-[0_10px_28px_rgba(31,33,38,0.04)]">
            <div className="space-y-3">
              <FieldValue label="Assigned CM" value={header.assignedCMName} />
              <FieldValue label="Estimated value" value={header.valueLabel} />
              <FieldValue label="Categories" value={header.categoriesLabel} />
              <FieldValue label="Created" value={header.createdAtLabel} />
              <FieldValue label="Last activity" value={header.lastActivityLabel} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#ddd8ce] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(31,33,38,0.04)]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a847a]">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-[#1f2126]">{value}</div>
    </div>
  );
}

function FieldValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#ece7dc] bg-[#fcfbf8] px-4 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a847a]">
        {label}
      </div>
      <div className="mt-2 text-sm text-[#1f2126]">{value}</div>
    </div>
  );
}

const toneClassMap: Record<PlutoStateTone, string> = {
  neutral: "bg-[#eef2ff] text-[#6a63d9]",
  accent: "bg-[#eef2ff] text-[#6a63d9]",
  warning: "bg-[#fff2de] text-[#9b5c1e]",
  success: "bg-[#d8f0d2] text-[#6fa04e]",
};
