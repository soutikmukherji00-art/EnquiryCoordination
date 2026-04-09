import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Clock3,
  LayoutGrid,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { cn } from "@/app/components/ui/utils";
import type {
  PlutoKpiCardViewModel,
  PlutoListItemViewModel,
  PlutoRoleScreenConfig,
  PlutoStateTone,
} from "./pluto.types";

interface PlutoEnquiryListPageProps {
  items: PlutoListItemViewModel[];
  selectedEnquiryId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectEnquiry: (enquiryId: string) => void;
  onCreatePlaceholder: () => void;
  roleConfig: PlutoRoleScreenConfig;
  kpiCards: PlutoKpiCardViewModel[];
  isMobileLayout?: boolean;
}

type PlutoFilter = "all" | "open" | "approval" | "converted";

const filterOptions: ReadonlyArray<{ id: PlutoFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "open", label: "In flight" },
  { id: "approval", label: "Pending approval" },
  { id: "converted", label: "Converted" },
];

const filterLabelMap: Record<PlutoFilter, string> = {
  all: "All enquiries",
  open: "In flight",
  approval: "Pending approval",
  converted: "Converted",
};

const kpiIconMap: Record<string, LucideIcon> = {
  total: LayoutGrid,
  "in-flight": TrendingUp,
  approval: Clock3,
  converted: BadgeCheck,
};

