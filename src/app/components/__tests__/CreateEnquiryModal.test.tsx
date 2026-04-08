import React, { useContext, useMemo, useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CreateEnquiryModal } from "../CreateEnquiryModal";

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
          {options.map((option: string) => {
            const active = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(active ? selected.filter((item: string) => item !== option) : [...selected, option]);
                }}
              >
                {option}
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
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /select an existing buyer/i }));
    fireEvent.click(screen.getByRole("button", { name: "Ramesh Industries" }));

    fireEvent.click(screen.getByRole("button", { name: /select categories/i }));
    fireEvent.click(screen.getByRole("button", { name: "Steel" }));

    fireEvent.change(screen.getByPlaceholderText(/add the buyer request/i), {
      target: { value: "Need 100 MT steel bars" },
    });

    const file = new File(["quote"], "quote.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText(/upload docs/i).parentElement!.querySelector('input[type="file"]')!, {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: /mock record voice note/i }));
    fireEvent.click(screen.getByRole("checkbox"));

    expect(screen.getByText("Ramesh Industries")).toBeInTheDocument();
    expect(screen.getAllByText("Steel").length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue("Need 100 MT steel bars")).toBeInTheDocument();
    expect(screen.getByText("quote.pdf")).toBeInTheDocument();
    expect(screen.getByText(/Audio: Recorded voice note/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /create enquiry \+ enrich|create enquiry/i }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));

    const submission = onConfirm.mock.calls[0][0];
    expect(submission.data.buyerName).toBe("Ramesh Industries");
    expect(submission.data.buyerPersonaId).toBe("p_buyer_1");
    expect(submission.data.categories).toEqual(["Steel"]);
    expect(submission.data.notes).toBe("Need 100 MT steel bars");
    expect(submission.intake.attachments).toHaveLength(1);
    expect(submission.intake.attachments[0].name).toBe("quote.pdf");
    expect(submission.intake.voiceNote?.transcription).toBe("Recorded voice note");
    expect(submission.intake.markAsPO).toBe(true);
  });

  it("does not reset the current edits when rerendered", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    const { rerender } = render(
      <CreateEnquiryModal
        isOpen
        mode="blank"
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
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByDisplayValue("Manual note")).toBeInTheDocument();
  });
});
