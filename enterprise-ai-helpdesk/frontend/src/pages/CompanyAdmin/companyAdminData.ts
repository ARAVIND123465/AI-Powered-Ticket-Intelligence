/* ============================================================
   Company Admin Panel — Centralized Mock Data Store
   All data is scoped to the logged-in company only.
   ============================================================ */

// ── Types ────────────────────────────────────────────────────

export interface CATicket {
  id: string;
  customerName: string;
  customerEmail: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical' | 'Urgent';
  status: 'Open' | 'In_Progress' | 'Pending' | 'Resolved' | 'Closed';
  assignedAgent: string | null;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  description: string;
  title: string;
}

export interface CASupportAgent {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  avatar: string;
  assignedTickets: number;
  resolvedTickets: number;
  performance: number; // 0-100
  status: 'Active' | 'Inactive';
  onlineStatus: 'Online' | 'Busy' | 'Offline';
}

export interface CACustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalTickets: number;
  resolvedTickets: number;
  openTickets: number;
  lastActivity: string;
}

export interface CADepartment {
  id: string;
  name: string;
  description: string;
  agentCount: number;
  ticketCount: number;
  createdAt: string;
}

export interface CACategory {
  id: string;
  name: string;
  description: string;
  ticketCount: number;
  color: string;
  createdAt: string;
}

export interface CANotification {
  id: string;
  type: 'new_ticket' | 'escalated' | 'sla_expiring' | 'customer_reply' | 'agent_unavailable' | 'high_priority';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  createdAt: string;
  ticketId?: string;
}

export interface CACompanySettings {
  companyName: string;
  companyLogo: string;
  supportEmail: string;
  supportPhone: string;
  businessAddress: string;
  workingHours: { start: string; end: string; days: string[] };
  autoAssignment: boolean;
  slaConfig: { low: number; medium: number; high: number; critical: number; urgent: number };
  notificationSettings: {
    newTicket: boolean;
    escalation: boolean;
    slaWarning: boolean;
    customerReply: boolean;
    agentUnavailable: boolean;
    highPriority: boolean;
  };
  aiSettings: {
    autoCategories: boolean;
    autoPriority: boolean;
    sentimentAnalysis: boolean;
    duplicateDetection: boolean;
    suggestedResolutions: boolean;
  };
}

export interface CAAdminProfile {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  role: string;
  avatar: string;
  lastLogin: string;
  joinedAt: string;
}

// ── Mock Data ────────────────────────────────────────────────

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const hoursFromNow = (h: number) => new Date(now.getTime() + h * 3600000).toISOString();

