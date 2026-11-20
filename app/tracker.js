// tracker.js — one job: own the earned set (load, save, export, import, reset).
// Progress lives in localStorage under one key; export writes a JSON file the
// user can keep, import reads such a file back and only accepts names the
// trophy list actually holds.
export const STORAGE_KEY = 'gta6-trophy-tracker-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort()));
}

export function exportEarned(earned) {
  const payload = {
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  // Pretty-printed so the exported file is readable when the user opens it.
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function importEarned(file, knownNames) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('not a progress file');
  const known = new Set(knownNames);
  const kept = names.filter((n) => typeof n === 'string' && known.has(n));
  return { earned: new Set(kept), accepted: kept.length, rejected: names.length - kept.length };
}
