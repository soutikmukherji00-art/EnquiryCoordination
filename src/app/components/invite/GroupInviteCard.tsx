/**
 * Group Invite Card
 * 
 * Displays a group invitation with accept/reject actions
 * Updated to show contact-based information
 */

import React, { useState } from "react";
import { Check, X, Clock, Users, MessageCircle, Building2, User } from "lucide-react";
import { GroupInvite } from "@/domain/message/group-invite.types";
import { canAcceptInvite, isInviteExpired } from "@/domain/message/group-invite.utils";
import { cn } from "@/app/components/ui/utils";
import { Button } from "@/app/components/ui/button";

interface GroupInviteCardProps {
  invite: GroupInvite;
  onAccept: (inviteId: string) => void;
  onReject: (inviteId: string, reason?: string) => void;
  className?: string;
}

export function GroupInviteCard({
  invite,
  onAccept,
  onReject,
  className,
}: GroupInviteCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const expired = isInviteExpired(invite);
  const canAccept = canAcceptInvite(invite);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept(invite.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(invite.id, rejectReason || undefined);
      setShowRejectReason(false);
      setRejectReason("");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    switch (invite.status) {
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
            <Check className="w-3 h-3" />
            Accepted
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
            <X className="w-3 h-3" />
            Rejected
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
            <Clock className="w-3 h-3" />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className={cn(
      "border rounded-lg p-4 bg-white",
      expired && "opacity-60",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{invite.groupName}</h3>
            <p className="text-sm text-gray-600">
              Invited by {invite.inviterName} ({invite.inviterRole})
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Message */}
      {invite.message && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700 italic">"{invite.message}"</p>
        </div>
      )}

      {/* Contact Information */}
      {(invite.recipientRole || invite.companyName) && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-medium text-blue-900 mb-2">Invitation Details</p>
          <div className="space-y-1">
            {invite.recipientRole && (
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <User className="w-4 h-4" />
                <span>Your role: <span className="font-medium">{invite.recipientRole}</span></span>
              </div>
            )}
            {invite.companyName && (
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Building2 className="w-4 h-4" />
                <span>Company: <span className="font-medium">{invite.companyName}</span></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="mb-3 space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MessageCircle className="w-4 h-4" />
          <span>Group Type: {invite.groupType.charAt(0).toUpperCase() + invite.groupType.slice(1)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>
            Sent {invite.sentAt.toLocaleDateString()} at{" "}
            {invite.sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {invite.expiresAt && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              Expires {invite.expiresAt.toLocaleDateString()}
              {expired && " (Expired)"}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {canAccept && !showRejectReason && (
        <div className="flex gap-2">
          <Button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            Accept Invitation
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowRejectReason(true)}
            disabled={isProcessing}
          >
            <X className="w-4 h-4 mr-2" />
            Decline
          </Button>
        </div>
      )}

      {/* Reject Reason */}
      {showRejectReason && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Reason for declining (optional)
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Let them know why you're declining..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleReject}
              disabled={isProcessing}
              variant="outline"
              className="flex-1"
            >
              Confirm Decline
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectReason(false);
                setRejectReason("");
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Status message for non-pending invites */}
      {!canAccept && invite.respondedAt && (
        <p className="text-sm text-gray-500 text-center">
          {invite.status === "accepted" && "You accepted this invitation"}
          {invite.status === "rejected" && "You declined this invitation"}
          {" on "}
          {invite.respondedAt.toLocaleDateString()} at{" "}
          {invite.respondedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}

      {expired && invite.status === "pending" && (
        <p className="text-sm text-gray-500 text-center">
          This invitation has expired
        </p>
      )}
    </div>
  );
}