export const MOCK_TICKETS: CATicket[] = [
  { id: 'TKT-2001', customerName: 'Rahul Sharma', customerEmail: 'rahul@gmail.com', category: 'Login', priority: 'High', status: 'Open', assignedAgent: null, createdAt: hoursAgo(1), updatedAt: hoursAgo(1), slaDeadline: hoursFromNow(3), description: 'Unable to log in after password reset', title: 'Login failure after password reset' },
  { id: 'TKT-2002', customerName: 'Priya Patel', customerEmail: 'priya.p@outlook.com', category: 'Payment', priority: 'Critical', status: 'In_Progress', assignedAgent: 'Alex Rivera', createdAt: hoursAgo(3), updatedAt: hoursAgo(1), slaDeadline: hoursFromNow(1), description: 'Payment deducted but booking not confirmed', title: 'Double payment charged on booking' },
  { id: 'TKT-2003', customerName: 'Vikram Singh', customerEmail: 'vikram.s@yahoo.com', category: 'Refund', priority: 'Medium', status: 'Pending', assignedAgent: 'Sarah Jenkins', createdAt: hoursAgo(8), updatedAt: hoursAgo(2), slaDeadline: hoursFromNow(16), description: 'Refund not processed within 7 days', title: 'Pending refund for cancelled order' },
  { id: 'TKT-2004', customerName: 'Ananya Roy', customerEmail: 'ananya.r@gmail.com', category: 'Technical', priority: 'High', status: 'Open', assignedAgent: null, createdAt: hoursAgo(2), updatedAt: hoursAgo(2), slaDeadline: hoursFromNow(4), description: 'App crashes on iOS 18 when loading dashboard', title: 'iOS app crash on dashboard' },
  { id: 'TKT-2005', customerName: 'Karthik M', customerEmail: 'karthik.m@gmail.com', category: 'Delivery', priority: 'Low', status: 'Resolved', assignedAgent: 'David Kim', createdAt: daysAgo(2), updatedAt: hoursAgo(5), slaDeadline: hoursFromNow(48), description: 'Package arrived damaged', title: 'Damaged package received' },
  { id: 'TKT-2006', customerName: 'Sneha Reddy', customerEmail: 'sneha.r@hotmail.com', category: 'Account', priority: 'Medium', status: 'In_Progress', assignedAgent: 'Priya Sharma', createdAt: hoursAgo(12), updatedAt: hoursAgo(4), slaDeadline: hoursFromNow(12), description: 'Cannot update phone number in account settings', title: 'Account phone number update issue' },
  { id: 'TKT-2007', customerName: 'Deepak Kumar', customerEmail: 'deepak.k@gmail.com', category: 'Security', priority: 'Urgent', status: 'Open', assignedAgent: null, createdAt: hoursAgo(0.5), updatedAt: hoursAgo(0.5), slaDeadline: hoursFromNow(1), description: 'Suspicious login activity from unknown IP', title: 'Unauthorized access attempt detected' },
  { id: 'TKT-2008', customerName: 'Meera Nair', customerEmail: 'meera.n@gmail.com', category: 'Billing', priority: 'High', status: 'Pending', assignedAgent: 'Michael Chang', createdAt: hoursAgo(6), updatedAt: hoursAgo(3), slaDeadline: hoursFromNow(6), description: 'Invoice amount doesnt match the order total', title: 'Incorrect billing amount on invoice' },
  { id: 'TKT-2009', customerName: 'Arjun Mehta', customerEmail: 'arjun.m@outlook.com', category: 'Bug', priority: 'Medium', status: 'Resolved', assignedAgent: 'Alex Rivera', createdAt: daysAgo(3), updatedAt: daysAgo(1), slaDeadline: hoursFromNow(72), description: 'Search results return irrelevant items', title: 'Search functionality returning wrong results' },
  { id: 'TKT-2010', customerName: 'Lakshmi V', customerEmail: 'lakshmi.v@gmail.com', category: 'Feature Request', priority: 'Low', status: 'Closed', assignedAgent: 'Sarah Jenkins', createdAt: daysAgo(5), updatedAt: daysAgo(2), slaDeadline: hoursFromNow(120), description: 'Add dark mode support for mobile app', title: 'Request for dark mode on mobile' },
  { id: 'TKT-2011', customerName: 'Ravi Krishnan', customerEmail: 'ravi.k@company.com', category: 'Network', priority: 'High', status: 'In_Progress', assignedAgent: 'David Kim', createdAt: hoursAgo(4), updatedAt: hoursAgo(1), slaDeadline: hoursFromNow(4), description: 'Office VPN disconnects every 15 minutes', title: 'VPN connectivity issues' },
  { id: 'TKT-2012', customerName: 'Pooja Gupta', customerEmail: 'pooja.g@gmail.com', category: 'Hardware', priority: 'Medium', status: 'Open', assignedAgent: null, createdAt: hoursAgo(5), updatedAt: hoursAgo(5), slaDeadline: hoursFromNow(19), description: 'Laptop keyboard not responding after update', title: 'Keyboard malfunction post-update' },
  { id: 'TKT-2013', customerName: 'Amit Joshi', customerEmail: 'amit.j@yahoo.com', category: 'Software', priority: 'Low', status: 'Resolved', assignedAgent: 'Priya Sharma', createdAt: daysAgo(4), updatedAt: daysAgo(1), slaDeadline: hoursFromNow(96), description: 'Excel plugin not loading in Office 365', title: 'Office 365 plugin compatibility issue' },
  { id: 'TKT-2014', customerName: 'Divya Menon', customerEmail: 'divya.m@gmail.com', category: 'Access Control', priority: 'Critical', status: 'Open', assignedAgent: null, createdAt: hoursAgo(1.5), updatedAt: hoursAgo(1.5), slaDeadline: hoursFromNow(2.5), description: 'Cannot access admin panel after role change', title: 'Admin access revoked unexpectedly' },
  { id: 'TKT-2015', customerName: 'Suresh P', customerEmail: 'suresh.p@hotmail.com', category: 'General Inquiry', priority: 'Low', status: 'Closed', assignedAgent: 'Michael Chang', createdAt: daysAgo(7), updatedAt: daysAgo(5), slaDeadline: hoursFromNow(168), description: 'How to export monthly reports?', title: 'Inquiry about report export feature' },
  { id: 'TKT-2016', customerName: 'Nisha Agarwal', customerEmail: 'nisha.a@gmail.com', category: 'Payment', priority: 'High', status: 'Pending', assignedAgent: 'Alex Rivera', createdAt: hoursAgo(7), updatedAt: hoursAgo(3), slaDeadline: hoursFromNow(5), description: 'Payment gateway timeout during checkout', title: 'Checkout payment timeout error' },
  { id: 'TKT-2017', customerName: 'Rajesh Iyer', customerEmail: 'rajesh.i@outlook.com', category: 'Technical', priority: 'Medium', status: 'In_Progress', assignedAgent: 'Sarah Jenkins', createdAt: hoursAgo(10), updatedAt: hoursAgo(4), slaDeadline: hoursFromNow(14), description: 'API response time exceeds 5 seconds', title: 'Slow API response times' },
  { id: 'TKT-2018', customerName: 'Kavitha S', customerEmail: 'kavitha.s@gmail.com', category: 'Refund', priority: 'High', status: 'Open', assignedAgent: null, createdAt: hoursAgo(3), updatedAt: hoursAgo(3), slaDeadline: hoursFromNow(5), description: 'Refund approved but not credited to bank', title: 'Refund credit pending in bank account' },
  { id: 'TKT-2019', customerName: 'Sanjay Verma', customerEmail: 'sanjay.v@yahoo.com', category: 'Login', priority: 'Medium', status: 'Resolved', assignedAgent: 'David Kim', createdAt: daysAgo(1), updatedAt: hoursAgo(8), slaDeadline: hoursFromNow(24), description: 'Two-factor authentication not sending OTP', title: '2FA OTP delivery failure' },
  { id: 'TKT-2020', customerName: 'Aisha Khan', customerEmail: 'aisha.k@gmail.com', category: 'Security', priority: 'Urgent', status: 'In_Progress', assignedAgent: 'Priya Sharma', createdAt: hoursAgo(2), updatedAt: hoursAgo(0.5), slaDeadline: hoursFromNow(1), description: 'Account compromised, unauthorized transactions', title: 'Account security breach with fraudulent txns' },
  { id: 'TKT-2021', customerName: 'Manoj T', customerEmail: 'manoj.t@company.com', category: 'Network', priority: 'High', status: 'Pending', assignedAgent: 'Michael Chang', createdAt: hoursAgo(9), updatedAt: hoursAgo(5), slaDeadline: hoursFromNow(3), description: 'DNS resolution failing for internal services', title: 'Internal DNS resolution failure' },
  { id: 'TKT-2022', customerName: 'Revathi K', customerEmail: 'revathi.k@gmail.com', category: 'Billing', priority: 'Low', status: 'Closed', assignedAgent: 'Alex Rivera', createdAt: daysAgo(6), updatedAt: daysAgo(3), slaDeadline: hoursFromNow(144), description: 'Need a copy of last months invoice', title: 'Request for invoice copy' },
  { id: 'TKT-2023', customerName: 'Farhan Ahmed', customerEmail: 'farhan.a@outlook.com', category: 'Bug', priority: 'Critical', status: 'Open', assignedAgent: null, createdAt: hoursAgo(0.25), updatedAt: hoursAgo(0.25), slaDeadline: hoursFromNow(2), description: 'Data loss when saving forms in Chrome 120+', title: 'Critical data loss bug in Chrome' },
  { id: 'TKT-2024', customerName: 'Gauri Deshmukh', customerEmail: 'gauri.d@gmail.com', category: 'Technical', priority: 'Medium', status: 'In_Progress', assignedAgent: 'Sarah Jenkins', createdAt: hoursAgo(14), updatedAt: hoursAgo(6), slaDeadline: hoursFromNow(10), description: 'File upload fails for files larger than 10MB', title: 'Large file upload failure' },
  { id: 'TKT-2025', customerName: 'Harish B', customerEmail: 'harish.b@yahoo.com', category: 'Feature Request', priority: 'Low', status: 'Open', assignedAgent: null, createdAt: hoursAgo(16), updatedAt: hoursAgo(16), slaDeadline: hoursFromNow(48), description: 'Add bulk ticket export functionality', title: 'Feature: Bulk ticket export' },
];

