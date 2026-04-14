interface SummaryLineItem {
  id: string;
  productName: string;
  requestedQty: number;
  offeredQty: number;
  sellerPrice: number;
  buyerPrice: number;
}

interface SummaryLineItemsProps {
  items: SummaryLineItem[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SummaryLineItems({ items }: SummaryLineItemsProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-sm md:p-5">
      <div className="mb-3">
        <h2 className="text-base font-semibold">Line Items</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-muted-foreground">
              <th className="px-2 py-2 font-medium">Product Name</th>
              <th className="px-2 py-2 font-medium">Req Qty</th>
              <th className="px-2 py-2 font-medium">Offered Qty</th>
              <th className="px-2 py-2 font-medium">Seller Price</th>
              <th className="px-2 py-2 font-medium">Buyer Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border/40 last:border-b-0">
                <td className="px-2 py-3 font-medium">{item.productName}</td>
                <td className="px-2 py-3">{item.requestedQty} MT</td>
                <td className="px-2 py-3">{item.offeredQty} MT</td>
                <td className="px-2 py-3">{formatCurrency(item.sellerPrice)}</td>
                <td className="px-2 py-3">{formatCurrency(item.buyerPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
