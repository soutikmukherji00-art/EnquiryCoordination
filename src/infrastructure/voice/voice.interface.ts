/**
 * Infrastructure: Voice Service Interface
 * 
 * Handles audio recording and speech-to-text transcription.
 */

export interface RecordingResult {
  blob: Blob;
  url: string;
  duration: number;
}

export interface VoiceService {
  /**
   * Check if voice recording is supported in the current browser
   */
  isSupported(): boolean;

  /**
   * Check microphone permission status
   */
  checkPermission(): Promise<'granted' | 'denied' | 'prompt'>;

  /**
   * Request microphone permission explicitly
   */
  requestPermission(): Promise<boolean>;

  /**
   * Start recording audio from microphone
   */
  startRecording(): Promise<void>;

  /**
   * Stop recording and return the audio blob
   */
  stopRecording(): Promise<RecordingResult>;

  /**
   * Cancel the current recording
   */
  cancelRecording(): void;

  /**
   * Check if currently recording
   */
  isRecording(): boolean;

  /**
   * Get the current audio stream for visualization
   */
  getStream(): MediaStream | null;

  /**
   * Transcribe audio using Web Speech API
   * Returns a promise that resolves with the transcription text
   */
  transcribe(onPartial?: (text: string) => void): Promise<string>;

  /**
   * Stop transcription
   */
  stopTranscription(): void;
}