import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/app/components/ui/drawer";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { ENQUIRY_CART_CATALOG_ITEMS, type EnquiryCartCatalogItem } from "@/domain/enquiry/enquiry.cart";

interface AddItemsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItems: (itemIds: string[]) => void;
  existingLineItemNames: string[];
}

const BRAND_BY_ITEM_ID: Record<string, string> = {
  "tmt-rebar": "Birla TMT",
  "beams-ismb-200": "Birla Structural",
  "angles-isa-50": "Birla Structural",
  "vitrified-tile-800x2400": "Birla Pivot",
  "vitero-presto": "Vitero",
  "calacatta-white": "Vitero",
};

function getItemBrand(item: EnquiryCartCatalogItem): string {
  return BRAND_BY_ITEM_ID[item.id] || "Generic";
}

export function AddItemsDrawer({
  open,
  onOpenChange,
  onAddItems,
  existingLineItemNames,
}: AddItemsDrawerProps) {
  const [activeTab, setActiveTab] = useState<"Steel & Allied" | "All Categories">("Steel & Allied");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [queuedItemIds, setQueuedItemIds] = useState<Set<string>>(new Set());

  const existingNameSet = useMemo(
    () => new Set(existingLineItemNames.map((name) => name.trim().toLowerCase()).filter(Boolean)),
    [existingLineItemNames],
  );

  const availableItems = useMemo(() => {
    return ENQUIRY_CART_CATALOG_ITEMS.filter((item) => {
      if (activeTab === "Steel & Allied" && item.category !== "Steel & Allied") {
        return false;
      }
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }
      if (brandFilter !== "all" && getItemBrand(item) !== brandFilter) {
        return false;
      }

      const query = searchQuery.trim().toLowerCase();
      if (!query) {
        return true;
      }

      return `${item.name} ${item.description} ${item.category} ${getItemBrand(item)}`
        .toLowerCase()
        .includes(query);
    });
  }, [activeTab, brandFilter, categoryFilter, searchQuery]);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(ENQUIRY_CART_CATALOG_ITEMS.map((item) => item.category))).sort((left, right) =>
      left.localeCompare(right),
    );
  }, []);

  const brandOptions = useMemo(() => {
    return Array.from(new Set(ENQUIRY_CART_CATALOG_ITEMS.map((item) => getItemBrand(item)))).sort((left, right) =>
      left.localeCompare(right),
    );
  }, []);

  const toggleQueuedItem = (itemId: string) => {
    setQueuedItemIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleAddItems = () => {
    const selected = Array.from(queuedItemIds);
    onAddItems(selected);
    setQueuedItemIds(new Set());
    setSearchQuery("");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-screen w-full max-w-[620px] border-l">
        <DrawerHeader className="border-b border-border/60">
          <DrawerTitle>Add Items</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto p-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList className="grid h-10 w-full grid-cols-2">
              <TabsTrigger value="Steel & Allied">Steel & Allied</TabsTrigger>
              <TabsTrigger value="All Categories">All Categories</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-3 md:grid-cols-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands</SelectItem>
                {brandOptions.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by item name"
              className="pl-9"
            />
          </div>

          <div className="space-y-2">
            {availableItems.map((item) => {
              const isQueued = queuedItemIds.has(item.id);
              const alreadyLinked = existingNameSet.has(item.name.trim().toLowerCase());
              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-card px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {item.category} · {getItemBrand(item)}
                    </p>
                    {alreadyLinked ? (
                      <p className="mt-1 text-[11px] font-medium text-amber-600">Already linked</p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant={isQueued ? "secondary" : "outline"}
                    size="sm"
                    disabled={alreadyLinked}
                    onClick={() => toggleQueuedItem(item.id)}
                  >
                    <Plus className="mr-1 size-3.5" />
                    {isQueued ? "Queued" : "Add"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <DrawerFooter className="border-t border-border/60 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddItems} disabled={queuedItemIds.size === 0}>
            Add Items ({queuedItemIds.size})
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
