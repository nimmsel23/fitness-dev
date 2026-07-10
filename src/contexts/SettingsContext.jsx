import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

const DAY_START = 8;
const DAY_END   = 20;

export function SettingsProvider({ children }) {
  const [theme, setThemeState]    = useState(() => localStorage.getItem('fitness-theme') || 'nordic');
  const [themeMode, setModeState] = useState(() => localStorage.getItem('fitness-theme-mode') || 'manual');
  const [circDark,  setCircDark]  = useState(() => localStorage.getItem('fitness-circ-dark') || 'nordic');
  const [circLight, setCircLight] = useState(() => localStorage.getItem('fitness-circ-light') || 'honey');
  const [layoutScale, setLayoutScale] = useState(() => parseInt(localStorage.getItem('fitness-layoutScale') || '100', 10));
  const [recentDays, setRecentDays] = useState(() => parseInt(localStorage.getItem('fitness-recentDays') || '7', 10));
  const [coverageThreshold, setCoverageThreshold] = useState(() => parseFloat(localStorage.getItem('fitness-coverageThreshold') || '1.0'));
  const [showAdvanced, setShowAdvanced] = useState(() => localStorage.getItem('fitness-showAdvanced') === 'true');
  const [dashboardHighlighter, setDashboardHighlighter] = useState(() => localStorage.getItem('fitness-dashboardHighlighter') || 'body');
  const [sidebarPinned, setSidebarPinned] = useState(() => localStorage.getItem('fitness-sidebarPinned') !== 'false');
  const [swipeEnabled, setSwipeEnabled] = useState(() => localStorage.getItem('fitness-swipeEnabled') === 'true');
  const [muscleLanguage, setMuscleLanguage] = useState(() => localStorage.getItem('fitness-muscleLanguage') || 'de');
  const [navMode, setNavMode] = useState(() => localStorage.getItem('fitness-navMode') || 'tabs');

  // Persistence
  useEffect(() => { localStorage.setItem('fitness-theme', theme) }, [theme]);
  useEffect(() => { localStorage.setItem('fitness-theme-mode', themeMode) }, [themeMode]);
  useEffect(() => { localStorage.setItem('fitness-circ-dark', circDark) }, [circDark]);
  useEffect(() => { localStorage.setItem('fitness-circ-light', circLight) }, [circLight]);
  useEffect(() => { localStorage.setItem('fitness-layoutScale', layoutScale) }, [layoutScale]);
  useEffect(() => { localStorage.setItem('fitness-recentDays', recentDays) }, [recentDays]);
  useEffect(() => { localStorage.setItem('fitness-coverageThreshold', coverageThreshold) }, [coverageThreshold]);
  useEffect(() => { localStorage.setItem('fitness-showAdvanced', showAdvanced) }, [showAdvanced]);
  useEffect(() => { localStorage.setItem('fitness-dashboardHighlighter', dashboardHighlighter) }, [dashboardHighlighter]);
  useEffect(() => { localStorage.setItem('fitness-sidebarPinned', sidebarPinned) }, [sidebarPinned]);
  useEffect(() => { localStorage.setItem('fitness-swipeEnabled', swipeEnabled) }, [swipeEnabled]);
  useEffect(() => { localStorage.setItem('fitness-muscleLanguage', muscleLanguage) }, [muscleLanguage]);
  useEffect(() => { localStorage.setItem('fitness-navMode', navMode) }, [navMode]);

  // CSS Scale & Theme Logic
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

  const value = {
    theme, setThemeState, themeMode, setModeState,
    circDark, setCircDark, circLight, setCircLight,
    layoutScale, setLayoutScale, recentDays, setRecentDays,
    coverageThreshold, setCoverageThreshold, showAdvanced, setShowAdvanced,
    dashboardHighlighter, setDashboardHighlighter, sidebarPinned, setSidebarPinned,
    swipeEnabled, setSwipeEnabled, muscleLanguage, setMuscleLanguage,
    navMode, setNavMode
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
