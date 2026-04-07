/**
 * Component: DynamicWaveform
 * 
 * Real-time waveform visualization that reacts to audio input levels
 * and animates right-to-left to show recording progression.
 * Similar to WhatsApp voice recording UI.
 */

import { useEffect, useRef, useState } from "react";

const __DEV_LOG__ = false;
const devError = __DEV_LOG__ ? (label: string, data?: any) => console.error(label, data) : (() => {}) as (label: string, data?: any) => void;

interface DynamicWaveformProps {
  stream: MediaStream | null;
  isRecording: boolean;
  className?: string;
}

export function DynamicWaveform({ stream, isRecording, className = "" }: DynamicWaveformProps) {
  const [barHeights, setBarHeights] = useState<number[]>(Array(40).fill(0.1));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const barIndexRef = useRef(0);

  useEffect(() => {
    if (!stream || !isRecording) {
      // Clean up when not recording
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      setBarHeights(Array(40).fill(0.1));
      barIndexRef.current = 0;
      return;
    }

    // Set up Web Audio API for real-time audio analysis
    const setupAudioAnalysis = async () => {
      try {
        // Create audio context and analyser
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256; // Lower value = faster response
        analyserRef.current.smoothingTimeConstant = 0.4; // Smooth out variations

        // Connect stream to analyser
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        // Start visualizing
        visualize();
      } catch (error) {
        devError("Failed to setup audio analysis:", error);
      }
    };

    const visualize = () => {
      if (!analyserRef.current || !isRecording) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateWaveform = () => {
        if (!analyserRef.current || !isRecording) return;

        // Get frequency data
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume from frequency data
        // Focus on speech frequencies (roughly 85-255 Hz for fundamental, and harmonics up to 8kHz)
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        
        // Normalize to 0-1 range with some amplification for better visibility
        const normalizedVolume = Math.min(1, (average / 255) * 2.5);
        
        // Apply logarithmic scaling for more natural appearance
        const scaledVolume = Math.pow(normalizedVolume, 0.7);
        
        // Add minimum height so bars are always visible
        const heightValue = Math.max(0.08, scaledVolume);

        // Update bar heights array - shift left and add new value on right
        setBarHeights(prev => {
          const newHeights = [...prev];
          // Shift all bars to the left
          for (let i = 0; i < newHeights.length - 1; i++) {
            newHeights[i] = newHeights[i + 1];
          }
          // Add new height on the right
          newHeights[newHeights.length - 1] = heightValue;
          return newHeights;
        });

        barIndexRef.current++;
        
        // Continue animation
        animationFrameRef.current = requestAnimationFrame(updateWaveform);
      };

      updateWaveform();
    };

    setupAudioAnalysis();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stream, isRecording]);

  return (
    <div className={`flex items-center gap-[3px] h-10 ${className}`}>
      {barHeights.map((height, index) => (
        <div
          key={index}
          className="w-[3px] bg-blue-500 rounded-full transition-all duration-75 ease-out"
          style={{
            height: `${height * 100}%`,
            minHeight: '4px',
            maxHeight: '100%',
          }}
        />
      ))}
    </div>
  );
}