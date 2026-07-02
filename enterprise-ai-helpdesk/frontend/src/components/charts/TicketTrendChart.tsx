import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DEMO_DATA = [
  { day: 'Mon', tickets: 42 }, { day: 'Tue', tickets: 58 }, { day: 'Wed', tickets: 51 },
  { day: 'Thu', tickets: 67 }, { day: 'Fri', tickets: 73 }, { day: 'Sat', tickets: 32 },
  { day: 'Sun', tickets: 28 }, { day: 'Mon', tickets: 55 }, { day: 'Tue', tickets: 62 },
  { day: 'Wed', tickets: 48 }, { day: 'Thu', tickets: 71 }, { day: 'Fri', tickets: 80 },
  { day: 'Sat', tickets: 35 }, { day: 'Sun', tickets: 30 },
];

export default function TicketTrendChart() {
  return (
    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Daily Ticket Trend</h3>
      <p className="text-xs text-[var(--text-tertiary)] mb-4">Incoming tickets over the last 14 days</p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={DEMO_DATA}>
          <defs>
            <linearGradient id="ticketGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', borderRadius: 12, fontSize: 12, color: 'var(--text-primary)' }}
            labelStyle={{ color: 'var(--text-secondary)' }}
          />
          <Area type="monotone" dataKey="tickets" stroke="#6366f1" strokeWidth={2} fill="url(#ticketGrad)" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
