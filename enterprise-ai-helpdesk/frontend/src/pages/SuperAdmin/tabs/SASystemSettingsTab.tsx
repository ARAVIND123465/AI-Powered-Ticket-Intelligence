import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Mail, Shield, ShieldAlert, Cpu } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'sonner';

export default function SASystemSettingsTab() {
  const [platformName, setPlatformName] = useState('Enterprise AI Helpdesk Platform');
  const [smtpServer, setSmtpServer] = useState('smtp.sendgrid.net');
  const [smtpPort, setSmtpPort] = useState('587');
  const [jwtExpiry, setJwtExpiry] = useState('24 hours');
  const [activeSection, setActiveSection] = useState('platform');

  const handleSave = () => {
    toast.success('System settings saved successfully.');
  };

  const sections = [
    { id: 'platform', label: 'Platform Settings', icon: Settings },
    { id: 'smtp', label: 'SMTP Config', icon: Mail },
    { id: 'jwt', label: 'JWT Config', icon: Shield },
    { id: 'sla', label: 'Default SLA Rules', icon: ShieldAlert },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">System Settings</h3>
          <p className="text-xs text-[var(--text-tertiary)] font-semibold">Configure core parameters, SMTP endpoints, security tokens, and defaults</p>
        </div>
        <Button size="sm" onClick={handleSave} className="flex items-center gap-1.5 text-xs">
          <Save className="w-3.5 h-3.5" /> Save System Settings
        </Button>
      </motion.div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Navigation */}
        <div className="w-full lg:w-48 shrink-0 flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0">
          {sections.map(sec => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSection === sec.id
                    ? 'bg-primary-600/15 text-primary-400 border border-primary-500/30'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {activeSection === 'platform' && (
            <Card className="p-6 space-y-4">
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-purple-400" /> Platform Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Platform Display Name" value={platformName} onChange={e => setPlatformName(e.target.value)} />
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Platform Branding Theme</label>
                  <select className="w-full h-10 rounded-xl border bg-[var(--bg-tertiary)] border-[var(--border-primary)] text-sm text-[var(--text-primary)] px-3 focus:outline-none">
                    <option>Sleek Violet Theme (Default)</option>
                    <option>Enterprise Cyan Theme</option>
                    <option>Emerald Green Theme</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'smtp' && (
            <Card className="p-6 space-y-4">
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-amber-400" /> SMTP Configuration
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="SMTP Host Server" value={smtpServer} onChange={e => setSmtpServer(e.target.value)} />
                <Input label="SMTP Port" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} />
                <Input label="SMTP Username" placeholder="apikey" />
                <Input label="SMTP Password" type="password" placeholder="••••••••••••••••" />
              </div>
            </Card>
          )}

          {activeSection === 'jwt' && (
            <Card className="p-6 space-y-4">
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" /> JWT Core Configuration
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Token Duration Expiry" value={jwtExpiry} onChange={e => setJwtExpiry(e.target.value)} />
                <Input label="JWT Secret Signature (HS256)" type="password" placeholder="••••••••••••••••••••••••••••" />
              </div>
            </Card>
          )}

          {activeSection === 'sla' && (
            <Card className="p-6 space-y-4">
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" /> Default Platform SLA Configurations
              </h4>
              <p className="text-xs text-[var(--text-tertiary)]">Set the baseline SLA rules for Starter & Professional plan companies</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Input label="Low Priority (hours)" type="number" defaultValue={72} />
                <Input label="Medium Priority (hours)" type="number" defaultValue={48} />
                <Input label="High Priority (hours)" type="number" defaultValue={24} />
                <Input label="Critical Priority (hours)" type="number" defaultValue={12} />
                <Input label="Urgent Priority (hours)" type="number" defaultValue={4} />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
