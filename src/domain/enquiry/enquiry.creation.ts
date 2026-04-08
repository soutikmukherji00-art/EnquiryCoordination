/**
 * Domain: Enquiry Creation
 * 
 * Utilities for creating new enquiries and managing creation data.
 */

import type { Category } from "@/domain/category/category.types";
import { Enquiry, EnquiryState, generateEnquiryId } from "./enquiry.types";
import type { Message } from "@/domain/message/message.types";

/**
 * Data required to create a new enquiry
 */
export interface EnquiryCreationData {
  buyerName: string;
  buyerCompany?: string;
  buyerPersonaId?: string;
  deliveryLocation?: string; // Hidden in UI, kept for backward compatibility
  productCategory?: string; // Deprecated, use categories instead
  categories?: Category[]; // Multi-select category-based CM assignment
  notes?: string;
}

export interface DraftEnquiryDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  file?: File;
}

export interface DraftVoiceNote {
  audioUrl: string;
  audioBlob: Blob;
  transcription: string;
  duration: number;
}

export interface EnquiryEnrichmentPreview {
  buyerName: string;
  buyerCompany?: string;
  poDetected: boolean;
  poReference?: string;
  poValue?: string;
  productHints: string[];
  commercialTerms: string[];
  sourceSignals: string[];
  enrichedFields: string[];
  summary: string;
}

export interface NewEnquiryIntakeData {
  attachments: DraftEnquiryDocument[];
  voiceNote?: DraftVoiceNote | null;
  markAsPO: boolean;
  enrichmentPreview?: EnquiryEnrichmentPreview | null;
  sourceMode: "blank" | "share";
}

export interface EnquiryCreationSubmission {
  data: EnquiryCreationData;
  sourceMessages: Message[];
  intake: NewEnquiryIntakeData;
}

