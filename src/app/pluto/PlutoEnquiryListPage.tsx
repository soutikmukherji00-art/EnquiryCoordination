import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AtSign, BadgeCheck, Clock3, FileText, Package, Plus, Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { cn } from "@/app/components/ui/utils";
import type {
  PlutoKpiCardViewModel,
  PlutoListItemViewModel,
  PlutoRoleScreenConfig,
  PlutoStateTone,
} from "./pluto.types";
import { MobileHeader } from "@/app/components/ui/MobileHeader";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/app/components/ui/sheet";
import { Filter } from "lucide-react";

interface PlutoEnquiryListPageProps {
  items: PlutoListItemViewModel[];
  selectedEnquiryId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectEnquiry: (enquiryId: string) => void;
  onCreatePlaceholder: () => void;
  onOpenDetailedRFQCreation: () => void;
  onFabDirectOrder: () => void;
  roleConfig: PlutoRoleScreenConfig;
  kpiCards: PlutoKpiCardViewModel[];
  isMobileLayout?: boolean;
}

type SearchField = "all" | "enquiry" | "buyer" | "rm" | "category";
type TimePeriod = "30d" | "7d" | "90d" | "all";
type SortOption = "latest" | "oldest" | "buyer-asc" | "buyer-desc" | "value-desc";

interface PlutoFilters {
  searchField: SearchField;
  searchText: string;
  timePeriod: TimePeriod;
  buyer: string;
  status: string;
  sort: SortOption;
  rm: string;
  category: string;
  region: string;
}

const SEARCH_FIELD_OPTIONS: Array<{ value: SearchField; label: string }> = [
  { value: "all", label: "All" },
  { value: "enquiry", label: "Enquiry ID" },
  { value: "buyer", label: "Buyer" },
  { value: "rm", label: "RM List" },
  { value: "category", label: "Category" },
];

const TIME_PERIOD_OPTIONS: Array<{ value: TimePeriod; label: string }> = [
  { value: "90d", label: "Last 3 months" },
  { value: "30d", label: "Last 30 days" },
  { value: "7d", label: "Last 7 days" },
  { value: "all", label: "All time" },
];

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "latest", label: "Latest activity" },
  { value: "oldest", label: "Oldest first" },
  { value: "buyer-asc", label: "Buyer A-Z" },
  { value: "buyer-desc", label: "Buyer Z-A" },
  { value: "value-desc", label: "Value high-low" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "--Select--" },
  { value: "Pending Response", label: "Pending Response" },
  { value: "Pending Approval", label: "Pending Approval" },
  { value: "Converted to Order", label: "Converted to Order" },
];

const DEFAULT_FILTERS: PlutoFilters = {
  searchField: "all",
  searchText: "",
  timePeriod: "90d",
  buyer: "all",
  status: "all",
  sort: "latest",
  rm: "all",
  category: "all",
  region: "all",
};

const kpiIconMap: Record<string, LucideIcon> = {
  total: Clock3,
  "in-flight": Clock3,
  approval: FileText,
  converted: BadgeCheck,
};

