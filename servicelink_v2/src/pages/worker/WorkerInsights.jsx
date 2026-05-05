import { useState } from 'react';
import { TrendingUp, Download, IndianRupee, ArrowUpRight, ArrowDownRight, FileText, Calendar } from 'lucide-react';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const monthlyData = [12400, 15800, 11200, 18600, 22400, 19800, 24100, 21300, 26800, 23500, 28900, 31200];
const categoryData = [
  { name: 'Plumbing', amount: 8400, pct: 35, color: 'bg-blue-500' },
  { name: 'Electrical', amount: 5800, pct: 24, color: 'bg-amber-500' },
  { name: 'Carpentry', amount: 4200, pct: 18, color: 'bg-emerald-500' },
  { name: 'Painting', amount: 3100, pct: 13, color: 'bg-purple-500' },
  { name: 'Other', amount: 2400, pct: 10, color: 'bg-slate-400' },
];

const formatINR = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

const WorkerInsights = () => {
  const [period, setPeriod] = useState('monthly');
  const thisMonth = monthlyData[new Date().getMonth()] || 24100;
  const lastMonth = monthlyData[Math.max(0, new Date().getMonth() - 1)] || 21300;
  const growth = (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1);
  const isUp = Number(growth) >= 0;
  const maxVal = Math.max(...monthlyData);

  const weeklyEarnings = [1800, 2600, 1400, 3200, 2800, 4200, 3600];
  const weekMax = Math.max(...weeklyEarnings);

  const yearlyTotal = monthlyData.reduce((a, b) => a + b, 0);
  const monthlyAvg = Math.round(yearlyTotal / 12);

  const chartData = period === 'monthly' ? monthlyData : weeklyEarnings;
  const chartLabels = period === 'monthly' ? MONTHS_SHORT : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const chartMax = period === 'monthly' ? maxVal : weekMax;

  const downloadSlip = () => {
    const now = new Date();
    const monthName = MONTHS_SHORT[now.getMonth()];
    const content = `
SERVICELINK - MONTHLY EARNING SLIP
===================================
Worker Earning Statement
Month: ${monthName} ${now.getFullYear()}
Generated: ${now.toLocaleDateString('en-IN')}

EARNINGS SUMMARY
-----------------
Total Earnings:     ${formatINR(thisMonth)}
Jobs Completed:     18
Average Per Job:    ${formatINR(Math.round(thisMonth / 18))}

CATEGORY BREAKDOWN
-------------------
${categoryData.map(c => `${c.name.padEnd(16)} ${formatINR(c.amount).padStart(10)}  (${c.pct}%)`).join('\n')}

COMPARISON
-----------
Last Month:         ${formatINR(lastMonth)}
Change:             ${isUp ? '+' : ''}${growth}%

PAYMENT STATUS
-----------
Status:             Paid
Payment Mode:       Bank Transfer
Reference:          SL-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}

===================================
This is a system-generated document.
ServiceLink Partner Program
    `.trim();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ServiceLink_Earnings_${monthName}_${now.getFullYear()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "This Month", value: formatINR(thisMonth), sub: `${isUp ? '+' : ''}${growth}%`, icon: IndianRupee, accent: 'emerald', up: isUp },
          { label: "Monthly Avg", value: formatINR(monthlyAvg), sub: 'This year', icon: TrendingUp, accent: 'blue', up: true },
          { label: "Yearly Total", value: formatINR(yearlyTotal), sub: `${new Date().getFullYear()}`, icon: Calendar, accent: 'purple', up: true },
          { label: "Pending", value: formatINR(3200), sub: '2 payments', icon: FileText, accent: 'amber', up: false },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-[1.5rem] border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-${item.accent}-50 flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 text-${item.accent}-600`} />
              </div>
              <span className={`text-sm font-semibold flex items-center gap-1 ${item.up ? 'text-emerald-600' : 'text-amber-600'}`}>
                {item.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {item.sub}
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900">{item.value}</p>
            <p className="text-sm font-semibold text-slate-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
        {/* Earnings Chart */}
        <div className="bg-white rounded-[1.5rem] border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Earnings Overview</h3>
            <div className="flex gap-1.5 bg-slate-50 rounded-xl p-1">
              {['weekly', 'monthly'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${period === p ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-56 flex items-end gap-3">
            {chartData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-400">{period === 'monthly' ? formatINR(val / 1000) + 'k' : formatINR(val)}</span>
                <div className="w-full rounded-t-xl bg-gradient-to-t from-slate-800 to-emerald-500 transition-all duration-500 hover:from-slate-700 hover:to-emerald-400 cursor-pointer" style={{ height: `${Math.max(16, (val / chartMax) * 160)}px` }} />
                <span className="text-xs font-bold text-slate-400">{chartLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-[1.5rem] border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-5">By Category</h3>
          <div className="space-y-4">
            {categoryData.map(cat => (
              <div key={cat.name}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-semibold text-slate-700">{cat.name}</span>
                  <span className="font-bold text-slate-900">{formatINR(cat.amount)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${cat.color} transition-all duration-700`} style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Total this month</span>
            <span className="text-lg font-black text-slate-900">{formatINR(thisMonth)}</span>
          </div>
        </div>
      </div>

      {/* Download Slip */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[1.5rem] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <h3 className="text-lg font-bold text-white">Monthly Earning Slip</h3>
          <p className="text-sm text-slate-400 mt-1.5">Download your detailed earning statement for this month.</p>
        </div>
        <button onClick={downloadSlip} className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-slate-900 rounded-xl text-sm font-black hover:bg-emerald-400 transition-colors shrink-0">
          <Download className="w-4 h-4" />
          Download Slip
        </button>
      </div>
    </div>
  );
};

export default WorkerInsights;
