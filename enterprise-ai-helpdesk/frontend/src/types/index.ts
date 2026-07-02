/* ============================================================
   TypeScript interfaces matching backend API contracts
   ============================================================ */

// --- Auth ---
export interface LoginRequest {
  username: string; // email — FastAPI OAuth2PasswordRequestForm uses 'username'
  password: string;
}

export interface RegisterRequest {
  email: string;
  full_name?: string;
  password: string;
  role?: 'Customer' | 'Agent' | 'Admin';
}

export interface Token {
  access_token: string;
  token_type: string;
  role: string;
}

// --- User ---
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'Customer' | 'Agent' | 'Admin';
  created_at: string;
}

// --- Ticket ---
export interface Ticket {
  id: string;
  title: string;
  description: string;
  user_id: string;
  status: 'Open' | 'In_Progress' | 'Resolved' | 'Closed';
  category: string | null;
  priority: string | null;
  sentiment: string | null;
  is_duplicate: boolean;
  escalate_recommended: boolean;
  ai_root_cause: string | null;
  ai_suggested_resolution: string | null;
  attachment: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketCreate {
  title: string;
  description: string;
}

export interface TicketUpdate {
  status?: string;
  category?: string;
  priority?: string;
}

export interface AIInsights {
  predicted_category: string;
  category_confidence: number;
  predicted_priority: string;
  priority_confidence: number;
  sentiment: string;
  is_frustrated: boolean;
  escalation_recommended: boolean;
  is_duplicate: boolean;
  duplicate_matches: DuplicateMatch[];
  fake_attachment_detected?: boolean;
  fake_file_name?: string | null;
}

export interface DuplicateMatch {
  ticket_id: string | number;
  subject: string;
  similarity: number;
}

// --- Dashboard ---
export interface DashboardSummary {
  summary_cards: {
    total_open_tickets: number;
    urgent_escalations: number;
    flagged_duplicates_today: number;
    average_resolution_time_hrs: number;
  };
  category_distribution: Array<{ name: string; value: number }>;
  priority_breakdown: Record<string, number>;
}

export interface WeeklyLoad {
  day: string;
  date: string;
  incoming_volume: number;
  resolved_volume: number;
}

// --- Analytics ---
export interface PredictiveAnalysis {
  overall_forecast: Array<{ date: string; predicted_tickets: number }>;
  spike_info: {
    baseline_avg_daily: number;
    predicted_avg_daily: number;
    is_spike_predicted: boolean;
    spike_ratio: number | null;
  };
}

export interface SentimentTrend {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  frustrated: number;
}

// --- Chat ---
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatQuery {
  question: string;
  history: Array<{ sender: string; text: string }>;
}

export interface ChatResponse {
  answer: string;
  citations: string[];
  escalation_recommended: boolean;
}

// --- Search ---
export interface SearchResult {
  score: number;
  text: string;
  metadata: {
    title: string;
    url: string;
    source: string;
  };
}

// --- Notification ---
export interface Notification {
  id: string;
  ticket_id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  read: boolean;
  created_at: string;
}

// --- Reports ---
export interface ReportRequest {
  report_name: string;
  target_category?: string;
  lookback_days: number;
}

export interface ReportResponse {
  report_id: string;
  generated_at: string;
  scope: string;
  metrics_summary: {
    top_pain_points: string[];
    systemic_bottlenecks: string;
    recommended_kb_additions: string[];
  };
}
