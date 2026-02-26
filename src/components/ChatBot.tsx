import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithGemini } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ChatBotProps {
  theme: 'light' | 'dark';
  projectContext?: any;
}

export const ChatBot: React.FC<ChatBotProps> = ({ theme, projectContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('guide-chat-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('guide-chat-history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      // Focus the input when the chat opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithGemini(input, messages, projectContext);
      const modelMessage: Message = { role: 'model', parts: [{ text: response }] };
      setMessages(prev => [...prev, modelMessage]);
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = { role: 'model', parts: [{ text: 'Sorry, I encountered an error. Please try again.' }] };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            role="dialog"
            aria-label="Guide Assistant Chat"
            aria-modal="true"
            className={`mb-4 w-80 sm:w-96 h-[500px] border border-[#141414] rounded-sm shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex flex-col overflow-hidden ${
              theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b border-[#141414] flex items-center justify-between ${
              theme === 'dark' ? 'bg-white text-black' : 'bg-[#141414] text-[#E4E3E0]'
            }`}>
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <h3 className="font-bold uppercase text-xs tracking-widest">Guide Assistant</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:opacity-70 transition-opacity"
                aria-label="Close Chat"
                data-testid="chatbot-close-button"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-2">
                  <Bot size={40} />
                  <p className="text-xs font-mono">Ask me anything about your documentation or build plan.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-sm text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? (theme === 'dark' ? 'bg-white text-black' : 'bg-[#141414] text-[#E4E3E0]')
                      : (theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/5')
                  }`}>
                    <div className="flex items-center gap-2 mb-1 opacity-50 uppercase text-[9px] font-bold">
                      {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                      {msg.role === 'user' ? 'You' : 'Assistant'}
                    </div>
                    {msg.parts[0].text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className={`p-3 rounded-sm flex items-center gap-2 text-xs opacity-50 ${
                    theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/5'
                  }`}>
                    <Loader2 size={14} className="animate-spin" />
                    Thinking...
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-4 border-t border-[#141414] ${theme === 'dark' ? 'bg-black/20' : 'bg-black/5'}`}>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your question..."
                  aria-label="Chat input"
                  data-testid="chatbot-input"
                  className={`flex-1 bg-transparent border border-[#141414] rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#141414] ${
                    theme === 'dark' ? 'text-white placeholder-white/30' : 'text-black placeholder-black/30'
                  }`}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                  data-testid="chatbot-send-button"
                  className={`p-2 rounded-sm transition-all disabled:opacity-30 ${
                    theme === 'dark' ? 'bg-white text-black hover:bg-white/90' : 'bg-[#141414] text-[#E4E3E0] hover:bg-[#2a2a2a]'
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={toggleRef}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close Chat Assistant" : "Open Chat Assistant"}
        aria-expanded={isOpen}
        data-testid="chatbot-toggle-button"
        className={`relative p-4 rounded-full shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] border border-[#141414] transition-colors ${
          isOpen 
            ? (theme === 'dark' ? 'bg-white text-black' : 'bg-[#141414] text-[#E4E3E0]')
            : (theme === 'dark' ? 'bg-white text-black' : 'bg-[#141414] text-[#E4E3E0]')
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </motion.button>
    </div>
  );
};
