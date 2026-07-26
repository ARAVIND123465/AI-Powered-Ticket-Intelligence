import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Tag } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { toast } from 'sonner';
import type { CACategory } from '../companyAdminData';

interface Props {
  categories: CACategory[];
  onUpdateCategories: (categories: CACategory[]) => void;
}

export default function CACategoriesTab({ categories, onUpdateCategories }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<CACategory | null>(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    if (editCat) {
      const updated = categories.map(c => c.id === editCat.id ? { ...c, name: form.name, description: form.description, color: form.color } : c);
      onUpdateCategories(updated);
      toast.success(`Category "${form.name}" updated`);
    } else {
      const newCat: CACategory = {
        id: `CAT-${String(categories.length + 1).padStart(2, '0')}`,
        name: form.name,
        description: form.description,
        ticketCount: 0,
        color: form.color,
        createdAt: new Date().toISOString(),
      };
      onUpdateCategories([...categories, newCat]);
      toast.success(`Category "${form.name}" created`);
    }
    setShowModal(false);
    setEditCat(null);
    setForm({ name: '', description: '', color: '#6366f1' });
  };

  const handleDelete = (cat: CACategory) => {
    onUpdateCategories(categories.filter(c => c.id !== cat.id));
    toast.success(`Category "${cat.name}" deleted`);
  };

  const openEdit = (cat: CACategory) => {
    setEditCat(cat);
    setForm({ name: cat.name, description: cat.description, color: cat.color });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditCat(null);
    setForm({ name: '', description: '', color: '#6366f1' });
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Ticket Categories ({categories.length})</h3>
          <p className="text-xs text-[var(--text-tertiary)]">Manage ticket classification categories</p>
        </div>
        <Button size="sm" onClick={openAdd} className="flex items-center gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Add Category
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {categories.map((cat, i) => (
          <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
            <Card className="p-4 space-y-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                    <Tag className="w-4 h-4" style={{ color: cat.color }} />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)]">{cat.name}</span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-tertiary)] line-clamp-2">{cat.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-primary)]">
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border" style={{ color: cat.color, backgroundColor: `${cat.color}10`, borderColor: `${cat.color}30` }}>
                  {cat.ticketCount} tickets
                </span>
                <div className="flex gap-0.5">
                  <button onClick={() => openEdit(cat)} className="p-1 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-amber-400 transition-colors"><Edit3 className="w-3 h-3" /></button>
                  <button onClick={() => handleDelete(cat)} className="p-1 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editCat ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <Input label="Category Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Login" />
          <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What this category covers..." />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer border border-[var(--border-primary)]" />
              <span className="text-xs text-[var(--text-tertiary)] font-mono">{form.color}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave}>{editCat ? 'Save Changes' : 'Create Category'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
