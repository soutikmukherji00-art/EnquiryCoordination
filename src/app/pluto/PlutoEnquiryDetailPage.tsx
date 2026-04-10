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
  displayMode?: "page" | "modal" | "full-page";
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
  const isMobile = displayMode === "full-page";

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
      <div className={cn(
        "border-b border-border bg-card px-5 py-5 md:px-6",
        isMobile && "pb-6 pt-4"
      )}>
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {(showBackButton || isMobile) && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onBack}
                  className="rounded-full border-border bg-background text-muted-foreground h-10 w-10 flex-shrink-0"
                  aria-label="Back"
                >
                  <ArrowLeft className="size-5" />
                </Button>
              )}
              <div className="min-w-0">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
                  <h1 className={cn(
                    "text-[28px] font-semibold tracking-[-0.04em] text-foreground truncate",
                    isMobile && "text-xl"
                  )}>
                    {header.buyerName}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary">#{header.id}</span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        toneClassMap[header.stateTone],
                      )}
                    >
                      {header.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={cn(
            "grid gap-3 md:grid-cols-2 xl:grid-cols-4",
            isMobile && "grid-cols-2 gap-2"
          )}>
            <MetaCard label="CM" value={header.assignedCMName} />
            <MetaCard label="Value" value={header.valueLabel} />
            <MetaCard label="Created" value={header.createdAtLabel} />
            <MetaCard label="Activity" value={header.lastActivityLabel} />
          </div>
        </div>
      </div>

      <div className={cn(
        "flex-1 overflow-y-auto px-5 py-5 md:px-6",
        isMobile && "px-4 py-4 pb-[var(--mweb-tab-bar-height)]"
      )}>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_320px]">
          <div className="space-y-4">
            {/* NEW: Extracted Rich Context from EnquiryRecord */}
            <section className="rounded-[24px] border border-border bg-gradient-to-br from-card to-muted/20 p-5 shadow-sm md:p-6">
              <h2 className="text-base font-bold text-foreground/90 uppercase tracking-tight flex items-center gap-2">
                Requirements Context
                {header.creationSource && (
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full lowercase tracking-normal font-medium">
                    via {header.creationSource.replace(/-/g, ' ')}
                  </span>
                )}
              </h2>
              <div className={cn(
                "mt-4 grid gap-4",
                isMobile ? "grid-cols-1" : "lg:grid-cols-2"
              )}>
                {header.primaryContactName && <FieldValue label="Primary Contact" value={header.primaryContactName} />}
                {header.gstin && <FieldValue label="Company GSTIN" value={header.gstin} />}
                
                {header.paymentTerms && <FieldValue label="Payment Terms" value={header.paymentTerms} />}
                {header.etaDays && <FieldValue label="Required Timeline" value={header.etaDays} />}
                
                {header.deliveryLocation && (
                  <div className="lg:col-span-2">
                    <FieldValue label="Delivery Location" value={header.deliveryLocation} />
                  </div>
                )}
                
                {header.notes && (
                  <div className="lg:col-span-2">
                    <FieldValue label="Additional Requirements" value={header.notes} />
                  </div>
                )}
                
                {header.creditLimit && (
                  <div className="lg:col-span-2 mt-2 flex gap-4 p-3 bg-background rounded-[12px] border border-border">
                    <FieldValue label="Approved Credit Limit" value={header.creditLimit} />
                    <FieldValue label="Open Credit Limit" value={header.openCreditLimit || "—"} />
                  </div>
                )}
              </div>
            </section>
            
            {/* Existing Role Specific Sections */}
            {roleConfig.sections.map((section) => (
              <section
                key={section.id}
                className="rounded-[24px] border border-border bg-card p-5 shadow-sm md:p-6"
              >
                <h2 className="text-base font-bold text-foreground/90 uppercase tracking-tight">{section.title}</h2>
                <div className={cn(
                  "mt-4 grid gap-3 md:grid-cols-2",
                  isMobile && "grid-cols-1"
                )}>
                  {section.fields.map((field) => (
                    <FieldValue key={field} label={field} value="—" />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {!isMobile && (
            <aside className="rounded-[22px] border border-border bg-card p-5 shadow-sm">
              <div className="space-y-3">
                <FieldValue label="Assigned CM" value={header.assignedCMName} />
                <FieldValue label="Estimated value" value={header.valueLabel} />
                <FieldValue label="Categories" value={header.categoriesLabel} />
                <FieldValue label="Created" value={header.createdAtLabel} />
                <FieldValue label="Last activity" value={header.lastActivityLabel} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 px-4 py-3 shadow-none transition-colors hover:bg-card">
      <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-muted-foreground/70">
        {label}
      </div>
      <div className="mt-0.5 text-xs font-semibold text-foreground truncate">{value}</div>
    </div>
  );
}

function FieldValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3.5">
      <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-muted-foreground/70">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

const toneClassMap: Record<PlutoStateTone, string> = {
  neutral: "bg-primary/10 text-primary",
  accent: "bg-primary/10 text-primary",
  warning: "bg-destructive/10 text-destructive",
  success: "bg-green-500/10 text-green-600",
};
