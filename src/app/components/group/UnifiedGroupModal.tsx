/**
 * Unified Group Creation Modal
 * 
 * Reusable modal for creating both buyer and seller groups
 * Supports multi-step flow with customizable steps
 */

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

export interface UnifiedGroupModalProps<TExternal, TInternal> {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: GroupCreationResult) => void;
  
  // Configuration
  title: string;
  groupType: "buyer" | "seller";
  
  // External contacts (buyers or sellers)
  externalContacts: TExternal[];
  renderExternalContact: (contact: TExternal, isSelected: boolean, onToggle: () => void) => React.ReactNode;
  getExternalContactId: (contact: TExternal) => string;
  getExternalContactName: (contact: TExternal) => string;
  getExternalContactPhone?: (contact: TExternal) => string | undefined;
  
  // Internal members
  internalMembers: TInternal[];
  renderInternalMember: (member: TInternal, isSelected: boolean, onToggle: () => void) => React.ReactNode;
  getInternalMemberId: (member: TInternal) => string;
  getInternalMemberName: (member: TInternal) => string;
  
  // Step configuration
  steps: GroupCreationStep[];
  
  // Auto-populated group name
  generateGroupName?: (selectedExternal: TExternal[], selectedInternal: TInternal[]) => string;
  
  // Current user (auto-added for sellers, optional for buyers)
  currentUserId?: string;
  autoAddCurrentUser?: boolean;
}

export interface GroupCreationStep {
  id: string;
  title: string;
  description: string;
  type: "external" | "internal" | "name" | "custom";
  component?: React.ComponentType<any>;
  required?: boolean;
}

export interface GroupCreationResult {
  externalIds: string[];
  internalIds: string[];
  groupName: string;
  inviteMethod: "whatsapp" | "email" | "both";
}

