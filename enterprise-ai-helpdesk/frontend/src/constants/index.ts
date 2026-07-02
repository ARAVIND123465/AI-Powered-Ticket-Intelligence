export const API_BASE_URL = '/api';

export const TICKET_CATEGORIES = [
  'Login', 'Payment', 'Refund', 'Technical', 'Delivery',
  'Account', 'Security', 'Billing', 'Bug', 'Feature Request',
  'General Inquiry', 'Network', 'Hardware', 'Software', 'Access Control',
] as const;

export const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Critical', 'Urgent'] as const;

export const TICKET_STATUSES = ['Open', 'In_Progress', 'Resolved', 'Closed'] as const;

export const USER_ROLES = ['Customer', 'Agent', 'Admin'] as const;

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

export const SIDEBAR_NAV = {
  main: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', roles: ['Customer', 'Agent', 'Admin'] },
    { label: 'My Tickets', path: '/tickets', icon: 'Ticket', roles: ['Customer', 'Agent', 'Admin'] },
    { label: 'Create Ticket', path: '/tickets/create', icon: 'Plus', roles: ['Customer', 'Agent', 'Admin'] },
  ],
  ai: [
    { label: 'Analytics', path: '/analytics', icon: 'BarChart3', roles: ['Agent', 'Admin'] },
    { label: 'AI Chat', path: '/ai-chat', icon: 'Bot', roles: ['Agent', 'Admin'] },
    { label: 'Search', path: '/search', icon: 'Search', roles: ['Customer', 'Agent', 'Admin'] },
  ],
  management: [
    { label: 'Reports', path: '/reports', icon: 'FileText', roles: ['Admin'] },
    { label: 'Users', path: '/users', icon: 'Users', roles: ['Admin'] },
    { label: 'Settings', path: '/settings', icon: 'Settings', roles: ['Admin'] },
  ],
} as const;