export function PlutoEnquiryListPage({
  items,
  selectedEnquiryId,
  searchQuery,
  onSearchChange,
  onSelectEnquiry,
  onCreatePlaceholder,
  onOpenDetailedRFQCreation,
  onFabDirectOrder,
  roleConfig,
  kpiCards,
  isMobileLayout = false,
}: PlutoEnquiryListPageProps) {
  const [draftFilters, setDraftFilters] = useState<PlutoFilters>(() => ({
    ...DEFAULT_FILTERS,
    searchText: searchQuery,
  }));
  const [appliedFilters, setAppliedFilters] = useState<PlutoFilters>(() => ({
    ...DEFAULT_FILTERS,
    searchText: searchQuery,
  }));

  useEffect(() => {
    setDraftFilters((current) => ({ ...current, searchText: searchQuery }));
    setAppliedFilters((current) => ({ ...current, searchText: searchQuery }));
  }, [searchQuery]);

  const buyerOptions = useMemo(
    () => buildOptions(items.map((item) => item.buyerName)),
    [items],
  );
  const rmOptions = useMemo(
    () => buildOptions(items.map((item) => item.assignedCMName)),
    [items],
  );
  const categoryOptions = useMemo(
    () => buildOptions(items.flatMap((item) => item.categoriesLabel.split(",").map((value) => value.trim()))),
    [items],
  );
  const regionOptions = useMemo(
    () => buildOptions(items.map((item) => item.regionLabel)),
    [items],
  );

  const filteredItems = useMemo(() => {
    const now = Date.now();
    const periodDays = resolveTimePeriodDays(appliedFilters.timePeriod);
    const filtered = items.filter((item) => {
      if (appliedFilters.status !== "all" && item.status !== appliedFilters.status) {
        return false;
      }
      if (appliedFilters.buyer !== "all" && item.buyerName !== appliedFilters.buyer) {
        return false;
      }
      if (appliedFilters.rm !== "all" && item.assignedCMName !== appliedFilters.rm) {
        return false;
      }
      if (
        appliedFilters.category !== "all" &&
        !item.categoriesLabel
          .split(",")
          .map((value) => value.trim())
          .includes(appliedFilters.category)
      ) {
        return false;
      }
      if (appliedFilters.region !== "all" && item.regionLabel !== appliedFilters.region) {
        return false;
      }
      if (periodDays !== null) {
        const ageInDays = (now - item.createdAtTime) / (1000 * 60 * 60 * 24);
        if (ageInDays > periodDays) {
          return false;
        }
      }

      const query = appliedFilters.searchText.trim().toLowerCase();
      if (!query) {
        return true;
      }

      const haystack = resolveSearchFieldValue(item, appliedFilters.searchField).toLowerCase();
      return haystack.includes(query);
    });

    return sortItems(filtered, appliedFilters.sort);
  }, [appliedFilters, items]);

  const hasActiveFilters = !filtersEqual(appliedFilters, DEFAULT_FILTERS);

  // Desktop Header Content
  const renderDesktopHeader = () => (
    <section className="rounded-[28px] border border-border/55 bg-card px-5 py-5 shadow-sm md:px-6">
      <h1 className="text-[32px] font-medium tracking-[-0.04em] md:text-[36px]">
        Enquiries
      </h1>

      <div className="mt-6 grid gap-5 xl:grid-cols-[repeat(6,minmax(0,1fr))]">
        <FilterField label="Search Criteria">
          <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
            <SimpleSelect
              value={draftFilters.searchField}
              onValueChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  searchField: value as SearchField,
                }))
              }
              options={SEARCH_FIELD_OPTIONS}
            />
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={draftFilters.searchText}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    searchText: event.target.value,
                  }))
                }
                placeholder="Type 3 letters"
                className="h-11 rounded-[14px] border-border bg-background pl-11 text-sm shadow-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </FilterField>

        <FilterField label="Select Time Period for Enquiry">
          <SimpleSelect
            value={draftFilters.timePeriod}
            onValueChange={(value) =>
              setDraftFilters((current) => ({
                ...current,
                timePeriod: value as TimePeriod,
              }))
            }
            options={TIME_PERIOD_OPTIONS}
          />
        </FilterField>

        <FilterField label="Buyer">
          <SimpleSelect
            value={draftFilters.buyer}
            onValueChange={(value) =>
              setDraftFilters((current) => ({ ...current, buyer: value }))
            }
            options={[{ value: "all", label: "-Select-" }, ...buyerOptions]}
          />
        </FilterField>

        <FilterField label="Status">
          <SimpleSelect
            value={draftFilters.status}
            onValueChange={(value) =>
              setDraftFilters((current) => ({ ...current, status: value }))
            }
            options={STATUS_FILTER_OPTIONS}
          />
        </FilterField>

        <FilterField label="Sort">
          <SimpleSelect
            value={draftFilters.sort}
            onValueChange={(value) =>
              setDraftFilters((current) => ({
                ...current,
                sort: value as SortOption,
              }))
            }
            options={SORT_OPTIONS}
          />
        </FilterField>

        <FilterField label="RM List">
          <SimpleSelect
            value={draftFilters.rm}
            onValueChange={(value) =>
              setDraftFilters((current) => ({ ...current, rm: value }))
            }
            options={[{ value: "all", label: "-Select-" }, ...rmOptions]}
          />
        </FilterField>

        <FilterField label="Category">
          <SimpleSelect
            value={draftFilters.category}
            onValueChange={(value) =>
              setDraftFilters((current) => ({ ...current, category: value }))
            }
            options={[{ value: "all", label: "--Select--" }, ...categoryOptions]}
          />
        </FilterField>

        <FilterField label="Region">
          <SimpleSelect
            value={draftFilters.region}
            onValueChange={(value) =>
              setDraftFilters((current) => ({ ...current, region: value }))
            }
            options={[{ value: "all", label: "-Select-" }, ...regionOptions]}
          />
        </FilterField>

        <div className="flex items-end justify-start gap-4 xl:col-span-4 xl:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setDraftFilters(DEFAULT_FILTERS);
              setAppliedFilters(DEFAULT_FILTERS);
              onSearchChange("");
            }}
            className="h-11 px-2 text-base font-medium text-primary hover:bg-transparent hover:text-primary/90"
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={() => {
              setAppliedFilters(draftFilters);
              onSearchChange(draftFilters.searchText.trim());
            }}
            className="h-12 rounded-[12px] bg-primary px-6 text-base font-medium text-primary-foreground hover:bg-primary/90"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </section>
  );

  // Mobile Filter Drawer
  const renderMobileFilters = () => (
    <div className="flex items-center gap-2 px-4 py-2 bg-card border-b border-border/55 sticky top-0 z-30">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={draftFilters.searchText}
          onChange={(event) => {
            const val = event.target.value;
            setDraftFilters((current) => ({ ...current, searchText: val }));
            // Fast search for text
            setAppliedFilters((current) => ({ ...current, searchText: val }));
            onSearchChange(val);
          }}
          placeholder="Search..."
          className="h-9 rounded-full border-border bg-muted/50 pl-9 text-xs shadow-none"
        />
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 rounded-full gap-2 text-xs">
            <Filter className={cn("size-3", hasActiveFilters && "text-primary fill-primary")} />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-[32px] px-6 pb-10">
          <SheetHeader className="pb-4 border-b border-border/55 mb-6">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Refine your enquiry pipeline</SheetDescription>
          </SheetHeader>
          <div className="space-y-6 overflow-y-auto max-h-full pb-20">
            <FilterField label="Time Period">
              <SimpleSelect
                value={draftFilters.timePeriod}
                onValueChange={(value) => setDraftFilters(c => ({ ...c, timePeriod: value as TimePeriod }))}
                options={TIME_PERIOD_OPTIONS}
              />
            </FilterField>
            <FilterField label="Status">
              <SimpleSelect
                value={draftFilters.status}
                onValueChange={(value) => setDraftFilters(c => ({ ...c, status: value }))}
                options={STATUS_FILTER_OPTIONS}
              />
            </FilterField>
            <FilterField label="Sort Order">
              <SimpleSelect
                value={draftFilters.sort}
                onValueChange={(value) => setDraftFilters(c => ({ ...c, sort: value as SortOption }))}
                options={SORT_OPTIONS}
              />
            </FilterField>
            <FilterField label="Buyer">
              <SimpleSelect
                value={draftFilters.buyer}
                onValueChange={(value) => setDraftFilters(c => ({ ...c, buyer: value }))}
                options={[{ value: "all", label: "All Buyers" }, ...buyerOptions]}
              />
            </FilterField>
            <FilterField label="RM">
              <SimpleSelect
                value={draftFilters.rm}
                onValueChange={(value) => setDraftFilters(c => ({ ...c, rm: value }))}
                options={[{ value: "all", label: "All RMs" }, ...rmOptions]}
              />
            </FilterField>
            <FilterField label="Category">
              <SimpleSelect
                value={draftFilters.category}
                onValueChange={(value) => setDraftFilters(c => ({ ...c, category: value }))}
                options={[{ value: "all", label: "All Categories" }, ...categoryOptions]}
              />
            </FilterField>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-card border-t border-border/55 flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 rounded-xl h-12"
              onClick={() => {
                setDraftFilters(DEFAULT_FILTERS);
                setAppliedFilters(DEFAULT_FILTERS);
                onSearchChange("");
              }}
            >
              Reset
            </Button>
            <Button 
              className="flex-2 rounded-xl h-12"
              onClick={() => {
                setAppliedFilters(draftFilters);
                onSearchChange(draftFilters.searchText.trim());
              }}
            >
              Apply
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
      {isMobileLayout && (
        <MobileHeader 
          title="Pipeline" 
          subtitle={`${filteredItems.length} Enquiries`}
        />
      )}
      
      <div className="flex-1 overflow-y-auto">
        {isMobileLayout && renderMobileFilters()}
        
        <div className={cn(
          "mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-4 pb-8 pt-4 md:px-6 md:pb-10 md:pt-6",
          isMobileLayout && "gap-4 px-3"
        )}>
          {!isMobileLayout && renderDesktopHeader()}

          <section className={cn(
            "grid gap-3 md:grid-cols-2 xl:grid-cols-4",
            isMobileLayout && "grid-cols-2 gap-2"
          )}>
            {kpiCards.map((card) => {
              const Icon = kpiIconMap[card.id] ?? Clock3;
              return (
                <div
                  key={card.id}
                  className={cn(
                    "rounded-[18px] border bg-card px-6 py-5 shadow-sm lg:px-6 lg:py-5",
                    isMobileLayout && "px-4 py-3 rounded-2xl",
                    toneClassMap[card.tone].card,
                  )}
                >
                  <div className={cn("flex items-center gap-4", isMobileLayout && "gap-2.5")}>
                    <div
                      className={cn(
                        "flex size-14 shrink-0 items-center justify-center rounded-full",
                        isMobileLayout && "size-10",
                        toneClassMap[card.tone].icon,
                      )}
                    >
                      <Icon className={cn("size-6", isMobileLayout && "size-4.5")} />
                    </div>
                    <div className="min-w-0">
                      <div className={cn(
                        "text-[42px] leading-none tracking-[-0.05em]",
                        isMobileLayout && "text-2xl font-semibold"
                      )}>
                        {card.value}
                      </div>
                      <div className={cn(
                        "mt-2 text-[15px] leading-5 text-muted-foreground",
                        isMobileLayout && "mt-1 text-[11px] leading-tight"
                      )}>
                        {card.label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className={cn("space-y-4", isMobileLayout && "space-y-3")}>
            {filteredItems.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-border/55 bg-card px-6 py-12 text-center text-[15px] text-muted-foreground">
                {roleConfig.emptyStateTitle}
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
                      "w-full rounded-[16px] border bg-card px-5 py-5 text-left shadow-sm transition-colors hover:border-primary/50",
                      isMobileLayout && "px-4 py-4 rounded-2xl border-border/50 shadow-none",
                      isSelected ? "border-primary bg-primary/[0.02]" : "border-border/55",
                    )}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className={cn("min-w-0 flex-1", isMobileLayout && "gap-1")}>
                        <div className="flex items-center justify-between">
                          <div className={cn(
                            "min-h-7 text-[16px] font-medium text-foreground",
                            isMobileLayout && "text-sm min-h-0"
                          )}>
                            {item.buyerName === "Unassigned buyer" ? "—" : item.buyerName}
                          </div>
                          {isMobileLayout && (
                             <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                                toneClassMap[item.stateTone].badge,
                              )}
                            >
                              {shortStatusLabel(item.status)}
                            </span>
                          )}
                        </div>
                        
                        <div className={cn(
                          "mt-4 flex flex-wrap items-center gap-3 text-[15px]",
                          isMobileLayout && "mt-1.5 text-xs gap-2"
                        )}>
                          <span className="font-semibold text-primary">#{item.id}</span>
                          {item.isNew && (
                            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                              New
                            </span>
                          )}
                          {item.sourceBadge && (
                            <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                              {item.sourceBadge}
                            </span>
                          )}
                          {item.mentionCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              <AtSign className="size-3" />
                              {item.mentionCount}
                            </span>
                          )}
                          {item.unreadCount > 0 && (
                            <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                              {item.unreadCount}
                            </span>
                          )}
                          {!isMobileLayout && <span className="text-muted-foreground">▢</span>}
                          {isMobileLayout && (
                             <span className="text-muted-foreground/60 text-[10px]">{item.ageLabel}</span>
                          )}
                        </div>

                        {!isMobileLayout ? (
                          <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span>{item.ageLabel}</span>
                            <span>RM, {item.assignedCMName}</span>
                            <span>{item.categoriesLabel}</span>
                            <span>{item.regionLabel}</span>
                          </div>
                        ) : (
                          <div className="mt-4 grid grid-cols-2 gap-y-2 text-[11px] text-muted-foreground">
                             <div className="flex flex-col">
                                <span className="text-[10px] opacity-60 uppercase tracking-wider font-medium">RM</span>
                                <span className="mt-0.5 text-foreground/80">{item.assignedCMName}</span>
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[10px] opacity-60 uppercase tracking-wider font-medium">Category</span>
                                <span className="mt-0.5 text-foreground/80 truncate">{item.categoriesLabel}</span>
                             </div>
                          </div>
                        )}
                      </div>

                      <div className={cn(
                        "flex min-w-[140px] flex-col items-start gap-5 lg:items-end",
                        isMobileLayout && "min-w-0 gap-0 pt-3 border-t border-border/40 mt-1 flex-row items-center justify-between"
                      )}>
                        {!isMobileLayout && (
                          <span
                            className={cn(
                              "rounded-md px-3 py-1 text-xs font-medium",
                              toneClassMap[item.stateTone].badge,
                            )}
                          >
                            {shortStatusLabel(item.status)}
                          </span>
                        )}
                        <div className={cn("text-right", isMobileLayout && "text-left")}>
                          <div className={cn(
                            "text-[18px] font-medium text-foreground",
                            isMobileLayout && "text-base font-bold text-primary"
                          )}>
                            {item.valueLabel}
                          </div>
                          {!isMobileLayout && (
                             <div className="mt-8 text-sm text-muted-foreground">
                              CM, {item.assignedCMName}
                            </div>
                          )}
                        </div>
                        {isMobileLayout && (
                           <div className="text-[11px] text-muted-foreground font-medium">
                              {item.regionLabel}
                           </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </section>
      </div>

      {isMobileLayout && hasActiveFilters && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
           <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setDraftFilters(DEFAULT_FILTERS);
              setAppliedFilters(DEFAULT_FILTERS);
              onSearchChange("");
            }}
            className="rounded-full shadow-lg border border-primary/20 bg-card/90 backdrop-blur text-primary text-[10px] px-4 h-8"
          >
            Clear {Object.values(appliedFilters).filter(v => v !== 'all' && v !== '' && v !== '90d' && v !== 'latest').length} Filters
          </Button>
        </div>
      )}

      {/* FAB */}
      <div className={cn(
        "fixed bottom-8 right-8 z-50",
        isMobileLayout && "bottom-[calc(var(--mweb-tab-bar-height)+16px)] right-6"
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              className={cn(
                "size-16 rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform hover:scale-110 active:scale-95",
                isMobileLayout && "size-14"
              )}
            >
              <Plus className={cn("size-8", isMobileLayout && "size-7")} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="mb-4 w-56 rounded-[24px] p-2 border-border bg-card/95 backdrop-blur-xl shadow-2xl">
            <DropdownMenuItem 
              onClick={onCreatePlaceholder}
              className="rounded-[16px] py-4 text-[15px] font-medium transition-colors hover:bg-primary/5 gap-3"
            >
              <Plus className="size-4 shrink-0" />
              Quick RFQ
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onOpenDetailedRFQCreation}
              className="rounded-[16px] py-4 text-[15px] font-medium transition-colors hover:bg-primary/5 gap-3"
            >
              <FileText className="size-4 shrink-0" />
              Detailed RFQ
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onFabDirectOrder}
              className="rounded-[16px] py-4 text-[15px] font-medium transition-colors hover:bg-primary/5 gap-3"
            >
              <Package className="size-4 shrink-0" />
              Direct Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
);
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-3">
      <span className="text-[15px] font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function SimpleSelect({
  value,
  onValueChange,
  options,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-11 rounded-[14px] border-border bg-background text-left text-[15px] shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-border bg-card">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function buildOptions(values: string[]): Array<{ value: string; label: string }> {
  const uniqueValues = Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean).filter((value) => value !== "—")),
  );

  return uniqueValues
    .sort((left, right) => left.localeCompare(right))
    .map((value) => ({ value, label: value }));
}

