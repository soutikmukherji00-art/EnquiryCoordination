/**
 * Hook: Application Store Context
 * 
 * Provides global access to datastore, AI, and realtime services.
 */

import React, { createContext, useContext, ReactNode } from "react";
import { DataStore } from "@/infrastructure/datastore/datastore.interface";
import { AIService } from "@/infrastructure/ai/ai.interface";
import { RealtimeService } from "@/infrastructure/realtime/realtime.interface";
import { VoiceService } from "@/infrastructure/voice/voice.interface";

interface AppStoreContextValue {
  dataStore: DataStore;
  aiService: AIService;
  realtimeService: RealtimeService;
  voiceService: VoiceService;
}

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

interface AppStoreProviderProps {
  dataStore: DataStore;
  aiService: AIService;
  realtimeService: RealtimeService;
  voiceService: VoiceService;
  children: ReactNode;
}

export const AppStoreProvider: React.FC<AppStoreProviderProps> = ({
  dataStore,
  aiService,
  realtimeService,
  voiceService,
  children,
}) => {
  return (
    <AppStoreContext.Provider value={{ dataStore, aiService, realtimeService, voiceService }}>
      {children}
    </AppStoreContext.Provider>
  );
};

export const useAppStore = (): AppStoreContextValue => {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }
  return context;
};