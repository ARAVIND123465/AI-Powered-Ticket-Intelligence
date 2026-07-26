import { motion } from 'framer-motion';
import { Brain, AlertTriangle, Gauge, Heart, Copy, XCircle, ShieldCheck, ScanBarcode, QrCode, Image, PenTool } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import type { AIInsights } from '@/types';

interface AIInsightsPanelProps {
  insights: AIInsights;
}

export default function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  const validation = insights.document_validation;
  const isBlocked = validation && !validation.is_ticket;

  const getFraudScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-400';
    if (score >= 50) return 'text-amber-400';
    if (score >= 25) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getFraudScoreBg = (score: number) => {
    if (score >= 75) return 'bg-red-500';
    if (score >= 50) return 'bg-amber-500';
    if (score >= 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-2xl border border-[var(--border-accent)] bg-[var(--bg-secondary)] p-5 space-y-5"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI Insights</h3>
          <p className="text-[10px] text-[var(--text-tertiary)]">Powered by ML Pipeline</p>
        </div>
      </div>

      {/* Fake Attachment Warning */}
      {insights.fake_attachment_detected && (
        <div className="flex flex-col gap-1.5 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Fake Data Detected</span>
          </div>
          <p className="text-[10px] leading-relaxed opacity-90">
            The uploaded attachment <code className="font-mono bg-red-500/5 px-1 rounded">{insights.fake_file_name}</code> has been identified as unwanted/spam content. This ticket will be classified as Spam.
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/* Document Validation — Fraud Detection Details                */}
      {/* ============================================================ */}
      {isBlocked && validation && (
        <div className="space-y-3">
          {/* Warning Header */}
          <div className="flex flex-col gap-1.5 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Wrong Document Type</span>
            </div>
            <p className="text-[10px] leading-relaxed opacity-90">
              Detected as <strong>{validation.document_type}</strong>
              {validation.company_name && validation.company_name !== 'N/A' && (
                <> from <strong>{validation.company_name}</strong></>
              )}
              . This is not a valid IT support ticket.
            </p>
          </div>

          {/* Fraud Score */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">Fraud Score</span>
              <span className={`text-xs font-bold ${getFraudScoreColor(validation.fraud_score)}`}>
                {validation.fraud_score}/100
              </span>
            </div>
            <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${getFraudScoreBg(validation.fraud_score)} transition-all`}
                style={{ width: `${validation.fraud_score}%` }}
              />
            </div>
          </div>

          {/* Confidence */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">Classification Confidence</span>
              <span className="text-xs font-bold text-primary-400">{validation.confidence}%</span>
            </div>
            <ProgressBar value={validation.confidence} size="sm" />
          </div>

          {/* Document Markers */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className={`rounded-lg px-2 py-1.5 text-[10px] font-medium flex items-center gap-1.5 ${
              validation.barcode_present ? 'bg-green-500/10 text-green-400' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
            }`}>
              <ScanBarcode className="w-3 h-3" />
              Barcode {validation.barcode_present ? '✓' : '✗'}
            </div>
            <div className={`rounded-lg px-2 py-1.5 text-[10px] font-medium flex items-center gap-1.5 ${
              validation.qr_code_present ? 'bg-green-500/10 text-green-400' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
            }`}>
              <QrCode className="w-3 h-3" />
              QR Code {validation.qr_code_present ? '✓' : '✗'}
            </div>
            <div className={`rounded-lg px-2 py-1.5 text-[10px] font-medium flex items-center gap-1.5 ${
              validation.logo_present ? 'bg-green-500/10 text-green-400' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
            }`}>
              <Image className="w-3 h-3" />
              Logo {validation.logo_present ? '✓' : '✗'}
            </div>
            <div className={`rounded-lg px-2 py-1.5 text-[10px] font-medium flex items-center gap-1.5 ${
              validation.signature_present ? 'bg-green-500/10 text-green-400' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
            }`}>
              <PenTool className="w-3 h-3" />
              Signature {validation.signature_present ? '✓' : '✗'}
            </div>
          </div>

          {/* Reason */}
          <div className="px-3 py-2 rounded-xl bg-[var(--bg-tertiary)]">
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{validation.reason}</p>
          </div>
        </div>
      )}

      {/* Valid IT Ticket Confirmation */}
      {validation && validation.is_ticket && validation.is_valid && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
          <ShieldCheck className="w-4 h-4 text-green-400" />
          <span className="text-xs text-green-400 font-medium">Verified IT Support Ticket</span>
        </div>
      )}

      {/* Category */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">Predicted Category</span>
          <Badge variant="default">{insights.predicted_category}</Badge>
        </div>
        <ProgressBar value={insights.category_confidence * 100} size="sm" />
        <p className="text-[10px] text-[var(--text-tertiary)]">{(insights.category_confidence * 100).toFixed(1)}% confidence</p>
      </div>

      {/* Priority */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">Predicted Priority</span>
          <Badge variant="priority">{insights.predicted_priority}</Badge>
        </div>
        <ProgressBar value={insights.priority_confidence * 100} size="sm" />
        <p className="text-[10px] text-[var(--text-tertiary)]">{(insights.priority_confidence * 100).toFixed(1)}% confidence</p>
      </div>

      {/* Sentiment */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
          <span className="text-xs text-[var(--text-secondary)]">Sentiment</span>
        </div>
        <Badge variant="sentiment">{insights.sentiment}</Badge>
      </div>

      {/* Escalation */}
      {insights.escalation_recommended && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-xs text-red-400 font-medium">Escalation Recommended</span>
        </div>
      )}

      {/* Duplicates */}
      {insights.is_duplicate && insights.duplicate_matches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">Potential Duplicates</span>
          </div>
          {insights.duplicate_matches.map((m, i) => (
            <div key={i} className="text-xs text-[var(--text-secondary)] px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)]">
              #{m.ticket_id} — {(m.similarity * 100).toFixed(0)}% match
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
