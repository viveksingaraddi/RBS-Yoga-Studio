'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Search,
  Send,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';

interface JobItem {
  id: string;
  recipient: string;
  subject: string;
  eventType: string;
  scheduledFor: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  lastError?: string | null;
}

interface NotificationItem {
  id: string;
  recipient: string;
  subject: string;
  eventType: string;
  status: string;
  error?: string | null;
  createdAt: string;
  sentAt: string | null;
  provider: string;
}

export default function NotificationsClient({
  jobs: initialJobs,
  notifications: initialNotifications,
  stats,
}: {
  jobs: JobItem[];
  notifications: NotificationItem[];
  stats: {
    totalSent: number;
    queuedCount: number;
    failedCount: number;
    senderIdentity: string;
  };
}) {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobItem[]>(initialJobs);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleRunWorker = async () => {
    setIsProcessing(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/instructor/notifications', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ text: data.message, type: 'success' });
        router.refresh();
      } else {
        setActionMessage({ text: data.error || 'Worker execution failed.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Network error triggering worker.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.eventType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotifications = notifications.filter(
    (n) =>
      n.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.eventType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-dark/40 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-bold">
              Automated Studio Dispatch
            </span>
            <span className="px-2 py-0.5 bg-forest text-ivory text-[9px] uppercase tracking-wider font-semibold">
              Background Queue
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-forest mt-1">
            Notifications &amp; Reminders
          </h1>
          <p className="text-xs text-charcoal/75 max-w-xl">
            Monitor automated student activation emails, 60m/30m live broadcast alerts, pass expiry reminders, and transaction receipts.
          </p>
        </div>

        <button
          onClick={handleRunWorker}
          disabled={isProcessing}
          className="inline-flex items-center space-x-2 bg-forest text-ivory px-5 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-forest-light disabled:opacity-50 transition-all shadow-sm shrink-0"
        >
          <RotateCw className={`w-4 h-4 text-earth ${isProcessing ? 'animate-spin' : ''}`} />
          <span>{isProcessing ? 'Dispatching Queue...' : 'Run Queue Worker Now'}</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Delivered Emails</span>
          <p className="font-serif text-2xl font-bold text-forest mt-1">{stats.totalSent}</p>
          <span className="text-[10px] text-olive/80">Successfully sent</span>
        </div>
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Scheduled in Queue</span>
          <p className="font-serif text-2xl font-bold text-amber-800 mt-1">{stats.queuedCount}</p>
          <span className="text-[10px] text-olive/80">Pending execution</span>
        </div>
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Failed Attempts</span>
          <p className="font-serif text-2xl font-bold text-red-700 mt-1">{stats.failedCount}</p>
          <span className="text-[10px] text-olive/80">Under retry backoff</span>
        </div>
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Sender Account</span>
          <p className="font-serif text-sm font-bold text-forest mt-2 truncate" title={stats.senderIdentity}>
            {stats.senderIdentity}
          </p>
          <span className="text-[10px] text-olive/80">Gmail SMTP Verified</span>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 border flex items-center justify-between text-xs transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-charcoal/60 hover:text-charcoal p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-sage-dark/40 space-x-3 text-xs uppercase tracking-wider font-semibold">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'queue'
              ? 'border-forest text-forest bg-ivory font-bold'
              : 'border-transparent text-olive hover:text-forest'
          }`}
        >
          <Clock className="w-4 h-4 text-earth" />
          <span>Scheduled Queue &amp; Reminders ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'history'
              ? 'border-forest text-forest bg-ivory font-bold'
              : 'border-transparent text-olive hover:text-forest'
          }`}
        >
          <Mail className="w-4 h-4 text-earth" />
          <span>Delivery History &amp; Logs ({notifications.length})</span>
        </button>
      </div>

      {/* TAB 1: SCHEDULED QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="bg-ivory border border-sage-dark/40 shadow-card overflow-hidden">
            {filteredJobs.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto opacity-60" />
                <h3 className="font-serif text-lg text-forest">Queue is clean</h3>
                <p className="text-xs text-charcoal/60">
                  No background reminders or emails currently scheduled in the queue.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-charcoal/80">
                  <thead className="bg-sage text-forest uppercase tracking-wider text-[10px] font-semibold border-b border-sage-dark/40">
                    <tr>
                      <th className="px-5 py-3">Recipient</th>
                      <th className="px-5 py-3">Event Type</th>
                      <th className="px-5 py-3">Email Subject</th>
                      <th className="px-5 py-3">Scheduled Execution</th>
                      <th className="px-5 py-3 text-center">Attempts</th>
                      <th className="px-5 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-dark/20">
                    {filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-sage-light/30 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-forest">{job.recipient}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 bg-forest text-ivory text-[9px] uppercase tracking-wider font-semibold">
                            {job.eventType}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 max-w-xs truncate">{job.subject}</td>
                        <td className="px-5 py-3.5 text-olive">
                          {new Date(job.scheduledFor).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-5 py-3.5 text-center text-olive font-semibold">
                          {job.attempts} / {job.maxAttempts}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span
                            className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold ${
                              job.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : job.status === 'PROCESSING'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-red-100 text-red-900'
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SENT NOTIFICATIONS LOGS */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-ivory border border-sage-dark/40 shadow-card overflow-hidden">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Mail className="w-8 h-8 text-olive mx-auto opacity-50" />
                <h3 className="font-serif text-lg text-forest">No dispatch history recorded yet</h3>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-charcoal/80">
                  <thead className="bg-sage text-forest uppercase tracking-wider text-[10px] font-semibold border-b border-sage-dark/40">
                    <tr>
                      <th className="px-5 py-3">Recipient</th>
                      <th className="px-5 py-3">Event Type</th>
                      <th className="px-5 py-3">Subject</th>
                      <th className="px-5 py-3">Provider</th>
                      <th className="px-5 py-3">Delivered At</th>
                      <th className="px-5 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-dark/20">
                    {filteredNotifications.map((n) => (
                      <tr key={n.id} className="hover:bg-sage-light/30 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-forest">{n.recipient}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 bg-forest text-ivory text-[9px] uppercase tracking-wider font-semibold">
                            {n.eventType}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 max-w-sm truncate">{n.subject}</td>
                        <td className="px-5 py-3.5 text-olive font-mono text-[10px]">{n.provider}</td>
                        <td className="px-5 py-3.5 text-olive">
                          {n.sentAt
                            ? new Date(n.sentAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Pending'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span
                            className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold ${
                              n.status === 'SENT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : n.status === 'QUEUED'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-red-100 text-red-900'
                            }`}
                          >
                            {n.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
