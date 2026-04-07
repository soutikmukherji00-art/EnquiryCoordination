/**
 * Unified Group Creation Flow
 *
 * Single tabbed modal for creating both Buyer and Seller groups.
 * - Two tabs: External Users / Internal Users (freely togglable)
 * - External: Company → Contact drill-down. Contacts added via WhatsApp only.
 * - Internal: Per-member dual checkboxes (WhatsApp / Add Internally).
 * - Persistent cart strip + group name input at the bottom.
 *
 * `groupType` is determined by the caller (BDM → "buyer", CM → "seller").
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  MessageCircle,
  UserPlus,
  Trash2,
  Building2,
  Phone,
  Check,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { Input } from "@/app/components/ui/input";
import { Toggle } from "@/app/components/ui/toggle";
import { Persona } from "@/domain/enquiry/enquiry.types";

// Buyer data
import {
  MOCK_BUYERS,
  getContactsForBuyer,
  getBuyerById,
} from "@/domain/buyer/buyer.mock-data";

// Seller data
import {
  MOCK_SELLERS as MOCK_SELLER_COMPANIES,
  getContactsForSeller,
  getSellerById,
} from "@/domain/seller/seller.mock-data";

// Re-export the result type expected by handlers
export interface GroupCreationResult {
  externalIds: string[];
  internalIds: string[];
  groupName: string;
  inviteMethod: "whatsapp" | "email" | "both";
  /** Per-internal-member invitation detail */
  internalMethods?: Record<string, { whatsapp: boolean; internal: boolean }>;
}

// ─── Cart Item ───────────────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  name: string;
  kind: "external" | "internal";
  companyName?: string;
  role?: string;
  phone?: string;
  methods: { whatsapp: boolean; internal: boolean };
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface GroupCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: GroupCreationResult) => void;
  groupType: "buyer" | "seller";
  personas: Persona[];
}

type Tab = "external" | "internal";

