import { describe, expect, it } from "vitest";
import { enquiryReducer, initialEnquiryState } from "@/domain/enquiry/enquiry.reducer";
import {
  createEnquiryCreatedEvent,
  createMemberAddedEvent,
  createPrimaryCMAssignedEvent,
} from "@/domain/enquiry/enquiry.events";
import {
  canConvertToOrder,
  canPerformTransition,
  getStateLabel,
} from "@/domain/enquiry/enquiry.state-machine";
import {
  collectBuyerConfirmationExcerpts,
  collectWinSignalEvidence,
  enquiryHasBuyerConfirmation,
  enquiryHasPOTaggedAttachment,
  enquiryHasWinSignals,
  getApprovalTargets,
} from "@/domain/enquiry/enquiry.approval";
import { initialMessageState } from "@/domain/message/message.reducer";

describe("enquiry approval flow helpers", () => {
  it("allows BDM mark-as-won from CM Responded and exposes pending response conversion metadata", () => {
    expect(
      canPerformTransition({
        enquiryState: "CM Responded",
        userRole: "BDM",
        event: "MARK_AS_WON",
      })
    ).toBe(true);

    expect(
      canPerformTransition({
        enquiryState: "CM Responded",
        userRole: "CM",
        event: "MARK_AS_WON",
      })
    ).toBe(false);

    expect(canConvertToOrder("RM Approved")).toBe(true);
    expect(getStateLabel("RM Approved")).toBe("RM Approved");
  });

  it("detects PO-tagged attachments across enquiry-linked group threads", () => {
    const messageState = {
      ...initialMessageState,
      groupChannels: [
        {
          id: "group_1",
          name: "Internal Group",
          type: "custom" as const,
          status: "active" as const,
          memberIds: [],
          memberPersonaIds: [],
          messages: [],
          createdBy: "p_bdm_1",
          createdAt: new Date(),
          enquiryId: "ENQ-1",
          threads: [
            {
              id: "thread_1",
              groupId: "group_1",
              rootMessageId: "msg-root",
              enquiryId: "ENQ-1",
              messages: [
                {
                  id: "msg-po",
                  type: "user" as const,
                  content: "Attached PO",
                  timestamp: new Date(),
                  attachment: {
                    name: "po.pdf",
                    type: "application/pdf",
                    markAsPO: true,
                  },
                },
              ],
              replyCount: 1,
              participants: [],
              createdBy: "p_bdm_1",
              createdAt: new Date(),
            },
          ],
        },
      ],
    };

    expect(enquiryHasPOTaggedAttachment(messageState, "ENQ-1")).toBe(true);
    expect(enquiryHasPOTaggedAttachment(messageState, "ENQ-2")).toBe(false);
  });

  it("detects PO-tagged attachments in threads of UNTAGGED groups", () => {
    const messageState = {
      ...initialMessageState,
      groupChannels: [
        {
          id: "group_untagged",
          name: "General Group",
          type: "custom" as const,
          status: "active" as const,
          memberIds: [],
          memberPersonaIds: [],
          messages: [],
          createdBy: "p_bdm_1",
          createdAt: new Date(),
          enquiryId: undefined, // Group is NOT tagged
          threads: [
            {
              id: "thread_tagged",
              groupId: "group_untagged",
              rootMessageId: "msg-root",
              enquiryId: "ENQ-1", // Thread IS tagged
              messages: [
                {
                  id: "msg-po",
                  type: "user" as const,
                  sender: "BDM",
                  content: "Attached PO",
                  timestamp: new Date(),
                  attachment: {
                    name: "po.pdf",
                    type: "application/pdf",
                    url: "blob:...",
                    markAsPO: true, // PO is here
                  },
                },
              ],
              replyCount: 1,
              participants: [],
              createdBy: "p_bdm_1",
              createdAt: new Date(),
            },
          ],
        },
      ],
    };

    expect(enquiryHasPOTaggedAttachment(messageState, "ENQ-1")).toBe(true);
  });

  it("detects buyer confirmation flags and win-signal union", () => {
    const messageState = {
      ...initialMessageState,
      groupChannels: [
        {
          id: "group_1",
          name: "Internal Group",
          type: "custom" as const,
          status: "active" as const,
          memberIds: [],
          memberPersonaIds: [],
          messages: [],
          createdBy: "p_bdm_1",
          createdAt: new Date(),
          enquiryId: "ENQ-BC",
          threads: [
            {
              id: "thread_1",
              groupId: "group_1",
              rootMessageId: "msg-root",
              enquiryId: "ENQ-BC",
              messages: [
                {
                  id: "msg-bc",
                  type: "user" as const,
                  content: "Please proceed with the order.",
                  timestamp: new Date(),
                  markAsBuyerConfirmation: true,
                },
              ],
              replyCount: 1,
              participants: [],
              createdBy: "p_bdm_1",
              createdAt: new Date(),
            },
          ],
        },
      ],
    };

    expect(enquiryHasBuyerConfirmation(messageState, "ENQ-BC")).toBe(true);
    expect(enquiryHasWinSignals(messageState, "ENQ-BC")).toBe(true);
    expect(collectBuyerConfirmationExcerpts(messageState, "ENQ-BC")).toEqual([
      "Please proceed with the order.",
    ]);
  });

  it("projects PO docs and buyer confirmations for mark-as-won evidence", () => {
    const now = new Date();
    const messageState = {
      ...initialMessageState,
      messages: {
        "ENQ-EVIDENCE": {
          internal: [
            {
              id: "msg-po",
              type: "user" as const,
              content: "PO attached in this message",
              timestamp: now,
              attachment: {
                name: "buyer-po.pdf",
                type: "application/pdf",
                url: "blob:po",
                markAsPO: true,
              },
            },
            {
              id: "msg-confirm",
              type: "user" as const,
              content: "Please proceed and confirm order.",
              timestamp: now,
              markAsBuyerConfirmation: true,
            },
          ],
        },
      },
    };

    const evidence = collectWinSignalEvidence(messageState, "ENQ-EVIDENCE");
    expect(evidence.poDocuments).toEqual([
      {
        messageId: "msg-po",
        name: "buyer-po.pdf",
        type: "application/pdf",
        url: "blob:po",
        timestamp: now,
        note: "PO attached in this message",
      },
    ]);
    expect(evidence.buyerConfirmations).toEqual([
      {
        messageId: "msg-confirm",
        content: "Please proceed and confirm order.",
        timestamp: now,
      },
    ]);
  });

  it("resolves the primary CM and assigned CX members for approval routing", () => {
    let state = enquiryReducer(
      initialEnquiryState,
      createEnquiryCreatedEvent("ENQ-1", "p_bdm_1")
    );

    const cmMember = {
      id: "m_ENQ-1_p_cm_north",
      userId: "u_210",
      personaId: "p_cm_north",
      role: "CM" as const,
      joinedAt: new Date(),
    };
    const cxMember = {
      id: "m_ENQ-1_p_cx_1",
      userId: "u_301",
      personaId: "p_cx_1",
      role: "CX" as const,
      joinedAt: new Date(),
    };

    state = enquiryReducer(state, createMemberAddedEvent("ENQ-1", cmMember));
    state = enquiryReducer(state, createMemberAddedEvent("ENQ-1", cxMember));
    state = enquiryReducer(state, createPrimaryCMAssignedEvent("ENQ-1", cmMember.id));

    const targets = getApprovalTargets(state, "ENQ-1");
    expect(targets.primaryCM?.personaId).toBe("p_cm_north");
    expect(targets.cxMembers.map((member) => member.personaId)).toEqual(["p_cx_1"]);
  });
});
