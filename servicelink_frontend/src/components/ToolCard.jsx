import { useState } from 'react';
import { CheckCircle, Loader2, Minus, Package, Plus, ShoppingCart, Tag, XCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const ToolCard = ({ tool }) => {
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const toast = useToast();
  const [loading] = useState(false);

  const maxQty = tool.stock || 0;
  const canRent = tool.available && maxQty > 0;

  const increment = () => setQty((q) => Math.min(q + 1, maxQty));
  const decrement = () => setQty((q) => Math.max(q - 1, 1));

  const handleAddToCart = () => {
    const added = addToCart({ ...tool, quantity: qty }, 'TOOL');
    if (added) {
      toast.success(`${tool.name} added to your cart`);
    } else {
      toast.info(`${tool.name} is already in your cart`);
    }
  };

  const handleBookNow = () => {
    navigate('/checkout', {
      state: {
        directItem: { ...tool, quantity: qty, type: 'TOOL', cartId: `direct-tool-${tool.id}` },
      },
    });
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-2xl hover:shadow-cyan-900/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img src={tool.image} alt={tool.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <span className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${tool.available ? 'bg-emerald-50/90 text-emerald-700 backdrop-blur-sm' : 'bg-red-50/90 text-red-600 backdrop-blur-sm'}`}>
          {tool.available ? <><CheckCircle className="w-3 h-3" />Available</> : <><XCircle className="w-3 h-3" />Rented Out</>}
        </span>
        <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold text-heading rounded-lg flex items-center gap-1">
          <Tag className="w-3 h-3" />{tool.category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-heading text-base group-hover:text-[#008B8B] transition-colors">{tool.name}</h3>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-muted px-2 py-0.5 bg-gray-50 rounded-md">{tool.brand}</span>
          <span className="text-xs text-muted px-2 py-0.5 bg-gray-50 rounded-md">{tool.condition}</span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Package className="w-3.5 h-3.5" />
            <span>{maxQty > 0 ? `${maxQty} in stock` : 'Out of stock'}</span>
          </div>
          {canRent && (
            <div className="flex items-center gap-1">
              <button
                onClick={decrement}
                disabled={qty <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-heading">{qty}</span>
              <button
                onClick={increment}
                disabled={qty >= maxQty}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="px-5 py-4 border-t border-gray-50 bg-gray-50/50">
        <div>
          <span className="text-lg font-bold text-heading">₹{tool.pricePerDay * qty}</span>
          <span className="text-xs text-muted">/day{qty > 1 ? ` (x${qty})` : ''}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={handleAddToCart}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${canRent && !loading ? 'bg-white text-[#006060] border border-[#7FFFD4] hover:bg-[#F0FFFA]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            disabled={!canRent || loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShoppingCart className="w-4 h-4" /> Add</>}
          </button>
          <button
            onClick={handleBookNow}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${canRent && !loading ? 'bg-gradient-to-r from-primary-600 to-blue-500 text-white hover:shadow-lg hover:-translate-y-0.5' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            disabled={!canRent || loading}
          >
            <Zap className="w-4 h-4" />
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolCard;
