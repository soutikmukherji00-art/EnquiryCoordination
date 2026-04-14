import { FileText, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";

interface RfqRightRailProps {
  activeTab: "chat" | "documents";
  onTabChange: (tab: "chat" | "documents") => void;
}

export function RfqRightRail({ activeTab, onTabChange }: RfqRightRailProps) {
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

          <TabsContent value="chat" className="mt-4 rounded-lg border p-3 text-sm text-muted-foreground">
            Chat thread integration placeholder.
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
