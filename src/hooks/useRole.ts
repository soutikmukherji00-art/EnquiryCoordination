/**
 * Hook: User Role Management
 * 
 * Manages current user role and permissions.
 */

import { useState, useCallback } from "react";
import { UserRole, CHANNEL_VISIBILITY } from "@/domain/message/message.types";

// Role to name mapping
const ROLE_NAMES: Record<UserRole, string> = {
  CM: "Mithul Dave",
  BDM: "Nishant Dubey",
  CX: "Mamta",
  Buyer: "Prashant",
  Seller: "Rajesh Kumar",
};

export const useRole = (initialRole: UserRole = "BDM") => {
  const [currentRole, setCurrentRole] = useState<UserRole>(initialRole);
  const [currentUser, setCurrentUser] = useState<string>(ROLE_NAMES[initialRole]);

  // Change role
  const changeRole = useCallback((newRole: UserRole) => {
    setCurrentRole(newRole);
    setCurrentUser(ROLE_NAMES[newRole]);
  }, []);

  // Get visible channels for current role
  const getVisibleChannels = useCallback(() => {
    return CHANNEL_VISIBILITY[currentRole];
  }, [currentRole]);

  // Check if role can access channel
  const canAccessChannel = useCallback(
    (channelId: string) => {
      return CHANNEL_VISIBILITY[currentRole].includes(channelId);
    },
    [currentRole]
  );

  return {
    currentRole,
    currentUser,
    changeRole,
    getVisibleChannels,
    canAccessChannel,
    roleName: ROLE_NAMES[currentRole],
  };
};
