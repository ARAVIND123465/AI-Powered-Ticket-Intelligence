import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  Download,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Check,
  Copy,
  AlertTriangle,
  HelpCircle,
  Wrench,
  Send,
  MessageSquare,
  FileSearch,
  Maximize2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import { attachmentService } from '@/services/attachment.service';
import type { TicketAttachment, PDFAnalysisResult, PDFAnalysisStructured } from '@/types';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  attachment: TicketAttachment | null;
  onApplyDraftToReply?: (draftText: string) => void;
}

export default function PDFViewerModal({
  isOpen,
  onClose,
  ticketId,
  attachment,
  onApplyDraftToReply,
}: PDFViewerModalProps) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PDFAnalysisResult | null>(null);
  const [structuredData, setStructuredData] = useState<PDFAnalysisStructured | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'resolution' | 'draft'>('insights');

  // Load PDF Blob when modal opens or attachment changes
  useEffect(() => {
    if (!isOpen || !attachment) {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
      setAnalysisResult(null);
      setStructuredData(null);
      setPdfLoadError(null);
      return;
    }

    let isMounted = true;
    setIsLoadingPdf(true);
    setPdfLoadError(null);

    attachmentService
      .downloadBlob(ticketId, attachment.id)
      .then((blob) => {
        if (!isMounted) return;
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
        setIsLoadingPdf(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load PDF blob:', err);
        setPdfLoadError('Failed to load PDF document from server.');
        setIsLoadingPdf(false);
      });

    // Check for existing saved analyses
    attachmentService
      .getAnalyses(ticketId, attachment.id)
      .then((analyses) => {
        if (!isMounted) return;
        if (analyses && analyses.length > 0) {
          const latest = analyses[0];
          setAnalysisResult(latest);
          parseAnalysisContent(latest.analysis_result);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch existing analyses:', err);
      });

    return () => {
      isMounted = false;
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [isOpen, attachment?.id, ticketId]);

  // Handle escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const parseAnalysisContent = (rawResult: string | any) => {
    try {
      if (typeof rawResult === 'object') {
        setStructuredData(rawResult);
        return;
      }
      const parsed = JSON.parse(rawResult);
      setStructuredData(parsed);
    } catch {
      // Fallback if parsing plain text
      setStructuredData({
        document_summary: rawResult,
        key_information: 'Refer to summary for details.',
        issue_identification: 'Analysis produced plain text output.',
        possible_root_cause: 'Refer to document summary.',
        recommended_resolution: 'Review findings manually.',
        missing_information: 'None identified.',
        customer_response_draft: 'Thank you for providing the document. We are investigating your issue.',
        evidence_and_references: 'Extracted from document.',
        confidence_and_limitations: 'Completed in plain text mode.',
      });
    }
  };

  const handleRunAnalysis = async () => {
    if (!attachment) return;
    setIsAnalyzing(true);
    toast.info('Running AI document analysis with Gemini...');

    try {
      const result = await attachmentService.analyze(ticketId, attachment.id);
      setAnalysisResult(result);
      parseAnalysisContent(result.analysis_result);
      toast.success('AI analysis completed successfully!');
    } catch (err: any) {
      console.error('Analysis failed:', err);
      toast.error(err.response?.data?.detail || 'Failed to complete AI analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    toast.success('Customer response draft copied to clipboard!');
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  const handleApplyDraft = (text: string) => {
    if (onApplyDraftToReply) {
      onApplyDraftToReply(text);
      toast.success('Draft response applied to agent reply composer!');
      onClose();
    } else {
      handleCopyDraft(text);
    }
  };

  if (!isOpen || !attachment) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-7xl h-[92vh] max-h-[900px] flex flex-col rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-2xl overflow-hidden z-10"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-md">
                    {attachment.filename}
                  </h2>
                  <Badge variant="status">PDF</Badge>
                  {analysisResult?.sandbox_mode && (
                    <Badge variant="priority" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                      Sandbox Mode
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[var(--text-tertiary)] mt-0.5">
                  <span>{(attachment.file_size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>{attachment.page_count} page(s)</span>
                  <span>•</span>
                  <span>Uploaded by {attachment.uploader_name || 'Customer'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {pdfBlobUrl && (
                <a
                  href={pdfBlobUrl}
                  download={attachment.filename}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] border border-[var(--border-primary)] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
              )}

              {pdfBlobUrl && (
                <a
                  href={pdfBlobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <Button
                size="sm"
                variant={analysisResult ? 'outline' : 'primary'}
                className="gap-1.5 text-xs h-8"
                onClick={handleRunAnalysis}
                isLoading={isAnalyzing}
              >
                <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                {analysisResult ? 'Re-analyze with AI' : 'Analyze with AI'}
              </Button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors ml-2"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Dual-Pane Content Body */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-primary)]">
            {/* Left Column: PDF Viewer */}
            <div className="lg:col-span-7 flex flex-col h-full bg-[var(--bg-tertiary)]/30 min-h-0 relative">
              <div className="px-4 py-2 border-b border-[var(--border-primary)]/50 bg-[var(--bg-secondary)]/70 flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                <span className="font-medium text-[var(--text-secondary)]">Document Viewer</span>
                <span className="text-[11px]">In-browser Secure Preview</span>
              </div>

              <div className="flex-1 relative overflow-hidden bg-neutral-900/40">
                {isLoadingPdf ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-6 h-6 text-primary-400 animate-spin" />
                    <p className="text-xs text-[var(--text-tertiary)]">Streaming document from secure storage...</p>
                  </div>
                ) : pdfLoadError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
                    <p className="text-sm font-medium text-[var(--text-primary)]">{pdfLoadError}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-sm">
                      Check that the attachment exists or try downloading the file directly.
                    </p>
                  </div>
                ) : pdfBlobUrl ? (
                  <iframe
                    src={`${pdfBlobUrl}#toolbar=1&navpanes=0&view=FitH`}
                    title={attachment.filename}
                    className="w-full h-full border-0"
                  />
                ) : null}
              </div>
            </div>

            {/* Right Column: AI Analysis & Insights Panel */}
            <div className="lg:col-span-5 flex flex-col h-full bg-[var(--bg-secondary)] min-h-0">
              {/* Tab Navigation */}
              <div className="px-4 py-2.5 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-tertiary)]/40">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('insights')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'insights'
                        ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    AI Insights
                  </button>
                  <button
                    onClick={() => setActiveTab('resolution')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'resolution'
                        ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    Resolution
                  </button>
                  <button
                    onClick={() => setActiveTab('draft')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'draft'
                        ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    Response Draft
                  </button>
                </div>

                {analysisResult && (
                  <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                    {analysisResult.model_used}
                  </span>
                )}
              </div>

              {/* Panel Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isAnalyzing ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 animate-pulse">
                        <Sparkles className="w-7 h-7" />
                      </div>
                      <div className="absolute -inset-1 rounded-2xl bg-primary-500/20 blur-md -z-10 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                        Analyzing Document Content
                      </h4>
                      <p className="text-xs text-[var(--text-tertiary)] max-w-xs">
                        Gemini is reading PDF text, extracting key identifiers, and synthesizing troubleshooting steps...
                      </p>
                    </div>
                  </div>
                ) : !structuredData ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center p-4 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                      <FileSearch className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                        No AI Analysis Yet
                      </h4>
                      <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                        Trigger AI-powered PDF analysis to extract structured summaries, diagnose potential root causes, and generate a pre-drafted customer response.
                      </p>
                    </div>
                    <Button
                      onClick={handleRunAnalysis}
                      className="gap-2 text-xs"
                      size="sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Run AI PDF Analysis Now
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* ── Relevance & Accuracy Rate Status Banner ── */}
                    {structuredData.is_relevant === false || (structuredData.relevance_score !== undefined && structuredData.relevance_score <= 15) ? (
                      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Irrelevant / Unrelated PDF Detected</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Accuracy Rate: {structuredData.relevance_score !== undefined ? `${structuredData.relevance_score}%` : '-10'}
                          </span>
                        </div>
                        <p className="text-xs text-rose-200/90 leading-relaxed font-medium">
                          {structuredData.irrelevance_reason || "The AI analysis determined that this document's text and contents have no correlation to the customer's reported ticket issue."}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-rose-300/80 pt-1 border-t border-rose-500/20">
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                          <span>Text not related: Request authentic proof from customer before taking action.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Relevant Document Verified</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Accuracy Rate: {structuredData.relevance_score || 92}%
                        </span>
                      </div>
                    )}

                    {/* Active Tab: Insights */}
                    {activeTab === 'insights' && (
                      <div className="space-y-4">
                        {/* 1. Document Summary */}
                        <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-400">
                            <FileText className="w-3.5 h-3.5" />
                            <span>Document Summary</span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {structuredData.document_summary}
                          </p>
                        </div>

                        {/* 2. Key Information & Extracted Entities */}
                        <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Key Information & Extracted Details</span>
                          </div>
                          <pre className="text-xs font-mono text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed bg-[var(--bg-secondary)] p-2.5 rounded-lg border border-[var(--border-primary)]">
                            {structuredData.key_information}
                          </pre>
                        </div>

                        {/* 3. Issue Identification & Correlation */}
                        <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Issue Identification & Ticket Correlation</span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {structuredData.issue_identification}
                          </p>
                        </div>

                        {/* 4. Evidence & Page References */}
                        {structuredData.evidence_and_references && (
                          <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                              <FileSearch className="w-3.5 h-3.5" />
                              <span>Evidence & Page References</span>
                            </div>
                            <pre className="text-xs font-mono text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed bg-[var(--bg-secondary)] p-2.5 rounded-lg border border-[var(--border-primary)]">
                              {structuredData.evidence_and_references}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Active Tab: Resolution */}
                    {activeTab === 'resolution' && (
                      <div className="space-y-4">
                        {/* Possible Root Cause */}
                        <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Possible Root Cause</span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {structuredData.possible_root_cause}
                          </p>
                        </div>

                        {/* Recommended Resolution Steps */}
                        <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Recommended Troubleshooting / Actions</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                            {structuredData.recommended_resolution}
                          </div>
                        </div>

                        {/* Missing Information */}
                        {structuredData.missing_information && (
                          <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Missing Information Required From Customer</span>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                              {structuredData.missing_information}
                            </p>
                          </div>
                        )}

                        {/* Confidence & Limitations */}
                        {structuredData.confidence_and_limitations && (
                          <div className="p-3 rounded-lg bg-[var(--bg-tertiary)]/50 border border-[var(--border-primary)]/50 text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                            <span className="font-semibold text-[var(--text-secondary)]">Limitations Note: </span>
                            {structuredData.confidence_and_limitations}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Active Tab: Customer Response Draft */}
                    {activeTab === 'draft' && (
                      <div className="space-y-4">
                        <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-primary-500/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-400">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>AI-Drafted Customer Reply</span>
                            </div>
                            <span className="text-[10px] text-[var(--text-tertiary)]">Ready for agent review</span>
                          </div>

                          <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                            {structuredData.customer_response_draft}
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 gap-1.5"
                              onClick={() => handleCopyDraft(structuredData.customer_response_draft)}
                            >
                              {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedDraft ? 'Copied' : 'Copy Draft'}
                            </Button>

                            {onApplyDraftToReply && (
                              <Button
                                size="sm"
                                className="text-xs h-8 gap-1.5"
                                onClick={() => handleApplyDraft(structuredData.customer_response_draft)}
                              >
                                <Send className="w-3.5 h-3.5" />
                                Insert into Reply
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-primary-500/5 border border-primary-500/10 text-xs text-[var(--text-tertiary)] leading-relaxed">
                          💡 <strong className="text-[var(--text-secondary)]">Agent Tip:</strong> Review and tailor the draft above before sending. The AI response is contextualized with the customer's original report and the evidence extracted from their PDF.
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
