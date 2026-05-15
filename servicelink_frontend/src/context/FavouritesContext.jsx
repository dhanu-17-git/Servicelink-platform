import { createContext, useContext, useState, useEffect } from 'react';

const FavouritesContext = createContext();

export const FavouritesProvider = ({ children }) => {
  const [favourites, setFavourites] = useState(() => {
    const saved = localStorage.getItem('sl_favourites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sl_favourites', JSON.stringify(favourites));
  }, [favourites]);

  const toggleFavourite = (workerId) => {
    const idStr = String(workerId);
    setFavourites(prev =>
      prev.includes(idStr)
        ? prev.filter(id => id !== idStr)
        : [...prev, idStr]
    );
  };

  const isFavourite = (workerId) => favourites.includes(String(workerId));

  return (
    <FavouritesContext.Provider value={{ favourites, toggleFavourite, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => useContext(FavouritesContext);
