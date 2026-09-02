import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WidgetConfig {
  business_name: string;
  bot_display_name: string;
  primary_color: string;
  welcome_message: string;
  is_active: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

// Embeddable AI chat widget: a third-party business drops an <iframe> pointing
// at zionworks.dev/w/<slug> onto their own site (Wix, Squarespace, anything).
// Deliberately self-contained -- no dependency on the parent Navigation/App
// chrome, since this document is meant to be loaded inside someone else's page.
const WidgetEmbed = () => {
  const { slug } = useParams<{ slug: string }>();
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'not-found'>('loading');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;

    supabase
      .rpc('get_widget_public_config', { p_slug: slug })
      .then(({ data, error }) => {
        const row = Array.isArray(data) ? data[0] : data;
        if (error || !row || !row.is_active) {
          setLoadState('not-found');
          return;
        }
        setConfig(row as WidgetConfig);
        setMessages([{ id: 'welcome', role: 'assistant', text: row.welcome_message }]);
        setLoadState('ready');
      });
  }, [slug]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isSending || !slug) return;

    const userMessage: Message = { id: `${Date.now()}-u`, role: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: text, clientSlug: slug },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-a`, role: 'assistant', text: data?.message || "Sorry, I couldn't process that." },
      ]);
    } catch (err) {
      console.error('Widget chat error:', err);
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-e`, role: 'assistant', text: "Something went wrong -- please try again in a moment." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (loadState === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (loadState === 'not-found' || !config) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white text-gray-500 text-sm px-6 text-center">
        This widget isn't available right now.
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-white font-sans">
      {/* Header */}
      <div
        className="flex items-center px-4 py-3 text-white flex-shrink-0"
        style={{ backgroundColor: config.primary_color }}
      >
        <div className="w-2 h-2 rounded-full bg-white/80 mr-2 animate-pulse" />
        <span className="font-medium text-sm">{config.bot_display_name}</span>
        <span className="ml-auto text-xs opacity-75">{config.business_name}</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
              style={m.role === 'user' ? { backgroundColor: config.primary_color } : undefined}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-gray-200 p-2 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          disabled={isSending}
          className="flex-1 rounded-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
        <button
          onClick={sendMessage}
          disabled={isSending || !input.trim()}
          className="flex items-center justify-center w-9 h-9 rounded-full text-white flex-shrink-0 disabled:opacity-40"
          style={{ backgroundColor: config.primary_color }}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default WidgetEmbed;
