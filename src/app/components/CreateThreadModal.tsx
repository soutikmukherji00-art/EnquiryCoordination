/**
 * CreateThreadModal Component
 * 
 * Modal for creating a new thread from a group message.
 * Allows optional tagging with an enquiry ID to make it an "Enquiry Thread".
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { MessageSquare, Hash } from "lucide-react";

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (params: {
    enquiryId?: string;
  }) => void;
  messagePreview: string;
  availableEnquiries?: Array<{
    id: string;
    buyerName?: string;
    state?: string;
  }>;
}

export function CreateThreadModal({
  isOpen,
  onClose,
  onConfirm,
  messagePreview,
  availableEnquiries = [],
}: CreateThreadModalProps) {
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>("__none__");

  const handleConfirm = () => {
    onConfirm({
      enquiryId: selectedEnquiryId === "__none__" ? undefined : selectedEnquiryId,
    });
    // Reset state
    setSelectedEnquiryId("__none__");
    onClose();
  };

  const handleCancel = () => {
    setSelectedEnquiryId("__none__");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="size-5 text-[#5249D2]" />
            Start a Thread
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Message Preview */}
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
            <p className="text-xs text-gray-500 mb-1">Message:</p>
            <p className="text-sm text-gray-700 line-clamp-2">
              {messagePreview}
            </p>
          </div>

          {/* Enquiry Tag */}
          {availableEnquiries.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="enquiry-tag">
                Tag to Enquiry
              </Label>
              <Select value={selectedEnquiryId} onValueChange={setSelectedEnquiryId}>
                <SelectTrigger id="enquiry-tag">
                  <SelectValue placeholder="No enquiry tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    <span className="text-gray-500">No enquiry tag</span>
                  </SelectItem>
                  {availableEnquiries.map((enq) => (
                    <SelectItem key={enq.id} value={enq.id}>
                      <div className="flex items-center gap-2">
                        <Hash className="size-3 text-gray-400" />
                        <span className="font-medium">{enq.id}</span>
                        {enq.buyerName && (
                          <span className="text-gray-500">- {enq.buyerName}</span>
                        )}
                        {enq.state && (
                          <span className="text-xs text-gray-400">({enq.state})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="gap-2"
          >
            <MessageSquare className="size-4" />
            Start Thread
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}