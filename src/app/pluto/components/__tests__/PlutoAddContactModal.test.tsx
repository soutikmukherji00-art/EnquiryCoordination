import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PlutoAddContactModal } from "../PlutoAddContactModal";

describe("PlutoAddContactModal", () => {
  it("shows validation errors when required inputs are missing", async () => {
    const onSubmit = vi.fn();

    render(
      <PlutoAddContactModal
        open
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByRole("button", { name: "Add Contact" })).toBeDisabled();
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits when all required fields are valid", async () => {
    const onSubmit = vi.fn();

    render(
      <PlutoAddContactModal
        open
        initialValue={{ email: "source@buyer.com", mobileNumber: "+91 98765 43210" }}
        onSubmit={onSubmit}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Add Contact" });
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("First Name *"), { target: { value: "Rahul" } });
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Last Name *"), { target: { value: "Sharma" } });
    expect(submitButton).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "--Select--" }));
    fireEvent.click(screen.getByLabelText("Procurement"));
    expect(submitButton).toBeEnabled();
    fireEvent.click(submitButton);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      firstName: "Rahul",
      lastName: "Sharma",
      email: "source@buyer.com",
      mobileNumber: "+91 98765 43210",
      departments: ["Procurement"],
      modeOfCommunication: ["Email", "WhatsApp", "SMS"],
    }));
  });
});
