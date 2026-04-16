import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  ClipboardList,
  ChevronDown,
  Clock3,
  FileText,
  Filter,
  MessageSquare,
  Search,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { cn } from "@/app/components/ui/utils";
import { MobileHeader } from "@/app/components/ui/MobileHeader";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet";
import type { PlutoKpiCardViewModel } from "@/app/pluto/pluto.types";
import { getEnquiryStatusDotClass } from "@/app/enquiry/enquiryStatusPresentation";
import type { RfqListRowViewModel } from "./rfq.view-models";

type SearchField = "all" | "enquiry" | "buyer" | "rm";
type TimePeriod = "30d" | "7d" | "90d" | "all";
type SortOption = "latest" | "oldest" | "buyer-asc" | "buyer-desc" | "value-desc";

interface RfqFilters {
  searchField: SearchField;
  searchText: string;
  timePeriod: TimePeriod;
  buyer: string;
  status: string;
  sort: SortOption;
  rm: string;
  region: string;
  orderChampion: string;
  customerChampion: string;
  dependencyReason: string;
}

const SEARCH_FIELD_OPTIONS: Array<{ value: SearchField; label: string }> = [
  { value: "all", label: "All" },
  { value: "enquiry", label: "RFQ Number" },
  { value: "buyer", label: "Buyer" },
  { value: "rm", label: "RM Name" },
];

const TIME_PERIOD_OPTIONS: Array<{ value: TimePeriod; label: string }> = [
  { value: "90d", label: "Last 3 months" },
  { value: "30d", label: "Last 30 days" },
  { value: "7d", label: "Last 7 days" },
  { value: "all", label: "All time" },
];

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "latest", label: "Last Modified Date" },
  { value: "oldest", label: "Oldest first" },
  { value: "buyer-asc", label: "Buyer A-Z" },
  { value: "buyer-desc", label: "Buyer Z-A" },
  { value: "value-desc", label: "Value high-low" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "--Select--" },
  { value: "Converted to Order", label: "Converted to Order" },
];

const PLACEHOLDER_FILTER = [{ value: "all", label: "--Select--" }];

const DEFAULT_FILTERS: RfqFilters = {
  searchField: "all",
  searchText: "",
  timePeriod: "90d",
  buyer: "all",
  status: "all",
  sort: "latest",
  rm: "all",
  region: "all",
  orderChampion: "all",
  customerChampion: "all",
  dependencyReason: "all",
};

interface StatusTabViewModel {
  id: string;
  label: string;
  count: string;
  statusValue: string;
  icon: LucideIcon;
  iconClassName: string;
}

interface RfqListPageProps {
  rows: RfqListRowViewModel[];
  kpiCards: PlutoKpiCardViewModel[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenRfqDetails: (rfqId: string) => void;
  onCreateQuickRfq: () => void;
  onCreateDetailedRfq: () => void;
  onDirectOrder: () => void;
  isMobileLayout?: boolean;
}

export function RfqListPage({
  rows,
  kpiCards,
  searchQuery,
  onSearchChange,
  onOpenRfqDetails,
  onCreateQuickRfq,
  onCreateDetailedRfq,
  onDirectOrder,
  isMobileLayout = false,
}: RfqListPageProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [draftFilters, setDraftFilters] = useState<RfqFilters>(() => ({
    ...DEFAULT_FILTERS,
    searchText: searchQuery,
  }));
  const [appliedFilters, setAppliedFilters] = useState<RfqFilters>(() => ({
    ...DEFAULT_FILTERS,
    searchText: searchQuery,
  }));

  useEffect(() => {
    setDraftFilters((current) => ({ ...current, searchText: searchQuery }));
    setAppliedFilters((current) => ({ ...current, searchText: searchQuery }));
  }, [searchQuery]);

  const buyerOptions = useMemo(
    () => buildOptions(rows.map((row) => row.buyerName)),
    [rows],
  );
  const rmOptions = useMemo(
    () => buildOptions(rows.map((row) => row.rmNameLabel)),
    [rows],
  );
  const regionOptions = useMemo(
    () => buildOptions(rows.map((row) => row.regionLabel)),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const now = Date.now();
    const periodDays = resolveTimePeriodDays(appliedFilters.timePeriod);
    const filtered = rows.filter((row) => {
      if (
        appliedFilters.status !== "all" &&
        row.status !== appliedFilters.status
      ) {
        return false;
      }
      if (appliedFilters.buyer !== "all" && row.buyerName !== appliedFilters.buyer) {
        return false;
      }
      if (appliedFilters.rm !== "all" && row.rmNameLabel !== appliedFilters.rm) {
        return false;
      }
      if (appliedFilters.region !== "all" && row.regionLabel !== appliedFilters.region) {
        return false;
      }
      if (periodDays !== null) {
        const ageInDays = (now - row.createdAtTime) / (1000 * 60 * 60 * 24);
        if (ageInDays > periodDays) {
          return false;
        }
      }

      const query = appliedFilters.searchText.trim().toLowerCase();
      if (!query) {
        return true;
      }

      const haystack = resolveSearchFieldValue(row, appliedFilters.searchField)
        .toLowerCase();
      return haystack.includes(query);
    });

    return sortRows(filtered, appliedFilters.sort);
  }, [appliedFilters, rows]);

