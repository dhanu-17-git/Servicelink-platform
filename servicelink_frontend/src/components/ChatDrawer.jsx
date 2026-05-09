import { useEffect, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ChatDrawer = ({ isOpen, onClose, booking = {} }) => {
  const { user } = useAuth();
  const isWorker = Boolean(user?.is_worker);
  
  const workerName = booking.worker?.name || booking.worker || 'Rajesh Kumar';
  const customerName = booking.user?.name || booking.user?.email || 'Customer';
  const skill = booking.worker?.skill || booking.skill || 'Professional';
  
  const displayTitle = isWorker ? customerName : workerName;
  const displaySubtitle = isWorker ? 'Customer - Online' : `${skill} - Online`;

  const storageKey = `sl_chat_${booking.id || 'demo'}`;

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const endRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try { setMessages(JSON.parse(stored)); } catch { setMessages([]); }
      }
    }
  }, [isOpen, storageKey]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const newMessages = JSON.parse(e.newValue);
          setMessages(newMessages);
          if (!isOpen && newMessages.length > messages.length) {
             setUnreadCount(count => count + (newMessages.length - messages.length));
          }
        } catch { }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [storageKey, isOpen, messages.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (isOpen) setUnreadCount(0);
  }, [messages, typing, isOpen]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    
    const newMsg = { 
      from: isWorker ? 'worker' : 'user', 
      text, 
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) 
    };
    
    const newMessages = [...messages, newMsg];
    setMessages(newMessages);
    localStorage.setItem(storageKey, JSON.stringify(newMessages));
    setDraft('');
  };

  return (
    <>
      {!isOpen && unreadCount > 0 && <span className="fixed bottom-6 right-6 z-[90] rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white shadow-lg">{unreadCount} unread</span>}
      <div className={`fixed inset-0 z-[110] transition ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-slate-950/30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
        <aside className={`absolute right-0 top-0 flex h-full w-full max-w-[380px] flex-col bg-white shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <header className="bg-slate-900 p-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative grid h-11 w-11 place-items-center rounded-full bg-white/10 text-sm font-black">{displayTitle[0]}</div>
                <div>
                  <h2 className="font-black">{displayTitle}</h2>
                  <p className="flex items-center gap-2 text-xs font-semibold text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-400" />{displaySubtitle}</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20">
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
            {messages.length === 0 && (
              <p className="text-xs text-slate-400 text-center mt-10">Send a message to start chatting.</p>
            )}
            {messages.map((message, index) => {
              const isMine = (isWorker && message.from === 'worker') || (!isWorker && message.from === 'user');
              return (
                <div key={`${message.time}-${index}`} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${isMine ? 'rounded-br-md bg-primary-600 text-white' : 'rounded-bl-md bg-gray-100 text-slate-800'}`}>
                    <p className="text-sm font-semibold leading-5">{message.text}</p>
                    <p className={`mt-1 text-[10px] font-bold ${isMine ? 'text-blue-100' : 'text-slate-400'}`}>{message.time}</p>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && sendMessage()} placeholder="Type a message" className="h-12 flex-1 rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
              <button onClick={sendMessage} className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-white transition hover:bg-emerald-600">
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default ChatDrawer;
