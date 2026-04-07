import { X, Clock } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { AvatarWithStatus } from "@/app/components/AvatarWithStatus";
import { AuditEntry } from "@/domain/audit/audit.types";
import { getPersonaById } from "@/domain/persona/persona.data";

interface AuditTrailViewProps {
  enquiryId: string;
  entries: AuditEntry[];
  onClose: () => void;
}

export function AuditTrailView({
  enquiryId,
  entries,
  onClose,
}: AuditTrailViewProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      message: "Message",
      system: "System",
      share: "Share",
      state_change: "State Change",
      field_update: "Field Update",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      message: "bg-blue-100 text-blue-700",
      system: "bg-gray-100 text-gray-700",
      share: "bg-purple-100 text-purple-700",
      state_change: "bg-amber-100 text-amber-700",
      field_update: "bg-green-100 text-green-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  // Group entries by date
  const groupedEntries = entries.reduce((acc, entry) => {
    const dateKey = formatDate(entry.timestamp);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, AuditEntry[]>);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">
              Audit Trail - {enquiryId}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Complete immutable history of all enquiry activity
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.entries(groupedEntries).map(([date, dateEntries]) => (
            <div key={date} className="mb-6 last:mb-0">
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gray-200" />
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {date}
                </div>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Entries */}
              <div className="space-y-3">
                {dateEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex gap-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0 pt-1">
                      <Clock className="size-4 text-gray-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header line */}
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${getTypeColor(
                            entry.type
                          )}`}
                        >
                          {getTypeLabel(entry.type)}
                        </span>
                        {entry.channel && (
                          <span className="text-xs text-gray-500">
                            #{entry.channel}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatTime(entry.timestamp)}
                        </span>
                      </div>

                      {/* Actor */}
                      {entry.actor && (
                        <div className="flex items-center gap-2 mb-1">
                          <AvatarWithStatus
                            initials={entry.actor.substring(0, 2).toUpperCase()}
                            isActive={true}
                            avatarClassName="size-6"
                            statusSize="sm"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {entry.actor}
                          </span>
                          {entry.actorRole && (
                            <span className="text-xs text-gray-500">
                              {entry.actorRole}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Content */}
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {entry.content}
                      </div>

                      {/* Metadata */}
                      {entry.metadata && (
                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                          {entry.metadata.fromChannel &&
                            entry.metadata.toChannel && (
                              <div>
                                Shared from #{entry.metadata.fromChannel} to
                                #{entry.metadata.toChannel}
                                {entry.metadata.messageCount &&
                                  ` (${entry.metadata.messageCount} messages)`}
                              </div>
                            )}
                          {entry.metadata.field && (
                            <div>
                              Field: {entry.metadata.field}
                              {entry.metadata.oldValue && (
                                <span>
                                  {" "}
                                  | Old: {entry.metadata.oldValue} → New:{" "}
                                  {entry.metadata.newValue}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>Total entries: {entries.length}</div>
            <div className="text-xs text-gray-500">
              Read-only view • No actions available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}