export const MOCK_AGENTS: CASupportAgent[] = [
  { id: 'AGT-201', employeeId: 'EMP-1001', name: 'Alex Rivera', email: 'alex.rivera@company.com', phone: '+1-555-0101', department: 'Technical Support', designation: 'Senior Support Engineer', avatar: 'AR', assignedTickets: 6, resolvedTickets: 142, performance: 94, status: 'Active', onlineStatus: 'Online' },
  { id: 'AGT-202', employeeId: 'EMP-1002', name: 'Sarah Jenkins', email: 'sarah.jenkins@company.com', phone: '+1-555-0102', department: 'Billing', designation: 'Billing Specialist', avatar: 'SJ', assignedTickets: 5, resolvedTickets: 128, performance: 91, status: 'Active', onlineStatus: 'Online' },
  { id: 'AGT-203', employeeId: 'EMP-1003', name: 'David Kim', email: 'david.kim@company.com', phone: '+1-555-0103', department: 'Network', designation: 'Network Engineer L2', avatar: 'DK', assignedTickets: 4, resolvedTickets: 156, performance: 96, status: 'Active', onlineStatus: 'Busy' },
  { id: 'AGT-204', employeeId: 'EMP-1004', name: 'Priya Sharma', email: 'priya.sharma@company.com', phone: '+91-98765-43210', department: 'Software', designation: 'Application Support Lead', avatar: 'PS', assignedTickets: 4, resolvedTickets: 135, performance: 92, status: 'Active', onlineStatus: 'Online' },
  { id: 'AGT-205', employeeId: 'EMP-1005', name: 'Michael Chang', email: 'michael.chang@company.com', phone: '+1-555-0105', department: 'Security', designation: 'Security Analyst', avatar: 'MC', assignedTickets: 3, resolvedTickets: 98, performance: 87, status: 'Active', onlineStatus: 'Offline' },
  { id: 'AGT-206', employeeId: 'EMP-1006', name: 'Fatima Hassan', email: 'fatima.h@company.com', phone: '+1-555-0106', department: 'Customer Care', designation: 'Customer Success Manager', avatar: 'FH', assignedTickets: 0, resolvedTickets: 110, performance: 89, status: 'Active', onlineStatus: 'Online' },
  { id: 'AGT-207', employeeId: 'EMP-1007', name: 'James Wilson', email: 'james.w@company.com', phone: '+1-555-0107', department: 'Hardware', designation: 'Hardware Technician', avatar: 'JW', assignedTickets: 0, resolvedTickets: 76, performance: 82, status: 'Inactive', onlineStatus: 'Offline' },
  { id: 'AGT-208', employeeId: 'EMP-1008', name: 'Anita Desai', email: 'anita.d@company.com', phone: '+91-99887-76655', department: 'Refund', designation: 'Refund Processing Agent', avatar: 'AD', assignedTickets: 0, resolvedTickets: 92, performance: 85, status: 'Active', onlineStatus: 'Online' },
];

