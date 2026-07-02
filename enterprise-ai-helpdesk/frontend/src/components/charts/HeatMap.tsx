import { cn } from '@/utils/cn';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'];

// Generate realistic heatmap data
const generateData = () => {
  const data: number[][] = [];
  for (let d = 0; d < 7; d++) {
    const row: number[] = [];
    for (let h = 0; h < 8; h++) {
      const isWeekday = d < 5;
      const isPeak = h >= 2 && h <= 5;
      const base = isWeekday ? (isPeak ? 12 : 6) : 2;
      row.push(Math.floor(base + Math.random() * base));
    }
    data.push(row);
  }
  return data;
};

const data = generateData();
const maxVal = Math.max(...data.flat());

function getColor(val: number): string {
  const intensity = val / maxVal;
  if (intensity > 0.75) return 'bg-primary-600';
  if (intensity > 0.5) return 'bg-primary-500/70';
  if (intensity > 0.25) return 'bg-primary-400/40';
  return 'bg-primary-300/15';
}

export default function HeatMap() {
  return (
    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Ticket Volume Heatmap</h3>
      <p className="text-xs text-[var(--text-tertiary)] mb-4">Volume by day and hour</p>
      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          {/* Header */}
          <div className="flex gap-1 mb-1 pl-10">
            {HOURS.map((h) => (
              <div key={h} className="flex-1 text-center text-[10px] text-[var(--text-tertiary)]">{h}</div>
            ))}
          </div>
          {/* Rows */}
          {data.map((row, di) => (
            <div key={di} className="flex items-center gap-1 mb-1">
              <span className="w-8 text-[10px] text-[var(--text-tertiary)] text-right mr-1">{DAYS[di]}</span>
              {row.map((val, hi) => (
                <div
                  key={hi}
                  className={cn('flex-1 h-7 rounded-md flex items-center justify-center transition-all hover:ring-1 hover:ring-primary-400/40 cursor-default', getColor(val))}
                  title={`${DAYS[di]} ${HOURS[hi]}: ${val} tickets`}
                >
                  <span className="text-[9px] font-medium text-[var(--text-primary)] opacity-70">{val}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
