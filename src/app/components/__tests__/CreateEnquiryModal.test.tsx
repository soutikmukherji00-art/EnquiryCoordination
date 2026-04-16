import React, { useContext, useMemo, useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CreateEnquiryModal } from "../CreateEnquiryModal";

const mockGroupChannels = [
  {
    id: "grp_buyer_b1_whatsapp",
    name: "Ramesh Industries - WhatsApp",
    type: "buyer",
    buyerId: "buyer_1",
    status: "active",
    memberIds: [],
    memberPersonaIds: [],
    messages: [],
    createdBy: "p_bdm_1",
    createdAt: new Date("2026-04-01T10:00:00Z"),
    threads: [],
  },
  {
    id: "grp_buyer_b1_mail",
    name: "Ramesh Industries - Mail",
    type: "buyer",
    buyerId: "buyer_1",
    status: "active",
    memberIds: [],
    memberPersonaIds: [],
    messages: [],
    createdBy: "p_bdm_1",
    createdAt: new Date("2026-04-01T10:00:00Z"),
    threads: [],
  },
  {
    id: "grp_internal_steel",
    name: "Steel Internal",
    type: "custom",
    status: "active",
    memberIds: [],
    memberPersonaIds: [],
    messages: [],
    createdBy: "p_bdm_1",
    createdAt: new Date("2026-04-01T10:00:00Z"),
    threads: [],
  },
  {
    id: "grp_internal_steel_ops",
    name: "Steel Ops Internal",
    type: "custom",
    status: "active",
    memberIds: [],
    memberPersonaIds: [],
    messages: [],
    createdBy: "p_bdm_1",
    createdAt: new Date("2026-04-01T10:00:00Z"),
    threads: [],
  },
];

vi.mock("@/app/components/ui/dialog", () => {
  const React = require("react");
  return {
    Dialog: ({ open, children }: any) => (open ? <div>{children}</div> : null),
    DialogContent: ({ children }: any) => <div>{children}</div>,
    DialogDescription: ({ children }: any) => <div>{children}</div>,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogTitle: ({ children }: any) => <div>{children}</div>,
  };
});

vi.mock("@/app/components/ui/select", () => {
  const React = require("react");
  const SelectContext = React.createContext<{ value: string; onValueChange?: (value: string) => void }>({ value: "" });

  function Select({ value, onValueChange, children }: any) {
    return (
      <SelectContext.Provider value={{ value, onValueChange }}>
        {children}
      </SelectContext.Provider>
    );
  }

  function SelectTrigger({ children }: any) {
    return <button type="button">{children}</button>;
  }

  function SelectValue({ placeholder }: any) {
    const ctx = useContext(SelectContext);
    return <span>{ctx.value || placeholder}</span>;
  }

  function SelectContent({ children }: any) {
    return <div>{children}</div>;
  }

  function SelectItem({ value, children }: any) {
    const ctx = useContext(SelectContext);
    return (
      <button type="button" onClick={() => ctx.onValueChange?.(value)}>
        {children}
      </button>
    );
  }

  return { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
});

vi.mock("@/app/components/MultiSelectDropdown", () => {
  return {
    MultiSelectDropdown: ({ options, selected, onChange, placeholder }: any) => (
      <div>
        <button type="button">{selected.length > 0 ? selected.join(", ") : placeholder}</button>
        <div>
          {options.map((option: any) => {
            const value = typeof option === "string" ? option : option.value;
            const label = typeof option === "string" ? option : option.label;
            const active = selected.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  onChange(active ? selected.filter((item: string) => item !== value) : [...selected, value]);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    ),
  };
});

vi.mock("@/app/components/VoiceRecorder", () => {
  return {
    VoiceRecorder: ({ onRecordingComplete }: any) => (
      <button
        type="button"
        onClick={() =>
          onRecordingComplete(
            "blob:voice-note",
            new Blob(["voice-note"], { type: "audio/webm" }),
            "Recorded voice note",
            4,
          )
        }
      >
        Mock record voice note
      </button>
    ),
  };
});

vi.mock("@/app/components/AudioMessage", () => {
  return {
    AudioMessage: ({ transcription }: any) => <div>Audio: {transcription?.text}</div>,
  };
});

describe("CreateEnquiryModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps field values and submits them in the payload", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <CreateEnquiryModal
        isOpen
        mode="blank"
        allGroupChannels={mockGroupChannels}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Ramesh Industries" }));

    fireEvent.click(screen.getByRole("button", { name: "Steel" }));

    fireEvent.click(screen.getByRole("button", { name: "Ramesh Industries - WhatsApp" }));
    fireEvent.click(screen.getByRole("button", { name: "Ramesh Industries - Mail" }));
    fireEvent.click(screen.getByRole("button", { name: "Steel Internal" }));
    fireEvent.click(screen.getByRole("button", { name: "Steel Ops Internal" }));

    fireEvent.change(screen.getByPlaceholderText(/add the buyer request/i), {
      target: { value: "Need 100 MT steel bars" },
    });

    const fileInput = screen.getByLabelText(/upload docs/i) as HTMLInputElement;
    const poFile = new File(["quote"], "quote.pdf", { type: "application/pdf" });
    const specFile = new File(["spec"], "spec-sheet.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, {
      target: { files: [poFile, specFile] },
    });

    fireEvent.click(screen.getAllByRole("checkbox", { name: /^po$/i })[0]);

    fireEvent.click(screen.getByRole("button", { name: /mock record voice note/i }));

    expect(screen.getByText("Ramesh Industries")).toBeInTheDocument();
    expect(screen.getAllByText("Steel").length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue("Need 100 MT steel bars")).toBeInTheDocument();
    expect(screen.getByText("quote.pdf")).toBeInTheDocument();
    expect(screen.getByText(/Audio: Recorded voice note/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /create enquiry \+ enrich|create enquiry/i }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));

    const intake = onConfirm.mock.calls[0][0];
    expect(intake.buyer.manualName).toBe("Ramesh Industries");
    expect(intake.buyer.personaId).toBe("p_buyer_1");
    expect(intake.requirements.categories).toEqual(["Steel"]);
    expect(intake.requirements.notes).toBe("Need 100 MT steel bars");
    expect(intake.source.selectedBuyerGroupIds).toEqual([
      "grp_buyer_b1_whatsapp",
      "grp_buyer_b1_mail",
    ]);
    expect(intake.source.selectedInternalGroupIds).toEqual([
      "grp_internal_steel",
      "grp_internal_steel_ops",
    ]);
    expect(intake.source.attachments).toHaveLength(2);
    expect(intake.source.attachments[0].name).toBe("quote.pdf");
    expect(intake.source.attachments[0].markAsPO).toBe(true);
    expect(intake.source.attachments[1].name).toBe("spec-sheet.pdf");
    expect(intake.source.attachments[1].markAsPO).toBeFalsy();
    expect(intake.source.voiceNote?.transcription).toBe("Recorded voice note");
  });

  it("does not reset the current edits when rerendered", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    const { rerender } = render(
      <CreateEnquiryModal
        isOpen
        mode="blank"
        allGroupChannels={mockGroupChannels}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/add the buyer request/i), {
      target: { value: "Manual note" },
    });

    rerender(
      <CreateEnquiryModal
        isOpen
        mode="blank"
        allGroupChannels={mockGroupChannels}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByDisplayValue("Manual note")).toBeInTheDocument();
  });
});
