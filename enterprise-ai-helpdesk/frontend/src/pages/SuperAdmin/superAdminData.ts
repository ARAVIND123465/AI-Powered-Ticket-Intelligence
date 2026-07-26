/* ============================================================
   Platform Super Admin Panel — Centralized Data & State Store
   ============================================================ */

export interface SACompany {
  id: string;
  name: string;
  logo: string;
  adminName: string;
  adminEmail: string;
  phone: string;
  country: string;
  industry: string;
  plan: 'Free' | 'Starter' | 'Professional' | 'Enterprise';
  status: 'Pending' | 'Approved' | 'Suspended' | 'Rejected';
  registeredAt: string;
  totalTickets: number;
  agentsCount: number;
  customersCount: number;
  verificationStatus: 'Verified' | 'Pending Documents' | 'Unverified';
  businessType: string;
}

export interface SAPlatformUser {
  id: string;
  name: string;
  email: string;
  role: 'Company Admin' | 'Support Agent' | 'Customer';
  companyName: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
}

export interface SAAuditLog {
  id: string;
  user: string;
  company: string;
  action: string;
  module: string;
  timestamp: string;
  ipAddress: string;
  status: 'Success' | 'Failed' | 'Warning';
}

export interface SAPayment {
  id: string;
  company: string;
  plan: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Processing' | 'Failed';
}

export interface SASubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'Monthly' | 'Yearly';
  features: string[];
}

export interface SAAnnouncement {
  id: string;
  title: string;
  content: string;
  severity: 'Info' | 'Warning' | 'Alert';
  date: string;
  targetCompany: string; // 'All' or specific company ID
}

