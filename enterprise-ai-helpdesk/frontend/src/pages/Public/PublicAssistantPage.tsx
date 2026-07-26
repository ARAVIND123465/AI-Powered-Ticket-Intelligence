import { useState } from 'react';
import { Bot, Send, User, Sparkles, HelpCircle, ShieldCheck, Ticket } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export default function PublicAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! I am your AI Helpdesk Assistant. How can I help you today? You can ask me technical troubleshooting questions, check ticket resolution procedures, or get help opening a support ticket.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI Chatbot response
    setTimeout(() => {
      let reply = "Thanks for your question! For specific technical issues, system errors, or account locks, we recommend opening a ticket so our engineering agents can assist you directly.";
      const query = userMsg.text.toLowerCase();

      if (query.includes('redbus') || query.includes('bus') || query.includes('movie') || query.includes('pvr') || query.includes('irctc')) {
        reply = "⚠️ Note: Our AI Document Inspection engine automatically screens uploaded screenshots. Irrelevant uploads like RedBus tickets, IRCTC train tickets, or movie tickets are flagged as non-IT documents. Please upload genuine system error screenshots.";
      } else if (query.includes('vpn') || query.includes('network') || query.includes('connect')) {
        reply = "For VPN connectivity issues: 1) Verify your Wi-Fi or ethernet connection, 2) Restart your VPN client service, 3) If reconnecting returns error 403 or 500, please upload your error screenshot via the Create Ticket page.";
      } else if (query.includes('track') || query.includes('status')) {
        reply = "You can track your support ticket progress and view agent responses anytime on our Track My Ticket page by entering your Ticket ID and Email.";
      } else if (query.includes('register') || query.includes('company')) {
        reply = "Organizations can onboard their company (e.g. RedBus, IRCTC, TechCorp) via our Company Onboarding Registration page for Super Admin approval.";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Public AI Helpdesk Assistant</h1>
        <p className="text-xs text-[var(--text-tertiary)]">Interactive 24/7 Chatbot for instant FAQs & technical guidance</p>
      </div>

      {/* Chat Window */}
      <Card className="h-[480px] flex flex-col p-0 overflow-hidden shadow-xl border-[var(--border-primary)]">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--bg-secondary)]">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                m.sender === 'user' ? 'bg-primary-500 text-white' : 'gradient-bg text-white'
              }`}>
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-primary-500 text-white font-medium rounded-tr-none'
                  : 'bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-tl-none'
              }`}>
                <p>{m.text}</p>
                <span className={`text-[9px] block mt-1.5 ${m.sender === 'user' ? 'text-white/70 text-right' : 'text-[var(--text-tertiary)]'}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-[var(--bg-tertiary)] text-xs text-[var(--text-tertiary)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>AI Assistant is typing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] flex gap-2">
          <input
            type="text"
            placeholder="Ask a technical question or query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500"
          />
          <Button type="submit" size="sm" className="flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" /> Send
          </Button>
        </form>
      </Card>

      {/* Suggested Actions */}
      <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] px-2">
        <span>Need further assistance?</span>
        <div className="flex gap-3">
          <Link to="/public-create-ticket" className="text-primary-400 hover:underline font-semibold flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5" /> Create Ticket
          </Link>
          <Link to="/track-ticket" className="text-primary-400 hover:underline font-semibold flex items-center gap-1">
            Track Ticket
          </Link>
        </div>
      </div>
    </div>
  );
}
