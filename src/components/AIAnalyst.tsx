import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Trash2, Pin, PinOff, Copy, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { View } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAnalystProps {
  currentView: View;
  contextData: any;
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ currentView, contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: {
            view: currentView,
            data: contextData,
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Ошибка связи с аналитиком. Попробуйте еще раз." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = {
    dashboard: ["Что требует внимания?", "Разбери воронку", "Прогноз выручки"],
    clients: ["Подготовь к встрече", "Какие процессы предложить", "Оцени потенциал"],
    audits: ["Объясни балл", "Что оспорить", "Составь резюме"],
  }[currentView as keyof typeof quickActions] || ["Проанализируй текущий экран", "Дай совет по проекту"];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 group"
        >
          <Sparkles className="w-6 h-6" />
          <span className="absolute right-full mr-4 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI-аналитик
          </span>
        </button>
      )}

      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className={cn(
              "fixed top-0 right-0 h-screen bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl z-50 flex flex-col transition-all",
              isPinned ? "w-[420px]" : "w-[420px]"
            )}
          >
            <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--border)] shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <h3 className="font-bold">AI-аналитик</h3>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsPinned(!isPinned)}
                  className="p-1.5 rounded-lg hover:bg-[var(--background)] text-[var(--text-secondary)]"
                >
                  {isPinned ? <PinOff size={18} /> : <Pin size={18} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--background)] text-[var(--text-secondary)]"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="text-center py-12 space-y-4">
                  <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto">
                    <Sparkles size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold">Чем я могу помочь?</p>
                    <p className="text-xs text-[var(--text-secondary)]">Я вижу контекст раздела "{currentView}"</p>
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex flex-col gap-1 max-w-[85%]",
                  m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}>
                  <div className={cn(
                    "px-4 py-2 rounded-2xl text-sm leading-relaxed",
                    m.role === 'user' 
                      ? "bg-accent text-white rounded-tr-none" 
                      : "bg-[var(--background)] text-[var(--text-primary)] border border-[var(--border)] rounded-tl-none"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-1 items-center px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-2xl rounded-tl-none w-16">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            <div className="p-5 border-t border-[var(--border)] space-y-4 shrink-0">
              <div className="flex flex-wrap gap-2">
                {quickActions.map(action => (
                  <button
                    key={action}
                    onClick={() => setInput(action)}
                    className="text-[10px] font-medium px-2.5 py-1 bg-[var(--background)] border border-[var(--border)] rounded-full hover:border-accent hover:text-accent transition-all"
                  >
                    {action}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Задайте вопрос аналитику..."
                  className="w-full pl-4 pr-12 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent text-white rounded-lg disabled:opacity-50 transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
