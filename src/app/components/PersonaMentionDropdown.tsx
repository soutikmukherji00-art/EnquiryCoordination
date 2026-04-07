/**
 * Persona Mention Dropdown Component
 * 
 * Shows all internal personas for @mentions with category separation
 * Feature Group 2: CM Tagging
 */

import { Persona, Member } from "@/domain/enquiry/enquiry.types";
import { PERSONAS } from "@/domain/persona/persona.data";
import { AvatarWithStatus } from "@/app/components/AvatarWithStatus";

interface PersonaMentionDropdownProps {
  members: Member[];
  personas: Map<string, Persona>;
  searchQuery: string;
  position: { bottom?: number; top?: number; left: number };
  onSelect: (persona: Persona) => void;
  onClose: () => void;
  commandGroups?: Array<{
    label: string;
    commands: Array<{
      id: string;
      label: string;
      description: string;
      notifies?: string;
      changesState?: boolean;
    }>;
  }>;
  onCommandSelect?: (commandLabel: string) => void;
}

/**
 * Get initials from display name
 */
function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Get color for role
 */
function getRoleColor(role: string): string {
  switch (role) {
    case "BDM":
      return "bg-blue-500";
    case "CM":
      return "bg-purple-500";
    case "CX":
      return "bg-green-500";
    case "Buyer":
      return "bg-orange-500";
    case "Seller":
      return "bg-teal-500";
    default:
      return "bg-gray-500";
  }
}

/**
 * Format response time for display
 */
function formatResponseTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  return `${hours} hr${hours !== 1 ? 's' : ''}`;
}

