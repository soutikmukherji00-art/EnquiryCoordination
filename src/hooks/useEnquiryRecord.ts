import { useEnquiryContext } from "@/infrastructure/state/EnquiryContext";
import * as selectors from "@/domain/enquiry/enquiry.selectors";
import { useCallback, useMemo } from "react";

/**
 * Canonical rich record for an enquiry (same shape CM / structured UI uses).
 */
export function useEnquiryRecord(enquiryId: string | null | undefined) {
  const { state } = useEnquiryContext();

  const record = useMemo(() => {
    if (!enquiryId) return undefined;
    return selectors.selectEnquiryRecord(state, enquiryId);
  }, [state, enquiryId]);

  const selectRecord = useCallback(
    (id: string) => selectors.selectEnquiryRecord(state, id),
    [state],
  );

  return { record, selectRecord };
}
