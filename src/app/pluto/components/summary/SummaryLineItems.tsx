import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

export interface SummaryLineItem {
  id: string;
  productName: string;
  requestedQty: string;
  offeredQty: string;
  sellerPrice: string;
  buyerPrice: string;
}

interface SummaryLineItemsProps {
  items: SummaryLineItem[];
}

export function SummaryLineItems({ items }: SummaryLineItemsProps) {
  return (
    <Card className="gap-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Line Items</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-y border-border/60 bg-muted/30 text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">Product Name</th>
                <th className="px-6 py-3 font-medium">Req Qty</th>
                <th className="px-6 py-3 font-medium">Offered Qty</th>
                <th className="px-6 py-3 font-medium">Seller Price</th>
                <th className="px-6 py-3 font-medium">Buyer Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/50">
                  <td className="px-6 py-3 font-medium text-foreground">{item.productName}</td>
                  <td className="px-6 py-3 text-muted-foreground">{item.requestedQty}</td>
                  <td className="px-6 py-3 text-muted-foreground">{item.offeredQty}</td>
                  <td className="px-6 py-3 text-muted-foreground">{item.sellerPrice}</td>
                  <td className="px-6 py-3 text-muted-foreground">{item.buyerPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