export function PlutoEnquiryListPage({
  items,
  selectedEnquiryId,
  searchQuery,
  onSearchChange,
  onSelectEnquiry,
  onCreatePlaceholder,
  roleConfig,
  kpiCards,
  isMobileLayout = false,
}: PlutoEnquiryListPageProps) {
  const [activeFilter, setActiveFilter] = useState<PlutoFilter>("all");

  const filteredItems = useMemo(() => {
    switch (activeFilter) {
      case "open":
        return items.filter((item) => item.status !== "Converted to Order");
      case "approval":
        return items.filter((item) => item.status === "Pending Approval");
      case "converted":
        return items.filter((item) => item.status === "Converted to Order");
      default:
        return items;
    }
  }, [activeFilter, items]);

  const hasActiveFilters = activeFilter !== "all" || Boolean(searchQuery.trim());
  const resultsLabel = `${filteredItems.length} enquir${
    filteredItems.length === 1 ? "y" : "ies"
  } visible`;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f5f7ff] text-[#161c2a]">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-4 pb-8 pt-4 md:px-6 md:pb-10 md:pt-6">
          <section className="overflow-hidden rounded-[32px] border border-[#dadff3] bg-[radial-gradient(circle_at_top_right,rgba(117,102,228,0.34),transparent_34%),linear-gradient(135deg,#171a23_0%,#1f2435_48%,#353c63_100%)] text-white shadow-[0_28px_72px_rgba(23,26,35,0.18)]">
            <div className="flex flex-col gap-6 px-5 py-5 md:px-7 md:py-7">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/88">
                    <Sparkles className="size-3.5" />
                    Pluto
                  </div>
                  <h1 className="mt-4 text-[32px] font-semibold tracking-[-0.05em] text-white md:text-[38px]">
                    Enquiries
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-white/76 md:text-[15px]">
                    {roleConfig.intro}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row xl:flex-col xl:items-end">
                  <div className="min-w-[200px] rounded-[24px] border border-white/10 bg-white/8 px-4 py-3 backdrop-blur">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/56">
                      Role lens
                    </div>
                    <div className="mt-1 text-base font-semibold text-white">
                      {roleConfig.roleLabel}
                    </div>
                    <div className="mt-1 text-sm text-white/60">
                      Same enquiry data as Prism
                    </div>
                  </div>

                  {!isMobileLayout && (
                    <Button
                      type="button"
                      onClick={onCreatePlaceholder}
                      className="h-12 rounded-2xl bg-white px-5 text-sm font-semibold text-[#171a23] hover:bg-white/92"
                    >
                      <Plus className="size-4" />
                      Create enquiry
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.65fr)_repeat(3,minmax(0,1fr))]">
                <FilterCard
                  label="Search Criteria"
                  icon={Search}
                  className="xl:col-span-1"
                >
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#727aa2]" />
                    <Input
                      value={searchQuery}
                      onChange={(event) => onSearchChange(event.target.value)}
                      placeholder="Search by enquiry, buyer, category, or owner"
                      className="h-12 rounded-2xl border-[#e3e8fb] bg-white pl-11 text-sm text-[#161c2a] shadow-none placeholder:text-[#8b92b2]"
                    />
                  </div>
                </FilterCard>

                <FilterCard label="Status" icon={SlidersHorizontal}>
                  <ReadOnlyField value={filterLabelMap[activeFilter]} />
                </FilterCard>

                <FilterCard label="Sort" icon={TrendingUp}>
                  <ReadOnlyField value="Latest activity first" />
                </FilterCard>

                <FilterCard label="Shared Data" icon={Building2}>
                  <ReadOnlyField value="Prism-backed records" />
                </FilterCard>
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((filter) => {
                    const isActive = activeFilter === filter.id;

                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setActiveFilter(filter.id)}
                        aria-pressed={isActive}
                        className={cn(
                          "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors md:text-sm",
                          isActive
                            ? "border-white bg-white text-[#171a23]"
                            : "border-white/12 bg-white/8 text-white/78 hover:border-white/22 hover:bg-white/12 hover:text-white",
                        )}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-medium text-white/72 md:text-sm">
                    Filters update instantly
                  </div>
                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setActiveFilter("all");
                        onSearchChange("");
                      }}
                      className="h-10 rounded-full px-4 text-sm text-white/78 hover:bg-white/10 hover:text-white"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((card) => {
              const Icon = kpiIconMap[card.id] ?? LayoutGrid;
              return (
                <div
                  key={card.id}
                  className={cn(
                    "rounded-[26px] border bg-white p-4 shadow-[0_16px_40px_rgba(26,32,61,0.08)]",
                    toneClassMap[card.tone].card,
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-2xl",
                        toneClassMap[card.tone].icon,
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70789a]">
                        {card.label}
                      </div>
                      <div className="mt-2 text-[30px] font-semibold leading-none tracking-[-0.05em] text-[#161c2a]">
                        {card.value}
                      </div>
                      <div className="mt-2 text-sm text-[#5f6787]">
                        {card.caption}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="rounded-[30px] border border-[#dfe4f4] bg-white shadow-[0_22px_60px_rgba(26,32,61,0.08)]">
            <div className="flex flex-col gap-3 border-b border-[#edf1fb] px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
              <div>
                <h2 className="text-[22px] font-semibold tracking-[-0.04em] text-[#161c2a]">
                  Live enquiries
                </h2>
                <p className="mt-1 text-sm text-[#667085]">
                  {resultsLabel}
                  {hasActiveFilters ? " after Pluto filtering" : " across your Pluto scope"}
                </p>
              </div>
              <div className="text-sm text-[#7a82a5]">
                {isMobileLayout
                  ? "Tap an enquiry to open the structured view."
                  : "Open any enquiry to preview the structured Pluto surface in a modal."}
              </div>
            </div>

            <div className="space-y-3 p-4 md:p-5">
              {filteredItems.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[#d5dbf0] bg-[#f8f9ff] px-6 py-14 text-center">
                  <div className="text-lg font-semibold text-[#161c2a]">
                    {hasActiveFilters
                      ? "No enquiries match the current filters"
                      : roleConfig.emptyStateTitle}
                  </div>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#667085]">
                    {hasActiveFilters
                      ? "Try broadening the search or clearing the status filter to bring more enquiries back into view."
                      : roleConfig.emptyStateBody}
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = item.id === selectedEnquiryId;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectEnquiry(item.id)}
                      className={cn(
                        "w-full rounded-[24px] border bg-white px-4 py-4 text-left shadow-[0_14px_36px_rgba(26,32,61,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#c8cff1] hover:shadow-[0_18px_42px_rgba(26,32,61,0.1)] md:px-5",
                        isSelected
                          ? "border-[#b8bfff] bg-[#f7f8ff] ring-2 ring-[#5249d2]/12"
                          : cn("border-[#e4e8f5]", toneClassMap[item.stateTone].cardHover),
                      )}
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a92b2]">
                              {item.id}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                toneClassMap[item.stateTone].badge,
                              )}
                            >
                              {item.status}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="truncate text-[22px] font-semibold tracking-[-0.04em] text-[#161c2a]">
                                {item.buyerName}
                              </div>
                              <div className="mt-1 text-sm leading-6 text-[#667085]">
                                {item.summary}
                              </div>
                            </div>

                            <div className="rounded-[22px] bg-[#f6f8ff] px-4 py-3 text-left lg:min-w-[180px] lg:text-right">
                              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a92b2]">
                                Estimated value
                              </div>
                              <div className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[#161c2a]">
                                {item.valueLabel}
                              </div>
                              <div className="mt-1 text-xs text-[#7a82a5]">
                                Created {item.ageLabel} ago
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <MetaPill icon={UserRound} label="Assigned CM" value={item.assignedCMName} />
                            <MetaPill icon={Building2} label="Categories" value={item.categoriesLabel} />
                            <MetaPill icon={Clock3} label="Last activity" value={item.lastActivityLabel} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 xl:justify-end">
                          <div
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold",
                              isSelected
                                ? "border-[#5249d2]/18 bg-[#eeedfc] text-[#5249d2]"
                                : "border-[#e4e8f5] bg-white text-[#3a4160]",
                            )}
                          >
                            Preview
                            <ArrowRight className="size-4" />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      {isMobileLayout && (
        <div className="border-t border-[#e7ebf7] bg-white/95 px-4 py-4 backdrop-blur">
          <Button
            type="button"
            onClick={onCreatePlaceholder}
            className="h-12 w-full rounded-2xl bg-[#5249d2] text-sm font-semibold text-white hover:bg-[#433bb8]"
          >
            <Plus className="size-4" />
            Create enquiry
          </Button>
        </div>
      )}
    </div>
  );
}