function resolveSearchFieldValue(
  item: PlutoListItemViewModel,
  searchField: SearchField,
): string {
  switch (searchField) {
    case "enquiry":
      return item.id;
    case "buyer":
      return item.buyerName;
    case "rm":
      return item.assignedCMName;
    case "category":
      return item.categoriesLabel;
    default:
      return [
        item.id,
        item.buyerName,
        item.assignedCMName,
        item.categoriesLabel,
        item.regionLabel,
        item.status,
      ].join(" ");
  }
}

function resolveTimePeriodDays(timePeriod: TimePeriod): number | null {
  switch (timePeriod) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    default:
      return null;
  }
}

function sortItems(items: PlutoListItemViewModel[], sort: SortOption): PlutoListItemViewModel[] {
  const sorted = [...items];

  switch (sort) {
    case "oldest":
      return sorted.sort((left, right) => left.createdAtTime - right.createdAtTime);
    case "buyer-asc":
      return sorted.sort((left, right) => left.buyerName.localeCompare(right.buyerName));
    case "buyer-desc":
      return sorted.sort((left, right) => right.buyerName.localeCompare(left.buyerName));
    case "value-desc":
      return sorted.sort((left, right) => parseValue(right.valueLabel) - parseValue(left.valueLabel));
    case "latest":
    default:
      return sorted.sort((left, right) => right.createdAtTime - left.createdAtTime);
  }
}

