import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Search, ChevronLeft, AlertTriangle, MessageCircle, UserPlus } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { Input } from "@/app/components/ui/input";
import { Contact } from "@/domain/buyer/buyer.types";
import { MOCK_CONTACTS, getContactsForBuyer } from "@/domain/buyer/buyer.mock-data";
import { Persona } from "@/domain/enquiry/enquiry.types";
import { getPersonasByRole } from "@/domain/persona/persona.data";
import { getBuyerIdFromPersona } from "@/domain/buyer/buyer-persona-mapping";

interface GroupCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (members: SelectedMember[]) => void;
  personas: Persona[]; // All personas (we'll filter internally)
}

export type InvitationMethod = "internal" | "whatsapp" | "both";

export interface SelectedMember {
  id: string;
  type: "contact" | "persona";
  name: string;
  phone?: string;
  role?: string;
  buyerPersonaId?: string; // Link to buyer persona
  invitationMethod: InvitationMethod; // Track how they're being added
}

type Tab = "external" | "internal";

export function GroupCreationModal({
  isOpen,
  onClose,
  onCreateGroup,
  personas,
}: GroupCreationModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("external");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuyerPersonaId, setSelectedBuyerPersonaId] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [showMultiBuyerWarning, setShowMultiBuyerWarning] = useState(false);

  // Get buyer personas (external users with Buyer role)
  const buyerPersonas = useMemo(() => {
    return personas.filter(p => p.role === "Buyer" && p.isExternal);
  }, [personas]);

  // Filter buyer personas by search
  const filteredBuyerPersonas = useMemo(() => {
    if (!searchQuery.trim()) return buyerPersonas;
    const query = searchQuery.toLowerCase();
    return buyerPersonas.filter(p =>
      p.displayName.toLowerCase().includes(query)
    );
  }, [searchQuery, buyerPersonas]);

  // Filter internal personas by search
  const filteredInternalPersonas = useMemo(() => {
    if (!searchQuery.trim()) return personas.filter(p => !p.isExternal);
    const query = searchQuery.toLowerCase();
    return personas.filter(
      (p) => !p.isExternal && p.displayName.toLowerCase().includes(query)
    );
  }, [searchQuery, personas]);

  // Get contacts for selected buyer persona
  const buyerContacts = useMemo(() => {
    if (!selectedBuyerPersonaId) return [];
    const buyerId = getBuyerIdFromPersona(selectedBuyerPersonaId);
    if (!buyerId) return [];
    return getContactsForBuyer(buyerId);
  }, [selectedBuyerPersonaId]);

  // Get selected buyer persona
  const selectedBuyerPersona = useMemo(() => {
    if (!selectedBuyerPersonaId) return null;
    return buyerPersonas.find(p => p.id === selectedBuyerPersonaId);
  }, [selectedBuyerPersonaId, buyerPersonas]);

  // Check if multiple buyers are selected
  const selectedBuyerPersonaIds = useMemo(() => {
    const buyerIds = new Set<string>();
    selectedMembers.forEach((member) => {
      if (member.type === "contact" && member.buyerPersonaId) {
        buyerIds.add(member.buyerPersonaId);
      }
    });
    return Array.from(buyerIds);
  }, [selectedMembers]);

  // Handle contact selection (external users always get WhatsApp)
  const handleContactToggle = (contact: Contact) => {
    const isSelected = selectedMembers.some((m) => m.id === contact.id);

    if (isSelected) {
      // Deselect
      setSelectedMembers(selectedMembers.filter((m) => m.id !== contact.id));
      setShowMultiBuyerWarning(false);
    } else {
      // Check if selecting from a different buyer
      const existingBuyerIds = new Set(
        selectedMembers
          .filter((m) => m.type === "contact")
          .map((m) => m.buyerPersonaId)
          .filter(Boolean)
      );

      if (existingBuyerIds.size > 0 && !existingBuyerIds.has(selectedBuyerPersonaId!)) {
        // Show warning but allow selection
        setShowMultiBuyerWarning(true);
      }

      // Add to selection - external users always get WhatsApp invitation
      setSelectedMembers([
        ...selectedMembers,
        {
          id: contact.id,
          type: "contact",
          name: contact.name,
          phone: contact.phone,
          role: contact.role,
          buyerPersonaId: selectedBuyerPersonaId!,
          invitationMethod: "whatsapp",
        },
      ]);
    }
  };

  // Handle internal persona invitation method selection
  const handleInternalPersonaAdd = (persona: Persona, method: "internal" | "whatsapp") => {
    const existingMember = selectedMembers.find((m) => m.id === persona.id);

    if (existingMember) {
      // Update invitation method
      if (existingMember.invitationMethod === method) {
        // If clicking the same method, remove it
        setSelectedMembers(selectedMembers.filter((m) => m.id !== persona.id));
      } else if (existingMember.invitationMethod === "both") {
        // If both are selected, remove one method
        const newMethod = method === "internal" ? "whatsapp" : "internal";
        setSelectedMembers(
          selectedMembers.map((m) =>
            m.id === persona.id ? { ...m, invitationMethod: newMethod } : m
          )
        );
      } else {
        // If one method is selected, add the other to make it "both"
        setSelectedMembers(
          selectedMembers.map((m) =>
            m.id === persona.id ? { ...m, invitationMethod: "both" } : m
          )
        );
      }
    } else {
      // Add new selection
      setSelectedMembers([
        ...selectedMembers,
        {
          id: persona.id,
          type: "persona",
          name: persona.displayName,
          role: persona.role,
          invitationMethod: method,
        },
      ]);
    }
  };

  // Check if internal persona has a specific method selected
  const hasInternalMethod = (personaId: string, method: "internal" | "whatsapp"): boolean => {
    const member = selectedMembers.find((m) => m.id === personaId);
    if (!member) return false;
    return member.invitationMethod === method || member.invitationMethod === "both";
  };

  // Handle create group
  const handleCreateGroup = () => {
    if (selectedMembers.length === 0) return;
    onCreateGroup(selectedMembers);
    handleClose();
  };

  // Handle close and reset
  const handleClose = () => {
    setActiveTab("external");
    setSearchQuery("");
    setSelectedBuyerPersonaId(null);
    setSelectedMembers([]);
    setShowMultiBuyerWarning(false);
    onClose();
  };

  // Handle back from contact view
  const handleBack = () => {
    setSelectedBuyerPersonaId(null);
    setSearchQuery("");
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create Group</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {!selectedBuyerPersonaId && (
          <div className="flex border-b border-gray-200 px-6">
            <button
              onClick={() => {
                setActiveTab("external");
                setSearchQuery("");
              }}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "external"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              External Users
            </button>
            <button
              onClick={() => {
                setActiveTab("internal");
                setSearchQuery("");
              }}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "internal"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              Internal Users
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          {selectedBuyerPersonaId ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-gray-700">
                {selectedBuyerPersona?.displayName} Contacts
              </span>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder={
                  activeTab === "external" ? "Search buyers..." : "Search team members..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>

        {/* Multi-buyer Warning */}
        {showMultiBuyerWarning && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                Multiple buyers selected
              </p>
              <p className="text-xs text-amber-700 mt-1">
                You are adding contacts from multiple buyers. The group name will be
                generic.
              </p>
            </div>
            <button
              onClick={() => setShowMultiBuyerWarning(false)}
              className="text-amber-600 hover:text-amber-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === "external" ? (
            selectedBuyerPersonaId ? (
              // Contact List for selected buyer
              <div className="space-y-2">
                {buyerContacts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No contacts available for this buyer
                  </div>
                ) : (
                  buyerContacts.map((contact) => {
                    const isSelected = selectedMembers.some((m) => m.id === contact.id);
                    return (
                      <div
                        key={contact.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                          isSelected
                            ? "border-purple-600 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                          <p className="text-xs text-gray-600">{contact.role}</p>
                          <p className="text-xs text-gray-500 mt-1">{contact.phone}</p>
                        </div>
                        <button
                          onClick={() => handleContactToggle(contact)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                            isSelected
                              ? "bg-purple-600 text-white hover:bg-purple-700"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          Add Contact
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              // Buyer Persona List
              <div className="space-y-2">
                {filteredBuyerPersonas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No buyers found
                  </div>
                ) : (
                  filteredBuyerPersonas.map((buyerPersona) => {
                    const buyerId = getBuyerIdFromPersona(buyerPersona.id);
                    const contactCount = buyerId ? getContactsForBuyer(buyerId).length : 0;
                    
                    return (
                      <button
                        key={buyerPersona.id}
                        onClick={() => setSelectedBuyerPersonaId(buyerPersona.id)}
                        className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-purple-600 hover:bg-purple-50 transition-all text-left"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{buyerPersona.displayName}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {contactCount} contact{contactCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                      </button>
                    );
                  })
                )}
              </div>
            )
          ) : (
            // Internal Users List with dual buttons
            <div className="space-y-2">
              {filteredInternalPersonas.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No internal team members found
                </div>
              ) : (
                filteredInternalPersonas.map((persona) => {
                  const hasInternal = hasInternalMethod(persona.id, "internal");
                  const hasWhatsApp = hasInternalMethod(persona.id, "whatsapp");
                  const isSelected = hasInternal || hasWhatsApp;
                  
                  return (
                    <div
                      key={persona.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                        isSelected
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200"
                      )}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {persona.displayName}
                        </p>
                        <p className="text-xs text-gray-600">{persona.role}</p>
                      </div>
                      
                      {/* Dual Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleInternalPersonaAdd(persona, "internal")}
                          className={cn(
                            "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap",
                            hasInternal
                              ? "bg-purple-600 text-white hover:bg-purple-700"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Add Internally
                        </button>
                        <button
                          onClick={() => handleInternalPersonaAdd(persona, "whatsapp")}
                          className={cn(
                            "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap",
                            hasWhatsApp
                              ? "bg-purple-600 text-white hover:bg-purple-700"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedMembers.length} member{selectedMembers.length !== 1 ? "s" : ""}{" "}
            selected
          </div>
          <button
            onClick={handleCreateGroup}
            disabled={selectedMembers.length === 0}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-colors",
              selectedMembers.length > 0
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            Request Group Creation
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}