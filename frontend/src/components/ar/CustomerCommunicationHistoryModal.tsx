import { X, Mail, Phone, Send, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface CustomerCommunicationHistoryModalProps {
  customer: { customer: string; dso?: number; amount?: number; impact?: string; [key: string]: unknown };
  onClose: () => void;
}

type CommType = 'EMAIL' | 'CALL';
type CommStatus = 'sent' | 'completed' | 'scheduled' | 'failed';

interface CommRecord {
  type: CommType;
  status: CommStatus;
  date: string;
  time: string;
  subject: string;
  from: string;
  to: string;
  body: string;
}

const COMM_DATA: Record<string, CommRecord[]> = {
  'ABC Manufacturing Ltd': [
    {
      type: 'EMAIL', status: 'sent', date: '2024-11-22', time: '3:45 PM',
      subject: 'Outstanding Balance Discussion - ABC Manufacturing Ltd',
      from: 'Sarah Johnson', to: 'accounts@abcmanufacturingltd.com',
      body: `Dear ABC Manufacturing Ltd Team,\n\nI hope this email finds you well. I wanted to reach out regarding your current outstanding balance of $145,000.\n\nYour average DSO is currently at 89 days, and we would like to discuss ways to improve payment timelines.\n\nCould we schedule a brief call this week to discuss?\n\nBest regards,\nSarah Johnson\nCollections Manager`,
    },
    {
      type: 'CALL', status: 'completed', date: '2024-11-18', time: '11:30 AM',
      subject: 'DSO Improvement Discussion',
      from: 'Mike Chen', to: 'John Smith (CFO)',
      body: `Had a productive call with CFO John Smith regarding payment acceleration. Key points:\n\n- Acknowledged current DSO of 89 days is higher than desired\n- Discussed early payment discount options (2% for 10 days)\n- John committed to reviewing internal AP process\n- Follow-up scheduled for Dec 2024`,
    },
    {
      type: 'EMAIL', status: 'sent', date: '2024-11-05', time: '10:15 AM',
      subject: 'Invoice INV-2024-089 — Payment Reminder',
      from: 'Sarah Johnson', to: 'accounts@abcmanufacturingltd.com',
      body: `Dear Team,\n\nThis is a reminder that invoice INV-2024-089 for $28,500 is now 12 days overdue.\n\nPlease arrange payment at your earliest convenience.\n\nThank you,\nSarah Johnson`,
    },
    {
      type: 'CALL', status: 'completed', date: '2024-10-28', time: '2:00 PM',
      subject: 'Account Review Call',
      from: 'Mike Chen', to: 'John Smith (CFO)',
      body: `Quarterly account review call. Discussed:\n- Current outstanding balance of $145,000\n- Payment plan proposal\n- Credit limit review scheduled for Q1 2025`,
    },
    {
      type: 'EMAIL', status: 'sent', date: '2024-10-10', time: '9:00 AM',
      subject: 'Statement of Account — October 2024',
      from: 'Sarah Johnson', to: 'accounts@abcmanufacturingltd.com',
      body: `Dear ABC Manufacturing Ltd Team,\n\nPlease find attached your statement of account for October 2024.\n\nTotal Outstanding: $145,000\nOverdue Amount: $87,000\n\nPlease contact us if you have any queries.\n\nBest regards,\nSarah Johnson`,
    },
    {
      type: 'EMAIL', status: 'sent', date: '2024-09-25', time: '4:30 PM',
      subject: 'Re: Payment Terms Negotiation',
      from: 'Sarah Johnson', to: 'accounts@abcmanufacturingltd.com',
      body: `Dear John,\n\nThank you for your response. We are open to discussing revised payment terms.\n\nWe can offer Net 45 terms subject to a personal guarantee and timely payment for the next 3 months.\n\nBest regards,\nSarah Johnson`,
    },
    {
      type: 'CALL', status: 'completed', date: '2024-09-15', time: '3:00 PM',
      subject: 'Initial Collections Outreach',
      from: 'Mike Chen', to: 'John Smith (CFO)',
      body: `Initial outreach call regarding overdue accounts:\n- Total overdue: $87,000\n- DSO trending upward (81 → 89 days)\n- Customer requested 30-day extension\n- Decision deferred to management`,
    },
  ],
  'Premium Distributors': [
    {
      type: 'EMAIL', status: 'sent', date: '2024-11-20', time: '2:00 PM',
      subject: 'Outstanding Balance — Premium Distributors',
      from: 'Sarah Johnson', to: 'finance@premiumdist.com',
      body: `Dear Lisa,\n\nI hope you are doing well. I wanted to follow up on the outstanding balance of $76,000.\n\nYour current DSO stands at 76 days. We would appreciate your prompt attention.\n\nBest regards,\nSarah Johnson`,
    },
    {
      type: 'CALL', status: 'completed', date: '2024-11-10', time: '10:00 AM',
      subject: 'Payment Follow-up Call',
      from: 'Mike Chen', to: 'Lisa Chen (Finance Director)',
      body: `Follow-up call with Lisa Chen:\n- Confirmed receipt of outstanding invoices\n- Lisa committed to processing payments within 2 weeks\n- Partial payment of $20,000 expected by Nov 25`,
    },
    {
      type: 'EMAIL', status: 'sent', date: '2024-10-30', time: '11:00 AM',
      subject: 'Invoice INV-2024-091 — Payment Due',
      from: 'Sarah Johnson', to: 'finance@premiumdist.com',
      body: `Dear Lisa,\n\nPlease note that invoice INV-2024-091 for $18,000 is now due.\n\nKindly arrange payment at your earliest convenience.\n\nThank you,\nSarah Johnson`,
    },
  ],
  'Global Retail Corp': [
    {
      type: 'EMAIL', status: 'sent', date: '2024-11-18', time: '9:30 AM',
      subject: 'Account Review — Global Retail Corp',
      from: 'Sarah Johnson', to: 'ap@globalretail.com',
      body: `Dear Robert,\n\nI am reaching out regarding your outstanding balance of $98,000.\n\nWould you be available for a brief call this week?\n\nBest regards,\nSarah Johnson`,
    },
    {
      type: 'CALL', status: 'completed', date: '2024-11-12', time: '1:00 PM',
      subject: 'Collections Discussion',
      from: 'Mike Chen', to: 'Robert Kim (AP Manager)',
      body: `Call with Robert Kim:\n- Discussed invoice ageing\n- Robert confirmed payment processing delays due to internal approval workflow\n- Expected clearance of $45,000 by end of November`,
    },
  ],
};

const STATUS_STYLE: Record<CommStatus, { bg: string; color: string }> = {
  sent:      { bg: '#eff6ff', color: '#3b82f6' },
  completed: { bg: '#f0fdf4', color: '#10b981' },
  scheduled: { bg: '#fefce8', color: '#ca8a04' },
  failed:    { bg: '#fef2f2', color: '#ef4444' },
};

export function CustomerCommunicationHistoryModal({ customer, onClose }: CustomerCommunicationHistoryModalProps) {
  const [subject, setSubject] = useState('');
  const [expanded, setExpanded] = useState<number | null>(0);

  const records = COMM_DATA[customer.customer] ?? [];
  const dso = (customer.dso as number) ?? 0;
  const amount = (customer.amount as number) ?? 0;
  const impact = (customer.impact as string) ?? 'medium';

  const impactColor = impact === 'high' ? '#ef4444' : impact === 'medium' ? '#f59e0b' : '#10b981';
  const impactBg    = impact === 'high' ? '#fef2f2' : impact === 'medium' ? '#fffbeb' : '#f0fdf4';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full shadow-2xl flex flex-col"
        style={{ maxWidth: 680, maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="4" width="16" height="12" rx="2" stroke="#3b82f6" strokeWidth="1.5" />
                <path d="M2 7l8 5 8-5" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Communication History</p>
              <p className="text-xs text-slate-500">{customer.customer} · Customer Account</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Summary bar */}
        <div className="px-6 py-3 border-b border-slate-100 grid grid-cols-4 gap-4 shrink-0">
          <div>
            <p className="text-xs text-slate-400">Outstanding Amount</p>
            <p className="text-sm font-semibold text-slate-900">${amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Customer DSO</p>
            <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>{dso} days</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Impact Level</p>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: impactBg, color: impactColor }}>
              {impact}
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Communications</p>
            <p className="text-sm font-semibold text-slate-900">{records.length} records</p>
          </div>
        </div>

        {/* Records */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {records.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No communication history available.</p>
          ) : records.map((rec, idx) => {
            const ss = STATUS_STYLE[rec.status];
            const isExpanded = expanded === idx;
            return (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  className="w-full text-left p-4"
                  onClick={() => setExpanded(isExpanded ? null : idx)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: rec.type === 'EMAIL' ? '#eff6ff' : '#f0fdf4' }}>
                        {rec.type === 'EMAIL'
                          ? <Mail className="w-4 h-4 text-blue-500" />
                          : <Phone className="w-4 h-4 text-green-500" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded border" style={{ background: rec.type === 'EMAIL' ? '#eff6ff' : '#f0fdf4', color: rec.type === 'EMAIL' ? '#3b82f6' : '#10b981', borderColor: rec.type === 'EMAIL' ? '#bfdbfe' : '#bbf7d0' }}>
                          {rec.type}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: ss.bg, color: ss.color }}>
                          {rec.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 truncate">{rec.subject}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        From: {rec.from} → To: {rec.to}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">{rec.date}</p>
                      <p className="text-xs text-slate-400">{rec.time}</p>
                      <ChevronDown className={`w-4 h-4 text-slate-400 mt-1 ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-100">
                    <div className="mt-3 bg-slate-50 rounded-lg p-3">
                      <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{rec.body}</pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Send email bar */}
        <div className="border-t border-slate-200 px-4 py-3 flex items-center gap-2 shrink-0 bg-white">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors shrink-0">
            Send Email <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <input
            type="text"
            placeholder="Quick email subject..."
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shrink-0">
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </div>
      </div>
    </div>
  );
}
