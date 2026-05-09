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
    setFavourites(prev =>
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const isFavourite = (workerId) => favourites.includes(workerId);

  return (
    <FavouritesContext.Provider value={{ favourites, toggleFavourite, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => useContext(FavouritesContext);
