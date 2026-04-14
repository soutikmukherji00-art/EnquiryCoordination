import { Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Switch } from "@/app/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import type { RfqSectionProps } from "@/app/rfq/components/types";
import { getGrandTotal, getLineItemTotal } from "@/app/rfq/rfq-details.view-models";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function RfqLineItemsSection({ isEditMode, form }: RfqSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });
  const items = form.watch("lineItems");
  const grandTotal = getGrandTotal(items);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Line Items</CardTitle>
        {isEditMode ? (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                id: `line-${fields.length + 1}`,
                productName: "",
                quantity: 1,
                unitPrice: 0,
                cnFromSeller: false,
                cnToBuyer: false,
              })
            }
          >
            Add Product Row
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>CN to Buyer</TableHead>
                <TableHead>CN from Seller</TableHead>
                <TableHead className="text-right">Total</TableHead>
                {isEditMode ? <TableHead className="w-[54px]" /> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => {
                const row = items[index];
                return (
                  <TableRow key={field.id}>
                    <TableCell>
                      {isEditMode ? (
                        <Input {...form.register(`lineItems.${index}.productName`)} />
                      ) : (
                        <span>{row.productName}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditMode ? (
                        <Input
                          type="number"
                          min={1}
                          className="w-24"
                          {...form.register(`lineItems.${index}.quantity`)}
                        />
                      ) : (
                        <span>{row.quantity}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditMode ? (
                        <Input
                          type="number"
                          min={0}
                          className="w-28"
                          {...form.register(`lineItems.${index}.unitPrice`)}
                        />
                      ) : (
                        <span>{currency.format(row.unitPrice)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditMode ? (
                        <Switch
                          checked={row.cnToBuyer}
                          onCheckedChange={(checked) =>
                            form.setValue(`lineItems.${index}.cnToBuyer`, checked)
                          }
                        />
                      ) : row.cnToBuyer ? (
                        "Yes"
                      ) : (
                        "No"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditMode ? (
                        <Switch
                          checked={row.cnFromSeller}
                          onCheckedChange={(checked) =>
                            form.setValue(`lineItems.${index}.cnFromSeller`, checked)
                          }
                        />
                      ) : row.cnFromSeller ? (
                        "Yes"
                      ) : (
                        "No"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {currency.format(getLineItemTotal(row.quantity, row.unitPrice))}
                    </TableCell>
                    {isEditMode ? (
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <div className="rounded-md border px-4 py-2 text-sm font-medium">
            Grand Total: {currency.format(grandTotal)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
