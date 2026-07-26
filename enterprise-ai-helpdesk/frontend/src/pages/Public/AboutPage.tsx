import { motion } from 'framer-motion';
import { Sparkles, Brain, ShieldCheck, Zap, Building, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">About AI Helpdesk Platform</h1>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)] max-w-xl mx-auto leading-relaxed">
          An enterprise AI-driven ticket intelligence platform engineered for instant IT problem classification, automatic OCR document inspection, and multi-tenant company governance.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Gemini Vision & OCR Scanning</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Extracts stack traces, error codes, and system parameters directly from uploaded screenshots to populate ticket details automatically.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Fake Document Screening</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Prevents helpdesk spam by automatically flagging non-IT uploads like RedBus tickets, IRCTC train tickets, or movie bookings.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Multi-Tenant Onboarding</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Super Admin governance panel for company onboarding, tenant approvals, and multi-organization support agent routing.
          </p>
        </Card>
      </div>

      {/* CTA Box */}
      <div className="rounded-2xl border border-primary-500/30 bg-gradient-to-r from-primary-500/10 via-purple-500/5 to-transparent p-8 text-center space-y-4">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Ready to experience AI-powered support?</h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/public-create-ticket">
            <Button size="sm">Create Support Ticket</Button>
          </Link>
          <Link to="/register-company">
            <Button variant="outline" size="sm">Onboard Your Organization</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
