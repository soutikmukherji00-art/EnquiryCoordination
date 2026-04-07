/**
 * Base Header Component System
 * 
 * Provides a composable header structure for all channel types.
 * Use the compound component pattern for flexibility.
 */

import { ReactNode } from "react";
import { MembersIndicator } from "@/app/components/MembersIndicator";
import { Member, Persona } from "@/domain/enquiry/enquiry.types";

interface BaseHeaderProps {
  children?: ReactNode;
  className?: string;
  // Members props
  members?: Member[];
  personas?: Map<string, Persona>;
  onAddMember?: (personaId: string) => void;
  onRemoveMember?: (memberId: string) => void;
  // Title/Label
  title?: string;
  subtitle?: ReactNode;
  badge?: ReactNode;
  hideTitle?: boolean;
  // Actions
  actions?: ReactNode;
}

/**
 * Main Header Container - Matches EnquiryHeader structure
 */
export function BaseHeader({ 
  children,
  className = "",
  members,
  personas,
  onAddMember,
  onRemoveMember,
  title,
  subtitle,
  badge,
  hideTitle,
  actions,
}: BaseHeaderProps) {
  // If using children prop (legacy compound pattern), render old structure
  if (children) {
    return (
      <div className={`bg-white border-b border-gray-200 ${className}`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // New structure matching EnquiryHeader
  return (
    <div
      className={`bg-white content-stretch hidden md:flex flex-col items-start pb-[12px] pt-[15.996px] px-[23.994px] relative w-full ${className}`}
      style={{ minHeight: "80px" }}
    >
      <div
        aria-hidden="true"
        className="absolute border-[#e5e7eb] border-b-[0.625px] border-solid inset-0 pointer-events-none"
      />

      {/* Main container */}
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
        <div className="relative shrink-0 w-full">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[15.996px] items-center relative w-full">
            {/* Left section - Title and Subtitle */}
            <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
              <div className="flex-[1_0_0] h-full min-h-px min-w-px relative">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
                  <div className="flex-[1_0_0] min-h-px min-w-px relative">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start justify-center relative w-full">
                      {/* Title + Badge */}
                      {!hideTitle && (
                        <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0">
                          <p className="font-['Inter',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#33373d] text-[14px]">
                            {title}
                          </p>
                          {badge}
                        </div>
                      )}

                      {/* Subtitle */}
                      {subtitle && (
                        <div className="content-stretch flex items-center relative shrink-0">
                          <p className="font-['Inter',sans-serif] font-semibold leading-[32px] not-italic relative shrink-0 text-[#4039ad] text-[20px]">
                            {subtitle}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right section - Members and Actions */}
            <div className="h-[40px] relative shrink-0">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.992px] h-full items-center justify-end relative">
                {/* Members Indicator */}
                {members && personas && (
                  <MembersIndicator
                    members={members}
                    personas={personas}
                    onAddMember={onAddMember}
                    onRemoveMember={onRemoveMember}
                  />
                )}

                {/* Custom Actions */}
                {actions}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Header Title and Metadata Section
 */
interface HeaderContentProps {
  children: ReactNode;
  className?: string;
}

function HeaderContent({ children, className = "" }: HeaderContentProps) {
  return (
    <div className={`flex-1 min-w-0 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Header Title
 */
interface HeaderTitleProps {
  children: ReactNode;
  badge?: ReactNode;
  className?: string;
}

function HeaderTitle({ children, badge, className = "" }: HeaderTitleProps) {
  return (
    <div className="flex items-center gap-2">
      <h2 className={`text-xl font-semibold text-gray-900 truncate ${className}`}>
        {children}
      </h2>
      {badge}
    </div>
  );
}

/**
 * Header Subtitle/Metadata
 */
interface HeaderSubtitleProps {
  children: ReactNode;
  className?: string;
}

function HeaderSubtitle({ children, className = "" }: HeaderSubtitleProps) {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`}>
      {children}
    </p>
  );
}

/**
 * Header Actions Section (right side)
 */
interface HeaderActionsProps {
  children: ReactNode;
  className?: string;
}

function HeaderActions({ children, className = "" }: HeaderActionsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Header Members Section (below title)
 */
interface HeaderMembersProps {
  children: ReactNode;
  className?: string;
}

function HeaderMembers({ children, className = "" }: HeaderMembersProps) {
  return (
    <div className={`mt-3 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Compound Component Exports
 */
BaseHeader.Content = HeaderContent;
BaseHeader.Title = HeaderTitle;
BaseHeader.Subtitle = HeaderSubtitle;
BaseHeader.Actions = HeaderActions;
BaseHeader.Members = HeaderMembers;