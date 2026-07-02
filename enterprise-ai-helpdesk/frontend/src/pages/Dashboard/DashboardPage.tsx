import { motion } from 'framer-motion';
import StatsGrid from '@/components/dashboard/StatsGrid';
import RecentTickets from '@/components/dashboard/RecentTickets';
import AIActivityFeed from '@/components/dashboard/AIActivityFeed';
import TicketTrendChart from '@/components/charts/TicketTrendChart';
import CategoryChart from '@/components/charts/CategoryChart';
import PriorityPieChart from '@/components/charts/PriorityPieChart';
import MonthlyAreaChart from '@/components/charts/MonthlyAreaChart';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">AI-powered operational overview</p>
      </motion.div>

      {/* Stats Grid */}
      <StatsGrid />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TicketTrendChart />
        <CategoryChart />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PriorityPieChart />
        <MonthlyAreaChart />
      </div>

      {/* Bottom: Recent Tickets + AI Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentTickets />
        <AIActivityFeed />
      </div>
    </div>
  );
}
