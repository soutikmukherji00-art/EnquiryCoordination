import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/components/ui/utils";
import { getRoleBadgeTone } from "@/domain/message/group-display.utils";

interface RoleBadgeProps {
  role?: string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  if (!role) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 rounded-full border-0 px-2 py-0 text-[10px] font-semibold uppercase tracking-[0.14em]",
        getRoleBadgeTone(role),
        className
      )}
    >
      {role}
    </Badge>
  );
}
