import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Bell, Shield, Brain, Palette } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Configure your helpdesk preferences</p>
      </motion.div>

      {/* Appearance */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-primary-400" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Appearance</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--text-primary)]">Theme</p>
            <p className="text-xs text-[var(--text-tertiary)]">Choose between dark and light mode</p>
          </div>
          <button onClick={toggleTheme}
            className={cn('relative w-16 h-8 rounded-full transition-colors duration-300', theme === 'dark' ? 'bg-primary-600' : 'bg-surface-300')}
          >
            <div className={cn('absolute top-1 w-6 h-6 rounded-full bg-white flex items-center justify-center transition-all duration-300 shadow-sm', theme === 'dark' ? 'left-9' : 'left-1')}>
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-primary-600" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            </div>
          </button>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-primary-400" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h3>
        </div>
        <div className="space-y-3">
          {['Email notifications for new tickets', 'Escalation alerts', 'SLA breach warnings', 'AI classification updates'].map((setting) => (
            <div key={setting} className="flex items-center justify-between py-1">
              <p className="text-sm text-[var(--text-secondary)]">{setting}</p>
              <div className="w-10 h-5 rounded-full bg-primary-600 relative cursor-pointer">
                <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Settings */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-primary-400" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI Configuration</h3>
        </div>
        <div className="space-y-3">
          {['Auto-classify new tickets', 'Auto-detect duplicates', 'Generate resolution suggestions', 'Sentiment analysis on creation'].map((setting) => (
            <div key={setting} className="flex items-center justify-between py-1">
              <p className="text-sm text-[var(--text-secondary)]">{setting}</p>
              <div className="w-10 h-5 rounded-full bg-primary-600 relative cursor-pointer">
                <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SLA */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-primary-400" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">SLA Configuration</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[{ label: 'Critical', value: '1 hour' }, { label: 'High', value: '4 hours' }, { label: 'Medium', value: '8 hours' }, { label: 'Low', value: '24 hours' }].map((sla) => (
            <div key={sla.label} className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--bg-tertiary)]">
              <span className="text-sm text-[var(--text-secondary)]">{sla.label}</span>
              <span className="text-sm font-medium text-[var(--text-primary)]">{sla.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
