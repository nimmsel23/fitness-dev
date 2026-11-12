import { createContext, useContext } from 'react';
import { isStandaloneHost } from './externalSessionApps.js';

const SessionShellContext = createContext(null);

export function SessionShellProvider({ inShell, children }) {
  return (
    <SessionShellContext.Provider value={inShell}>
      {children}
    </SessionShellContext.Provider>
  );
}

export function useInShell() {
  const value = useContext(SessionShellContext);
  if (typeof value === 'boolean') return value;
  return !isStandaloneHost();
}
