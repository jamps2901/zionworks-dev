import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceInterfaceProps {
  onSpeakingChange: (speaking: boolean) => void;
  onMessage: (message: string) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onSpeakingChange, onMessage }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('🎙️ Voice event:', event);
    
    // Handle different event types
    if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
      onSpeakingChange(true);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
      onSpeakingChange(false);
    } else if (event.type === 'response.audio_transcript.delta') {
      // Handle partial transcripts
      if (event.delta) {
        onMessage(event.delta);
      }
    } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
      // Handle user speech transcription
      if (event.transcript) {
        onMessage(`You: ${event.transcript}`);
      }
    }
  };

  const startConversation = async () => {
    setIsConnecting(true);
    try {
      console.log('🎙️ Starting voice conversation...');
      
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('🎤 Microphone permission granted');
      
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      setIsConnected(true);
      
      toast({
        title: "🎙️ Voice Chat Connected",
        description: "You can now speak directly with Matey!",
      });
    } catch (error) {
      console.error('❌ Error starting voice conversation:', error);
      toast({
        title: "Voice Chat Error",
        description: error instanceof Error ? error.message : 'Failed to start voice conversation. Please check your microphone permissions and try again.',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    onSpeakingChange(false);
    
    toast({
      title: "Voice Chat Ended",
      description: "Voice conversation has been disconnected",
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  // Mock audio level animation when speaking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSpeaking) {
      interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
    } else {
      setAudioLevel(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpeaking]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-50">
      <AnimatePresence>
        {(isConnected || isConnecting) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center gap-2"
          >
            {/* Audio Visualizer */}
            <div className="flex items-center gap-1 h-8">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-primary rounded-full"
                  animate={{
                    height: isSpeaking 
                      ? Math.max(8, audioLevel * 0.3 + Math.random() * 20)
                      : 8,
                  }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>
            
            {/* Status Indicator */}
            <div className="text-xs text-center text-muted-foreground">
              {isConnecting ? (
                <span className="animate-pulse">🔄 Connecting...</span>
              ) : isSpeaking ? (
                <span className="text-primary">🎙️ Matey is speaking...</span>
              ) : isConnected ? (
                <span className="text-green-600">🎤 Listening...</span>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Control Button */}
      {!isConnected ? (
        <Button 
          onClick={startConversation}
          disabled={isConnecting}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-full w-16 h-16 p-0"
        >
          {isConnecting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Mic className="w-6 h-6" />
            </motion.div>
          ) : (
            <Phone className="w-6 h-6" />
          )}
        </Button>
      ) : (
        <Button 
          onClick={endConversation}
          variant="destructive"
          className="rounded-full w-16 h-16 p-0 shadow-lg"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      )}
      
      {/* Helper Text */}
      {!isConnected && !isConnecting && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground text-center max-w-xs"
        >
          Click to start voice chat with Matey
        </motion.p>
      )}
    </div>
  );
};

export default VoiceInterface;