/**
 * Component: Create Enquiry Modal
 *
 * Intake modal for creating a new enquiry from scratch or from selected buyer
 * DM messages.
 */

import { useEffect, useMemo, useCallback, useRef, useState, memo, type ChangeEvent } from "react";
import {
  Building2,
  CheckCircle2,
  FileText,
  Mic,
  Sparkles,
  Trash2,
  Upload,
  Paperclip,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { AudioMessage } from "@/app/components/AudioMessage";
import { MultiSelectDropdown } from "@/app/components/MultiSelectDropdown";
import { VoiceRecorder } from "@/app/components/VoiceRecorder";
import type { Message } from "@/domain/message/message.types";
import type { BuyerDMChannel } from "@/domain/message/buyer-dm.types";
import type { GroupChannel } from "@/domain/message/group.types";
import {
  extractBuyerInfoFromMessages,
  buildEnquiryEnrichmentPreview,
  type EnquiryCreationData,
  type EnquiryCreationSubmission,
  type DraftEnquiryDocument,
  type DraftVoiceNote,
  type NewEnquiryIntakeData,
} from "@/domain/enquiry/enquiry.creation";
import { EnquiryCategory, getSupportedCategories } from "@/domain/cm/cm.assignment";
import { MOCK_BUYERS, getBuyerById } from "@/domain/buyer/buyer.mock-data";
import { getBuyerIdFromPersona, getBuyerPersonaFromBuyerId } from "@/domain/buyer/buyer-persona-mapping";
import { EnquiryIntake } from "@/domain/enquiry/enquiry.intake";

type ModalMode = "blank" | "share";

interface CreateEnquiryModalProps {
  isOpen: boolean;
  mode: ModalMode;
  /** Drives buyer-default schema (quick vs detailed RFQ) on the persisted EnquiryRecord. */
  rfqMode?: "quick" | "detailed";
  allGroupChannels?: GroupChannel[];
  messages?: Message[];
  buyerDMChannel?: BuyerDMChannel | null;
  onClose: () => void;
  onConfirm: (intake: EnquiryIntake) => Promise<void> | void;
}

function matchesCategoryGroup(group: GroupChannel, category: EnquiryCategory | "") {
  if (!category) return true;
  const normalizedCategory = category.toLowerCase();
  return (
    group.name.toLowerCase().includes(normalizedCategory) ||
    group.id.toLowerCase().includes(normalizedCategory)
  );
}

function makeDraftId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function findBuyerByName(name: string) {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return undefined;
  return MOCK_BUYERS.find((buyer) => buyer.name.toLowerCase() === normalized);
}

export const CreateEnquiryModal = memo(function CreateEnquiryModal({
  isOpen,
  mode,
  rfqMode = "detailed",
  allGroupChannels = [],
  messages = [],
  buyerDMChannel,
  onClose,
  onConfirm,
}: CreateEnquiryModalProps) {
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [buyerPersonaId, setBuyerPersonaId] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<EnquiryCategory | "">("");
  const [selectedBuyerGroupIds, setSelectedBuyerGroupIds] = useState<string[]>([]);
  const [selectedInternalGroupIds, setSelectedInternalGroupIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<DraftEnquiryDocument[]>([]);
  const [voiceNote, setVoiceNote] = useState<DraftVoiceNote | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [autoExtracted, setAutoExtracted] = useState(false);
  const didPrefillRef = useRef(false);

  const supportedCategories = useMemo(() => getSupportedCategories(), []);
  const sourceMessages = mode === "share" ? messages : [];
  const selectedBuyer = useMemo(() => getBuyerById(selectedBuyerId), [selectedBuyerId]);
  const buyerGroups = useMemo(
    () =>
      allGroupChannels.filter(
        (group) => group.type === "buyer" && group.buyerId === selectedBuyerId,
      ),
    [allGroupChannels, selectedBuyerId],
  );
  const internalGroups = useMemo(
    () =>
      allGroupChannels.filter(
        (group) => group.type === "custom" && matchesCategoryGroup(group, selectedCategory),
      ),
    [allGroupChannels, selectedCategory],
  );

  const resetDraft = useCallback(() => {
    setSelectedBuyerId("");
    setBuyerPersonaId(undefined);
    setSelectedCategory("");
    setSelectedBuyerGroupIds([]);
    setSelectedInternalGroupIds([]);
    setNotes("");
    setNotes("");
    setAttachments([]);
    setVoiceNote(null);
    setErrors([]);
    setAutoExtracted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (didPrefillRef.current) return;

    resetDraft();

    if (buyerDMChannel) {
      const buyerId = buyerDMChannel.buyerPersonaId
        ? getBuyerIdFromPersona(buyerDMChannel.buyerPersonaId)
        : findBuyerByName(buyerDMChannel.buyerName)?.id;

      if (buyerId) {
        setSelectedBuyerId(buyerId);
        setBuyerPersonaId(buyerDMChannel.buyerPersonaId);
        setAutoExtracted(true);
      }
      didPrefillRef.current = true;
      return;
    }

    const extracted = extractBuyerInfoFromMessages(sourceMessages);
    if (extracted?.buyerName) {
      const buyer = findBuyerByName(extracted.buyerName);
      if (buyer) {
        setSelectedBuyerId(buyer.id);
        setBuyerPersonaId(getBuyerPersonaFromBuyerId(buyer.id));
        setAutoExtracted(true);
      }
    }
    didPrefillRef.current = true;
  }, [buyerDMChannel, isOpen, resetDraft, sourceMessages]);

  useEffect(() => {
    if (isOpen) return;

    didPrefillRef.current = false;

    attachments.forEach((attachment) => {
      if (attachment.file) {
        URL.revokeObjectURL(attachment.url);
      }
    });
  }, [attachments, isOpen]);

  useEffect(() => {
    setSelectedBuyerGroupIds((prev) =>
      prev.filter((groupId) => buyerGroups.some((group) => group.id === groupId)),
    );
  }, [buyerGroups]);

  useEffect(() => {
    setSelectedInternalGroupIds((prev) =>
      prev.filter((groupId) => internalGroups.some((group) => group.id === groupId)),
    );
  }, [internalGroups]);

  const removeAttachment = useCallback((attachmentId: string) => {
    setAttachments((prev) => {
      const next = prev.filter((attachment) => attachment.id !== attachmentId);
      const removed = prev.find((attachment) => attachment.id === attachmentId);
      if (removed?.file) {
        URL.revokeObjectURL(removed.url);
      }
      return next;
    });
  }, []);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setAttachments((prev) => {
      const next = [...prev];
      files.forEach((file) => {
        next.push({
          id: makeDraftId("doc"),
          name: file.name,
          type: file.type || "application/octet-stream",
          url: URL.createObjectURL(file),
          file,
        });
      });
      return next;
    });

    event.target.value = "";
  }, []);

  const toggleAttachmentPO = useCallback((attachmentId: string, markAsPO: boolean) => {
    setAttachments((prev) =>
      prev.map((attachment) =>
        attachment.id === attachmentId ? { ...attachment, markAsPO } : attachment,
      ),
    );
  }, []);

  const hasPOAttachments = attachments.some((attachment) => attachment.markAsPO);

  const handleVoiceComplete = useCallback(
    (audioUrl: string, audioBlob: Blob, transcription: string, duration: number) => {
      setVoiceNote({
        audioUrl,
        audioBlob,
        transcription,
        duration,
      });
    },
    [],
  );

  const enrichmentPreview = useMemo(
    () =>
      buildEnquiryEnrichmentPreview({
        buyerName: selectedBuyer?.name || "",
        notes,
        attachments,
        voiceNote,
        markAsPO: hasPOAttachments,
      }),
    [attachments, hasPOAttachments, notes, selectedBuyer, voiceNote],
  );

  const validationErrors = useCallback(() => {
    const nextErrors: string[] = [];

    if (!selectedBuyerId) {
      nextErrors.push("Buyer selection is required");
    }

    if (!selectedCategory) {
      nextErrors.push("At least one category is required");
    }

    return nextErrors;
  }, [selectedBuyerId, selectedCategory]);

  const handleConfirm = useCallback(async () => {
    const nextErrors = validationErrors();
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    const intake: EnquiryIntake = {
      buyer: {
        personaId: buyerPersonaId,
        buyerId: selectedBuyerId,
        manualName: selectedBuyer?.name || "",
      },
      requirements: {
        categories: selectedCategory ? [selectedCategory as any] : [],
        notes: notes.trim() || undefined,
      },
      source: {
        medium: mode === "share" ? "share" : "manual",
        rfqMode,
        selectedBuyerGroupIds: selectedBuyerGroupIds.length > 0 ? selectedBuyerGroupIds : undefined,
        selectedInternalGroupIds: selectedInternalGroupIds.length > 0 ? selectedInternalGroupIds : undefined,
        messages: sourceMessages,
        attachments,
        voiceNote,
      },
    };

    setErrors([]);
    await onConfirm(intake);
  }, [
    attachments,
    selectedBuyerId,
    buyerPersonaId,
    mode,
    rfqMode,
    notes,
    onConfirm,
    selectedBuyer,
    selectedCategory,
    selectedBuyerGroupIds,
    selectedInternalGroupIds,
    sourceMessages,
    validationErrors,
    voiceNote,
  ]);

  const canCreate = !!selectedBuyerId && !!selectedCategory;
  const hasVoiceNote = !!voiceNote;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[min(760px,calc(100vw-2rem))] max-w-[760px] gap-0 overflow-hidden rounded-lg p-0"
        aria-describedby={undefined}
      >
        <div className="border-b border-gray-200 px-6 py-5">
          <DialogHeader className="w-full items-start gap-0 text-left">
            <DialogTitle className="w-full text-left text-lg font-semibold text-gray-900">
              Create New Enquiry
            </DialogTitle>
            <DialogDescription className="sr-only">
              Create a new enquiry and attach supporting intake details.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[calc(90vh-9rem)] overflow-y-auto bg-white">
          <div className="divide-y divide-gray-200">
            <section className="space-y-4 px-6 py-5">
              {autoExtracted && selectedBuyer && (
                <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
                  <Sparkles className="mt-0.5 size-4 text-[#5249D2]" />
                  <div className="text-sm text-gray-600">
                    Buyer preselected from the current context.
                  </div>
                </div>
              )}

              {errors.length > 0 && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
                  <p className="mb-2 text-sm font-medium text-red-900">
                    Please fix the following issues:
                  </p>
                  <ul className="space-y-1 text-sm text-red-700">
                    {errors.map((error) => (
                      <li key={error} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-red-500" />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Buyer name <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedBuyerId}
                    onValueChange={(value) => {
                      setSelectedBuyerId(value);
                      setBuyerPersonaId(value ? getBuyerPersonaFromBuyerId(value) : undefined);
                    }}
                  >
                    <SelectTrigger className="h-9 border-gray-300 bg-white text-left">
                      <SelectValue placeholder="Select an existing buyer" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_BUYERS.map((buyer) => (
                        <SelectItem key={buyer.id} value={buyer.id}>
                          {buyer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-xs text-gray-500">
                    Choose from the existing buyers in the system.
                  </p>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Building2 className="size-4 text-gray-500" />
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => setSelectedCategory(value as EnquiryCategory)}
                  >
                    <SelectTrigger className="h-9 border-gray-300 bg-white text-left">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    Buyer Group
                  </label>
                  <MultiSelectDropdown
                    options={buyerGroups.map((group) => ({ value: group.id, label: group.name }))}
                    selected={selectedBuyerGroupIds}
                    onChange={setSelectedBuyerGroupIds}
                    placeholder={
                      selectedBuyerId
                        ? buyerGroups.length > 0
                          ? "Select Buyer Groups"
                          : "No buyer groups available"
                        : "Select buyer first"
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    Birla Pivot Group
                  </label>
                  <MultiSelectDropdown
                    options={internalGroups.map((group) => ({ value: group.id, label: group.name }))}
                    selected={selectedInternalGroupIds}
                    onChange={setSelectedInternalGroupIds}
                    placeholder={
                      selectedCategory
                        ? internalGroups.length > 0
                          ? "Select Birla Pivot Groups"
                          : "No Birla Pivot groups available"
                        : "Select category first"
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileText className="size-4 text-gray-500" />
                    Notes
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Add the buyer request, context, or any special instructions..."
                    rows={3}
                  />
                </div>


              </div>
            </section>

            <section className="space-y-4 px-6 py-5">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                  <Upload className="size-4 text-gray-500" />
                  Upload docs
                  <input type="file" multiple className="hidden" onChange={handleFileChange} />
                </label>
                <VoiceRecorder onRecordingComplete={handleVoiceComplete} />
              </div>

              <div className="space-y-3">
                {attachments.length > 0 &&
                  attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-start justify-between gap-3 rounded-md border border-gray-200 bg-white px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-medium text-gray-900">
                            {attachment.name}
                          </span>
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-gray-600">
                            <input
                              type="checkbox"
                              checked={!!attachment.markAsPO}
                              onChange={(event) =>
                                toggleAttachmentPO(attachment.id, event.target.checked)
                              }
                              className="size-3.5 rounded border-gray-300 text-[#5249D2]"
                            />
                            PO
                          </label>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        aria-label={`Remove ${attachment.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
              </div>

              {hasVoiceNote && voiceNote && (
                <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Mic className="size-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">Voice note</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setVoiceNote(null)}
                      className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Remove voice note"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <AudioMessage
                    audioUrl={voiceNote.audioUrl}
                    transcription={{
                      text: voiceNote.transcription,
                      status: "complete",
                    }}
                  />
                </div>
              )}
            </section>

            {mode === "share" && sourceMessages.length > 0 && (
              <section className="space-y-4 px-6 py-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Selected messages</h3>
                  <Badge variant="secondary">{sourceMessages.length}</Badge>
                </div>
                <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
                  {sourceMessages.map((message) => (
                    <div key={message.id} className="rounded-md border border-gray-200 bg-white px-4 py-3">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {message.sender || "Unknown"}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-gray-700">{message.content}</p>
                      {message.attachment && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600">
                          <Paperclip className="size-3" />
                          {message.attachment.name}
                        </div>
                      )}
                      {message.audioRecording && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600">
                          <Mic className="size-3" />
                          {message.audioRecording.transcription.text || "Recorded audio"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={onClose} className="min-w-[120px]">
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!canCreate} className="min-w-[180px]">
              Create Enquiry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
