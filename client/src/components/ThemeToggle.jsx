import { useEffect, useState } from 'react';
import { getTheme, toggleTheme } from '../utils/theme';

export default function ThemeToggle() {
  const [dark, setDark] = useState(getTheme() === 'dark');

  useEffect(() => {
    const onThemeChange = (event) => setDark((event.detail || getTheme()) === 'dark');
    const onStorage = (event) => {
      if (event.key === 'theme') setDark(getTheme() === 'dark');
    };

    window.addEventListener('theme-change', onThemeChange);
    window.addEventListener('storage', onStorage);
    setDark(getTheme() === 'dark');

    return () => {
      window.removeEventListener('theme-change', onThemeChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const handleToggle = () => {
    const nextTheme = toggleTheme();
    setDark(nextTheme === 'dark');
  };

  return (
    <button
      onClick={handleToggle}
      className="text-sm px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      title="Toggle theme"
      type="button"
    >
      {dark ? 'Light' : 'Dark'}
    </button>
  );
}
