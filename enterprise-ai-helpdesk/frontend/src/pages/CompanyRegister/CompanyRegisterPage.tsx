import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Mail, Globe, User, Layers } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { toast } from 'sonner';
import { companyStore, type CompanyRegistration } from '@/utils/companyStore';

export default function CompanyRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('');
  const [category, setCategory] = useState<CompanyRegistration['category']>('Transport & Logistics');
  const [plan, setPlan] = useState<CompanyRegistration['plan']>('Professional');
  const [contactPerson, setContactPerson] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<CompanyRegistration | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Please enter Company Name and Contact Email.');
      return;
    }

    const created = companyStore.registerCompany({
      name,
      email,
      domain: domain || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      category,
      plan,
      contact_person: contactPerson || 'Company Admin',
      notes,
    });

    setSubmittedData(created);
    setIsSubmitted(true);
    toast.success(`Registration submitted for ${created.name}! Pending Super Admin approval.`);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20">
          <Building className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Enterprise Company Onboarding</h2>
        <p className="text-sm text-[var(--text-tertiary)] max-w-md mx-auto">
          Register your organization (e.g., RedBus, IRCTC, TechCorp) to enable AI-powered ticket intelligence & helpdesk management.
        </p>
      </div>

      {isSubmitted && submittedData ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-center space-y-4 animate-fadeIn">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[var(--text-primary)]">Registration Submitted for Approval</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Your company <strong>{submittedData.name}</strong> ({submittedData.domain}) has been registered.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Registration ID:</span>
              <span className="font-mono font-bold text-primary-400">{submittedData.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Status:</span>
              <span className="text-amber-400 font-semibold">⏳ Pending Super Admin Approval</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Contact Email:</span>
              <span className="font-mono text-[var(--text-primary)]">{submittedData.email}</span>
            </div>
          </div>

          <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
            Once Super Admin approves your registration in the Governance Panel, your administrators, support agents, and customers can log in to your tenant portal.
          </p>

          <div className="pt-3 border-t border-[var(--border-primary)] flex items-center justify-center gap-3">
            <Link to="/admin-login">
              <Button variant="outline" size="sm" className="text-xs">
                Go to Enterprise Login Portal
              </Button>
            </Link>
            <Link to="/super-admin">
              <Button size="sm" className="text-xs flex items-center gap-1">
                Open Super Admin Governance Panel <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6 shadow-xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Company Name *"
              placeholder="e.g. RedBus, IRCTC, TechCorp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<Building className="w-4 h-4" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Admin Email *"
                type="email"
                placeholder="admin@redbus.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Company Domain"
                placeholder="redbus.in"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                icon={<Globe className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Industry Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                options={[
                  { value: 'Transport & Logistics', label: 'Transport & Logistics' },
                  { value: 'Travel & Booking', label: 'Travel & Booking' },
                  { value: 'IT Services & Cloud', label: 'IT Services & Cloud' },
                  { value: 'Entertainment & Media', label: 'Entertainment & Media' },
                  { value: 'Healthcare', label: 'Healthcare' },
                  { value: 'Banking & Finance', label: 'Banking & Finance' },
                  { value: 'E-Commerce', label: 'E-Commerce' },
                ]}
              />

              <Select
                label="Subscription Plan"
                value={plan}
                onChange={(e) => setPlan(e.target.value as any)}
                options={[
                  { value: 'Starter', label: 'Starter Plan' },
                  { value: 'Professional', label: 'Professional Plan' },
                  { value: 'Enterprise', label: 'Enterprise Plan' },
                ]}
              />
            </div>

            <Input
              label="Contact Person Name"
              placeholder="e.g. Prakash Kumar"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              icon={<User className="w-4 h-4" />}
            />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Onboarding Notes & Team Size</label>
              <textarea
                placeholder="Provide details about your support team size or helpdesk requirements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500"
              />
            </div>

            <Button type="submit" className="w-full flex items-center justify-center gap-2 shadow-lg shadow-primary-500/10">
              <Sparkles className="w-4 h-4" /> Submit Company Registration
            </Button>
          </form>

          <div className="pt-4 border-t border-[var(--border-primary)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
            <span>Already an approved company?</span>
            <Link to="/admin-login" className="text-primary-400 hover:underline font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Enterprise Admin Portal →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
