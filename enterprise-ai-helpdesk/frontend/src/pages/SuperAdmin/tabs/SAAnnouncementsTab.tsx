import { useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { toast } from 'sonner';
import type { SAAnnouncement } from '../superAdminData';
import { formatDate } from '@/utils/formatters';

interface Props {
  announcements: SAAnnouncement[];
  onUpdateAnnouncements: (announcements: SAAnnouncement[]) => void;
}

export default function SAAnnouncementsTab({ announcements, onUpdateAnnouncements }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [severity, setSeverity] = useState<'Info' | 'Warning' | 'Alert'>('Info');

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required fields.');
      return;
    }

    const newAnn: SAAnnouncement = {
      id: `ANN-${String(announcements.length + 1).padStart(3, '0')}`,
      title,
      content,
      severity,
      date: new Date().toISOString(),
      targetCompany: 'All',
    };

    onUpdateAnnouncements([newAnn, ...announcements]);
    toast.success('Announcement broadcasted to all onboarded tenant organizations.');
    setShowModal(false);
    setTitle('');
    setContent('');
    setSeverity('Info');
  };

  const handleDelete = (id: string) => {
    onUpdateAnnouncements(announcements.filter(a => a.id !== id));
    toast.success('Announcement deleted.');
  };

  const sevBadge = (s: string) =>
    s === 'Alert' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
    s === 'Warning' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
    'bg-blue-500/15 text-blue-400 border-blue-500/30';

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Platform Announcements</h3>
          <p className="text-xs text-[var(--text-tertiary)] font-semibold">Broadcast updates, maintenance intervals, or security warnings to all company dashboards</p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)} className="flex items-center gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Broadcast Announcement
        </Button>
      </motion.div>

      {/* List */}
      <div className="space-y-3">
        {announcements.map((ann, i) => (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="p-5 flex items-start gap-4 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{ann.title}</h4>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${sevBadge(ann.severity)}`}>
                    {ann.severity}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{ann.content}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-[var(--text-tertiary)]">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(ann.date)}</span>
                  <span>•</span>
                  <span>Target: {ann.targetCompany === 'All' ? 'All Onboarded Tenants' : 'Specific Company'}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(ann.id)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-red-400 transition-colors shrink-0" title="Delete">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Broadcast Platform Announcement">
        <div className="space-y-4">
          <Input label="Announcement Title *" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Scheduled System Upgrades" />
          <Textarea label="Content / Details *" value={content} onChange={e => setContent(e.target.value)} placeholder="Describe the announcement details..." />
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Broadcast Severity</label>
            <select
              value={severity}
              onChange={e => setSeverity(e.target.value as any)}
              className="w-full h-10 rounded-xl border bg-[var(--bg-tertiary)] border-[var(--border-primary)] text-sm text-[var(--text-primary)] px-3 focus:outline-none"
            >
              <option value="Info">Info (General Release Notes, Feature Introductions)</option>
              <option value="Warning">Warning (Scheduled Maintenances, System Degrades)</option>
              <option value="Alert">Alert (Urgent System Alerts, Critical Updates)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-primary)]">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate}>Send Broadcast</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
