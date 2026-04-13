import type { EnquiryRecord } from "./enquiry.record";

export type EnquiryProductLine = NonNullable<EnquiryRecord["products"]>[number];

export interface EnquiryCartCatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const ENQUIRY_CART_CATALOG_ITEMS: EnquiryCartCatalogItem[] = [
  { id: "tmt-rebar", name: "TMT Rebar", description: "8 mm - Fe-415 / Fe-500", category: "Steel & Allied" },
  { id: "beams-ismb-200", name: "Beams", description: "ISMB 200 - IS 2062 E250", category: "Steel & Allied" },
  { id: "angles-isa-50", name: "Angles", description: "ISA 50 x 50 x 6", category: "Steel & Allied" },
  { id: "vitrified-tile-800x2400", name: "Birla Pivot Full Body Vitrified Tiles", description: "800 x 2400 Galaxy Dark Grey", category: "All Categories" },
  { id: "vitero-presto", name: "Vitero Glazed Vitrified Tile - Presto", description: "Wood Look Tiles", category: "All Categories" },
  { id: "calacatta-white", name: "Marble Effect Porcelain Tiles", description: "600 x 600 Calacatta White", category: "All Categories" },
];

function normalizeIdentity(value: string): string {
  return value.trim().toLowerCase();
}

function lineIdentity(line: EnquiryProductLine): string {
  return normalizeIdentity(line.name || line.category || "");
}

export function countEnquiryCartItems(products: EnquiryRecord["products"]): number {
  return products?.length || 0;
}

export function filterEnquiryCartItems(products: EnquiryRecord["products"], query: string): Array<{ product: EnquiryProductLine; index: number }> {
  const source = products || [];
  const trimmedQuery = query.trim().toLowerCase();
  const indexed = source.map((product, index) => ({ product, index }));
  if (!trimmedQuery) return indexed;

  return indexed.filter(({ product }) => {
    const haystack = `${product.name || ""} ${product.category || ""} ${product.quantity || ""}`.toLowerCase();
    return haystack.includes(trimmedQuery);
  });
}

export function addEnquiryCartItem(
  products: EnquiryRecord["products"],
  item: { name: string; quantity?: string; fallbackCategory: string },
): EnquiryProductLine[] {
  const normalizedName = item.name.trim();
  if (!normalizedName) return products || [];

  const quantity = item.quantity?.trim();
  const nextLine: EnquiryProductLine = {
    category: item.fallbackCategory || "Other",
    name: normalizedName,
    quantity: quantity || undefined,
  };

  const existing = products || [];
  const identity = normalizeIdentity(normalizedName);
  if (existing.some((line) => lineIdentity(line) === identity)) {
    return existing;
  }

  return [...existing, nextLine];
}

export function removeEnquiryCartItemAtIndex(
  products: EnquiryRecord["products"],
  indexToRemove: number,
): EnquiryProductLine[] {
  const source = products || [];
  return source.filter((_, index) => index !== indexToRemove);
}

export function updateEnquiryCartItemQuantity(
  products: EnquiryRecord["products"],
  indexToUpdate: number,
  quantity: string,
): EnquiryProductLine[] {
  const source = products || [];
  const normalizedQuantity = quantity.trim();
  return source.map((product, index) =>
    index === indexToUpdate ? { ...product, quantity: normalizedQuantity || undefined } : product,
  );
}

export function addCatalogSelectionsToCart(
  products: EnquiryRecord["products"],
  selectedItemIds: Iterable<string>,
  fallbackCategory: string,
): EnquiryProductLine[] {
  let nextProducts = products || [];
  const selected = new Set(selectedItemIds);
  ENQUIRY_CART_CATALOG_ITEMS.filter((item) => selected.has(item.id)).forEach((item) => {
    nextProducts = addEnquiryCartItem(nextProducts, {
      name: item.name,
      fallbackCategory,
    });
  });
  return nextProducts;
}

export function inferCartLineFromProductHints(
  productHints: string[],
  category: string,
): EnquiryProductLine | null {
  if (!productHints.length) return null;

  return {
    category: category || "General",
    name: productHints[0],
    quantity: productHints.find((hint) => /\d/.test(hint)) || "TBD",
  };
}
