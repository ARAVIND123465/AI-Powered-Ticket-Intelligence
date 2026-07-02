import { motion } from 'framer-motion';
import TicketTrendChart from '@/components/charts/TicketTrendChart';
import CategoryChart from '@/components/charts/CategoryChart';
import PriorityPieChart from '@/components/charts/PriorityPieChart';
import MonthlyAreaChart from '@/components/charts/MonthlyAreaChart';
import HeatMap from '@/components/charts/HeatMap';
import PerformanceChart from '@/components/charts/PerformanceChart';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { TrendingUp, AlertTriangle, Shield, Brain } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">AI-powered insights and predictive analytics</p>
      </motion.div>

      {/* Key insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: <TrendingUp className="w-4 h-4" />, label: 'Forecast', value: 'Spike expected next week', badge: 'Warning', color: '#f59e0b' },
          { icon: <Brain className="w-4 h-4" />, label: 'AI Accuracy', value: '92.4% classification', badge: 'Excellent', color: '#22c55e' },
          { icon: <Shield className="w-4 h-4" />, label: 'SLA Compliance', value: '97.2% within target', badge: 'On Track', color: '#06b6d4' },
          { icon: <AlertTriangle className="w-4 h-4" />, label: 'Escalations', value: '18 this week', badge: 'High', color: '#ef4444' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}18`, color: item.color }}>{item.icon}</div>
                <Badge color={item.color}>{item.badge}</Badge>
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{item.value}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{item.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TicketTrendChart />
        <PerformanceChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryChart />
        <PriorityPieChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HeatMap />
        <MonthlyAreaChart />
      </div>
    </div>
  );
}