export interface SANotification {
  id: string;
  type: 'new_registration' | 'subscription_expired' | 'platform_error' | 'ai_failure' | 'security_alert' | 'high_server_usage';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

export const INITIAL_COMPANIES: SACompany[] = [
  {
    id: 'CMP-101',
    name: 'RedBus',
    logo: 'RB',
    adminName: 'Prakash Kumar',
    adminEmail: 'admin@redbus.in',
    phone: '+91-98765-43210',
    country: 'India',
    industry: 'Transport & Logistics',
    plan: 'Enterprise',
    status: 'Approved',
    registeredAt: daysAgo(45),
    totalTickets: 1420,
    agentsCount: 24,
    customersCount: 890,
    verificationStatus: 'Verified',
    businessType: 'Corporation',
  },
  {
    id: 'CMP-102',
    name: 'IRCTC',
    logo: 'IR',
    adminName: 'Sunita Sharma',
    adminEmail: 'helpdesk@irctc.co.in',
    phone: '+91-88765-43211',
    country: 'India',
    industry: 'Travel & Booking',
    plan: 'Enterprise',
    status: 'Approved',
    registeredAt: daysAgo(40),
    totalTickets: 2890,
    agentsCount: 45,
    customersCount: 1560,
    verificationStatus: 'Verified',
    businessType: 'Government Undertaking',
  },
  {
    id: 'CMP-103',
    name: 'ServiceNow',
    logo: 'SN',
    adminName: 'David Miller',
    adminEmail: 'support-admin@servicenow.com',
    phone: '+1-555-0199',
    country: 'United States',
    industry: 'IT Services & Cloud',
    plan: 'Enterprise',
    status: 'Approved',
    registeredAt: daysAgo(90),
    totalTickets: 310,
    agentsCount: 12,
    customersCount: 190,
    verificationStatus: 'Verified',
    businessType: 'Public Company',
  },
  {
    id: 'CMP-104',
    name: 'PVR Cinemas',
    logo: 'PV',
    adminName: 'Ananya Roy',
    adminEmail: 'corporate@pvrcinemas.com',
    phone: '+91-77889-11223',
    country: 'India',
    industry: 'Entertainment & Media',
    plan: 'Professional',
    status: 'Approved',
    registeredAt: daysAgo(30),
    totalTickets: 610,
    agentsCount: 15,
    customersCount: 420,
    verificationStatus: 'Verified',
    businessType: 'Partnership',
  },
  {
    id: 'CMP-105',
    name: 'Apollo Hospitals',
    logo: 'AP',
    adminName: 'Dr. Ramesh Nathan',
    adminEmail: 'billing-tech@apollohospitals.com',
    phone: '+91-66778-99001',
    country: 'India',
    industry: 'Healthcare',
    plan: 'Enterprise',
    status: 'Approved',
    registeredAt: daysAgo(25),
    totalTickets: 420,
    agentsCount: 18,
    customersCount: 310,
    verificationStatus: 'Verified',
    businessType: 'Private Limited',
  },
  {
    id: 'CMP-106',
    name: 'Swiggy',
    logo: 'SW',
    adminName: 'Harish Rao',
    adminEmail: 'admin@swiggy.in',
    phone: '+91-99887-11223',
    country: 'India',
    industry: 'On-Demand Delivery',
    plan: 'Enterprise',
    status: 'Approved',
    registeredAt: daysAgo(15),
    totalTickets: 890,
    agentsCount: 30,
    customersCount: 650,
    verificationStatus: 'Verified',
    businessType: 'Corporation',
  },
  {
    id: 'CMP-107',
    name: 'Amazon India',
    logo: 'AM',
    adminName: 'Amit Verma',
    adminEmail: 'verma-admin@amazon.com',
    phone: '+91-88990-22334',
    country: 'India',
    industry: 'E-Commerce',
    plan: 'Enterprise',
    status: 'Approved',
    registeredAt: daysAgo(60),
    totalTickets: 3200,
    agentsCount: 60,
    customersCount: 2200,
    verificationStatus: 'Verified',
    businessType: 'Foreign Subsidiary',
  },
  {
    id: 'CMP-108',
    name: 'Metro Express Logistics',
    logo: 'ME',
    adminName: 'Vikram Singh',
    adminEmail: 'admin@metroexpress.io',
    phone: '+91-76543-34567',
    country: 'India',
    industry: 'Transport & Logistics',
    plan: 'Starter',
    status: 'Pending',
    registeredAt: daysAgo(2),
    totalTickets: 0,
    agentsCount: 0,
    customersCount: 0,
    verificationStatus: 'Pending Documents',
    businessType: 'Partnership',
  },
  {
    id: 'CMP-109',
    name: 'FinCorp Global',
    logo: 'FG',
    adminName: 'Sarah Jenkins',
    adminEmail: 'it-sec@fincorglobal.com',
    phone: '+1-555-0102',
    country: 'United Kingdom',
    industry: 'Banking & Finance',
    plan: 'Enterprise',
    status: 'Pending',
    registeredAt: daysAgo(1),
    totalTickets: 0,
    agentsCount: 0,
    customersCount: 0,
    verificationStatus: 'Unverified',
    businessType: 'Private Limited',
  },
  {
    id: 'CMP-110',
    name: 'TechCorp Solutions',
    logo: 'TC',
    adminName: 'Aravindhan Natarajan',
    adminEmail: 'admin@techcorp.io',
    phone: '+91-98765-43210',
    country: 'India',
    industry: 'IT Services & Cloud',
    plan: 'Professional',
    status: 'Suspended',
    registeredAt: daysAgo(80),
    totalTickets: 450,
    agentsCount: 10,
    customersCount: 150,
    verificationStatus: 'Verified',
    businessType: 'Private Limited',
  }
];

export const INITIAL_USERS: SAPlatformUser[] = [
  { id: 'USR-001', name: 'Prakash Kumar', email: 'admin@redbus.in', role: 'Company Admin', companyName: 'RedBus', status: 'Active', lastActive: hoursAgo(1) },
  { id: 'USR-002', name: 'Amit Kumar', email: 'amit@redbus.in', role: 'Support Agent', companyName: 'RedBus', status: 'Active', lastActive: hoursAgo(3) },
  { id: 'USR-003', name: 'Rohan Joshi', email: 'rohan@gmail.com', role: 'Customer', companyName: 'RedBus', status: 'Active', lastActive: daysAgo(1) },
  { id: 'USR-004', name: 'Sunita Sharma', email: 'helpdesk@irctc.co.in', role: 'Company Admin', companyName: 'IRCTC', status: 'Active', lastActive: hoursAgo(0.5) },
  { id: 'USR-005', name: 'Jatin Dev', email: 'jatin@irctc.co.in', role: 'Support Agent', companyName: 'IRCTC', status: 'Active', lastActive: hoursAgo(4) },
  { id: 'USR-006', name: 'Meena Roy', email: 'meena@outlook.com', role: 'Customer', companyName: 'IRCTC', status: 'Active', lastActive: daysAgo(2) },
  { id: 'USR-007', name: 'Ananya Roy', email: 'corporate@pvrcinemas.com', role: 'Company Admin', companyName: 'PVR Cinemas', status: 'Active', lastActive: hoursAgo(2) },
  { id: 'USR-008', name: 'Kunal Sen', email: 'kunal@pvrcinemas.com', role: 'Support Agent', companyName: 'PVR Cinemas', status: 'Inactive', lastActive: daysAgo(5) },
];

export const INITIAL_PAYMENTS: SAPayment[] = [
  { id: 'PAY-801', company: 'RedBus', plan: 'Enterprise Plan', amount: 1299, date: daysAgo(5), status: 'Paid' },
  { id: 'PAY-802', company: 'IRCTC', plan: 'Enterprise Plan', amount: 1299, date: daysAgo(4), status: 'Paid' },
  { id: 'PAY-803', company: 'ServiceNow', plan: 'Enterprise Plan', amount: 1299, date: daysAgo(12), status: 'Paid' },
  { id: 'PAY-804', company: 'PVR Cinemas', plan: 'Professional Plan', amount: 499, date: daysAgo(2), status: 'Paid' },
  { id: 'PAY-805', company: 'Swiggy', plan: 'Enterprise Plan', amount: 1299, date: daysAgo(1), status: 'Paid' },
  { id: 'PAY-806', company: 'Amazon India', plan: 'Enterprise Plan', amount: 1299, date: daysAgo(15), status: 'Paid' },
];

export const INITIAL_AUDIT_LOGS: SAAuditLog[] = [
  { id: 'LOG-901', user: 'Super Admin', company: 'Platform', action: 'Approved Company: Swiggy', module: 'Company Approvals', timestamp: hoursAgo(2), ipAddress: '192.168.1.10', status: 'Success' },
  { id: 'LOG-902', user: 'Prakash Kumar', company: 'RedBus', action: 'Configured working hours', module: 'Settings', timestamp: hoursAgo(4), ipAddress: '157.44.12.98', status: 'Success' },
  { id: 'LOG-903', user: 'Super Admin', company: 'Platform', action: 'Updated LLM parameters', module: 'AI Config', timestamp: hoursAgo(8), ipAddress: '192.168.1.10', status: 'Success' },
  { id: 'LOG-904', user: 'Harish Rao', company: 'Swiggy', action: 'Failed login attempt', module: 'Authentication', timestamp: daysAgo(1), ipAddress: '102.12.33.45', status: 'Warning' },
  { id: 'LOG-905', user: 'Super Admin', company: 'Platform', action: 'Suspended Company: TechCorp Solutions', module: 'Companies', timestamp: daysAgo(2), ipAddress: '192.168.1.10', status: 'Warning' },
  { id: 'LOG-906', user: 'System Bot', company: 'Platform', action: 'Automated database vacuum', module: 'Database System', timestamp: daysAgo(3), ipAddress: '127.0.0.1', status: 'Success' }
];

export const INITIAL_ANNOUNCEMENTS: SAAnnouncement[] = [
  { id: 'ANN-001', title: 'Scheduled Platform Maintenance', content: 'We will be performing database hardware upgrades on July 30, 2026, from 02:00 to 04:00 UTC. Expect short intervals of downtime.', severity: 'Warning', date: daysAgo(1), targetCompany: 'All' },
  { id: 'ANN-002', title: 'New AI Agent Multi-Model Support', content: 'You can now select GPT-4o, Claude 3.5 Sonnet, or Gemini 1.5 Pro in the AI Configuration menu. Higher accuracy & processing speed available now.', severity: 'Info', date: daysAgo(5), targetCompany: 'All' },
  { id: 'ANN-003', title: 'Security Alert: API Keys Expiry', content: 'For increased compliance, older API access keys will expire by next week. Please rotate them immediately in your settings.', severity: 'Alert', date: daysAgo(12), targetCompany: 'All' }
];

export const INITIAL_NOTIFICATIONS: SANotification[] = [
  { id: 'NOT-701', type: 'new_registration', title: 'New Registration: FinCorp Global', message: 'A new enterprise partner requested access. Verification required.', timestamp: hoursAgo(0.5), read: false },
  { id: 'NOT-702', type: 'high_server_usage', title: 'High CPU Utilization Alert', message: 'Auth server average load exceeds 88% capacity.', timestamp: hoursAgo(1), read: false },
  { id: 'NOT-703', type: 'ai_failure', title: 'Gemini Provider Timeout', message: 'OCR summary service experienced a 10s API latency surge.', timestamp: hoursAgo(4), read: true },
  { id: 'NOT-704', type: 'subscription_expired', title: 'Subscription Expired', message: 'TechCorp Solutions plan reached the renewal cycle deadline.', timestamp: daysAgo(1), read: true },
  { id: 'NOT-705', type: 'security_alert', title: 'Failed Admin Session Request', message: '3 incorrect passwords from IP 84.11.201.2 for admin@techcorp.io', timestamp: daysAgo(2), read: false }
];

// Charts
export const COMPANIES_GROWTH = [
  { month: 'Jan', count: 3 },
  { month: 'Feb', count: 5 },
  { month: 'Mar', count: 6 },
  { month: 'Apr', count: 7 },
  { month: 'May', count: 8 },
  { month: 'Jun', count: 9 },
  { month: 'Jul', count: 10 }
];

export const MONTHLY_TICKETS = [
  { month: 'Jan', volume: 2200 },
  { month: 'Feb', volume: 2900 },
  { month: 'Mar', volume: 3800 },
  { month: 'Apr', volume: 4100 },
  { month: 'May', volume: 4900 },
  { month: 'Jun', volume: 6200 },
  { month: 'Jul', volume: 9440 }
];

export const REVENUE_TREND = [
  { month: 'Jan', revenue: 2500 },
  { month: 'Feb', revenue: 3800 },
  { month: 'Mar', revenue: 4200 },
  { month: 'Apr', revenue: 5100 },
  { month: 'May', revenue: 5900 },
  { month: 'Jun', revenue: 7200 },
  { month: 'Jul', revenue: 8492 }
];

export const SUBSCRIPTION_PLAN_DIST = [
  { name: 'Enterprise', value: 6, color: '#8b5cf6' },
  { name: 'Professional', value: 2, color: '#f59e0b' },
  { name: 'Starter', value: 1, color: '#10b981' },
  { name: 'Free', value: 1, color: '#6b7280' }
];

export const AI_REQUESTS_TREND = [
  { day: 'Mon', count: 1200 },
  { day: 'Tue', count: 1540 },
  { day: 'Wed', count: 1890 },
  { day: 'Thu', count: 1670 },
  { day: 'Fri', count: 2100 },
  { day: 'Sat', count: 980 },
  { day: 'Sun', count: 850 }
];
