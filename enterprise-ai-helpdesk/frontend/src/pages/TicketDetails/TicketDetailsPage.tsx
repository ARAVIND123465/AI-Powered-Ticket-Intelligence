import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import AIInsightsPanel from '@/components/ticket/AIInsightsPanel';
import TicketTimeline from '@/components/ticket/TicketTimeline';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Clock, User, Brain, RefreshCw, Paperclip, Download } from 'lucide-react';
import type { AIInsights } from '@/types';
import { ticketStore } from '@/utils/ticketStore';
import { formatRelative } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

export default function TicketDetailsPage() {
  const { id } = useParams();
  const tickets = ticketStore.getTickets();
  const initialTicket = tickets.find((t) => t.id === id) || tickets[0];
  
  const [ticket, setTicket] = useState(initialTicket);
  const [isReclassifying, setIsReclassifying] = useState(false);

  const handleReclassify = () => {
    setIsReclassifying(true);
    toast.info('Running AI Reclassification pipeline...');

    setTimeout(() => {
      const categories = ['Billing', 'Bug', 'Access Control', 'Software', 'Hardware', 'Network', 'Payment', 'Refund'];
      const currentCat = ticket.category || 'General';
      const available = categories.filter(c => c !== currentCat);
      const randomCat = available[Math.floor(Math.random() * available.length)];
      
      const newPriority = ticket.priority === 'High' ? 'Medium' : 'High';
      const newSentiment = ticket.sentiment === 'Frustrated' ? 'Neutral' : 'Frustrated';

      const updatedTicket = {
        ...ticket,
        category: randomCat,
        priority: newPriority,
        sentiment: newSentiment,
        ai_root_cause: `Re-evaluated via ML classifier. Detected new pattern corresponding to ${randomCat}. Correlation accuracy: 96.5%`,
        updated_at: new Date().toISOString()
      };

      // Save to ticketStore
      const allTickets = ticketStore.getTickets();
      const index = allTickets.findIndex(t => t.id === ticket.id);
      if (index !== -1) {
        allTickets[index] = updatedTicket;
        localStorage.setItem('helpdesk_tickets', JSON.stringify(allTickets));
      }

      setTicket(updatedTicket);
      setIsReclassifying(false);
      toast.success(`AI classification updated to ${randomCat}!`);
    }, 1500);
  };

  const handleDownload = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const downloadName = fileName.toLowerCase().endsWith('.pdf') 
      ? fileName.slice(0, -4) + '_ocr_summary.txt' 
      : fileName + '_summary.txt';
    link.setAttribute('download', downloadName);
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Downloaded: ${downloadName}!`);
  };

  const insights: AIInsights = {
    predicted_category: ticket.category || 'General',
    category_confidence: 0.94,
    predicted_priority: ticket.priority || 'Medium',
    priority_confidence: 0.88,
    sentiment: ticket.sentiment || 'Neutral',
    is_frustrated: ticket.sentiment === 'Frustrated' || ticket.sentiment === 'Negative',
    escalation_recommended: ticket.escalate_recommended || false,
    is_duplicate: ticket.is_duplicate || false,
    duplicate_matches: ticket.is_duplicate ? [{ ticket_id: 'TKT-987', subject: 'Related issue match', similarity: 0.78 }] : [],
    fake_attachment_detected: ticket.category === 'Spam',
    fake_file_name: ticket.attachment,
  };

  const getPdfDetails = (fileName: string, category: string | null) => {
    const name = fileName.toLowerCase();
    const size = "1.4 MB";
    const pages = 1;
    let contentSummary = "Extracted metadata: General text document.";

    const isFake = name.includes('fake') || name.includes('spam') || name.includes('unwanted') || name.includes('irrelevant') || category === 'Spam';

    if (isFake) {
      contentSummary = `[Security & Fraud Detection Scan]
• Verification Status: FAILED (Flagged as Fraudulent / Fake Data)
• Risk Assessment Score: 99.4% (Critical Risk Alert)
• File Inspected: ${fileName}
• Issues Identified:
  1. Forged transaction header signatures.
  2. Mismatched Stripe Gateway authorization certificates.
  3. Suspicious phishing links embedded inside PDF anchors.
  4. Content does not correlate with real billing history.
• Conclusion: This attachment contains fake/unwanted data. Blocked by AI Integrity scanner.`;
    } else if (category === 'Payment' || name.includes('payment') || name.includes('receipt') || name.includes('refund')) {
      contentSummary = `[Receipt Metadata - VERIFIED]
• Verification Status: PASSED (Authentic Document)
• Merchant: Stripe Gateway / Helpdesk Checkout
• Customer Name: Aravind
• Amount: $49.00 USD
• Status: Deducted / Failed (Order Confirmation Timeout)
• Reference Code: CHRG-88349271`;
    } else if (category === 'Network' || name.includes('vpn') || name.includes('network') || name.includes('connect')) {
      contentSummary = `[System Log Metadata - VERIFIED]
• Verification Status: PASSED (Authentic Logs)
• Target Host: vpn.company.com
• Gateway IP: 198.51.100.42
• Event: Disconnect / Ping Timeout (Interval: 1800s)
• Error Code: SEC_ERROR_EXPIRED_SESSION`;
    } else {
      contentSummary = `[Document Text Metadata - VERIFIED]
• File: ${fileName}
• Title: Support Details Log
• Summary: Log report detailing system error parameters submitted by user.`;
    }

    return { size, pages, contentSummary, isFake };
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono text-[var(--text-tertiary)]">{ticket.id}</span>
            <Badge variant="status">{ticket.status}</Badge>
            {ticket.priority && <Badge variant="priority">{ticket.priority}</Badge>}
            {ticket.sentiment && <Badge variant="sentiment">{ticket.sentiment}</Badge>}
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{ticket.title}</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleReclassify} isLoading={isReclassifying}>
          <RefreshCw className="w-3.5 h-3.5" /> Reclassify
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <Card>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Description</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{ticket.description}</p>
            
            {/* Attachment block */}
            {ticket.attachment && (() => {
              const pdfDetails = getPdfDetails(ticket.attachment, ticket.category);
              return (
                <div className={cn(
                  "mt-4 p-4 rounded-xl space-y-3 border",
                  pdfDetails.isFake 
                    ? "bg-red-500/5 border-red-500/20" 
                    : "bg-[var(--bg-tertiary)] border-[var(--border-primary)]"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center",
                        pdfDetails.isFake ? "bg-red-500/10 text-red-400" : "bg-primary-500/10 text-primary-400"
                      )}>
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--text-primary)]">{ticket.attachment}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)]">PDF Document • {pdfDetails.size} • {pdfDetails.pages} page(s)</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-1 text-xs"
                      onClick={() => handleDownload(ticket.attachment!, pdfDetails.contentSummary)}
                    >
                      <Download className="w-3 h-3" /> Download
                    </Button>
                  </div>
                  
                  {/* Extracted content detail container */}
                  <div className={cn(
                    "p-3 rounded-lg border space-y-2",
                    pdfDetails.isFake 
                      ? "bg-red-500/5 border-red-500/20" 
                      : "bg-[var(--bg-secondary)] border-[var(--border-primary)]"
                  )}>
                    <div className={cn(
                      "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider",
                      pdfDetails.isFake ? "text-red-400" : "text-primary-400"
                    )}>
                      <Brain className="w-3.5 h-3.5" /> 
                      {pdfDetails.isFake ? "AI Fraud Scanner - Flagged Attachment" : "AI OCR Extracted Content"}
                    </div>
                    <pre className={cn(
                      "text-xs font-mono whitespace-pre-wrap leading-relaxed p-2.5 rounded-md border",
                      pdfDetails.isFake
                        ? "text-red-300 bg-red-950/20 border-red-500/10 font-medium"
                        : "text-[var(--text-secondary)] bg-[var(--bg-tertiary)]/50 border-[var(--border-primary)]/50"
                    )}>
                      {pdfDetails.contentSummary}
                    </pre>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--border-primary)]">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]"><User className="w-3.5 h-3.5" /> {ticket.user_id}</div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]"><Clock className="w-3.5 h-3.5" /> {formatRelative(ticket.created_at)}</div>
            </div>
          </Card>

          {/* AI Root Cause */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-primary-400" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI Root Cause Analysis</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {ticket.ai_root_cause || 'The AI is analyzing the ticket parameters and system telemetry logs for potential triggers.'}
            </p>
          </Card>

          {/* AI Resolution */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Suggested Resolution</h3>
            </div>
            <pre className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed font-sans">
              {ticket.ai_suggested_resolution || '1. Verify checkout sessions on billing console.\n2. Re-trigger Stripe confirmation hook.\n3. Mark order as confirmed manually.'}
            </pre>
          </Card>

          {/* Timeline */}
          <Card>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Activity Timeline</h3>
            <TicketTimeline />
          </Card>
        </div>

        {/* Sidebar: AI Insights */}
        <div>
          <AIInsightsPanel insights={insights} />
        </div>
      </div>
    </div>
  );
}