  const hasActiveFilters = !filtersEqual(appliedFilters, DEFAULT_FILTERS);
  const statusTabs = useMemo(
    () =>
      kpiCards
        .map((card) => {
          const statusValue = resolveStatusFromCardId(card.id);
          const tabVisual = resolveStatusTabVisual(card.id);
          if (!statusValue || !tabVisual) {
            return null;
          }
          return {
            id: card.id,
            label: card.label,
            count: card.value,
            statusValue,
            icon: tabVisual.icon,
            iconClassName: tabVisual.iconClassName,
          } satisfies StatusTabViewModel;
        })
        .filter((tab): tab is StatusTabViewModel => tab !== null),
    [kpiCards],
  );

  const allVisibleSelected =
    filteredRows.length > 0 &&
    filteredRows.every((row) => selectedIds.has(row.id));

  const toggleAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        for (const row of filteredRows) {
          next.add(row.id);
        }
      } else {
        for (const row of filteredRows) {
          next.delete(row.id);
        }
      }
      return next;
    });
  };

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const renderDesktopHeader = () => (
    <section className="rounded-[28px] border border-border/55 bg-card px-5 py-5 shadow-sm md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <h1 className="text-[32px] font-medium tracking-[-0.04em] md:text-[36px]">
          Buyer RFQ List
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled
            className="h-11 rounded-[12px] px-5 text-muted-foreground"
          >
            Bulk Update
          </Button>
          <DropdownMenu>
            <div className="flex rounded-[12px] overflow-hidden border border-primary shadow-sm">
              <Button
                type="button"
                className="h-11 rounded-none px-5"
                onClick={onCreateDetailedRfq}
              >
                Create RFQ
              </Button>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  className="h-11 rounded-none border-l border-primary/30 px-2"
                  aria-label="More create options"
                >
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={onCreateQuickRfq}>
                Quick RFQ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateDetailedRfq}>
                Detailed RFQ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDirectOrder}>
                Direct Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[repeat(4,minmax(0,1fr))]">
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
                placeholder="Search"
                className="h-11 rounded-[14px] border-border bg-background pl-11 text-sm shadow-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
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

        <FilterField label="Region">
          <SimpleSelect
            value={draftFilters.region}
            onValueChange={(value) =>
              setDraftFilters((current) => ({ ...current, region: value }))
            }
            options={[{ value: "all", label: "--Select--" }, ...regionOptions]}
          />
        </FilterField>

        <FilterField label="Creation Date">
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

        <FilterField label="Sort By">
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

        <FilterField label="Order Champion">
          <SimpleSelect
            value={draftFilters.orderChampion}
            onValueChange={(value) =>
              setDraftFilters((current) => ({
                ...current,
                orderChampion: value,
              }))
            }
            options={PLACEHOLDER_FILTER}
          />
        </FilterField>

        <FilterField label="Customer Champion">
          <SimpleSelect
            value={draftFilters.customerChampion}
            onValueChange={(value) =>
              setDraftFilters((current) => ({
                ...current,
                customerChampion: value,
              }))
            }
            options={PLACEHOLDER_FILTER}
          />
        </FilterField>

        <FilterField label="Dependency Reason">
          <SimpleSelect
            value={draftFilters.dependencyReason}
            onValueChange={(value) =>
              setDraftFilters((current) => ({
                ...current,
                dependencyReason: value,
              }))
            }
            options={PLACEHOLDER_FILTER}
          />
        </FilterField>

        <FilterField label="Buyer">
          <SimpleSelect
            value={draftFilters.buyer}
            onValueChange={(value) =>
              setDraftFilters((current) => ({ ...current, buyer: value }))
            }
            options={[{ value: "all", label: "--Select--" }, ...buyerOptions]}
          />
        </FilterField>

        <FilterField label="RM Name">
          <SimpleSelect
            value={draftFilters.rm}
            onValueChange={(value) =>
              setDraftFilters((current) => ({ ...current, rm: value }))
            }
            options={[{ value: "all", label: "--Select--" }, ...rmOptions]}
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

  const renderMobileFilters = () => (
    <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-border/55 bg-card px-4 py-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={draftFilters.searchText}
          onChange={(event) => {
            const val = event.target.value;
            setDraftFilters((current) => ({ ...current, searchText: val }));
            setAppliedFilters((current) => ({ ...current, searchText: val }));
            onSearchChange(val);
          }}
          placeholder="Search..."
          className="h-9 rounded-full border-border bg-muted/50 pl-9 text-xs shadow-none"
        />
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-full text-xs">
            <Filter className={cn("size-3", hasActiveFilters && "fill-primary text-primary")} />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-[32px] px-6 pb-10">
          <SheetHeader className="mb-6 border-b border-border/55 pb-4">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow the RFQ list</SheetDescription>
          </SheetHeader>
          <div className="max-h-full space-y-6 overflow-y-auto pb-20">
            <FilterField label="Creation Date">
              <SimpleSelect
                value={draftFilters.timePeriod}
                onValueChange={(value) =>
                  setDraftFilters((c) => ({
                    ...c,
                    timePeriod: value as TimePeriod,
                  }))
                }
                options={TIME_PERIOD_OPTIONS}
              />
            </FilterField>
            <FilterField label="Status">
              <SimpleSelect
                value={draftFilters.status}
                onValueChange={(value) =>
                  setDraftFilters((c) => ({ ...c, status: value }))
                }
                options={STATUS_FILTER_OPTIONS}
              />
            </FilterField>
            <FilterField label="Sort">
              <SimpleSelect
                value={draftFilters.sort}
                onValueChange={(value) =>
                  setDraftFilters((c) => ({ ...c, sort: value as SortOption }))
                }
                options={SORT_OPTIONS}
              />
            </FilterField>
            <FilterField label="Buyer">
              <SimpleSelect
                value={draftFilters.buyer}
                onValueChange={(value) =>
                  setDraftFilters((c) => ({ ...c, buyer: value }))
                }
                options={[{ value: "all", label: "All" }, ...buyerOptions]}
              />
            </FilterField>
            <FilterField label="RM Name">
              <SimpleSelect
                value={draftFilters.rm}
                onValueChange={(value) =>
                  setDraftFilters((c) => ({ ...c, rm: value }))
                }
                options={[{ value: "all", label: "All" }, ...rmOptions]}
              />
            </FilterField>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex gap-3 border-t border-border/55 bg-card p-6">
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-xl"
              onClick={() => {
                setDraftFilters(DEFAULT_FILTERS);
                setAppliedFilters(DEFAULT_FILTERS);
                onSearchChange("");
              }}
            >
              Reset
            </Button>
            <Button
              className="h-12 flex-2 rounded-xl"
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
        <MobileHeader title="RFQ list" subtitle={`${filteredRows.length} converted RFQs`} />
      )}

      <div className="flex-1 overflow-y-auto">
        {isMobileLayout && renderMobileFilters()}

        <div
          className={cn(
            "mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-4 pb-8 pt-4 md:px-6 md:pb-10 md:pt-6",
            isMobileLayout && "gap-4 px-3",
          )}
        >
          {!isMobileLayout && renderDesktopHeader()}

          <section className="rounded-2xl border border-border/55 bg-card p-2 shadow-sm">
            <div
              className={cn(
                "flex flex-wrap gap-2",
                isMobileLayout &&
                  "flex-nowrap overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              )}
            >
              {statusTabs.map((tab) => {
                const isActive = appliedFilters.status === tab.statusValue;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setDraftFilters((current) => ({ ...current, status: tab.statusValue }));
                      setAppliedFilters((current) => ({ ...current, status: tab.statusValue }));
                    }}
                    className={cn(
                      "inline-flex min-w-[164px] items-center gap-3 whitespace-nowrap rounded-xl border bg-background px-3.5 py-2.5 text-left transition-colors",
                      isActive
                        ? "border-primary/35 bg-primary/[0.04]"
                        : "border-border/60 hover:border-border/90",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        tab.iconClassName,
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="flex min-w-0 flex-col leading-tight">
                      <span className="text-lg font-semibold text-foreground">{tab.count}</span>
                      <span className={cn("truncate text-xs", isActive ? "text-foreground" : "text-muted-foreground")}>
                        {tab.label}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[20px] border border-border/55 bg-card shadow-sm overflow-hidden">
            {filteredRows.length === 0 ? (
              <div className="px-6 py-12 text-center text-[15px] text-muted-foreground">
                No converted RFQs match the current filters.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allVisibleSelected}
                        onCheckedChange={(v) => toggleAllVisible(v === true)}
                        aria-label="Select all rows"
                      />
                    </TableHead>
                    <TableHead>RFQ Number</TableHead>
                    <TableHead>Buyer Name</TableHead>
                    <TableHead>RFQ Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>RFQ Value</TableHead>
                    <TableHead>Order Champion</TableHead>
                    <TableHead>RM Name</TableHead>
                    <TableHead>CM Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(row.id)}
                          onCheckedChange={(v) => toggleRow(row.id, v === true)}
                          aria-label={`Select ${row.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => onOpenRfqDetails(row.id)}
                          className="font-medium text-primary hover:underline"
                        >
                          {row.id}
                        </button>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {row.buyerName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {row.rfqDateLabel}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={cn(
                              "size-2 shrink-0 rounded-full",
                              getEnquiryStatusDotClass(row.status),
                            )}
                          />
                          {shortStatusLabel(row.status)}
                        </span>
                      </TableCell>
                      <TableCell>{row.valueLabel}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.orderChampionLabel}
                      </TableCell>
                      <TableCell>{row.rmNameLabel}</TableCell>
                      <TableCell>{row.cmNameLabel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
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

function resolveSearchFieldValue(row: RfqListRowViewModel, searchField: SearchField): string {
  switch (searchField) {
    case "enquiry":
      return row.id;
    case "buyer":
      return row.buyerName;
    case "rm":
      return row.rmNameLabel;
    default:
      return [
        row.id,
        row.buyerName,
        row.rmNameLabel,
        row.cmNameLabel,
        row.regionLabel,
        row.status,
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

function sortRows(rows: RfqListRowViewModel[], sort: SortOption): RfqListRowViewModel[] {
  const sorted = [...rows];

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
    case "Converted to Order":
      return "Converted To Order";
    case "Awaiting Response":
      return "Awaiting Response";
    case "CM Responded":
      return "CM Responded";
    case "Pending Response":
      return "Pending Response";
    default:
      return status;
  }
}

function filtersEqual(left: RfqFilters, right: RfqFilters): boolean {
  return (
    left.searchField === right.searchField &&
    left.searchText === right.searchText &&
    left.timePeriod === right.timePeriod &&
    left.buyer === right.buyer &&
    left.status === right.status &&
    left.sort === right.sort &&
    left.rm === right.rm &&
    left.region === right.region &&
    left.orderChampion === right.orderChampion &&
    left.customerChampion === right.customerChampion &&
    left.dependencyReason === right.dependencyReason
  );
}

function resolveStatusFromCardId(cardId: string): string | null {
  switch (cardId) {
    case "total":
      return null;
    case "in-flight":
    case "awaiting-response":
      return "Awaiting Response";
    case "cm-responded":
      return "CM Responded";
    case "pending-response":
      return "Pending Response";
    case "converted":
      return "Converted to Order";
    case "draft":
      return "Draft";
    default:
      return null;
  }
}

function resolveStatusTabVisual(
  cardId: string,
): { icon: LucideIcon; iconClassName: string } | null {
  switch (cardId) {
    case "in-flight":
    case "awaiting-response":
      return { icon: Clock3, iconClassName: "bg-violet-500/15 text-violet-600" };
    case "cm-responded":
      return { icon: MessageSquare, iconClassName: "bg-amber-500/15 text-amber-600" };
    case "pending-response":
      return { icon: FileText, iconClassName: "bg-sky-500/15 text-sky-600" };
    case "converted":
      return { icon: BadgeCheck, iconClassName: "bg-green-500/15 text-green-600" };
    case "draft":
      return { icon: ClipboardList, iconClassName: "bg-slate-500/15 text-slate-600" };
    default:
      return null;
  }
}
