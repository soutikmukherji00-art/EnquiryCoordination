/**
 * useMessageVisibility Hook
 * 
 * Tracks message visibility using IntersectionObserver
 * and dispatches MENTION_READ events when mentions are viewed
 */

import { useEffect, useRef, useCallback } from 'react';
import { Message } from '@/domain/message/message.types';
import { createMentionReadEvent } from '@/domain/message/message.events';
import { useMessageDispatch } from '@/infrastructure/state/MessageContext';
import { messageLogger } from '@/domain/utils/logger';

const __DEV_LOG__ = false;
const devLog = __DEV_LOG__ ? (label: string, data?: any) => console.log(label, data) : (() => {}) as (label: string, data?: any) => void;
const devError = __DEV_LOG__ ? (label: string, data?: any) => console.error(label, data) : (() => {}) as (label: string, data?: any) => void;

interface UseMessageVisibilityOptions {
  personaId: string;
  enabled?: boolean;
  threshold?: number;
  sustainedMs?: number;
}

/**
 * Hook to track message visibility and dispatch mention read events
 */
export function useMessageVisibility({
  personaId,
  enabled = true,
  threshold = 0.6,
  sustainedMs = 300,
}: UseMessageVisibilityOptions) {
  const dispatch = useMessageDispatch();
  
  // Track visibility timers
  const visibilityTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // Track already-processed messages
  const processedMessages = useRef<Set<string>>(new Set());
  
  // Track messages in current channel that have been visible long enough
  const channelVisibleMessages = useRef<Set<string>>(new Set());
  
  // Create IntersectionObserver
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    if (!enabled) return;
    
    // Create observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const messageId = entry.target.getAttribute('data-message-id');
          if (!messageId) return;
          
          // Check if message is intersecting with sufficient ratio
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            // Add to channel visible messages (for channel-switch marking)
            channelVisibleMessages.current.add(messageId);
            
            // Start timer for sustained visibility
            if (!visibilityTimers.current.has(messageId) && !processedMessages.current.has(messageId)) {
              messageLogger.debug('Message entering viewport', { 
                messageId, 
                intersectionRatio: entry.intersectionRatio,
                sustainedMs
              });
              
              const timer = setTimeout(() => {
                // Message has been visible for required duration
                devLog('[MENTION DEBUG] Mention read after sustained visibility:', { messageId, personaId, sustainedMs });
                messageLogger.info('Mention read (sustained visibility)', { 
                  messageId, 
                  personaId,
                  sustainedMs 
                });
                
                // Mark as processed
                processedMessages.current.add(messageId);
                
                // Dispatch MENTION_READ event
                const event = createMentionReadEvent(messageId, personaId);
                devLog('[MENTION DEBUG] Dispatching MENTION_READ event:', event);
                dispatch(event);
                
                // Clean up timer
                visibilityTimers.current.delete(messageId);
              }, sustainedMs);
              
              visibilityTimers.current.set(messageId, timer);
            }
          } else {
            // Message left viewport or intersection ratio too low
            const timer = visibilityTimers.current.get(messageId);
            if (timer) {
              messageLogger.debug('Message left viewport before sustained duration', { messageId });
              clearTimeout(timer);
              visibilityTimers.current.delete(messageId);
            }
          }
        });
      },
      {
        threshold: threshold,
        rootMargin: '0px',
      }
    );
    
    return () => {
      // Clean up all timers
      visibilityTimers.current.forEach((timer) => clearTimeout(timer));
      visibilityTimers.current.clear();
      
      // Disconnect observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, threshold, sustainedMs, personaId, dispatch]);
  
  /**
   * Observe a message element
   */
  const observe = useCallback((element: HTMLElement | null, message: Message) => {
    // Safety check: ensure message exists
    if (!message || !message.id) {
      devError('[MENTION DEBUG] observe() - Invalid message:', { message });
      return;
    }
    
    if (!element || !observerRef.current || !enabled) {
      devLog('[MENTION DEBUG] observe() - Early return:', { hasElement: !!element, hasObserver: !!observerRef.current, enabled, messageId: message.id });
      return;
    }
    
    // Only observe messages with unread mentions for current persona
    if (!message.mentions?.includes(personaId)) {
      devLog('[MENTION DEBUG] observe() - Message does not mention current persona:', { messageId: message.id, personaId, mentions: message.mentions });
      return;
    }
    
    if (message.mentionReadBy?.includes(personaId)) {
      devLog('[MENTION DEBUG] observe() - Mention already read:', { messageId: message.id, personaId, mentionReadBy: message.mentionReadBy });
      return;
    }
    
    // Set message ID attribute
    element.setAttribute('data-message-id', message.id);
    
    // Start observing
    observerRef.current.observe(element);
    
    devLog('[MENTION DEBUG] observe() - Now observing message:', { messageId: message.id, personaId, mentions: message.mentions });
    messageLogger.debug('Observing message for mention read', { 
      messageId: message.id,
      personaId
    });
  }, [enabled, personaId]);
  
  /**
   * Unobserve a message element
   */
  const unobserve = useCallback((element: HTMLElement | null) => {
    if (!element || !observerRef.current) return;
    
    const messageId = element.getAttribute('data-message-id');
    
    // Clear any pending timer
    if (messageId) {
      const timer = visibilityTimers.current.get(messageId);
      if (timer) {
        clearTimeout(timer);
        visibilityTimers.current.delete(messageId);
      }
    }
    
    observerRef.current.unobserve(element);
  }, []);
  
  /**
   * Reset processed messages (e.g., when changing channels)
   */
  const reset = useCallback(() => {
    processedMessages.current.clear();
    channelVisibleMessages.current.clear();
    messageLogger.debug('Reset processed messages');
  }, []);
  
  /**
   * Mark all mentions in the current channel as read
   * Called when switching away from a channel
   */
  const markChannelMentionsAsRead = useCallback(() => {
    devLog('[useMessageVisibility] Marking channel mentions as read', { visibleMessageCount: channelVisibleMessages.current.size, processedMessageCount: processedMessages.current.size });
    
    // Mark all currently visible messages as processed and dispatch events
    channelVisibleMessages.current.forEach(messageId => {
      if (!processedMessages.current.has(messageId)) {
        devLog('[useMessageVisibility] Marking mention as read on channel switch:', { messageId, personaId });
        
        // Mark as processed
        processedMessages.current.add(messageId);
        
        // Dispatch MENTION_READ event
        const event = createMentionReadEvent(messageId, personaId);
        dispatch(event);
      }
    });
    
    // Clear channel visible messages
    channelVisibleMessages.current.clear();
  }, [personaId, dispatch]);
  
  return {
    observe,
    unobserve,
    reset,
    markChannelMentionsAsRead,
  };
}