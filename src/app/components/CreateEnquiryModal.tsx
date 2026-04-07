/**
 * Component: Create Enquiry Modal
 * 
 * Modal for creating a new enquiry from shared messages.
 * Allows user to specify buyer details and initial enquiry data.
 */

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { createPortal } from "react-dom";
import { X, Building2, FileText, Sparkles, Package } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { MultiSelectDropdown } from "@/app/components/MultiSelectDropdown";
import { Message } from "@/domain/message/message.types";
import {
  extractBuyerInfoFromMessages,
  type EnquiryCreationData,
} from "@/domain/enquiry/enquiry.creation";
import { BuyerDMChannel } from "@/domain/message/buyer-dm.types";
import { EnquiryCategory, getSupportedCategories } from "@/domain/cm/cm.assignment";

interface CreateEnquiryModalProps {
  messages: Message[];
  onClose: () => void;
  onConfirm: (data: EnquiryCreationData) => void;
  buyerDMChannel?: BuyerDMChannel; // Auto-fetch buyer info from DM
}

export const CreateEnquiryModal = memo(function CreateEnquiryModal({
  messages,
  onClose,
  onConfirm,
  buyerDMChannel,
}: CreateEnquiryModalProps) {
  const [buyerName, setBuyerName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<EnquiryCategory[]>([]); // Multi-select
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [autoExtracted, setAutoExtracted] = useState(false);
  const [buyerPersonaId, setBuyerPersonaId] = useState<string | undefined>(undefined); // NEW: Track buyerPersonaId

  // Auto-fetch buyer info from DM channel if provided
  useEffect(() => {
    if (buyerDMChannel) {
      // buyerName in DM is actually the company name
      setBuyerName(buyerDMChannel.buyerName);
      setBuyerPersonaId(buyerDMChannel.buyerPersonaId); // NEW: Extract buyerPersonaId from DM channel
      setAutoExtracted(true);
    }
  }, [buyerDMChannel]);

  // Auto-extract buyer info from messages on mount
  useEffect(() => {
    if (!buyerDMChannel) {
      const extracted = extractBuyerInfoFromMessages(messages);
      if (extracted.buyerName) {
        setBuyerName(extracted.buyerName);
        setAutoExtracted(true);
      }
      if (extracted.buyerCompany) {
        // Use company name if available
        setBuyerName(extracted.buyerCompany);
      }
    }
  }, [messages, buyerDMChannel]);

  // Toggle category selection
  const toggleCategory = useCallback((category: EnquiryCategory) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const data: EnquiryCreationData = {
      buyerName: buyerName.trim(),
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      notes: notes.trim() || undefined,
      buyerPersonaId: buyerPersonaId, // NEW: Include buyerPersonaId in data
    };

    // Custom validation for categories (required in modal)
    const validationErrors: string[] = [];
    
    if (selectedCategories.length === 0) {
      validationErrors.push("At least one category is required");
    }
    
    if (!data.buyerName || data.buyerName.trim().length === 0) {
      validationErrors.push("Buyer name is required");
    }
    
    if (data.buyerName && data.buyerName.trim().length < 3) {
      validationErrors.push("Buyer name must be at least 3 characters");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    onConfirm(data);
  }, [buyerName, selectedCategories, notes, onConfirm, buyerPersonaId]);

  // Memoize supported categories to avoid recreating array on every render
  const supportedCategories = useMemo(() => getSupportedCategories(), []);

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="size-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Create New Enquiry
              </h2>
              <p className="text-sm text-gray-500">
                Share {messages.length} message{messages.length !== 1 ? "s" : ""} to new enquiry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Auto-extraction notice */}
            {autoExtracted && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Sparkles className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Auto-extracted from messages
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    We've automatically filled in some details from the selected messages. You can edit them below.
                  </p>
                </div>
              </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-900 mb-2">
                  Please fix the following errors:
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="size-1 bg-red-500 rounded-full" />
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Company Name (Required) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building2 className="size-4" />
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="e.g., Ramesh Industries"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                The company or organization name for this enquiry
              </p>
            </div>

            {/* Category (Required) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Package className="size-4" />
                Category <span className="text-red-500">*</span>
              </label>
              <MultiSelectDropdown
                options={supportedCategories}
                selected={selectedCategories}
                onChange={setSelectedCategories}
                placeholder="Select categories..."
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Select one or more categories for this enquiry. Each category will assign a specialized CM.
              </p>
            </div>

            {/* Notes (Optional) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="size-4" />
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional context or special instructions..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Internal notes visible to your team
              </p>
            </div>

            {/* Message Preview */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Messages to be shared ({messages.length}):
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-white p-3 rounded border border-gray-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium text-gray-900">
                        {msg.sender || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {msg.content}
                    </p>
                    {msg.attachment && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded text-xs text-blue-700">
                        <FileText className="size-3" />
                        {msg.attachment.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Note:</span> This will create a new enquiry and share the selected messages.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Enquiry
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
});