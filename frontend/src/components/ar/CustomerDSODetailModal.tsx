import { X, TrendingUp, Mail, Phone, AlertCircle, PhoneCall, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CustomerDSODetailModalProps {
  customer: { customer: string; dso: number; amount: number; impact: string };
  onClose: () => void;
}

type PayStatus = 'paid' | 'overdue' | 'pending';

interface PaymentRecord {
  invoice: string;
  invoiceDate: string;
  dueDate: string;
  paidDate: string | null;
  amount: number;
  daysToPay: number;
  status: PayStatus;
}

const CUSTOMER_DATA: Record<string, {
  contact: { name: string; title: string; email: string; phone: string; paymentTerms: string; creditLimit: string };
  avgPaymentTime: number; openInvoices: number;
  dsoTrend: { month: string; dso: number }[];
  aging: { label: string; amount: number; invoices: number }[];
  payments: PaymentRecord[];
  actions: { label: string; highlight: string; rest: string }[];
}> = {
  'ABC Manufacturing Ltd': {
    contact: { name: 'John Smith', title: 'CFO', email: 'john.smith@abcmanufacturingltd.com', phone: '+1 (555) 123-4567', paymentTerms: 'Net 30', creditLimit: '$500,000' },
    avgPaymentTime: 40, openInvoices: 15,
    dsoTrend: [
      { month: 'Jun', dso: 81 }, { month: 'Jul', dso: 80 }, { month: 'Aug', dso: 84 },
      { month: 'Sep', dso: 87 }, { month: 'Oct', dso: 88 }, { month: 'Nov', dso: 89 },
    ],
    aging: [
      { label: 'Current', amount: 22000, invoices: 3 }, { label: '1-30', amount: 36000, invoices: 5 },
      { label: '31-60', amount: 44000, invoices: 4 }, { label: '61-90', amount: 29000, invoices: 2 },
      { label: '90+', amount: 15000, invoices: 1 },
    ],
    payments: [
      { invoice: 'INV-10245', invoiceDate: '2024-08-15', dueDate: '2024-09-14', paidDate: '2024-10-25', amount: 28500, daysToPay: 41, status: 'paid' },
      { invoice: 'INV-10312', invoiceDate: '2024-09-10', dueDate: '2024-10-10', paidDate: '2024-11-18', amount: 32000, daysToPay: 39, status: 'paid' },
      { invoice: 'INV-10389', invoiceDate: '2024-10-05', dueDate: '2024-11-04', paidDate: null, amount: 42000, daysToPay: 21, status: 'overdue' },
      { invoice: 'INV-10423', invoiceDate: '2024-10-20', dueDate: '2024-11-19', paidDate: null, amount: 38500, daysToPay: 6, status: 'overdue' },
    ],
    actions: [
      { label: 'Schedule call', highlight: 'Schedule call', rest: ' with John Smith to discuss payment timeline' },
      { label: 'Offer early payment discount', highlight: 'Offer early payment discount', rest: ' (2% for 10 days) on open invoices' },
      { label: 'Review credit terms', highlight: 'Review credit terms', rest: ' - Consider reducing from Net 30 to Net 15' },
      { label: 'Set up payment plan', highlight: 'Set up payment plan', rest: ' for the $145K outstanding balance' },
    ],
  },
  'Premium Distributors': {
    contact: { name: 'Lisa Chen', title: 'Finance Director', email: 'l.chen@premiumdist.com', phone: '+1 (555) 234-5678', paymentTerms: 'Net 45', creditLimit: '$250,000' },
    avgPaymentTime: 35, openInvoices: 9,
    dsoTrend: [
      { month: 'Jun', dso: 70 }, { month: 'Jul', dso: 71 }, { month: 'Aug', dso: 73 },
      { month: 'Sep', dso: 74 }, { month: 'Oct', dso: 75 }, { month: 'Nov', dso: 76 },
    ],
    aging: [
      { label: 'Current', amount: 12000, invoices: 2 }, { label: '1-30', amount: 24000, invoices: 3 },
      { label: '31-60', amount: 28000, invoices: 3 }, { label: '61-90', amount: 12000, invoices: 1 },
      { label: '90+', amount: 0, invoices: 0 },
    ],
    payments: [
      { invoice: 'INV-10201', invoiceDate: '2024-08-01', dueDate: '2024-09-15', paidDate: '2024-10-20', amount: 18000, daysToPay: 35, status: 'paid' },
      { invoice: 'INV-10267', invoiceDate: '2024-09-05', dueDate: '2024-10-20', paidDate: '2024-11-18', amount: 22000, daysToPay: 29, status: 'paid' },
      { invoice: 'INV-10334', invoiceDate: '2024-10-01', dueDate: '2024-11-15', paidDate: null, amount: 28000, daysToPay: 15, status: 'overdue' },
      { invoice: 'INV-10401', invoiceDate: '2024-10-25', dueDate: '2024-12-09', paidDate: null, amount: 8000, daysToPay: 12, status: 'pending' },
    ],
    actions: [
      { label: 'Send payment reminder', highlight: 'Send payment reminder', rest: ' for INV-10334 overdue by 15 days' },
      { label: 'Offer early payment discount', highlight: 'Offer early payment discount', rest: ' (1.5% for 10 days) on open invoices' },
      { label: 'Schedule call', highlight: 'Schedule call', rest: ' with Lisa Chen to discuss payment schedule' },
    ],
  },
  'Global Retail Corp': {
    contact: { name: 'Robert Kim', title: 'AP Manager', email: 'r.kim@globalretail.com', phone: '+1 (555) 345-6789', paymentTerms: 'Net 30', creditLimit: '$350,000' },
    avgPaymentTime: 38, openInvoices: 11,
    dsoTrend: [
      { month: 'Jun', dso: 62 }, { month: 'Jul', dso: 64 }, { month: 'Aug', dso: 65 },
      { month: 'Sep', dso: 66 }, { month: 'Oct', dso: 67 }, { month: 'Nov', dso: 68 },
    ],
    aging: [
      { label: 'Current', amount: 18000, invoices: 3 }, { label: '1-30', amount: 32000, invoices: 4 },
      { label: '31-60', amount: 28000, invoices: 3 }, { label: '61-90', amount: 15000, invoices: 1 },
      { label: '90+', amount: 5000, invoices: 0 },
    ],
    payments: [
      { invoice: 'INV-10188', invoiceDate: '2024-08-10', dueDate: '2024-09-09', paidDate: '2024-10-12', amount: 31000, daysToPay: 33, status: 'paid' },
      { invoice: 'INV-10255', invoiceDate: '2024-09-15', dueDate: '2024-10-15', paidDate: '2024-11-10', amount: 26000, daysToPay: 26, status: 'paid' },
      { invoice: 'INV-10320', invoiceDate: '2024-10-08', dueDate: '2024-11-07', paidDate: null, amount: 28000, daysToPay: 18, status: 'overdue' },
      { invoice: 'INV-10395', invoiceDate: '2024-10-22', dueDate: '2024-11-21', paidDate: null, amount: 13000, daysToPay: 8, status: 'overdue' },
    ],
    actions: [
      { label: 'Follow up', highlight: 'Follow up', rest: ' on INV-10320 overdue 18 days' },
      { label: 'Review credit limit', highlight: 'Review credit limit', rest: ' given consistent late payments' },
      { label: 'Schedule call', highlight: 'Schedule call', rest: ' with Robert Kim regarding payment plan' },
    ],
  },
};

const DEFAULT_DATA = {
  contact: { name: 'Finance Manager', title: 'AP Contact', email: 'finance@company.com', phone: '+1 (555) 000-0000', paymentTerms: 'Net 30', creditLimit: '$150,000' },
  avgPaymentTime: 32, openInvoices: 6,
  dsoTrend: [
    { month: 'Jun', dso: 40 }, { month: 'Jul', dso: 42 }, { month: 'Aug', dso: 44 },
    { month: 'Sep', dso: 45 }, { month: 'Oct', dso: 47 }, { month: 'Nov', dso: 48 },
  ],
  aging: [
    { label: 'Current', amount: 10000, invoices: 1 }, { label: '1-30', amount: 18000, invoices: 2 },
    { label: '31-60', amount: 14000, invoices: 2 }, { label: '61-90', amount: 8000, invoices: 1 },
    { label: '90+', amount: 0, invoices: 0 },
  ],
  payments: [
    { invoice: 'INV-10001', invoiceDate: '2024-09-01', dueDate: '2024-10-01', paidDate: '2024-10-15', amount: 15000, daysToPay: 14, status: 'paid' as PayStatus },
    { invoice: 'INV-10050', invoiceDate: '2024-10-01', dueDate: '2024-11-01', paidDate: null, amount: 10000, daysToPay: 10, status: 'overdue' as PayStatus },
  ],
  actions: [
    { label: 'Send payment reminder', highlight: 'Send payment reminder', rest: ' for overdue invoices' },
    { label: 'Schedule call', highlight: 'Schedule call', rest: ' to discuss payment timeline' },
  ],
};

function fmtK(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n.toLocaleString()}`;
}

const STATUS_STYLE: Record<PayStatus, { bg: string; color: string; label: string }> = {
  paid:    { bg: '#f0fdf4', color: '#16a34a', label: 'paid' },
  overdue: { bg: '#fef2f2', color: '#ef4444', label: 'overdue' },
  pending: { bg: '#fffbeb', color: '#d97706', label: 'pending' },
};

export function CustomerDSODetailModal({ customer, onClose }: CustomerDSODetailModalProps) {
  const data = CUSTOMER_DATA[customer.customer] ?? DEFAULT_DATA;
  const impactColor = customer.impact === 'high' ? '#ef4444' : customer.impact === 'medium' ? '#f59e0b' : '#10b981';
  const impactBg    = customer.impact === 'high' ? '#fef2f2' : customer.impact === 'medium' ? '#fffbeb' : '#f0fdf4';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ maxWidth: 920 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="3" width="7" height="9" rx="1.5" fill="white" fillOpacity="0.9" />
                <rect x="11" y="6" width="7" height="6" rx="1.5" fill="white" fillOpacity="0.7" />
                <rect x="2" y="14" width="16" height="3" rx="1.5" fill="white" fillOpacity="0.5" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{customer.customer}</p>
              <p className="text-xs text-slate-500">Customer DSO Analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl p-4 border" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#ef4444' }}>Customer DSO</p>
              <p className="text-2xl font-bold text-slate-900">{customer.dso} days</p>
              <div className="flex items-center gap-1 mt-1" style={{ color: '#ef4444' }}>
                <TrendingUp className="w-3 h-3" /><span className="text-xs">Trending up</span>
              </div>
            </div>
            <div className="rounded-xl p-4 border" style={{ background: '#fffbeb', borderColor: '#fed7aa' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#f59e0b' }}>Outstanding Amount</p>
              <p className="text-2xl font-bold text-slate-900">${(customer.amount / 1000).toFixed(0)}K</p>
              <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>{data.openInvoices} open invoices</p>
            </div>
            <div className="rounded-xl p-4 border" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#3b82f6' }}>Avg Payment Time</p>
              <p className="text-2xl font-bold text-slate-900">{data.avgPaymentTime} days</p>
              <p className="text-xs mt-1" style={{ color: '#3b82f6' }}>Last 6 months</p>
            </div>
            <div className="rounded-xl p-4 border" style={{ background: impactBg, borderColor: impactColor + '44' }}>
              <p className="text-xs font-medium mb-1" style={{ color: impactColor }}>Impact Level</p>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: impactColor + '22', color: impactColor }}>
                {customer.impact}
              </span>
            </div>
          </div>

          {/* Contact + Trend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-5">
              <p className="font-semibold text-slate-900 mb-4 text-sm">Contact Information</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Primary Contact</p>
                  <p className="text-sm font-semibold text-slate-900">{data.contact.name}</p>
                  <p className="text-xs text-slate-500">{data.contact.title}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Email</p>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <p className="text-sm text-blue-600 truncate">{data.contact.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Phone</p>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <p className="text-sm text-blue-600">{data.contact.phone}</p>
                  </div>
                </div>
                <div className="flex gap-8 pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Payment Terms</p>
                    <p className="text-sm font-medium text-slate-900">{data.contact.paymentTerms}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Credit Limit</p>
                    <p className="text-sm font-medium text-slate-900">{data.contact.creditLimit}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-5">
              <p className="font-semibold text-slate-900 mb-3 text-sm">DSO Trend (Last 6 Months)</p>
              <ResponsiveContainer width="100%" height={195}>
                <LineChart data={data.dsoTrend} margin={{ top: 4, right: 8, bottom: 0, left: -14 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: unknown) => [`${v} days`, 'Customer DSO']}
                    labelStyle={{ color: '#64748b', fontWeight: 500 }}
                    itemStyle={{ color: '#ef4444' }}
                  />
                  <Line type="monotone" dataKey="dso" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Aging */}
          <div className="rounded-xl border border-slate-200 p-5">
            <p className="font-semibold text-slate-900 mb-4 text-sm">Invoice Aging Breakdown</p>
            <div className="grid grid-cols-5 gap-4">
              {data.aging.map(bucket => (
                <div key={bucket.label}>
                  <p className="text-xs text-slate-400 mb-1">{bucket.label}</p>
                  <p className="text-lg font-bold text-slate-900">{fmtK(bucket.amount)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{bucket.invoices} invoice{bucket.invoices !== 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payment History — full table matching the screenshot */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="font-semibold text-slate-900 text-sm">Recent Payment History</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Invoice #', 'Invoice Date', 'Due Date', 'Paid Date', 'Amount', 'Days to Pay', 'Status'].map(h => (
                      <th key={h} className="text-left py-3 px-5 text-xs font-semibold text-slate-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map(p => {
                    const ss = STATUS_STYLE[p.status];
                    const isLate = p.status !== 'paid' || p.daysToPay > 30;
                    return (
                      <tr key={p.invoice} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-5 font-medium text-blue-600">{p.invoice}</td>
                        <td className="py-3.5 px-5 text-slate-700">{p.invoiceDate}</td>
                        <td className="py-3.5 px-5 text-slate-700">{p.dueDate}</td>
                        <td className="py-3.5 px-5 text-slate-700">{p.paidDate ?? '–'}</td>
                        <td className="py-3.5 px-5 font-medium text-slate-900">${p.amount.toLocaleString()}</td>
                        <td className="py-3.5 px-5 font-semibold" style={{ color: isLate ? '#ef4444' : '#10b981' }}>
                          {p.daysToPay} days
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-1 rounded text-xs font-semibold" style={{ background: ss.bg, color: ss.color }}>
                            {ss.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="rounded-xl border p-5" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4" style={{ color: '#d97706' }} />
              <p className="font-semibold text-slate-900 text-sm">Recommended Actions</p>
            </div>
            <ul className="space-y-1.5">
              {data.actions.map((a, i) => (
                <li key={i} className="text-sm text-slate-700">
                  <span style={{ color: '#d97706' }} className="font-medium">• {a.highlight}</span>
                  {a.rest}
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
              <Mail className="w-4 h-4" /> Send Payment Reminder
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors">
              <PhoneCall className="w-4 h-4" /> Schedule Call
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors">
              <FileText className="w-4 h-4" /> View All Invoices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