export const MOCK_CUSTOMERS: CACustomer[] = [
  { id: 'CUS-301', name: 'Rahul Sharma', email: 'rahul@gmail.com', phone: '+91-98765-12345', totalTickets: 5, resolvedTickets: 3, openTickets: 2, lastActivity: hoursAgo(1) },
  { id: 'CUS-302', name: 'Priya Patel', email: 'priya.p@outlook.com', phone: '+91-87654-23456', totalTickets: 3, resolvedTickets: 2, openTickets: 1, lastActivity: hoursAgo(3) },
  { id: 'CUS-303', name: 'Vikram Singh', email: 'vikram.s@yahoo.com', phone: '+91-76543-34567', totalTickets: 4, resolvedTickets: 3, openTickets: 1, lastActivity: hoursAgo(8) },
  { id: 'CUS-304', name: 'Ananya Roy', email: 'ananya.r@gmail.com', phone: '+91-65432-45678', totalTickets: 2, resolvedTickets: 1, openTickets: 1, lastActivity: hoursAgo(2) },
  { id: 'CUS-305', name: 'Karthik M', email: 'karthik.m@gmail.com', phone: '+91-54321-56789', totalTickets: 6, resolvedTickets: 5, openTickets: 1, lastActivity: daysAgo(2) },
  { id: 'CUS-306', name: 'Sneha Reddy', email: 'sneha.r@hotmail.com', phone: '+91-43210-67890', totalTickets: 2, resolvedTickets: 1, openTickets: 1, lastActivity: hoursAgo(12) },
  { id: 'CUS-307', name: 'Deepak Kumar', email: 'deepak.k@gmail.com', phone: '+91-32109-78901', totalTickets: 3, resolvedTickets: 2, openTickets: 1, lastActivity: hoursAgo(0.5) },
  { id: 'CUS-308', name: 'Meera Nair', email: 'meera.n@gmail.com', phone: '+91-21098-89012', totalTickets: 4, resolvedTickets: 3, openTickets: 1, lastActivity: hoursAgo(6) },
  { id: 'CUS-309', name: 'Arjun Mehta', email: 'arjun.m@outlook.com', phone: '+91-10987-90123', totalTickets: 2, resolvedTickets: 2, openTickets: 0, lastActivity: daysAgo(3) },
  { id: 'CUS-310', name: 'Aisha Khan', email: 'aisha.k@gmail.com', phone: '+91-98765-01234', totalTickets: 3, resolvedTickets: 1, openTickets: 2, lastActivity: hoursAgo(2) },
  { id: 'CUS-311', name: 'Farhan Ahmed', email: 'farhan.a@outlook.com', phone: '+91-87654-12345', totalTickets: 1, resolvedTickets: 0, openTickets: 1, lastActivity: hoursAgo(0.25) },
  { id: 'CUS-312', name: 'Nisha Agarwal', email: 'nisha.a@gmail.com', phone: '+91-76543-23456', totalTickets: 3, resolvedTickets: 2, openTickets: 1, lastActivity: hoursAgo(7) },
];

