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
      <div className="flex h-full items-center justify-center bg-background px-6">
        <div className="rounded-[20px] border border-border bg-card px-8 py-10 text-center text-[15px] text-muted-foreground shadow-sm">
          {roleConfig.emptyStateTitle}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col bg-background",
        isModal ? "h-[min(84vh,920px)]" : "h-full",
      )}
    >
      <div className="border-b border-border bg-card px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {showBackButton && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onBack}
                  className="rounded-full border-border bg-background text-muted-foreground"
                  aria-label="Back to Pluto enquiry list"
                >
                  <ArrowLeft className="size-4" />
                </Button>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-foreground">
                    {header.buyerName}
                  </h1>
                  <span className="text-sm text-muted-foreground">#{header.id}</span>
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
                className="rounded-full border-border bg-background text-muted-foreground"
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
                className="rounded-[22px] border border-border bg-card p-5 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <FieldValue key={field} label={field} value="—" />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="rounded-[22px] border border-border bg-card p-5 shadow-sm">
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
    <div className="rounded-[18px] border border-border bg-card px-4 py-3 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function FieldValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-border bg-secondary/30 px-4 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-sm text-foreground">{value}</div>
    </div>
  );
}

const toneClassMap: Record<PlutoStateTone, string> = {
  neutral: "bg-primary/10 text-primary",
  accent: "bg-primary/10 text-primary",
  warning: "bg-destructive/10 text-destructive",
  success: "bg-green-500/10 text-green-600",
};
