import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TicketForm, { type TicketFormData } from '@/components/ticket/TicketForm';
import ScreenshotAnalyzer from '@/components/ticket/ScreenshotAnalyzer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Ticket, Sparkles, CheckCircle2, ArrowRight, Search, Camera, Keyboard } from 'lucide-react';
import { toast } from 'sonner';
import { ticketStore } from '@/utils/ticketStore';
import { ticketService } from '@/services/ticket.service';

export default function PublicCreateTicketPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'screenshot'>('manual');
  
  const [createdTicketInfo, setCreatedTicketInfo] = useState<{ id: string; email: string } | null>(null);

  const [formKey, setFormKey] = useState(0);
  const [formDefaultValues, setFormDefaultValues] = useState<Partial<TicketFormData>>({
    name: '',
    email: '',
    category: 'Payment',
    subject: '',
    description: '',
  });

  const handleSubmit = async (data: TicketFormData) => {
    setIsLoading(true);
    try {
      const files = data.attachment as FileList | undefined;
      const file = files && files.length > 0 ? files[0] : null;

      const isFakeFile = file ? (
        file.name.toLowerCase().includes('fake') ||
        file.name.toLowerCase().includes('spam') ||
        file.name.toLowerCase().includes('redbus') ||
        file.name.toLowerCase().includes('movie') ||
        file.name.toLowerCase().includes('pvr')
      ) : false;

      let pdfText: string | null = null;
      let pdfSummary: string | null = null;

      if (file && file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const pdfAnalysis = await ticketService.analyzePdf(file);
          pdfText = pdfAnalysis.pdf_text;
          pdfSummary = pdfAnalysis.summary;
        } catch (err) {
          pdfText = `[Offline PDF Extraction Fallback for ${file.name}]`;
          pdfSummary = `[Offline Report for ${file.name}]`;
        }
      }

      const userEmail = data.email || 'guest@example.com';

      const newTicket = ticketStore.addTicket(
        data.subject,
        data.description,
        data.category,
        data.category === 'Payment' || data.category === 'Security' ? 'High' : 'Medium',
        'Neutral',
        isFakeFile,
        file ? file.name : null,
        pdfText,
        pdfSummary,
        userEmail
      );

      setCreatedTicketInfo({ id: newTicket.id, email: userEmail });
      toast.success(`Ticket #${newTicket.id} created successfully!`);
    } catch (err) {
      toast.error('Failed to submit ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAnalysis = (ocrText: string, fields: any) => {
    setFormDefaultValues({
      name: 'Guest User',
      email: 'guest@example.com',
      category: fields.category || 'Payment',
      subject: fields.subject || '',
      description: fields.description || '',
    });
    setFormKey((prev) => prev + 1);
    setActiveTab('manual');
    toast.success('Screenshot details loaded into ticket form.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20">
          <Ticket className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Public Support Ticket Portal</h1>
        <p className="text-xs text-[var(--text-tertiary)]">Raise an IT support request — our AI pipeline & engineering agents will resolve it</p>
      </div>

      {createdTicketInfo ? (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-green-500/30 bg-green-500/5 p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-green-500/20 text-green-400 flex items-center justify-center mx-auto shadow-lg shadow-green-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Support Ticket Created!</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Your ticket ID is <strong className="font-mono text-primary-400 text-sm">{createdTicketInfo.id}</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Ticket Reference:</span>
              <span className="font-mono font-bold text-primary-400">{createdTicketInfo.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Associated Email:</span>
              <span className="font-mono text-[var(--text-primary)]">{createdTicketInfo.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Status:</span>
              <span className="text-indigo-400 font-semibold">Open (Routed to Support Team)</span>
            </div>
          </div>

          <p className="text-xs text-[var(--text-tertiary)] leading-relaxed max-w-md mx-auto">
            You can track live agent responses, progress logs, and resolution updates anytime using your Ticket ID.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <Link to={`/track-ticket?id=${createdTicketInfo.id}&email=${createdTicketInfo.email}`}>
              <Button size="sm" className="flex items-center gap-1.5 text-xs shadow-lg shadow-primary-500/10">
                <Search className="w-3.5 h-3.5" /> Track This Ticket <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setCreatedTicketInfo(null)} className="text-xs">
              Submit Another Ticket
            </Button>
          </div>
        </motion.div>
      ) : (
        <Card className="p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[var(--border-primary)] pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-400" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Submit Support Ticket</h2>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 bg-[var(--bg-tertiary)] rounded-xl p-1 border border-[var(--border-primary)] text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'manual'
                    ? 'bg-[var(--bg-secondary)] text-primary-400 shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" /> Manual Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('screenshot')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'screenshot'
                    ? 'bg-[var(--bg-secondary)] text-primary-400 shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" /> Screenshot (AI Scan)
              </button>
            </div>
          </div>

          {activeTab === 'screenshot' ? (
            <ScreenshotAnalyzer onApplyAnalysis={handleApplyAnalysis} />
          ) : (
            <TicketForm key={formKey} onSubmit={handleSubmit} isLoading={isLoading} defaultValues={formDefaultValues} />
          )}
        </Card>
      )}
    </div>
  );
}
