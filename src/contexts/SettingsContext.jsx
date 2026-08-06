import { useEffect } from 'react';
import { useSettingsStore } from '../store/index.js';
import { DAY_START, DAY_END } from '../store/settingsStore.js';

// State lebt jetzt im Zustand-Store (src/store/), gemeinsame Definition mit
// der vitalos-Shell (createSettingsStore()) — siehe dortigen Kommentar.
// SettingsProvider bleibt als schlanker Wrapper bestehen: er wendet nur noch
// die DOM-Seiteneffekte an (fontSize-Scaling, data-theme-Attribut), die
// vitalos für sich selbst bereits separat in App.jsx erledigt.
export function SettingsProvider({ children }) {
  const { theme, themeMode, circDark, circLight, layoutScale } = useSettingsStore();

  useEffect(() => { document.documentElement.style.fontSize = `${layoutScale}%`; }, [layoutScale]);

  useEffect(() => {
    if (themeMode === 'manual') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      const hour = new Date().getHours();
      const current = (hour >= DAY_START && hour < DAY_END) ? circLight : circDark;
      document.documentElement.setAttribute('data-theme', current);
    }
  }, [theme, themeMode, circLight, circDark]);

  return children;
}

export const useSettings = () => useSettingsStore();
