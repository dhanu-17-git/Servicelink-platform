import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { workers, tools } from '../data/dummyData';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('sl_recent_searches');
    return saved ? JSON.parse(saved) : [];
  });
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const filterResults = () => {
    if (!query.trim()) return { workers: [], tools: [] };

    const q = query.toLowerCase();
    const matchedWorkers = workers.filter(w =>
      w.name.toLowerCase().includes(q) ||
      w.skill.toLowerCase().includes(q) ||
      w.location.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedTools = tools.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.brand.toLowerCase().includes(q)
    ).slice(0, 5);

    return { workers: matchedWorkers, tools: matchedTools };
  };

  const handleSearch = (text) => {
    setQuery(text);
    setHighlightedIndex(0);
  };

  const handleSelect = (type, id) => {
    if (query.trim()) {
      const newSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      localStorage.setItem('sl_recent_searches', JSON.stringify(newSearches));
      setRecentSearches(newSearches);
    }

    if (type === 'worker') {
      navigate(`/workers/${id}`);
    } else if (type === 'tools') {
      navigate('/tools');
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    const { workers: w, tools: t } = filterResults();
    const total = w.length + t.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % (total || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + (total || 1)) % (total || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (total > 0) {
        const item = getHighlightedItem();
        if (item) handleSelect(item.type, item.id);
      }
    }
  };

  const getHighlightedItem = () => {
    const { workers: w, tools: t } = filterResults();
    if (highlightedIndex < w.length) {
      return { type: 'worker', id: w[highlightedIndex].id };
    }
    const toolIndex = highlightedIndex - w.length;
    if (toolIndex < t.length) {
      return { type: 'tools', id: t[toolIndex].id };
    }
    return null;
  };

  if (!isOpen) return null;

  const { workers: resultWorkers, tools: resultTools } = filterResults();
  const showRecent = !query.trim() && recentSearches.length > 0;

  return (
    <div onClick={onClose} className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-2xl w-full mx-4 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search workers, tools, services..."
            className="flex-1 bg-transparent text-lg text-slate-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {!query.trim() ? (
            showRecent && (
              <div className="px-6 py-4">
                <p className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-3">RECENT</p>
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(search)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )
          ) : resultWorkers.length === 0 && resultTools.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-slate-400">No results found for "{query}"</p>
            </div>
          ) : (
            <>
              {resultWorkers.length > 0 && (
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-3">WORKERS</p>
                  {resultWorkers.map((worker, idx) => (
                    <button
                      key={worker.id}
                      onClick={() => handleSelect('worker', worker.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors mb-2 last:mb-0 flex items-center gap-3 ${
                        highlightedIndex === idx
                          ? 'bg-primary-100 dark:bg-primary-900/30'
                          : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <img src={worker.image} alt={worker.name} className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{worker.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{worker.skill} • {worker.location}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-700 dark:text-slate-300">₹{worker.pricePerHour}/hr</p>
                    </button>
                  ))}
                </div>
              )}

              {resultTools.length > 0 && (
                <div className="px-6 py-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-3">TOOLS</p>
                  {resultTools.map((tool, idx) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelect('tools', tool.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors mb-2 last:mb-0 flex items-center gap-3 ${
                        highlightedIndex === resultWorkers.length + idx
                          ? 'bg-primary-100 dark:bg-primary-900/30'
                          : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <img src={tool.image} alt={tool.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tool.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{tool.category} • {tool.brand}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-700 dark:text-slate-300">₹{tool.pricePerDay}/day</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-[10px] text-gray-500 dark:text-slate-400 text-center">
          ↑↓ to navigate · Enter to select · Esc to close
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
