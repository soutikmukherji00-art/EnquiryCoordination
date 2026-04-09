import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Clock3, FileText, Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
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
  onCreatePlaceholder: _onCreatePlaceholder,
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

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f5ef] text-[#1f2126]">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-4 pb-8 pt-4 md:px-6 md:pb-10 md:pt-6">
          <section className="rounded-[28px] border border-[#dfdcd3] bg-[#fcfbf8] px-5 py-5 shadow-[0_18px_48px_rgba(31,33,38,0.06)] md:px-6">
            <h1 className="text-[32px] font-medium tracking-[-0.04em] text-[#26282d] md:text-[36px]">
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
                    <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8e8b84]" />
                    <Input
                      value={draftFilters.searchText}
                      onChange={(event) =>
                        setDraftFilters((current) => ({
                          ...current,
                          searchText: event.target.value,
                        }))
                      }
                      placeholder="Type 3 letters"
                      className="h-11 rounded-[14px] border-[#e1ddd4] bg-white pl-11 text-sm text-[#26282d] shadow-none placeholder:text-[#b1ada6]"
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
                  className="h-11 px-2 text-base font-medium text-[#17384a] hover:bg-transparent hover:text-[#0f2d3e]"
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setAppliedFilters(draftFilters);
                    onSearchChange(draftFilters.searchText.trim());
                  }}
                  className="h-12 rounded-[12px] bg-[#072d3e] px-6 text-base font-medium text-white hover:bg-[#0d394d]"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((card) => {
              const Icon = kpiIconMap[card.id] ?? Clock3;
              return (
                <div
                  key={card.id}
                  className={cn(
                    "rounded-[18px] border bg-white px-6 py-5 shadow-[0_10px_28px_rgba(31,33,38,0.04)]",
                    toneClassMap[card.tone].card,
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex size-14 shrink-0 items-center justify-center rounded-full",
                        toneClassMap[card.tone].icon,
                      )}
                    >
                      <Icon className="size-6" />
                    </div>
                    <div>
                      <div className="text-[42px] leading-none tracking-[-0.05em] text-[#26282d]">
                        {card.value}
                      </div>
                      <div className="mt-2 text-[15px] leading-5 text-[#2f3238]">
                        {card.label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[#d9d4c8] bg-white px-6 py-12 text-center text-[15px] text-[#5b6068]">
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
                      "w-full rounded-[16px] border bg-white px-5 py-5 text-left shadow-[0_8px_20px_rgba(31,33,38,0.04)] transition-colors hover:border-[#c9d7de]",
                      isSelected ? "border-[#8bb6c6]" : "border-[#e5e1d8]",
                    )}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="min-h-7 text-[16px] font-medium text-[#4a4f56]">
                          {item.buyerName === "Unassigned buyer" ? "—" : item.buyerName}
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-[15px] text-[#2f3238]">
                          <span className="font-medium">#{item.id}</span>
                          <span className="text-[#8f9aa6]">▢</span>
                        </div>
                        <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-[#77838f]">
                          <span>{item.ageLabel}</span>
                          <span>RM, {item.assignedCMName}</span>
                          <span>{item.categoriesLabel}</span>
                          <span>{item.regionLabel}</span>
                        </div>
                      </div>

                      <div className="flex min-w-[140px] flex-col items-start gap-5 lg:items-end">
                        <span
                          className={cn(
                            "rounded-md px-3 py-1 text-xs font-medium",
                            toneClassMap[item.stateTone].badge,
                          )}
                        >
                          {shortStatusLabel(item.status)}
                        </span>
                        <div className="text-right">
                          <div className="text-[18px] font-medium text-[#2f3238]">
                            {item.valueLabel}
                          </div>
                          <div className="mt-8 text-sm text-[#8b96a1]">
                            CM, {item.assignedCMName}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </section>
        </div>
      </div>

      {isMobileLayout && hasActiveFilters && (
        <div className="border-t border-[#ddd8ce] bg-[#fcfbf8] px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setDraftFilters(DEFAULT_FILTERS);
              setAppliedFilters(DEFAULT_FILTERS);
              onSearchChange("");
            }}
            className="h-11 w-full rounded-[12px] border border-[#ddd8ce] bg-white text-sm font-medium text-[#17384a]"
          >
            Reset Filters
          </Button>
        </div>
      )}
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
      <span className="text-[15px] font-medium text-[#54697a]">{label}</span>
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
      <SelectTrigger className="h-11 rounded-[14px] border-[#e1ddd4] bg-white text-left text-[15px] text-[#2f3238] shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-[#ddd8ce] bg-white">
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
      return "Pending";
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
    badge: "bg-[#eef2ff] text-[#6a63d9]",
    card: "border-[#ddd8ce]",
    icon: "bg-[#7a70eb] text-white",
  },
  accent: {
    badge: "bg-[#eef2ff] text-[#6a63d9]",
    card: "border-[#ddd8ce]",
    icon: "bg-[#7a70eb] text-white",
  },
  warning: {
    badge: "bg-[#eef8e9] text-[#80ae59]",
    card: "border-[#ddd8ce]",
    icon: "bg-[#ffb84d] text-white",
  },
  success: {
    badge: "bg-[#d8f0d2] text-[#6fa04e]",
    card: "border-[#ddd8ce]",
    icon: "bg-[#66a3df] text-white",
  },
};