export function UnifiedGroupModal<TExternal = any, TInternal = any>({
  isOpen,
  onClose,
  onComplete,
  title,
  groupType,
  externalContacts,
  renderExternalContact,
  getExternalContactId,
  getExternalContactName,
  getExternalContactPhone,
  internalMembers,
  renderInternalMember,
  getInternalMemberId,
  getInternalMemberName,
  steps,
  generateGroupName,
  currentUserId,
  autoAddCurrentUser = false,
}: UnifiedGroupModalProps<TExternal, TInternal>) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedExternalIds, setSelectedExternalIds] = useState<string[]>([]);
  const [selectedInternalIds, setSelectedInternalIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteMethod, setInviteMethod] = useState<"whatsapp" | "email" | "both">("whatsapp");

  const currentStep = steps[currentStepIndex];

  // Get selected contacts for display (memoized to prevent CLS)
  const selectedExternalContacts = useMemo(() => 
    externalContacts.filter(c => selectedExternalIds.includes(getExternalContactId(c))),
    [externalContacts, selectedExternalIds, getExternalContactId]
  );

  const selectedInternalMembers = useMemo(() =>
    internalMembers.filter(m => selectedInternalIds.includes(getInternalMemberId(m))),
    [internalMembers, selectedInternalIds, getInternalMemberId]
  );

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setSelectedExternalIds([]);
      setSelectedInternalIds(autoAddCurrentUser && currentUserId ? [currentUserId] : []);
      setGroupName("");
      setSearchQuery("");
      setInviteMethod("whatsapp");
    }
  }, [isOpen, autoAddCurrentUser, currentUserId]);

  // Auto-populate group name when moving to name step
  useEffect(() => {
    if (currentStep?.type === "name" && !groupName && generateGroupName) {
      const selectedExternal = externalContacts.filter(c => 
        selectedExternalIds.includes(getExternalContactId(c))
      );
      const selectedInternal = internalMembers.filter(m => 
        selectedInternalIds.includes(getInternalMemberId(m))
      );
      const autoName = generateGroupName(selectedExternal, selectedInternal);
      if (autoName) {
        setGroupName(autoName);
      }
    }
  }, [currentStep, groupName, generateGroupName, externalContacts, internalMembers, selectedExternalIds, selectedInternalIds, getExternalContactId, getInternalMemberId]);

  // Filter contacts based on search
  const filteredExternalContacts = useMemo(() => {
    if (!searchQuery.trim()) return externalContacts;
    const query = searchQuery.toLowerCase();
    return externalContacts.filter(c => 
      getExternalContactName(c).toLowerCase().includes(query)
    );
  }, [externalContacts, searchQuery, getExternalContactName]);

  const filteredInternalMembers = useMemo(() => {
    if (!searchQuery.trim()) return internalMembers;
    const query = searchQuery.toLowerCase();
    return internalMembers.filter(m => 
      getInternalMemberName(m).toLowerCase().includes(query)
    );
  }, [internalMembers, searchQuery, getInternalMemberName]);

  const canProceed = useMemo(() => {
    if (currentStep.type === "external") {
      return selectedExternalIds.length > 0;
    }
    if (currentStep.type === "internal") {
      return !currentStep.required || selectedInternalIds.length > 0;
    }
    if (currentStep.type === "name") {
      return groupName.trim().length > 0;
    }
    return true;
  }, [currentStep, selectedExternalIds, selectedInternalIds, groupName]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setSearchQuery(""); // Clear search when moving to next step
    } else {
      // Complete
      onComplete({
        externalIds: selectedExternalIds,
        internalIds: selectedInternalIds,
        groupName: groupName.trim(),
        inviteMethod,
      });
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setSearchQuery("");
    }
  };

  const toggleExternal = (id: string) => {
    setSelectedExternalIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleInternal = (id: string) => {
    setSelectedInternalIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{currentStep.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-6 py-3 border-b bg-gray-50 shrink-0">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-colors",
                  index <= currentStepIndex ? "bg-blue-600" : "bg-gray-200"
                )} 
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {currentStep.type === "external" && (
            <div className="p-6 space-y-4">
              <Input
                type="text"
                placeholder={`Search ${groupType}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredExternalContacts.map((contact) => {
                  const id = getExternalContactId(contact);
                  const isSelected = selectedExternalIds.includes(id);
                  return (
                    <div key={id}>
                      {renderExternalContact(contact, isSelected, () => toggleExternal(id))}
                    </div>
                  );
                })}
                {filteredExternalContacts.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No {groupType}s found
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep.type === "internal" && (
            <div className="p-6 space-y-4">
              <Input
                type="text"
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredInternalMembers.map((member) => {
                  const id = getInternalMemberId(member);
                  const isSelected = selectedInternalIds.includes(id);
                  const isCurrentUser = id === currentUserId;
                  return (
                    <div key={id}>
                      {renderInternalMember(member, isSelected, () => !isCurrentUser && toggleInternal(id))}
                    </div>
                  );
                })}
                {filteredInternalMembers.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No team members found
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep.type === "name" && (
            <div className="p-6 space-y-4">
              {/* Selected Members List - Always visible, not collapsible */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Members
                </label>
                {/* Reserve minimum height to prevent CLS */}
                <div className="border rounded-lg divide-y divide-gray-100 min-h-[100px] max-h-[200px] overflow-y-auto">
                  {selectedExternalContacts.length > 0 && (
                    <div className="p-3">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        {groupType === "buyer" ? "Buyer Contacts" : "Seller Contacts"} ({selectedExternalContacts.length})
                      </p>
                      <div className="space-y-1.5">
                        {selectedExternalContacts.map((contact) => (
                          <div key={getExternalContactId(contact)} className="flex items-center gap-2 text-sm">
                            <div className="size-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
                              {getExternalContactName(contact).substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-gray-700">{getExternalContactName(contact)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedInternalMembers.length > 0 && (
                    <div className="p-3">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Team Members ({selectedInternalMembers.length})
                      </p>
                      <div className="space-y-1.5">
                        {selectedInternalMembers.map((member) => (
                          <div key={getInternalMemberId(member)} className="flex items-center gap-2 text-sm">
                            <div className="size-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
                              {getInternalMemberName(member).substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-gray-700">{getInternalMemberName(member)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedExternalContacts.length === 0 && selectedInternalMembers.length === 0 && (
                    <div className="p-8 text-center text-sm text-gray-400">
                      No members selected
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invitation Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="inviteMethod"
                      value="whatsapp"
                      checked={inviteMethod === "whatsapp"}
                      onChange={(e) => setInviteMethod(e.target.value as any)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">WhatsApp</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="inviteMethod"
                      value="email"
                      checked={inviteMethod === "email"}
                      onChange={(e) => setInviteMethod(e.target.value as any)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="inviteMethod"
                      value="both"
                      checked={inviteMethod === "both"}
                      onChange={(e) => setInviteMethod(e.target.value as any)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Both WhatsApp & Email</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep.type === "custom" && currentStep.component && (
            <div className="p-6">
              <currentStep.component />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t shrink-0 bg-gray-50">
          <Button
            variant="outline"
            onClick={currentStepIndex === 0 ? onClose : handleBack}
          >
            {currentStepIndex === 0 ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedExternalIds.length} {groupType}(s), {selectedInternalIds.length} team member(s)
            </span>
            <Button
              onClick={handleNext}
              disabled={!canProceed}
            >
              {currentStepIndex === steps.length - 1 ? (
                "Create Group"
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}