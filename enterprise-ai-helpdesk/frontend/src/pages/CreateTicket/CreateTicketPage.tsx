import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TicketForm, { type TicketFormData } from '@/components/ticket/TicketForm';
import AIInsightsPanel from '@/components/ticket/AIInsightsPanel';
import type { AIInsights } from '@/types';
import { Sparkles } from 'lucide-react';

import { ticketStore } from '@/utils/ticketStore';

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState<AIInsights | null>(null);

  // Simulate AI preview based on submitted form category and attachment data
  const showPreview = (category: string, isFakeFile: boolean, fileName: string | null) => {
    if (isFakeFile) {
      setAiPreview({
        predicted_category: 'Spam / Fake',
        category_confidence: 0.99,
        predicted_priority: 'Low',
        priority_confidence: 0.98,
        sentiment: 'Neutral',
        is_frustrated: false,
        escalation_recommended: false,
        is_duplicate: false,
        duplicate_matches: [],
        fake_attachment_detected: true,
        fake_file_name: fileName,
      });
    } else {
      setAiPreview({
        predicted_category: category,
        category_confidence: 0.94,
        predicted_priority: category === 'Payment' || category === 'Security' ? 'High' : 'Medium',
        priority_confidence: 0.88,
        sentiment: 'Negative',
        is_frustrated: true,
        escalation_recommended: category === 'Payment',
        is_duplicate: false,
        duplicate_matches: [],
      });
    }
  };

  const handleSubmit = async (data: TicketFormData) => {
    setIsLoading(true);
    try {
      const files = data.attachment as FileList | undefined;
      const file = files && files.length > 0 ? files[0] : null;
      const isFakeFile = file ? (
        file.name.toLowerCase().includes('fake') ||
        file.name.toLowerCase().includes('spam') ||
        file.name.toLowerCase().includes('unwanted') ||
        file.name.toLowerCase().includes('irrelevant')
      ) : false;

      // Add to ticketStore so the dashboard counts change dynamically!
      ticketStore.addTicket(
        data.subject,
        data.description,
        data.category,
        data.category === 'Payment' || data.category === 'Security' ? 'High' : 'Medium',
        'Negative',
        isFakeFile,
        file ? file.name : null
      );

      showPreview(data.category, isFakeFile, file ? file.name : null);
      // Wait longer (4s) if showing fake alert so they can read the warning banner
      setTimeout(() => navigate('/tickets'), isFakeFile ? 4000 : 2000);
    } catch {
      setIsLoading(false);
    }
  };



  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create Ticket</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Submit a new support request — AI will automatically classify and prioritize it</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-primary-400" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Ticket Details</h2>
            </div>
            <TicketForm onSubmit={handleSubmit} isLoading={isLoading} />
          </motion.div>
        </div>

        {/* AI Preview */}
        <div>
          {aiPreview ? (
            <AIInsightsPanel insights={aiPreview} />
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">AI Analysis</h3>
              <p className="text-xs text-[var(--text-tertiary)]">AI predictions will appear here after you submit the ticket</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
