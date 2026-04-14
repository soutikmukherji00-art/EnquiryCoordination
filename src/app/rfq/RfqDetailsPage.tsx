import { useEffect, useMemo, useState } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { RfqAdditionalInputsSection } from "@/app/rfq/components/RfqAdditionalInputsSection";
import { RfqAssignmentSection } from "@/app/rfq/components/RfqAssignmentSection";
import { RfqBuyerDetailsSection } from "@/app/rfq/components/RfqBuyerDetailsSection";
import { RfqCommercialDetailsSection } from "@/app/rfq/components/RfqCommercialDetailsSection";
import { RfqHeaderSection } from "@/app/rfq/components/RfqHeaderSection";
import { RfqLineItemsSection } from "@/app/rfq/components/RfqLineItemsSection";
import { RfqOrderBillingSection } from "@/app/rfq/components/RfqOrderBillingSection";
import { RfqRightRail } from "@/app/rfq/components/RfqRightRail";
import { RfqShippingDetailsSection } from "@/app/rfq/components/RfqShippingDetailsSection";
import { PERSONAS } from "@/domain/persona/persona.data";
import type { Persona } from "@/domain/enquiry/enquiry.types";
import type { Attachment, Message } from "@/domain/message/message.types";
import type { Thread } from "@/domain/message/thread.types";
import { MOCK_INTERNAL_GROUPS } from "@/infrastructure/datastore/mockData";
import {
  canSendForApproval,
  rfqDetailsSchema,
  type RfqDetailsFormValues,
} from "@/app/rfq/rfq-details.schema";
import { buildRfqDetailsInitialValues } from "@/app/rfq/rfq-details.view-models";

interface RfqDetailsPageProps {
  rfqId: string;
  onBack: () => void;
}

const RFQ_CURRENT_PERSONA_ID = "p_cx_1";

type RfqChatContext = {
  thread: Thread;
  rootMessage?: Message;
  groupId: string;
  groupName: string;
};

function buildRfqChatContext(rfqId: string): RfqChatContext | null {
  const matchingThreads = MOCK_INTERNAL_GROUPS.flatMap((group) =>
    (group.threads || [])
      .filter((thread) => thread.enquiryId === rfqId && thread.participants.includes(RFQ_CURRENT_PERSONA_ID))
      .map((thread) => ({
        thread,
        groupId: group.id,
        groupName: group.name,
        rootMessage: group.messages.find((message) => message.id === thread.rootMessageId),
      })),
  );

  if (matchingThreads.length === 0) {
    return null;
  }

  const latestThread = [...matchingThreads].sort((left, right) => {
    const leftTime = left.thread.lastReplyAt?.getTime() || left.thread.createdAt.getTime();
    const rightTime = right.thread.lastReplyAt?.getTime() || right.thread.createdAt.getTime();
    return rightTime - leftTime;
  })[0];

  return {
    thread: {
      ...latestThread.thread,
      messages: [...latestThread.thread.messages],
      participants: [...latestThread.thread.participants],
    },
    rootMessage: latestThread.rootMessage,
    groupId: latestThread.groupId,
    groupName: latestThread.groupName,
  };
}

