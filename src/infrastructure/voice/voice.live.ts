/**
 * Infrastructure: Live Voice Service
 * 
 * Real implementation using MediaRecorder and Web Speech API.
 */

import { VoiceService, RecordingResult } from "./voice.interface";

export class LiveVoiceService implements VoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private recognition: any = null; // SpeechRecognition
  private startTime: number = 0;
  private fullTranscript: string = "";

  isSupported(): boolean {
    const hasMediaRecorder = typeof MediaRecorder !== "undefined";
    const hasSpeechRecognition = 
      typeof window !== "undefined" &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    
    return hasMediaRecorder && hasSpeechRecognition;
  }

  async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    try {
      if (!navigator.permissions) {
        return 'prompt'; // Permissions API not available, assume we need to prompt
      }

      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state as 'granted' | 'denied' | 'prompt';
    } catch (error) {
      // Some browsers don't support querying microphone permission
      console.warn('Permission query not supported:', error);
      return 'prompt';
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      // Request microphone access and immediately release it
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error: any) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async startRecording(): Promise<void> {
    try {
      // Request microphone permission
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.startTime = Date.now();

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms

      // Also start speech recognition for live transcription
      this.startSpeechRecognition();
    } catch (error: any) {
      console.error("Failed to start recording:", error);
      
      // Provide user-friendly error messages
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        throw new Error("Microphone permission denied. Please allow microphone access in your browser settings.");
      } else if (error.name === "NotFoundError") {
        throw new Error("No microphone found. Please connect a microphone and try again.");
      } else if (error.name === "NotReadableError") {
        throw new Error("Microphone is already in use by another application.");
      } else if (error.name === "SecurityError") {
        throw new Error("Microphone access blocked. Please use HTTPS or check browser settings.");
      } else {
        throw new Error("Failed to access microphone: " + (error.message || "Unknown error"));
      }
    }
  }

  async stopRecording(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("No recording in progress"));
        return;
      }

      // IMMEDIATELY stop speech recognition to prevent continued listening
      if (this.recognition) {
        this.recognition.stop();
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { 
          type: this.mediaRecorder?.mimeType || 'audio/webm' 
        });
        const url = URL.createObjectURL(blob);
        const duration = (Date.now() - this.startTime) / 1000;

        // Stop all tracks
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }

        resolve({ blob, url, duration });
      };

      this.mediaRecorder.stop();
    });
  }

  cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.recognition) {
      this.recognition.stop();
    }

    this.audioChunks = [];
  }

  isRecording(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === "recording";
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  private startSpeechRecognition(): void {
    if (typeof window === "undefined") return;

    const SpeechRecognition = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.lang = "en-US";
    this.recognition.interimResults = true;
    this.recognition.continuous = true;
    this.recognition.maxAlternatives = 1;

    this.fullTranscript = "";

    this.recognition.start();
  }

  async transcribe(onPartial?: (text: string) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        // If recognition wasn't started, try to start it now
        if (typeof window === "undefined") {
          reject(new Error("Speech recognition not available"));
          return;
        }

        const SpeechRecognition = 
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
          reject(new Error("Speech recognition not supported"));
          return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = "en-US";
        this.recognition.interimResults = true;
        this.recognition.continuous = false;
        this.recognition.maxAlternatives = 1;

        this.fullTranscript = "";
      }

      this.recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + " ";
          } else {
            interim += transcript;
          }
        }

        if (final) {
          this.fullTranscript += final;
        }

        // Call the partial callback with interim results
        if (onPartial) {
          onPartial(this.fullTranscript + interim);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "no-speech") {
          resolve(this.fullTranscript.trim() || "");
        } else {
          reject(new Error(`Speech recognition error: ${event.error}`));
        }
      };

      this.recognition.onend = () => {
        resolve(this.fullTranscript.trim());
      };
    });
  }

  stopTranscription(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }
}