import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Loader2, User, Bot, Users, Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceInterface from './VoiceInterface';
import { VoiceRecorder } from '@/utils/RealtimeAudio';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLiveChat?: boolean;
  senderName?: string;
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

type ChatMode = 'ai' | 'live';

const ChatBot = ({ isOpen, onToggle }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "G'day mate! 🤖 I'm Matey, your AI assistant from Zion Works. I can instantly answer questions about our services, provide quotes, or you can switch to live chat to speak with our team. For a more natural experience, try voice chat! How can I help you today?",
      isUser: false,
      timestamp: new Date(),
      senderName: 'Matey'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('ai');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [isConnectedToLive, setIsConnectedToLive] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceRecorder, setVoiceRecorder] = useState<VoiceRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for real-time chat messages when in live mode
  useEffect(() => {
    if (!sessionId || chatMode !== 'live' || !isConnectedToLive) return;

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const newMessage = payload.new as any;
          if (newMessage.sender_type === 'admin') {
            const adminMessage: Message = {
              id: newMessage.id,
              text: newMessage.message_text,
              isUser: false,
              timestamp: new Date(newMessage.created_at),
              isLiveChat: true,
              senderName: newMessage.sender_name
            };
            setMessages(prev => [...prev, adminMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, chatMode, isConnectedToLive]);

  const startLiveChat = async () => {
    if (!customerName || !customerEmail) {
      setShowContactForm(true);
      return;
    }

    try {
      // Generate session id client-side to avoid SELECT on restricted table
      const newSessionId = crypto.randomUUID();

      // Create the session via Edge Function (uses service role, safe with RLS)
      const { error } = await supabase.functions.invoke('live-chat-start', {
        body: { id: newSessionId, name: customerName, email: customerEmail }
      });

      if (error) throw error;

      setSessionId(newSessionId);
      setIsConnectedToLive(true);

      const liveChatMessage: Message = {
        id: Date.now().toString(),
        text: "🔗 You're now connected to live chat! An agent from Zion Works will respond shortly. Feel free to ask any questions about our services.",
        isUser: false,
        timestamp: new Date(),
        isLiveChat: true,
        senderName: 'System'
      };

      setMessages(prev => [...prev, liveChatMessage]);
      setChatMode('live');
      setShowContactForm(false);
    } catch (error) {
      console.error('Error starting live chat:', error);
      setShowContactForm(true);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'We could not connect you to live chat right now. Please try again in a moment or contact us at contactus@zionworks.dev.',
        isUser: false,
        timestamp: new Date(),
        senderName: 'System'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleModeSwitch = (mode: ChatMode) => {
    setChatMode(mode);
    
    if (mode === 'ai') {
      // Reset live chat state when switching to AI
      setIsConnectedToLive(false);
      setSessionId(null);
      setShowContactForm(false);
      // Add system message about switching to AI
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: "🤖 You're now chatting with Matey AI! I can help you learn about Zion Works' services and answer your questions instantly.",
        isUser: false,
        timestamp: new Date(),
        senderName: 'Matey'
      };
      setMessages(prev => [...prev, aiMessage]);
    } else if (mode === 'live') {
      // Check if we need contact info for live chat
      if (!isConnectedToLive) {
        if (!customerName || !customerEmail) {
          setShowContactForm(true);
        } else {
          startLiveChat();
        }
      }
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
      isLiveChat: chatMode === 'live',
      senderName: chatMode === 'live' ? customerName : 'You'
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputMessage;
    setInputMessage('');
    // Handle live chat mode
    if (chatMode === 'live') {
      if (!isConnectedToLive || !sessionId) {
        // If not connected to live chat, prompt user to connect
        const systemMessage: Message = {
          id: Date.now().toString(),
          text: "Please connect to live chat first by providing your contact information.",
          isUser: false,
          timestamp: new Date(),
          senderName: 'System'
        };
        setMessages(prev => [...prev, systemMessage]);
        setShowContactForm(true);
        return;
      }
      
      try {
        await supabase.functions.invoke('live-chat-message', {
          body: {
            sessionId,
            text: messageText,
            senderName: customerName
          }
        });
        return;
      } catch (error) {
        console.error('Error sending live chat message:', error);
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: "Failed to send message. Please check your connection and try again.",
          isUser: false,
          timestamp: new Date(),
          senderName: 'System'
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }
    }

    // Handle AI chat mode
    handleAIResponse(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleContactSubmit = () => {
    if (customerName && customerEmail) {
      setShowContactForm(false);
      startLiveChat();
    }
  };

  // Voice recording functions
  const startVoiceRecording = async () => {
    try {
      const recorder = new VoiceRecorder();
      setVoiceRecorder(recorder);
      await recorder.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting voice recording:', error);
    }
  };

  const stopVoiceRecording = async () => {
    if (!voiceRecorder) return;

    try {
      setIsRecording(false);
      const audioBase64 = await voiceRecorder.stopRecording();
      
      // Convert audio to text
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: audioBase64 }
      });

      if (transcriptionError) {
        throw transcriptionError;
      }

      if (transcriptionData.text) {
        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          text: transcriptionData.text,
          isUser: true,
          timestamp: new Date(),
          senderName: 'You'
        };
        setMessages(prev => [...prev, userMessage]);

        // Get AI response
        handleAIResponse(transcriptionData.text);
      }
    } catch (error) {
      console.error('Error processing voice recording:', error);
      setIsRecording(false);
    }
  };

  const handleAIResponse = async (messageText: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: messageText }
      });

      if (error) {
        throw error;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message || "I'm sorry, I couldn't process that request. Please try again.",
        isUser: false,
        timestamp: new Date(),
        senderName: 'Matey'
      };

      setMessages(prev => [...prev, aiMessage]);

      // Convert AI response to speech if voice mode is on
      if (isVoiceMode && aiMessage.text) {
        try {
          const { data: speechData, error: speechError } = await supabase.functions.invoke('text-to-speech', {
            body: { text: aiMessage.text, voice: 'alloy' }
          });

          if (!speechError && speechData.audioContent) {
            // Play the audio
            const audio = new Audio(`data:audio/mp3;base64,${speechData.audioContent}`);
            audio.play().catch(console.error);
          }
        } catch (speechError) {
          console.error('Error converting to speech:', speechError);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try contacting us directly at contactus@zionworks.dev or +64223536095.",
        isUser: false,
        timestamp: new Date(),
        senderName: 'Matey'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.320, 1] }}
          className="fixed bottom-24 right-8 w-96 h-[500px] bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl shadow-primary/10 z-50 flex flex-col overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)/0.9) 100%)'
          }}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-6 flex items-center justify-between overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20" />
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary-foreground/20 rounded-full blur-lg animate-pulse" 
                 style={{ animationDelay: '1s' }} />
            
            <div className="flex items-center space-x-4 relative z-10">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(var(--secondary-rgb), 0.3)",
                    "0 0 30px rgba(var(--secondary-rgb), 0.5)",
                    "0 0 20px rgba(var(--secondary-rgb), 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <img src="/favicon.png" alt="Zion Works" className="w-8 h-8 object-contain" />
              </motion.div>
              <div>
                <h3 className="font-bold text-lg">
                  {chatMode === 'ai' ? 'Matey' : 'Live Chat'}
                </h3>
                <p className="text-sm text-primary-foreground/80 font-medium">
                  {chatMode === 'ai' ? 'AI Assistant' : isConnectedToLive ? 'Connected to Agent' : 'Human Support'} • Zion Works
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Mode Toggle */}
              <div className="flex bg-primary-foreground/20 rounded-xl p-1 relative z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleModeSwitch('ai');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer relative z-20 ${
                    chatMode === 'ai' 
                      ? 'bg-primary-foreground text-primary shadow-sm' 
                      : 'text-primary-foreground/70 hover:text-primary-foreground'
                  }`}
                >
                  <Bot className="w-3 h-3 mr-1 inline" />
                  AI
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleModeSwitch('live');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer relative z-20 ${
                    chatMode === 'live' 
                      ? 'bg-primary-foreground text-primary shadow-sm' 
                      : 'text-primary-foreground/70 hover:text-primary-foreground'
                  }`}
                >
                  <Users className="w-3 h-3 mr-1 inline" />
                  Live
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="text-primary-foreground hover:bg-primary-foreground/20 relative z-10 rounded-xl transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Contact Form Modal */}
          {showContactForm && (
            <div className="absolute inset-0 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl z-10 p-6 flex flex-col rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl text-primary">Connect to Live Chat</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowContactForm(false)}
                  className="text-muted-foreground hover:bg-muted/20 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Name *
                  </label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className="rounded-2xl border-border/50 bg-background/50 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="rounded-2xl border-border/50 bg-background/50 backdrop-blur-sm"
                  />
                </div>
                <div className="bg-muted/20 rounded-2xl p-4 backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground">
                    💡 Connect with our team for personalized assistance with your project needs.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleContactSubmit}
                disabled={!customerName.trim() || !customerEmail.trim()}
                className="w-full mt-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-2xl py-3 shadow-lg"
              >
                <Users className="w-4 h-4 mr-2" />
                Start Live Chat
              </Button>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-transparent to-muted/10">
            <div className="space-y-6">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    ease: [0.23, 1, 0.320, 1],
                    delay: 0.1 
                  }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`max-w-[85%] p-4 rounded-3xl backdrop-blur-sm border transition-all duration-300 ${
                      message.isUser
                        ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-primary/20 shadow-lg shadow-primary/20'
                        : message.isLiveChat
                        ? 'bg-gradient-to-br from-green-500/10 to-green-500/5 text-foreground border-green-500/20 shadow-lg shadow-green-500/10'
                        : 'bg-gradient-to-br from-muted/50 to-muted/30 text-foreground border-border/30 shadow-lg'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.text}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className={`text-xs font-medium ${
                        message.isUser 
                          ? 'text-primary-foreground/70' 
                          : message.isLiveChat
                          ? 'text-green-600'
                          : 'text-muted-foreground'
                      }`}>
                        {message.senderName || (message.isUser ? 'You' : 'Matey')}
                        {message.isLiveChat && !message.isUser && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-600">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                            Live
                          </span>
                        )}
                      </p>
                      <p className={`text-xs ${
                        message.isUser 
                          ? 'text-primary-foreground/60' 
                          : message.isLiveChat 
                          ? 'text-green-600/60'
                          : 'text-muted-foreground/60'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gradient-to-br from-muted/60 to-muted/40 backdrop-blur-sm border border-border/30 p-4 rounded-3xl shadow-lg">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-5 h-5 text-primary" />
                      </motion.div>
                      <span className="text-sm font-medium text-foreground">
                        {chatMode === 'ai' ? 'Matey is thinking...' : 'Agent is typing...'}
                      </span>
                    </div>
                    <div className="flex space-x-1 mt-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-primary/60 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ 
                            duration: 1, 
                            repeat: Infinity, 
                            delay: i * 0.2 
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border/30 bg-gradient-to-r from-card/50 to-card backdrop-blur-sm p-6">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={chatMode === 'ai' ? "Ask Matey anything about Zion Works..." : "Type your message to our team..."}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm border-border/50 rounded-2xl py-3 px-4 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
                {inputMessage && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"
                  />
                )}
              </div>
              
              {/* Voice Recording Button */}
              {chatMode === 'ai' && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    disabled={isLoading}
                    size="sm"
                    className={`rounded-2xl px-4 py-3 shadow-lg transition-all duration-300 ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </motion.div>
              )}
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-lg shadow-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
            
            {/* Voice Mode Indicator */}
            {isVoiceMode && chatMode === 'ai' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center justify-center"
              >
                <div className="bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600 font-medium">Voice responses enabled</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatBot;