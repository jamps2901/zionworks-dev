import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Users, Clock, AlertCircle, Pin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProjectMessagesProps {
  projectId: string;
  clientId: string;
  clientName: string;
}

interface Message {
  id: string;
  sender_id: string;
  sender_type: string;
  sender_name: string;
  message_text: string;
  stage_context: string;
  is_important: boolean;
  created_at: string;
}

const ProjectMessages = ({ projectId, clientId, clientName }: ProjectMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`messages-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_messages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      // Load real messages only
      const { data, error } = await supabase
        .rpc('get_project_messages', { p_project_id: projectId });

      if (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive"
      });
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    const messageText = newMessage.trim();
    
    // Optimistically add the message to the UI
    const tempMessage: Message = {
      id: Date.now().toString(),
      message_text: messageText,
      sender_id: clientId,
      sender_name: clientName,
      sender_type: 'client',
      stage_context: null,
      is_important: false,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      // Send real message to database
      const { error } = await supabase
        .rpc('insert_project_message', {
          p_project_id: projectId,
          p_sender_id: clientId,
          p_sender_name: clientName,
          p_message_text: messageText,
          p_sender_type: 'client'
        });


      if (error) {
        console.error('Error sending message:', error);
        // Remove the optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        setNewMessage(messageText);
        toast({
          title: "Error",
          description: "Failed to send message.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Message Sent",
          description: "Your message has been sent to the project team.",
        });
        // Refresh to avoid optimistic duplicate
        await loadMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessage(messageText);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getStageLabel = (stage: string) => {
    const stageLabels: Record<string, string> = {
      'initial_brief': 'Initial Brief',
      'scope_agreement': 'Scope Agreement',
      'design_phase': 'Design Phase',
      'development': 'Development',
      'testing_uat': 'Testing & UAT',
      'go_live': 'Go Live',
      'post_support': 'Post-Launch Support'
    };
    return stageLabels[stage] || stage;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Messages Container */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Project Communication
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
                <p className="text-muted-foreground">
                  Start a conversation with your project team!
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${
                    message.sender_type === 'client' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className={`max-w-[80%] ${
                    message.sender_type === 'client' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  } rounded-lg p-3 space-y-2`}>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {message.sender_type === 'client' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Users className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                          {message.sender_name}
                        </span>
                      </div>
                      {message.is_important && (
                        <Pin className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    
                    {message.stage_context && (
                      <Badge variant="outline" className="text-xs">
                        {getStageLabel(message.stage_context)}
                      </Badge>
                    )}
                    
                    <p className="text-sm whitespace-pre-wrap">
                      {message.message_text}
                    </p>
                    
                    <div className="flex items-center gap-1 text-xs opacity-70">
                      <Clock className="h-3 w-3" />
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Textarea
              placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[100px] resize-none"
              disabled={isSending}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                Messages are monitored during business hours (9 AM - 6 PM EST)
              </div>
              <Button 
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isSending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectMessages;