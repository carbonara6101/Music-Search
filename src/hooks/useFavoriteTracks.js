import { useState, useEffect } from 'react';

const STORAGE_KEY = 'favorite_tracks';

export default function useFavoriteTracks() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (track) => {
    setFavorites((prev) => prev.some(t => t.id === track.id) ? prev : [...prev, track]);
  };

  const removeFavorite = (trackId) => {
    setFavorites((prev) => prev.filter((t) => t.id !== trackId));
  };

  return { favorites, addFavorite, removeFavorite };
}
