import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, PhoneCall } from 'lucide-react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please complete all contact fields.');
      return;
    }
    setSubmitted(true);
    toast.success('Your message has been sent to our Help Desk support team.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20">
          <PhoneCall className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Contact Help Desk Support</h1>
        <p className="text-xs text-[var(--text-tertiary)]">Have questions or need assistance? Reach out to our technical support team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="space-y-4">
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="font-semibold text-[var(--text-primary)]">Support Email</div>
              <div className="text-[var(--text-tertiary)] font-mono">support@company.com</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="font-semibold text-[var(--text-primary)]">Helpdesk Hotline</div>
              <div className="text-[var(--text-tertiary)] font-mono">+1 (800) 555-0199</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="font-semibold text-[var(--text-primary)]">Global HQ</div>
              <div className="text-[var(--text-tertiary)]">Tech Park, Building 4, Floor 6</div>
            </div>
          </Card>
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          <Card className="p-6">
            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">Message Received!</h3>
                <p className="text-xs text-[var(--text-tertiary)]">Our helpdesk representative will get back to you shortly.</p>
                <Button size="sm" onClick={() => setSubmitted(false)}>Send Another Message</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Your Name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your inquiry or question..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500"
                  />
                </div>

                <Button type="submit" className="w-full flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Send Message
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
