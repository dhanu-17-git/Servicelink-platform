import { useEffect, useRef, useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const OTP = '123456';

const OTPModal = ({ isOpen, onClose, phone = '' }) => {
  const toast = useToast();
  const inputsRef = useRef([]);
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    setDigits(Array(6).fill(''));
    setCountdown(30);
    setError('');
    setVerified(false);
    const timer = setInterval(() => setCountdown(current => Math.max(0, current - 1)), 1000);
    const startFill = setTimeout(() => {
      OTP.split('').forEach((digit, index) => {
        setTimeout(() => {
          setDigits(current => {
            const next = [...current];
            next[index] = digit;
            return next;
          });
          inputsRef.current[Math.min(index + 1, 5)]?.focus();
        }, index * 200);
      });
    }, 3000);
    return () => {
      clearInterval(timer);
      clearTimeout(startFill);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const updateDigit = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setDigits(current => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    setError('');
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) inputsRef.current[index - 1]?.focus();
  };

  const verify = () => {
    if (digits.join('') === OTP) {
      setVerified(true);
      setTimeout(onClose, 1500);
      return;
    }
    setError('Invalid OTP. Try again.');
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const resend = () => {
    setCountdown(30);
    toast.info('OTP resent successfully');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl animate-reveal sm:p-8">
        <button onClick={onClose} className="absolute right-5 top-5 rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700">
          <X className="h-5 w-5" />
        </button>
        {verified ? (
          <div className="py-12 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="h-10 w-10" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-slate-950">Verified</h2>
          </div>
        ) : (
          <>
            <div className="pr-10">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">OTP Verification</p>
              <h2 className="mt-3 text-2xl font-black text-slate-950">Enter code</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">We've sent a 6-digit code to +91 {phone}</p>
            </div>

            <div className={`mt-7 flex justify-between gap-2 ${shaking ? 'otp-shake' : ''}`}>
              {digits.map((digit, index) => (
                <input key={index} ref={(node) => { inputsRef.current[index] = node; }} value={digit} onChange={(event) => updateDigit(index, event.target.value)} onKeyDown={(event) => handleKeyDown(index, event)} inputMode="numeric" maxLength={1} className="h-14 w-12 rounded-2xl border border-slate-200 text-center text-xl font-black text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
              ))}
            </div>
            {error && <p className="mt-3 text-sm font-bold text-red-600">{error}</p>}

            <button onClick={verify} className="mt-6 w-full rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-600">
              Verify
            </button>

            <div className="mt-5 flex items-center justify-between text-sm font-bold">
              <button onClick={onClose} className="text-slate-500 transition hover:text-slate-900">Wrong number? Change</button>
              <button onClick={resend} disabled={countdown > 0} className="flex items-center gap-1 text-emerald-600 disabled:text-slate-400">
                <RotateCcw className="h-4 w-4" />
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
          </>
        )}
        <style>{`@keyframes otpShake{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(2px)}30%,50%,70%{transform:translateX(-4px)}40%,60%{transform:translateX(4px)}}.otp-shake{animation:otpShake .45s both}`}</style>
      </div>
    </div>
  );
};

export default OTPModal;
