/**
 * Application Providers
 * 
 * Sets up all context providers and infrastructure instances.
 * Provider hierarchy:
 * - AppStoreProvider (infrastructure services)
 *   - EnquiryProvider (state management)
 *     - RoleProvider (role state)
 *       - PolicyProvider (policy enforcement based on role)
 */

import * as React from "react";
import { ReactNode, useMemo } from "react";
import { AppStoreProvider } from "@/hooks/useAppStore";
import { MemoryStore } from "@/infrastructure/datastore/memory.store";
import { MockAIService } from "@/infrastructure/ai/ai.mock";
import { MockRealtimeService } from "@/infrastructure/realtime/realtime.mock";
import { LiveVoiceService } from "@/infrastructure/voice/voice.live";
import { MockVoiceService } from "@/infrastructure/voice/voice.mock";
import { EnquiryProvider, MessageProvider, RoleProvider, PolicyProvider, useRoleContext } from "@/infrastructure";
import {
  MOCK_ENQUIRIES,
  MOCK_MESSAGES,
  MOCK_SELLER_CHANNELS,
  MOCK_AUDIT_ENTRIES,
  MOCK_BUYER_DM_CHANNELS,
  MOCK_SELLER_DM_CHANNELS,
} from "@/infrastructure/datastore/mockData";
import { initializeMockEnquiryState, initializeMockMessageState } from "@/infrastructure/datastore/mockDataInitializer";

const __DEV_LOG__ = false;
const devLog = __DEV_LOG__ ? (label: string, data?: any) => console.log(label, data) : (() => {}) as (label: string, data?: any) => void;
const devError = __DEV_LOG__ ? (label: string, data?: any) => console.error(label, data) : (() => {}) as (label: string, data?: any) => void;

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Inner providers that need access to role context
 */
function InnerProviders({ children }: { children: ReactNode }) {
  try {
    const { currentRole } = useRoleContext();
    
    return (
      <PolicyProvider role={currentRole}>
        {children}
      </PolicyProvider>
    );
  } catch (error) {
    // During HMR or initialization, context might not be ready
    devError('[InnerProviders] Error accessing RoleContext:', error);
    // Return a loading state instead of null
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading...</div>
          <div className="text-sm text-gray-500">Initializing application</div>
        </div>
      </div>
    );
  }
}

/**
 * Main provider component
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  // Initialize infrastructure instances (memoized to prevent recreating on every render)
  const infrastructure = useMemo(() => {
    devLog('[AppProviders] Initializing infrastructure services');
    const dataStore = new MemoryStore({
      enquiries: MOCK_ENQUIRIES,
      messages: MOCK_MESSAGES,
      sellerChannels: MOCK_SELLER_CHANNELS,
      auditEntries: MOCK_AUDIT_ENTRIES,
      buyerDMChannels: MOCK_BUYER_DM_CHANNELS,
      sellerDMChannels: MOCK_SELLER_DM_CHANNELS,
    });

    const aiService = new MockAIService();
    const realtimeService = new MockRealtimeService();
    
    // Use LiveVoiceService if supported, otherwise fallback to Mock
    const voiceService = new LiveVoiceService();
    const actualVoiceService = voiceService.isSupported() 
      ? voiceService 
      : new MockVoiceService();

    return { dataStore, aiService, realtimeService, voiceService: actualVoiceService };
  }, []);

  // Initialize enquiry state from mock data (convert memberIds to Member objects)
  const initialEnquiryState = useMemo(() => {
    devLog('[AppProviders] Initializing enquiry state');
    return initializeMockEnquiryState();
  }, []);

  // Initialize message state from mock data
  const initialMessageState = useMemo(() => {
    devLog('[AppProviders] Initializing message state');
    return initializeMockMessageState();
  }, []);

  devLog('[AppProviders] Rendering provider tree');

  return (
    <AppStoreProvider
      dataStore={infrastructure.dataStore}
      aiService={infrastructure.aiService}
      realtimeService={infrastructure.realtimeService}
      voiceService={infrastructure.voiceService}
    >
      <EnquiryProvider initialState={initialEnquiryState} realtimeService={infrastructure.realtimeService}>
        <MessageProvider initialState={initialMessageState} realtimeService={infrastructure.realtimeService}>
          <RoleProvider initialRole="BDM">
            <InnerProviders>
              {children}
            </InnerProviders>
          </RoleProvider>
        </MessageProvider>
      </EnquiryProvider>
    </AppStoreProvider>
  );
};