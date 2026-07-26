import { useState, useCallback, useRef } from 'react';
import { Upload, FileImage, ShieldAlert, ShieldCheck, Sparkles, CheckCircle2, Loader2, FileText, Percent, Server, Layers, XCircle, AlertTriangle, ScanBarcode, QrCode, Image, PenTool } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import { ticketService } from '@/services/ticket.service';
import type { DocumentValidationResult } from '@/types';

interface ScreenshotAnalyzerProps {
  onApplyAnalysis: (ocrText: string, fields: any, sandboxMode: boolean) => void;
}

type StepState = 'idle' | 'uploading' | 'ocr' | 'structuring' | 'validating' | 'done' | 'error';

export default function ScreenshotAnalyzer({ onApplyAnalysis }: ScreenshotAnalyzerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [step, setStep] = useState<StepState>('idle');
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [isSandbox, setIsSandbox] = useState(false);
  const [validationResult, setValidationResult] = useState<DocumentValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        processFile(droppedFile);
      } else {
        toast.error("Invalid file type. Please upload an image (PNG, JPG, JPEG, WEBP).");
      }
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, []);

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setStep('idle');
    setOcrText(null);
    setAnalysisResult(null);
    setValidationResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setStep('uploading');
    setValidationResult(null);
    
    // Simulate progression steps for rich visual feedback
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      // Step 1: Uploading
      await sleep(800);
      setStep('ocr');
      
      // Step 2: OCR Text Extraction
      await sleep(1000);
      setStep('structuring');
      
      // Step 3: Call FastAPI screenshot analysis endpoint
      const result = await ticketService.analyzeScreenshot(file);
      await sleep(600);
      
      setOcrText(result.ocr_text);
      setAnalysisResult(result.ticket_fields);
      setIsSandbox(result.sandbox_mode);

      // Step 4: Document Validation — Fraud/Fake Detection
      setStep('validating');
      try {
        const validation = await ticketService.validateDocument(file);
        setValidationResult(validation);
        
        if (!validation.is_ticket) {
          toast.error(
            `⚠️ This is not a valid IT support ticket. Detected: ${validation.document_type}`,
            { duration: 6000 }
          );
        } else if (!validation.is_valid) {
          toast.warning(
            `Document appears suspicious (Fraud Score: ${validation.fraud_score}/100)`,
            { duration: 5000 }
          );
        }
      } catch (validationErr) {
        logger.error("Document validation failed", validationErr);
        // Non-blocking: validation failure shouldn't block the regular flow
      }
      
      setStep('done');
      
      if (result.sandbox_mode) {
        toast.warning("Gemini API key is not configured. Running in offline sandbox mode.", {
          duration: 5000,
        });
      } else if (!validationResult || validationResult?.is_ticket) {
        toast.success("AI Screenshot analysis completed successfully!");
      }
    } catch (err: any) {
      logger.error("Analysis failure", err);
      setStep('error');
      toast.error(err.response?.data?.detail || "Screenshot analysis failed. Please try again.");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setOcrText(null);
    setAnalysisResult(null);
    setStep('idle');
    setIsSandbox(false);
    setValidationResult(null);
  };

  const handleApply = () => {
    if (analysisResult && ocrText) {
      onApplyAnalysis(ocrText, analysisResult, isSandbox);
    }
  };

  // Fraud score gauge color
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

  // Helper to format confidence levels
  const renderConfidenceBar = (score: number = 0.90) => {
    const percentage = Math.round(score * 100);
    let colorClass = "bg-green-500";
    if (score < 0.70) colorClass = "bg-red-500";
    else if (score < 0.85) colorClass = "bg-amber-500";

    return (
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden">
          <div className={`h-1.5 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-secondary)]">{percentage}%</span>
      </div>
    );
  };

  // Whether the document is blocked from creating a ticket
  const isDocumentBlocked = validationResult && !validationResult.is_ticket;

  return (
    <div className="space-y-6">
      {/* File Selection / Dropzone */}
      {!previewUrl && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
            dragActive
              ? "border-primary-500 bg-primary-500/5 scale-[1.01]"
              : "border-[var(--border-primary)] hover:border-primary-500 hover:bg-[var(--bg-secondary)]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-primary-400" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Drag and drop screenshot here</h3>
          <p className="text-xs text-[var(--text-tertiary)] max-w-xs mx-auto mb-3">
            Supports PNG, JPG, JPEG, and WEBP. Drag desktop screenshots, mobile app errors, or browser logs directly.
          </p>
          <Button type="button" size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>
            Select Screenshot
          </Button>
        </div>
      )}

      {/* Uploaded File Workspace */}
      {previewUrl && (
        <div className="space-y-4">
          {isSandbox && (
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs flex items-center gap-2.5 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 shrink-0 animate-pulse text-amber-500" />
              <span>
                <strong>Offline Sandbox Mode:</strong> Gemini API key is not configured in backend settings. The system is running local diagnostic simulations.
              </span>
            </div>
          )}

          {/* ============================================================ */}
          {/* FRAUD DETECTION WARNING BANNER                               */}
          {/* ============================================================ */}
          {validationResult && !validationResult.is_ticket && step === 'done' && (
            <div className="rounded-2xl border-2 border-red-500/30 bg-gradient-to-br from-red-500/10 via-red-900/5 to-transparent p-5 space-y-4 animate-fadeIn">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                    <span>⚠️ Fake / Irrelevant Document Detected</span>
                  </h3>
                  <p className="text-xs text-red-300/90 mt-1 leading-relaxed">
                    This document has been scanned and identified as a <strong className="text-red-300 font-bold">{validationResult.company_name && validationResult.company_name !== 'N/A' ? `${validationResult.company_name} ` : ''}{validationResult.document_type}</strong>. This is not a valid IT support error screenshot and cannot be used to submit a helpdesk ticket.
                  </p>
                </div>
              </div>

              {/* Fraud Score Gauge */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[var(--bg-tertiary)] p-3 space-y-2">
                  <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider">Fraud Score</span>
                  <div className="flex items-end gap-2">
                    <span className={`text-2xl font-black ${getFraudScoreColor(validationResult.fraud_score)}`}>
                      {validationResult.fraud_score}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)] mb-1">/100</span>
                  </div>
                  <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${getFraudScoreBg(validationResult.fraud_score)} transition-all duration-1000`}
                      style={{ width: `${validationResult.fraud_score}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-xl bg-[var(--bg-tertiary)] p-3 space-y-2">
                  <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider">Classification Confidence</span>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-primary-400">{validationResult.confidence}</span>
                    <span className="text-xs text-[var(--text-tertiary)] mb-1">%</span>
                  </div>
                  <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-primary-500 transition-all duration-1000"
                      style={{ width: `${validationResult.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="rounded-xl bg-[var(--bg-tertiary)] p-3 space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider">Analysis Reason</span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{validationResult.reason}</p>
              </div>

              {/* Document Markers */}
              <div className="grid grid-cols-4 gap-2">
                <div className={`rounded-lg p-2 text-center text-[10px] font-medium ${
                  validationResult.barcode_present ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                }`}>
                  <ScanBarcode className="w-3.5 h-3.5 mx-auto mb-1" />
                  Barcode {validationResult.barcode_present ? '✓' : '✗'}
                </div>
                <div className={`rounded-lg p-2 text-center text-[10px] font-medium ${
                  validationResult.qr_code_present ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                }`}>
                  <QrCode className="w-3.5 h-3.5 mx-auto mb-1" />
                  QR Code {validationResult.qr_code_present ? '✓' : '✗'}
                </div>
                <div className={`rounded-lg p-2 text-center text-[10px] font-medium ${
                  validationResult.logo_present ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                }`}>
                  <Image className="w-3.5 h-3.5 mx-auto mb-1" />
                  Logo {validationResult.logo_present ? '✓' : '✗'}
                </div>
                <div className={`rounded-lg p-2 text-center text-[10px] font-medium ${
                  validationResult.signature_present ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                }`}>
                  <PenTool className="w-3.5 h-3.5 mx-auto mb-1" />
                  Signature {validationResult.signature_present ? '✓' : '✗'}
                </div>
              </div>

              {/* Blocked Action Message */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-xs text-red-400 font-semibold">This document is not suitable for IT ticket creation. Please upload a valid error screenshot.</span>
              </div>
            </div>
          )}

          {/* VALID TICKET CONFIRMATION BANNER */}
          {validationResult && validationResult.is_ticket && validationResult.is_valid && step === 'done' && (
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 flex items-start gap-3 animate-fadeIn">
              <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-green-400">✅ Valid IT Support Ticket Detected</h4>
                <p className="text-[10px] text-green-300/70 mt-0.5 leading-relaxed">
                  Document verified as a legitimate IT Support Ticket (Fraud Score: {validationResult.fraud_score}/100, Confidence: {validationResult.confidence}%). Ready for ticket creation.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Image Preview and Action */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden p-3">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <FileImage className="w-3.5 h-3.5 text-primary-400" /> Image Preview
                </span>
                <button onClick={handleReset} className="text-xs text-red-400 hover:underline">
                  Remove
                </button>
              </div>
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
                <img src={previewUrl} alt="Screenshot" className="max-h-full max-w-full object-contain" />
              </div>
              
              {file && (
                <div className="mt-3 px-1 text-xs text-[var(--text-tertiary)] flex justify-between">
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
            </div>

            {/* Ingestion Controller */}
            {step === 'idle' && (
              <Button onClick={handleAnalyze} className="w-full flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> Run AI Ingestion
              </Button>
            )}

            {/* Stepper progress indicator */}
            {step !== 'idle' && step !== 'done' && step !== 'error' && (
              <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5 space-y-4">
                <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-primary-400 animate-spin" /> Ingestion Status
                </h4>
                
                <div className="space-y-3">
                  {/* Step 1: Upload */}
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step === 'uploading' ? 'bg-primary-500 text-white' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {step === 'uploading' ? '1' : <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    </div>
                    <span className={`text-xs font-medium ${step === 'uploading' ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                      Uploading screenshot file
                    </span>
                  </div>

                  {/* Step 2: OCR */}
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step === 'ocr' ? 'bg-primary-500 text-white' : step === 'uploading' ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {step === 'uploading' || step === 'ocr' ? '2' : <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    </div>
                    <span className={`text-xs font-medium ${step === 'ocr' ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                      Extracting text details (OCR)
                    </span>
                  </div>

                  {/* Step 3: Vision */}
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step === 'structuring' ? 'bg-primary-500 text-white' : ['uploading', 'ocr'].includes(step) ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {['uploading', 'ocr', 'structuring'].includes(step) ? '3' : <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    </div>
                    <span className={`text-xs font-medium ${step === 'structuring' ? 'text-[var(--text-primary)] animate-pulse' : 'text-[var(--text-tertiary)]'}`}>
                      Structuring details via Gemini Vision
                    </span>
                  </div>

                  {/* Step 4: Document Validation */}
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step === 'validating' ? 'bg-amber-500 text-white animate-pulse' : ['uploading', 'ocr', 'structuring'].includes(step) ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {step === 'validating' ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : '4'}
                    </div>
                    <span className={`text-xs font-medium ${step === 'validating' ? 'text-[var(--text-primary)] animate-pulse' : 'text-[var(--text-tertiary)]'}`}>
                      Validating document authenticity
                    </span>
                  </div>
                </div>
              </div>
            )}

            {step === 'error' && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-center">
                <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">Analysis Failed</h4>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 mb-3">Something went wrong. Let's try again.</p>
                <Button size="sm" variant="outline" onClick={handleAnalyze} className="w-full">
                  Retry Analysis
                </Button>
              </div>
            )}

            {step === 'done' && (
              <div className="space-y-3">
                <div className={`rounded-2xl border p-4 text-center ${
                  isDocumentBlocked
                    ? 'border-red-500/20 bg-red-500/5'
                    : 'border-green-500/20 bg-green-500/5'
                }`}>
                  {isDocumentBlocked ? (
                    <>
                      <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <h4 className="text-sm font-semibold text-red-400">Wrong Document Type</h4>
                      <p className="text-xs text-red-300/70 mt-1">
                        Detected: <strong>{validationResult?.company_name && validationResult?.company_name !== 'N/A' ? `${validationResult?.company_name} ` : ''}{validationResult?.document_type}</strong> — Not a valid IT ticket
                      </p>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">Analysis Completed</h4>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">Ticket fields are ready for preview.</p>
                    </>
                  )}
                </div>

                {!isDocumentBlocked && (
                  <Button onClick={handleApply} className="w-full flex items-center justify-center gap-2 shadow-lg shadow-primary-500/10">
                    <Sparkles className="w-4 h-4" /> Pre-fill Ticket & Edit
                  </Button>
                )}
                
                <Button variant="outline" onClick={handleReset} className="w-full">
                  {isDocumentBlocked ? 'Upload Different Screenshot' : 'Reset Uploader'}
                </Button>
              </div>
            )}
          </div>

          {/* Right panel: Dual-Pane Workspace (OCR text & AI extracted fields) */}
          <div className="lg:col-span-2 space-y-4">
            {step !== 'done' ? (
              <div className="rounded-2xl border border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)] h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center">
                <Sparkles className="w-8 h-8 text-[var(--text-tertiary)] mb-2 animate-pulse" />
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">AI Workspace Inactive</h4>
                <p className="text-xs text-[var(--text-tertiary)] max-w-xs">
                  Run the AI Ingestion pipeline on the screenshot image to populate this space with OCR text and suggested routing variables.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                {/* Pane A: OCR Text */}
                <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] flex flex-col h-[400px]">
                  <div className="px-4 py-3 border-b border-[var(--border-primary)] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary-400" />
                    <span className="text-xs font-semibold text-[var(--text-primary)]">Extracted Text (OCR)</span>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap bg-[var(--bg-tertiary)] rounded-b-2xl">
                    {/* Show validation OCR text if available and differs from analysis */}
                    {validationResult && !validationResult.is_ticket ? (
                      <div className="space-y-3">
                        <div className="text-red-400 text-[10px] uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Detected Document Content
                        </div>
                        <div className="text-[var(--text-secondary)]">{validationResult.ocr_text}</div>
                        {validationResult.description && (
                          <div className="mt-3 pt-3 border-t border-[var(--border-primary)]">
                            <div className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] mb-1">Document Description</div>
                            <div className="text-[var(--text-secondary)]">{validationResult.description}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      ocrText || "No text could be extracted."
                    )}
                  </div>
                </div>

                {/* Pane B: AI Extraction checklist */}
                <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] flex flex-col h-[400px]">
                  <div className="px-4 py-3 border-b border-[var(--border-primary)] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary-400" /> AI Insights Preview
                    </span>
                    {isSandbox && <Badge variant="warning" size="sm">Sandbox</Badge>}
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {/* Show fraud detection info for blocked documents */}
                    {validationResult && !validationResult.is_ticket ? (
                      <div className="space-y-4">
                        {/* Document Type Classification */}
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-semibold text-red-400 tracking-wider">Document Classification</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">{validationResult.document_type}</Badge>
                            <Badge variant="priority">Blocked</Badge>
                          </div>
                        </div>

                        {/* Verification Status */}
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider">Verification Status</span>
                          <p className="text-xs font-medium text-amber-400">{validationResult.verification_status}</p>
                        </div>

                        {/* Fraud Score */}
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider">Fraud Score</span>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-[var(--bg-tertiary)] rounded-full h-2 overflow-hidden">
                              <div className={`h-2 rounded-full ${getFraudScoreBg(validationResult.fraud_score)}`} style={{ width: `${validationResult.fraud_score}%` }} />
                            </div>
                            <span className={`text-xs font-bold ${getFraudScoreColor(validationResult.fraud_score)}`}>{validationResult.fraud_score}/100</span>
                          </div>
                        </div>

                        <hr className="border-[var(--border-primary)]" />

                        {/* Company */}
                        {validationResult.company_name && validationResult.company_name !== 'N/A' && (
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider">Detected Company</span>
                            <p className="text-xs font-medium text-[var(--text-primary)]">{validationResult.company_name}</p>
                          </div>
                        )}

                        {/* Title */}
                        {validationResult.document_title && (
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider">Document Title</span>
                            <p className="text-xs font-medium text-[var(--text-primary)]">{validationResult.document_title}</p>
                          </div>
                        )}

                        {/* Reason */}
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider">Rejection Reason</span>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{validationResult.reason}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Normal analysis results - Error fields checklist */}
                        {analysisResult.error_message && (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider">Error Message</span>
                            <p className="text-xs font-medium text-[var(--text-primary)]">{analysisResult.error_message}</p>
                            {renderConfidenceBar(analysisResult.confidence_scores?.error_message)}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          {analysisResult.error_code && (
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider">Error Code</span>
                              <p className="text-xs font-mono font-medium text-[var(--text-primary)]">{analysisResult.error_code}</p>
                            </div>
                          )}

                          {analysisResult.app_name && (
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider">Application</span>
                              <p className="text-xs font-medium text-[var(--text-primary)] truncate">{analysisResult.app_name}</p>
                            </div>
                          )}
                        </div>

                        <hr className="border-[var(--border-primary)]" />

                        {/* Metadata Extraction Checklist */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider flex items-center gap-1">
                            <Layers className="w-3 h-3" /> Extracted Parameters
                          </span>
                          
                          <div className="space-y-1.5">
                            {analysisResult.extracted_data?.transaction_id && (
                              <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[var(--bg-tertiary)]">
                                <span className="text-[var(--text-secondary)] font-medium">Txn ID:</span>
                                <span className="font-mono text-[var(--text-primary)] font-semibold">{analysisResult.extracted_data.transaction_id}</span>
                              </div>
                            )}
                            {analysisResult.extracted_data?.invoice_number && (
                              <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[var(--bg-tertiary)]">
                                <span className="text-[var(--text-secondary)] font-medium">Invoice:</span>
                                <span className="font-mono text-[var(--text-primary)] font-semibold">{analysisResult.extracted_data.invoice_number}</span>
                              </div>
                            )}
                            {analysisResult.extracted_data?.order_id && (
                              <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[var(--bg-tertiary)]">
                                <span className="text-[var(--text-secondary)] font-medium">Order ID:</span>
                                <span className="font-mono text-[var(--text-primary)] font-semibold">{analysisResult.extracted_data.order_id}</span>
                              </div>
                            )}
                            {analysisResult.extracted_data?.user_id && (
                              <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[var(--bg-tertiary)]">
                                <span className="text-[var(--text-secondary)] font-medium">User:</span>
                                <span className="text-[var(--text-primary)] font-medium truncate max-w-[150px]">{analysisResult.extracted_data.user_id}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <hr className="border-[var(--border-primary)]" />

                        {/* Routing Variables */}
                        <div className="space-y-3">
                          <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider flex items-center gap-1">
                            <Server className="w-3 h-3" /> Auto-Routing Metrics
                          </span>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-2 rounded-xl bg-[var(--bg-tertiary)] flex flex-col justify-between">
                              <span className="text-[var(--text-tertiary)]">Category</span>
                              <span className="font-semibold text-primary-400 mt-1">{analysisResult.category}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-[var(--bg-tertiary)] flex flex-col justify-between">
                              <span className="text-[var(--text-tertiary)]">Priority</span>
                              <span className="font-semibold text-orange-400 mt-1">{analysisResult.priority}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-[var(--bg-tertiary)] flex flex-col justify-between">
                              <span className="text-[var(--text-tertiary)]">Department</span>
                              <span className="font-semibold text-[var(--text-primary)] mt-1">{analysisResult.department}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-[var(--bg-tertiary)] flex flex-col justify-between">
                              <span className="text-[var(--text-tertiary)]">Severity</span>
                              <span className="font-semibold text-red-400 mt-1">{analysisResult.severity}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

// Simple fallback logger since console logging can be replaced
const logger = {
  error: (msg: string, err: any) => console.error(`[ScreenshotAnalyzer] ${msg}:`, err)
};
