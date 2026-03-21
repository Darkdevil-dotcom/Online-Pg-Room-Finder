/** Current theme: 'dark' | 'light' (from DOM + localStorage fallback). */
export const getTheme = () => {
  if (typeof document === 'undefined') return 'light';
  if (document.documentElement.classList.contains('dark')) return 'dark';
  const saved = localStorage.getItem('theme');
  return saved === 'dark' ? 'dark' : 'light';
};

export const loadTheme = () => {
  const saved = localStorage.getItem('theme');

  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

/** Toggle theme, persist, notify listeners. Returns 'dark' | 'light'. */
export const toggleTheme = () => {
  const isDark = document.documentElement.classList.contains('dark');
  const next = isDark ? 'light' : 'dark';

  if (isDark) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }

  window.dispatchEvent(new CustomEvent('theme-change', { detail: next }));
  return next;
};