function parseValue(valueLabel: string): number {
  const digits = valueLabel.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

function shortStatusLabel(status: string): string {
  switch (status) {
    case "Pending Response":
      return "Draft";
    case "Pending Approval":
      return "Pending Approval";
    case "Converted to Order":
      return "Converted";
    default:
      return status;
  }
}

function filtersEqual(left: PlutoFilters, right: PlutoFilters): boolean {
  return (
    left.searchField === right.searchField &&
    left.searchText === right.searchText &&
    left.timePeriod === right.timePeriod &&
    left.buyer === right.buyer &&
    left.status === right.status &&
    left.sort === right.sort &&
    left.rm === right.rm &&
    left.category === right.category &&
    left.region === right.region
  );
}

const toneClassMap: Record<
  PlutoStateTone,
  {
    badge: string;
    card: string;
    icon: string;
  }
> = {
  neutral: {
    badge: "bg-primary/10 text-primary",
    card: "border-border/55",
    icon: "bg-primary text-primary-foreground",
  },
  accent: {
    badge: "bg-primary/10 text-primary",
    card: "border-border/55",
    icon: "bg-primary text-primary-foreground",
  },
  warning: {
    badge: "bg-destructive/10 text-destructive",
    card: "border-border/55",
    icon: "bg-destructive text-destructive-foreground",
  },
  success: {
    badge: "bg-green-500/10 text-green-600",
    card: "border-border/55",
    icon: "bg-green-500 text-white",
  },
};
