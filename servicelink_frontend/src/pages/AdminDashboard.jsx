import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, BriefcaseBusiness, IndianRupee, Star, Users, Wrench } from 'lucide-react';

const monthlyRevenue = [28000, 34000, 32000, 42000, 48000, 39000, 52000, 47000, 58000, 54000, 62000, 68000];
const weeklyRevenue = [8400, 11200, 9600, 12800, 15000, 13600, 17200];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const formatINR = (value) => `\u20b9${Number(value).toLocaleString('en-IN')}`;

const categories = [
  ['Electrician', 28, 'bg-emerald-500'],
  ['Plumber', 22, 'bg-blue-500'],
  ['Carpenter', 18, 'bg-amber-500'],
  ['Cleaner', 15, 'bg-cyan-500'],
  ['Painter', 10, 'bg-purple-500'],
  ['Other', 7, 'bg-slate-400'],
];

const recentBookings = [
  ['BK-1042', 'Ananya Rao', 'Rajesh Kumar', 'Electrical Repair', '06 May', 2100, 'Completed'],
  ['BK-1041', 'Kiran S', 'Meena Devi', 'Deep Cleaning', '06 May', 3400, 'Active'],
  ['BK-1040', 'Farhan Ali', 'Suresh N', 'Pipe Leakage', '05 May', 1500, 'Completed'],
  ['BK-1039', 'Neha Jain', 'Vikram P', 'Painting', '05 May', 8200, 'Paid'],
  ['BK-1038', 'Amit Gowda', 'Latha M', 'Carpentry', '04 May', 4600, 'Completed'],
  ['BK-1037', 'Divya H', 'Manjunath K', 'Fan Install', '04 May', 900, 'Cancelled'],
  ['BK-1036', 'Rohan Das', 'Rafiq A', 'Bathroom Fix', '03 May', 2200, 'Completed'],
  ['BK-1035', 'Sneha P', 'Naveen R', 'AC Service', '03 May', 2600, 'Active'],
];

const workers = [
  ['Rajesh Kumar', 'Electrician', 4.9, 126, 82400],
  ['Meena Devi', 'Cleaner', 4.8, 118, 76200],
  ['Suresh N', 'Plumber', 4.8, 104, 69800],
  ['Vikram P', 'Painter', 4.7, 92, 65400],
  ['Latha M', 'Carpenter', 4.6, 87, 58800],
];

const AdminDashboard = () => {
  const [period, setPeriod] = useState('monthly');
  const chartData = period === 'monthly' ? monthlyRevenue : weeklyRevenue;
  const chartLabels = period === 'monthly' ? months : days;
  const maxValue = useMemo(() => Math.max(...chartData), [chartData]);

  const kpis = [
    { label: 'Total Users', value: '1,247', trend: '+12.4%', up: true, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Workers', value: '36', trend: '+4.2%', up: true, icon: Wrench, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Bookings', value: '892', trend: '+9.8%', up: true, icon: BriefcaseBusiness, color: 'text-amber-600 bg-amber-50' },
    { label: 'Revenue', value: formatINR(452300), trend: '-1.6%', up: false, icon: IndianRupee, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-600">ServiceLink Admin</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Platform Analytics</h1>
          </div>
          <p className="text-sm font-semibold text-slate-500">Demo data updated today</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map(({ label, value, trend, up, icon: Icon, color }) => {
            const TrendIcon = up ? ArrowUpRight : ArrowDownRight;
            return (
              <section key={label} className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`flex items-center gap-1 text-sm font-black ${up ? 'text-emerald-600' : 'text-red-500'}`}>
                    <TrendIcon className="h-4 w-4" />
                    {trend}
                  </span>
                </div>
                <p className="text-3xl font-black text-slate-950">{value}</p>
                <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
              </section>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-lg font-black text-slate-950">Revenue Overview</h2>
              <div className="flex rounded-xl bg-slate-100 p-1">
                {['monthly', 'weekly'].map(item => (
                  <button key={item} onClick={() => setPeriod(item)} className={`rounded-lg px-4 py-2 text-sm font-black capitalize transition ${period === item ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex h-72 items-end gap-3">
              {chartData.map((value, index) => (
                <div key={`${chartLabels[index]}-${value}`} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-black text-slate-400">{formatINR(value / 1000)}k</span>
                  <div className="w-full rounded-t-xl bg-gradient-to-t from-slate-800 to-emerald-500" style={{ height: `${Math.max(18, (value / maxValue) * 200)}px` }} />
                  <span className="text-xs font-bold text-slate-500">{chartLabels[index]}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Bookings by Category</h2>
            <div className="mt-6 space-y-4">
              {categories.map(([name, pct, color]) => (
                <div key={name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-bold text-slate-700">{name}</span>
                    <span className="font-black text-slate-950">{pct}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-6">
              <h2 className="text-lg font-black text-slate-950">Recent Bookings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
                  <tr>{['ID', 'Customer', 'Worker', 'Service', 'Date', 'Amount', 'Status'].map(head => <th key={head} className="px-5 py-4">{head}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentBookings.map(row => (
                    <tr key={row[0]}>
                      {row.map((cell, index) => (
                        <td key={`${row[0]}-${index}`} className="px-5 py-4 font-semibold text-slate-700">
                          {index === 5 ? formatINR(cell) : index === 6 ? <span className={`rounded-full px-3 py-1 text-xs font-black ${cell === 'Cancelled' ? 'bg-red-50 text-red-600' : cell === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{cell}</span> : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Top Workers</h2>
            <div className="mt-5 space-y-4">
              {workers.map(([name, skill, rating, jobs, earnings], index) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-900 text-sm font-black text-white">{name[0]}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-black text-slate-950">{name}</p>
                      {index < 3 && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">#{index + 1}</span>}
                    </div>
                    <p className="text-xs font-semibold text-slate-500">{skill} - {jobs} jobs</p>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center justify-end gap-1 text-sm font-black text-slate-950"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{rating}</p>
                    <p className="text-xs font-bold text-slate-500">{formatINR(earnings)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 grid gap-4 rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm md:grid-cols-3">
          {[
            ['Worker Utilization', '78%', 78],
            ['Customer Satisfaction', '4.6/5.0', 92],
            ['Avg Response Time', '12 min', 64],
          ].map(([label, value, pct]) => (
            <div key={label}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-black text-slate-700">{label}</p>
                <p className="text-sm font-black text-slate-950">{value}</p>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;
