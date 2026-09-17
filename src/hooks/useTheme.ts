import { useEffect } from 'react';
import useLocalStorage from '../utils/localStorage';

export default function useTheme() {
  const getInitialTheme = (): 'light' | 'dark' => {
    try {
      const saved = localStorage.getItem('app-theme');
      if (saved) return JSON.parse(saved);
      if (
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        return 'dark';
      }
    } catch {}
    return 'light';
  };

  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>(
    'app-theme',
    getInitialTheme()
  );
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  return { theme, toggleTheme };
}
