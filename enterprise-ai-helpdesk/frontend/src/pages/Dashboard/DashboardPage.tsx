import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Ticket, Plus, BarChart3, Bot, Search, Bell, User,
  FileText, Users, Settings, ChevronLeft, ChevronRight, Sparkles, LogOut,
  ShieldCheck, Building, ClipboardList, MessageSquare, TrendingUp, Clock,
  CheckCircle2, X, AlertTriangle, Key, Mail, Phone, Calendar, BookOpen,
  MapPin, ShieldAlert, Award, Power, RefreshCw, Eye, EyeOff, Save,
  PlusCircle, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Globe, Lock,
  Layers, Star, Brain,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { ticketStore } from '@/utils/ticketStore';
import type { Ticket as TicketType } from '@/types';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

// ─── Helpers to enforce company boundaries ─────────────────────────────────
const getAdminCompany = (email: string | null | undefined): string => {
  if (!email) return 'RedBus';
  const prefix = email.toLowerCase().split('@')[0];
  const domain = email.toLowerCase().split('@')[1] || '';
  if (domain.includes('redbus') || prefix.includes('redbus')) return 'RedBus';
  if (domain.includes('irctc') || prefix.includes('irctc')) return 'IRCTC';
  if (domain.includes('pvr') || prefix.includes('pvr')) return 'PVR';
  if (domain.includes('amazon') || prefix.includes('amazon')) return 'Amazon';
  if (domain.includes('swiggy') || prefix.includes('swiggy')) return 'Swiggy';
  return 'RedBus'; // Default fallback
};

const getTicketCompany = (ticket: TicketType): string => {
  const email = ticket.user_id;
  const domain = email.toLowerCase().split('@')[1] || '';
  if (domain.includes('redbus')) return 'RedBus';
  if (domain.includes('irctc')) return 'IRCTC';
  if (domain.includes('pvr')) return 'PVR';
  if (domain.includes('amazon')) return 'Amazon';
  if (domain.includes('swiggy')) return 'Swiggy';
  
  if (ticket.category === 'Payment' || ticket.category === 'Refund') return 'RedBus';
  if (ticket.category === 'Network' || ticket.category === 'Security') return 'IRCTC';
  if (ticket.category === 'Login' || ticket.category === 'Account') return 'PVR';
  return 'RedBus';
};

// ─── Constants & Styles ────────────────────────────────────────────────────────
const PRIORITY_COLORS: Record<string, string> = {
  Critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  High: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Low: 'text-green-400 bg-green-500/10 border-green-500/20',
};

