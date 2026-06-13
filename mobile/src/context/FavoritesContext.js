import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@favorites_v1';
const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(raw => raw ? setFavorites(JSON.parse(raw)) : null)
      .catch(() => {});
  }, []);

  const persist = useCallback(async (updated) => {
    setFavorites(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  }, []);

  // id format: "YYYY-MM-DD-type"  e.g. "2026-06-13-inspiration"
  const isFavorited = useCallback(
    (id) => favorites.some(f => f.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback(async ({ id, type, date, data }) => {
    const exists = favorites.some(f => f.id === id);
    const updated = exists
      ? favorites.filter(f => f.id !== id)
      : [{ id, type, date, savedAt: Date.now(), data }, ...favorites];
    await persist(updated);
  }, [favorites, persist]);

  const removeFavorite = useCallback(async (id) => {
    await persist(favorites.filter(f => f.id !== id));
  }, [favorites, persist]);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorited, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}
