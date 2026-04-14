import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

interface CmEnquiryPreviewPageProps {
  rfqNumber: string;
  onBack: () => void;
  onReviewOrderSummary: () => void;
}

export function CmEnquiryPreviewPage({
  rfqNumber,
  onBack,
  onReviewOrderSummary,
}: CmEnquiryPreviewPageProps) {
  return (
    <div className="flex h-full items-center justify-center bg-background px-4">
      <Card className="w-full max-w-[560px] border-border/60">
        <CardHeader className="space-y-3">
          <Button variant="ghost" size="sm" className="w-fit gap-1.5 px-2" onClick={onBack}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <CardTitle className="text-xl">CM Enquiry Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Direct order for <span className="font-medium text-foreground">{rfqNumber}</span> is marked as won and
            ready for CM review.
          </p>
          <Button className="w-full gap-2" onClick={onReviewOrderSummary}>
            <ClipboardCheck className="size-4" />
            Review order summary
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
