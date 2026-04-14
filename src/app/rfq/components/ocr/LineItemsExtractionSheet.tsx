import { useEffect, useMemo, useState } from "react";
import { FileText, Search, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/app/components/ui/sheet";
import {
  addCatalogSelectionsToCart,
  filterEnquiryCartItems,
  removeEnquiryCartItemAtIndex,
  type EnquiryProductLine,
} from "@/domain/enquiry/enquiry.cart";
import { AddItemsDrawer } from "./AddItemsDrawer";

interface LineItemsExtractionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: EnquiryProductLine[];
  poDocumentName: string;
  poDocumentUrl: string;
  onSave: (items: EnquiryProductLine[]) => void;
}

export function LineItemsExtractionSheet({
  open,
  onOpenChange,
  items,
  poDocumentName,
  poDocumentUrl,
  onSave,
}: LineItemsExtractionSheetProps) {
  const [draftItems, setDraftItems] = useState<EnquiryProductLine[]>(items);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddItemsDrawerOpen, setIsAddItemsDrawerOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setDraftItems(items);
      setSearchQuery("");
    }
  }, [items, open]);

  const filteredItems = useMemo(() => filterEnquiryCartItems(draftItems, searchQuery), [draftItems, searchQuery]);

  const handleDelete = (index: number) => {
    setDraftItems((current) => removeEnquiryCartItemAtIndex(current, index));
  };

  const handleQuantityChange = (index: number, quantity: string) => {
    setDraftItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity: quantity.trim() || undefined } : item,
      ),
    );
  };

  const handleAddItems = (itemIds: string[]) => {
    setDraftItems((current) => addCatalogSelectionsToCart(current, itemIds, "Steel & Allied"));
    setIsAddItemsDrawerOpen(false);
  };

  const handleSave = () => {
    onSave(draftItems);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full max-w-[620px] p-0">
          <SheetHeader className="border-b border-border/60 px-4 py-3">
            <SheetTitle>Line Items ({draftItems.length})</SheetTitle>
          </SheetHeader>

          <div className="flex flex-1 min-h-0 flex-col">
            <div className="border-b border-border/60 px-4 py-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search Item"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {filteredItems.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                  No matching line items.
                </p>
              ) : (
                filteredItems.map(({ product, index }) => (
                  <article key={`${product.name || product.category}-${index}`} className="rounded-xl border border-border/60 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{product.name || product.category}</p>
                        <p className="text-xs text-muted-foreground">{product.category || "Uncategorized"}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(index)} aria-label="Delete line item">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="mt-3">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Quantity</label>
                      <Input
                        value={product.quantity || ""}
                        onChange={(event) => handleQuantityChange(index, event.target.value)}
                        placeholder="Enter quantity"
                      />
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <SheetFooter className="border-t border-border/60 p-4">
            <div className="flex w-full flex-col gap-3">
              <a
                href={poDocumentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <FileText className="size-4" />
                {poDocumentName}
              </a>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => setIsAddItemsDrawerOpen(true)}>
                  + Add Item
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AddItemsDrawer
        open={isAddItemsDrawerOpen}
        onOpenChange={setIsAddItemsDrawerOpen}
        onAddItems={handleAddItems}
        existingLineItemNames={draftItems.map((item) => item.name || item.category || "")}
      />
    </>
  );
}
