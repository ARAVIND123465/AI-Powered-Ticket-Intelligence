import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Building2, Users, Ticket } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { toast } from 'sonner';
import type { CADepartment } from '../companyAdminData';

interface Props {
  departments: CADepartment[];
  onUpdateDepartments: (departments: CADepartment[]) => void;
}

export default function CADepartmentsTab({ departments, onUpdateDepartments }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState<CADepartment | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Department name is required'); return; }
    if (editDept) {
      const updated = departments.map(d => d.id === editDept.id ? { ...d, name: form.name, description: form.description } : d);
      onUpdateDepartments(updated);
      toast.success(`Department "${form.name}" updated`);
    } else {
      const newDept: CADepartment = {
        id: `DEP-${String(departments.length + 1).padStart(2, '0')}`,
        name: form.name,
        description: form.description,
        agentCount: 0,
        ticketCount: 0,
        createdAt: new Date().toISOString(),
      };
      onUpdateDepartments([...departments, newDept]);
      toast.success(`Department "${form.name}" created`);
    }
    setShowModal(false);
    setEditDept(null);
    setForm({ name: '', description: '' });
  };

  const handleDelete = (dept: CADepartment) => {
    onUpdateDepartments(departments.filter(d => d.id !== dept.id));
    toast.success(`Department "${dept.name}" deleted`);
  };

  const openEdit = (dept: CADepartment) => {
    setEditDept(dept);
    setForm({ name: dept.name, description: dept.description });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditDept(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const gradients = [
    'from-indigo-500 to-blue-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600',
    'from-pink-500 to-rose-600', 'from-violet-500 to-purple-600', 'from-cyan-500 to-blue-500',
    'from-red-500 to-rose-600', 'from-teal-500 to-emerald-600',
  ];

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Departments ({departments.length})</h3>
          <p className="text-xs text-[var(--text-tertiary)]">Manage company support departments</p>
        </div>
        <Button size="sm" onClick={openAdd} className="flex items-center gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Add Department
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {departments.map((dept, i) => (
          <motion.div key={dept.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="p-5 space-y-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center shadow-lg`}>
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(dept)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-amber-400 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(dept)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">{dept.name}</h4>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 line-clamp-2">{dept.description}</p>
              </div>
              <div className="flex items-center gap-4 pt-2 border-t border-[var(--border-primary)]">
                <span className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
                  <Users className="w-3 h-3" /> {dept.agentCount} Agents
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
                  <Ticket className="w-3 h-3" /> {dept.ticketCount} Tickets
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editDept ? 'Edit Department' : 'Add Department'}>
        <div className="space-y-4">
          <Input label="Department Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Technical Support" />
          <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe what this department handles..." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave}>{editDept ? 'Save Changes' : 'Create Department'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
