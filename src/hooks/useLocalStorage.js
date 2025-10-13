import { useState, useEffect } from 'react';

function getStorageValue(key, defaultValue) {
  // getting stored value
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    try {
      const initial = saved !== null ? JSON.parse(saved) : defaultValue;
      return initial;
    } catch (error) {
      console.error("Error parsing JSON from localStorage", error);
      return defaultValue;
    }
  }
  return defaultValue;
}

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // storing value
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error setting item to localStorage", error);
    }
  }, [key, value]);

  return [value, setValue];
};