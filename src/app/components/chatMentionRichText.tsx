/**
 * Inline @mention / @command rendering for chat bodies.
 * Shared by ConversationPanel (main + group chat) and ThreadPanel (thread replies).
 */

import type { ReactNode } from "react";
import type { Member, Persona } from "@/domain/enquiry/enquiry.types";
import { COMMAND_GROUPS, ALL_TAGGING_COMMANDS } from "@/app/components/conversation-panel.commands";

export interface ChatMentionRichTextParams {
  content: string;
  messageMentionPersonaIds?: string[];
  enquiryMembers: Member[];
  /** e.g. group.memberPersonaIds, DM counterpart persona IDs */
  mentionParticipantPersonaIds?: string[];
  personaMap: Map<string, Persona>;
  isCurrentUserMessage: boolean;
}

function buildMentionAliasEntries(
  messageMentionPersonaIds: string[] | undefined,
  enquiryMembers: Member[],
  mentionParticipantPersonaIds: string[] | undefined,
  personaMap: Map<string, Persona>
): { alias: string; persona: Persona }[] {
  const mentionPersonaIds = new Set<string>();
  (messageMentionPersonaIds ?? []).forEach((id) => mentionPersonaIds.add(id));
  enquiryMembers.forEach((m) => mentionPersonaIds.add(m.personaId));
  (mentionParticipantPersonaIds ?? []).forEach((id) => mentionPersonaIds.add(id));

  const mentionAliasEntries: { alias: string; persona: Persona }[] = [];
  const addPersonaAliases = (p: Persona) => {
    const dn = p.displayName?.trim();
    if (!dn) return;
    mentionAliasEntries.push({ alias: dn, persona: p });
    const compact = dn.replace(/\s+/g, "");
    if (compact && compact !== dn) {
      mentionAliasEntries.push({ alias: compact, persona: p });
    }
    const first = dn.split(/\s+/)[0];
    if (first && first !== dn) {
      mentionAliasEntries.push({ alias: first, persona: p });
    }
  };

  for (const id of mentionPersonaIds) {
    const p = personaMap.get(id);
    if (p) addPersonaAliases(p);
  }

  if (mentionAliasEntries.length === 0 && personaMap.size > 0) {
    for (const p of personaMap.values()) {
      addPersonaAliases(p);
    }
  }

  mentionAliasEntries.sort((a, b) => b.alias.length - a.alias.length);
  return mentionAliasEntries;
}

export function renderChatMentionRichText({
  content,
  messageMentionPersonaIds,
  enquiryMembers,
  mentionParticipantPersonaIds,
  personaMap,
  isCurrentUserMessage,
}: ChatMentionRichTextParams): React.ReactElement {
  const allCommands = [
    ...COMMAND_GROUPS.flatMap((g) => g.commands),
    ...ALL_TAGGING_COMMANDS,
  ].sort((a, b) => b.label.length - a.label.length);

  const mentionAliasEntries = buildMentionAliasEntries(
    messageMentionPersonaIds,
    enquiryMembers,
    mentionParticipantPersonaIds,
    personaMap
  );

  const mentionChipClassName = isCurrentUserMessage
    ? "inline align-baseline whitespace-nowrap rounded-md border border-white/40 bg-white/15 px-1.5 py-0.5 text-sm font-semibold text-white"
    : "inline align-baseline whitespace-nowrap rounded-md border border-blue-200 bg-blue-100 px-1.5 py-0.5 text-sm font-semibold text-blue-700";
  const commandChipClassName = isCurrentUserMessage
    ? "inline align-baseline whitespace-nowrap rounded-md border border-white/35 bg-white/10 px-1.5 py-0.5 text-sm font-medium text-white"
    : "inline align-baseline whitespace-nowrap rounded px-1 text-sm font-medium";

  const parts: ReactNode[] = [];
  let i = 0;
  let partKey = 0;

  while (i < content.length) {
    const at = content.indexOf("@", i);
    if (at === -1) {
      parts.push(content.slice(i));
      break;
    }
    if (at > i) {
      parts.push(content.slice(i, at));
    }

    const sliceFromAt = content.slice(at);

    const tokenized = /^@\[([^\]]+)\]\(([^)]+)\)/.exec(sliceFromAt);
    if (tokenized) {
      const full = tokenized[0];
      const display = tokenized[1];
      parts.push(
        <span key={`mention-${at}-${partKey++}`} className={mentionChipClassName}>
          @{display}
        </span>
      );
      i = at + full.length;
      continue;
    }

    const matchedCmd = allCommands.find((cmd) => sliceFromAt.startsWith(cmd.label));
    if (matchedCmd) {
      if ("changesState" in matchedCmd && matchedCmd.changesState) {
        parts.push(
          <span
            key={`cmd-${at}-${partKey++}`}
            className={`${commandChipClassName} ${isCurrentUserMessage ? "" : "bg-amber-100 text-amber-800"}`}
          >
            {matchedCmd.label}
          </span>
        );
      } else {
        parts.push(
          <span
            key={`cmd-${at}-${partKey++}`}
            className={`${commandChipClassName} ${isCurrentUserMessage ? "" : "bg-gray-100 text-gray-700"}`}
          >
            {matchedCmd.label}
          </span>
        );
      }
      i = at + matchedCmd.label.length;
      continue;
    }

    let mentionMatched = false;
    for (const { alias } of mentionAliasEntries) {
      const body = sliceFromAt.slice(1, 1 + alias.length);
      if (body.length !== alias.length) continue;
      if (body.toLowerCase() !== alias.toLowerCase()) continue;
      const end = at + 1 + alias.length;
      const after = content[end];
      if (after !== undefined && /[A-Za-z0-9]/.test(after)) continue;
      const fullText = content.slice(at, end);
      parts.push(
        <span key={`mention-${at}-${partKey++}`} className={mentionChipClassName}>
          {fullText}
        </span>
      );
      i = end;
      mentionMatched = true;
      break;
    }
    if (mentionMatched) continue;

    parts.push("@");
    i = at + 1;
  }

  return (
    <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{parts}</span>
  );
}
