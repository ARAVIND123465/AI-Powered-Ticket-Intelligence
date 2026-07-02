import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
}

const SUGGESTED_QUESTIONS = [
  'Why are payment tickets increasing this week?',
  'Which engineer is currently overloaded?',
  'What is today\'s SLA performance?',
  'Show unresolved critical tickets',
  'What are the most common issues this month?',
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI helpdesk assistant. I can answer questions about ticket trends, team performance, SLA compliance, and more — all grounded in your actual ticket data. What would you like to know?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const question = text || input.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateDemoResponse(question);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.answer, citations: response.citations }]);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI Chat</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">RAG-powered assistant using your ticket history</p>
      </motion.div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn('flex gap-3', msg.role === 'user' && 'justify-end')}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={cn(
                'max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-bl-md'
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[var(--border-primary)]">
                    <p className="text-[10px] text-[var(--text-tertiary)] font-medium mb-1">Sources:</p>
                    {msg.citations.map((c, ci) => (
                      <p key={ci} className="text-[10px] text-primary-400">• {c}</p>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-primary-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-primary-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 py-3">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button key={q} onClick={() => handleSend(q)}
              className="px-3 py-1.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-secondary)] hover:text-primary-400 hover:border-primary-500/30 transition-all"
            >
              <Sparkles className="w-3 h-3 inline mr-1" />{q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2 pt-3 border-t border-[var(--border-primary)]">
        <input
          value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about tickets, trends, performance…"
          className="flex-1 h-11 px-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500"
          disabled={isLoading}
        />
        <Button type="submit" disabled={!input.trim() || isLoading} size="md"><Send className="w-4 h-4" /></Button>
      </form>
    </div>
  );
}

function generateDemoResponse(question: string): { answer: string; citations: string[] } {
  const q = question.toLowerCase();
  if (q.includes('payment') || q.includes('increasing'))
    return { answer: 'Payment-related tickets have increased by 23% this week compared to the previous week. The primary driver is a Stripe webhook integration issue causing delayed payment confirmations. This is impacting 34% of checkout sessions.\n\nI recommend investigating the webhook retry configuration and checking the Stripe dashboard for failed events.', citations: ['TKT-1041: Payment gateway timeout', 'TKT-998: Checkout failures on mobile'] };
  if (q.includes('overload') || q.includes('engineer'))
    return { answer: 'Emily R. currently has the highest workload with 15 open tickets and an average resolution time of 5.3 hours (team average is 3.8 hours). Consider redistributing 3-4 of her Network tickets to James L., who has the fastest resolution rate at 2.8 hours.', citations: ['Workload Analytics Dashboard', 'Engineer Performance Report'] };
  if (q.includes('sla'))
    return { answer: 'Today\'s SLA compliance is at 97.2%. Two tickets are approaching their SLA deadline:\n\n• TKT-1042 (High priority) — 2.5 hours remaining\n• TKT-1041 (Critical) — 45 minutes remaining\n\nI recommend immediate attention on TKT-1041 to prevent an SLA breach.', citations: ['SLA Tracking Module', 'TKT-1041', 'TKT-1042'] };
  if (q.includes('critical') || q.includes('unresolved'))
    return { answer: 'There are currently 3 unresolved critical tickets:\n\n1. TKT-1041 — Cannot process refund (Payment, 1h ago)\n2. TKT-1035 — Production API returning 500 errors (Technical, 4h ago)\n3. TKT-1028 — Customer data exposure risk (Security, 6h ago)\n\nAll three have AI-generated resolution suggestions available.', citations: ['TKT-1041', 'TKT-1035', 'TKT-1028'] };
  return { answer: 'Based on the ticket data, here\'s what I found:\n\n• The most common issue this month is VPN connectivity (18% of all tickets)\n• Network-related tickets have a 92% first-contact resolution rate\n• Average customer satisfaction for resolved tickets is 4.6/5\n\nWould you like me to dig deeper into any of these areas?', citations: ['Monthly Analytics Report', 'CSAT Dashboard'] };
}
