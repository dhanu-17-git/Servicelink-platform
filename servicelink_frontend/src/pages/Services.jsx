import { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, X, Loader2, AlertCircle, Heart } from 'lucide-react';
import WorkerCard from '../components/WorkerCard';
import Reveal from '../components/Reveal';
import { CardSkeleton } from '../components/Skeleton';
import { locations } from '../data/dummyData';
import { API_BASE } from '../api/config';
import { useFavourites } from '../context/FavouritesContext';

// Hierarchical mapping of services
const serviceHierarchy = {
  "Electrician & Appliances": ["Electrician", "AC technician", "Refrigerator technician", "Washing machine technician", "Mobile repair technician", "Computer technician", "Sound/Light Technician"],
  "Construction & Repair": ["Mason", "Carpenter", "Plumber", "Welder", "Painter", "Tile worker", "Roofer", "Concrete Worker"],
  "Home & Care": ["House cleaner", "Cook", "Babysitter", "Caretaker", "Gardener", "Pest control worker"],
  "Transport & Moving": ["Driver", "Delivery worker", "Loader / Unloader", "House shifting worker", "Mover"],
  "Agriculture & Outdoor": ["Farm worker", "Tractor operator", "Harvester operator", "Irrigation worker", "Pesticide sprayer", "Dairy worker"],
  "Industrial & Events": ["Factory worker", "Machine operator", "Warehouse worker", "Security guard", "Event setup worker", "Decorator", "Packaging Worker"]
};

const Services = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { favourites } = useFavourites();
  
  // Filters
  const [location, setLocation] = useState('All Locations');
  const [mainCategory, setMainCategory] = useState('All Categories');
  const [subCategory, setSubCategory] = useState('All Types');
  const [priceRange, setPriceRange] = useState(1000);
  const [showFilters, setShowFilters] = useState(false);
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await fetch(`${API_BASE}/workers/`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        const workerList = Array.isArray(data) ? data : data.results || [];

        const formatted = workerList.map(w => ({
          id: w.id,
          name: w.name || w.user?.name,
          skill: w.skill,
          rating: w.rating || 4.5,
          reviews: w.reviews || Math.floor(Math.random() * 100),
          pricePerHour: w.price_per_hour,
          location: w.city || w.user?.city,
          experience: w.experience || '5 years',
          available: w.availability,
          completedJobs: w.completedJobs || Math.floor(Math.random() * 200),
          image: w.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name || w.user?.name || 'W')}&background=random`,
        }));
        setWorkers(formatted);
      } catch (err) {
        setError('Failed to fetch workers');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  // Update subcategory to 'All Types' whenever main category changes
  const handleMainCategoryChange = (e) => {
    setMainCategory(e.target.value);
    setSubCategory('All Types');
  };

  const filtered = useMemo(() => {
    return workers.filter((w) => {
      // Favourites Filter
      if (showFavouritesOnly && !favourites.includes(w.id)) return false;

      // Location Filter
      if (location !== 'All Locations' && w.location !== location) return false;
      
      // Price Filter
      if (w.pricePerHour > priceRange) return false;

      // Category / SubCategory Filter
      if (mainCategory !== 'All Categories') {
        const validSkills = serviceHierarchy[mainCategory] || [];
        
        // If subcategory is specifically selected
        if (subCategory !== 'All Types') {
          // Normal case-insensitive comparison
          if (w.skill?.toLowerCase() !== subCategory.toLowerCase()) return false;
        } else {
          // If 'All Types', it must be one of the skills in the main category
          const matchesCategory = validSkills.some(skill => skill.toLowerCase() === w.skill?.toLowerCase());
          if (!matchesCategory) return false;
        }
      }

      return true;
    });
  }, [workers, location, mainCategory, subCategory, priceRange, showFavouritesOnly, favourites]);

  const FilterPanel = () => {
    const availableSubCategories = mainCategory !== 'All Categories' ? serviceHierarchy[mainCategory] : [];

    return (
      <div className="space-y-6">
        <div>
          <button 
            onClick={() => setShowFavouritesOnly(!showFavouritesOnly)}
            className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              showFavouritesOnly 
                ? 'bg-red-50 text-red-600 border border-red-200' 
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${showFavouritesOnly ? 'fill-red-600' : ''}`} />
            Show Favourites Only ({favourites.length})
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-heading mb-2">Location</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D2691E]/50 focus:border-transparent">
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-heading mb-2">Main Category</label>
          <select value={mainCategory} onChange={handleMainCategoryChange}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D2691E]/50 focus:border-transparent">
            <option value="All Categories">All Categories</option>
            {Object.keys(serviceHierarchy).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {mainCategory !== 'All Categories' && (
          <div className="animate-fade-in">
            <label className="block text-sm font-semibold text-heading mb-2">Specific Service Type</label>
            <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#FFF5EB] border border-[#f97316]/20 rounded-xl text-sm font-medium text-[#D2691E] focus:outline-none focus:ring-2 focus:ring-[#D2691E]/50 focus:border-transparent">
              <option value="All Types">All Types in {mainCategory.split(' ')[0]}</option>
              {availableSubCategories.map((type) => <option key={type} value={type} className="text-slate-900">{type}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-heading mb-2">
            Max Price: <span className="text-[#D2691E]">₹{priceRange}/hr</span>
          </label>
          <input type="range" min="100" max="1000" step="50" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full accent-[#D2691E]" />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>₹100</span><span>₹1000</span>
          </div>
        </div>
        
        <button onClick={() => { setLocation('All Locations'); setMainCategory('All Categories'); setSubCategory('All Types'); setPriceRange(1000); setShowFavouritesOnly(false); }}
          className="w-full px-4 py-2 text-sm font-medium text-muted border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          Reset Filters
        </button>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-[radial-gradient(circle_at_top_right,_rgba(210,105,30,0.10),_transparent_30%),#fff]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-9 w-56 bg-gray-100 rounded-full animate-pulse mb-3" />
          <div className="h-4 w-80 bg-gray-100 rounded-full animate-pulse" />
        </div>
        <div className="flex gap-8">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <CardSkeleton image={false} />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(item => <CardSkeleton key={item} image={false} />)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-heading">Hire Workers</h1>
          <p className="text-muted mt-1">Find skilled professionals for your project</p>
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

        <div className="flex gap-8 items-start">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h3 className="font-semibold text-heading mb-4">Filters</h3>
              <FilterPanel />
            </div>
          </div>

          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/30" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 shadow-xl animate-slide-in-left overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-heading">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted">{filtered.length} workers found</p>
              {mainCategory !== 'All Categories' && (
                <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-100">
                  {subCategory !== 'All Types' ? subCategory : `${mainCategory} Area`}
                </span>
              )}
            </div>
            
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((w) => (
                  <Reveal key={w.id}>
                    <WorkerCard worker={w} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-heading">No workers found</h3>
                <p className="text-muted mt-2">Try adjusting your category or price filters.</p>
                <button onClick={() => { setLocation('All Locations'); setMainCategory('All Categories'); setSubCategory('All Types'); setPriceRange(1000); setShowFavouritesOnly(false); }} 
                        className="mt-6 px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
