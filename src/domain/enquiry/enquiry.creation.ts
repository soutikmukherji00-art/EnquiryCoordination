/**
 * Domain: Enquiry Creation
 * 
 * Utilities for creating new enquiries and managing creation data.
 */

import type { Category } from "@/domain/category/category.types";
import { formatCategories, getPrimaryCategory, isValidCategory } from "@/domain/category/category.types";
import { Enquiry, EnquiryState, generateEnquiryId } from "./enquiry.types";
import type { Message } from "@/domain/message/message.types";
import type { GroupChannel } from "@/domain/message/group.types";
import {
  createMessageSentEvent,
  createGroupTaggedEvent,
  createThreadCreatedEvent,
  type MessageEvent,
} from "@/domain/message/message.events";
import { generateThreadId } from "@/domain/message/thread.types";
import { getPersonaById } from "@/domain/persona/persona.data";
import { EnquiryIntake, resolveIntakeBuyerName } from "./enquiry.intake";

/**
 * @deprecated Use EnquiryIntakeRequirements from enquiry.intake instead
 */
export interface EnquiryCreationData {
  buyerName: string;
  buyerCompany?: string;
  buyerPersonaId?: string;
  deliveryLocation?: string;
  productCategory?: string;
  categories?: Category[];
  notes?: string;
  estimatedValue?: number;
  paymentTerms?: string;
  etaDays?: number;
}

export interface DraftEnquiryDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  file?: File;
  markAsPO?: boolean;
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

/**
 * @deprecated Use EnquiryIntake from enquiry.intake instead
 */
export interface EnquiryCreationSubmission {
  data: EnquiryCreationData;
  sourceMessages: Message[];
  intake: NewEnquiryIntakeData;
}

export interface InternalEnquiryThreadResult {
  groupId: string;
  threadId: string;
  threadTitle: string;
  events: MessageEvent[];
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
        content: "",
        timestamp: nextTimestamp(),
        attachment: {
          name: attachment.name,
          type: attachment.type,
          url: attachment.url,
          markAsPO: attachment.markAsPO,
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
 * Create a new enquiry from intake data
 * 
 * @param intake - Unified enquiry intake data
 * @param createdBy - Person creating the enquiry
 * @param createdByRole - Role of the creator
 * @param existingEnquiries - Existing enquiries to generate unique ID
 * @returns New enquiry object and initial messages
 */
export const createNewEnquiry = (
  intake: EnquiryIntake,
  createdBy: string,
  createdByRole: string,
  existingEnquiries: Enquiry[]
): CreateEnquiryResult => {
  const enquiryId = generateEnquiryId(existingEnquiries);
  const timestamp = new Date();

  const enquiry: Partial<Enquiry> = {
    id: enquiryId,
    buyerName: resolveIntakeBuyerName(intake.buyer),
    buyerCompany: intake.buyer.manualCompany,
    buyerPersonaId: intake.buyer.personaId,
    categories: intake.requirements.categories || [],
    estimatedValue: intake.requirements.estimatedValue,
    paymentTerms: intake.requirements.paymentTerms,
    etaDays: intake.requirements.etaDays,
    primaryCMId: intake.requirements.primaryCMId,
    region: intake.requirements.deliveryLocation,
    state: "Draft" as EnquiryState,
    createdAt: timestamp,
    lastActivity: timestamp,
    priority: "medium",
    tags: [],
    notes: intake.requirements.notes,
  };

  return {
    enquiryId,
    enquiry,
    initialMessages: intake.source.messages || [],
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

function resolveCreationCategories(data: EnquiryCreationData): Category[] {
  if (data.categories && data.categories.length > 0) {
    return data.categories;
  }

  if (data.productCategory && isValidCategory(data.productCategory)) {
    return [data.productCategory];
  }

  return [];
}

export function findInternalGroupForEnquiry(
  groups: GroupChannel[],
  categories: Category[]
): GroupChannel | null {
  const internalGroups = groups.filter((group) => group.type === "custom");
  if (internalGroups.length === 0) return null;

  const primaryCategory = getPrimaryCategory(categories);
  if (primaryCategory) {
    const normalizedCategory = primaryCategory.toLowerCase();
    const matchedGroup = internalGroups.find((group) => {
      const groupName = group.name.toLowerCase();
      const groupId = group.id.toLowerCase();
      return groupName.includes(normalizedCategory) || groupId.includes(normalizedCategory);
    });

    if (matchedGroup) {
      return matchedGroup;
    }
  }

  return internalGroups[0];
}

export function buildInternalEnquiryThread(
  params: {
    enquiryId: string;
    data: EnquiryCreationData;
    creatorPersonaId: string;
    creatorRole: string;
    allGroupChannels: GroupChannel[];
    sourceMessages?: Message[];
  }
): InternalEnquiryThreadResult | null {
  const categories = resolveCreationCategories(params.data);
  const targetGroup = findInternalGroupForEnquiry(params.allGroupChannels, categories);
  if (!targetGroup) return null;

  const threadId = generateThreadId();
  const threadTitle = params.data.buyerName
    ? `${params.data.buyerName}${categories.length > 0 ? ` - ${getPrimaryCategory(categories) ?? formatCategories(categories)}` : ""}`
    : `Enquiry ${params.enquiryId}`;

  const creatorPersona = getPersonaById(params.creatorPersonaId);
  const senderName = creatorPersona?.displayName || params.creatorPersonaId;
  const timestamp = new Date();

  const preferredSourceMessage = params.sourceMessages?.find((message) => message.attachment?.markAsPO)
    || params.sourceMessages?.find((message) => message.attachment)
    || null;
  const groupTagEvent =
    targetGroup.type === "custom"
      ? createGroupTaggedEvent(targetGroup.id, params.enquiryId, params.creatorPersonaId)
      : null;

  if (preferredSourceMessage) {
    const rootMessage: Message = {
      ...preferredSourceMessage,
      threadId,
      replyCount: 0,
    };

    return {
      groupId: targetGroup.id,
      threadId,
      threadTitle,
      events: [
        createThreadCreatedEvent(
          threadId,
          targetGroup.id,
          params.creatorPersonaId,
          threadTitle,
          params.enquiryId,
          preferredSourceMessage.id,
          rootMessage,
        ),
        ...(groupTagEvent ? [groupTagEvent] : []),
      ],
    };
  }

  const summaryParts = [`New enquiry ${params.enquiryId}`];
  if (params.data.buyerName.trim()) {
    summaryParts.push(`Buyer: ${params.data.buyerName.trim()}`);
  }
  if (categories.length > 0) {
    summaryParts.push(`Category: ${formatCategories(categories)}`);
  }
  if (params.data.notes?.trim()) {
    summaryParts.push(params.data.notes.trim().split("\n")[0]);
  }

  const rootMessageId = `${params.enquiryId}-thread-root-${Date.now()}`;
  const rootMessage: Message = {
    id: rootMessageId,
    type: "user",
    sender: senderName,
    senderPersonaId: params.creatorPersonaId,
    senderRole: params.creatorRole as Message["senderRole"],
    content: summaryParts.join(" • "),
    timestamp,
    threadId,
    replyCount: 0,
  };

  return {
    groupId: targetGroup.id,
    threadId,
    threadTitle,
    events: [
      createMessageSentEvent(targetGroup.id, targetGroup.id, {
        ...rootMessage,
      }),
      createThreadCreatedEvent(
        threadId,
        targetGroup.id,
        params.creatorPersonaId,
        threadTitle,
        params.enquiryId,
        rootMessageId,
        rootMessage,
      ),
      ...(groupTagEvent ? [groupTagEvent] : []),
    ],
  };
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
