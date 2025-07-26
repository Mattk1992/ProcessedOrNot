import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface VoiceSearchButtonProps {
  onVoiceResult: (transcript: string) => void;
  disabled?: boolean;
}

export function VoiceSearchButton({ onVoiceResult, disabled }: VoiceSearchButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });

      // Create MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Process the recorded audio
        await processAudio();
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "Voice Recording Started",
        description: "Speak the product name you want to search for...",
      });

      // Auto-stop recording after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 10000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async () => {
    setIsProcessing(true);
    
    try {
      // Create audio blob from recorded chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
      
      // Create FormData to send to backend
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Send to backend for Assembly AI processing
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.transcript && result.transcript.trim()) {
        // Success - pass transcript to parent component
        onVoiceResult(result.transcript.trim());
        
        toast({
          title: "Voice Search Complete",
          description: `Searching for: "${result.transcript}"`,
        });
      } else {
        toast({
          title: "No Speech Detected",
          description: "Please try again and speak clearly.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Voice Processing Error",
        description: "Failed to process voice recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`h-10 w-10 p-0 ${
        isRecording 
          ? "bg-red-500 hover:bg-red-600 animate-pulse" 
          : "hover:bg-primary/10"
      }`}
      title={isRecording ? "Stop recording" : "Voice search"}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}