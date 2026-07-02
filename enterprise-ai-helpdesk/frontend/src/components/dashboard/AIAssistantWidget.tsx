import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, AlertTriangle, Shield, TrendingUp, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I am your AI Copilot. Ask me anything about tickets, SLA stats, or workload spikes.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (text?: string) => {
    const question = text || input.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      let answer = 'I processed your request, but I could not find matching documents. Can you elaborate?';
      const q = question.toLowerCase();
      if (q.includes('sla') || q.includes('breach')) {
        answer = 'Current SLA compliance is 97.2%. You have 2 critical tickets close to breaching SLA (TKT-1041 & TKT-1042).';
      } else if (q.includes('spike') || q.includes('trend') || q.includes('forecast')) {
        answer = 'AI pipeline predicts a +15% volume increase next week in Payment categories. Consider adding 1 agent to the shift.';
      } else if (q.includes('workload') || q.includes('agent') || q.includes('performance')) {
        answer = 'James L. has the lowest resolution time (2.8h). Emily R. has the highest load (15 tickets).';
      } else if (q.includes('hi') || q.includes('hello')) {
        answer = 'Hello! How can I assist you with ticket intelligence today?';
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="w-[calc(100vw-2rem)] sm:w-[360px] h-[450px] sm:h-[480px] rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-glass)] backdrop-blur-[var(--glass-blur)] shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border-primary)] flex items-center justify-between gradient-bg text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bot className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white leading-tight">AI Assistant</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] text-white/70">Online Copilot</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={cn('flex gap-2.5 items-start', msg.role === 'user' && 'flex-row-reverse')}>
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs text-white',
                    msg.role === 'user' ? 'bg-primary-600' : 'gradient-bg'
                  )}>
                    {msg.role === 'user' ? 'U' : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className={cn(
                    'max-w-[75%] rounded-2xl px-3 py-2 text-xs leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-tl-none'
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2.5 items-start">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs text-white gradient-bg">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl rounded-tl-none px-3 py-2">
                    <div className="flex gap-0.5">
                      <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 border-t border-[var(--border-primary)] flex flex-wrap gap-1.5 bg-[var(--bg-secondary)]/50">
                <button
                  onClick={() => handleSend('Check SLA breaches')}
                  className="px-2.5 py-1 rounded-full border border-[var(--border-primary)] text-[10px] text-[var(--text-secondary)] hover:text-primary-400 hover:border-primary-500/30 transition-all flex items-center gap-1"
                >
                  <Shield className="w-3 h-3 text-emerald-400" /> Check SLAs
                </button>
                <button
                  onClick={() => handleSend('Predict ticket spikes')}
                  className="px-2.5 py-1 rounded-full border border-[var(--border-primary)] text-[10px] text-[var(--text-secondary)] hover:text-primary-400 hover:border-primary-500/30 transition-all flex items-center gap-1"
                >
                  <TrendingUp className="w-3 h-3 text-amber-400" /> Predict Spikes
                </button>
                <button
                  onClick={() => handleSend('Show workload alerts')}
                  className="px-2.5 py-1 rounded-full border border-[var(--border-primary)] text-[10px] text-[var(--text-secondary)] hover:text-primary-400 hover:border-primary-500/30 transition-all flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3 text-red-400" /> Workload Alert
                </button>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="p-3 border-t border-[var(--border-primary)] flex gap-2 bg-[var(--bg-secondary)]"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me something…"
                className="flex-1 h-9 px-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500"
                disabled={isLoading}
              />
              <Button type="submit" disabled={!input.trim() || isLoading} className="h-9 w-9 p-0 flex items-center justify-center">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Bubble */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-15 h-15 rounded-full bg-gradient-to-tr from-primary-600 via-violet-500 to-cyan-400 text-white flex items-center justify-center cursor-pointer relative group focus:outline-none shadow-[0_0_25px_oklch(0.59_0.22_275_/_0.5)] hover:shadow-[0_0_40px_oklch(0.72_0.17_185_/_0.8)] transition-all duration-300"
      >
        {/* Wave expansion effect (radar ring) */}
        <div className="absolute inset-0 rounded-full border-2 border-primary-400/40 animate-ping opacity-75 pointer-events-none" />
        
        {/* Outer glowing halo */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-primary-500 via-purple-500 to-cyan-400 opacity-60 blur-md group-hover:opacity-90 group-hover:blur-lg transition-all duration-300 animate-pulse-slow pointer-events-none" />

        {/* Inner glass overlay to make it look like a sleek orb */}
        <div className="absolute inset-0.5 rounded-full bg-black/10 backdrop-blur-[2px] z-0" />

        {/* Logo/Icon content with soft drop-shadow glow */}
        <div className="relative z-10 flex items-center justify-center text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]">
          {isOpen ? (
            <X className="w-5.5 h-5.5" />
          ) : (
            <Bot className="w-6.5 h-6.5" />
          )}
        </div>
      </motion.button>
    </div>
  );
}

