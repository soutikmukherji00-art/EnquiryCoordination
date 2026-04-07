/**
 * Generic Multi-Select Modal Component
 * 
 * Reusable modal for selecting multiple items from a list with search
 */

import { useState, useMemo, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { SearchInput } from "./SearchInput";
import { EmptyState } from "./EmptyState";

export interface MultiSelectModalProps<T> {
  isOpen: boolean;
  title: string;
  description?: string;
  items: T[];
  selectedIds?: Set<string>;
  onConfirm: (selectedIds: string[]) => void;
  onClose: () => void;

  // Customization
  searchPlaceholder?: string;
  confirmButtonText?: string;
  emptyStateMessage?: string;
  emptyStateIcon?: ReactNode;
  messagePreview?: string;
  helperText?: string;

  // Grouping (optional)
  groupBy?: (item: T) => string;
  groupLabel?: (groupKey: string, count: number) => string;

  // Required functions
  getItemId: (item: T) => string;
  getItemSearchText: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  filterItem?: (item: T, query: string) => boolean;
}

export function MultiSelectModal<T>({
  isOpen,
  title,
  description,
  items,
  selectedIds: externalSelectedIds,
  onConfirm,
  onClose,
  searchPlaceholder = "Search...",
  confirmButtonText = "Confirm",
  emptyStateMessage = "No items found",
  emptyStateIcon,
  messagePreview,
  helperText,
  groupBy,
  groupLabel,
  getItemId,
  getItemSearchText,
  renderItem,
  filterItem,
}: MultiSelectModalProps<T>) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Determine if we're in controlled mode (external state provided)
  const isControlled = externalSelectedIds !== undefined;
  
  // Use external selection state if provided, otherwise use internal
  const selectedIds = isControlled ? externalSelectedIds : internalSelectedIds;

  const toggleItem = (itemId: string) => {
    // In controlled mode, we can't update state directly - this shouldn't happen
    // In uncontrolled mode, update internal state
    if (isControlled) {
      console.warn('MultiSelectModal: Attempting to toggle item in controlled mode without onSelectionChange callback');
      return;
    }
    
    const newSelection = new Set(selectedIds);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setInternalSelectedIds(newSelection);
  };

  // Filter items
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;

    return items.filter((item) => {
      if (filterItem) {
        return filterItem(item, searchQuery);
      }
      // Default: search in item text
      const searchText = getItemSearchText(item).toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [items, searchQuery, filterItem, getItemSearchText]);

  // Group items if groupBy is provided
  const groupedItems = useMemo(() => {
    if (!groupBy) return null;

    const groups: Record<string, T[]> = {};
    filteredItems.forEach((item) => {
      const groupKey = groupBy(item);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    return groups;
  }, [filteredItems, groupBy]);

  const handleConfirm = () => {
    onConfirm(Array.from(selectedIds));
    // Only reset internal state if uncontrolled
    if (!isControlled) {
      setInternalSelectedIds(new Set());
    }
    setSearchQuery("");
  };

  const handleClose = () => {
    onClose();
    // Only reset internal state if uncontrolled
    if (!isControlled) {
      setInternalSelectedIds(new Set());
    }
    setSearchQuery("");
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" className="size-8 -mt-1" onClick={handleClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Message preview */}
        {messagePreview && (
          <div className="px-6 pt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-900 mb-1">Message:</p>
              <p className="text-sm text-blue-800 line-clamp-3">{messagePreview}</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="px-6 pt-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={searchPlaceholder}
          />
          {helperText && (
            <p className="text-xs text-gray-500 mt-2">{helperText}</p>
          )}
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[200px]">
          {filteredItems.length === 0 ? (
            <EmptyState
              icon={emptyStateIcon}
              title={emptyStateMessage}
              description={searchQuery ? `No results for "${searchQuery}"` : undefined}
            />
          ) : (
            <div className="space-y-2">
              {groupedItems ? (
                Object.entries(groupedItems).map(([groupKey, groupItems]) => (
                  <div key={groupKey} className="space-y-2">
                    {groupLabel && (
                      <div className="text-sm font-medium text-gray-500 mt-4 first:mt-0 mb-2">
                        {groupLabel(groupKey, groupItems.length)}
                      </div>
                    )}
                    {groupItems.map((item) => {
                      const itemId = getItemId(item);
                      const isSelected = selectedIds.has(itemId);

                      return (
                        <label
                          key={itemId}
                          className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-2 px-2 rounded cursor-pointer"
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleItem(itemId)}
                            id={`item-${itemId}`}
                          />
                          <div className="flex-1">{renderItem(item)}</div>
                        </label>
                      );
                    })}
                  </div>
                ))
              ) : (
                filteredItems.map((item) => {
                  const itemId = getItemId(item);
                  const isSelected = selectedIds.has(itemId);

                  return (
                    <label
                      key={itemId}
                      className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-2 px-2 rounded cursor-pointer"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleItem(itemId)}
                        id={`item-${itemId}`}
                      />
                      <div className="flex-1">{renderItem(item)}</div>
                    </label>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">{selectedIds.size} selected</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>
              {confirmButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}