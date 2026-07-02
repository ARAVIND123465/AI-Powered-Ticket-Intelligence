import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { FileText, Download, Brain, Sparkles } from 'lucide-react';

export default function ReportsPage() {
  const [reportName, setReportName] = useState('Monthly Summary');
  const [lookbackDays, setLookbackDays] = useState('30');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setReport({
        generated_at: new Date().toISOString(),
        scope: `Last ${lookbackDays} days`,
        top_pain_points: ['VPN connectivity failures in NYC and London offices', 'Payment gateway timeout during peak hours (2-4pm EST)', 'SSO integration issues after Azure AD update'],
        systemic_bottlenecks: 'The Network team is understaffed by approximately 2 FTEs. 68% of Network tickets are being handled by a single engineer (Alex M.). Queue times average 4.2 hours vs the 2-hour SLA target.',
        recommended_kb_additions: ['VPN Split Tunnel configuration guide (would deflect ~15 tickets/week)', 'Stripe webhook retry policy documentation', 'Azure AD federation troubleshooting steps'],
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reports</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">AI-generated reports with actionable insights</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Report Configuration</h3>
          <div className="space-y-4">
            <Select label="Report Type" value={reportName} onChange={(e) => setReportName(e.target.value)} options={[
              { value: 'Monthly Summary', label: 'Monthly Summary' },
              { value: 'SLA Compliance', label: 'SLA Compliance' },
              { value: 'AI Performance', label: 'AI Model Performance' },
              { value: 'Engineer Workload', label: 'Engineer Workload' },
            ]} />
            <Input label="Lookback (days)" type="number" value={lookbackDays} onChange={(e) => setLookbackDays(e.target.value)} />
            <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full"><FileText className="w-4 h-4" /> Generate Report</Button>
          </div>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2">
          {report ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-400" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{reportName}</h3>
                  </div>
                  <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5" /> Export</Button>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mb-4">Generated just now • Scope: {report.scope}</p>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2">Top Pain Points</h4>
                    <ul className="space-y-1.5">
                      {report.top_pain_points.map((p: string, i: number) => (
                        <li key={i} className="text-sm text-[var(--text-primary)] flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2">Systemic Bottlenecks</h4>
                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">{report.systemic_bottlenecks}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2">Recommended KB Additions</h4>
                    <ul className="space-y-1.5">
                      {report.recommended_kb_additions.map((kb: string, i: number) => (
                        <li key={i} className="text-sm text-[var(--text-primary)] flex items-start gap-2">
                          <Brain className="w-3.5 h-3.5 text-primary-400 mt-0.5 flex-shrink-0" /> {kb}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-64 rounded-2xl border border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="text-center">
                <FileText className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3" />
                <p className="text-sm text-[var(--text-secondary)] font-medium">Configure and generate a report</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">AI will analyze your data and generate actionable insights</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
