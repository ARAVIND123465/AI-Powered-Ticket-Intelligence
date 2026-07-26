import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sliders, Play, Save, Code, Cpu } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'sonner';

export default function SAAIConfigTab() {
  const [provider, setProvider] = useState('Gemini');
  const [model, setModel] = useState('gemini-1.5-pro');
  const [threshold, setThreshold] = useState(0.85);

  const [toggles, setToggles] = useState({
    classification: true,
    priority: true,
    sentiment: true,
    ocr: true,
    docProcessing: true,
  });

  const [prompts, setPrompts] = useState({
    classification: 'Classify this IT support request into one of the following: Login, Payment, Refund, Technical, Delivery, Account, Security, Billing, Bug, Feature Request.',
    resolution: 'Provide a step-by-step troubleshooting guide based on this IT error message and past logs.',
  });

  const handleSave = () => {
    toast.success('Global AI model configuration settings updated.');
  };

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border-primary)] last:border-0">
      <span className="text-xs text-[var(--text-secondary)] font-medium">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-primary-600' : 'bg-[var(--bg-tertiary)] border border-[var(--border-primary)]'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : ''}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">AI Core Configuration</h3>
          <p className="text-xs text-[var(--text-tertiary)] font-semibold">Fine-tune global LLM services, classifier features, and prompt matrices</p>
        </div>
        <Button size="sm" onClick={handleSave} className="flex items-center gap-1.5 text-xs">
          <Save className="w-3.5 h-3.5" /> Save AI Configuration
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core parameters & features toggles */}
        <div className="lg:col-span-2 space-y-4">
          {/* LLM settings */}
          <Card className="p-6 space-y-4">
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" /> LLM Provider Settings
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Provider Selection</label>
                <select
                  value={provider}
                  onChange={e => setProvider(e.target.value)}
                  className="w-full h-10 rounded-xl border bg-[var(--bg-tertiary)] border-[var(--border-primary)] text-sm text-[var(--text-primary)] px-3 focus:outline-none"
                >
                  <option value="OpenAI">OpenAI (GPT-4o)</option>
                  <option value="Anthropic">Anthropic (Claude 3.5)</option>
                  <option value="Gemini">Google DeepMind (Gemini)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Model Select</label>
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full h-10 rounded-xl border bg-[var(--bg-tertiary)] border-[var(--border-primary)] text-sm text-[var(--text-primary)] px-3 focus:outline-none"
                >
                  {provider === 'Gemini' ? (
                    <>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    </>
                  ) : provider === 'OpenAI' ? (
                    <>
                      <option value="gpt-4o">gpt-4o</option>
                      <option value="gpt-4-turbo">gpt-4-turbo</option>
                    </>
                  ) : (
                    <>
                      <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                      <option value="claude-3-haiku">Claude 3 Haiku</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-[var(--text-secondary)]">
                <span>Confidence Threshold</span>
                <span className="font-mono text-primary-400">{Math.round(threshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.99"
                step="0.01"
                value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <p className="text-[10px] text-[var(--text-tertiary)]">AI operations scoring below this limit will require manual approval before auto-assigning status.</p>
            </div>
          </Card>

          {/* Prompt management */}
          <Card className="p-6 space-y-4">
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-4 h-4 text-amber-400" /> Prompt Instruction System
            </h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Classification System Instructions</label>
                <textarea
                  value={prompts.classification}
                  onChange={e => setPrompts({ ...prompts, classification: e.target.value })}
                  rows={3}
                  className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Resolution Suggestions System instructions</label>
                <textarea
                  value={prompts.resolution}
                  onChange={e => setPrompts({ ...prompts, resolution: e.target.value })}
                  rows={3}
                  className="w-full p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Feature toggles */}
        <Card className="p-6 h-fit space-y-4">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-emerald-400" /> Core ML Modules
          </h4>
          <div className="divide-y divide-[var(--border-primary)]">
            <Toggle checked={toggles.classification} onChange={v => setToggles({ ...toggles, classification: v })} label="Automatic Classification" />
            <Toggle checked={toggles.priority} onChange={v => setToggles({ ...toggles, priority: v })} label="AI Priority Prediction" />
            <Toggle checked={toggles.sentiment} onChange={v => setToggles({ ...toggles, sentiment: v })} label="Sentiment Analysis" />
            <Toggle checked={toggles.ocr} onChange={v => setToggles({ ...toggles, ocr: v })} label="OCR Screening Services" />
            <Toggle checked={toggles.docProcessing} onChange={v => setToggles({ ...toggles, docProcessing: v })} label="Dynamic Doc Processing" />
          </div>
        </Card>
      </div>
    </div>
  );
}
