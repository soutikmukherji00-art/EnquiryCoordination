/**
 * Seller Group Creation Modal
 * 
 * 3-Step Flow:
 * 1. Select Seller
 * 2. Select Internal Members (CMs, BDMs, CX)
 * 3. Name the Group
 */

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { SELLERS, Seller } from "@/domain/seller/seller.types";
import { PERSONAS } from "@/domain/persona/persona.data";

interface SellerGroupCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sellerId: string, sellerName: string, groupName: string, memberPersonaIds: string[]) => void;
  currentCMPersonaId: string; // The CM creating the group (auto-added)
}

type Step = "seller" | "members" | "name";

export function SellerGroupCreationModal({
  isOpen,
  onClose,
  onConfirm,
  currentCMPersonaId,
}: SellerGroupCreationModalProps) {
  const [step, setStep] = useState<Step>("seller");
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setStep("seller");
      setSelectedSeller(null);
      setSelectedMemberIds([]);
      setGroupName("");
    }
  }, [isOpen]);

  // Get all internal users (CMs, BDMs, CX) except the current CM
  const internalUsers = useMemo(() => {
    return PERSONAS.filter(
      p => 
        !p.isExternal && 
        p.id !== currentCMPersonaId && // Don't show the creator (they're auto-added)
        ["CM", "BDM", "CX"].includes(p.role)
    );
  }, [currentCMPersonaId]);

  const handleSellerNext = () => {
    if (selectedSeller) {
      setStep("members");
    }
  };

  const handleMembersNext = () => {
    // Auto-populate group name based on seller
    if (selectedSeller && !groupName) {
      setGroupName(`${selectedSeller.name} - Discussion`);
    }
    setStep("name");
  };

  const handleCreate = () => {
    if (selectedSeller && groupName.trim()) {
      // Include the current CM as a member (auto-added)
      const allMemberIds = [currentCMPersonaId, ...selectedMemberIds];
      onConfirm(selectedSeller.id, selectedSeller.name, groupName.trim(), allMemberIds);
      onClose();
    }
  };

  const toggleMember = (personaId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(personaId)
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
    );
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-lg font-semibold">Create Seller Group</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {step === "seller" && "Select seller to collaborate with"}
              {step === "members" && "Add team members to the group"}
              {step === "name" && "Name your seller group"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Step 1: Select Seller */}
          {step === "seller" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Seller
              </label>
              <div className="space-y-2">
                {SELLERS.map(seller => (
                  <button
                    key={seller.id}
                    onClick={() => setSelectedSeller(seller)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      selectedSeller?.id === seller.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{seller.name}</div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {seller.isActive ? (
                            <span className="text-green-600">● Active</span>
                          ) : (
                            <span className="text-gray-400">● Inactive</span>
                          )}
                          {seller.avgResponseTimeMinutes && (
                            <span className="ml-2">
                              Avg response: {seller.avgResponseTimeMinutes}m
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedSeller?.id === seller.id && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Members */}
          {step === "members" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Internal Members (Optional)
              </label>
              <p className="text-sm text-gray-500 mb-3">
                You'll be added automatically as the group creator
              </p>
              <div className="space-y-2">
                {internalUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No other internal users available</p>
                    <p className="text-sm mt-1">You can add members later</p>
                  </div>
                ) : (
                  internalUsers.map(user => (
                    <label
                      key={user.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedMemberIds.includes(user.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.includes(user.id)}
                        onChange={() => toggleMember(user.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{user.displayName}</div>
                        <div className="text-sm text-gray-500">{user.role}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 3: Name the Group */}
          {step === "name" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={`e.g., ${selectedSeller?.name} - Q1 Pricing`}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                This name will be visible to all group members
              </p>
              
              {/* Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Group Summary:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Seller: <span className="font-medium">{selectedSeller?.name}</span></li>
                  <li>• Members: <span className="font-medium">{selectedMemberIds.length + 1} internal user(s)</span></li>
                  <li>• Status: <span className="font-medium text-green-600">Auto-approved</span></li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t shrink-0">
          {step !== "seller" && (
            <button
              onClick={() => {
                if (step === "members") setStep("seller");
                else if (step === "name") setStep("members");
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="size-4" />
              Back
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {step === "name" ? (
            <button
              onClick={handleCreate}
              disabled={!selectedSeller || !groupName.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create Group
            </button>
          ) : (
            <button
              onClick={step === "seller" ? handleSellerNext : handleMembersNext}
              disabled={step === "seller" && !selectedSeller}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
