const COMPARE_KEY = 'compare_room_ids';

export function getCompareIds() {
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, 3) : [];
  } catch {
    return [];
  }
}

export function setCompareIds(ids) {
  const normalized = Array.from(new Set((ids || []).filter(Boolean))).slice(0, 3);
  localStorage.setItem(COMPARE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent('compare-change', { detail: normalized }));
  return normalized;
}

export function addCompareId(id) {
  const current = getCompareIds();
  if (current.includes(id)) return current;
  return setCompareIds([...current, id]);
}

export function removeCompareId(id) {
  return setCompareIds(getCompareIds().filter((x) => x !== id));
}

export function isInCompare(id) {
  return getCompareIds().includes(id);
}