const STATUS_COLORS: Record<string, string> = {
  Open: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  In_Progress: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Resolved: 'text-green-400 bg-green-500/10 border-green-500/20',
  Closed: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Enforce company boundaries
  const company = getAdminCompany(user?.email);

  // Tab View tracking for unified sub-panel
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tickets' | 'assign' | 'agents' | 'customers' | 'departments' | 'categories' | 'reports' | 'analytics' | 'settings' | 'notifications' | 'profile'>('dashboard');

  // Live state managers
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  // Departments List
  const [departments, setDepartments] = useState([
    'Technical Support', 'Billing', 'Refund', 'Security', 'Network', 'Software', 'Hardware', 'Customer Care'
  ]);
  const [newDept, setNewDept] = useState('');
  const [editingDept, setEditingDept] = useState<{ idx: number; val: string } | null>(null);

  // Categories List
  const [categories, setCategories] = useState([
    'Login', 'Payment', 'Refund', 'Technical', 'Delivery', 'Account', 'Security', 'Billing', 'Bug', 'Feature Request', 'General Inquiry', 'Network', 'Hardware', 'Software', 'Access Control'
  ]);
  const [newCat, setNewCat] = useState('');
  const [editingCat, setEditingCat] = useState<{ idx: number; val: string } | null>(null);

  // Support Agents List (company specific)
  const [agents, setAgents] = useState([
    { id: 'EMP-101', name: 'Alex Rivera', email: `alex.rivera@${company.toLowerCase()}.com`, phone: '+1 (555) 019-2831', dept: 'Technical Support', designation: 'Senior Agent', status: 'Active', resolved: 42, assigned: 5, photo: 'AR' },
    { id: 'EMP-102', name: 'Sarah Jenkins', email: `sarah.jenkins@${company.toLowerCase()}.com`, phone: '+1 (555) 014-9923', dept: 'Billing', designation: 'Billing Lead', status: 'Active', resolved: 28, assigned: 3, photo: 'SJ' },
    { id: 'EMP-103', name: 'David Kim', email: `david.kim@${company.toLowerCase()}.com`, phone: '+1 (555) 012-4412', dept: 'Security', designation: 'L2 Engineer', status: 'Active', resolved: 35, assigned: 6, photo: 'DK' },
  ]);

  // Add Agent Form State
  const [agentForm, setAgentForm] = useState({
    name: '', email: '', phone: '', dept: 'Technical Support', designation: 'Support Agent', pass: '', confirmPass: '', empId: '', photo: ''
  });
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);

  // Assign Ticket Quick Selection State
  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(null);
  const [assignedAgentId, setAssignedAgentId] = useState('');

  // Settings State
  const [settings, setSettings] = useState({
    name: `${company} Transport Solutions`,
    email: `support@${company.toLowerCase()}.com`,
    phone: '+1 (555) 993-2881',
    hours: '09:00 - 18:00 (EST)',
    address: '100 Enterprise Way, Suite 400',
    autoAssign: true,
    slaCritical: '1 Hour',
    slaHigh: '4 Hours',
    slaMedium: '8 Hours',
    slaLow: '24 Hours',
    notifNew: true,
    notifEscalated: true,
    aiAutoClassify: true,
    aiDetectDuplicate: true,
  });

  // Admin Notification Logs list
  const [notifications, setNotifications] = useState([
    { id: 'notif-1', title: 'New Ticket Created', msg: 'TKT-1042 was created by john@company.com.', time: '5 mins ago', read: false },
    { id: 'notif-2', title: 'Ticket Escalated', msg: 'TKT-1041 has been escalated to Tier 2 support.', time: '15 mins ago', read: false },
    { id: 'notif-3', title: 'SLA Warning Alert', msg: 'TKT-1042 SLA window is expiring in 45 minutes.', time: '30 mins ago', read: false },
    { id: 'notif-4', title: 'Customer Replied', msg: 'New reply from user on TKT-1040.', time: '1 hour ago', read: true },
  ]);

  // Load and enforce company scope boundary on mount/refresh
  useEffect(() => {
    const all = ticketStore.getTickets();
    const filtered = all.filter(t => getTicketCompany(t) === company);
    setTickets(filtered);
  }, [company]);

  const refreshTickets = () => {
    const all = ticketStore.getTickets();
    const filtered = all.filter(t => getTicketCompany(t) === company);
    setTickets(filtered);
  };

  // ─── Stats Metrics computations ───────────────────────────────────────────
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'In_Progress').length;
  const pendingTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In_Progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;
  const closedTickets = tickets.filter(t => t.status === 'Closed').length;
  const highPriorityTickets = tickets.filter(t => t.priority === 'Critical' || t.priority === 'High').length;
  const avgResolutionTime = '2.4 hours';
  const customerSatisfaction = '4.8 ★';
  const activeSupportAgents = agents.filter(a => a.status === 'Active').length;
  
  // Calculate distinct customers raising tickets
  const distinctCustomers = Array.from(new Set(tickets.map(t => t.user_id)));
  const totalCustomers = distinctCustomers.length;

  // ─── Actions & Handlers ──────────────────────────────────────────────────
  const handleAssignAgent = (ticketId: string, agentName: string) => {
    // Add assignment history logs into ticket responses
    const updated = ticketStore.addAgentResponse(
      ticketId,
      'System Automator',
      `🔄 Ticket assigned to support specialist ${agentName}.`,
      'In_Progress'
    );
    if (updated) {
      refreshTickets();
      // Increase agent count locally for demo
      setAgents(prev => prev.map(a => a.name === agentName ? { ...a, assigned: a.assigned + 1 } : a));
      toast.success(`Ticket assigned to ${agentName}`);
    }
  };

  const handleUpdateStatus = (ticketId: string, status: string) => {
    const updated = ticketStore.addAgentResponse(
      ticketId,
      user?.full_name || 'Company Admin',
      `🔄 Status manually updated to ${status.replace('_', ' ')} by Admin.`,
      status
    );
    if (updated) {
      refreshTickets();
      toast.success(`Status updated to ${status}`);
    }
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (agentForm.pass !== agentForm.confirmPass) {
      toast.error('Passwords do not match.');
      return;
    }
    const newAgent = {
      id: agentForm.empId || `EMP-${100 + agents.length + 1}`,
      name: agentForm.name,
      email: agentForm.email,
      phone: agentForm.phone || '+1 (555) 000-0000',
      dept: agentForm.dept,
      designation: agentForm.designation,
      status: 'Active',
      resolved: 0,
      assigned: 0,
      photo: agentForm.name.substring(0, 2).toUpperCase(),
    };
    setAgents(prev => [...prev, newAgent]);
    setShowAddAgentModal(false);
    setAgentForm({ name: '', email: '', phone: '', dept: 'Technical Support', designation: 'Support Agent', pass: '', confirmPass: '', empId: '', photo: '' });
    toast.success(`Support Agent ${newAgent.name} registered successfully!`);
  };

  const handleExport = (type: 'pdf' | 'excel' | 'csv') => {
    toast.info(`Generating Governance Performance report: ${type.toUpperCase()}...`);
    setTimeout(() => {
      toast.success(`Export successful! Downloaded Report_${Date.now()}.${type}`);
    }, 1000);
  };

  return (
    <div className="flex h-[calc(100vh-4.5rem)] -m-4 lg:-m-6 overflow-hidden">
      
      {/* ─── Inner Navigation Bar ────────────────────────────────────────── */}
      <aside className="w-56 border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] flex flex-col h-full flex-shrink-0">
        <div className="p-4 border-b border-[var(--border-primary)] flex items-center gap-2">
          <Building className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-[var(--text-primary)] truncate">{company} Workspace</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'tickets', label: 'Tickets', icon: Ticket },
            { id: 'assign', label: 'Assign Tickets', icon: ClipboardList },
            { id: 'agents', label: 'Support Agents', icon: Users },
            { id: 'customers', label: 'Customers', icon: User },
            { id: 'departments', label: 'Departments', icon: Layers },
            { id: 'categories', label: 'Categories', icon: BookOpen },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'settings', label: 'Company Settings', icon: Settings },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'profile', label: 'Profile', icon: User },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all',
                  activeTab === tab.id
                    ? 'bg-indigo-600/15 text-indigo-400'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--border-primary)] space-y-2">
          <button
            onClick={() => { logout(); navigate('/admin-login'); }}
            className="w-full py-2 rounded-xl text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </aside>

      {/* ─── Main Content Workspace Panel ─────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 bg-[var(--bg-primary)]">
        <AnimatePresence mode="wait">
          
          {/* ─── TAB: DASHBOARD ───────────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h1 className="text-xl font-bold text-[var(--text-primary)]">Admin Control Room</h1>
                  <p className="text-xs text-[var(--text-tertiary)]">Welcome to the central command hub for {company} operations</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
                  <Globe className="w-3.5 h-3.5" /> Company Admin Gateway
                </div>
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {[
                  { label: 'Total Tickets', value: totalTickets, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { label: 'Open Tickets', value: openTickets, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { label: 'In Progress', value: inProgressTickets, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'Pending Response', value: pendingTickets, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                  { label: 'Resolved Tickets', value: resolvedTickets, color: 'text-green-400', bg: 'bg-green-500/10' },
                  { label: 'Closed Tickets', value: closedTickets, color: 'text-gray-400', bg: 'bg-gray-500/10' },
                  { label: 'High Priority', value: highPriorityTickets, color: 'text-red-400', bg: 'bg-red-500/10' },
                  { label: 'Avg Resolution Time', value: avgResolutionTime, icon: Clock, color: 'text-violet-400', bg: 'bg-violet-500/10' },
                  { label: 'Customer Satisfaction', value: customerSatisfaction, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                  { label: 'Active Support Agents', value: activeSupportAgents, icon: Users, color: 'text-teal-400', bg: 'bg-teal-500/10' },
                  { label: 'Total Customers', value: totalCustomers, icon: User, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                ].map((kpi, idx) => (
                  <Card key={idx} className="flex items-center gap-3 p-3.5 hover:border-indigo-500/30 transition-all cursor-pointer">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', kpi.bg)}>
                      {kpi.icon ? <kpi.icon className={cn('w-5 h-5', kpi.color)} /> : <ClipboardList className={cn('w-5 h-5', kpi.color)} />}
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider leading-none">{kpi.label}</p>
                      <p className="text-lg font-black text-[var(--text-primary)] mt-1">{kpi.value}</p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Operations Analytics Summary Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border-primary)]">
                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-400" /> Resolution Efficiency Trends
                    </h3>
                    <Badge variant="status">Live SLA Tracker</Badge>
                  </div>
                  
                  {/* Inline visual custom SVG chart mimic */}
                  <div className="space-y-4 pt-2">
                    {[
                      { day: 'Payments & Refunds', val: 88, color: 'bg-red-500' },
                      { day: 'SSO Login issues', val: 94, color: 'bg-indigo-500' },
                      { day: 'Bug Troubleshooting', val: 72, color: 'bg-amber-500' },
                      { day: 'Customer Care general', val: 96, color: 'bg-green-500' },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-[var(--text-secondary)]">{item.day}</span>
                          <span className="text-[var(--text-primary)] font-bold">{item.val}% efficiency</span>
                        </div>
                        <div className="h-2.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', item.color)} style={{ width: `${item.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="space-y-4">
                  <div className="pb-3 border-b border-[var(--border-primary)]">
                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" /> Platform Security Rules
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-primary)] space-y-1">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">SaaS Isolation Status</span>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        Data boundary checking is enabled. You can only view tickets raised by users matching {company} configurations.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* ─── TAB: TICKETS ─────────────────────────────────────────────── */}
          {activeTab === 'tickets' && (
            <motion.div key="tickets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Card className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    placeholder="Search tickets by ID, title, customer..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
                  />
                </div>
              </Card>

              <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Ticket ID</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Customer</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Category</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Priority</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Assigned Agent</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Created Date</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-primary)]">
                      {tickets.filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
                        <tr key={t.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-indigo-400">{t.id}</td>
                          <td className="px-5 py-4 font-medium text-[var(--text-primary)]">{t.user_id}</td>
                          <td className="px-5 py-4 text-[var(--text-secondary)]">{t.category}</td>
                          <td className="px-5 py-4">
                            <span className={cn('px-2 py-0.5 rounded text-[9px] font-bold border', PRIORITY_COLORS[t.priority || 'Low'])}>
                              {t.priority}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold border', STATUS_COLORS[t.status])}>
                              {t.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-[var(--text-secondary)] font-medium">
                            {t.agent_responses?.find(r => r.agent_name !== 'System' && r.agent_name !== 'Internal Note')?.agent_name || 'Unassigned'}
                          </td>
                          <td className="px-5 py-4 text-[var(--text-tertiary)]">{new Date(t.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex gap-1.5 justify-end">
                              <select
                                onChange={e => handleUpdateStatus(t.id, e.target.value)}
                                defaultValue={t.status}
                                className="h-7 px-2 rounded bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[10px] text-[var(--text-primary)] focus:outline-none"
                              >
                                <option value="Open">Open</option>
                                <option value="In_Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                              </select>
                              <button
                                onClick={() => handleUpdateStatus(t.id, 'Closed')}
                                className="p-1 px-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/20"
                              >
                                Close
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ─── TAB: ASSIGN TICKETS ──────────────────────────────────────── */}
          {activeTab === 'assign' && (
            <motion.div key="assign" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Ticket ID</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Customer</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Priority</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Suggested Agent (AI)</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Current Status</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] text-right">Assign Agent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-primary)]">
                      {tickets.map(t => {
                        const defaultAgent = agents[Math.floor(Math.random() * agents.length)]?.name || 'Alex Rivera';
                        return (
                          <tr key={t.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                            <td className="px-5 py-4 font-mono font-bold text-indigo-400">{t.id}</td>
                            <td className="px-5 py-4 text-[var(--text-primary)]">{t.user_id}</td>
                            <td className="px-5 py-4">
                              <span className={cn('px-2 py-0.5 rounded text-[9px] font-bold border', PRIORITY_COLORS[t.priority || 'Low'])}>
                                {t.priority}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 text-violet-400 font-semibold">
                                <Brain className="w-3.5 h-3.5" /> {defaultAgent} (92% match)
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold border', STATUS_COLORS[t.status])}>
                                {t.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex justify-end items-center gap-2">
                                <select
                                  onChange={e => setAssignedAgentId(e.target.value)}
                                  className="h-8 px-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                                >
                                  <option value="">Choose Agent...</option>
                                  {agents.map(a => (
                                    <option key={a.id} value={a.name}>{a.name} ({a.dept})</option>
                                  ))}
                                </select>
                                <Button
                                  onClick={() => handleAssignAgent(t.id, assignedAgentId || defaultAgent)}
                                  size="sm"
                                >
                                  Assign
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ─── TAB: SUPPORT AGENTS ──────────────────────────────────────── */}
          {activeTab === 'agents' && (
            <motion.div key="agents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--text-secondary)]">Support Specialist Directory</span>
                <Button size="sm" onClick={() => setShowAddAgentModal(true)} className="flex items-center gap-1">
                  <PlusCircle className="w-4 h-4" /> Add Support Agent
                </Button>
              </div>

              <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Employee ID</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Name</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Department</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Email</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Assigned Tickets</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Resolved Tickets</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-primary)]">
                      {agents.map(agent => (
                        <tr key={agent.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-[var(--text-secondary)]">{agent.id}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center">
                                {agent.photo}
                              </div>
                              <span className="font-semibold text-[var(--text-primary)]">{agent.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[var(--text-secondary)]">{agent.dept}</td>
                          <td className="px-5 py-4 text-[var(--text-secondary)]">{agent.email}</td>
                          <td className="px-5 py-4 text-center font-semibold text-[var(--text-primary)]">{agent.assigned}</td>
                          <td className="px-5 py-4 text-center font-semibold text-[var(--text-primary)]">{agent.resolved}</td>
                          <td className="px-5 py-4">
                            <span className={cn(
                              'px-2 py-0.5 rounded-full text-[9px] font-bold border',
                              agent.status === 'Active' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-gray-400 bg-gray-500/10 border-gray-500/20'
                            )}>
                              {agent.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' } : a));
                                  toast.success(`Agent status toggled.`);
                                }}
                                className="p-1 px-2 rounded bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[10px] font-bold text-[var(--text-secondary)] hover:text-indigo-400"
                              >
                                {agent.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => toast.success(`Reset password link sent to ${agent.email}`)}
                                className="p-1 px-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold hover:bg-indigo-500/20"
                              >
                                Reset Pass
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ─── TAB: CUSTOMERS ───────────────────────────────────────────── */}
          {activeTab === 'customers' && (
            <motion.div key="customers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Customer Name</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Email</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Phone</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Total Tickets</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Resolved Tickets</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Open Tickets</th>
                        <th className="px-5 py-4 font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Last Activity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-primary)]">
                      {distinctCustomers.map((cust, i) => {
                        const custTickets = tickets.filter(t => t.user_id === cust);
                        const opened = custTickets.filter(t => t.status === 'Open').length;
                        const solved = custTickets.filter(t => t.status === 'Resolved').length;
                        return (
                          <tr key={i} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                            <td className="px-5 py-4 font-semibold text-[var(--text-primary)]">{cust.split('@')[0]}</td>
                            <td className="px-5 py-4 text-[var(--text-secondary)]">{cust}</td>
                            <td className="px-5 py-4 text-[var(--text-tertiary)]">+1 (555) 011-8849</td>
                            <td className="px-5 py-4 text-center font-bold text-[var(--text-primary)]">{custTickets.length}</td>
                            <td className="px-5 py-4 text-center font-bold text-green-400">{solved}</td>
                            <td className="px-5 py-4 text-center font-bold text-amber-400">{opened}</td>
                            <td className="px-5 py-4 text-[var(--text-tertiary)]">Just now</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ─── TAB: DEPARTMENTS ─────────────────────────────────────────── */}
          {activeTab === 'departments' && (
            <motion.div key="departments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-xl mx-auto">
              <Card className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New department name..."
                    value={newDept}
                    onChange={e => setNewDept(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
                  />
                  <Button onClick={() => {
                    if (newDept.trim()) {
                      setDepartments(prev => [...prev, newDept.trim()]);
                      setNewDept('');
                      toast.success('Department added successfully!');
                    }
                  }}>
                    Add Department
                  </Button>
                </div>

                <div className="divide-y divide-[var(--border-primary)]">
                  {departments.map((dept, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      {editingDept?.idx === idx ? (
                        <input
                          type="text"
                          value={editingDept.val}
                          onChange={e => setEditingDept({ idx, val: e.target.value })}
                          className="h-8 px-2 rounded border border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-xs"
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              setDepartments(prev => prev.map((d, i) => i === idx ? editingDept.val : d));
                              setEditingDept(null);
                              toast.success('Department updated.');
                            }
                          }}
                        />
                      ) : (
                        <span className="text-xs font-semibold text-[var(--text-primary)]">{dept}</span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingDept({ idx, val: dept })}
                          className="p-1 text-[var(--text-tertiary)] hover:text-indigo-400"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDepartments(prev => prev.filter((_, i) => i !== idx));
                            toast.error('Department deleted.');
                          }}
                          className="p-1 text-[var(--text-tertiary)] hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* ─── TAB: CATEGORIES ──────────────────────────────────────────── */}
          {activeTab === 'categories' && (
            <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-xl mx-auto">
              <Card className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New category name..."
                    value={newCat}
                    onChange={e => setNewCat(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
                  />
                  <Button onClick={() => {
                    if (newCat.trim()) {
                      setCategories(prev => [...prev, newCat.trim()]);
                      setNewCat('');
                      toast.success('Category added successfully!');
                    }
                  }}>
                    Add Category
                  </Button>
                </div>

                <div className="divide-y divide-[var(--border-primary)]">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      {editingCat?.idx === idx ? (
                        <input
                          type="text"
                          value={editingCat.val}
                          onChange={e => setEditingCat({ idx, val: e.target.value })}
                          className="h-8 px-2 rounded border border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-xs"
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              setCategories(prev => prev.map((c, i) => i === idx ? editingCat.val : c));
                              setEditingCat(null);
                              toast.success('Category updated.');
                            }
                          }}
                        />
                      ) : (
                        <span className="text-xs font-semibold text-[var(--text-primary)]">{cat}</span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingCat({ idx, val: cat })}
                          className="p-1 text-[var(--text-tertiary)] hover:text-indigo-400"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setCategories(prev => prev.filter((_, i) => i !== idx));
                            toast.error('Category deleted.');
                          }}
                          className="p-1 text-[var(--text-tertiary)] hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* ─── TAB: ANALYTICS ───────────────────────────────────────────── */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Ticket Status Distribution', desc: 'Resolved vs Pending volumes' },
                  { title: 'Priority Distribution', desc: 'Critical, High, Medium, Low breakdown' },
                  { title: 'Category Distribution', desc: 'Login, Payments, SSO issues' },
                  { title: 'Agent Performance Telemetry', desc: 'CSAT ratings vs resolution rates' },
                  { title: 'Resolution Times SLA', desc: 'Hourly response benchmarks' },
                  { title: 'Customer Satisfaction Score', desc: 'CSAT percentages' },
                ].map((item, idx) => (
                  <Card key={idx} className="space-y-3">
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">{item.title}</h4>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{item.desc}</p>
                    <div className="h-32 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-primary)] flex items-center justify-center text-[10px] text-[var(--text-tertiary)]">
                      Chart Visual Mock telemetry
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── TAB: REPORTS ─────────────────────────────────────────────── */}
          {activeTab === 'reports' && (
            <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-xl mx-auto">
              <Card className="space-y-4">
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Generate Operational Reports</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Configure and download detailed diagnostic reports on agent compliance and SLA metrics.
                </p>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  {[
                    'Daily Report', 'Weekly Report', 'Monthly Report', 'Support Agent Report', 'Ticket Report', 'Category Report', 'Resolution Report'
                  ].map((rep, idx) => (
                    <div key={idx} className="p-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{rep}</span>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleExport('pdf')} className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold">PDF</button>
                        <button onClick={() => handleExport('excel')} className="px-2.5 py-1 rounded bg-green-500/10 text-green-400 text-[10px] font-bold">Excel</button>
                        <button onClick={() => handleExport('csv')} className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">CSV</button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* ─── TAB: SETTINGS ────────────────────────────────────────────── */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl mx-auto">
              <Card className="space-y-4">
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Company Profile Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Company Name</label>
                    <input
                      type="text"
                      value={settings.name}
                      onChange={e => setSettings(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Support Email Address</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={e => setSettings(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Support Phone</label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={e => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Business Working Hours</label>
                    <input
                      type="text"
                      value={settings.hours}
                      onChange={e => setSettings(prev => ({ ...prev, hours: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Business Physical Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={e => setSettings(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </Card>

              {/* SLA and Auto Assignment */}
              <Card className="space-y-4">
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">AI & SLAs SLA Configurations</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Critical SLA', key: 'slaCritical' },
                    { label: 'High SLA', key: 'slaHigh' },
                    { label: 'Medium SLA', key: 'slaMedium' },
                    { label: 'Low SLA', key: 'slaLow' },
                  ].map(sla => (
                    <div key={sla.key} className="space-y-1">
                      <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase">{sla.label}</label>
                      <input
                        type="text"
                        value={(settings as any)[sla.key]}
                        onChange={e => setSettings(prev => ({ ...prev, [sla.key]: e.target.value }))}
                        className="w-full h-9 px-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">AI Auto-Assignment Algorithm</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">Assign incoming tickets automatically based on agent telemetry.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoAssign}
                    onChange={e => setSettings(prev => ({ ...prev, autoAssign: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 border-[var(--border-primary)] rounded focus:ring-indigo-500"
                  />
                </div>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => toast.success('Company settings saved successfully.')}>Save Settings</Button>
              </div>
            </motion.div>
          )}

          {/* ─── TAB: NOTIFICATIONS ───────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-xl mx-auto">
              <Card className="flex items-center justify-between py-3">
                <span className="text-xs font-bold text-[var(--text-primary)]">Notifications Room</span>
                <button
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    toast.success('Marked all as read.');
                  }}
                  className="text-xs text-indigo-400 font-semibold hover:underline"
                >
                  Mark all read
                </button>
              </Card>

              {notifications.map(n => (
                <div key={n.id} className={cn('p-4 rounded-xl border flex gap-3', n.read ? 'bg-[var(--bg-secondary)] border-[var(--border-primary)]' : 'bg-indigo-500/5 border-indigo-500/25')}>
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-indigo-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">{n.title}</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{n.msg}</p>
                    <span className="text-[10px] text-[var(--text-tertiary)] mt-2 block">{n.time}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ─── TAB: PROFILE ─────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto space-y-4">
              <Card className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black font-mono">
                  CA
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">{user?.full_name || 'Company Admin'}</h3>
                  <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mt-0.5">{company} Administrator</p>
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Bound to company: {company}</p>
                </div>
              </Card>

              <Card className="space-y-3">
                {[
                  { label: 'Admin Name', value: user?.full_name || 'Company Admin' },
                  { label: 'Support Email', value: user?.email || `admin@${company.toLowerCase()}.com` },
                  { label: 'Phone', value: '+1 (555) 012-9938' },
                  { label: 'Assigned Company', value: company },
                  { label: 'Assigned Role Permissions', value: 'Manager Governance Access' },
                  { label: 'Last Login Timestamp', value: new Date().toLocaleString() },
                ].map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-[var(--border-primary)] last:border-0">
                    <span className="text-[var(--text-tertiary)]">{d.label}</span>
                    <strong className="text-[var(--text-primary)]">{d.value}</strong>
                  </div>
                ))}
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ─── MODAL: ADD SUPPORT AGENT ────────────────────────────────────── */}
      {showAddAgentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">Register New Agent</h4>
              <button onClick={() => setShowAddAgentModal(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase">Employee ID</label>
                  <input
                    type="text"
                    required
                    placeholder="EMP-106"
                    value={agentForm.empId}
                    onChange={e => setAgentForm(prev => ({ ...prev, empId: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={agentForm.name}
                    onChange={e => setAgentForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder={`agent@${company.toLowerCase()}.com`}
                  value={agentForm.email}
                  onChange={e => setAgentForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full h-9 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase">Department</label>
                  <select
                    value={agentForm.dept}
                    onChange={e => setAgentForm(prev => ({ ...prev, dept: e.target.value }))}
                    className="w-full h-9 px-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase">Designation</label>
                  <input
                    type="text"
                    placeholder="Support Agent"
                    value={agentForm.designation}
                    onChange={e => setAgentForm(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase">Password</label>
                  <input
                    type="password"
                    required
                    value={agentForm.pass}
                    onChange={e => setAgentForm(prev => ({ ...prev, pass: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={agentForm.confirmPass}
                    onChange={e => setAgentForm(prev => ({ ...prev, confirmPass: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAgentModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-primary)]"
                >
                  Cancel
                </button>
                <Button type="submit">
                  Register Specialist
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
