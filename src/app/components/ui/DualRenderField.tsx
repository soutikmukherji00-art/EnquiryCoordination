import type { ReactNode } from "react";
import { cn } from "@/app/components/ui/utils";

interface DualRenderFieldProps {
  label: string;
  isEditMode: boolean;
  viewContent: ReactNode;
  editContent: ReactNode;
  required?: boolean;
  errorMessage?: string;
  className?: string;
}

export function DualRenderField({
  label,
  isEditMode,
  viewContent,
  editContent,
  required = false,
  errorMessage,
  className,
}: DualRenderFieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div className="text-xs font-medium text-muted-foreground">
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </div>
      <div className="min-h-10 rounded-md border border-transparent px-0.5 py-1 text-sm">
        {isEditMode ? editContent : viewContent}
      </div>
      {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
    </div>
  );
}
