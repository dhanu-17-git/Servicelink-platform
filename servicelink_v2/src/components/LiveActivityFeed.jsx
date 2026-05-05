import { Users, Zap } from 'lucide-react';

const feedItems = [
  { id: 1, user: "Amit S.", action: "rented", item: "Power Drill", time: "2 min ago", type: "tool" },
  { id: 2, user: "Priya R.", action: "booked", item: "Electrician", time: "5 min ago", type: "service" },
  { id: 3, user: "Rahul K.", action: "rented", item: "Ladders", time: "8 min ago", type: "tool" },
  { id: 4, user: "Suresh M.", action: "booked", item: "Plumber", time: "12 min ago", type: "service" },
  { id: 5, user: "Vikram P.", action: "rented", item: "Angle Grinder", time: "15 min ago", type: "tool" },
  { id: 6, user: "Meena J.", action: "booked", item: "House Cleaner", time: "20 min ago", type: "service" },
  { id: 7, user: "Deepak L.", action: "rented", item: "JCB Excavator", time: "25 min ago", type: "tool" },
  { id: 8, user: "Sunita D.", action: "booked", item: "Carpenter", time: "30 min ago", type: "service" },
];

const LiveActivityFeed = () => {
  return (
    <div 
      className="hidden lg:block w-72 h-[340px] relative overflow-hidden select-none group animate-hero-heading"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
      }}
    >
      {/* Marquee Container */}
      <div className="relative h-full overflow-hidden">
        <div className="animate-vertical-marquee flex flex-col gap-4 py-4 group-hover:[animation-play-state:paused]">
          {[...feedItems, ...feedItems].map((item, idx) => (
            <div 
              key={`${item.id}-${idx}`}
              className="flex items-center gap-3 py-3 px-5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.05)] hover:bg-white/20 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.1)] ${item.type === 'tool' ? 'text-orange-400 bg-orange-400/30 border border-orange-400/20' : 'text-blue-400 bg-blue-400/30 border border-blue-400/20'}`}>
                {item.type === 'tool' ? <Zap size={14} /> : <Users size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white leading-tight">
                  <span className="font-bold">{item.user}</span> {item.action} <span className="font-semibold">{item.item}</span>
                </p>
              </div>
              <div className="text-[9px] text-white/50 font-medium whitespace-nowrap">
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveActivityFeed;