export const MOCK_DEPARTMENTS: CADepartment[] = [
  { id: 'DEP-01', name: 'Technical Support', description: 'Handles technical issues, bugs, and system errors', agentCount: 2, ticketCount: 45, createdAt: daysAgo(90) },
  { id: 'DEP-02', name: 'Billing', description: 'Manages billing inquiries, invoices, and payment issues', agentCount: 1, ticketCount: 28, createdAt: daysAgo(90) },
  { id: 'DEP-03', name: 'Refund', description: 'Processes refund requests and return policies', agentCount: 1, ticketCount: 18, createdAt: daysAgo(90) },
  { id: 'DEP-04', name: 'Security', description: 'Handles security incidents, access control, and compliance', agentCount: 1, ticketCount: 22, createdAt: daysAgo(90) },
  { id: 'DEP-05', name: 'Network', description: 'Manages network connectivity, VPN, and infrastructure', agentCount: 1, ticketCount: 15, createdAt: daysAgo(90) },
  { id: 'DEP-06', name: 'Software', description: 'Application support, compatibility, and software issues', agentCount: 1, ticketCount: 12, createdAt: daysAgo(90) },
  { id: 'DEP-07', name: 'Hardware', description: 'Hardware repairs, replacements, and device management', agentCount: 1, ticketCount: 8, createdAt: daysAgo(60) },
  { id: 'DEP-08', name: 'Customer Care', description: 'General customer inquiries and account management', agentCount: 1, ticketCount: 32, createdAt: daysAgo(90) },
];

