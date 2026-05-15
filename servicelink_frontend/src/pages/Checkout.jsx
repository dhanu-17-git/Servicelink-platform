import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Calendar, CheckCircle2, ChevronRight, Loader2, Trash2, MapPin, CreditCard, ShieldCheck, ArrowLeft, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { API_BASE, authHeaders } from '../api/config';
import { playSuccessPing } from '../utils/sound';
import AddressManager from '../components/AddressManager';
import phonepeIcon from '../../images/icons/phonepay.png';
import gpayIcon from '../../images/icons/googlepay.png';
import paytmIcon from '../../images/icons/paytym.png';
import amazonpayIcon from '../../images/icons/amazonpay.png';

const MIN_BOOKING_AMOUNT = 500;
const CONVENIENCE_FEE = 49;
const TOOL_SECURITY_DEPOSIT = 500;
const TOOL_DELIVERY_FEE = 50;

const MONTHLY_SKILLS = ['Cook', 'House cleaner', 'Caretaker', 'Babysitter', 'Gardener', 'Dairy worker', 'Security guard', 'Warehouse worker'];
const HOURLY_SKILLS = ['Driver', 'Delivery worker', 'Computer technician', 'Mobile repair technician', 'AC technician'];
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const COUPONS = {
  'SUMMER50': { discount: 50, type: 'percent', maxDiscount: 200, label: '50% off (max ₹200)' },
  'FIRST100': { discount: 100, type: 'flat', maxDiscount: 100, label: '₹100 off' },
  'CLEAN30': { discount: 30, type: 'percent', maxDiscount: 300, label: '30% off (max ₹300)' },
  'SAVE20': { discount: 20, type: 'percent', maxDiscount: 150, label: '20% off (max ₹150)' },
  'WELCOME': { discount: 75, type: 'flat', maxDiscount: 75, label: '₹75 off first order' },
};

const timeSlots = [
  { id: 'morning-1', label: '8:00 - 10:00 AM', period: 'Morning', icon: '🌅' },
  { id: 'morning-2', label: '10:00 - 12:00 PM', period: 'Morning', icon: '🌅' },
  { id: 'afternoon-1', label: '12:00 - 2:00 PM', period: 'Afternoon', icon: '☀️' },
  { id: 'afternoon-2', label: '2:00 - 4:00 PM', period: 'Afternoon', icon: '☀️' },
  { id: 'evening-1', label: '4:00 - 6:00 PM', period: 'Evening', icon: '🌆' },
  { id: 'evening-2', label: '6:00 - 8:00 PM', period: 'Evening', icon: '🌆' },
];

const formatCurrency = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;

const getDefaultBookingMode = (item) => {
  const skill = item?.skill || '';
  if (MONTHLY_SKILLS.includes(skill)) return 'MONTHLY';
  if (HOURLY_SKILLS.includes(skill)) return 'HOURLY';
  return 'DAILY';
};

const modeLabels = {
  DAILY: 'Daily Service',
  MONTHLY: 'Monthly Service',
  HOURLY: 'Hourly Booking',
  TOOL: 'Tool Rental',
};

const extractErrorMessage = (errData) => {
  const flatten = (value, prefix = '') => {
    if (!value) return [];
    if (typeof value === 'string') return [prefix ? `${prefix}: ${value}` : value];
    if (Array.isArray(value)) return value.flatMap((item, index) => flatten(item, prefix || (value.length > 1 ? `item ${index + 1}` : '')));
    if (typeof value === 'object') {
      return Object.entries(value).flatMap(([key, val]) => flatten(val, prefix ? `${prefix}.${key}` : key));
    }
    return [String(value)];
  };

  if (errData?.detail) return Array.isArray(errData.detail) ? errData.detail[0] : errData.detail;
  if (errData?.items?.[0]) return flatten(errData.items[0]).join(', ');
  if (errData?.user) return flatten(errData.user).join(', ');
  return flatten(errData).join(', ') || 'Booking failed';
};

