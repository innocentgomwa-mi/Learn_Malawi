import { createContext, useContext, useState } from 'react';

const RefreshRateContext = createContext({
  refreshRate: 30,
  setRefreshRate: () => {},
  refreshSeconds: 30,
  setRefreshSeconds: () => {},
  refreshOptions: [10, 30, 60, 120, 300],
});

export function RefreshRateProvider({ children }) {
  const [refreshSeconds, setRefreshSeconds] = useState(30);
  return (
    <RefreshRateContext.Provider value={{
      refreshRate: refreshSeconds,
      setRefreshRate: setRefreshSeconds,
      refreshSeconds,
      setRefreshSeconds,
      refreshOptions: [10, 30, 60, 120, 300],
    }}>
      {children}
    </RefreshRateContext.Provider>
  );
}

export function useRefreshRate() {
  return useContext(RefreshRateContext);
}
