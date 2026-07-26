import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Ticket as TicketIcon, CheckCircle2, Clock, AlertTriangle,
  User, MessageSquare, Send, ArrowLeft, ShieldCheck, FileText, Sparkles
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { toast } from 'sonner';
import { ticketStore, type TicketAgentResponse } from '@/utils/ticketStore';
import type { Ticket } from '@/types';

export default function TrackTicketPage() {
  const [searchParams] = useSearchParams();
  const [ticketIdInput, setTicketIdInput] = useState(searchParams.get('id') || '');
  const [emailInput, setEmailInput] = useState(searchParams.get('email') || '');
  
  const [foundTicket, setFoundTicket] = useState<Ticket | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Auto-search if query params passed
  useEffect(() => {
    const qId = searchParams.get('id');
    if (qId) {
      performSearch(qId, searchParams.get('email') || '');
    }
  }, [searchParams]);

  const performSearch = (tId: string, email: string) => {
    if (!tId) return;
    const res = ticketStore.findTicketForTracking(tId, email);
    setFoundTicket(res);
    setHasSearched(true);

    if (res) {
      toast.success(`Found ticket #${res.id}`);
    } else {
      toast.error(`No ticket found matching Ticket ID "${tId}".`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(ticketIdInput, emailInput);
  };

  const handleAddUserReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !foundTicket) return;

    const updated = ticketStore.addAgentResponse(
      foundTicket.id,
      'Customer (You)',
      replyText,
      foundTicket.status
    );

    if (updated) {
      setFoundTicket({ ...updated });
      setReplyText('');
      toast.success('Your reply has been sent to the support agent team.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20">
          <Search className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Track Ticket Status & Agent Responses</h1>
        <p className="text-xs text-[var(--text-tertiary)]">Enter your Ticket ID (e.g. TKT-1041) and Email to view live support updates</p>
      </div>

      {/* Search Bar Form */}
      <Card className="p-6 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Ticket ID *</label>
              <input
                type="text"
                required
                placeholder="e.g. TKT-1041 or 1041"
                value={ticketIdInput}
                onChange={(e) => setTicketIdInput(e.target.value)}
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Registered Email (optional)</label>
              <input
                type="email"
                placeholder="e.g. aravind@gmail.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <Button type="submit" className="w-full flex items-center justify-center gap-2">
            <Search className="w-4 h-4" /> Search Ticket Status
          </Button>
        </form>

        {/* Preset quick links for demo */}
        <div className="mt-4 pt-3 border-t border-[var(--border-primary)] flex items-center gap-2 flex-wrap text-xs text-[var(--text-tertiary)]">
          <span>Quick Demo Searches:</span>
          <button
            onClick={() => { setTicketIdInput('TKT-1041'); setEmailInput('aravind@gmail.com'); performSearch('TKT-1041', 'aravind@gmail.com'); }}
            className="text-primary-400 font-mono underline hover:text-primary-300"
          >
            #TKT-1041
          </button>
          <button
            onClick={() => { setTicketIdInput('TKT-1042'); setEmailInput('john@company.com'); performSearch('TKT-1042', 'john@company.com'); }}
            className="text-primary-400 font-mono underline hover:text-primary-300"
          >
            #TKT-1042
          </button>
        </div>
      </Card>

      {/* TRACKING RESULTS SECTION */}
      {hasSearched && (
        <>
          {foundTicket ? (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Ticket Details Card */}
              <Card className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-lg border border-primary-500/20">
                        {foundTicket.id}
                      </span>
                      <Badge variant="status">{foundTicket.status}</Badge>
                      <Badge variant="priority">{foundTicket.priority}</Badge>
                    </div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)] mt-2">{foundTicket.title}</h2>
                  </div>

                  <div className="text-right text-xs text-[var(--text-tertiary)]">
                    <div>Submitted: {new Date(foundTicket.created_at).toLocaleDateString()}</div>
                    <div className="text-[10px]">User: {foundTicket.user_id}</div>
                  </div>
                </div>

                {/* ============================================================ */}
                {/* STEP-BY-STEP TICKET LIFECYCLE PROGRESS STEPPER               */}
                {/* ============================================================ */}
                <div className="p-5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary-400" /> Ticket Processing Lifecycle (Step-by-Step)
                    </span>
                    <span className="text-[11px] text-primary-400 font-semibold font-mono">
                      Status: {foundTicket.status}
                    </span>
                  </div>

                  {/* 4-Step Visual Stepper */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    {/* Step 1 */}
                    <div className="p-3 rounded-xl border border-green-500/30 bg-green-500/5 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-green-400">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Step 1: Upload & OCR</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-tertiary)] leading-snug">
                        Ticket uploaded & OCR text extracted from screenshot.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className={`p-3 rounded-xl border space-y-1 ${
                      foundTicket.category === 'Spam'
                        ? 'border-red-500/30 bg-red-500/5'
                        : 'border-green-500/30 bg-green-500/5'
                    }`}>
                      <div className={`flex items-center gap-1.5 font-bold ${
                        foundTicket.category === 'Spam' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {foundTicket.category === 'Spam' ? (
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        )}
                        <span>Step 2: AI Fraud Check</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-tertiary)] leading-snug">
                        {foundTicket.category === 'Spam'
                          ? '⚠️ Non-IT ticket detected (e.g. RedBus/Movie ticket).'
                          : 'Valid IT support error screenshot confirmed.'}
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className={`p-3 rounded-xl border space-y-1 ${
                      foundTicket.status === 'Open'
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-green-500/30 bg-green-500/5'
                    }`}>
                      <div className={`flex items-center gap-1.5 font-bold ${
                        foundTicket.status === 'Open' ? 'text-amber-400' : 'text-green-400'
                      }`}>
                        {foundTicket.status === 'Open' ? (
                          <Clock className="w-4 h-4 shrink-0 animate-pulse" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        )}
                        <span>Step 3: Agent Routing</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-tertiary)] leading-snug">
                        Routed to technical support engineering queue.
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div className={`p-3 rounded-xl border space-y-1 ${
                      foundTicket.status === 'Resolved' || foundTicket.status === 'Closed'
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-primary-500/30 bg-primary-500/5'
                    }`}>
                      <div className={`flex items-center gap-1.5 font-bold ${
                        foundTicket.status === 'Resolved' || foundTicket.status === 'Closed'
                          ? 'text-green-400'
                          : 'text-primary-400'
                      }`}>
                        <MessageSquare className="w-4 h-4 shrink-0" />
                        <span>Step 4: Agent Response</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-tertiary)] leading-snug">
                        Support team replies & sends resolution message below.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] text-xs text-[var(--text-secondary)] leading-relaxed space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[var(--text-tertiary)]">Original User Request:</div>
                  <p>{foundTicket.description}</p>
                </div>

                {/* Attachment Inspection Details */}
                {foundTicket.attachment && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span className="text-[var(--text-secondary)]">Attachment: <strong>{foundTicket.attachment}</strong></span>
                    </div>
                    {foundTicket.category === 'Spam' && (
                      <Badge variant="danger">Non-IT Document Detected (Blocked)</Badge>
                    )}
                  </div>
                )}
              </Card>

              {/* AGENT RESPONSES & MESSAGES SECTION */}
              <Card className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary-400" />
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      Support Agent Responses & Progress Logs ({foundTicket.agent_responses?.length || 0})
                    </h3>
                  </div>
                  <Badge variant="status">Live Synchronization</Badge>
                </div>

                {/* Response Thread */}
                <div className="space-y-4">
                  {(!foundTicket.agent_responses || foundTicket.agent_responses.length === 0) ? (
                    <div className="text-center py-6 text-xs text-[var(--text-tertiary)] space-y-1">
                      <Clock className="w-6 h-6 mx-auto text-[var(--text-tertiary)] animate-pulse" />
                      <p>Agent investigation in progress. Responses will appear here as agents work on your ticket.</p>
                    </div>
                  ) : (
                    foundTicket.agent_responses.map((resp, i) => (
                      <div
                        key={resp.id || i}
                        className={`p-4 rounded-xl text-xs space-y-2 border ${
                          resp.agent_name.includes('Customer')
                            ? 'bg-primary-500/5 border-primary-500/20 ml-4'
                            : 'bg-[var(--bg-tertiary)] border-[var(--border-primary)] mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-primary-400" /> {resp.agent_name}
                          </span>
                          <span className="text-[10px] text-[var(--text-tertiary)]">
                            {new Date(resp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[var(--text-secondary)] leading-relaxed">{resp.response_text}</p>
                        {resp.status_changed_to && (
                          <div className="text-[10px] text-amber-400 font-semibold pt-1">
                            🔄 Status updated to: <strong>{resp.status_changed_to}</strong>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Public Reply Box */}
                <form onSubmit={handleAddUserReply} className="pt-4 border-t border-[var(--border-primary)] space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Send Follow-up Message to Agent</label>
                    <textarea
                      rows={2}
                      placeholder="Type a message or question for the support agent..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" size="sm" className="flex items-center gap-1.5 text-xs">
                      <Send className="w-3.5 h-3.5" /> Send Message
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
              <h3 className="text-base font-bold text-red-400">No Ticket Found</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                We couldn't find a ticket matching ID "<strong>{ticketIdInput}</strong>". Please verify your Ticket ID or create a new support ticket.
              </p>
              <div className="pt-2">
                <Link to="/public-create-ticket">
                  <Button size="sm">Create New Ticket</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