export function RfqDetailsPage({ rfqId, onBack }: RfqDetailsPageProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isRightRailOpen, setIsRightRailOpen] = useState(true);
  const [activeRailTab, setActiveRailTab] = useState<"chat" | "documents">("chat");
  const [rfqChatContext, setRfqChatContext] = useState<RfqChatContext | null>(() => buildRfqChatContext(rfqId));
  const [initialSnapshot, setInitialSnapshot] = useState<RfqDetailsFormValues>(() =>
    buildRfqDetailsInitialValues(rfqId),
  );
  const personaMap = useMemo<Map<string, Persona>>(
    () => new Map(PERSONAS.map((persona) => [persona.id, persona])),
    [],
  );
  const currentPersona = personaMap.get(RFQ_CURRENT_PERSONA_ID);
  const currentUser = currentPersona?.displayName || "Sneha Reddy";
  const currentRole = currentPersona?.role || "CX";

  const resolver: Resolver<RfqDetailsFormValues> = async (values) => {
    const result = rfqDetailsSchema.safeParse(values);

    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }

    const errors: Record<string, unknown> = {};

    for (const issue of result.error.issues) {
      const path = issue.path.map((segment) => String(segment));
      const segments = path.length > 0 ? path : ["root"];
      let current: Record<string, unknown> = errors;

      for (let index = 0; index < segments.length - 1; index += 1) {
        const segment = segments[index];
        const value = current[segment];

        if (typeof value !== "object" || value === null || Array.isArray(value)) {
          current[segment] = {};
        }

        current = current[segment] as Record<string, unknown>;
      }

      const lastSegment = segments[segments.length - 1];
      current[lastSegment] = {
        type: issue.code,
        message: issue.message,
      };
    }

    return {
      values: {},
      errors: errors as FieldErrors<RfqDetailsFormValues>,
    };
  };

  const form = useForm<RfqDetailsFormValues>({
    resolver,
    defaultValues: initialSnapshot,
    mode: "onChange",
  });

  useEffect(() => {
    const values = buildRfqDetailsInitialValues(rfqId);
    setInitialSnapshot(values);
    setRfqChatContext(buildRfqChatContext(rfqId));
    setIsEditMode(false);
    form.reset(values);
  }, [form, rfqId]);

  const handleSendRfqReply = (
    threadId: string,
    groupId: string,
    content: string,
    attachment?: Attachment,
    audioRecording?: {
      audioUrl: string;
      audioBlob: Blob;
      transcription: string;
      duration: number;
    },
    mentionedPersonaIds?: string[],
  ) => {
    setRfqChatContext((previous) => {
      if (!previous || previous.thread.id !== threadId || previous.groupId !== groupId) {
        return previous;
      }

      const timestamp = new Date();
      const newMessage: Message = {
        id: `rfq-${threadId}-${timestamp.getTime()}`,
        type: audioRecording ? "voice" : "user",
        sender: currentUser,
        senderPersonaId: RFQ_CURRENT_PERSONA_ID,
        senderRole: currentRole as Message["senderRole"],
        content: content.trim(),
        timestamp,
        attachment,
        audioRecording: audioRecording
          ? {
              blob: audioRecording.audioBlob,
              url: audioRecording.audioUrl,
              durationMs: Math.round(audioRecording.duration * 1000),
              transcription: {
                text: audioRecording.transcription,
                status: "complete",
              },
            }
          : undefined,
        mentions: mentionedPersonaIds,
      };

      const nextParticipants = previous.thread.participants.includes(RFQ_CURRENT_PERSONA_ID)
        ? previous.thread.participants
        : [...previous.thread.participants, RFQ_CURRENT_PERSONA_ID];

      return {
        ...previous,
        thread: {
          ...previous.thread,
          messages: [...previous.thread.messages, newMessage],
          replyCount: previous.thread.messages.length + 1,
          lastReplyAt: timestamp,
          participants: nextParticipants,
        },
      };
    });
  };

  const values = form.watch();
  const canSubmitForApproval = canSendForApproval(
    values,
    form.formState.isDirty,
    form.formState.isValid,
  );

  const handleDiscardChanges = () => {
    form.reset(initialSnapshot);
    setIsEditMode(false);
  };

  const saveAction = useMemo(
    () =>
      form.handleSubmit((nextValues) => {
        setInitialSnapshot(nextValues);
        form.reset(nextValues);
        setIsEditMode(false);
        toast.success("RFQ saved to draft");
      }),
    [form],
  );

  const approvalAction = useMemo(
    () =>
      form.handleSubmit((nextValues) => {
        setInitialSnapshot(nextValues);
        form.reset(nextValues);
        setIsEditMode(false);
        toast.success("RFQ sent for approval");
      }),
    [form],
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex h-full w-full max-w-[1540px] flex-1 flex-col gap-4 px-4 py-4 md:px-6">
        <RfqHeaderSection
          rfqId={rfqId}
          isEditMode={isEditMode}
          isRightRailOpen={isRightRailOpen}
          canSendForApproval={canSubmitForApproval}
          isSubmitting={form.formState.isSubmitting}
          onBack={onBack}
          onToggleEditMode={() => setIsEditMode(true)}
          onDiscardChanges={handleDiscardChanges}
          onSaveDraft={saveAction}
          onSendForApproval={approvalAction}
          onToggleRightRail={() => setIsRightRailOpen((current) => !current)}
        />

        <div
          className="grid min-h-0 flex-1 gap-4"
          style={{ gridTemplateColumns: isRightRailOpen ? "minmax(0, 1fr) 360px" : "minmax(0, 1fr)" }}
        >
          <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
            <RfqBuyerDetailsSection isEditMode={isEditMode} form={form} />
            <RfqAssignmentSection isEditMode={isEditMode} form={form} />
            <RfqCommercialDetailsSection isEditMode={isEditMode} form={form} />
            <RfqOrderBillingSection isEditMode={isEditMode} form={form} />
            <RfqAdditionalInputsSection isEditMode={isEditMode} form={form} />
            <RfqShippingDetailsSection isEditMode={isEditMode} form={form} />
            <RfqLineItemsSection isEditMode={isEditMode} form={form} />
          </div>

          {isRightRailOpen ? (
            <div className="min-h-0 overflow-y-auto">
              <RfqRightRail
                rfqId={rfqId}
                activeTab={activeRailTab}
                onTabChange={setActiveRailTab}
                chatThread={rfqChatContext?.thread || null}
                chatRootMessage={rfqChatContext?.rootMessage}
                chatGroupId={rfqChatContext?.groupId}
                chatGroupName={rfqChatContext?.groupName}
                currentPersonaId={RFQ_CURRENT_PERSONA_ID}
                currentUser={currentUser}
                currentRole={currentRole}
                personaMap={personaMap}
                onSendReply={handleSendRfqReply}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
