import { FileText, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { MOCK_INTERNAL_GROUPS } from "@/infrastructure/datastore/mockData";

interface RfqRightRailProps {
  rfqId: string;
  activeTab: "chat" | "documents";
  onTabChange: (tab: "chat" | "documents") => void;
}

const CX_PERSONA_ID = "p_cx_1";

function formatTimestamp(value: Date | undefined): string {
  if (!value) return "";
  return value.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRfqCxThreadMessages(rfqId: string) {
  return MOCK_INTERNAL_GROUPS.flatMap((group) =>
    (group.threads || [])
      .filter((thread) => thread.enquiryId === rfqId && thread.participants.includes(CX_PERSONA_ID))
      .flatMap((thread) =>
        thread.messages.map((message) => ({
          id: message.id,
          sender: message.sender || "System",
          content: message.content,
          timestamp: message.timestamp,
          threadTitle: thread.title || "Internal thread",
        })),
      ),
  ).sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime());
}

export function RfqRightRail({ rfqId, activeTab, onTabChange }: RfqRightRailProps) {
  const chatMessages = getRfqCxThreadMessages(rfqId);

  return (
    <Card className="h-full min-h-[420px]">
      <CardHeader>
        <CardTitle className="text-base">Collaboration</CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col">
        <Tabs
          value={activeTab}
          onValueChange={(value) => onTabChange(value as "chat" | "documents")}
          className="h-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">
              <MessageCircle className="size-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="size-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-4 rounded-lg border p-3 text-sm">
            {chatMessages.length > 0 ? (
              <div className="space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className="rounded-md border border-border/60 p-2.5">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {message.threadTitle}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {message.sender} • {formatTimestamp(message.timestamp)}
                    </p>
                    <p className="mt-1.5 text-sm text-foreground">{message.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No chat messages found in CX-participating threads for this enquiry.
              </p>
            )}
          </TabsContent>

          <TabsContent value="documents" className="mt-4 rounded-lg border p-3 text-sm">
            <ul className="space-y-2 text-muted-foreground">
              <li>PO_Draft_v2.pdf</li>
              <li>Grade_Requirements.xlsx</li>
              <li>Transport_Terms.docx</li>
            </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