export const MOCK_CATEGORIES: CACategory[] = [
  { id: 'CAT-01', name: 'Login', description: 'Authentication and sign-in issues', ticketCount: 12, color: '#6366f1', createdAt: daysAgo(90) },
  { id: 'CAT-02', name: 'Payment', description: 'Payment processing and transaction issues', ticketCount: 18, color: '#f59e0b', createdAt: daysAgo(90) },
  { id: 'CAT-03', name: 'Refund', description: 'Refund requests and processing', ticketCount: 14, color: '#10b981', createdAt: daysAgo(90) },
  { id: 'CAT-04', name: 'Technical', description: 'Technical errors and system issues', ticketCount: 22, color: '#8b5cf6', createdAt: daysAgo(90) },
  { id: 'CAT-05', name: 'Delivery', description: 'Shipping, delivery, and logistics', ticketCount: 8, color: '#06b6d4', createdAt: daysAgo(90) },
  { id: 'CAT-06', name: 'Account', description: 'Account settings and profile management', ticketCount: 10, color: '#ec4899', createdAt: daysAgo(90) },
  { id: 'CAT-07', name: 'Security', description: 'Security incidents and access issues', ticketCount: 16, color: '#ef4444', createdAt: daysAgo(90) },
  { id: 'CAT-08', name: 'Billing', description: 'Invoices, charges, and billing disputes', ticketCount: 11, color: '#f97316', createdAt: daysAgo(90) },
  { id: 'CAT-09', name: 'Bug', description: 'Software bugs and defects', ticketCount: 9, color: '#dc2626', createdAt: daysAgo(90) },
  { id: 'CAT-10', name: 'Feature Request', description: 'New feature suggestions and enhancements', ticketCount: 6, color: '#14b8a6', createdAt: daysAgo(90) },
  { id: 'CAT-11', name: 'General Inquiry', description: 'General questions and information requests', ticketCount: 5, color: '#6b7280', createdAt: daysAgo(90) },
  { id: 'CAT-12', name: 'Network', description: 'Network connectivity and VPN issues', ticketCount: 13, color: '#3b82f6', createdAt: daysAgo(60) },
  { id: 'CAT-13', name: 'Hardware', description: 'Hardware failures and device issues', ticketCount: 7, color: '#a855f7', createdAt: daysAgo(60) },
  { id: 'CAT-14', name: 'Software', description: 'Software compatibility and installation', ticketCount: 10, color: '#22c55e', createdAt: daysAgo(60) },
  { id: 'CAT-15', name: 'Access Control', description: 'Permissions, roles, and access management', ticketCount: 8, color: '#e11d48', createdAt: daysAgo(45) },
];

export const MOCK_NOTIFICATIONS: CANotification[] = [
  { id: 'NOT-01', type: 'high_priority', title: 'Urgent Ticket Created', message: 'TKT-2007: Unauthorized access attempt detected - requires immediate attention', severity: 'critical', read: false, createdAt: hoursAgo(0.5), ticketId: 'TKT-2007' },
  { id: 'NOT-02', type: 'sla_expiring', title: 'SLA About to Expire', message: 'TKT-2002: Double payment charged on booking — SLA expires in 1 hour', severity: 'warning', read: false, createdAt: hoursAgo(1), ticketId: 'TKT-2002' },
  { id: 'NOT-03', type: 'escalated', title: 'Ticket Escalated', message: 'TKT-2020: Account security breach escalated to Security team', severity: 'critical', read: false, createdAt: hoursAgo(2), ticketId: 'TKT-2020' },
  { id: 'NOT-04', type: 'new_ticket', title: 'New Critical Ticket', message: 'TKT-2023: Critical data loss bug in Chrome reported by Farhan Ahmed', severity: 'critical', read: false, createdAt: hoursAgo(0.25), ticketId: 'TKT-2023' },
  { id: 'NOT-05', type: 'customer_reply', title: 'Customer Replied', message: 'Priya Patel replied on TKT-2002 with additional payment screenshots', severity: 'info', read: true, createdAt: hoursAgo(2), ticketId: 'TKT-2002' },
  { id: 'NOT-06', type: 'agent_unavailable', title: 'Agent Unavailable', message: 'James Wilson is offline — 0 assigned tickets need reassignment', severity: 'warning', read: true, createdAt: hoursAgo(4) },
  { id: 'NOT-07', type: 'sla_expiring', title: 'SLA Warning', message: 'TKT-2021: Internal DNS resolution failure — SLA expires in 3 hours', severity: 'warning', read: false, createdAt: hoursAgo(3), ticketId: 'TKT-2021' },
  { id: 'NOT-08', type: 'new_ticket', title: 'New Ticket Assigned', message: 'TKT-2024: Large file upload failure assigned to Sarah Jenkins', severity: 'info', read: true, createdAt: hoursAgo(6), ticketId: 'TKT-2024' },
  { id: 'NOT-09', type: 'high_priority', title: 'High Priority Alert', message: 'TKT-2014: Admin access revoked unexpectedly — unassigned', severity: 'critical', read: false, createdAt: hoursAgo(1.5), ticketId: 'TKT-2014' },
  { id: 'NOT-10', type: 'customer_reply', title: 'Customer Follow-up', message: 'Meera Nair requested status update on TKT-2008', severity: 'info', read: true, createdAt: hoursAgo(5), ticketId: 'TKT-2008' },
  { id: 'NOT-11', type: 'escalated', title: 'Auto-Escalation', message: 'TKT-2016: Checkout payment timeout — auto-escalated due to SLA breach risk', severity: 'warning', read: false, createdAt: hoursAgo(3.5), ticketId: 'TKT-2016' },
];

