import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Mail, Phone, MapPin, Clock, Zap, Shield, Bell, Brain,
  Save, Upload,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'sonner';
import type { CACompanySettings } from '../companyAdminData';

interface Props {
  settings: CACompanySettings;
  onUpdateSettings: (settings: CACompanySettings) => void;
}

export default function CASettingsTab({ settings, onUpdateSettings }: Props) {
  const [s, setS] = useState<CACompanySettings>({ ...settings });
  const [activeSection, setActiveSection] = useState('company');

  const handleSave = () => {
    onUpdateSettings(s);
    toast.success('Company settings saved successfully');
  };

  const sections = [
    { id: 'company', label: 'Company Info', icon: Building2 },
    { id: 'hours', label: 'Working Hours', icon: Clock },
    { id: 'sla', label: 'SLA Config', icon: Shield },
    { id: 'assignment', label: 'Auto Assignment', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Settings', icon: Brain },
  ];

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-primary-600' : 'bg-[var(--bg-tertiary)] border border-[var(--border-primary)]'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Company Settings</h3>
          <p className="text-xs text-[var(--text-tertiary)]">Configure your company's helpdesk preferences</p>
        </div>
        <Button size="sm" onClick={handleSave} className="flex items-center gap-1.5 text-xs">
          <Save className="w-3.5 h-3.5" /> Save Settings
        </Button>
      </motion.div>

      <div className="flex gap-4">
        {/* Settings Nav */}
        <div className="w-48 shrink-0 hidden lg:block">
          <div className="space-y-1">
            {sections.map(sec => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeSection === sec.id
                      ? 'bg-amber-600/15 text-amber-400'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {sec.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-4">
          {/* Mobile tabs */}
          <div className="lg:hidden flex gap-1 overflow-x-auto pb-2">
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeSection === sec.id ? 'bg-primary-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {activeSection === 'company' && (
            <Card className="p-6 space-y-4">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" /> Company Information
              </h4>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] border-2 border-dashed border-[var(--border-primary)] flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                  <Upload className="w-5 h-5 text-[var(--text-tertiary)]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">Company Logo</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">Upload PNG or SVG, max 2MB</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Company Name" value={s.companyName} onChange={e => setS({ ...s, companyName: e.target.value })} icon={<Building2 className="w-4 h-4" />} />
                <Input label="Support Email" value={s.supportEmail} onChange={e => setS({ ...s, supportEmail: e.target.value })} icon={<Mail className="w-4 h-4" />} />
                <Input label="Support Phone" value={s.supportPhone} onChange={e => setS({ ...s, supportPhone: e.target.value })} icon={<Phone className="w-4 h-4" />} />
              </div>
              <Input label="Business Address" value={s.businessAddress} onChange={e => setS({ ...s, businessAddress: e.target.value })} icon={<MapPin className="w-4 h-4" />} />
            </Card>
          )}

          {activeSection === 'hours' && (
            <Card className="p-6 space-y-4">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Working Hours
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Time" type="time" value={s.workingHours.start} onChange={e => setS({ ...s, workingHours: { ...s.workingHours, start: e.target.value } })} />
                <Input label="End Time" type="time" value={s.workingHours.end} onChange={e => setS({ ...s, workingHours: { ...s.workingHours, end: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <button
                      key={day}
                      onClick={() => {
                        const days = s.workingHours.days.includes(day)
                          ? s.workingHours.days.filter(d => d !== day)
                          : [...s.workingHours.days, day];
                        setS({ ...s, workingHours: { ...s.workingHours, days } });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        s.workingHours.days.includes(day)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-primary-500'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'sla' && (
            <Card className="p-6 space-y-4">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" /> SLA Configuration
              </h4>
              <p className="text-xs text-[var(--text-tertiary)]">Set resolution time targets (hours) by priority</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(['low', 'medium', 'high', 'critical', 'urgent'] as const).map(p => (
                  <Input
                    key={p}
                    label={`${p.charAt(0).toUpperCase() + p.slice(1)} Priority (hours)`}
                    type="number"
                    value={String(s.slaConfig[p])}
                    onChange={e => setS({ ...s, slaConfig: { ...s.slaConfig, [p]: Number(e.target.value) } })}
                  />
                ))}
              </div>
            </Card>
          )}

          {activeSection === 'assignment' && (
            <Card className="p-6 space-y-4">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Auto Assignment
              </h4>
              <Toggle
                checked={s.autoAssignment}
                onChange={v => setS({ ...s, autoAssignment: v })}
                label="Enable automatic ticket assignment to available agents"
              />
              <p className="text-[11px] text-[var(--text-tertiary)]">
                When enabled, new tickets will be automatically assigned to the least-busy agent in the matching department.
              </p>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card className="p-6 space-y-4">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" /> Notification Settings
              </h4>
              <div className="divide-y divide-[var(--border-primary)]">
                <Toggle checked={s.notificationSettings.newTicket} onChange={v => setS({ ...s, notificationSettings: { ...s.notificationSettings, newTicket: v } })} label="New ticket created" />
                <Toggle checked={s.notificationSettings.escalation} onChange={v => setS({ ...s, notificationSettings: { ...s.notificationSettings, escalation: v } })} label="Ticket escalated" />
                <Toggle checked={s.notificationSettings.slaWarning} onChange={v => setS({ ...s, notificationSettings: { ...s.notificationSettings, slaWarning: v } })} label="SLA about to expire" />
                <Toggle checked={s.notificationSettings.customerReply} onChange={v => setS({ ...s, notificationSettings: { ...s.notificationSettings, customerReply: v } })} label="Customer replied" />
                <Toggle checked={s.notificationSettings.agentUnavailable} onChange={v => setS({ ...s, notificationSettings: { ...s.notificationSettings, agentUnavailable: v } })} label="Support agent unavailable" />
                <Toggle checked={s.notificationSettings.highPriority} onChange={v => setS({ ...s, notificationSettings: { ...s.notificationSettings, highPriority: v } })} label="High priority ticket" />
              </div>
            </Card>
          )}

          {activeSection === 'ai' && (
            <Card className="p-6 space-y-4">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-400" /> AI Settings (Company Only)
              </h4>
              <p className="text-xs text-[var(--text-tertiary)]">Configure AI-powered features for your company</p>
              <div className="divide-y divide-[var(--border-primary)]">
                <Toggle checked={s.aiSettings.autoCategories} onChange={v => setS({ ...s, aiSettings: { ...s.aiSettings, autoCategories: v } })} label="Auto-categorize tickets using AI" />
                <Toggle checked={s.aiSettings.autoPriority} onChange={v => setS({ ...s, aiSettings: { ...s.aiSettings, autoPriority: v } })} label="Auto-assign priority using AI" />
                <Toggle checked={s.aiSettings.sentimentAnalysis} onChange={v => setS({ ...s, aiSettings: { ...s.aiSettings, sentimentAnalysis: v } })} label="Customer sentiment analysis" />
                <Toggle checked={s.aiSettings.duplicateDetection} onChange={v => setS({ ...s, aiSettings: { ...s.aiSettings, duplicateDetection: v } })} label="Duplicate ticket detection" />
                <Toggle checked={s.aiSettings.suggestedResolutions} onChange={v => setS({ ...s, aiSettings: { ...s.aiSettings, suggestedResolutions: v } })} label="AI-suggested resolutions" />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
