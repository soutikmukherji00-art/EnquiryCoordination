/**
 * Tag Internal Group Modal
 *
 * Lets Prism users attach one existing internal group to an enquiry.
 */

import { useEffect, useMemo, useState } from "react";
import { Building2, Lock, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { cn } from "@/app/components/ui/utils";
import type { GroupChannel } from "@/domain/message/group.types";

interface TagInternalGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (groupId: string) => void;
  enquiryId?: string;
  groups: GroupChannel[];
}

export function TagInternalGroupModal({
  isOpen,
  onClose,
  onConfirm,
  enquiryId,
  groups,
}: TagInternalGroupModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedGroupId(null);
      return;
    }

    if (!selectedGroupId && groups.length > 0) {
      setSelectedGroupId(groups[0].id);
    }
  }, [isOpen, groups, selectedGroupId]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const query = searchQuery.toLowerCase();
    return groups.filter((group) => {
      return group.name.toLowerCase().includes(query);
    });
  }, [groups, searchQuery]);

  const handleClose = () => {
    setSearchQuery("");
    setSelectedGroupId(null);
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedGroupId) return;
    onConfirm(selectedGroupId);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[560px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-[#5249D2]" />
            Tag internal group
          </DialogTitle>
          {/* <DialogDescription>
            Choose one existing Birla Pivot group to attach to {enquiryId ? `#${enquiryId}` : "this enquiry"}.
          </DialogDescription> */}
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search internal groups..."
              className="pl-9"
            />
          </div>

          <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => {
                const isSelected = selectedGroupId === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setSelectedGroupId(group.id)}
                    className={cn(
                      "w-full text-left px-6 py-3 transition-colors flex items-center gap-2.5",
                      isSelected
                        ? "bg-[rgba(242,241,252,0.6)]"
                        : "hover:bg-gray-50",
                    )}
                  >
                    <Lock
                      className={cn(
                        "size-4 flex-shrink-0",
                        isSelected ? "text-[#4039ad]" : "text-gray-400",
                      )}
                    />
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-[14px] font-medium leading-[20px]",
                        isSelected ? "text-[#4039ad]" : "text-[#33373d]",
                      )}
                    >
                      {group.name}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
                <p className="text-sm font-medium text-gray-900">
                  No internal groups available
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Create a Birla Pivot group first, then come back to tag it
                  here.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedGroupId}>
            Tag group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
