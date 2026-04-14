/**
 * Persistence port for EnquiryRecord (structured enquiry payload).
 *
 * Today: the app is source-of-truth via `ENQUIRY_RECORD_CREATED` and `ENQUIRY_RECORD_UPDATED`
 * domain events; implementations such as MemoryStore apply them through `enquiryReducer`.
 *
 * Future (e.g. Indra): implement sync by subscribing to the same event stream, or by
 * mapping HTTP payloads to `EnquiryRecord` and dispatching equivalent events.
 */

import type { EnquiryRecord } from "@/domain/enquiry/enquiry.record";

export type EnquiryRecordChangeKind = "created" | "updated";

export interface EnquiryRecordPersistencePort {
  /**
   * Notify external system after a record snapshot changed locally.
   * Default/no-op in local-only mode; Indra can POST or enqueue here.
   */
  notifyRecordChanged(
    enquiryId: string,
    record: EnquiryRecord,
    kind: EnquiryRecordChangeKind,
  ): Promise<void>;
}
