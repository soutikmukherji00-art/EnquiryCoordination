/**
 * Infrastructure: Message Context
 * 
 * React context provider for message state management.
 * Subscribes to realtime events to keep all roles in sync.
 * 
 * Performance optimizations:
 * - Memoized context value to prevent unnecessary re-renders
 * - Conditional debug logging (enable via __DEV_LOG__)
 * - Event type checking optimized with Set for O(1) lookup
 */

import * as React from "react";
import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from "react";
import {
  MessageDomainState,
  messageReducer,
  initialMessageState,
} from "@/domain/message/message.reducer";
import { MessageEvent } from "@/domain/message/message.events";
import { RealtimeService } from "@/infrastructure/realtime/realtime.interface";

// Debug logging flag - set to true to enable verbose logging
const __DEV_LOG__ = false;

/**
 * Context value type
 */
interface MessageContextValue {
  state: MessageDomainState;
  dispatch: (event: MessageEvent) => void;
}

/**
 * Context
 */
const MessageContext = createContext<MessageContextValue | undefined>(undefined);

/**
 * Provider Props
 */
interface MessageProviderProps {
  children: React.ReactNode;
  initialState?: MessageDomainState;
  realtimeService: RealtimeService;
}

/**
 * Optimized event type checker using Set for O(1) lookup
 */
const MESSAGE_EVENT_TYPES = new Set([
  "MESSAGE_SENT",
  "MESSAGE_SHARED",
  "MESSAGE_EDITED",
  "MESSAGE_WIN_MARKS_UPDATED",
  "SELLER_CHANNEL_CREATED",
  "MESSAGES_FAN_OUT",
  "BUYER_DM_MESSAGE_SENT",
  "SELLER_DM_MESSAGE_SENT",
  "SELLER_DM_CHANNEL_CREATED",
  "BUYER_DM_VIEWED",
  "SELLER_DM_VIEWED",
  "GROUP_CREATED",
  "GROUP_MEMBERS_ADDED",
  "GROUP_TAGGED",
  "GROUP_APPROVED",
  "GROUP_REJECTED",
  "GROUP_VIEWED",
  "MENTION_READ",
  "INVITE_SENT",
  "INVITE_ACCEPTED",
  "INVITE_REJECTED",
  "INVITE_EXPIRED",
  "THREAD_CREATED",
  "THREAD_MESSAGE_SENT",
  "THREAD_VIEWED",
  "THREAD_TAGGED",
]);

function isMessageEvent(event: any): event is MessageEvent {
  return MESSAGE_EVENT_TYPES.has(event.type);
}

/**
 * Conditional logger for development
 */
function devLog(label: string, data?: any) {
  if (__DEV_LOG__) {
    console.log(label, data);
  }
}

/**
 * Provider Component
 */
export function MessageProvider({ children, initialState, realtimeService }: MessageProviderProps) {
  // Reducer with conditional logging
  const [state, dispatch] = useReducer(
    (currentState: MessageDomainState, event: MessageEvent) => {
      devLog('[MessageProvider.reducer] Event:', event.type);
      
      if (__DEV_LOG__) {
        devLog('[MessageProvider.reducer] Before:', {
          messageKeys: Object.keys(currentState.messages),
          sellerChannelKeys: Object.keys(currentState.sellerChannels),
          groupChannelCount: currentState.groupChannels?.length || 0,
        });
      }
      
      const newState = messageReducer(currentState, event);
      
      if (__DEV_LOG__) {
        devLog('[MessageProvider.reducer] After:', {
          messageKeys: Object.keys(newState.messages),
          sellerChannelKeys: Object.keys(newState.sellerChannels),
          groupChannelCount: newState.groupChannels?.length || 0,
          stateChanged: currentState !== newState
        });
      }
      
      return newState;
    },
    initialState || initialMessageState
  );

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ state, dispatch }),
    [state]
  );

  // Log state changes only in dev mode
  if (__DEV_LOG__) {
    devLog('[MessageProvider] State:', {
      messageCount: Object.keys(state.messages).length,
      sellerChannelCount: Object.keys(state.sellerChannels).length,
      buyerDMCount: state.buyerDMChannels.length,
      sellerDMCount: state.sellerDMChannels?.length || 0,
      groupChannelCount: state.groupChannels?.length || 0,
    });
  }

  // Subscribe to realtime events
  useEffect(() => {
    devLog('[MessageProvider] Subscribing to realtime');
    
    const unsubscribe = realtimeService.subscribeAll((event) => {
      if (isMessageEvent(event)) {
        devLog('[MessageProvider] Received event:', event.type);
        dispatch(event);
      }
    });

    return () => {
      devLog('[MessageProvider] Unsubscribing');
      unsubscribe();
    };
  }, [realtimeService]);

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
    </MessageContext.Provider>
  );
}

/**
 * Hook to access message context
 */
export function useMessageContext() {
  const context = useContext(MessageContext);
  if (!context) {
    console.error('[useMessageContext] Context is undefined. This might be due to Hot Module Replacement.');
    throw new Error("useMessageContext must be used within MessageProvider");
  }
  return context;
}

/**
 * Hook to access message state
 */
export function useMessageState() {
  const context = useContext(MessageContext);
  if (!context) {
    console.error('[useMessageState] Context is undefined.');
    throw new Error("useMessageState must be used within MessageProvider");
  }
  return context.state;
}

/**
 * Hook to dispatch message events
 */
export function useMessageDispatch() {
  const context = useContext(MessageContext);
  if (!context) {
    console.error('[useMessageDispatch] Context is undefined.');
    throw new Error("useMessageDispatch must be used within MessageProvider");
  }
  return context.dispatch;
}
