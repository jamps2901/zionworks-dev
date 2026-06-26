import { useState, useEffect } from 'react';
import { Send, MessageCircle, User, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface ChatSession {
  id: string;
  customer_name: string;
  customer_email: string;
  status: 'active' | 'closed' | 'waiting_for_admin';
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  session_id: string;
  message_text: string;
  sender_type: 'customer' | 'admin' | 'ai';
  sender_name: string;
  created_at: string;
}

const LiveChatManager = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load chat sessions
  useEffect(() => {
    loadSessions();
    
    // Subscribe to new sessions
    const sessionChannel = supabase
      .channel('chat-sessions-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions'
        },
        () => {
          loadSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
    };
  }, []);

  // Load messages for selected session
  useEffect(() => {
    if (!selectedSession) return;

    loadMessages(selectedSession.id);

    // Subscribe to new messages for this session
    const messageChannel = supabase
      .channel(`chat-messages-${selectedSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${selectedSession.id}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [selectedSession]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions((data || []) as ChatSession[]);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as ChatMessage[]);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession || isLoading) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: selectedSession.id,
          message_text: newMessage,
          sender_type: 'admin',
          sender_name: 'Zion Works Team'
        });

      if (error) throw error;

      // Update session status to active
      await supabase
        .from('chat_sessions')
        .update({ status: 'active' })
        .eq('id', selectedSession.id);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ status: 'closed' })
        .eq('id', sessionId);

      if (error) throw error;
      
      // Refresh sessions
      loadSessions();
      
      // If this was the selected session, clear it
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error closing session:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting_for_admin':
        return <Badge variant="destructive">Waiting</Badge>;
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex h-[600px] bg-card rounded-lg border border-border overflow-hidden">
      {/* Sessions List */}
      <div className="w-1/3 border-r border-border">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-primary flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Live Chat Sessions
          </h3>
        </div>
        
        <ScrollArea className="h-[calc(600px-73px)]">
          <div className="p-2">
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 mb-2 rounded-lg cursor-pointer border transition-colors ${
                  selectedSession?.id === session.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-muted/50 border-border hover:bg-muted'
                }`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-primary">
                    {session.customer_name}
                  </span>
                  {getStatusBadge(session.status)}
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {session.customer_email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(session.created_at)}
                </p>
              </motion.div>
            ))}
            
            {sessions.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No chat sessions yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {selectedSession ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-primary flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {selectedSession.customer_name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedSession.customer_email}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(selectedSession.status)}
                {selectedSession.status !== 'closed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => closeSession(selectedSession.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Close
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      message.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.sender_type === 'admin'
                          ? 'bg-primary text-primary-foreground'
                          : message.sender_type === 'ai'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.message_text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_type === 'admin'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground/70'
                      }`}>
                        {message.sender_name} • {formatTime(message.created_at)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            {selectedSession.status !== 'closed' && (
              <div className="border-t border-border p-4">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    size="sm"
                    className="px-3"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Select a chat session</p>
              <p className="text-sm">Choose a session from the left to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveChatManager;