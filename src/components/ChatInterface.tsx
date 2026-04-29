import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2, Calendar, FileText, Search } from 'lucide-react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  nextStep: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isTyping, onSendMessage, nextStep }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      onSendMessage(input);
      setInput('');
    }
  };

  const quickActions = [
    { label: "Получить аудит", icon: Search },
    { label: "Назначить встречу", icon: Calendar },
    { label: "Запросить КП", icon: FileText },
  ];

  return (
    <div className="h-full flex flex-col bg-brand-light/30 rounded-3xl overflow-hidden border border-brand-light">
      <div className="p-4 bg-white border-bottom border-brand-light flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-deep flex items-center justify-center text-white">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-brand-deep">ИИ-Продажник</h3>
            <p className="text-[10px] text-brand-accent font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
              {nextStep || "Консультация"}
            </p>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-brand-deep text-white' : 'bg-brand-light text-brand-deep'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-brand-light text-brand-deep flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="chat-bubble-ai flex items-center gap-1 py-3 px-4">
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-brand-deep rounded-full" />
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-brand-deep rounded-full" />
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-brand-deep rounded-full" />
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-brand-light">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(action.label)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border border-brand-light text-xs font-bold text-brand-deep hover:bg-brand-light transition-colors"
            >
              <action.icon size={14} />
              {action.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Введите ваше сообщение..."
            className="w-full bg-brand-light/50 border border-brand-light rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-brand-deep/20 focus:border-brand-deep transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 bottom-2 w-10 bg-brand-deep text-white rounded-xl flex items-center justify-center hover:bg-brand-deep/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};