const PO_REFERENCE_REGEX = /(?:PO|Purchase\s*Order|P\/O|PO#)\s*[:#-]?\s*([A-Z0-9][A-Z0-9\/-]{2,})/i;
const PO_VALUE_REGEX = /(₹\s?[\d,]+(?:\.\d{1,2})?|\bINR\s?[\d,]+(?:\.\d{1,2})?|\b\d{5,}\b)/i;
const COMMERICAL_KEYWORDS = [
  "net 30",
  "net 45",
  "advance",
  "part payment",
  "delivery",
  "ex works",
  "fob",
  "validity",
  "credit",
];

function extractProductHints(text: string): string[] {
  const hints: string[] = [];
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return hints;

  const quantityPattern = /(\d+(?:\.\d+)?)\s*(mt|tons?|tonnes?|kg|bags?|units?|pcs?|pieces?|litres?|ltrs?|m|meters?|metres?|sq\s*m|sqm|sq\.?\s*ft|ft)\b/gi;
  let quantityMatch: RegExpExecArray | null;
  while ((quantityMatch = quantityPattern.exec(normalized)) !== null) {
    hints.push(quantityMatch[0]);
  }

  const materialPattern = /(steel|cement|polymer|aluminium|aluminum|pipes?|sheets?|granules?|bars?|angles?)/gi;
  const matchedMaterials = new Set<string>();
  let materialMatch: RegExpExecArray | null;
  while ((materialMatch = materialPattern.exec(normalized)) !== null) {
    matchedMaterials.add(materialMatch[0]);
  }

  matchedMaterials.forEach((material) => hints.push(material));
  return Array.from(new Set(hints)).slice(0, 4);
}

function extractCommercialTerms(text: string): string[] {
  const lowered = text.toLowerCase();
  return COMMERICAL_KEYWORDS.filter((keyword) => lowered.includes(keyword)).slice(0, 4);
}

function collectSourceSignals(params: {
  notes: string;
  documentNames: string[];
  transcript: string;
  buyerName: string;
  markAsPO: boolean;
}): string[] {
  const signals = new Set<string>();

  if (params.notes.trim()) signals.add("Text notes");
  if (params.transcript.trim()) signals.add("Voice note transcript");
  if (params.documentNames.length > 0) signals.add(`${params.documentNames.length} uploaded document(s)`);
  if (params.markAsPO) signals.add("PO confirmation");
  if (params.buyerName.trim()) signals.add("Buyer name");

  return Array.from(signals);
}

export function buildEnquiryEnrichmentPreview(params: {
  buyerName: string;
  buyerCompany?: string;
  notes?: string;
  attachments?: DraftEnquiryDocument[];
  voiceNote?: DraftVoiceNote | null;
  markAsPO: boolean;
}): EnquiryEnrichmentPreview | null {
  const notes = params.notes?.trim() || "";
  const transcript = params.voiceNote?.transcription?.trim() || "";
  const attachmentNames = (params.attachments ?? []).map((attachment) => attachment.name);
  const combinedText = [notes, transcript, ...attachmentNames].filter(Boolean).join(" ");

  if (!params.markAsPO && !notes && !transcript && attachmentNames.length === 0) {
    return null;
  }

  const poReferenceMatch = combinedText.match(PO_REFERENCE_REGEX);
  const poValueMatch = combinedText.match(PO_VALUE_REGEX);
  const productHints = extractProductHints(combinedText);
  const commercialTerms = extractCommercialTerms(combinedText);
  const sourceSignals = collectSourceSignals({
    notes,
    documentNames: attachmentNames,
    transcript,
    buyerName: params.buyerName,
    markAsPO: params.markAsPO,
  });

  const enrichedFields: string[] = [];
  if (params.buyerName.trim()) enrichedFields.push("Buyer");
  if (params.markAsPO) enrichedFields.push("PO / reference");
  if (productHints.length > 0) enrichedFields.push("Product hints");
  if (commercialTerms.length > 0) enrichedFields.push("Commercial terms");

  const summaryParts = [
    params.buyerCompany || params.buyerName,
    params.markAsPO && poReferenceMatch?.[1] ? `PO ${poReferenceMatch[1]}` : null,
    productHints[0] ? `Product hint: ${productHints[0]}` : null,
    commercialTerms[0] ? `Commercial term: ${commercialTerms[0]}` : null,
  ].filter(Boolean);

  return {
    buyerName: params.buyerName,
    buyerCompany: params.buyerCompany,
    poDetected: params.markAsPO,
    poReference: poReferenceMatch?.[1],
    poValue: poValueMatch?.[1],
    productHints,
    commercialTerms,
    sourceSignals,
    enrichedFields,
    summary: summaryParts.length > 0
      ? `Enrichment preview: ${summaryParts.join(" • ")}.`
      : "Enrichment preview ready.",
  };
}

export function buildIntakeChannelMessages(params: {
  enquiryId: string;
  intake: NewEnquiryIntakeData;
  buyerName: string;
  notes?: string;
  currentUser: string;
  currentRole: string;
  currentPersonaId: string;
}): Message[] {
  const messages: Message[] = [];
  const baseTimestamp = new Date();
  let sequence = 0;
  const nextTimestamp = () => new Date(baseTimestamp.getTime() + sequence++ * 1000);

  if (params.notes?.trim()) {
    messages.push({
      id: `${params.enquiryId}-intake-note-${Date.now()}`,
      type: "system",
      sender: params.currentUser,
      senderPersonaId: params.currentPersonaId,
      senderRole: params.currentRole as Message["senderRole"],
      content: `Intake note: ${params.notes.trim()}`,
      timestamp: nextTimestamp(),
    });
  }

  if (params.intake.markAsPO && params.intake.enrichmentPreview) {
    messages.push({
      id: `${params.enquiryId}-intake-po-${Date.now()}`,
      type: "system",
      sender: params.currentUser,
      senderPersonaId: params.currentPersonaId,
      senderRole: params.currentRole as Message["senderRole"],
      content: params.intake.enrichmentPreview.summary,
      timestamp: nextTimestamp(),
    });
  }

  if (params.intake.attachments.length > 0) {
    params.intake.attachments.forEach((attachment, index) => {
      messages.push({
        id: `${params.enquiryId}-intake-doc-${Date.now()}-${index}`,
        type: "user",
        sender: params.currentUser,
        senderPersonaId: params.currentPersonaId,
        senderRole: params.currentRole as Message["senderRole"],
        content: `Uploaded document: ${attachment.name}`,
        timestamp: nextTimestamp(),
        attachment: {
          name: attachment.name,
          type: attachment.type,
          url: attachment.url,
        },
      });
    });
  }

  if (params.intake.voiceNote) {
    messages.push({
      id: `${params.enquiryId}-intake-voice-${Date.now()}`,
      type: "voice",
      sender: params.currentUser,
      senderPersonaId: params.currentPersonaId,
      senderRole: params.currentRole as Message["senderRole"],
      content: params.intake.voiceNote.transcription || "Voice note",
      timestamp: nextTimestamp(),
      audioRecording: {
        blob: params.intake.voiceNote.audioBlob,
        url: params.intake.voiceNote.audioUrl,
        durationMs: params.intake.voiceNote.duration * 1000,
        transcription: {
          text: params.intake.voiceNote.transcription || "Voice note",
          status: "complete",
        },
      },
    });
  }

  return messages;
}

/**
 * Result of creating a new enquiry
 */
export interface CreateEnquiryResult {
  enquiryId: string;
  enquiry: Partial<Enquiry>;
  initialMessages: Message[];
}

/**
 * Create a new enquiry from shared messages
 * 
 * @param data - Enquiry creation data from form
 * @param createdBy - User creating the enquiry
 * @param createdByRole - Role of the creator
 * @param existingEnquiries - Existing enquiries to generate unique ID
 * @returns New enquiry object and initial messages
 */
export const createNewEnquiry = (
  data: EnquiryCreationData,
  createdBy: string,
  createdByRole: string,
  existingEnquiries: Enquiry[]
): CreateEnquiryResult => {
  const enquiryId = generateEnquiryId(existingEnquiries);
  const timestamp = new Date();

  const enquiry: Partial<Enquiry> = {
    id: enquiryId,
    buyerName: data.buyerName,
    buyerCompany: data.buyerCompany,
    // NEW: Categories (defaults to empty if not provided)
    categories: data.categories || [],
    // Legacy support
    productCategory: data.productCategory || data.categories?.[0] || "General Inquiry",
    region: data.deliveryLocation, // Set region from delivery location
    state: "Draft" as EnquiryState,
    createdAt: timestamp,
    updatedAt: timestamp,
    priority: "medium",
    tags: [],
    notes: data.notes,
  };

  return {
    enquiryId,
    enquiry,
    initialMessages: [],
  };
};

/**
 * Prepare messages for sharing to a new enquiry
 * Clones messages with new IDs and timestamps
 * 
 * @param messages - Original messages to share
 * @param enquiryId - Target enquiry ID
 * @param timestamp - Timestamp for shared messages
 * @returns Prepared messages with new IDs
 */
export function prepareMessagesForNewEnquiry(
  messages: Message[],
  enquiryId: string,
  timestamp: Date
): Message[] {
  return messages.map((msg, index) => ({
    ...msg,
    id: `${enquiryId}-shared-${Date.now()}-${index}`,
    timestamp: new Date(timestamp.getTime() + index * 1000), // Preserve order with incremental timestamps
  }));
}

/**
 * Extract buyer information from buyer DM messages
 * Used to auto-populate buyer fields in create enquiry modal
 * 
 * @param messages - Messages from buyer DM channel
 * @returns Extracted buyer info or null
 */
export function extractBuyerInfoFromMessages(
  messages: Message[]
): { buyerName: string; buyerCompany?: string } | null {
  // Find first message from buyer (sender role = "Buyer")
  const buyerMessage = messages.find(
    (msg) => msg.type === "user" && msg.senderRole === "Buyer"
  );

  if (buyerMessage && buyerMessage.sender) {
    return {
      buyerName: buyerMessage.sender,
      buyerCompany: undefined, // Could extract from message content if needed
    };
  }

  return null;
}
