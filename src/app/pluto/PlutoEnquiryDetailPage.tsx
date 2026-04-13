import { ArrowLeft, Box, ChevronRight, FileText, Package, Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import type {
  PlutoDetailHeaderViewModel,
  PlutoRoleScreenConfig,
  PlutoStateTone,
} from "./pluto.types";
import type { EnquiryRecord } from "@/domain/enquiry/enquiry.record";

interface PlutoEnquiryDetailPageProps {
  header: PlutoDetailHeaderViewModel | null;
  roleConfig: PlutoRoleScreenConfig;
  canManageMembers: boolean;
  canChangeState: boolean;
  canShareMessages: boolean;
  onBack: () => void;
  showBackButton?: boolean;
  displayMode?: "page" | "modal" | "full-page";
  record?: EnquiryRecord;
  summary?: string;
  onCreatePlaceholder?: () => void;
  onOpenDetailedRFQCreation?: () => void;
  onDirectOrder?: () => void;
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
  record,
  summary,
  onCreatePlaceholder,
  onOpenDetailedRFQCreation,
  onDirectOrder,
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
        isMobile && "px-4 py-4 pb-[calc(9rem+var(--mweb-safe-area-bottom))]"
      )}>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_320px]">
          <div className="space-y-4">
            {/* Preview extracted from EnquiryRecord / Summary */}
            <section className="rounded-2xl border border-border/40 bg-card p-4 md:p-5 shadow-sm transition-all">
              <h2 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
                <FileText className="w-3.5 h-3.5" />
                Preview
              </h2>
              <div className="text-[14px] leading-relaxed text-foreground/80 whitespace-pre-wrap">
                {record?.requirements?.notes || "No context or summary provided for this enquiry."}
              </div>
            </section>

          </div>

          {!isMobile && (
            <aside className="space-y-4">
              <div className="rounded-[22px] border border-border bg-card p-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/40"></div>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.05em] text-foreground">Respond to Enquiry</h3>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={onOpenDetailedRFQCreation}
                    className="h-auto w-full justify-start rounded-[14px] bg-primary p-4 text-left shadow-md transition-all hover:scale-[1.02] hover:bg-primary/95"
                  >
                    <div className="flex items-center gap-4 w-full">
                       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15 shadow-inner">
                         <FileText className="h-5 w-5 text-primary-foreground" />
                       </div>
                       <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                         <span className="text-[15px] font-semibold tracking-tight text-primary-foreground">Detailed RFQ</span>
                         <span className="text-[11px] text-primary-foreground/75 truncate mt-0.5">Collect complete requirements</span>
                       </div>
                       <ChevronRight className="h-5 w-5 text-primary-foreground/50 shrink-0" />
                    </div>
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <Button 
                      variant="outline"
                      onClick={onCreatePlaceholder}
                      className="flex h-[88px] flex-col items-center justify-center gap-2.5 rounded-[14px] border-border bg-background hover:bg-muted/50 hover:border-border/80 transition-all active:scale-[0.98]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-background shadow-xs">
                        <Plus className="h-4 w-4" />
                      </div>
                      <span className="text-[13px] font-medium text-foreground tracking-tight">Quick RFQ</span>
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={onDirectOrder}
                      className="flex h-[88px] flex-col items-center justify-center gap-2.5 rounded-[14px] border-border bg-background hover:bg-muted/50 hover:border-border/80 transition-all active:scale-[0.98]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-background shadow-xs">
                        <Package className="h-4 w-4" />
                      </div>
                      <span className="text-[13px] font-medium text-foreground tracking-tight">Direct Order</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-border bg-card p-5 shadow-sm">
                <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground/80">Meta Information</h3>
                <div className="space-y-3">
                  <FieldValue label="Assigned CM" value={header.assignedCMName} />
                  <FieldValue label="Estimated value" value={header.valueLabel} />
                  <FieldValue label="Categories" value={header.categoriesLabel} />
                  <FieldValue label="Created" value={header.createdAtLabel} />
                  <FieldValue label="Last activity" value={header.lastActivityLabel} />
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {isMobile && (
        <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 px-4 pb-[calc(0.75rem+var(--mweb-safe-area-bottom))] pt-3 backdrop-blur">
          <div className="flex flex-col gap-2">
            <Button
              onClick={onOpenDetailedRFQCreation}
              className="h-11 w-full justify-between rounded-xl px-4 text-sm font-semibold"
            >
              <span className="inline-flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Detailed RFQ
              </span>
              <ChevronRight className="h-4 w-4 opacity-80" />
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={onCreatePlaceholder}
                className="h-10 rounded-xl text-sm font-medium"
              >
                <Plus className="mr-1 h-4 w-4" />
                Quick RFQ
              </Button>
              <Button
                variant="outline"
                onClick={onDirectOrder}
                className="h-10 rounded-xl text-sm font-medium"
              >
                <Package className="mr-1 h-4 w-4" />
                Direct Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5 transition-colors hover:bg-muted/40">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-medium text-foreground truncate">{value}</div>
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
