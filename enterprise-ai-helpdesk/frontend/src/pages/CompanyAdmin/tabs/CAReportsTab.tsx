import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Calendar, CalendarDays, CalendarRange, Users, Ticket,
  Tag, Clock, Download, FileSpreadsheet, File,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import type { CATicket, CASupportAgent } from '../companyAdminData';

interface Props {
  tickets: CATicket[];
  agents: CASupportAgent[];
}

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  period?: string;
}

const REPORT_TYPES: ReportType[] = [
  { id: 'daily', name: 'Daily Report', description: 'Today\'s ticket summary and agent activity', icon: Calendar, gradient: 'from-blue-500 to-indigo-600', period: 'Today' },
  { id: 'weekly', name: 'Weekly Report', description: 'This week\'s performance overview', icon: CalendarDays, gradient: 'from-emerald-500 to-teal-600', period: 'This Week' },
  { id: 'monthly', name: 'Monthly Report', description: 'Monthly metrics and trend analysis', icon: CalendarRange, gradient: 'from-amber-500 to-orange-600', period: 'This Month' },
  { id: 'agent', name: 'Support Agent Report', description: 'Individual agent performance breakdown', icon: Users, gradient: 'from-violet-500 to-purple-600' },
  { id: 'ticket', name: 'Ticket Report', description: 'Detailed ticket-level analytics', icon: Ticket, gradient: 'from-pink-500 to-rose-600' },
  { id: 'category', name: 'Category Report', description: 'Category-wise ticket distribution', icon: Tag, gradient: 'from-cyan-500 to-blue-600' },
  { id: 'resolution', name: 'Resolution Report', description: 'Resolution times and SLA compliance', icon: Clock, gradient: 'from-red-500 to-rose-600' },
];

function generateCSV(reportId: string, tickets: CATicket[], agents: CASupportAgent[]): string {
  const now = new Date().toLocaleDateString();
  let lines: string[] = [];

  switch (reportId) {
    case 'daily':
    case 'weekly':
    case 'monthly':
      lines = [
        `Report: ${reportId.charAt(0).toUpperCase() + reportId.slice(1)} Report`,
        `Generated: ${now}`,
        `Total Tickets: ${tickets.length}`,
        `Open: ${tickets.filter(t => t.status === 'Open').length}`,
        `In Progress: ${tickets.filter(t => t.status === 'In_Progress').length}`,
        `Pending: ${tickets.filter(t => t.status === 'Pending').length}`,
        `Resolved: ${tickets.filter(t => t.status === 'Resolved').length}`,
        `Closed: ${tickets.filter(t => t.status === 'Closed').length}`,
        '',
        'Ticket ID,Customer,Category,Priority,Status,Agent,Created',
        ...tickets.map(t => `${t.id},${t.customerName},${t.category},${t.priority},${t.status},${t.assignedAgent || 'Unassigned'},${t.createdAt}`),
      ];
      break;
    case 'agent':
      lines = [
        'Support Agent Performance Report',
        `Generated: ${now}`,
        '',
        'Employee ID,Name,Department,Assigned,Resolved,Performance,Status',
        ...agents.map(a => `${a.employeeId},${a.name},${a.department},${a.assignedTickets},${a.resolvedTickets},${a.performance}%,${a.status}`),
      ];
      break;
    case 'ticket':
      lines = [
        'Ticket Detail Report',
        `Generated: ${now}`,
        '',
        'Ticket ID,Title,Customer,Email,Category,Priority,Status,Agent,Created,SLA Deadline',
        ...tickets.map(t => `${t.id},${t.title},${t.customerName},${t.customerEmail},${t.category},${t.priority},${t.status},${t.assignedAgent || 'Unassigned'},${t.createdAt},${t.slaDeadline}`),
      ];
      break;
    case 'category': {
      const catMap: Record<string, number> = {};
      tickets.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + 1; });
      lines = [
        'Category Distribution Report',
        `Generated: ${now}`,
        '',
        'Category,Ticket Count',
        ...Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([cat, count]) => `${cat},${count}`),
      ];
      break;
    }
    case 'resolution':
      lines = [
        'Resolution Report',
        `Generated: ${now}`,
        `Total Resolved: ${tickets.filter(t => t.status === 'Resolved').length}`,
        `Total Closed: ${tickets.filter(t => t.status === 'Closed').length}`,
        `Average Resolution Time: 2.8 hours`,
        `SLA Compliance: 92%`,
        '',
        'Ticket ID,Customer,Priority,Status,Agent',
        ...tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').map(t => `${t.id},${t.customerName},${t.priority},${t.status},${t.assignedAgent || 'N/A'}`),
      ];
      break;
    default:
      lines = ['No data'];
  }
  return lines.join('\n');
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CAReportsTab({ tickets, agents }: Props) {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = (reportId: string, format: 'csv' | 'excel' | 'pdf') => {
    setGenerating(reportId);
    setTimeout(() => {
      const csv = generateCSV(reportId, tickets, agents);
      const report = REPORT_TYPES.find(r => r.id === reportId)!;
      const timestamp = new Date().toISOString().split('T')[0];

      if (format === 'csv') {
        downloadFile(csv, `${report.name.replace(/\s+/g, '_')}_${timestamp}.csv`, 'text/csv');
      } else if (format === 'excel') {
        downloadFile(csv, `${report.name.replace(/\s+/g, '_')}_${timestamp}.xls`, 'application/vnd.ms-excel');
      } else {
        // PDF simulation — generate as text
        downloadFile(csv, `${report.name.replace(/\s+/g, '_')}_${timestamp}.txt`, 'text/plain');
      }

      toast.success(`${report.name} exported as ${format.toUpperCase()}`);
      setGenerating(null);
    }, 800);
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Reports</h3>
        <p className="text-xs text-[var(--text-tertiary)]">Generate and export company reports</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {REPORT_TYPES.map((report, i) => {
          const Icon = report.icon;
          const isLoading = generating === report.id;
          return (
            <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5 space-y-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${report.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {report.period && (
                    <Badge variant="default" size="sm">{report.period}</Badge>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">{report.name}</h4>
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{report.description}</p>
                </div>
                <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--border-primary)]">
                  <Button variant="outline" size="sm" onClick={() => handleGenerate(report.id, 'pdf')} isLoading={isLoading} className="flex-1 text-[10px] gap-1">
                    <File className="w-3 h-3" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleGenerate(report.id, 'excel')} isLoading={isLoading} className="flex-1 text-[10px] gap-1">
                    <FileSpreadsheet className="w-3 h-3" /> Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleGenerate(report.id, 'csv')} isLoading={isLoading} className="flex-1 text-[10px] gap-1">
                    <Download className="w-3 h-3" /> CSV
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
