/**
 * Infrastructure: Mock Voice Service
 * 
 * Mock implementation for testing without microphone access.
 */

import { VoiceService, RecordingResult } from "./voice.interface";

export class MockVoiceService implements VoiceService {
  private recording = false;
  private startTime = 0;

  isSupported(): boolean {
    return true; // Always supported in mock
  }

  async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    return 'granted'; // Mock always has permission
  }

  async requestPermission(): Promise<boolean> {
    return true; // Mock always grants permission
  }

  async startRecording(): Promise<void> {
    this.recording = true;
    this.startTime = Date.now();
    console.log("[Mock] Recording started");
  }

  async stopRecording(): Promise<RecordingResult> {
    this.recording = false;
    const duration = (Date.now() - this.startTime) / 1000;

    // Create a mock audio blob
    const mockAudioData = new Uint8Array(1024);
    const blob = new Blob([mockAudioData], { type: "audio/webm" });
    const url = URL.createObjectURL(blob);

    console.log("[Mock] Recording stopped, duration:", duration);

    return { blob, url, duration };
  }

  cancelRecording(): void {
    this.recording = false;
    console.log("[Mock] Recording cancelled");
  }

  isRecording(): boolean {
    return this.recording;
  }

  getStream(): MediaStream | null {
    return null; // Mock service doesn't have a real stream
  }

  async transcribe(onPartial?: (text: string) => void): Promise<string> {
    // Simulate transcription delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockTranscript = 
      "This is a mock transcription. In production, this would be the actual speech-to-text output from the Web Speech API.";

    // Simulate partial updates
    if (onPartial) {
      const words = mockTranscript.split(" ");
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        onPartial(words.slice(0, i + 1).join(" "));
      }
    }

    console.log("[Mock] Transcription completed");
    return mockTranscript;
  }

  stopTranscription(): void {
    console.log("[Mock] Transcription stopped");
  }
}