import { FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { ThreadPanel } from "@/app/components/ThreadPanel";
import type { Persona } from "@/domain/enquiry/enquiry.types";
import type { Attachment, Message } from "@/domain/message/message.types";
import type { Thread } from "@/domain/message/thread.types";

interface RfqRightRailProps {
  rfqId: string;
  activeTab: "chat" | "documents";
  onTabChange: (tab: "chat" | "documents") => void;
  chatThread: Thread | null;
  chatRootMessage?: Message;
  chatGroupId?: string;
  chatGroupName?: string;
  currentPersonaId: string;
  currentUser: string;
  currentRole: string;
  personaMap: Map<string, Persona>;
  onSendReply: (
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
  ) => void;
}

export function RfqRightRail({
  rfqId: _rfqId,
  activeTab: _activeTab,
  onTabChange: _onTabChange,
  chatThread,
  chatRootMessage,
  chatGroupId,
  chatGroupName,
  currentPersonaId,
  currentUser,
  currentRole,
  personaMap,
  onSendReply,
}: RfqRightRailProps) {
  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-2xl border border-border/60 bg-background">
      <div className="absolute right-3 top-3 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open document menu" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Documents</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <FileText className="size-4" />
              PO_Draft_v2.pdf
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="size-4" />
              Grade_Requirements.xlsx
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="size-4" />
              Transport_Terms.docx
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="h-full">
        {chatThread && chatGroupId ? (
          <ThreadPanel
            thread={chatThread}
            rootMessage={chatRootMessage}
            groupName={chatGroupName || "Internal thread"}
            groupId={chatGroupId}
            currentPersonaId={currentPersonaId}
            currentUser={currentUser}
            currentRole={currentRole}
            personaMap={personaMap}
            onSendReply={onSendReply}
            onClose={() => {}}
            mode="main"
            hideEnquiryHeader
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-sm text-muted-foreground text-center">
              No chat thread found in CX-participating conversations for this enquiry.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