export function PersonaMentionDropdown({
  members,
  personas,
  searchQuery,
  position,
  onSelect,
  onClose,
  commandGroups,
  onCommandSelect,
}: PersonaMentionDropdownProps) {
  // Get member persona IDs for quick lookup
  const memberPersonaIds = new Set(members.map((m) => m.personaId));

  // Get all internal personas (exclude external)
  const allInternalPersonas = PERSONAS.filter((p) => !p.isExternal);

  // Filter by search query with special handling for role shortcuts
  const filteredPersonas = searchQuery
    ? (() => {
        const lowerQuery = searchQuery.toLowerCase();
        
        // Special case: "cm" exactly → show only CM role
        if (lowerQuery === "cm") {
          return allInternalPersonas.filter((p) => p.role === "CM");
        }
        
        // Special case: "c" exactly → show CM and CX roles
        if (lowerQuery === "c") {
          return allInternalPersonas.filter((p) => p.role === "CM" || p.role === "CX");
        }
        
        // Normal filtering: match displayName or role
        return allInternalPersonas.filter((p) =>
          p.displayName.toLowerCase().includes(lowerQuery) ||
          p.role.toLowerCase().includes(lowerQuery)
        );
      })()
    : allInternalPersonas;

  // Separate into members and non-members
  const memberPersonas = filteredPersonas.filter((p) =>
    memberPersonaIds.has(p.id)
  );
  const nonMemberPersonas = filteredPersonas.filter(
    (p) => !memberPersonaIds.has(p.id)
  );

  // Check if we should show recommended section (when typing @c)
  const showRecommendedSection = searchQuery.toLowerCase() === "c";
  const recommendedPersonas = showRecommendedSection
    ? filteredPersonas.filter((p) => p.role === "CM")
    : [];
  
  // For the regular sections, exclude recommended ones if showing recommended section
  const regularMemberPersonas = showRecommendedSection
    ? memberPersonas.filter((p) => p.role !== "CM")
    : memberPersonas;
  const regularNonMemberPersonas = showRecommendedSection
    ? nonMemberPersonas.filter((p) => p.role !== "CM")
    : nonMemberPersonas;

  // Group members by role
  const groupedMembers = regularMemberPersonas.reduce((acc, persona) => {
    if (!acc[persona.role]) {
      acc[persona.role] = [];
    }
    acc[persona.role].push(persona);
    return acc;
  }, {} as Record<string, Persona[]>);

  // Group non-members by role
  const groupedNonMembers = regularNonMemberPersonas.reduce((acc, persona) => {
    if (!acc[persona.role]) {
      acc[persona.role] = [];
    }
    acc[persona.role].push(persona);
    return acc;
  }, {} as Record<string, Persona[]>);

  // Check if we have any commands to display
  const hasCommandsToShow = commandGroups && commandGroups.length > 0 && onCommandSelect;
  const filteredCommandGroups = hasCommandsToShow
    ? commandGroups.map((group) => ({
        ...group,
        commands: searchQuery
          ? group.commands.filter((cmd) => {
              const commandText = cmd.label.toLowerCase().slice(1);
              const descText = cmd.description.toLowerCase();
              return commandText.includes(searchQuery.toLowerCase()) || descText.includes(searchQuery.toLowerCase());
            })
          : group.commands,
      })).filter(group => group.commands.length > 0)
    : [];

  // If no personas and no commands, show "not found" message
  if (filteredPersonas.length === 0 && filteredCommandGroups.length === 0) {
    return (
      <>
        <div className="fixed inset-0 z-40" onClick={onClose} />
        <div
          className="fixed z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-xl"
          style={position}
        >
          <div className="p-4 text-center text-sm text-gray-500">
            No members or commands found for "{searchQuery}"
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 w-96 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto"
        style={position}
      >
        <div className="p-2">
          {/* Recommended section - shown when typing @c */}
          {showRecommendedSection && recommendedPersonas.length > 0 && (
            <div className="mb-3">
              <div className="px-2 py-1 text-xs font-bold text-gray-700 uppercase tracking-wider">
                Recommended
              </div>
              <div className="px-2 pb-2">
                <p className="text-[10px] text-gray-500 leading-tight">
                  Category Managers
                </p>
              </div>
              <div className="space-y-0.5">
                {recommendedPersonas.map((persona) => {
                  const isMember = memberPersonaIds.has(persona.id);
                  return (
                    <button
                      key={persona.id}
                      onClick={() => onSelect(persona)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      {/* Avatar with status */}
                      <AvatarWithStatus
                        initials={getInitials(persona.displayName)}
                        isActive={persona.isActive}
                        avatarClassName={`size-8 rounded-full ${getRoleColor(
                          persona.role
                        )} flex items-center justify-center text-white text-xs font-medium`}
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {persona.displayName}
                          {!isMember && (
                            <span className="ml-2 text-[10px] text-gray-400 font-normal">
                              Not in group
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          @{persona.displayName.replace(/\s+/g, "")}
                        </div>
                        {persona.avgResponseTimeMinutes && (
                          <div className="text-xs text-gray-500">
                            Avg. response: {formatResponseTime(persona.avgResponseTimeMinutes)}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Divider after recommended section */}
          {showRecommendedSection && recommendedPersonas.length > 0 && (regularMemberPersonas.length > 0 || regularNonMemberPersonas.length > 0) && (
            <div className="border-t border-gray-200 my-2" />
          )}

          {/* Members section */}
          {regularMemberPersonas.length > 0 && (
            <div className="mb-3">
              <div className="px-2 py-1 text-xs font-bold text-gray-700 uppercase tracking-wider">
                Members
              </div>
              {Object.entries(groupedMembers).map(([role, rolePersonas]) => (
                <div key={role} className="mb-2 last:mb-0">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {role} ({rolePersonas.length})
                  </div>
                  <div className="space-y-0.5">
                    {rolePersonas.map((persona) => (
                      <button
                        key={persona.id}
                        onClick={() => onSelect(persona)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        {/* Avatar with status */}
                        <AvatarWithStatus
                          initials={getInitials(persona.displayName)}
                          isActive={persona.isActive}
                          avatarClassName={`size-8 rounded-full ${getRoleColor(
                            persona.role
                          )} flex items-center justify-center text-white text-xs font-medium`}
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {persona.displayName}
                          </div>
                          <div className="text-xs text-gray-500">
                            @{persona.displayName.replace(/\s+/g, "")}
                          </div>
                          {/* Show response time for CMs and CX */}
                          {(persona.role === "CM" || persona.role === "CX") && persona.avgResponseTimeMinutes && (
                            <div className="text-xs text-gray-500">
                              Avg. response: {formatResponseTime(persona.avgResponseTimeMinutes)}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Divider between sections */}
          {regularMemberPersonas.length > 0 && regularNonMemberPersonas.length > 0 && (
            <div className="border-t border-gray-200 my-2" />
          )}

          {/* Not in group section */}
          {regularNonMemberPersonas.length > 0 && (
            <div>
              <div className="px-2 py-1 text-xs font-bold text-gray-700 uppercase tracking-wider">
                Not in Group
              </div>
              <div className="px-2 pb-2">
                <p className="text-[10px] text-gray-500 leading-tight">
                  Tagging will add them and share chat history
                </p>
              </div>
              {Object.entries(groupedNonMembers).map(([role, rolePersonas]) => (
                <div key={role} className="mb-2 last:mb-0">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {role} ({rolePersonas.length})
                  </div>
                  <div className="space-y-0.5">
                    {rolePersonas.map((persona) => (
                      <button
                        key={persona.id}
                        onClick={() => onSelect(persona)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        {/* Avatar with status */}
                        <AvatarWithStatus
                          initials={getInitials(persona.displayName)}
                          isActive={persona.isActive}
                          avatarClassName={`size-8 rounded-full ${getRoleColor(
                            persona.role
                          )} flex items-center justify-center text-white text-xs font-medium`}
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {persona.displayName}
                          </div>
                          <div className="text-xs text-gray-500">
                            @{persona.displayName.replace(/\s+/g, "")}
                          </div>
                          {/* Show response time for CMs and CX */}
                          {(persona.role === "CM" || persona.role === "CX") && persona.avgResponseTimeMinutes && (
                            <div className="text-xs text-gray-500">
                              Avg. response: {formatResponseTime(persona.avgResponseTimeMinutes)}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Divider before commands section */}
          {filteredCommandGroups.length > 0 && (regularMemberPersonas.length > 0 || regularNonMemberPersonas.length > 0) && (
            <div className="border-t border-gray-200 my-2" />
          )}

          {/* Commands section */}
          {filteredCommandGroups.length > 0 && onCommandSelect && (
            <div>
              {filteredCommandGroups.map((group) => (
                <div key={group.label} className="mb-3 last:mb-0">
                  <div className="px-2 py-1 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {group.label}
                  </div>
                  <div className="space-y-0.5">
                    {group.commands.map((cmd) => (
                      <button
                        key={cmd.id}
                        onClick={() => onCommandSelect(cmd.label)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-start justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900">
                            {cmd.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {cmd.description}
                          </div>
                        </div>
                        {cmd.notifies && (
                          <div className="flex-shrink-0 text-[10px] text-gray-400 mt-0.5">
                            Notifies: {cmd.notifies}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}