// ─── Component ───────────────────────────────────────────────────────────────
export function GroupCreationFlow({
  isOpen,
  onClose,
  onComplete,
  groupType,
  personas,
}: GroupCreationFlowProps) {
  // ── state ──────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [activeTab, setActiveTab] = useState<Tab>("external");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [groupName, setGroupName] = useState("");
  const [showCart, setShowCart] = useState(false);

  // reset on close
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setActiveTab("external");
      setSearchQuery("");
      setSelectedCompanyId(null);
      setCart([]);
      setGroupName("");
      setShowCart(false);
    }
  }, [isOpen]);

  // ── derived data ───────────────────────────────────────────────────────

  // Companies list (buyer or seller)
  const companies = useMemo(() => {
    if (groupType === "buyer") {
      return MOCK_BUYERS.map((b) => ({
        id: b.id,
        name: b.name,
        contactCount: b.contactIds.length,
        region: b.region,
        isActive: true,
      }));
    }
    return MOCK_SELLER_COMPANIES.map((s) => ({
      id: s.id,
      name: s.name,
      contactCount: s.contactIds.length,
      region: s.region,
      isActive: s.isActive,
    }));
  }, [groupType]);

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const q = searchQuery.toLowerCase();
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, searchQuery]);

  // Contacts for selected company
  const companyContacts = useMemo<
    Array<{ id: string; name: string; role: string; phone: string; companyName: string }>
  >(() => {
    if (!selectedCompanyId) return [];
    if (groupType === "buyer") {
      const contacts = getContactsForBuyer(selectedCompanyId);
      const buyer = getBuyerById(selectedCompanyId);
      return contacts.map((c) => ({
        id: c.id,
        name: c.name,
        role: c.role,
        phone: c.phone,
        companyName: buyer?.name || "Unknown",
      }));
    }
    const contacts = getContactsForSeller(selectedCompanyId);
    const seller = getSellerById(selectedCompanyId);
    return contacts.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      phone: c.phone,
      companyName: seller?.name || "Unknown",
    }));
  }, [selectedCompanyId, groupType]);

  // Internal personas (BDM, CM, CX)
  const internalPersonas = useMemo(
    () => personas.filter((p) => !p.isExternal),
    [personas],
  );

  const filteredInternalPersonas = useMemo(() => {
    if (!searchQuery.trim()) return internalPersonas;
    const q = searchQuery.toLowerCase();
    return internalPersonas.filter((p) =>
      p.displayName.toLowerCase().includes(q),
    );
  }, [internalPersonas, searchQuery]);

  // Cart counts
  const externalCount = cart.filter((i) => i.kind === "external").length;
  const internalCount = cart.filter((i) => i.kind === "internal").length;

  // ── helpers ────────────────────────────────────────────────────────────

  const isInCart = useCallback(
    (id: string) => cart.some((i) => i.id === id),
    [cart],
  );

  const getCartItem = useCallback(
    (id: string) => cart.find((i) => i.id === id),
    [cart],
  );

  const addExternalContact = useCallback(
    (contact: { id: string; name: string; role: string; phone: string; companyName: string }) => {
      if (isInCart(contact.id)) return;
      setCart((prev) => [
        ...prev,
        {
          id: contact.id,
          name: contact.name,
          kind: "external" as const,
          companyName: contact.companyName,
          role: contact.role,
          phone: contact.phone,
          methods: { whatsapp: true, internal: false },
        },
      ]);
    },
    [isInCart],
  );

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggleInternalMethod = useCallback(
    (personaId: string, method: "whatsapp" | "internal") => {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === personaId);
        if (!existing) {
          // add new with this method
          const persona = internalPersonas.find((p) => p.id === personaId);
          if (!persona) return prev;
          return [
            ...prev,
            {
              id: persona.id,
              name: persona.displayName,
              kind: "internal" as const,
              role: persona.role,
              methods: {
                whatsapp: method === "whatsapp",
                internal: method === "internal",
              },
            },
          ];
        }
        // toggle the method
        const newMethods = {
          ...existing.methods,
          [method]: !existing.methods[method],
        };
        // if both are off → remove
        if (!newMethods.whatsapp && !newMethods.internal) {
          return prev.filter((i) => i.id !== personaId);
        }
        return prev.map((i) =>
          i.id === personaId ? { ...i, methods: newMethods } : i,
        );
      });
    },
    [internalPersonas],
  );

  // ── auto group name ────────────────────────────────────────────────────
  const autoGroupName = useMemo(() => {
    const externalItems = cart.filter((i) => i.kind === "external");
    if (externalItems.length === 0) return "";
    const uniqueCompanies = [...new Set(externalItems.map((i) => i.companyName))];
    if (uniqueCompanies.length === 1) {
      return `${uniqueCompanies[0]} ${groupType === "buyer" ? "Group" : "Pricing Discussion"}`;
    }
    return `Multi-${groupType === "buyer" ? "Buyer" : "Seller"} Group (${uniqueCompanies.length} companies)`;
  }, [cart, groupType]);

  // ── submit ─────────────────────────────────────────────────────────────
  const handleCreate = useCallback(() => {
    const finalName = groupName.trim() || autoGroupName || `New ${groupType === "buyer" ? "Buyer" : "Seller"} Group`;
    const externalIds = cart.filter((i) => i.kind === "external").map((i) => i.id);
    const internalIds = cart.filter((i) => i.kind === "internal").map((i) => i.id);
    const internalMethods: Record<string, { whatsapp: boolean; internal: boolean }> = {};
    cart
      .filter((i) => i.kind === "internal")
      .forEach((i) => {
        internalMethods[i.id] = { ...i.methods };
      });
    onComplete({
      externalIds,
      internalIds,
      groupName: finalName,
      inviteMethod: "whatsapp",
      internalMethods,
    });
    onClose();
  }, [cart, groupName, autoGroupName, groupType, onComplete, onClose]);

  const canCreate = cart.length > 0;

  // ── render ─────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  const entityLabel = groupType === "buyer" ? "Buyer" : "Seller";

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden">
        {/* ─── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            {/* Back arrow for Step 2 only, beside heading */}
            {currentStep === 2 && (
              <button
                onClick={() => setCurrentStep(1)}
                className="text-gray-500 hover:text-gray-800 transition-colors -ml-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {currentStep === 1 ? "Select Group Members" : "Create New Group"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─── Step 1: Selection ───────────────────────────────────── */}
        {currentStep === 1 && (
          <>
            {/* ─── Tabs ───────────────────────────────────────────────── */}
            <div className="flex border-b shrink-0">
              <button
                onClick={() => {
                  setActiveTab("external");
                  setSearchQuery("");
                  setSelectedCompanyId(null);
                }}
                className={cn(
                  "flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2",
                  activeTab === "external"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700",
                )}
              >
                <Building2 className="w-4 h-4" />
                External Users
                {externalCount > 0 && (
                  <span className="ml-1 min-w-[20px] h-5 px-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
                    {externalCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab("internal");
                  setSearchQuery("");
                }}
                className={cn(
                  "flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2",
                  activeTab === "internal"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700",
                )}
              >
                <Users className="w-4 h-4" />
                Internal Users
                {internalCount > 0 && (
                  <span className="ml-1 min-w-[20px] h-5 px-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
                    {internalCount}
                  </span>
                )}
              </button>
            </div>

            {/* ─── Search ─────────────────────────────────────────────── */}
            <div className="px-5 py-3 border-b shrink-0">
              {activeTab === "external" && selectedCompanyId ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCompanyId(null);
                      setSearchQuery("");
                    }}
                    className="text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {companies.find((c) => c.id === selectedCompanyId)?.name} — Contacts
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={
                      activeTab === "external"
                        ? `Search ${entityLabel.toLowerCase()} companies...`
                        : "Search team members..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
            </div>

            {/* ─── Content ───────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto min-h-0 px-5 py-3">
              {activeTab === "external" ? (
                selectedCompanyId ? (
                  /* ── Contact list for a company ── */
                  <div className="space-y-2">
                    {companyContacts.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">
                        No contacts available for this {entityLabel.toLowerCase()}
                      </p>
                    ) : (
                      companyContacts.map((contact) => {
                        const inCart = isInCart(contact.id);
                        return (
                          <div
                            key={contact.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                              inCart
                                ? "border-blue-500 bg-blue-50/40"
                                : "border-gray-200 hover:border-gray-300",
                            )}
                          >
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
                              {contact.name.substring(0, 2).toUpperCase()}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {contact.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {contact.role}
                              </p>
                              <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {contact.phone}
                              </p>
                            </div>
                            {/* WhatsApp Toggle */}
                            <Toggle
                              aria-label="Add via WhatsApp"
                              size="sm"
                              variant="outline"
                              pressed={inCart}
                              onPressedChange={(pressed) => {
                                if (pressed) {
                                  addExternalContact(contact);
                                } else {
                                  removeFromCart(contact.id);
                                }
                              }}
                            >
                              {inCart ? <Check /> : <MessageCircle />}
                              WhatsApp
                            </Toggle>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  /* ── Company list ── */
                  <div className="space-y-2">
                    {filteredCompanies.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">
                        No {entityLabel.toLowerCase()} companies found
                      </p>
                    ) : (
                      filteredCompanies.map((company) => {
                        // count how many contacts from this company are in the cart
                        const selectedFromCompany = cart.filter(
                          (i) => i.kind === "external" && i.companyName === company.name,
                        ).length;
                        return (
                          <button
                            key={company.id}
                            onClick={() => {
                              setSelectedCompanyId(company.id);
                              setSearchQuery("");
                            }}
                            className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-gray-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {company.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {company.contactCount} contact{company.contactCount !== 1 ? "s" : ""}
                                  {company.region && ` · ${company.region}`}
                                  {!company.isActive && (
                                    <span className="ml-1 text-amber-600">· Inactive</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedFromCompany > 0 && (
                                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
                                  {selectedFromCompany}
                                </span>
                              )}
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )
              ) : (
                /* ── Internal users ── */
                <div className="space-y-2">
                  {filteredInternalPersonas.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No team members found
                    </p>
                  ) : (
                    filteredInternalPersonas.map((persona) => {
                      const item = getCartItem(persona.id);
                      const hasWhatsApp = item?.methods.whatsapp ?? false;
                      const hasInternal = item?.methods.internal ?? false;
                      const isSelected = hasWhatsApp || hasInternal;

                      return (
                        <div
                          key={persona.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                            isSelected
                              ? "border-blue-500 bg-blue-50/40"
                              : "border-gray-200",
                          )}
                        >
                          {/* Avatar */}
                          <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-semibold shrink-0">
                            {persona.displayName.substring(0, 2).toUpperCase()}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {persona.displayName}
                            </p>
                            <p className="text-xs text-gray-500">{persona.role}</p>
                          </div>
                          {/* Dual toggles — horizontal */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Toggle
                              aria-label="Add via WhatsApp"
                              size="sm"
                              variant="outline"
                              pressed={hasWhatsApp}
                              onPressedChange={() =>
                                toggleInternalMethod(persona.id, "whatsapp")
                              }
                            >
                              {hasWhatsApp ? <Check /> : <MessageCircle />}
                              WhatsApp
                            </Toggle>
                            <Toggle
                              aria-label="Add internally"
                              size="sm"
                              variant="outline"
                              pressed={hasInternal}
                              onPressedChange={() =>
                                toggleInternalMethod(persona.id, "internal")
                              }
                            >
                              {hasInternal ? <Check /> : <UserPlus />}
                              Internal
                            </Toggle>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── Step 2: Review ─────────────────────────────────────── */}
        {currentStep === 2 && (
          <div className="flex-1 overflow-y-auto min-h-0 px-5 pt-4 pb-2 space-y-3">
            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <Input
                type="text"
                placeholder={autoGroupName || `${entityLabel} Group Name...`}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Selected Members List - Non-collapsible */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selected Members
              </label>
              {/* Left-aligned list without border */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4 flex-1 min-h-0 overflow-y-auto">
                {cart.filter((i) => i.kind === "external").length > 0 && (
                  <div>
                    <p className="text-xs font-normal text-gray-400 uppercase tracking-wide mb-3">
                      External Users ({cart.filter((i) => i.kind === "external").length})
                    </p>
                    <div className="space-y-2.5">
                      {cart
                        .filter((i) => i.kind === "external")
                        .map((item) => (
                          <div key={item.id} className="flex items-center gap-3 text-sm">
                            <div className="size-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
                              {item.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-gray-700">{item.name}</span>
                              <span className="text-xs text-gray-500 ml-1">• WhatsApp</span>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Remove"
                            >
                              <X className="size-4 text-gray-400 hover:text-gray-600" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {cart.filter((i) => i.kind === "internal").length > 0 && (
                  <div>
                    <p className="text-xs font-normal text-gray-400 uppercase tracking-wide mb-3">
                      Internal Users ({cart.filter((i) => i.kind === "internal").length})
                    </p>
                    <div className="space-y-2.5">
                      {cart
                        .filter((i) => i.kind === "internal")
                        .map((item) => (
                          <div key={item.id} className="flex items-center gap-3 text-sm">
                            <div className="size-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
                              {item.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-gray-700">{item.name}</span>
                              <span className="text-xs text-gray-500 ml-1">
                                • {[
                                  item.methods.whatsapp && "WhatsApp",
                                  item.methods.internal && "Internal",
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Remove"
                            >
                              <X className="size-4 text-gray-400 hover:text-gray-600" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {cart.length === 0 && (
                  <div className="py-8 text-sm text-gray-400">
                    No members selected
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Footer ──────────────────────────────────────────────── */}
        <div className="px-5 py-4 border-t bg-white shrink-0">
          <div className="flex items-center justify-between">
            {/* Left: Member count for Step 1, empty for Step 2 */}
            {currentStep === 1 ? (
              <p className="text-xs text-gray-500">
                {externalCount} external · {internalCount} internal
              </p>
            ) : (
              <div />
            )}

            {/* Right: Next/Create button */}
            {currentStep === 1 ? (
              <button
                onClick={() => setCurrentStep(2)}
                disabled={cart.length === 0}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                  cart.length > 0
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed",
                )}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={!canCreate}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-medium transition-colors",
                  canCreate
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed",
                )}
              >
                Create New Group
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}