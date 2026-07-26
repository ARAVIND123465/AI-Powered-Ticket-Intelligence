import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, CheckCircle2, Clock, AlertCircle, TrendingUp,
  MessageSquare, User, Sparkles, Brain, Send, RefreshCw,
  ArrowUpRight, Zap, Star, Activity, ExternalLink, Filter,
  ChevronDown, ChevronRight, Search, Bell, X, Flag, AlertTriangle,
  ShieldAlert, Lock, Unlock, Paperclip, Check, Trash2, Settings,
  Mail, Phone, Calendar, BookOpen, Shield, HelpCircle, FileText,
  Smile, Award, Landmark, Layers, Briefcase, ThumbsUp,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { ticketStore } from '@/utils/ticketStore';
import type { Ticket } from '@/types';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

// ─── Constants & Styles ────────────────────────────────────────────────────────
const PRIORITY_STYLE: Record<string, { ring: string; text: string; bg: string; dot: string }> = {
  Critical: { ring: 'border-red-500/30', text: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' },
  High:     { ring: 'border-orange-500/30', text: 'text-orange-400', bg: 'bg-orange-500/10', dot: 'bg-orange-400' },
  Medium:   { ring: 'border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400' },
  Low:      { ring: 'border-green-500/30', text: 'text-green-400', bg: 'bg-green-500/10', dot: 'bg-green-400' },
};

const STATUS_STYLE: Record<string, string> = {
  Open: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Assigned: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  In_Progress: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Waiting_Customer: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  Escalated: 'text-red-400 bg-red-500/10 border-red-500/20',
  Resolved: 'text-green-400 bg-green-500/10 border-green-500/20',
  Closed: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
};

// Mock static DB suggestions for demo consistency
const AI_RESOLUTION_SUGGESTIONS: Record<string, { category: string; priority: string; score: number; draft: string; similar: string[]; duplicate: boolean; kb: string[] }> = {
  Network: {
    category: 'Network',
    priority: 'High',
    score: 95,
    draft: 'Hello. I have examined the connection logs and reset the VPN gateway (Phase 1/Phase 2) on our NYC node. Please clear your local routing table and attempt to connect again.',
    similar: ['TKT-884: Remote VPN drops after 30 min idle', 'TKT-761: VPN routing failure on macOS Sequoia'],
    duplicate: false,
    kb: ['Configuring VPN Split Tunneling', 'Resolving Gateway Timeout on L2TP/IPSec VPNs'],
  },
  Payment: {
    category: 'Payment',
    priority: 'Critical',
    score: 98,
    draft: 'Dear Customer. We detected a transient gateway timeout during card verification (Stripe 500 API). The charge has been cancelled. Please try now.',
    similar: ['TKT-912: Refund processing timeout for Visa/MC', 'TKT-845: Duplicate payment charge on order #7712'],
    duplicate: true,
    kb: ['Refund Validation Lifecycle', 'Common Payment Decline Codes Guide'],
  },
  Security: {
    category: 'Security',
    priority: 'Critical',
    score: 92,
    draft: 'Attention. An SSO authentication token mismatch was triggered. Active Directory federation endpoints are healthy. Please reset browser sessions or force cookies clearance.',
    similar: ['TKT-991: SSO 403 Access Denied after AD update', 'TKT-902: LDAP verification credential rotation'],
    duplicate: false,
    kb: ['Azure AD SSO Troubleshooting', 'Enforcing MFA Reset Policies'],
  },
  General: {
    category: 'General Inquiry',
    priority: 'Low',
    score: 87,
    draft: 'Hello. Thank you for reaching out. Let me verify this with our logistics department and update you within 30 minutes.',
    similar: ['TKT-412: Question about shipping timeframes'],
    duplicate: false,
    kb: ['Helpdesk SLA Response Guidelines'],
  }
};

// ─── Helpers to enforce company boundaries ─────────────────────────────────
const getAgentCompany = (email: string | null | undefined): string => {
  if (!email) return 'RedBus';
  const prefix = email.toLowerCase().split('@')[0];
  const domain = email.toLowerCase().split('@')[1] || '';
  if (domain.includes('redbus') || prefix.includes('redbus')) return 'RedBus';
  if (domain.includes('irctc') || prefix.includes('irctc')) return 'IRCTC';
  if (domain.includes('pvr') || prefix.includes('pvr')) return 'PVR';
  if (domain.includes('amazon') || prefix.includes('amazon')) return 'Amazon';
  if (domain.includes('swiggy') || prefix.includes('swiggy')) return 'Swiggy';
  return 'RedBus'; // Fallback company
};

const getTicketCompany = (ticket: Ticket): string => {
  const email = ticket.user_id;
  const domain = email.toLowerCase().split('@')[1] || '';
  if (domain.includes('redbus')) return 'RedBus';
  if (domain.includes('irctc')) return 'IRCTC';
  if (domain.includes('pvr')) return 'PVR';
  if (domain.includes('amazon')) return 'Amazon';
  if (domain.includes('swiggy')) return 'Swiggy';
  
  // Deterministic mapping to make initial tickets match domain
  if (ticket.category === 'Payment' || ticket.category === 'Refund') return 'RedBus';
  if (ticket.category === 'Network' || ticket.category === 'Security') return 'IRCTC';
  if (ticket.category === 'Login' || ticket.category === 'Account') return 'PVR';
  return 'RedBus';
};

export default function AgentDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ─── State ────────────────────────────────────────────────────────────────
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Custom sidebar view tracking
  const [activeView, setActiveView] = useState<'dashboard' | 'assigned' | 'open' | 'in-progress' | 'resolved' | 'conversations' | 'ai-suggestions' | 'kb' | 'notifications' | 'profile'>('dashboard');

  // Input states
  const [replyText, setReplyText] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Status Update & Escalation states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState('Technical Issue');
  const [escalationNote, setEscalationNote] = useState('');
  
  // Chat States
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string; read: boolean; file?: string }>>([]);
  const [typing, setTyping] = useState(false);

  // AI draft states
  const [aiDraft, setAiDraft] = useState('');
  const [isEditingDraft, setIsEditingDraft] = useState(false);

  // Notifications State
  const [agentNotifs, setAgentNotifs] = useState([
    { id: '1', title: 'New Ticket Assigned', desc: 'Critical ticket TKT-1041 has been auto-assigned to you.', time: '5m ago', type: 'new', read: false },
    { id: '2', title: 'Customer Replied', desc: 'John Doe posted a reply on TKT-1042.', time: '15m ago', type: 'reply', read: false },
    { id: '3', title: 'SLA Warning Alert', desc: 'TKT-1042 SLA window is expiring in 45 minutes.', time: '30m ago', type: 'sla', read: false },
    { id: '4', title: 'High Priority Alert', desc: 'New Payment Gateway Failure ticket submitted with Critical status.', time: '1h ago', type: 'high', read: true },
  ]);

  const company = getAgentCompany(user?.email);

  // ─── Load Data & Filtering ─────────────────────────────────────────────────
  useEffect(() => {
    // Sync active view from URL path if applicable
    const path = location.pathname;
    if (path.includes('/agent/assigned')) setActiveView('assigned');
    else if (path.includes('/agent/open')) setActiveView('open');
    else if (path.includes('/agent/in-progress')) setActiveView('in-progress');
    else if (path.includes('/agent/resolved')) setActiveView('resolved');
    else if (path.includes('/agent/messages')) setActiveView('conversations');
    else if (path.includes('/agent/performance')) setActiveView('dashboard');
    else setActiveView('dashboard');

    // Fetch and partition tickets by Company
    const all = ticketStore.getTickets();
    const companyTickets = all.filter(t => getTicketCompany(t) === company);
    setTickets(companyTickets);
  }, [location.pathname, company]);

  useEffect(() => {
    if (selectedTicket) {
      // Sync mock chat messages
      const msgs = (selectedTicket.agent_responses || []).map(r => ({
        sender: r.agent_name,
        text: r.response_text,
        time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true
      }));
      setChatMessages(msgs);

      // Initialize AI resolution draft
      const sug = AI_RESOLUTION_SUGGESTIONS[selectedTicket.category || 'General'] || AI_RESOLUTION_SUGGESTIONS.General;
      setAiDraft(sug.draft);
      setResolutionText(selectedTicket.ai_suggested_resolution || '');
    }
  }, [selectedTicket]);

  useEffect(() => {
    if (activeView === 'conversations') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeView]);

  const refreshTickets = () => {
    const all = ticketStore.getTickets();
    const companyTickets = all.filter(t => getTicketCompany(t) === company);
    setTickets(companyTickets);
    if (selectedTicket) {
      const updated = companyTickets.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  };

  // ─── Stat Calculations ─────────────────────────────────────────────────────
  const assignedCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In_Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
  const highPriorityCount = tickets.filter(t => t.priority === 'Critical' || t.priority === 'High').length;
  const todayAssignedCount = tickets.filter(t => new Date(t.created_at).toDateString() === new Date().toDateString()).length;
  
  // Mock metrics
  const slaDueToday = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length;
  const avgResolutionTime = '2.4 hours';

  // ─── Actions ───────────────────────────────────────────────────────────────
  const handleSelectTicket = (t: Ticket) => {
    setSelectedTicket(t);
  };

  const handleSendChatMessage = () => {
    if (!selectedTicket || !replyText.trim()) return;
    const msgText = replyText.trim();
    
    // Add response to ticket store
    const updated = ticketStore.addAgentResponse(selectedTicket.id, user?.full_name || 'Support Agent', msgText);
    if (updated) {
      refreshTickets();
      setReplyText('');
      toast.success('Message sent to customer!');
      
      // Simulate Typing Indicator from customer after a short delay
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const autoReply = ticketStore.addAgentResponse(
          selectedTicket.id,
          selectedTicket.user_id.split('@')[0],
          `Thanks for confirming. I am reviewing the steps you suggested.`
        );
        if (autoReply) refreshTickets();
      }, 3000);
    }
  };

  const handleUpdateStatus = (newStatus: string) => {
    if (!selectedTicket) return;
    const updated = ticketStore.addAgentResponse(
      selectedTicket.id,
      user?.full_name || 'Support Agent',
      `🔄 Status updated to ${newStatus.replace('_', ' ')}`,
      newStatus
    );
    if (updated) {
      refreshTickets();
      setShowStatusModal(false);
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    }
  };

  const handleAddInternalNote = () => {
    if (!selectedTicket || !internalNoteText.trim()) return;
    const updated = ticketStore.addAgentResponse(
      selectedTicket.id,
      'Internal Note',
      `📝 Note: ${internalNoteText.trim()}`
    );
    if (updated) {
      refreshTickets();
      setInternalNoteText('');
      toast.success('Internal note saved.');
    }
  };

  const handleResolveTicket = () => {
    if (!selectedTicket) return;
    const msg = `✅ Ticket marked as RESOLVED.\n\nResolution Summary: ${resolutionText || 'Issue resolved.'}`;
    const updated = ticketStore.addAgentResponse(
      selectedTicket.id,
      user?.full_name || 'Support Agent',
      msg,
      'Resolved'
    );
    if (updated) {
      refreshTickets();
      toast.success('Ticket marked as Resolved and customer notified!');
    }
  };

  const handleEscalateTicket = () => {
    if (!selectedTicket) return;
    const msg = `⚡ ESCALATION ALERT (${escalationReason}): ${escalationNote || 'No escalation details.'}`;
    
    // Custom update to status and trigger escalation flag
    const updated = ticketStore.addAgentResponse(
      selectedTicket.id,
      user?.full_name || 'Support Agent',
      msg,
      'Escalated'
    );
    
    if (updated) {
      // Set local escalation marker
      const all = ticketStore.getTickets();
      const idx = all.findIndex(t => t.id === selectedTicket.id);
      if (all[idx]) {
        all[idx].escalate_recommended = true;
        localStorage.setItem('helpdesk_tickets', JSON.stringify(all));
      }
      refreshTickets();
      setShowEscalationModal(false);
      toast.warning(`Ticket escalated to Tier 2 under ${escalationReason}`);
    }
  };

  const handleAcceptAIDraft = () => {
    setReplyText(aiDraft);
    toast.success('AI draft copied to message reply buffer!');
  };

  // ─── Filtered Tickets List ─────────────────────────────────────────────────
  const viewFilteredTickets = tickets.filter(t => {
    if (activeView === 'open') return t.status === 'Open';
    if (activeView === 'in-progress') return t.status === 'In_Progress';
    if (activeView === 'resolved') return t.status === 'Resolved';
    return true; // All assigned
  }).filter(t => {
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
    if (searchQuery) {
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden">
      
      {/* ─── Sidebar Custom Navigation ────────────────────────────────────── */}
      <aside className="w-64 border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] flex flex-col h-full flex-shrink-0">
        <div className="h-16 px-6 border-b border-[var(--border-primary)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--text-primary)]">Agent Workspace</h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{company} Corp</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <button
            onClick={() => setActiveView('dashboard')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left',
              activeView === 'dashboard' ? 'bg-indigo-600/15 text-indigo-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            )}
          >
            <Activity className="w-4 h-4" /> Dashboard
          </button>
          
          <div className="h-px bg-[var(--border-primary)] my-2" />

          <button
            onClick={() => setActiveView('assigned')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left',
              activeView === 'assigned' ? 'bg-indigo-600/15 text-indigo-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            )}
          >
            <ClipboardList className="w-4 h-4" /> Assigned Tickets
          </button>

          <button
            onClick={() => setActiveView('open')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left',
              activeView === 'open' ? 'bg-indigo-600/15 text-indigo-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            )}
          >
            <AlertCircle className="w-4 h-4" /> Open Tickets
          </button>

          <button
            onClick={() => setActiveView('in-progress')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left',
              activeView === 'in-progress' ? 'bg-indigo-600/15 text-indigo-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            )}
          >
            <Clock className="w-4 h-4" /> In Progress
          </button>

          <button
            onClick={() => setActiveView('resolved')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left',
              activeView === 'resolved' ? 'bg-indigo-600/15 text-indigo-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            )}
          >
            <CheckCircle2 className="w-4 h-4" /> Resolved Tickets
          </button>

          <button
            onClick={() => setActiveView('conversations')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left',
              activeView === 'conversations' ? 'bg-indigo-600/15 text-indigo-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            )}
          >
            <MessageSquare className="w-4 h-4" /> Customer Conversations
          </button>

          <button
            onClick={() => setActiveView('ai-suggestions')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left',
              activeView === 'ai-suggestions' ? 'bg-indigo-600/15 text-indigo-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            )}
          >
            <Brain className="w-4 h-4" /> AI Suggestions
          </button>

          <button
            onClick={() => setActiveView('kb')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left',
              activeView === 'kb' ? 'bg-indigo-600/15 text-indigo-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            )}
          >
            <BookOpen className="w-4 h-4" /> Knowledge Base
          </button>

          <button
            onClick={() => setActiveView('notifications')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left',
              activeView === 'notifications' ? 'bg-indigo-600/15 text-indigo-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            )}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>

          <button
            onClick={() => setActiveView('profile')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left',
              activeView === 'profile' ? 'bg-indigo-600/15 text-indigo-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            )}
          >
            <User className="w-4 h-4" /> Profile
          </button>
        </nav>

        {/* Footer info + logout */}
        <div className="p-4 border-t border-[var(--border-primary)] space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold font-mono">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">{user?.full_name || 'Agent'}</p>
              <p className="text-[10px] text-[var(--text-tertiary)] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/admin-login'); }}
            className="w-full py-2 rounded-xl text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ─── Right Side Content Area ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
              {activeView.replace('-', ' ')} Workspace
            </h2>
            <span className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[10px] font-bold">
              {company} Group boundary
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick stats indicator */}
            <div className="hidden md:flex items-center gap-3 border-r border-[var(--border-primary)] pr-4">
              <span className="text-xs text-[var(--text-tertiary)]">Today's SLA: <strong className="text-[var(--text-primary)]">{slaDueToday} due</strong></span>
              <span className="text-xs text-[var(--text-tertiary)]">CSAT: <strong className="text-green-400">4.8★</strong></span>
            </div>

            <button
              onClick={() => setActiveView('notifications')}
              className="relative p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
            >
              <Bell className="w-5 h-5" />
              {agentNotifs.some(n => !n.read) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Inner Panel View Wrapper */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* ─── SUB-VIEW: DASHBOARD ─────────────────────────────────────── */}
            {activeView === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                
                {/* Stats cards row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Assigned Tickets', value: assignedCount, icon: ClipboardList, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'Open Tickets', value: openCount, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'In Progress Tickets', value: inProgressCount, icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Resolved Tickets', value: resolvedCount, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
                    { label: 'High Priority Tickets', value: highPriorityCount, icon: Flag, color: 'text-red-400', bg: 'bg-red-500/10' },
                    { label: "Today's Assigned", value: todayAssignedCount, icon: Calendar, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                    { label: 'SLA Due Today', value: slaDueToday, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                    { label: 'Avg Resolution Time', value: avgResolutionTime, icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10' },
                  ].map((stat, idx) => (
                    <Card key={idx} className="flex items-center gap-4 hover:border-indigo-500/30 transition-all cursor-pointer">
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', stat.bg)}>
                        <stat.icon className={cn('w-6 h-6', stat.color)} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{stat.label}</p>
                        <p className="text-xl font-black text-[var(--text-primary)] mt-0.5">{stat.value}</p>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Team performance visual cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Performance Target chart mimic */}
                  <Card className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
                      <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-400" /> Weekly Resolution Performance
                      </h3>
                      <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full">Target Met</span>
                    </div>

                    <div className="space-y-4">
                      {[
                        { day: 'Monday', val: 12, max: 15, pct: '80%' },
                        { day: 'Tuesday', val: 14, max: 15, pct: '93%' },
                        { day: 'Wednesday', val: 9, max: 15, pct: '60%' },
                        { day: 'Thursday', val: 15, max: 15, pct: '100%' },
                        { day: 'Friday (Today)', val: todayAssignedCount, max: 15, pct: `${(todayAssignedCount / 15) * 100}%` },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-4">
                          <span className="text-xs text-[var(--text-secondary)] w-28 font-medium">{item.day}</span>
                          <div className="flex-1 h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden relative">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" style={{ width: item.pct }} />
                          </div>
                          <span className="text-xs font-bold text-[var(--text-primary)] w-12 text-right">{item.val} / {item.max}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* AI Copilot Overview */}
                  <Card className="space-y-4 bg-gradient-to-br from-violet-500/5 to-transparent border-violet-500/20">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-violet-400" />
                      <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">AI Copilot Status</h3>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Our machine learning classifications are active for <strong>{company}</strong> scope. Incoming tickets are analyzed for sentiment, duplicate entries, and resolution suggestions automatically.
                    </p>
                    <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-primary)] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-tertiary)]">Auto-Classification Accuracy</span>
                        <strong className="text-violet-400">94.2%</strong>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-tertiary)]">Suggested Action Accept Rate</span>
                        <strong className="text-emerald-400">82.5%</strong>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Queue Quick List */}
                <Card className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-indigo-400" /> Open Assigned Queue
                    </h3>
                    <button onClick={() => setActiveView('assigned')} className="text-xs text-indigo-400 font-bold hover:underline">View All</button>
                  </div>
                  <div className="divide-y divide-[var(--border-primary)]">
                    {tickets.slice(0, 5).map(t => (
                      <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)]">{t.title}</p>
                          <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{t.id} · {t.category} · Customer: {t.user_id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('text-[9px] font-black px-2 py-0.5 rounded border', PRIORITY_STYLE[t.priority || 'Low']?.text, PRIORITY_STYLE[t.priority || 'Low']?.bg)}>
                            {t.priority}
                          </span>
                          <button
                            onClick={() => { handleSelectTicket(t); setActiveView('assigned'); }}
                            className="p-1 px-2.5 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-indigo-400 text-[10px] font-bold border border-[var(--border-primary)]"
                          >
                            Work
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─── SUB-VIEW: ASSIGNED / OPEN / IN PROGRESS / RESOLVED (TABLES) ─── */}
            {['assigned', 'open', 'in-progress', 'resolved'].includes(activeView) && (
              <motion.div key="table-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {/* Advanced filters card */}
                <Card className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type="text"
                      placeholder="Search tickets by ID, title or customer..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Priority filter */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[var(--text-tertiary)]">Priority:</span>
                      <select
                        value={priorityFilter}
                        onChange={e => setPriorityFilter(e.target.value)}
                        className="h-9 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                      >
                        <option value="All">All Priorities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[var(--text-tertiary)]">Category:</span>
                      <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="h-9 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                      >
                        <option value="All">All Categories</option>
                        <option value="Payment">Payment</option>
                        <option value="Security">Security</option>
                        <option value="Network">Network</option>
                        <option value="Bug">Bug</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>
                  </div>
                </Card>

                {/* Main Queue & Workspace split view */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Left Column: Tickets Table List */}
                  <div className="xl:col-span-2">
                    <Card className="p-0 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
                              <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Ticket ID</th>
                              <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Customer Name</th>
                              <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Category</th>
                              <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Priority</th>
                              <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                              <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Created Date</th>
                              <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border-primary)]">
                            {viewFilteredTickets.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="px-5 py-12 text-center text-[var(--text-tertiary)]">
                                  No tickets found matching current view parameters.
                                </td>
                              </tr>
                            ) : (
                              viewFilteredTickets.map(t => {
                                const pri = PRIORITY_STYLE[t.priority || 'Low'] || PRIORITY_STYLE.Low;
                                return (
                                  <tr
                                    key={t.id}
                                    onClick={() => handleSelectTicket(t)}
                                    className={cn(
                                      'hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer',
                                      selectedTicket?.id === t.id && 'bg-indigo-500/5'
                                    )}
                                  >
                                    <td className="px-5 py-4 font-mono font-bold text-indigo-400">{t.id}</td>
                                    <td className="px-5 py-4 font-medium text-[var(--text-primary)]">
                                      {t.user_id.split('@')[0]}
                                      <p className="text-[10px] text-[var(--text-tertiary)] font-normal truncate max-w-[140px]">{t.user_id}</p>
                                    </td>
                                    <td className="px-5 py-4 text-[var(--text-secondary)]">{t.category}</td>
                                    <td className="px-5 py-4">
                                      <span className={cn('px-2 py-0.5 rounded text-[9px] font-bold border', pri.text, pri.bg, pri.ring)}>
                                        {t.priority}
                                      </span>
                                    </td>
                                    <td className="px-5 py-4">
                                      <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold border', STATUS_STYLE[t.status])}>
                                        {t.status.replace('_', ' ')}
                                      </span>
                                    </td>
                                    <td className="px-5 py-4 text-[var(--text-tertiary)]">
                                      {new Date(t.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                                      <div className="flex justify-end gap-1.5">
                                        <button
                                          onClick={() => handleSelectTicket(t)}
                                          className="p-1 px-2.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-indigo-400 text-[10px] font-bold border border-[var(--border-primary)]"
                                        >
                                          View
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>

                  {/* Right Column: Mini Workspace detail panel (mimics details page) */}
                  <div className="xl:col-span-1">
                    {selectedTicket ? (
                      <Card className="space-y-4">
                        <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
                          <div>
                            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">{selectedTicket.id} Detail</h3>
                            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Assigned to: you</p>
                          </div>
                          <span className={cn('px-2.5 py-0.5 rounded-full text-[9px] font-bold border', STATUS_STYLE[selectedTicket.status])}>
                            {selectedTicket.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <p className="font-bold text-[var(--text-primary)]">{selectedTicket.title}</p>
                          <p className="text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-tertiary)] rounded-lg p-2.5 border border-[var(--border-primary)] max-h-36 overflow-y-auto">
                            {selectedTicket.description}
                          </p>
                        </div>

                        {/* OCR Text / Sandbox metadata indicators */}
                        {selectedTicket.attachment && (
                          <div className="p-2.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-1.5">
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Extracted OCR Text
                            </span>
                            <p className="text-[9px] font-mono text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                              {selectedTicket.pdf_extracted_text || `[Extracted details from attachment image file ${selectedTicket.attachment}]`}
                            </p>
                          </div>
                        )}

                        {/* Operations Actions bar */}
                        {selectedTicket.status !== 'Closed' && (
                          <div className="pt-2 border-t border-[var(--border-primary)] space-y-2">
                            <div className="flex items-center gap-1.5 w-full">
                              <button
                                onClick={() => setShowStatusModal(true)}
                                className="flex-1 py-2 text-center rounded-lg text-xs font-bold bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-primary)]"
                              >
                                Change Status
                              </button>
                              <button
                                onClick={() => setShowEscalationModal(true)}
                                className="flex-1 py-2 text-center rounded-lg text-xs font-bold bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20"
                              >
                                Escalate
                              </button>
                            </div>
                            
                            {/* Fast Reply Template */}
                            <div className="space-y-2">
                              <textarea
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Write instant reply to customer..."
                                className="w-full text-xs p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)] focus:outline-none"
                                rows={3}
                              />
                              <Button
                                onClick={handleSendChatMessage}
                                disabled={!replyText.trim()}
                                size="sm"
                                className="w-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-1.5"
                              >
                                <Send className="w-3 h-3" /> Send Reply
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Resolution Area */}
                        {selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Closed' && (
                          <div className="pt-2 border-t border-[var(--border-primary)] space-y-2">
                            <textarea
                              value={resolutionText}
                              onChange={e => setResolutionText(e.target.value)}
                              placeholder="Enter resolution notes..."
                              className="w-full text-xs p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)] focus:outline-none"
                              rows={2}
                            />
                            <button
                              onClick={handleResolveTicket}
                              className="w-full py-2 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-400 rounded-lg text-xs font-bold transition-all"
                            >
                              Mark as Resolved & Notify Customer
                            </button>
                          </div>
                        )}
                      </Card>
                    ) : (
                      <Card className="text-center py-12 text-[var(--text-tertiary)]">
                        Select a ticket to begin direct operations work.
                      </Card>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── SUB-VIEW: CUSTOMER CHAT / CONVERSATIONS ──────────────────── */}
            {activeView === 'conversations' && (
              <motion.div key="conversations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-13rem)] flex gap-6">
                
                {/* Conversations Queue Left */}
                <Card className="w-80 p-0 flex flex-col h-full overflow-hidden">
                  <div className="p-3 border-b border-[var(--border-primary)]">
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Active Threads</span>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-primary)]">
                    {tickets.map(t => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={cn(
                          'p-3 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-all flex items-start gap-3',
                          selectedTicket?.id === t.id && 'bg-indigo-500/5 border-l-2 border-indigo-500 pl-2.5'
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0 text-xs font-bold text-[var(--text-secondary)]">
                          {t.user_id.substring(0,2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[var(--text-tertiary)] font-bold">{t.id}</span>
                            <span className="text-[9px] text-[var(--text-tertiary)]">
                              {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[var(--text-primary)] truncate mt-0.5">{t.title}</p>
                          <p className="text-[10px] text-[var(--text-tertiary)] truncate">{t.user_id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Messages Chat Box */}
                <Card className="flex-1 p-0 flex flex-col h-full overflow-hidden">
                  {selectedTicket ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-secondary)] flex-shrink-0">
                        <div>
                          <h4 className="text-xs font-bold text-[var(--text-primary)]">{selectedTicket.title}</h4>
                          <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Chatting with {selectedTicket.user_id}</p>
                        </div>
                        <Badge variant="status">{selectedTicket.status}</Badge>
                      </div>

                      {/* Messages body */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-tertiary)]">
                        {/* Initial system trigger message */}
                        <div className="flex justify-center">
                          <span className="text-[9px] font-semibold text-[var(--text-tertiary)] bg-[var(--bg-primary)] px-2.5 py-1 rounded-full border border-[var(--border-primary)]">
                            Secure encrypted chat session started · SLA target: 2h
                          </span>
                        </div>

                        {/* Conversation messages mapping */}
                        {chatMessages.map((msg, i) => {
                          const isMe = msg.sender === 'Support Agent' || msg.sender === (user?.full_name || '');
                          return (
                            <div key={i} className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}>
                              <div className={cn(
                                'max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-sm',
                                isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-tl-none'
                              )}>
                                {msg.text}
                              </div>
                              <span className="text-[9px] text-[var(--text-tertiary)] mt-1 px-1">
                                {msg.time} {isMe && '· Read'}
                              </span>
                            </div>
                          );
                        })}

                        {/* Simulated typing indicator */}
                        {typing && (
                          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)] italic pl-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: '300ms' }} />
                            Customer is typing...
                          </div>
                        )}
                        <div ref={chatBottomRef} />
                      </div>

                      {/* Chat Input controls */}
                      <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] flex-shrink-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Type a message..."
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                            className="flex-1 h-10 px-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
                          />
                          <button
                            onClick={() => setReplyText(prev => prev + ' 👍')}
                            className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)]"
                          >
                            <Smile className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toast.success('Resolution document attached successfully.')}
                            className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)]"
                            title="Attach File"
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>
                          <Button
                            onClick={handleSendChatMessage}
                            disabled={!replyText.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[var(--text-tertiary)]">
                      Select an active conversation to view and respond.
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* ─── SUB-VIEW: AI SUGGESTIONS ─────────────────────────────────── */}
            {activeView === 'ai-suggestions' && (
              <motion.div key="ai-suggestions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* AI Resolution Recommendations list */}
                <div className="xl:col-span-2 space-y-6">
                  <Card className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-[var(--border-primary)] pb-3">
                      <Brain className="w-5 h-5 text-violet-400" />
                      <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Active AI Auto-Draft System</h3>
                    </div>

                    <div className="space-y-4">
                      {selectedTicket ? (
                        <>
                          <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-violet-400">TKT Category Recommendation: {selectedTicket.category}</span>
                              <Badge variant="status">Confidence Score: {selectedTicket.ai_insights?.category_confidence ? `${Math.floor(selectedTicket.ai_insights.category_confidence * 100)}%` : '95%'}</Badge>
                            </div>
                            
                            <p className="text-xs text-[var(--text-tertiary)] uppercase font-semibold">Suggested Response Draft:</p>
                            
                            {isEditingDraft ? (
                              <textarea
                                value={aiDraft}
                                onChange={e => setAiDraft(e.target.value)}
                                className="w-full text-xs p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)]"
                                rows={5}
                              />
                            ) : (
                              <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs text-[var(--text-secondary)] font-mono leading-relaxed whitespace-pre-line">
                                {aiDraft}
                              </div>
                            )}

                            <div className="flex gap-2 justify-end pt-1">
                              {isEditingDraft ? (
                                <button
                                  onClick={() => setIsEditingDraft(false)}
                                  className="px-3 py-1.5 text-[10px] font-bold bg-green-500 text-white rounded"
                                >
                                  Save Edit
                                </button>
                              ) : (
                                <button
                                  onClick={() => setIsEditingDraft(true)}
                                  className="px-3 py-1.5 text-[10px] font-bold bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)] rounded"
                                >
                                  Edit Draft
                                </button>
                              )}
                              <button
                                onClick={handleAcceptAIDraft}
                                className="px-3 py-1.5 text-[10px] font-bold bg-indigo-600 text-white rounded hover:bg-indigo-500"
                              >
                                Accept Draft
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-[var(--text-tertiary)]">Select a ticket in the sidebar workspace to review automated suggestion drafts.</p>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Similarity / Duplicates column */}
                <div className="xl:col-span-1 space-y-6">
                  <Card className="space-y-4">
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-orange-400" /> Duplicate Ticket Detection
                    </h4>
                    {selectedTicket?.is_duplicate ? (
                      <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl space-y-2">
                        <p className="text-xs text-orange-400 font-semibold">Flagged Duplicate Entry</p>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          Similar issues were submitted within the company boundary. You can close this ticket as duplicate.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-tertiary)]">No current duplicates flagged for selected ticket.</p>
                    )}
                  </Card>

                  <Card className="space-y-4">
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-400" /> KB Integration Matches
                    </h4>
                    <div className="space-y-2">
                      {selectedTicket && (AI_RESOLUTION_SUGGESTIONS[selectedTicket.category || 'General']?.kb || []).map((kb, i) => (
                        <div key={i} className="p-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg text-xs hover:border-indigo-500/30 cursor-pointer">
                          <p className="font-semibold text-[var(--text-secondary)]">{kb}</p>
                          <span className="text-[10px] text-indigo-400">Match score: 94%</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* ─── SUB-VIEW: KNOWLEDGE BASE ────────────────────────────────── */}
            {activeView === 'kb' && (
              <motion.div key="kb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <Card className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[var(--border-primary)] pb-3">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Company Knowledge Base</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'Configuring VPN Split Tunneling', cat: 'Network', read: '120 views', desc: 'Step-by-step setup guides for remote workforces utilizing Windows/Mac clients.' },
                      { title: 'SSO Federated Access Reset Process', cat: 'Access Control', read: '84 views', desc: 'Process checklist for clearing security token mismatch on federated AD networks.' },
                      { title: 'Stripe API Gateway Refund Workarounds', cat: 'Billing', read: '230 views', desc: 'Action procedures for manual gateway captures and transaction retries.' },
                      { title: 'Hardware Diagnostic Test Routines', cat: 'Hardware', read: '65 views', desc: 'Pre-flight check parameters for diagnostics testing on standard company laptop deployments.' },
                    ].map((kb, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] space-y-2 hover:border-indigo-500/30 transition-all cursor-pointer">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold text-[9px] uppercase tracking-wider">{kb.cat}</span>
                          <span className="text-[10px] text-[var(--text-tertiary)]">{kb.read}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">{kb.title}</h4>
                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{kb.desc}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─── SUB-VIEW: NOTIFICATIONS ─────────────────────────────────── */}
            {activeView === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-2xl mx-auto">
                <Card className="flex items-center justify-between py-3">
                  <span className="text-xs font-bold text-[var(--text-primary)]">Unread notifications count</span>
                  <button
                    onClick={() => {
                      setAgentNotifs(prev => prev.map(n => ({ ...n, read: true })));
                      toast.success('Marked all as read.');
                    }}
                    className="text-xs text-indigo-400 font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                </Card>

                {agentNotifs.map(n => (
                  <div
                    key={n.id}
                    className={cn(
                      'p-4 rounded-xl border flex gap-3 transition-all',
                      n.read ? 'bg-[var(--bg-secondary)] border-[var(--border-primary)]' : 'bg-indigo-500/5 border-indigo-500/25'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-indigo-400">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">{n.title}</h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{n.desc}</p>
                      <span className="text-[10px] text-[var(--text-tertiary)] mt-2 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ─── SUB-VIEW: PROFILE ───────────────────────────────────────── */}
            {activeView === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
                {/* Profile Card */}
                <Card className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black font-mono">
                    SA
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{user?.full_name || 'Support Agent'}</h3>
                    <p className="text-xs text-indigo-400 font-semibold uppercase mt-0.5">Tier 1 Support Engineer</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Company boundary: {company} · ID: EMP-9923</p>
                  </div>
                </Card>

                {/* Details list */}
                <Card className="space-y-3">
                  {[
                    { label: 'Name', value: user?.full_name || 'Support Agent' },
                    { label: 'Employee ID', value: 'EMP-9923' },
                    { label: 'Email', value: user?.email || 'agent@helpdesk.com' },
                    { label: 'Phone', value: '+1 (555) 019-9238' },
                    { label: 'Department', value: 'Technical Support Engineering L1' },
                    { label: 'Company Assigned', value: company },
                    { label: 'Experience Level', value: 'Junior Support Engineer' },
                  ].map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-[var(--border-primary)] last:border-0">
                      <span className="text-[var(--text-tertiary)]">{d.label}</span>
                      <strong className="text-[var(--text-primary)]">{d.value}</strong>
                    </div>
                  ))}
                </Card>

                {/* Statistics summaries */}
                <Card className="space-y-4">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-yellow-400" /> Productivity metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-primary)]">
                      <span className="text-[10px] text-[var(--text-tertiary)] block">Today's CSAT Target</span>
                      <strong className="text-lg font-bold text-[var(--text-primary)] mt-1 block">98%</strong>
                    </div>
                    <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-primary)]">
                      <span className="text-[10px] text-[var(--text-tertiary)] block">First Contact Resolution Rate</span>
                      <strong className="text-lg font-bold text-[var(--text-primary)] mt-1 block">84.2%</strong>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ─── MODAL: STATUS CHANGE ─────────────────────────────────────────── */}
      {showStatusModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">Update Ticket Status</h4>
              <button onClick={() => setShowStatusModal(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {[
                { s: 'Open', label: 'Open' },
                { s: 'Assigned', label: 'Assigned' },
                { s: 'In_Progress', label: 'In Progress' },
                { s: 'Waiting_Customer', label: 'Waiting for Customer' },
                { s: 'Escalated', label: 'Escalated' },
                { s: 'Resolved', label: 'Resolved' },
                { s: 'Closed', label: 'Closed' },
              ].map(item => (
                <button
                  key={item.s}
                  onClick={() => handleUpdateStatus(item.s)}
                  className="w-full py-2 px-3 text-left text-xs font-semibold rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] hover:border-indigo-500/30 text-[var(--text-secondary)] hover:text-indigo-400"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ESCALATION ────────────────────────────────────────────── */}
      {showEscalationModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">Escalate Ticket</h4>
              <button onClick={() => setShowEscalationModal(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Escalation Reason</label>
                <select
                  value={escalationReason}
                  onChange={e => setEscalationReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Billing Issue">Billing Issue</option>
                  <option value="Security Issue">Security Issue</option>
                  <option value="Management Approval">Management Approval</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Escalation Details Note</label>
                <textarea
                  rows={4}
                  value={escalationNote}
                  onChange={e => setEscalationNote(e.target.value)}
                  placeholder="Explain why this ticket requires L2/Management intervention..."
                  className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-tertiary)]"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowEscalationModal(false)}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalateTicket}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-500 text-white"
              >
                Escalate Ticket
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
