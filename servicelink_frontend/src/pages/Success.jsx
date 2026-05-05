import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, LayoutDashboard } from 'lucide-react';

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center bg-gray-50/50">
      <div className="bg-white p-12 rounded-[2rem] border border-gray-100 shadow-xl max-w-xl w-full text-center">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-heading mb-4">Booking Confirmed!</h1>
        <p className="text-muted text-lg mb-10 leading-relaxed">
          Your request has been sent successfully. The workers and tool owners will review your booking and update you shortly.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-[#D2691E] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <LayoutDashboard className="w-5 h-5" /> Track Bookings
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-100 text-heading font-bold rounded-2xl hover:bg-gray-50 transition-all"
          >
            Go Home <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
