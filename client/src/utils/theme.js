const THEME_KEY = 'theme';

export function getTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  window.dispatchEvent(new CustomEvent('theme-change', { detail: isDark ? 'dark' : 'light' }));
  return isDark ? 'dark' : 'light';
}

export function loadTheme() {
  return applyTheme(getTheme());
}

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  return applyTheme(next);
}
