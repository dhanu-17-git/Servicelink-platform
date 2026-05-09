import { useState, useEffect } from 'react';
import { Trash2, Edit2, MapPin, Home, Briefcase } from 'lucide-react';

const AddressManager = ({ onSelect }) => {
  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem('sl_addresses');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, type: 'Home', icon: '🏠', address: 'Flat 203, Lake View Apartments', city: 'Mysuru', pincode: '570001', isDefault: true },
      { id: 2, type: 'Work', icon: '🏢', address: '4th Floor, Tech Park, Ring Road', city: 'Mysuru', pincode: '570009', isDefault: false },
    ];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Home',
    address: '',
    city: '',
    pincode: '',
  });

  useEffect(() => {
    localStorage.setItem('sl_addresses', JSON.stringify(addresses));
  }, [addresses]);

  const handleAddOrUpdate = () => {
    if (!formData.address.trim() || !formData.city.trim() || !formData.pincode.trim()) {
      return;
    }

    if (editingId) {
      setAddresses(prev =>
        prev.map(a =>
          a.id === editingId
            ? { ...a, type: formData.type, address: formData.address, city: formData.city, pincode: formData.pincode }
            : a
        )
      );
      setEditingId(null);
    } else {
      setAddresses(prev => [
        ...prev,
        {
          id: Date.now(),
          type: formData.type,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          isDefault: false,
        },
      ]);
    }

    setFormData({ type: 'Home', address: '', city: '', pincode: '' });
    setShowForm(false);
  };

  const handleEdit = (address) => {
    setFormData({ type: address.type, address: address.address, city: address.city, pincode: address.pincode });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const handleSetDefault = (id) => {
    setAddresses(prev =>
      prev.map(a => ({ ...a, isDefault: a.id === id }))
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Home':
        return '🏠';
      case 'Work':
        return '🏢';
      default:
        return '📍';
    }
  };

  return (
    <div className="space-y-4">
      {addresses.map((addr) => (
        <div
          key={addr.id}
          className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 hover:shadow-md transition-all"
          onClick={() => onSelect && onSelect(addr)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 cursor-pointer">
              <div className="text-2xl mt-1">{getTypeIcon(addr.type)}</div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{addr.type}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{addr.address}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{addr.city} - {addr.pincode}</p>
                {addr.isDefault && (
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded">Default</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(addr);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(addr.id);
                }}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          {!addr.isDefault && onSelect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSetDefault(addr.id);
              }}
              className="mt-3 w-full px-3 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              Set as Default
            </button>
          )}

          {onSelect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(addr);
              }}
              className="mt-3 w-full px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
            >
              Use This Address
            </button>
          )}
        </div>
      ))}

      {showForm && (
        <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h4>
          <div className="space-y-3">
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>

            <textarea
              placeholder="Full address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              rows="2"
            />

            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />

            <input
              type="text"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />

            <div className="flex gap-2">
              <button
                onClick={handleAddOrUpdate}
                className="flex-1 px-3 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ type: 'Home', address: '', city: '', pincode: '' });
                }}
                className="flex-1 px-3 py-2 bg-gray-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          + Add New Address
        </button>
      )}
    </div>
  );
};

export default AddressManager;
