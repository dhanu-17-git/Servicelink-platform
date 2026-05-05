import { useState } from 'react';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import { locations, skillCategories } from '../data/dummyData';

const SearchBar = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch({ location, category, query });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-card border border-gray-100 p-2 flex flex-col md:flex-row gap-2"
    >
      {/* Search Input */}
      <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50">
        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search workers or tools..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent text-sm text-heading placeholder-gray-400 focus:outline-none"
        />
      </div>

      {/* Location Dropdown */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 md:border-l md:border-gray-200 md:rounded-l-none md:bg-transparent">
        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-transparent text-sm text-heading focus:outline-none cursor-pointer appearance-none"
        >
          <option value="">Location</option>
          {locations.filter(l => l !== 'All Locations').map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>

      {/* Category Dropdown */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 md:border-l md:border-gray-200 md:rounded-l-none md:bg-transparent">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-transparent text-sm text-heading focus:outline-none cursor-pointer appearance-none"
        >
          <option value="">Category</option>
          {skillCategories.filter(c => c !== 'All Categories').map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className="px-8 py-3 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
      >
        <Search className="w-4 h-4" />
        Search
      </button>
    </form>
  );
};

export default SearchBar;