const Checkout = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const directItem = location.state?.directItem || null;
  const bookingItems = directItem ? [directItem] : cartItems;
  const isDirectBooking = Boolean(directItem);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    hours: 8,
    startTime: '09:00',
    estimatedHours: 2,
    monthlyDurationMonths: 1,
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    hoursPerDay: 8,
    fulfillmentMode: 'SELF_PICKUP',
    deliveryAddress: '',
    address: user?.address || '',
    phone: user?.phone || user?.mobile || '',
    paymentMode: 'CASH',
    upiApp: '',
  });

  const hasWorker = bookingItems.some(item => item.type === 'WORKER');
  const isToolBooking = bookingItems.length > 0 && bookingItems.every(item => item.type === 'TOOL' || (item.category !== undefined && item.skill === undefined));
  const primaryWorker = bookingItems.find(item => item.type === 'WORKER') || bookingItems.find(item => item.skill);
  const suggestedMode = isToolBooking ? 'TOOL' : getDefaultBookingMode(primaryWorker);
  const [userSelectedMode, setUserSelectedMode] = useState(suggestedMode);
  const bookingMode = isToolBooking ? 'TOOL' : userSelectedMode;

  const days = (() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    }
    return 1;
  })();
  const rentalDays = days;
  const workingDaysPerMonth = formData.workingDays.length * 4;
  const toolDeliveryFee = isToolBooking && formData.fulfillmentMode === 'DELIVERY' ? TOOL_DELIVERY_FEE : 0;
  const toolSecurityDeposit = isToolBooking ? TOOL_SECURITY_DEPOSIT : 0;

  const calculateItemBase = (item) => {
    const price = Number(item.pricePerHour || item.pricePerDay || 0);
    if (isToolBooking) {
      const qty = Number(item.quantity || 1);
      return Number(item.pricePerDay || price) * qty * rentalDays;
    }
    if (item.type === 'WORKER') {
      if (bookingMode === 'MONTHLY') return price * formData.monthlyDurationMonths * workingDaysPerMonth * formData.hoursPerDay;
      if (bookingMode === 'HOURLY') return price * formData.estimatedHours;
      return price * 8 * days;
    }
    const qty = Number(item.quantity || 1);
    return price * qty * days;
  };

  const pricingData = bookingItems.map(item => {
    const base = calculateItemBase(item);
    return { ...item, base, total: base };
  });

  const rawBaseAmount = pricingData.reduce((acc, item) => acc + item.total, 0) + toolDeliveryFee + toolSecurityDeposit;
  const baseAmount = Math.max(rawBaseAmount, MIN_BOOKING_AMOUNT);
  const platformFee = Math.round(baseAmount * 0.05);
  const gst = Math.round(baseAmount * 0.18);
  
  // Calculate coupon discount
  let couponDiscount = 0;
  if (appliedCoupon) {
    const coupon = COUPONS[appliedCoupon];
    if (coupon.type === 'percent') {
      couponDiscount = Math.min(Math.round(baseAmount * coupon.discount / 100), coupon.maxDiscount);
    } else {
      couponDiscount = Math.min(coupon.discount, baseAmount);
    }
  }
  
  const totalAmount = baseAmount + platformFee + gst + CONVENIENCE_FEE - couponDiscount;
  const youSave = Math.round(baseAmount * 0.10) + couponDiscount;
  const minimumApplied = rawBaseAmount > 0 && rawBaseAmount < MIN_BOOKING_AMOUNT;

  const handleNextStep = () => {
    if (step === 1) {
      if (isToolBooking && (!formData.startDate || !formData.endDate)) {
        toast.info('Please select pickup and return dates');
        return;
      }
      if (!isToolBooking && bookingMode === 'DAILY' && (!formData.startDate || !formData.endDate)) {
        toast.info('Please select start and end dates');
        return;
      }
      if (!isToolBooking && bookingMode !== 'DAILY' && !formData.startDate) {
        toast.info('Please select a start date');
        return;
      }
      if (!isToolBooking && bookingMode === 'HOURLY' && !formData.startTime) {
        toast.info('Please select a start time');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (isToolBooking && formData.fulfillmentMode === 'DELIVERY' && (!formData.deliveryAddress || formData.deliveryAddress.length < 10)) {
        toast.info('Please enter a complete delivery address');
        return;
      }
      if (!isToolBooking && (!formData.address || formData.address.length < 10)) {
        toast.info('Please enter a complete delivery/service address');
        return;
      }
      if (!formData.phone || formData.phone.length < 10) {
        toast.info('Please enter a valid phone number');
        return;
      }
      setStep(3);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast.info('Please login to complete your booking');
      navigate('/login');
      return;
    }
    if (formData.paymentMode === 'ONLINE' && !formData.upiApp) {
      toast.info('Please select a UPI app to proceed');
      return;
    }

    setLoading(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const items = bookingItems.map(item => {
        const itemBookingMode = isToolBooking ? 'TOOL' : bookingMode;
        const payload = {
          date: formData.startDate,
          time: itemBookingMode === 'HOURLY' ? formData.startTime : (selectedSlot ? { 'morning-1': '08:00', 'morning-2': '10:00', 'afternoon-1': '12:00', 'afternoon-2': '14:00', 'evening-1': '16:00', 'evening-2': '18:00' }[selectedSlot.id] : '09:00'),
          address: isToolBooking ? (formData.fulfillmentMode === 'DELIVERY' ? formData.deliveryAddress : 'Self pickup at ServiceLink partner counter') : formData.address,
          total_price: Math.max(calculateItemBase(item), MIN_BOOKING_AMOUNT),
          booking_type: itemBookingMode.toLowerCase(),
          working_days: itemBookingMode === 'MONTHLY' ? formData.workingDays : [],
          hours_per_day: itemBookingMode === 'MONTHLY' ? formData.hoursPerDay : (itemBookingMode === 'DAILY' ? 8 : formData.estimatedHours),
          monthly_duration_months: itemBookingMode === 'MONTHLY' ? formData.monthlyDurationMonths : null,
        };
        if (isToolBooking) {
          payload.tool_id = item.id;
          payload.return_date = formData.endDate;
          payload.rental_days = rentalDays;
          payload.delivery_mode = formData.fulfillmentMode;
          payload.delivery_fee = toolDeliveryFee;
          payload.security_deposit = TOOL_SECURITY_DEPOSIT;
        } else if (item.type === 'WORKER') payload.worker_id = item.id;
        else payload.tool_id = item.id;
        return payload;
      });

      const res = await fetch(`${API_BASE}/bookings/bulk/`, {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(extractErrorMessage(errData));
      }

      if (!isDirectBooking) {
        clearCart();
        sessionStorage.removeItem('cart');
      }
      
      toast.success('Order Placed Successfully!');
      playSuccessPing();
      setSuccess(true);
      setTimeout(() => {
        navigate('/success');
      }, 2000);
    } catch (err) {
      toast.info(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (bookingItems.length === 0 && !success) {
    return (
      <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center max-w-md bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Your selection is empty</h2>
          <p className="text-slate-500 mt-2 mb-8">You haven't selected any service or tool to checkout.</p>
          <Link to="/services" className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all block">
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-between relative mb-12">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0" />
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500"
        style={{ width: `${((step - 1) / 2) * 100}%` }}
      />
      
      {[
        { num: 1, label: 'Schedule', icon: Calendar },
        { num: 2, label: 'Address', icon: MapPin },
        { num: 3, label: 'Payment', icon: CreditCard }
      ].map((s) => {
        const isActive = step >= s.num;
        const Icon = s.icon;
        return (
          <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 shadow-sm ${isActive ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-white text-gray-400 border-2 border-gray-200'}`}>
              {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider absolute -bottom-6 whitespace-nowrap ${isActive ? 'text-slate-900' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`min-h-screen pt-24 pb-16 px-4 transition-colors duration-1000 ${success ? 'bg-emerald-500' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto">
        <div className={`transition-all duration-700 ${success ? 'scale-95 opacity-0 pointer-events-none' : ''}`}>
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Secure Checkout</h1>
              <p className="text-sm font-semibold text-slate-500 mt-1">Complete your booking in 3 simple steps</p>
            </div>
            <ShieldCheck className="w-10 h-10 text-emerald-500 opacity-20" />
          </div>

          <StepIndicator />

          <div className="grid lg:grid-cols-[1fr_340px] gap-8 mt-12">
            
            {/* Left Column: Form Steps */}
            <div className="space-y-6">
              
              {/* Step 1: Schedule & Items */}
              {step === 1 && (
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 animate-slide-in-right">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" /> {isToolBooking ? 'Plan your rental' : 'When do you need this?'}
                  </h2>
                  {!isToolBooking && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Booking Type</p>
                      <div className="flex gap-2 flex-wrap">
                        {['DAILY', 'MONTHLY', 'HOURLY'].map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setUserSelectedMode(mode)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all duration-200 ${
                              bookingMode === mode
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                            }`}
                          >
                            {modeLabels[mode]}
                            {mode === suggestedMode && <span className="ml-1.5 text-[10px] opacity-70">★</span>}
                          </button>
                        ))}
                      </div>
                      {bookingMode !== suggestedMode && (
                        <p className="text-[11px] text-amber-600 mt-2 font-medium">★ Suggested: {modeLabels[suggestedMode]} for {primaryWorker?.skill}</p>
                      )}
                    </div>
                  )}
                  {isToolBooking && (
                    <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-black uppercase tracking-wider">
                      {modeLabels[bookingMode]}
                    </div>
                  )}
                  
                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{isToolBooking ? 'Pickup Date' : 'Start Date'}</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium"
                      />
                    </div>
                    {(isToolBooking || bookingMode === 'DAILY') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{isToolBooking ? 'Return Date' : 'End Date'}</label>
                      <input
                        type="date"
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium"
                      />
                    </div>
                    )}
                  </div>

                  {isToolBooking && (
                    <div className="mb-8 p-5 rounded-2xl bg-cyan-50 border border-cyan-100">
                      <p className="text-sm font-bold text-slate-900">Rental Duration</p>
                      <p className="text-xs text-slate-500 mt-1">{rentalDays} day{rentalDays === 1 ? '' : 's'} selected</p>
                    </div>
                  )}

                  {hasWorker && bookingMode === 'MONTHLY' && (
                    <div className="mb-8 p-5 rounded-2xl bg-blue-50 border border-blue-100 space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Monthly Duration</label>
                        <select
                          value={formData.monthlyDurationMonths}
                          onChange={(e) => setFormData({ ...formData, monthlyDurationMonths: Number(e.target.value) })}
                          className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        >
                          <option value={1}>1 Month</option>
                          <option value={2}>2 Months</option>
                          <option value={3}>3 Months</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-2">Working Days</p>
                        <div className="flex flex-wrap gap-2">
                          {WEEK_DAYS.map((day) => (
                            <label key={day} className={`px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer ${formData.workingDays.includes(day) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-blue-100'}`}>
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={formData.workingDays.includes(day)}
                                onChange={() => setFormData(prev => ({
                                  ...prev,
                                  workingDays: prev.workingDays.includes(day) ? prev.workingDays.filter(item => item !== day) : [...prev.workingDays, day],
                                }))}
                              />
                              {day}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Hours Per Day</label>
                        <select
                          value={formData.hoursPerDay}
                          onChange={(e) => setFormData({ ...formData, hoursPerDay: Number(e.target.value) })}
                          className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        >
                          <option value={2}>2 hr</option>
                          <option value={4}>4 hr</option>
                          <option value={8}>Full day</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {hasWorker && bookingMode === 'HOURLY' && (
                    <div className="mb-8 p-5 rounded-2xl bg-blue-50 border border-blue-100 grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Start Time</label>
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Estimated Hours: {formData.estimatedHours}</label>
                        <input
                          type="range"
                          min="1"
                          max="8"
                          value={formData.estimatedHours}
                          onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                          className="w-full accent-blue-600"
                        />
                      </div>
                    </div>
                  )}

                  {hasWorker && bookingMode === 'DAILY' && (
                    <div className="mb-8 p-5 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-4">
                      <div className="bg-white p-2 rounded-xl shadow-sm text-blue-600"><Clock className="w-5 h-5" /></div>
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-slate-900 mb-1">Daily Working Hours</label>
                        <p className="text-xs text-slate-500 leading-relaxed">Daily bookings are calculated as 8 working hours per selected day.</p>
                      </div>
                    </div>
                  )}

                  {/* Time Slot Picker */}
                  {!isToolBooking && bookingMode !== 'HOURLY' && <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Preferred Time Slot
                    </h3>
                    {['Morning', 'Afternoon', 'Evening'].map((period) => (
                      <div key={period} className="mb-5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{period} {period === 'Morning' ? '🌅' : period === 'Afternoon' ? '☀️' : '🌆'}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {timeSlots.filter(s => s.period === period).map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot)}
                              className={`px-4 py-3 rounded-xl border-2 transition-all text-center ${
                                selectedSlot?.id === slot.id
                                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                                  : 'border-gray-200 hover:border-blue-300 bg-white'
                              }`}
                            >
                              <p className="text-xs font-bold text-slate-900">{slot.label}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>}

                  <h3 className="text-sm font-bold text-slate-900 mb-4 border-b border-gray-100 pb-2">Order Summary ({bookingItems.length} items)</h3>
                  <div className="space-y-4">
                    {pricingData.map((item) => (
                      <div key={item.cartId || `${item.type}-${item.id}`} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900">{item.name}</h4>
                          <p className="text-xs font-semibold text-slate-500">{item.type === 'WORKER' ? item.skill : item.category}</p>
                          <p className="text-sm font-bold text-emerald-600 mt-1">{formatCurrency(item.total)}</p>
                        </div>
                        {!isDirectBooking && (
                          <button onClick={() => removeFromCart(item.cartId)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button onClick={handleNextStep} className="w-full mt-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                    Continue to Address <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Step 2: Address */}
              {step === 2 && (
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 animate-slide-in-right">
                  <button onClick={() => setStep(1)} className="mb-6 flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Schedule
                  </button>
                  
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-500" /> {isToolBooking ? 'Pickup or Delivery' : 'Service Address'}
                  </h2>

                  {isToolBooking ? (
                    <div className="mb-8 space-y-5">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'SELF_PICKUP', label: 'Self Pickup' },
                          { value: 'DELIVERY', label: 'Delivery (₹50 flat)' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, fulfillmentMode: option.value })}
                            className={`py-3 rounded-xl text-sm font-bold border transition-all ${formData.fulfillmentMode === option.value ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      {formData.fulfillmentMode === 'DELIVERY' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Delivery Address</label>
                          <textarea
                            rows="4"
                            placeholder="Enter delivery address and landmark..."
                            value={formData.deliveryAddress}
                            onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-medium resize-none"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                  <>
                  <div className="mb-8">
                    <p className="text-sm font-bold text-slate-900 mb-4">Or choose a saved address:</p>
                    <AddressManager onSelect={(addr) => {
                      setFormData(prev => ({
                        ...prev,
                        address: addr.address + ', ' + addr.city + ' - ' + addr.pincode,
                        phone: formData.phone || user?.phone || '',
                      }));
                    }} />
                  </div>

                  <div className="relative mb-6 pt-4 border-t border-gray-200">
                    <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Or enter a different address</div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Address & Landmark</label>
                      <textarea
                        rows="4"
                        placeholder="e.g. 12th Floor, Block A, Prestige Towers..."
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-medium resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Number</label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>
                  </>
                  )}

                  {isToolBooking && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Number</label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-medium"
                      />
                    </div>
                  )}

                  <button onClick={handleNextStep} className="w-full mt-8 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                    Continue to Payment <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 animate-slide-in-right">
                  <button onClick={() => setStep(2)} className="mb-6 flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Address
                  </button>
                  
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-500" /> Select Payment Method
                  </h2>

                  {/* Coupon Section */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-slate-900 mb-3">Apply Coupon Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        placeholder="Enter coupon code"
                        className={`flex-1 px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent font-medium transition-all ${
                          couponError ? 'border-red-300 focus:ring-red-500/50 animate-shake' : 'border-slate-200 focus:ring-indigo-500/50'
                        }`}
                      />
                      <button
                        onClick={() => {
                          const upperCode = couponCode.toUpperCase();
                          if (COUPONS[upperCode]) {
                            setAppliedCoupon(upperCode);
                            setCouponError('');
                            toast.success(`Coupon ${upperCode} applied!`);
                          } else {
                            setCouponError('Invalid coupon code');
                          }
                        }}
                        className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-600 mt-2 font-semibold">{couponError}</p>}
                  </div>

                  {appliedCoupon && (
                    <div className="mb-8 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-between">
                      <p className="text-sm font-bold text-green-700">✅ {appliedCoupon} applied — You save {formatCurrency(couponDiscount)}</p>
                      <button
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode('');
                        }}
                        className="text-green-600 hover:text-green-700 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div className="space-y-3 mb-8">
                    <label 
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMode === 'CASH' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                      onClick={() => setFormData({ ...formData, paymentMode: 'CASH', upiApp: '' })}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMode === 'CASH' ? 'border-indigo-600' : 'border-gray-300'}`}>
                          {formData.paymentMode === 'CASH' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                        </div>
                        <span className="font-bold text-slate-900">Pay after service (Cash)</span>
                      </div>
                    </label>

                    <label 
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMode === 'ONLINE' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                      onClick={() => setFormData({ ...formData, paymentMode: 'ONLINE' })}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMode === 'ONLINE' ? 'border-indigo-600' : 'border-gray-300'}`}>
                          {formData.paymentMode === 'ONLINE' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                        </div>
                        <span className="font-bold text-slate-900">Pay Now (UPI)</span>
                      </div>
                      <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-2 py-1 rounded">FAST</span>
                    </label>
                  </div>

                  {formData.paymentMode === 'ONLINE' && (
                    <div className="animate-reveal bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Choose your app</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'phonepe', name: 'PhonePe', icon: phonepeIcon },
                          { id: 'gpay', name: 'GPay', icon: gpayIcon },
                          { id: 'paytm', name: 'Paytm', icon: paytmIcon },
                          { id: 'amazonpay', name: 'Amazon Pay', icon: amazonpayIcon },
                        ].map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, upiApp: app.id })}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${formData.upiApp === app.id ? 'border-indigo-600 bg-white shadow-sm' : 'border-transparent bg-white hover:border-indigo-200'}`}
                          >
                            <img src={app.icon} alt={app.name} className="w-6 h-6 object-contain" />
                            <span className="text-sm font-bold text-slate-700">{app.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleBooking}
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ${formatCurrency(totalAmount)}`}
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-4 font-semibold flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Secure, encrypted transaction
                  </p>
                </div>
              )}

            </div>

            {/* Right Column: Price Summary Sticky */}
            <div className="relative">
              <div className="sticky top-24 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-slate-900 text-lg mb-5">Price Details</h3>
                <div className="mb-5 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{modeLabels[bookingMode]}</p>
                  {isToolBooking ? (
                    <p className="text-sm font-bold text-slate-900">Daily rate × {rentalDays} day{rentalDays === 1 ? '' : 's'} = {formatCurrency(pricingData.reduce((acc, item) => acc + item.total, 0))}</p>
                  ) : bookingMode === 'MONTHLY' ? (
                    <p className="text-sm font-bold text-slate-900">Rate × {formData.monthlyDurationMonths} month{formData.monthlyDurationMonths === 1 ? '' : 's'} × {workingDaysPerMonth} days × {formData.hoursPerDay} hr = {formatCurrency(pricingData.reduce((acc, item) => acc + item.total, 0))}</p>
                  ) : bookingMode === 'HOURLY' ? (
                    <p className="text-sm font-bold text-slate-900">Rate × {formData.estimatedHours} hr = {formatCurrency(pricingData.reduce((acc, item) => acc + item.total, 0))}</p>
                  ) : (
                    <p className="text-sm font-bold text-slate-900">Rate × {days} day{days === 1 ? '' : 's'} × 8 hr = {formatCurrency(pricingData.reduce((acc, item) => acc + item.total, 0))}</p>
                  )}
                </div>
                
                <div className="space-y-4 text-sm font-medium">
                  <div className="flex justify-between text-slate-500">
                    <span>Base Amount</span>
                    <span className="text-slate-900">{formatCurrency(baseAmount)}</span>
                  </div>
                  {isToolBooking && (
                    <>
                      <div className="flex justify-between text-slate-500">
                        <span>Delivery Fee</span>
                        <span className="text-slate-900">{formatCurrency(toolDeliveryFee)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Security Deposit <span className="text-[10px] bg-slate-100 px-1 rounded">refundable</span></span>
                        <span className="text-slate-900">{formatCurrency(toolSecurityDeposit)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>Platform Fee <span className="text-[10px] bg-slate-100 px-1 rounded">(5%)</span></span>
                    <span className="text-slate-900">{formatCurrency(platformFee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST <span className="text-[10px] bg-slate-100 px-1 rounded">(18%)</span></span>
                    <span className="text-slate-900">{formatCurrency(gst)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Convenience Fee</span>
                    <span className="text-slate-900">{formatCurrency(CONVENIENCE_FEE)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Coupon Discount</span>
                      <span>-{formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                </div>

                <div className="my-5 border-t border-dashed border-gray-200" />
                
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-xs">Total Amount</span>
                  <span className="text-2xl font-black text-slate-900">{formatCurrency(totalAmount)}</span>
                </div>
                
                <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-3 rounded-xl border border-emerald-100 text-center">
                  You will save {formatCurrency(youSave)} on this booking!
                </div>

                {minimumApplied && (
                  <p className="mt-4 text-[10px] font-bold text-amber-600 bg-amber-50 p-2 rounded-lg text-center">
                    Minimum order value of {formatCurrency(MIN_BOOKING_AMOUNT)} applied.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Success Overlay */}
        {success && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-emerald-600/20 backdrop-blur-xl p-12 rounded-full animate-ping">
              <CheckCircle2 className="w-24 h-24 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