export const MOCK_COMPANY_SETTINGS: CACompanySettings = {
  companyName: 'TechCorp Solutions Pvt. Ltd.',
  companyLogo: '',
  supportEmail: 'support@techcorp.io',
  supportPhone: '+91-1800-123-4567',
  businessAddress: '42, Tech Park, Electronic City Phase 1, Bangalore, Karnataka 560100',
  workingHours: { start: '09:00', end: '18:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  autoAssignment: true,
  slaConfig: { low: 48, medium: 24, high: 8, critical: 4, urgent: 2 },
  notificationSettings: {
    newTicket: true,
    escalation: true,
    slaWarning: true,
    customerReply: true,
    agentUnavailable: true,
    highPriority: true,
  },
  aiSettings: {
    autoCategories: true,
    autoPriority: true,
    sentimentAnalysis: true,
    duplicateDetection: true,
    suggestedResolutions: true,
  },
};

export const MOCK_ADMIN_PROFILE: CAAdminProfile = {
  name: 'Aravindhan Natarajan',
  email: 'admin@techcorp.io',
  phone: '+91-98765-43210',
  companyName: 'TechCorp Solutions Pvt. Ltd.',
  role: 'Company Admin',
  avatar: 'AN',
  lastLogin: hoursAgo(0.1),
  joinedAt: daysAgo(120),
};

// ── Analytics Data ────────────────────────────────────────────

export const ANALYTICS_MONTHLY_TRENDS = [
  { month: 'Jan', tickets: 145, resolved: 132 },
  { month: 'Feb', tickets: 162, resolved: 148 },
  { month: 'Mar', tickets: 178, resolved: 165 },
  { month: 'Apr', tickets: 155, resolved: 150 },
  { month: 'May', tickets: 192, resolved: 178 },
  { month: 'Jun', tickets: 210, resolved: 195 },
  { month: 'Jul', tickets: 198, resolved: 172 },
];

export const ANALYTICS_WEEKLY_TRENDS = [
  { day: 'Mon', tickets: 42, resolved: 38 },
  { day: 'Tue', tickets: 58, resolved: 52 },
  { day: 'Wed', tickets: 51, resolved: 48 },
  { day: 'Thu', tickets: 67, resolved: 60 },
  { day: 'Fri', tickets: 73, resolved: 65 },
  { day: 'Sat', tickets: 22, resolved: 20 },
  { day: 'Sun', tickets: 15, resolved: 12 },
];

export const ANALYTICS_SATISFACTION = [
  { rating: '⭐ 1', count: 8 },
  { rating: '⭐ 2', count: 15 },
  { rating: '⭐ 3', count: 42 },
  { rating: '⭐ 4', count: 98 },
  { rating: '⭐ 5', count: 137 },
];

export const ANALYTICS_RESOLUTION_TIME = [
  { month: 'Jan', avgHours: 4.2 },
  { month: 'Feb', avgHours: 3.8 },
  { month: 'Mar', avgHours: 3.5 },
  { month: 'Apr', avgHours: 3.9 },
  { month: 'May', avgHours: 3.2 },
  { month: 'Jun', avgHours: 2.8 },
  { month: 'Jul', avgHours: 3.1 },
];
