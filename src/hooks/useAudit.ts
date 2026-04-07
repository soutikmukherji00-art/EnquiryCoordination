/**
 * Hook: Audit Trail
 * 
 * Provides access to audit trail for an enquiry.
 */

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "./useAppStore";
import { AuditEntry } from "@/domain/audit/audit.types";

const __DEV_LOG__ = false;
const devError = __DEV_LOG__ ? (label: string, data?: any) => console.error(label, data) : (() => {}) as (label: string, data?: any) => void;

export const useAudit = (enquiryId: string) => {
  const { dataStore, realtimeService } = useAppStore();
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load audit entries
  const loadAudit = useCallback(async () => {
    try {
      const data = await dataStore.getAuditEntries(enquiryId);
      setAuditEntries(data);
    } catch (error) {
      devError("Failed to load audit entries:", error);
    } finally {
      setLoading(false);
    }
  }, [dataStore, enquiryId]);

  // Initial load
  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  // Subscribe to realtime updates
  useEffect(() => {
    const unsubscribe = realtimeService.subscribe(enquiryId, () => {
      loadAudit(); // Reload audit when any event occurs
    });

    return unsubscribe;
  }, [realtimeService, enquiryId, loadAudit]);

  return {
    auditEntries,
    loading,
    reload: loadAudit,
  };
};