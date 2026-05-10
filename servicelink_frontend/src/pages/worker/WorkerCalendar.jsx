import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle, Minus } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Simulated work data
const generateWorkData = (year, month) => {
  const data = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    if (date > today) continue;
    if (date.getDay() === 0) { data[d] = 'off'; continue; }
    const rand = Math.random();
    if (rand > 0.85) data[d] = 'off';
    else if (rand > 0.15) data[d] = 'worked';
    else data[d] = 'partial';
  }
  return data;
};

const statusColors = {
  worked: 'bg-emerald-500 text-white',
  partial: 'bg-amber-400 text-white',
  off: 'bg-slate-200 text-slate-500',
};

const statusLabels = { worked: 'Worked', partial: 'Half Day', off: 'Off' };

const WorkerCalendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [availableHours, setAvailableHours] = useState({ start: '09:00', end: '18:00' });
  const [offDays, setOffDays] = useState([0]); // Sunday

  const workData = useMemo(() => generateWorkData(currentYear, currentMonth), [currentYear, currentMonth]);
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const workedDays = Object.values(workData).filter(v => v === 'worked').length;
  const partialDays = Object.values(workData).filter(v => v === 'partial').length;
  const offDaysCount = Object.values(workData).filter(v => v === 'off').length;

  const prev = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const next = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const toggleOffDay = (dayIndex) => {
    setOffDays(prev => prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]);
  };

  return (
    <div className="space-y-6">
      {/* Month Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-[1.5rem] border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{workedDays}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Days worked</p>
          </div>
        </div>
        <div className="bg-white rounded-[1.5rem] border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <Minus className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{partialDays}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Half days</p>
          </div>
        </div>
        <div className="bg-white rounded-[1.5rem] border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{offDaysCount}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Days off</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar Grid */}
        <div className="bg-white rounded-[1.5rem] border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">{MONTHS[currentMonth]} {currentYear}</h3>
            <div className="flex gap-2">
              <button onClick={prev} className="p-2 rounded-xl hover:bg-slate-50 text-slate-500"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={next} className="p-2 rounded-xl hover:bg-slate-50 text-slate-500"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-3">
            {DAYS.map(d => <div key={d} className="text-center text-xs font-bold text-slate-400 py-1 uppercase tracking-wider">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const status = workData[day];
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              return (
                <div key={day} className={`relative aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all ${status ? statusColors[status] : 'text-slate-400'} ${isToday ? 'ring-2 ring-slate-900 ring-offset-2' : ''}`}>
                  {day}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-5 mt-6 pt-4 border-t border-gray-100">
            {Object.entries(statusLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className={`w-3 h-3 rounded-md ${statusColors[key].split(' ')[0]}`} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Availability Settings */}
        <div className="space-y-5">
          <div className="bg-white rounded-[1.5rem] border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-5 h-5 text-emerald-600" />
              <h4 className="text-base font-bold text-slate-900">Working Hours</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start</label>
                <input type="time" value={availableHours.start} onChange={e => setAvailableHours(h => ({ ...h, start: e.target.value }))} className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">End</label>
                <input type="time" value={availableHours.end} onChange={e => setAvailableHours(h => ({ ...h, end: e.target.value }))} className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[1.5rem] border border-gray-100 p-6">
            <h4 className="text-base font-bold text-slate-900 mb-4">Weekly Off Days</h4>
            <div className="grid grid-cols-4 gap-3">
              {DAYS.map((d, i) => (
                <button key={d} onClick={() => toggleOffDay(i)} className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${offDays.includes(i) ? 'bg-red-50 text-red-600 ring-1 ring-red-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerCalendar;
