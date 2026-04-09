import { ArrowLeft, FolderCog, Link2, ShieldCheck } from "lucide-react";
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
  canManageMembers,
  canChangeState,
  canShareMessages,
  onBack,
  showBackButton = false,
  displayMode = "page",
}: PlutoEnquiryDetailPageProps) {
  const isModal = displayMode === "modal";

  if (!header) {
    return (
      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(82,73,210,0.12)_0%,#f8f9ff_42%,#f3f5fd_100%)] px-6">
        <div className="max-w-lg rounded-[28px] border border-[#e1e5f5] bg-white/96 p-8 text-center shadow-[0_22px_56px_rgba(26,32,61,0.08)]">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#eeedfc] text-[#5249d2]">
            <FolderCog className="size-6" />
          </div>
          <h2 className="mt-5 text-[24px] font-semibold tracking-[-0.04em] text-[#17201f]">
            {roleConfig.emptyStateTitle}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#667085]">
            {roleConfig.emptyStateBody}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col bg-[#f6f8ff]",
        isModal ? "h-[min(84vh,920px)]" : "h-full",
      )}
    >
      <div className="border-b border-[#e5e9f6] bg-[radial-gradient(circle_at_top_right,rgba(82,73,210,0.16),transparent_36%),linear-gradient(180deg,#ffffff_0%,#f7f8ff_100%)] px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onBack}
                  className="rounded-full border-[#d6dcf1] bg-white text-[#3a4160]"
                  aria-label="Back to Pluto enquiry list"
                >
                  <ArrowLeft className="size-4" />
                </Button>
              )}
              <div>
                <div className="inline-flex items-center rounded-full border border-[#d7dcf1] bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6a7295]">
                  Enquiry preview
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h1 className="text-[28px] font-semibold tracking-[-0.05em] text-[#161c2a]">
                    {header.buyerName}
                  </h1>
                  <span className="text-sm font-medium text-[#667085]">
                    {header.id}
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                  Pluto is reading the same enquiry record and permissions as Prism. This preview is intentionally structured, but it is not a separate entity.
                </p>
              </div>
            </div>
            {!showBackButton && !isModal && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="rounded-full border-[#d6dcf1] bg-white text-[#3a4160]"
              >
                <ArrowLeft className="size-4" />
                Back to list
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                toneClassMap[header.stateTone],
              )}
            >
              {header.status}
            </span>
            <CapabilityPill enabled={canChangeState} label="State-aware" />
            <CapabilityPill enabled={canManageMembers} label="Member-aware" />
            <CapabilityPill enabled={canShareMessages} label="Policy-linked" />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <PreviewMetaCard label="Assigned CM" value={header.assignedCMName} />
            <PreviewMetaCard label="Estimated value" value={header.valueLabel} />
            <PreviewMetaCard label="Created" value={header.createdAtLabel} />
            <PreviewMetaCard
              label="Last activity"
              value={header.lastActivityLabel}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.28fr)_minmax(280px,0.82fr)]">
          <div className="space-y-4">
            {roleConfig.sections.map((section) => (
              <section
                key={section.id}
                className="rounded-[26px] border border-[#e2e6f4] bg-white p-5 shadow-[0_16px_40px_rgba(26,32,61,0.06)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#161c2a]">
                      {section.title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-[#667085]">
                      {section.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#f2f4fd] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6a7295]">
                    Structured block
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <div
                      key={field}
                      className="rounded-2xl border border-dashed border-[#d8dff3] bg-[#f8f9ff] px-4 py-4"
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d86ab]">
                        {field}
                      </div>
                      <div className="mt-2 text-sm leading-6 text-[#667085]">
                        Structured Pluto fields will render here once this section is connected to shared enquiry data and role-aware actions.
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[26px] border border-[#1f2435] bg-[linear-gradient(145deg,#171a23_0%,#23283c_58%,#363c5f_100%)] p-5 text-white shadow-[0_18px_48px_rgba(23,26,35,0.22)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/62">
                Shared enquiry state
              </div>
              <div className="mt-4 space-y-3">
                <SideMeta label="Assigned CM" value={header.assignedCMName} />
                <SideMeta label="Estimated value" value={header.valueLabel} />
                <SideMeta label="Categories" value={header.categoriesLabel} />
                <SideMeta label="Created" value={header.createdAtLabel} />
                <SideMeta label="Last activity" value={header.lastActivityLabel} />
              </div>
            </div>

            <div className="rounded-[26px] border border-[#e2e6f4] bg-white p-5 shadow-[0_16px_40px_rgba(26,32,61,0.06)]">
              <div className="flex items-center gap-2 text-[#161c2a]">
                <ShieldCheck className="size-4 text-[#5249d2]" />
                <h2 className="text-base font-semibold text-[#161c2a]">
                  Sync contract
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#667085]">
                Pluto is reading the same enquiry entity, membership, and role
                policy decisions as Prism. This shell is intentionally form-led,
                but it is not a separate record or persistence layer.
              </p>
            </div>

            <div className="rounded-[26px] border border-[#e2e6f4] bg-white p-5 shadow-[0_16px_40px_rgba(26,32,61,0.06)]">
              <div className="flex items-center gap-2 text-[#161c2a]">
                <Link2 className="size-4 text-[#5249d2]" />
                <h2 className="text-base font-semibold">Next surface</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#667085]">
                The future left nav only needs to call the same workspace and
                Pluto navigation actions. The detail shell itself stays
                decoupled from that routing change.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function CapabilityPill({
  enabled,
  label,
}: {
  enabled: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-semibold",
        enabled
          ? "bg-[#eeedfc] text-[#5249d2]"
          : "bg-[#edf1fb] text-[#7d86ab]",
      )}
    >
      {label}
    </span>
  );
}

function PreviewMetaCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#dde3f6] bg-white/90 px-4 py-3 shadow-[0_8px_24px_rgba(26,32,61,0.04)]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d86ab]">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-[#161c2a]">{value}</div>
    </div>
  );
}

function SideMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/8 px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/58">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-white">{value}</div>
    </div>
  );
}

const toneClassMap: Record<PlutoStateTone, string> = {
  neutral: "bg-[#eef1fb] text-[#505a78]",
  accent: "bg-[#eeedfc] text-[#5249d2]",
  warning: "bg-[#fff4dc] text-[#9f6413]",
  success: "bg-[#e8f7ee] text-[#23774a]",
};
