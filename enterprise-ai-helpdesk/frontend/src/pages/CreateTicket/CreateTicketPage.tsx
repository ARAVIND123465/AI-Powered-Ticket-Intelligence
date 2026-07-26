import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TicketForm, { type TicketFormData } from '@/components/ticket/TicketForm';
import AIInsightsPanel from '@/components/ticket/AIInsightsPanel';
import ScreenshotAnalyzer from '@/components/ticket/ScreenshotAnalyzer';
import type { AIInsights, DocumentValidationResult } from '@/types';
import { Sparkles, Keyboard, Camera } from 'lucide-react';
import { toast } from 'sonner';

import { ticketStore } from '@/utils/ticketStore';
import { ticketService } from '@/services/ticket.service';

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState<AIInsights | null>(null);
  
  // Tab state: manual ticket creation or screenshot uploader workspace
  const [activeTab, setActiveTab] = useState<'manual' | 'screenshot'>('manual');
  
  // State for dynamic ticket pre-filling from OCR analysis
  const [formKey, setFormKey] = useState(0);
  const [formDefaultValues, setFormDefaultValues] = useState<Partial<TicketFormData>>({
    name: '',
    email: '',
    category: 'Payment',
    subject: '',
    description: '',
  });

  // Simulate AI preview based on submitted form category and attachment data
  const showPreview = (category: string, isFakeFile: boolean, fileName: string | null, docValidation?: DocumentValidationResult | null) => {
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
        document_validation: docValidation || null,
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
        document_validation: docValidation || null,
      });
    }
  };

  const handleSubmit = async (data: TicketFormData) => {
    setIsLoading(true);
    try {
      const files = data.attachment as FileList | undefined;
      const file = files && files.length > 0 ? files[0] : null;
      
      // Exclude PDFs from fake checking so they are always processed accurately
      const isFakeFile = file && !file.name.toLowerCase().endsWith('.pdf') ? (
        file.name.toLowerCase().includes('fake') ||
        file.name.toLowerCase().includes('spam') ||
        file.name.toLowerCase().includes('unwanted') ||
        file.name.toLowerCase().includes('irrelevant')
      ) : false;

      // Run document validation on image attachments
      let docValidation: DocumentValidationResult | null = null;
      if (file && !file.name.toLowerCase().endsWith('.pdf') && file.type.startsWith('image/')) {
        try {
          docValidation = await ticketService.validateDocument(file);
          if (!docValidation.is_ticket) {
            // Show fraud warning but don't block manual submission entirely
            toast.error(
              `⚠️ Uploaded image detected as "${docValidation.document_type}" — Not an IT support ticket (Fraud Score: ${docValidation.fraud_score}/100)`,
              { duration: 6000 }
            );
          }
        } catch (err) {
          console.warn("Document validation failed, proceeding without validation.", err);
        }
      }

      // 1. Analyze PDF if uploaded
      let pdfExtractedText: string | null = null;
      let pdfSummary: string | null = null;

      if (file && file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const pdfAnalysis = await ticketService.analyzePdf(file);
          pdfExtractedText = pdfAnalysis.pdf_text;
          pdfSummary = pdfAnalysis.summary;
        } catch (err) {
          console.error("Failed to analyze PDF via backend API. Proceeding with fallback local summary.", err);
          pdfExtractedText = `[Offline PDF Extraction Fallback for ${file.name}]`;
          pdfSummary = `[Offline Analysis Report]\n• Status: PENDING (Failed to reach server for active OCR extraction)\n• File: ${file.name}\n• Detail: Could not run real-time AI classification because API endpoint is unreachable. Use standard manual troubleshooting.`;
        }
      }

      // 2. Ingest into the backend API database (if online)
      let aiInsightsResponse: AIInsights | null = null;
      try {
        const createdTicket = await ticketService.create({
          subject: data.subject,
          description: data.description,
          category_override: data.category,
        });
        
        // Map backend insights back to AIInsights structure
        if (createdTicket.ai_insights) {
          aiInsightsResponse = {
            ...createdTicket.ai_insights,
            document_validation: docValidation,
          };
        }
      } catch (err) {
        console.warn("FastAPI backend is offline or creation errored. Operating in fallback client mode.", err);
      }

      // 3. Add to ticketStore so the dashboard counts change dynamically!
      const isDetectedFake = isFakeFile || (docValidation ? !docValidation.is_ticket : false);
      ticketStore.addTicket(
        data.subject,
        data.description,
        data.category,
        data.category === 'Payment' || data.category === 'Security' ? 'High' : 'Medium',
        'Negative',
        isDetectedFake,
        file ? file.name : null,
        pdfExtractedText,
        pdfSummary
      );

      // 4. Render AI insights panel
      if (aiInsightsResponse) {
        setAiPreview(aiInsightsResponse);
      } else {
        showPreview(data.category, isDetectedFake, file ? file.name : null, docValidation);
      }

      toast.success("Ticket submitted successfully!");
      // Wait longer (4s) if showing fake alert so they can read the warning banner
      setTimeout(() => navigate('/tickets'), isDetectedFake ? 4000 : 2000);
    } catch (err) {
      toast.error("Failed to submit support ticket.");
      setIsLoading(false);
    }
  };

  const handleApplyAnalysis = (ocrText: string, fields: any, sandboxMode: boolean) => {
    // Populate form variables with AI-extracted screenshot details
    setFormDefaultValues({
      name: localStorage.getItem('mock_user_name') || 'Aravind',
      email: localStorage.getItem('mock_registered_email') || 'aravind@gmail.com',
      category: fields.category || 'Payment',
      subject: fields.subject || '',
      description: fields.description || '',
    });
    
    // Increment form key to trigger React Hook Form remount with new defaultValues
    setFormKey(prev => prev + 1);
    
    // Switch to form editing tab
    setActiveTab('manual');
    
    // Alert user
    toast.success("Extracted screenshot metrics loaded into the ticket form.");
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create Ticket</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Submit a new support request — AI will automatically classify and prioritize it</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-[var(--bg-tertiary)] rounded-xl p-1 border border-[var(--border-primary)]">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'manual'
                ? 'bg-[var(--bg-secondary)] text-primary-400 shadow-sm'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" /> Manual Ticket
          </button>
          <button
            onClick={() => setActiveTab('screenshot')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'screenshot'
                ? 'bg-[var(--bg-secondary)] text-primary-400 shadow-sm'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Screenshot (AI)
          </button>
        </div>
      </motion.div>

      {/* Main Workspace Layout */}
      {activeTab === 'screenshot' ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Camera className="w-5 h-5 text-primary-400" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">AI Screenshot Analysis Workspace</h2>
          </div>
          <ScreenshotAnalyzer onApplyAnalysis={handleApplyAnalysis} />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Ticket Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-5 h-5 text-primary-400" />
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Ticket Details</h2>
              </div>
              <TicketForm key={formKey} onSubmit={handleSubmit} isLoading={isLoading} defaultValues={formDefaultValues} />
            </motion.div>
          </div>

          {/* AI Insights Sidebar */}
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
      )}
    </div>
  );
}
