"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { isValidEmail, isValidPhone } from "@/domain/utils/validation";
import { cn } from "@/app/components/ui/utils";

export interface PlutoAddContactFormValue {
  mobileNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  departments: string[];
  modeOfCommunication: string[];
}

interface PlutoAddContactModalProps {
  open: boolean;
  buyerName?: string;
  initialValue?: Partial<PlutoAddContactFormValue>;
  submitting?: boolean;
  onSubmit: (value: PlutoAddContactFormValue) => void | Promise<void>;
}

const DEPARTMENT_OPTIONS = [
  "Site Co-ordinator",
  "Procurement",
  "Finance",
  "Promotor",
  "Other",
  "Sales",
  "Accounts Manager",
  "Operations",
  "Owner / Promoter",
] as const;

const MODE_OPTIONS = ["Email", "WhatsApp", "SMS"] as const;

function normalizePhoneInput(value: string): string {
  return value.trim();
}

export function PlutoAddContactModal({
  open,
  buyerName,
  initialValue,
  submitting = false,
  onSubmit,
}: PlutoAddContactModalProps) {
  const [mobileNumber, setMobileNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [modeOfCommunication, setModeOfCommunication] = useState<string[]>([...MODE_OPTIONS]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMobileNumber(initialValue?.mobileNumber ?? "");
    setFirstName(initialValue?.firstName ?? "");
    setLastName(initialValue?.lastName ?? "");
    setEmail(initialValue?.email ?? "");
    setDepartments(initialValue?.departments ?? []);
    setModeOfCommunication(initialValue?.modeOfCommunication ?? [...MODE_OPTIONS]);
    setHasAttemptedSubmit(false);
  }, [open, initialValue]);

  const validation = useMemo(() => {
    const normalizedPhone = normalizePhoneInput(mobileNumber);
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedEmail = email.trim();
    const hasDepartments = departments.length > 0;

    return {
      phoneRequired: normalizedPhone.length === 0,
      phoneInvalid: normalizedPhone.length > 0 && !isValidPhone(normalizedPhone),
      firstNameRequired: normalizedFirstName.length === 0,
      lastNameRequired: normalizedLastName.length === 0,
      emailRequired: normalizedEmail.length === 0,
      emailInvalid: normalizedEmail.length > 0 && !isValidEmail(normalizedEmail),
      departmentsRequired: !hasDepartments,
      canSubmit:
        normalizedPhone.length > 0 &&
        isValidPhone(normalizedPhone) &&
        normalizedFirstName.length > 0 &&
        normalizedLastName.length > 0 &&
        normalizedEmail.length > 0 &&
        isValidEmail(normalizedEmail) &&
        hasDepartments,
    };
  }, [departments, email, firstName, lastName, mobileNumber]);

  const submit = async () => {
    setHasAttemptedSubmit(true);
    if (!validation.canSubmit || submitting) return;
    await onSubmit({
      mobileNumber: normalizePhoneInput(mobileNumber),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      departments,
      modeOfCommunication,
    });
  };

  const shouldShowPhoneError = hasAttemptedSubmit && (validation.phoneRequired || validation.phoneInvalid);
  const shouldShowFirstNameError = hasAttemptedSubmit && validation.firstNameRequired;
  const shouldShowLastNameError = hasAttemptedSubmit && validation.lastNameRequired;
  const shouldShowEmailError = hasAttemptedSubmit && (validation.emailRequired || validation.emailInvalid);
  const shouldShowDepartmentsError = hasAttemptedSubmit && validation.departmentsRequired;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) return;
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-3xl rounded-[22px] p-8"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="mb-2">
          <DialogTitle className="text-center text-3xl font-semibold tracking-tight">Add Contact</DialogTitle>
          <DialogDescription className="text-center text-sm">
            {buyerName ? `Add the enquiry source contact for ${buyerName}.` : "Add the enquiry source contact."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Mobile Number"
            required
            value={mobileNumber}
            onChange={setMobileNumber}
            placeholder=""
            error={
              shouldShowPhoneError
                ? validation.phoneRequired
                  ? "Mobile number is required"
                  : "Enter a valid mobile number"
                : undefined
            }
          />
          <Field
            label="First Name"
            required
            value={firstName}
            onChange={setFirstName}
            placeholder=""
            error={shouldShowFirstNameError ? "First Name is required" : undefined}
          />
          <Field
            label="Last Name"
            required
            value={lastName}
            onChange={setLastName}
            placeholder=""
            error={shouldShowLastNameError ? "Last Name is required" : undefined}
          />
          <Field
            label="Email"
            required
            value={email}
            onChange={setEmail}
            placeholder=""
            error={
              shouldShowEmailError
                ? validation.emailRequired
                  ? "Email is required"
                  : "Enter a valid email address"
                : undefined
            }
          />

          <div className="space-y-2">
            <label className="text-[15px] font-semibold text-slate-700">
              Departments <span className="text-rose-500">*</span>
            </label>
            <MultiSelectDropdown
              values={departments}
              options={[...DEPARTMENT_OPTIONS]}
              onChange={setDepartments}
              placeholder="--Select--"
              className={shouldShowDepartmentsError ? "border-rose-300" : ""}
            />
            {shouldShowDepartmentsError ? (
              <p className="text-sm font-medium text-rose-500">At least one department must be selected</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-[15px] font-semibold text-slate-700">Mode of Communication</label>
            <MultiSelectDropdown
              values={modeOfCommunication}
              options={[...MODE_OPTIONS]}
              onChange={setModeOfCommunication}
              placeholder="--Select--"
            />
          </div>
        </div>

        <Button
          type="button"
          className="mt-4 h-12 w-full rounded-[12px]"
          disabled={!validation.canSubmit || submitting}
          onClick={() => void submit()}
        >
          {submitting ? "Adding Contact..." : "Add Contact"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function MultiSelectDropdown({
  values,
  options,
  onChange,
  placeholder,
  className,
}: {
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const allSelected = options.length > 0 && options.every((option) => values.includes(option));

  const toggleAll = (checked: boolean) => {
    onChange(checked ? [...options] : []);
  };

  const toggleOption = (option: string, checked: boolean) => {
    if (checked) {
      onChange(values.includes(option) ? values : [...values, option]);
      return;
    }
    onChange(values.filter((entry) => entry !== option));
  };

  const selectedSummary = useMemo(() => {
    if (allSelected) return "All";
    if (values.length === 0) return placeholder;
    if (values.length === 1) return values[0];
    return `${values[0]} +${values.length - 1}`;
  }, [allSelected, placeholder, values]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-[12px] border border-border px-4 text-left text-[15px]",
            values.length === 0 ? "text-muted-foreground" : "text-foreground",
            className,
          )}
        >
          <span className="truncate">{selectedSummary}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <div className="max-h-72 overflow-y-auto py-2">
          <label className="flex items-center gap-3 px-4 py-3 text-[15px] hover:bg-muted/50">
            <Checkbox checked={allSelected} onCheckedChange={(checked) => toggleAll(Boolean(checked))} />
            <span>All</span>
          </label>
          {options.map((option) => (
            <label key={option} className="flex items-center gap-3 px-4 py-3 text-[15px] hover:bg-muted/50">
              <Checkbox
                checked={values.includes(option)}
                onCheckedChange={(checked) => toggleOption(option, Boolean(checked))}
                aria-label={option}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const inputId = `pluto-contact-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-[15px] font-semibold text-slate-700">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </label>
      <Input
        id={inputId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn("h-11 rounded-[12px]", error ? "border-rose-300 focus-visible:ring-rose-200" : "")}
      />
      {error ? <p className="text-sm font-medium text-rose-500">{error}</p> : null}
    </div>
  );
}
