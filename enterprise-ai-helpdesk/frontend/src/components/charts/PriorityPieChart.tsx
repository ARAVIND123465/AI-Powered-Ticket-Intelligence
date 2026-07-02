import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PRIORITY_COLORS } from '@/constants';

const DEMO_DATA = [
  { name: 'Low', value: 120 }, { name: 'Medium', value: 210 },
  { name: 'High', value: 95 }, { name: 'Critical', value: 35 },
];

export default function PriorityPieChart() {
  return (
    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Priority Distribution</h3>
      <p className="text-xs text-[var(--text-tertiary)] mb-4">Current ticket priorities</p>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={DEMO_DATA}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            strokeWidth={0}
          >
            {DEMO_DATA.map((entry) => (
              <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#6b7280'} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', borderRadius: 12, fontSize: 12, color: 'var(--text-primary)' }} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
