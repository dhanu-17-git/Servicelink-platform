import { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, X, Search, Loader2, AlertCircle, MapPin } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import Reveal from '../components/Reveal';
import { CardSkeleton } from '../components/Skeleton';
import { locations } from '../data/dummyData';
import { API_BASE } from '../api/config';
import { useToast } from '../context/ToastContext';

const FilterPanel = ({ search, setSearch, location, setLocation, category, setCategory, priceRange, setPriceRange, toolCategories, detectingLocation, detectedLocation, onDetectLocation, onReset }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-semibold text-heading mb-2">Search</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search tools..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7FFFD4]/50 focus:border-transparent" />
      </div>
    </div>
    <div>
      <label className="block text-sm font-semibold text-heading mb-2">Location</label>
      <button
        type="button"
        onClick={onDetectLocation}
        disabled={detectingLocation}
        className="mb-2 w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 bg-white text-heading border border-gray-200 hover:bg-gray-50 disabled:opacity-70"
      >
        {detectingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4 text-[#006060]" />}
        {detectingLocation ? 'Detecting...' : 'Use My Location'}
      </button>
      {detectedLocation && (
        <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold">
          <MapPin className="w-3.5 h-3.5" />
          Detected: {detectedLocation}
        </div>
      )}
      <select value={location} onChange={(e) => setLocation(e.target.value)}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7FFFD4]/50 focus:border-transparent">
        {locations.map((l) => <option key={l} value={l}>{l}</option>)}
      </select>
    </div>
    <div>
      <label className="block text-sm font-semibold text-heading mb-2">Category</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7FFFD4]/50 focus:border-transparent">
        {toolCategories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
    <div>
      <label className="block text-sm font-semibold text-heading mb-2">
        Max Price: <span className="text-[#006060]">₹{priceRange}/day</span>
      </label>
      <input type="range" min="20" max="10000" step="100" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))}
        className="w-full accent-[#006060]" />
      <div className="flex justify-between text-xs text-muted mt-1">
        <span>₹20</span><span>₹10,000</span>
      </div>
    </div>
    <button onClick={onReset}
      className="w-full px-4 py-2 text-sm font-medium text-muted border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
      Reset Filters
    </button>
  </div>
);

const Tools = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('All Locations');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState(() => localStorage.getItem('sl_detected_location') || '');
  const [category, setCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(10000);
  const [showFilters, setShowFilters] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const savedLocation = localStorage.getItem('sl_detected_location');
    if (savedLocation && locations.includes(savedLocation)) {
      setLocation(savedLocation);
      setDetectedLocation(savedLocation);
    }
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.info('Location detection is not supported in this browser');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`, {
            headers: { 'User-Agent': 'ServiceLink/1.0' },
          });
          if (!res.ok) throw new Error('Location lookup failed');
          const data = await res.json();
          const addressParts = Object.values(data.address || {}).map(value => String(value).toLowerCase());
          const matched = locations.find((item) => (
            item !== 'All Locations' && addressParts.some(part => part.includes(item.toLowerCase()) || item.toLowerCase().includes(part))
          ));

          if (matched) {
            setLocation(matched);
            setDetectedLocation(matched);
            localStorage.setItem('sl_detected_location', matched);
            toast.success(`Detected: ${matched}`);
          } else {
            setDetectedLocation('');
            localStorage.removeItem('sl_detected_location');
            toast.info('Location not in service area');
          }
        } catch (err) {
          toast.info('Could not detect your location');
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        toast.info('Location permission was not granted');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const resetFilters = () => {
    setLocation('All Locations');
    setCategory('All');
    setPriceRange(10000);
    setSearch('');
    setDetectedLocation('');
    localStorage.removeItem('sl_detected_location');
  };

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const res = await fetch(`${API_BASE}/tools/`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        // Django returns a list (or paginated { results: [...] })
        const toolList = Array.isArray(data) ? data : data.results || [];

        // Map Django snake_case fields to camelCase for ToolCard compatibility
        const formatted = toolList.map(t => ({
          id: t.id,
          name: t.name,
          category: t.category,
          description: t.description,
          pricePerDay: t.price_per_day,
          available: t.availability,
          image: t.image_url || `https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400`,
          stock: t.stock || 10,
          brand: t.brand || 'Standard',
          condition: t.condition || 'Excellent',
        }));
        setTools(formatted);
      } catch (err) {
        setError('Failed to fetch tools');
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  const toolCategories = useMemo(() => ['All', ...new Set(tools.map((t) => t.category))], [tools]);

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (location !== 'All Locations' && t.location && t.location !== location) return false;
      if (category !== 'All' && t.category !== category) return false;
      if (t.pricePerDay > priceRange) return false;
      return true;
    });
  }, [tools, search, location, category, priceRange]);

  if (loading) return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-[radial-gradient(circle_at_top_right,_rgba(20,184,166,0.10),_transparent_30%),#fff]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-9 w-44 bg-gray-100 rounded-full animate-pulse mb-3" />
          <div className="h-4 w-80 bg-gray-100 rounded-full animate-pulse" />
        </div>
        <div className="flex gap-8">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <CardSkeleton image={false} />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(item => <CardSkeleton key={item} />)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-heading">Rent Tools</h1>
          <p className="text-muted mt-1">Professional equipment at affordable rates</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        <button onClick={() => setShowFilters(true)}
          className="lg:hidden mb-6 flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-heading hover:bg-gray-50 transition-colors">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>

        <div className="flex gap-8">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h3 className="font-semibold text-heading mb-4">Filters</h3>
              <FilterPanel 
                search={search} setSearch={setSearch}
                location={location} setLocation={setLocation}
                category={category} setCategory={setCategory}
                priceRange={priceRange} setPriceRange={setPriceRange}
                toolCategories={toolCategories}
                detectingLocation={detectingLocation}
                detectedLocation={detectedLocation}
                onDetectLocation={detectLocation}
                onReset={resetFilters}
              />
            </div>
          </div>

          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/30" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 shadow-xl animate-slide-in-left">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-heading">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
                </div>
                <FilterPanel 
                  search={search} setSearch={setSearch}
                  location={location} setLocation={setLocation}
                  category={category} setCategory={setCategory}
                  priceRange={priceRange} setPriceRange={setPriceRange}
                  toolCategories={toolCategories}
                  detectingLocation={detectingLocation}
                  detectedLocation={detectedLocation}
                  onDetectLocation={detectLocation}
                  onReset={resetFilters}
                />
              </div>
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-6">
              {toolCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 ${
                    category === cat
                      ? 'bg-[#7FFFD4] text-[#006060] border-[#7FFFD4] shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#7FFFD4]/50 hover:text-[#006060]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <p className="text-sm text-muted mb-4">{filtered.length} tools found</p>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((tool) => (
                  <Reveal key={tool.id}>
                    <ToolCard tool={tool} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <p className="text-muted">No tools match your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;
