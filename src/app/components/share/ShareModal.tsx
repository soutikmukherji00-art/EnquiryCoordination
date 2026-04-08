/**
 * ShareModal — Unified single-surface share modal (v4 — searchable multi-select)
 *
 * Key changes from v3:
 *   - Group selection is a searchable dropdown with multi-select chips
 *     (replaces old checkbox list)
 *   - Internal/External groups shown as categorised sections inside dropdown
 *   - "Create New Enquiry" suppressed when sharing internal → external
 *   - Thread selection remains optional for internal → external
 *
 * Layout:
 *   Header     — message count + source context
 *   Section A  — Target groups (searchable dropdown with chips)
 *   Section B  — Thread list (conditional: single group + has threads or BDM non-int→ext)
 *   Section C  — Single concatenated message preview
 *   Footer     — Cancel + dynamic CTA
 */

import React, { useMemo, useCallback, useEffect, useRef, useState } from "react";
import {
  Lock,
  Globe,
  Hash,
  Plus,
  RotateCcw,
  AlertTriangle,
  FileText,
  Check,
  MessageSquare,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import type { GroupChannel } from "@/domain/message/group.types";
import type { Enquiry } from "@/domain/enquiry/enquiry.types";
import type {
  ShareDraft,
  ShareRouteMode,
  ShareValidationErrors,
} from "@/domain/message/share.types";
import { validateShareDraft, isShareValid, buildConcatenatedContent } from "@/domain/message/share.types";
import { getEligibleGroups, getEligibleThreads, getCrossTypeGroups, computeThreadPreselection } from "@/hooks/useShareDraft";
import { resolveBuyersForThreads, isExternalToInternalShare } from "@/domain/buyer/buyer-identification";
import { BuyerInfoBadge } from "./BuyerInfoBadge";
import {
  getConnectGroupSectionLabel,
} from "@/domain/message/group-display.utils";

// ── Props ────────────────────────────────────────────────────────────

export interface ShareModalProps {
  draft: ShareDraft;
  allGroupChannels: GroupChannel[];
  enquiries: Enquiry[];
  currentRole: string;
  currentPersonaId: string;
  personaMap: Map<string, any>;

  // Draft actions
  onClose: () => void;
  onToggleTargetGroup: (groupId: string) => void;
  onSetRouteMode: (mode: ShareRouteMode) => void;
  onSetTargetThread: (threadId: string | null) => void;
  onSetConcatenatedContent: (content: string) => void;
  onSetSellerRfq: (value: boolean) => void;
  onResetConcatenatedContent: () => void;

  // Submit
  onSubmit: () => void;

  // Telemetry
  onTrack?: (event: string, metadata?: Record<string, unknown>) => void;
}

// ── Component ────────────────────────────────────────────────────────

export const ShareModal = React.memo(function ShareModal(props: ShareModalProps) {
  const {
    draft,
    allGroupChannels,
    enquiries,
    currentRole,
    currentPersonaId,
    personaMap,
    onClose,
    onToggleTargetGroup,
    onSetRouteMode,
    onSetTargetThread,
    onSetConcatenatedContent,
    onSetSellerRfq,
    onResetConcatenatedContent,
    onSubmit,
    onTrack,
  } = props;

  // ── Derived data ───────────────────────────────────────────────────

  const sourceGroupId = draft.sourceContext.type === "group"
    ? draft.sourceContext.id
    : draft.sourceContext.groupId ?? null;

  // Get the source group type for cross-type filtering
  const sourceGroupType = useMemo(() => {
    if (draft.sourceContext.type !== "group" && draft.sourceContext.type !== "thread") {
      return null; // Non-group source — no cross-type filtering
    }
    const sourceGroup = allGroupChannels.find((g) => g.id === sourceGroupId);
    return sourceGroup?.type ?? null;
  }, [draft.sourceContext.type, sourceGroupId, allGroupChannels]);

  // Internal → External suppresses new-enquiry creation
  const isInternalToExternal = sourceGroupType === "custom";
  const isExternalToInternal = sourceGroupType === "buyer" || sourceGroupType === "seller";
  const canCreateEnquiry = currentRole === "BDM" && !isInternalToExternal;

  // Cross-type shares for BDM/CM MUST use a thread or create new enquiry
  // (direct "Share Message" to main chat is blocked)
  const isCrossType = sourceGroupType != null; // any group→group share is cross-type (filtering ensures opposite type)
  const mustUseThread = (currentRole === "BDM" || currentRole === "CM") && isCrossType;

  // Full source group object (for smart preselection counterparty matching)
  const sourceGroup = useMemo(() => {
    if (!sourceGroupId) return undefined;
    return allGroupChannels.find((g) => g.id === sourceGroupId);
  }, [sourceGroupId, allGroupChannels]);

  // Get eligible groups (role-filtered, exclude source)
  const eligibleGroupsRaw = useMemo(
    () => getEligibleGroups(allGroupChannels, currentRole, currentPersonaId, sourceGroupId),
    [allGroupChannels, currentRole, currentPersonaId, sourceGroupId]
  );

  // Apply cross-type filtering
  const eligibleGroups = useMemo(
    () => getCrossTypeGroups(eligibleGroupsRaw, sourceGroupType),
    [eligibleGroupsRaw, sourceGroupType]
  );

  const destinationGroupChannels = useMemo(() => {
    if (sourceGroupType === "custom") {
      // Internal source → show only external destination threads
      return allGroupChannels.filter((group) => group.type !== "custom");
    }

    if (sourceGroupType === "buyer" || sourceGroupType === "seller") {
      // External source → show only internal destination threads
      return allGroupChannels.filter((group) => group.type === "custom");
    }

    return allGroupChannels;
  }, [allGroupChannels, sourceGroupType]);

  // Single-group selection state
  const isSingleGroupSelected = draft.targetGroupIds.length === 1;
  const isMultiGroupSelected = draft.targetGroupIds.length > 1;

  const selectedGroupObj = useMemo(() => {
    if (!isSingleGroupSelected) return undefined;
    return allGroupChannels.find((g) => g.id === draft.targetGroupIds[0]);
  }, [allGroupChannels, draft.targetGroupIds, isSingleGroupSelected]);

  const eligibleThreads = useMemo(
    () => (isSingleGroupSelected ? getEligibleThreads(selectedGroupObj) : []),
    [selectedGroupObj, isSingleGroupSelected]
  );

  const destinationEntries = useMemo(() => {
    return destinationGroupChannels
      .flatMap((group) => (group.threads ?? []).map((thread) => {
        const enquiry = thread.enquiryId
          ? enquiries.find((e) => e.id === thread.enquiryId)
          : undefined;

        // Prefer the enquiry timestamp when available so newly created enquiries
        // surface immediately, even if the thread itself was created earlier.
        const lastActivityAt = enquiry?.lastActivity
          ? new Date(enquiry.lastActivity).getTime()
          : thread.lastReplyAt
            ? new Date(thread.lastReplyAt).getTime()
            : new Date(thread.createdAt).getTime();

        return {
          thread,
          group,
          enquiry,
          lastActivityAt,
        };
      }))
      .filter((entry) => Boolean(entry.thread))
      .sort((a, b) => b.lastActivityAt - a.lastActivityAt);
  }, [destinationGroupChannels, enquiries]);

  // Should thread section be shown?
  const showThreadSection = isSingleGroupSelected && (
    destinationEntries.length > 0 || canCreateEnquiry
  );

  // Cross-type thread/new-enquiry is required, not optional
  // When single group is selected and no thread or new-enquiry chosen → blocked
  // (relaxed when showThreadSection is false — no threads & can't create → allow main chat)
  const threadRequired = mustUseThread && showThreadSection && isSingleGroupSelected
    && !draft.targetThreadId && draft.routeMode !== "new-enquiry";
  // Multi-group shares always go to main chat (thread section is hidden).
  // No blocking — this is intentional; threads are only relevant for single-group.

  // ── Smart thread preselection (cross-type shares only) ─────────────
  // Fires when mustUseThread is active and a single target group is selected.
  // Uses the P1→P5 waterfall in computeThreadPreselection to auto-select
  // the best thread (or "New Enquiry") so the user never starts at bare "main chat".
  const preselectionTargetGroupId = isSingleGroupSelected ? draft.targetGroupIds[0] : null;
  useEffect(() => {
    if (!mustUseThread || !isSingleGroupSelected || !preselectionTargetGroupId) return;
    // Only run when thread hasn't been set yet (reducer resets to null on group change)
    if (draft.targetThreadId || draft.routeMode === "new-enquiry") return;

    const result = computeThreadPreselection(
      draft.sourceContext,
      sourceGroup,
      selectedGroupObj,
      eligibleThreads,
      enquiries,
      canCreateEnquiry,
    );

    if (result.reason === "no-options") return; // graceful fallback to main chat

    if (result.routeMode === "new-enquiry") {
      onSetRouteMode("new-enquiry");
    } else if (result.threadId) {
      onSetRouteMode("existing-thread");
      onSetTargetThread(result.threadId);
    }

    onTrack?.("share_thread_preselected", {
      reason: result.reason,
      threadId: result.threadId,
      routeMode: result.routeMode,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mustUseThread, preselectionTargetGroupId, eligibleThreads.length]);

  // Is the content edited from the original concatenation?
  const originalContent = useMemo(
    () => buildConcatenatedContent(draft.sourceMessages),
    [draft.sourceMessages]
  );
  const isContentEdited = draft.concatenatedContent !== originalContent;

  // ── Smart buyer identification (external→internal shares) ──────────
  // When sharing from an external group to an internal group, resolve buyer
  // info for each eligible thread so we can display it in Section B.
  const showBuyerInfo = isExternalToInternalShare(sourceGroupType) && showThreadSection;
  const showSellerRfqToggle = currentRole === "CM" && isExternalToInternal;

  const threadBuyerMap = useMemo(() => {
    if (!showBuyerInfo || eligibleThreads.length === 0) return new Map();
    return resolveBuyersForThreads(
      eligibleThreads,
      sourceGroup,
      selectedGroupObj,
      enquiries,
      personaMap,
    );
  }, [showBuyerInfo, eligibleThreads, sourceGroup, selectedGroupObj, enquiries, personaMap]);

  const handleSelectDestinationThread = useCallback(
    (entry: { thread: { id: string; groupId: string }; group: { id: string } }) => {
      const selectedTargetGroupId = draft.targetGroupIds[0];
      const shouldSwitchGroup = draft.targetGroupIds.length !== 1 || selectedTargetGroupId !== entry.group.id;

      if (shouldSwitchGroup) {
        [...draft.targetGroupIds].forEach((groupId) => onToggleTargetGroup(groupId));
        onToggleTargetGroup(entry.group.id);
      }

      onSetRouteMode("existing-thread");
      onSetTargetThread(entry.thread.id);
      onTrack?.("share_default_changed", {
        field: "thread",
        action: "select",
        value: entry.thread.id,
        groupId: entry.group.id,
      });
    },
    [draft.targetGroupIds, onSetRouteMode, onSetTargetThread, onToggleTargetGroup, onTrack]
  );

  // ── Group dropdown state ───────────────────────────────────────────

  const [groupSearch, setGroupSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Selected groups for chip display (preserving order of selection)
  const selectedGroups = useMemo(
    () => eligibleGroups.filter((g) => draft.targetGroupIds.includes(g.id)),
    [eligibleGroups, draft.targetGroupIds]
  );

  // Filtered groups by search query
  const filteredGroups = useMemo(() => {
    const q = groupSearch.toLowerCase().trim();
    if (!q) return eligibleGroups;
    return eligibleGroups.filter((g) => g.name.toLowerCase().includes(q));
  }, [eligibleGroups, groupSearch]);

  const filteredInternal = useMemo(
    () => filteredGroups.filter((g) => g.type === "custom"),
    [filteredGroups]
  );
  const filteredBuyer = useMemo(
    () => filteredGroups.filter((g) => g.type === "buyer"),
    [filteredGroups]
  );
  const filteredSeller = useMemo(
    () => filteredGroups.filter((g) => g.type === "seller"),
    [filteredGroups]
  );

  // Reset when modal opens
  useEffect(() => {
    if (draft.isOpen) {
      setGroupSearch("");
      setDropdownOpen(false);
    }
  }, [draft.isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // ── Validation ─────────────────────────────────────────────────────

  const validationErrors = useMemo(() => validateShareDraft(draft), [draft]);
  const canSubmit = isShareValid(validationErrors);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const scrollBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (draft.isOpen) {
      setHasAttemptedSubmit(false);
      setShakeKey(0);
    }
  }, [draft.isOpen]);

  const shownErrors: ShareValidationErrors = hasAttemptedSubmit
    ? validationErrors
    : {};

  const errorList = useMemo(() => {
    if (!hasAttemptedSubmit) return [];
    return Object.values(validationErrors).filter(Boolean) as string[];
  }, [hasAttemptedSubmit, validationErrors]);

  // Auto-scroll to error banner
  const prevErrorCountRef = useRef(0);
  useEffect(() => {
    if (errorList.length > 0 && prevErrorCountRef.current === 0 && scrollBodyRef.current) {
      scrollBodyRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    prevErrorCountRef.current = errorList.length;
  }, [errorList.length]);

  // ── CTA label ──────────────────────────────────────────────────────

  const ctaLabel = useMemo(() => {
    if (isMultiGroupSelected) {
      return `Share to ${draft.targetGroupIds.length} Groups`;
    }
    if (draft.routeMode === "new-enquiry") {
      return "Create New Enquiry";
    }
    if (draft.targetThreadId) {
      return "Share in Thread";
    }
    if (threadRequired) {
      return "Select Thread or New Enquiry";
    }
    return "Share Message";
  }, [draft.routeMode, isMultiGroupSelected, draft.targetThreadId, draft.targetGroupIds.length, threadRequired]);

  // ── Handlers ───────────────────────────────────────────────────────

  const handleToggleGroup = useCallback(
    (groupId: string) => {
      onToggleTargetGroup(groupId);
      onTrack?.("share_default_changed", { field: "group", action: "toggle", value: groupId });
    },
    [onToggleTargetGroup, onTrack]
  );

  const handleSelectThread = useCallback(
    (threadId: string) => {
      if (draft.targetThreadId === threadId) {
        onSetRouteMode("existing-thread");
        onSetTargetThread(null);
        onTrack?.("share_default_changed", { field: "thread", action: "deselect" });
      } else {
        onSetRouteMode("existing-thread");
        onSetTargetThread(threadId);
        onTrack?.("share_default_changed", { field: "thread", value: threadId });
      }
    },
    [onSetRouteMode, onSetTargetThread, onTrack, draft.targetThreadId]
  );

  const handleSelectNewEnquiry = useCallback(() => {
    onSetRouteMode("new-enquiry");
    onSetTargetThread(null);
    onTrack?.("share_mode_changed", { from: draft.routeMode, to: "new-enquiry" });
  }, [onSetRouteMode, onSetTargetThread, onTrack, draft.routeMode]);

  const handleCancel = useCallback(() => {
    onTrack?.("share_cancelled", { messageCount: draft.sourceMessages.length });
    onClose();
  }, [onClose, onTrack, draft.sourceMessages.length]);

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newVal = e.target.value;
      if (!isContentEdited && newVal !== originalContent) {
        onTrack?.("share_preview_edited", { messageCount: draft.sourceMessages.length });
      }
      onSetConcatenatedContent(newVal);
    },
    [onSetConcatenatedContent, onTrack, isContentEdited, originalContent, draft.sourceMessages.length]
  );

  const handleResetContent = useCallback(() => {
    onResetConcatenatedContent();
  }, [onResetConcatenatedContent]);

  const handleSellerRfqToggle = useCallback(
    (checked: boolean) => {
      onSetSellerRfq(checked);
      onTrack?.("share_default_changed", {
        field: "sellerRfq",
        value: checked,
      });
    },
    [onSetSellerRfq, onTrack]
  );

  const handleSubmit = useCallback(() => {
    if (!canSubmit) {
      setHasAttemptedSubmit(true);
      setShakeKey((k) => k + 1);
      onTrack?.("share_validation_failed", {
        errors: Object.keys(validationErrors).filter(
          (k) => !!(validationErrors as Record<string, string | undefined>)[k]
        ),
      });
      return;
    }
    onSubmit();
  }, [canSubmit, onSubmit, onTrack, validationErrors]);

  // ── Render helpers ─────────────────────────────────────────────────

  /** Render a single row inside the dropdown */
  const renderGroupOption = (g: typeof eligibleGroups[number]) => {
    const isSelected = draft.targetGroupIds.includes(g.id);
    const isInternal = g.category === "internal";
    const Icon = isInternal ? Lock : Globe;
    return (
      <button
        key={g.id}
        type="button"
        onClick={() => {
          handleToggleGroup(g.id);
          setGroupSearch("");
          searchInputRef.current?.focus();
        }}
        className={`w-full text-left px-3 py-2 transition-colors flex items-center gap-2.5 ${
          isSelected ? "bg-[#5249D2]/5" : "hover:bg-gray-50"
        }`}
      >
        <div
          className={`size-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
            isSelected ? "bg-[#5249D2] border-[#5249D2]" : "border-gray-300"
          }`}
        >
          {isSelected && <Check className="size-3 text-white" />}
        </div>
        <Icon
          className={`size-3.5 flex-shrink-0 ${
            isSelected
              ? isInternal
                ? "text-[#5249D2]"
                : "text-amber-500"
              : "text-gray-400"
          }`}
        />
        <span className={`text-sm ${isSelected ? "text-[#5249D2] font-medium" : "text-gray-700"}`}>
          {g.name}
        </span>
        {g.threadCount > 0 && (
          <span className="text-xs text-gray-400 ml-auto">
            {g.threadCount} thread{g.threadCount !== 1 ? "s" : ""}
          </span>
        )}
      </button>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────

  if (!draft.isOpen) return null;

  const isNewEnquiry = draft.routeMode === "new-enquiry" && isSingleGroupSelected;

  // Cross-type direction label
  return (
    <Dialog open={draft.isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 gap-0" aria-describedby={undefined}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 flex-shrink-0">
          <DialogTitle className="text-lg text-gray-900">
            {isNewEnquiry ? "Create New Enquiry" : "Share Messages"}
          </DialogTitle>
        </div>

        {/* ── Scrollable body ────────────────────────────────────── */}
        <div ref={scrollBodyRef} className="flex-1 overflow-y-auto min-h-0">
          {/* Error banner */}
          {errorList.length > 0 && (
            <div className="mx-6 mt-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertTriangle className="size-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-600 space-y-0.5">
                <p className="font-medium">Please fix the following:</p>
                {errorList.map((err, i) => (
                  <p key={i}>- {err}</p>
                ))}
              </div>
            </div>
          )}

          {/* ── NEW: Share to Parent Group Main Chat (thread sources only) ── */}
          {/* Feature disabled: Share to parent group main chat */}
          {/* 
          <div className="px-6 pt-5 pb-2">
            <button
              type="button"
              onClick={() => {
                const isParentSelected = draft.routeMode === "parent-main-chat";
                if (isParentSelected) {
                  // Deselect parent → go back to default state
                  onSetRouteMode("existing-thread");
                  // Clear target groups selection
                  draft.targetGroupIds.forEach(id => onToggleTargetGroup(id));
                } else {
                  // Select parent main chat
                  onSetRouteMode("parent-main-chat");
                  // Clear any selected groups and select parent
                  draft.targetGroupIds.forEach(id => onToggleTargetGroup(id));
                  if (!draft.targetGroupIds.includes(sourceGroup.id)) {
                    onToggleTargetGroup(sourceGroup.id);
                  }
                }
                onTrack?.("share_parent_main_chat_toggled", {
                  selected: !isParentSelected,
                  parentGroupId: sourceGroup.id,
                });
              }}
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                draft.routeMode === "parent-main-chat"
                  ? "border-[#5249D2] bg-[#5249D2]/5 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className={`size-9 rounded-full flex items-center justify-center transition-colors ${
                draft.routeMode === "parent-main-chat"
                  ? "bg-[#5249D2] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
                <MessageSquare className="size-4.5" />
              </div>
              <div className="flex-1 text-left">
                <div className={`text-sm font-medium ${
                  draft.routeMode === "parent-main-chat" ? "text-[#5249D2]" : "text-gray-900"
                }`}>
                  Share to {sourceGroup.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Post to main chat (visible to all group members)
                </div>
              </div>
              {draft.routeMode === "parent-main-chat" && (
                <div className="size-5 rounded-full bg-[#5249D2] flex items-center justify-center">
                  <Check className="size-3 text-white" />
                </div>
              )}
            </button>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </div>
          */}

          {/* ── Section A: Target Groups (searchable dropdown + chips) ── */}
          <div className="px-6 pt-5 pb-4">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Target Group{eligibleGroups.length > 1 ? "s" : ""}
            </label>

            <div ref={dropdownRef} className="relative">
              {/* ── Trigger: chips + search input ── */}
              <div
                className={`rounded-lg border transition-colors cursor-text ${
                  dropdownOpen
                    ? "border-[#5249D2] ring-1 ring-[#5249D2]/20"
                    : shownErrors.targetGroupId
                      ? "border-red-300 ring-1 ring-red-200"
                      : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => {
                  setDropdownOpen(true);
                  searchInputRef.current?.focus();
                }}
              >
                <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-2 min-h-[40px]">
                  {/* Selected chips */}
                  {selectedGroups.map((g) => {
                    const isInternal = g.category === "internal";
                    const Icon = isInternal ? Lock : Globe;
                    return (
                      <span
                        key={g.id}
                        className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-[#5249D2]/10 text-[#5249D2] text-xs"
                      >
                        <Icon className={`size-3 flex-shrink-0 ${isInternal ? "text-[#5249D2]" : "text-amber-500"}`} />
                        <span className="max-w-[140px] truncate">{g.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleGroup(g.id);
                          }}
                          className="ml-0.5 p-0.5 rounded hover:bg-[#5249D2]/20 transition-colors"
                          aria-label={`Remove ${g.name}`}
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    );
                  })}

                  {/* Search input */}
                  <div className="flex-1 min-w-[80px] flex items-center gap-1.5">
                    {selectedGroups.length === 0 && (
                      <Search className="size-3.5 text-gray-400 flex-shrink-0" />
                    )}
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={groupSearch}
                      onChange={(e) => {
                        setGroupSearch(e.target.value);
                        if (!dropdownOpen) setDropdownOpen(true);
                      }}
                      onFocus={() => setDropdownOpen(true)}
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                      placeholder={
                        selectedGroups.length > 0
                          ? ""
                          : "Search groups..."
                      }
                    />
                  </div>

                  {/* Chevron */}
                  <ChevronDown
                    className={`size-4 text-gray-400 flex-shrink-0 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* ── Dropdown panel ── */}
              {dropdownOpen && (
                <div className="absolute left-0 right-0 z-30 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[220px] overflow-y-auto">
                  {filteredGroups.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-gray-400 text-center">
                      {groupSearch ? "No matching groups" : "No eligible groups"}
                    </div>
                  ) : (
                    <>
                      {/* Internal section */}
                      {filteredInternal.length > 0 && (
                        <>
                          <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                              <Lock className="size-3" /> {getConnectGroupSectionLabel("birla-pivot")}
                            </span>
                          </div>
                          {filteredInternal.map(renderGroupOption)}
                        </>
                      )}

                      {/* Buyer section */}
                      {filteredBuyer.length > 0 && (
                        <>
                          <div className={`px-3 py-1.5 bg-gray-50 border-b border-gray-100 sticky top-0 z-10 ${filteredInternal.length > 0 ? "border-t" : ""}`}>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                              <Globe className="size-3" /> {getConnectGroupSectionLabel("buyer")}
                            </span>
                          </div>
                          {filteredBuyer.map(renderGroupOption)}
                        </>
                      )}

                      {/* Seller section */}
                      {filteredSeller.length > 0 && (
                        <>
                          <div className={`px-3 py-1.5 bg-gray-50 border-b border-gray-100 sticky top-0 z-10 ${(filteredInternal.length > 0 || filteredBuyer.length > 0) ? "border-t" : ""}`}>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                              <Globe className="size-3" /> {getConnectGroupSectionLabel("seller")}
                            </span>
                          </div>
                          {filteredSeller.map(renderGroupOption)}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {shownErrors.targetGroupId && (
              <p className="text-xs text-red-500 mt-1">{shownErrors.targetGroupId}</p>
            )}
          </div>

          {/* ── Section B: Thread list (conditional) ───────────────── */}
          {showThreadSection && (
            <div className="px-6 pb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1.5">
                <MessageSquare className="size-3.5" />
                Destination
                {!mustUseThread && !draft.targetThreadId && !isNewEnquiry && (
                  <span className="text-xs text-gray-400 ml-1">(optional — select a thread or share to main chat)</span>
                )}
              </label>

              <div className="rounded-lg border border-gray-200">
                {/* Existing threads */}
                {destinationEntries.length > 0 && (
                  <div className="max-h-[180px] overflow-y-auto divide-y divide-gray-100">
                    {destinationEntries.map(({ thread, group, enquiry }) => {
                      const isSelected = !isNewEnquiry && thread.id === draft.targetThreadId;
                      const displayLabel = thread.enquiryId || `Thread #${thread.id.slice(-6)}`;

                      const buyerName = enquiry?.buyerName || threadBuyerMap.get(thread.id)?.companyName;

                      // Format metadata
                      const category = enquiry?.categories?.[0] || (enquiry as any)?.productCategory;
                      const price = enquiry?.estimatedValue
                        ? `₹${(enquiry.estimatedValue / 1000).toFixed(0)}K`
                        : null;
                      const recency = enquiry?.lastActivity
                        ? new Date(enquiry.lastActivity).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                        : null;
                      const status = enquiry?.state;

                      return (
                        <button
                          key={thread.id}
                          type="button"
                          onClick={() => {
                            // When mustUseThread: clicking the already-selected thread is a no-op (can't deselect)
                            if (mustUseThread && isSelected) return;
                            handleSelectDestinationThread({ thread, group });
                          }}
                          className={`w-full text-left px-3 py-2.5 transition-colors ${
                            isSelected
                              ? "bg-[#5249D2]/5"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex flex-col gap-1">
                            {/* P0: Enquiry ID · Buyer Name */}
                            <div className="flex items-center gap-2">
                              <Hash className={`size-3.5 flex-shrink-0 ${isSelected ? "text-[#5249D2]" : "text-gray-400"}`} />
                              <span className={`text-sm font-mono ${isSelected ? "text-[#5249D2] font-medium" : "text-gray-700"}`}>
                                {displayLabel}
                              </span>
                              {buyerName && (
                                <>
                                  <span className="text-gray-400">·</span>
                                  <span className={`text-sm ${isSelected ? "text-[#5249D2] font-medium" : "text-gray-700"}`}>
                                    {buyerName}
                                  </span>
                                </>
                              )}
                              {/* P1: Status (before selection dot) */}
                              {status && (
                                <span className={`ml-auto text-xs ${
                                  status === "Converted to Order" ? "text-green-600" : "text-gray-500"
                                }`}>
                                  {status}
                                </span>
                              )}
                              {isSelected && (
                                <div className="size-2 rounded-full bg-[#5249D2] flex-shrink-0" />
                              )}
                            </div>
                            
                            {/* P2: Category · Price · Recency */}
                            {(category || price || recency) && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-6">
                                {category && <span>{category}</span>}
                                {category && (price || recency) && <span>·</span>}
                                {price && <span>{price}</span>}
                                {price && recency && <span>·</span>}
                                {recency && <span>{recency}</span>}
                                {group.name && <span>·</span>}
                                <span>{group.name}</span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* New Enquiry row — BDM only, suppressed for internal→external */}
                {canCreateEnquiry && (
                  <>
                    {eligibleThreads.length > 0 && (
                      <div className="border-t border-gray-200" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        // When mustUseThread and already on new-enquiry: can't deselect (no-op)
                        // When switching from thread → new-enquiry: allowed (swapping, not deselecting)
                        if (mustUseThread && isNewEnquiry) return;
                        handleSelectNewEnquiry();
                      }}
                      className={`w-full text-left px-3 py-2.5 transition-colors flex items-center gap-2 ${
                        isNewEnquiry
                          ? "bg-[#5249D2]/5"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className={`size-5 rounded flex items-center justify-center ${
                        isNewEnquiry
                          ? "bg-[#5249D2] text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        <Plus className="size-3" />
                      </div>
                      <span className={`text-sm ${isNewEnquiry ? "text-[#5249D2] font-medium" : "text-gray-700"}`}>
                        New Enquiry
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Section C: Message preview ─────────────────────────── */}
          <div className="px-6 pb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Message{draft.sourceMessages.length > 1 ? ` (${draft.sourceMessages.length} combined)` : ""}
              </label>
              {isContentEdited && (
                <button
                  type="button"
                  onClick={handleResetContent}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  <RotateCcw className="size-3" />
                  Reset
                </button>
              )}
            </div>
            {showSellerRfqToggle && (
              <div className="mb-3 flex items-center gap-2">
                <Checkbox
                  id="seller-rfq"
                  checked={!!draft.sellerRfq}
                  onCheckedChange={(checked) => handleSellerRfqToggle(checked === true)}
                  className="border-amber-300 data-[state=checked]:bg-amber-600 data-[state=checked]:text-white"
                />
                <Label htmlFor="seller-rfq" className="text-sm font-medium text-gray-800">
                  Mark as Seller RFQ
                </Label>
              </div>
            )}
            <div className={`relative overflow-hidden rounded-lg border transition-colors ${
              isContentEdited
                ? "border-amber-300 bg-amber-50/30"
                : shownErrors.concatenatedContent
                  ? "border-red-300 ring-1 ring-red-200"
                  : "border-gray-200 bg-gray-50"
            }`}>
              {draft.sellerRfq && (
                <div className="absolute left-3 top-3 z-10">
                  <Badge
                    variant="outline"
                    className="border-amber-300 bg-amber-50 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700"
                  >
                    Seller RFQ
                  </Badge>
                </div>
              )}
              <Textarea
                value={draft.concatenatedContent}
                onChange={handleContentChange}
                className={`min-h-[80px] text-sm resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 ${draft.sellerRfq ? "pt-10" : ""}`}
                rows={Math.min(8, Math.max(3, (draft.concatenatedContent?.split("\n").length ?? 1) + 1))}
              />
              {isContentEdited && (
                <div className="px-3 pb-2 flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-300">
                    edited
                  </Badge>
                </div>
              )}
            </div>
            {shownErrors.concatenatedContent && (
              <p className="text-xs text-red-500 mt-1">{shownErrors.concatenatedContent}</p>
            )}
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3 flex-shrink-0 bg-gray-50/50">
          <style>{`
            @keyframes share-btn-shake {
              0%, 100% { transform: translateX(0); }
              10%, 50%, 90% { transform: translateX(-3px); }
              30%, 70% { transform: translateX(3px); }
            }
          `}</style>
          <Button variant="outline" onClick={handleCancel} className="px-4">
            Cancel
          </Button>
          <Button
            key={`submit-${shakeKey}`}
            onClick={handleSubmit}
            disabled={draft.targetGroupIds.length === 0 || threadRequired}
            className={`px-5 ${
              !canSubmit && hasAttemptedSubmit
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#5249D2] hover:bg-[#4038b0] text-white"
            }`}
            style={
              shakeKey > 0 && !canSubmit
                ? { animation: "share-btn-shake 0.4s ease-in-out" }
                : undefined
            }
          >
            {isNewEnquiry && <FileText className="size-4 mr-1.5" />}
            {ctaLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
