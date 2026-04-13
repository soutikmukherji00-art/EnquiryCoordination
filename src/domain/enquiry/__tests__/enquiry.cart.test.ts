import { describe, expect, it } from "vitest";
import {
  addCatalogSelectionsToCart,
  addEnquiryCartItem,
  countEnquiryCartItems,
  ENQUIRY_CART_CATALOG_ITEMS,
  filterEnquiryCartItems,
  inferCartLineFromProductHints,
  removeEnquiryCartItemAtIndex,
  updateEnquiryCartItemQuantity,
} from "../enquiry.cart";

describe("enquiry.cart helpers", () => {
  it("adds new lines and avoids duplicate identity", () => {
    const initial = [{ category: "Steel", name: "TMT Rebar", quantity: "50 MT" }];
    const withDuplicate = addEnquiryCartItem(initial, {
      name: "tmt rebar",
      quantity: "80 MT",
      fallbackCategory: "Steel",
    });
    const withNewItem = addEnquiryCartItem(withDuplicate, {
      name: "Beams",
      quantity: "100 MT",
      fallbackCategory: "Steel",
    });

    expect(withDuplicate).toHaveLength(1);
    expect(withNewItem).toHaveLength(2);
  });

  it("updates/removes quantity by stable index", () => {
    const initial = [
      { category: "Steel", name: "TMT Rebar", quantity: "50 MT" },
      { category: "Steel", name: "Beams", quantity: "100 MT" },
    ];
    const updated = updateEnquiryCartItemQuantity(initial, 1, "150 MT");
    const removed = removeEnquiryCartItemAtIndex(updated, 0);

    expect(updated[1].quantity).toBe("150 MT");
    expect(removed).toHaveLength(1);
    expect(removed[0].name).toBe("Beams");
  });

  it("adds selected catalog items with dedupe support", () => {
    const selected = [ENQUIRY_CART_CATALOG_ITEMS[0].id, ENQUIRY_CART_CATALOG_ITEMS[1].id];
    const initial = [{ category: "Steel", name: ENQUIRY_CART_CATALOG_ITEMS[0].name, quantity: "50 MT" }];
    const next = addCatalogSelectionsToCart(initial, selected, "Steel");

    expect(next).toHaveLength(2);
    expect(next.map((line) => line.name)).toEqual(["TMT Rebar", "Beams"]);
    expect(countEnquiryCartItems(next)).toBe(2);
  });

  it("filters cart items without losing original indices", () => {
    const initial = [
      { category: "Steel", name: "TMT Rebar", quantity: "50 MT" },
      { category: "Steel", name: "Beams", quantity: "100 MT" },
      { category: "Steel", name: "Angles", quantity: "200 MT" },
    ];
    const filtered = filterEnquiryCartItems(initial, "beam");

    expect(filtered).toHaveLength(1);
    expect(filtered[0].index).toBe(1);
    expect(filtered[0].product.name).toBe("Beams");
  });

  it("creates a prefilled cart line from product hints", () => {
    const line = inferCartLineFromProductHints(["TMT Rebar", "100 MT"], "Steel");

    expect(line).not.toBeNull();
    expect(line?.name).toBe("TMT Rebar");
    expect(line?.quantity).toBe("100 MT");
  });
});