function FilterCard({
  label,
  icon: Icon,
  className,
  children,
}: {
  label: string;
  icon: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-white/10 bg-white/8 p-4 backdrop-blur",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/58">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ReadOnlyField({ value }: { value: string }) {
  return (
    <div className="flex h-12 items-center rounded-2xl border border-white/10 bg-white px-4 text-sm font-medium text-[#161c2a]">
      {value}
    </div>
  );
}

function MetaPill({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#f2f4fd] px-3 py-2 text-sm text-[#49516f]">
      <Icon className="size-4 text-[#6d74a0]" />
      <span className="font-medium text-[#667085]">{label}:</span>
      <span className="truncate font-semibold text-[#212742]">{value}</span>
    </div>
  );
}

const toneClassMap: Record<
  PlutoStateTone,
  {
    badge: string;
    card: string;
    cardHover: string;
    icon: string;
  }
> = {
  neutral: {
    badge: "bg-[#eef1fb] text-[#505a78]",
    card: "border-[#e4e8f5]",
    cardHover: "hover:bg-[#fbfcff]",
    icon: "bg-[#eef1fb] text-[#505a78]",
  },
  accent: {
    badge: "bg-[#eeedfc] text-[#5249d2]",
    card: "border-[#cfcbfb]",
    cardHover: "hover:bg-[#faf9ff]",
    icon: "bg-[#eeedfc] text-[#5249d2]",
  },
  warning: {
    badge: "bg-[#fff4dc] text-[#9f6413]",
    card: "border-[#f2ddb3]",
    cardHover: "hover:bg-[#fffdf8]",
    icon: "bg-[#fff4dc] text-[#9f6413]",
  },
  success: {
    badge: "bg-[#e8f7ee] text-[#23774a]",
    card: "border-[#cfead8]",
    cardHover: "hover:bg-[#fbfffd]",
    icon: "bg-[#e8f7ee] text-[#23774a]",
  },
};
