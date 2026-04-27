import { afterEach, describe, expect, it } from "vitest";
import { MOCK_BUYERS, MOCK_CONTACTS, addContactForBuyer, getBuyerById } from "../buyer.mock-data";

const originalContacts = MOCK_CONTACTS.map((contact) => ({ ...contact }));
const originalBuyers = MOCK_BUYERS.map((buyer) => ({ ...buyer, contactIds: [...buyer.contactIds] }));

afterEach(() => {
  MOCK_CONTACTS.splice(0, MOCK_CONTACTS.length, ...originalContacts.map((contact) => ({ ...contact })));
  MOCK_BUYERS.splice(0, MOCK_BUYERS.length, ...originalBuyers.map((buyer) => ({ ...buyer, contactIds: [...buyer.contactIds] })));
});

describe("addContactForBuyer", () => {
  it("adds a new contact and links it to the buyer", () => {
    const buyer = getBuyerById("buyer_1");
    expect(buyer).toBeDefined();
    const initialContactCount = MOCK_CONTACTS.length;
    const initialBuyerContactCount = buyer!.contactIds.length;

    const created = addContactForBuyer("buyer_1", {
      name: "New Intake Contact",
      phone: "+91 91234 56789",
      role: "Procurement",
      email: "intake@buyer.com",
    });

    expect(created).toBeTruthy();
    expect(MOCK_CONTACTS).toHaveLength(initialContactCount + 1);
    expect(getBuyerById("buyer_1")?.contactIds).toHaveLength(initialBuyerContactCount + 1);
    expect(getBuyerById("buyer_1")?.contactIds).toContain(created?.id);
  });

  it("returns null when the buyer does not exist", () => {
    const created = addContactForBuyer("buyer_missing", {
      name: "Ghost Contact",
      phone: "+91 90000 00000",
      role: "Operations",
    });

    expect(created).toBeNull();
  });
});
