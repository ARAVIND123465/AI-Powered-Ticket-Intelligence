import { motion } from 'framer-motion';
import { Server, Database, Shield, HardDrive, Mail, Eye, Brain, Bell, Cpu } from 'lucide-react';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';

export default function SASystemHealthTab() {
  const services = [
    { name: 'Database (PostgreSQL)', status: 'Healthy', latency: '4ms', icon: Database, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Backend API (Spring Boot)', status: 'Healthy', latency: '12ms', icon: Server, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Authentication Server (JWT)', status: 'Healthy', latency: '6ms', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Storage (S3 Bucket)', status: 'Healthy', latency: '24ms', icon: HardDrive, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Email Service (SMTP)', status: 'Healthy', latency: '85ms', icon: Mail, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'OCR Service (Tesseract/Vision API)', status: 'Healthy', latency: '180ms', icon: Eye, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'AI Service (DeepMind Gemini)', status: 'Healthy', latency: '320ms', icon: Brain, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Notification Service (Websockets)', status: 'Healthy', latency: '2ms', icon: Bell, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">System Health Monitoring</h3>
        <p className="text-xs text-[var(--text-tertiary)] font-semibold">Real-time status indicators of platform services, APIs, databases, and servers</p>
      </motion.div>

      {/* Latency & Server Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPU */}
        <Card className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" /> CPU Core Utilization
            </h4>
            <span className="font-mono text-xs font-black text-indigo-400">42% Load</span>
          </div>
          <ProgressBar value={42} color="indigo" />
          <div className="flex justify-between text-[10px] text-[var(--text-tertiary)]">
            <span>8 Cores @ 3.2GHz</span>
            <span>Uptime: 14 days, 6 hours</span>
          </div>
        </Card>

        {/* Memory */}
        <Card className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-400" /> RAM Memory Allocation
            </h4>
            <span className="font-mono text-xs font-black text-emerald-400">58% Capacity</span>
          </div>
          <ProgressBar value={58} color="emerald" />
          <div className="flex justify-between text-[10px] text-[var(--text-tertiary)]">
            <span>9.28 GB / 16.00 GB</span>
            <span>Buffered Cache: 2.1 GB</span>
          </div>
        </Card>

        {/* Storage */}
        <Card className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-amber-400" /> File Storage (Documents & Attachments)
            </h4>
            <span className="font-mono text-xs font-black text-amber-400">22% Volume</span>
          </div>
          <ProgressBar value={22} color="amber" />
          <div className="flex justify-between text-[10px] text-[var(--text-tertiary)]">
            <span>220 GB / 1000 GB</span>
            <span>Total Upload Files: 12,400</span>
          </div>
        </Card>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((srv, idx) => {
          const Icon = srv.icon;
          return (
            <motion.div
              key={srv.name}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className="p-4 flex items-center gap-3 bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:shadow-lg transition-all duration-300">
                <div className={`w-9 h-9 rounded-xl ${srv.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${srv.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[var(--text-primary)] truncate">{srv.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      {srv.status}
                    </span>
                    <span className="text-[9px] font-mono text-[var(--text-tertiary)]">({srv.latency})</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
