import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CHART_COLORS } from '@/constants';

const DEMO_DATA = [
  { name: 'Network', value: 62 }, { name: 'Billing', value: 45 }, { name: 'Technical', value: 58 },
  { name: 'Security', value: 34 }, { name: 'Payment', value: 41 }, { name: 'Bug', value: 28 },
  { name: 'Access', value: 23 }, { name: 'Feature', value: 19 }, { name: 'Login', value: 15 },
];

export default function CategoryChart() {
  return (
    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Category Distribution</h3>
      <p className="text-xs text-[var(--text-tertiary)] mb-4">Tickets by category</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={DEMO_DATA} barSize={24}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} />
          <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', borderRadius: 12, fontSize: 12, color: 'var(--text-primary)' }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {DEMO_DATA.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
