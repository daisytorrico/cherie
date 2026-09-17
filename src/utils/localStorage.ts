import { useState, useEffect } from 'react';

export default function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (val: T | ((val: T) => T)) => void] {
  // Leer localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error('Error leyendo localStorage', error);
      return initialValue;
    }
  });

  // Setear localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;

        localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Sincronizar con otros componentes en la misma pestaña
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent('local-storage-sync', {
                detail: { key, newValue: JSON.stringify(valueToStore) },
              })
            );
          }, 0);
        }

        return valueToStore;
      });
    } catch (error) {
      console.error('Error escribiendo en localStorage', error);
    }
  };

  // Sincronizar entre pestañas
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          setStoredValue(
            event.newValue ? (JSON.parse(event.newValue) as T) : initialValue
          );
        } catch (error) {
          console.error('Error sincronizando localStorage', error);
        }
      }
    };

    // Para la misma pestaña
    const handleCustomStorage = (event: CustomEvent) => {
      if (event.detail.key === key) {
        try {
          const newParsed = event.detail.newValue ? (JSON.parse(event.detail.newValue) as T) : initialValue;
          setStoredValue((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(newParsed)) return prev;
            return newParsed;
          });
        } catch (error) {
          console.error('Error sincronizando localStorage (custom)', error);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('local-storage-sync', handleCustomStorage as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('local-storage-sync', handleCustomStorage as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue] as const;
}
