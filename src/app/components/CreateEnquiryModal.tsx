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
  Paperclip,
  Sparkles,
  Trash2,
  Upload,
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
import { VoiceRecorder } from "@/app/components/VoiceRecorder";
import type { Message } from "@/domain/message/message.types";
import type { BuyerDMChannel } from "@/domain/message/buyer-dm.types";
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

type ModalMode = "blank" | "share";

interface CreateEnquiryModalProps {
  isOpen: boolean;
  mode: ModalMode;
  messages?: Message[];
  buyerDMChannel?: BuyerDMChannel | null;
  onClose: () => void;
  onConfirm: (submission: EnquiryCreationSubmission) => Promise<void> | void;
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
  messages = [],
  buyerDMChannel,
  onClose,
  onConfirm,
}: CreateEnquiryModalProps) {
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [buyerPersonaId, setBuyerPersonaId] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<EnquiryCategory | "">("");
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<DraftEnquiryDocument[]>([]);
  const [voiceNote, setVoiceNote] = useState<DraftVoiceNote | null>(null);
  const [markAsPO, setMarkAsPO] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [autoExtracted, setAutoExtracted] = useState(false);
  const didPrefillRef = useRef(false);

  const supportedCategories = useMemo(() => getSupportedCategories(), []);
  const sourceMessages = mode === "share" ? messages : [];
  const selectedBuyer = useMemo(() => getBuyerById(selectedBuyerId), [selectedBuyerId]);

  const resetDraft = useCallback(() => {
    setSelectedBuyerId("");
    setBuyerPersonaId(undefined);
    setSelectedCategory("");
    setNotes("");
    setAttachments([]);
    setVoiceNote(null);
    setMarkAsPO(false);
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
    if (attachments.length === 0 && markAsPO) {
      setMarkAsPO(false);
    }
  }, [attachments.length, markAsPO]);

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
        markAsPO,
      }),
    [attachments, markAsPO, notes, selectedBuyer, voiceNote],
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

    const data: EnquiryCreationData = {
      buyerName: selectedBuyer?.name || "",
      buyerCompany: undefined,
      buyerPersonaId,
      categories: selectedCategory ? [selectedCategory] : undefined,
      notes: notes.trim() || undefined,
    };

    const intake: NewEnquiryIntakeData = {
      attachments,
      voiceNote,
      markAsPO,
      enrichmentPreview,
      sourceMode: mode,
    };

    setErrors([]);
    await onConfirm({
      data,
      sourceMessages,
      intake,
    });
  }, [
    attachments,
    buyerPersonaId,
    enrichmentPreview,
    markAsPO,
    mode,
    notes,
    onConfirm,
    selectedBuyer,
    selectedCategory,
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
          <DialogHeader className="items-center gap-0 text-center">
            <DialogTitle className="text-lg font-semibold text-gray-900">
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
                    <FileText className="size-4 text-gray-500" />
                    Notes
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Add the buyer request, context, or any special instructions..."
                    rows={4}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 px-6 py-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Paperclip className="size-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Documents</h3>
                  {attachments.length > 0 && <Badge variant="secondary">{attachments.length}</Badge>}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                  <Upload className="size-4 text-gray-500" />
                  Upload docs
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <div className="space-y-3">
                {attachments.length > 0 &&
                  attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-start justify-between gap-3 rounded-md border border-gray-200 bg-white px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-gray-900">
                            {attachment.name}
                          </span>
                          <Badge variant="secondary" className="text-[11px] uppercase tracking-wide">
                            {attachment.type.startsWith("image/") ? "IMG" : attachment.type.includes("pdf") ? "PDF" : "FILE"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Ready for intake.</p>
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

              {attachments.length > 0 && (
                <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={markAsPO}
                      onChange={(event) => setMarkAsPO(event.target.checked)}
                      className="size-4 rounded border-gray-300 text-[#5249D2]"
                    />
                    <span className="text-sm font-medium text-gray-900">Mark as PO</span>
                  </label>
                </div>
              )}
            </section>

            <section className="space-y-4 px-6 py-5">
              <div className="flex items-center gap-2">
                <Mic className="size-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-900">Voice note</h3>
              </div>

              {!hasVoiceNote ? (
                <VoiceRecorder onRecordingComplete={handleVoiceComplete} />
              ) : (
                <div className="space-y-3">
                  <AudioMessage
                    audioUrl={voiceNote.audioUrl}
                    durationMs={voiceNote.duration * 1000}
                    transcription={{
                      text: voiceNote.transcription,
                      status: "complete",
                    }}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-700 hover:bg-red-50 hover:text-red-800"
                      onClick={() => setVoiceNote(null)}
                    >
                      Remove voice note
                    </Button>
                  </div>
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
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-gray-600">
              {canCreate
                ? markAsPO
                  ? "Ready to create and enrich the enquiry."
                  : "Ready to create the enquiry."
                : "Complete the buyer and category fields to continue."}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose} className="min-w-[120px]">
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={!canCreate} className="min-w-[180px]">
                {markAsPO ? "Create Enquiry + Enrich" : "Create Enquiry"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
