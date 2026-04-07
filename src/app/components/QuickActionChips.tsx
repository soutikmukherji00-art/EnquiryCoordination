import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import {
  Clock,
  FileText,
  Send,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export interface QuickAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "success";
  description?: string;
}

interface QuickActionChipsProps {
  actions: QuickAction[];
  onActionClick: (actionId: string) => void;
  className?: string;
}

export function QuickActionChips({
  actions,
  onActionClick,
  className,
}: QuickActionChipsProps) {
  const getActionIcon = (actionId: string) => {
    if (actionId.includes("quote")) return <FileText className="size-3.5" />;
    if (actionId.includes("po")) return <CheckCircle className="size-3.5" />;
    if (actionId.includes("state")) return <ArrowRight className="size-3.5" />;
    if (actionId.includes("send") || actionId.includes("share"))
      return <Send className="size-3.5" />;
    return <Clock className="size-3.5" />;
  };

  const getVariantStyles = (variant?: string) => {
    switch (variant) {
      case "primary":
        return "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100";
      case "success":
        return "border-green-200 bg-green-50 text-green-700 hover:bg-green-100";
      default:
        return "border-gray-200 bg-white text-gray-700 hover:bg-gray-50";
    }
  };

  if (actions.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2 py-2", className)}>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onActionClick(action.id)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors",
            getVariantStyles(action.variant)
          )}
        >
          {action.icon || getActionIcon(action.id)}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
