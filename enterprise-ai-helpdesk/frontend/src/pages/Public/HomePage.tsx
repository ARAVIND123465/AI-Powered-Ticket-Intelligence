import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Ticket, Search, Bot, ArrowRight, ShieldCheck,
  Building, CheckCircle2, Zap, Lock, Brain, FileCheck, Bus, Train, Film
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const navigate = useNavigate();
  const [trackId, setTrackId] = useState('');
  const [trackEmail, setTrackEmail] = useState('');

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackId) {
      navigate(`/track-ticket?id=${encodeURIComponent(trackId)}&email=${encodeURIComponent(trackEmail)}`);
    }
  };

  return (
    <div className="space-y-16 py-4">
      {/* HERO SECTION */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-semibold text-primary-400">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen Enterprise AI Ticket Intelligence Platform
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
          Instant IT Resolution & <span className="gradient-text">AI Fraud Detection</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-sm sm:text-base text-[var(--text-tertiary)] leading-relaxed">
          Submit tickets, track live agent responses, or let Gemini Vision scan your screenshots to automatically detect irrelevant uploads (RedBus, IRCTC, Movie tickets).
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/public-create-ticket">
            <Button size="lg" className="flex items-center gap-2 shadow-xl shadow-primary-500/20">
              <Ticket className="w-4 h-4" /> Create Support Ticket
            </Button>
          </Link>

          <Link to="/track-ticket">
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <Search className="w-4 h-4 text-primary-400" /> Track My Ticket
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* QUICK TRACK & ACTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Track Ticket Widget */}
        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Track My Ticket</h3>
              <p className="text-[10px] text-[var(--text-tertiary)]">Check agent responses & resolution status</p>
            </div>
          </div>

          <form onSubmit={handleQuickTrack} className="space-y-3 text-xs">
            <input
              type="text"
              required
              placeholder="Ticket ID (e.g. TKT-1041)"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500"
            />
            <input
              type="email"
              placeholder="Registered Email (optional)"
              value={trackEmail}
              onChange={(e) => setTrackEmail(e.target.value)}
              className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500"
            />
            <Button type="submit" className="w-full text-xs flex items-center justify-center gap-1.5">
              Track Status <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>

        {/* AI Assistant Widget */}
        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">AI Assistant (Chatbot)</h3>
                <p className="text-[10px] text-[var(--text-tertiary)]">24/7 automated technical FAQs</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Ask our conversational AI bot troubleshooting questions, check server status, or get quick diagnostic steps before opening a ticket.
            </p>
          </div>

          <Link to="/public-assistant">
            <Button variant="outline" className="w-full text-xs flex items-center justify-center gap-1.5">
              Launch Chatbot <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Enterprise Company Onboarding */}
        <div className="rounded-2xl border border-primary-500/30 bg-primary-500/5 p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Enterprise Onboarding</h3>
                <p className="text-[10px] text-[var(--text-tertiary)]">Register your company for Super Admin approval</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Onboard your company (e.g. RedBus, IRCTC, TechCorp) to equip your support agents with multi-tenant AI ticket routing.
            </p>
          </div>

          <Link to="/register-company">
            <Button className="w-full text-xs flex items-center justify-center gap-1.5">
              Onboard Organization <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* FEATURE CAROUSEL & CAPABILITIES */}
      <div className="space-y-6 pt-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">AI Document Classification & Fraud Prevention</h2>
          <p className="text-xs text-[var(--text-tertiary)]">Automatic vision analysis protects your support queue from irrelevant uploads</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <Bus className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[var(--text-primary)]">RedBus Bus Ticket</h4>
            <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">Detects seat & boarding details and flags as non-IT upload.</p>
          </div>

          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Train className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[var(--text-primary)]">IRCTC Train Ticket</h4>
            <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">Identifies PNR & coach numbers and blocks irrelevant submissions.</p>
          </div>

          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[var(--text-primary)]">PVR Movie Ticket</h4>
            <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">Recognizes showtimes & cinema halls and flags as invalid.</p>
          </div>

          <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-green-400">Valid IT Screenshot</h4>
            <p className="text-[11px] text-green-300/80 leading-relaxed">Reads HTTP 500 & stack trace errors to auto-route to engineers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
