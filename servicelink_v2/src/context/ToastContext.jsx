import { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(current => [...current, { id, message, type }]);
    setTimeout(() => {
      setToasts(current => current.filter(item => item.id !== id));
    }, 3600);
  }, []);

  const toast = useMemo(() => ({
    show,
    success: (message) => show(message, 'success'),
    info: (message) => show(message, 'info'),
  }), [show]);

  const removeToast = (id) => {
    setToasts(current => current.filter(item => item.id !== id));
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-20 right-4 z-[100] space-y-3 w-[calc(100vw-2rem)] max-w-sm pointer-events-none">
        {toasts.map(({ id, message, type }) => {
          const Icon = type === 'info' ? Info : CheckCircle2;
          return (
            <div key={id} className="pointer-events-auto overflow-hidden rounded-2xl border border-white/70 bg-white/90 backdrop-blur-2xl shadow-2xl shadow-blue-900/15 animate-reveal">
              <div className={`h-1 ${type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
              <div className="p-4 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${type === 'info' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="flex-1 text-sm font-semibold text-heading leading-5">{message}</p>
                <button onClick={() => removeToast(id)} className="p-1 rounded-lg text-gray-400 hover:text-heading hover:bg-gray-50">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
