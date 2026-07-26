export const API_BASE_URL = '/api';

export const TICKET_CATEGORIES = [
  'Login', 'Payment', 'Refund', 'Technical', 'Delivery',
  'Account', 'Security', 'Billing', 'Bug', 'Feature Request',
  'General Inquiry', 'Network', 'Hardware', 'Software', 'Access Control',
] as const;

export const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Critical', 'Urgent'] as const;

export const TICKET_STATUSES = ['Open', 'In_Progress', 'Resolved', 'Closed'] as const;

export const USER_ROLES = ['Customer', 'Agent', 'Admin', 'SuperAdmin'] as const;

export const PRIORITY_COLORS: Record<string, string> = {
  Low: '#22c55e',
  Medium: '#f59e0b',
  High: '#f97316',
  Critical: '#ef4444',
  Urgent: '#dc2626',
};

export const STATUS_COLORS: Record<string, string> = {
  Open: '#6366f1',
  In_Progress: '#f59e0b',
  Resolved: '#22c55e',
  Closed: '#6b7280',
};

export const SENTIMENT_COLORS: Record<string, string> = {
  Positive: '#22c55e',
  Neutral: '#6b7280',
  Negative: '#f97316',
  Frustrated: '#ef4444',
};

export const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#06b6d4', '#14b8a6',
  '#22c55e', '#f59e0b', '#f97316', '#ef4444', '#ec4899',
  '#3b82f6', '#10b981',
];

// ── Role-specific portal navigation configs ─────────────────────────────────

export const CUSTOMER_NAV = {
  main: [
    { label: 'My Dashboard', path: '/customer', icon: 'LayoutDashboard' },
    { label: 'Create Ticket', path: '/tickets/create', icon: 'Plus' },
    { label: 'My Tickets', path: '/tickets', icon: 'Ticket' },
    { label: 'Track Ticket', path: '/track-ticket', icon: 'Search' },
  ],
  support: [
    { label: 'AI Helpdesk Chat', path: '/ai-chat', icon: 'Bot' },
    { label: 'Notifications', path: '/notifications', icon: 'Bell' },
  ],
  account: [
    { label: 'Profile', path: '/profile', icon: 'User' },
  ],
} as const;

export const AGENT_NAV = {
  workspace: [
    { label: 'My Dashboard', path: '/agent', icon: 'LayoutDashboard' },
    { label: 'Assigned Tickets', path: '/agent/assigned', icon: 'ClipboardList' },
    { label: 'Open Tickets', path: '/agent/open', icon: 'Ticket' },
    { label: 'In Progress', path: '/agent/in-progress', icon: 'Clock' },
    { label: 'Resolved', path: '/agent/resolved', icon: 'CheckCircle' },
  ],
  tools: [
    { label: 'Customer Messages', path: '/agent/messages', icon: 'MessageSquare' },
    { label: 'AI Suggestions', path: '/ai-chat', icon: 'Bot' },
    { label: "Today's Performance", path: '/agent/performance', icon: 'TrendingUp' },
  ],
  account: [
    { label: 'Notifications', path: '/notifications', icon: 'Bell' },
    { label: 'Profile', path: '/profile', icon: 'User' },
  ],
} as const;

export const ADMIN_NAV = {
  operations: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'All Tickets', path: '/tickets', icon: 'Ticket' },
    { label: 'Create Ticket', path: '/tickets/create', icon: 'Plus' },
    { label: 'Analytics', path: '/analytics', icon: 'BarChart3' },
  ],
  team: [
    { label: 'Manage Agents', path: '/users', icon: 'Users' },
    { label: 'Company Admin', path: '/company-admin', icon: 'Building' },
    { label: 'Reports', path: '/reports', icon: 'FileText' },
  ],
  system: [
    { label: 'AI Chat', path: '/ai-chat', icon: 'Bot' },
    { label: 'Company Settings', path: '/settings', icon: 'Settings' },
    { label: 'Notifications', path: '/notifications', icon: 'Bell' },
    { label: 'Profile', path: '/profile', icon: 'User' },
  ],
} as const;

export const SUPERADMIN_NAV = {
  platform: [
    { label: 'Super Admin Hub', path: '/super-admin', icon: 'ShieldCheck' },
    { label: 'Company Registrations', path: '/super-admin', icon: 'Building' },
    { label: 'Platform Analytics', path: '/analytics', icon: 'BarChart3' },
  ],
  management: [
    { label: 'All Tickets', path: '/tickets', icon: 'Ticket' },
    { label: 'User Management', path: '/users', icon: 'Users' },
    { label: 'Reports', path: '/reports', icon: 'FileText' },
    { label: 'AI Chat', path: '/ai-chat', icon: 'Bot' },
  ],
  system: [
    { label: 'Company Settings', path: '/settings', icon: 'Settings' },
    { label: 'Notifications', path: '/notifications', icon: 'Bell' },
    { label: 'Profile', path: '/profile', icon: 'User' },
  ],
} as const;

// Legacy flat nav kept for any compatibility needs
export const SIDEBAR_NAV = {
  main: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', roles: ['Agent', 'Admin', 'SuperAdmin'] },
    { label: 'Create Ticket', path: '/tickets/create', icon: 'Plus', roles: ['Customer', 'Agent', 'Admin', 'SuperAdmin'] },
    { label: 'My Tickets', path: '/tickets', icon: 'Ticket', roles: ['Customer', 'Agent', 'Admin', 'SuperAdmin'] },
    { label: 'Track Tickets', path: '/track-ticket', icon: 'Search', roles: ['Customer', 'Agent', 'Admin', 'SuperAdmin'] },
  ],
  ai: [
    { label: 'AI Chat', path: '/ai-chat', icon: 'Bot', roles: ['Customer', 'Agent', 'Admin', 'SuperAdmin'] },
    { label: 'Analytics', path: '/analytics', icon: 'BarChart3', roles: ['Agent', 'Admin', 'SuperAdmin'] },
    { label: 'Contact', path: '/contact', icon: 'PhoneCall', roles: ['Customer', 'Agent', 'Admin', 'SuperAdmin'] },
  ],
  management: [
    { label: 'Company Admin', path: '/company-admin', icon: 'Building', roles: ['Admin', 'SuperAdmin'] },
    { label: 'Super Admin', path: '/super-admin', icon: 'ShieldCheck', roles: ['SuperAdmin'] },
    { label: 'Reports', path: '/reports', icon: 'FileText', roles: ['Admin', 'SuperAdmin'] },
    { label: 'Manage Agents', path: '/users', icon: 'Users', roles: ['Admin', 'SuperAdmin'] },
    { label: 'Company Settings', path: '/settings', icon: 'Settings', roles: ['Admin', 'SuperAdmin'] },
  ],
} as const;
