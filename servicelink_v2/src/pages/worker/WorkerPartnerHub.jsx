import { Gift, Percent, Star, Trophy, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const offers = [
  { id: 1, title: 'Weekend Warrior Bonus', desc: 'Complete 5+ jobs this weekend and earn ₹500 extra bonus.', icon: Trophy, accent: 'amber', tag: 'Limited', expires: '2 days left' },
  { id: 2, title: 'Peak Hour Surge', desc: 'Jobs between 6–9 PM pay 1.5x this week. Higher demand = higher pay.', icon: Percent, accent: 'emerald', tag: 'Active', expires: '5 days left' },
  { id: 3, title: 'First 50 Jobs Milestone', desc: 'Complete your 50th job and unlock Gold Partner badge with priority listings.', icon: Star, accent: 'purple', tag: 'Progress', expires: '42/50 done' },
  { id: 4, title: 'Festival Season Boost', desc: 'All bookings during festival week earn an additional 20% commission.', icon: Gift, accent: 'blue', tag: 'Upcoming', expires: 'Starts May 10' },
];

const referralCode = 'SL-PARTNER-7X92';

const WorkerPartnerHub = () => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Offers Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Active Offers & Bonuses</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {offers.map(offer => {
            const Icon = offer.icon;
            return (
              <div key={offer.id} className="bg-white rounded-[1.5rem] border border-gray-100 p-6 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${offer.accent}-50 flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 text-${offer.accent}-600`} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${offer.accent}-50 text-${offer.accent}-700`}>
                    {offer.tag}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-4">{offer.title}</h4>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{offer.desc}</p>
                <p className="text-xs font-semibold text-slate-400 mt-4">{offer.expires}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referral Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-[1.5rem] p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h3 className="text-lg font-bold">Refer a Worker</h3>
            <p className="text-sm text-emerald-100 mt-1.5">Earn ₹200 for every worker who completes their first job using your code.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 bg-white/10 rounded-xl text-base font-mono font-bold tracking-wider">
              {referralCode}
            </div>
            <button onClick={copyCode} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
              {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/20">
          <div>
            <p className="text-2xl font-black">3</p>
            <p className="text-sm text-emerald-100">Referrals sent</p>
          </div>
          <div>
            <p className="text-2xl font-black">1</p>
            <p className="text-sm text-emerald-100">Joined</p>
          </div>
          <div>
            <p className="text-2xl font-black">₹200</p>
            <p className="text-sm text-emerald-100">Earned</p>
          </div>
        </div>
      </div>

      {/* Partner Perks */}
      <div className="bg-white rounded-[1.5rem] border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Partner Perks</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { title: 'Priority Listing', desc: 'Your profile appears first in search results.', active: true },
            { title: 'Insurance Coverage', desc: '₹50,000 coverage for on-job incidents.', active: true },
            { title: 'Training Access', desc: 'Free skill upgrade courses and certification.', active: false },
          ].map(perk => (
            <div key={perk.title} className={`rounded-xl p-4 border ${perk.active ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-2 h-2 rounded-full ${perk.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className="text-sm font-bold text-slate-900">{perk.title}</span>
              </div>
              <p className="text-sm text-slate-500">{perk.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkerPartnerHub;
