import { createSettingsStore } from './settingsStore.js';

// fitness-app standalone (fitness-aos.web.app) — Key-Prefix "fitness-*",
// identisch zu den bisherigen SettingsContext-Keys (keine Migration nötig).
export const useSettingsStore = createSettingsStore('fitness');
