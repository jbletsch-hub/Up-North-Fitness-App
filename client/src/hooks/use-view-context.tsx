import { createContext, useContext, useState, ReactNode } from 'react';

type ViewContext = 'crew' | 'gym';

interface ViewContextValue {
  viewContext: ViewContext;
  setViewContext: (context: ViewContext) => void;
  toggleViewContext: () => void;
  isCrewView: boolean;
  isGymView: boolean;
}

const ViewContextContext = createContext<ViewContextValue | undefined>(undefined);

export function ViewContextProvider({ children }: { children: ReactNode }) {
  const [viewContext, setViewContextState] = useState<ViewContext>(() => {
    const stored = localStorage.getItem('view-context');
    return (stored === 'crew' || stored === 'gym') ? stored : 'gym';
  });

  const setViewContext = (context: ViewContext) => {
    setViewContextState(context);
    localStorage.setItem('view-context', context);
  };

  const toggleViewContext = () => {
    const newContext = viewContext === 'crew' ? 'gym' : 'crew';
    setViewContext(newContext);
  };

  const value: ViewContextValue = {
    viewContext,
    setViewContext,
    toggleViewContext,
    isCrewView: viewContext === 'crew',
    isGymView: viewContext === 'gym',
  };

  return (
    <ViewContextContext.Provider value={value}>
      {children}
    </ViewContextContext.Provider>
  );
}

export function useViewContext() {
  const context = useContext(ViewContextContext);
  if (context === undefined) {
    throw new Error('useViewContext must be used within a ViewContextProvider');
  }
  return context;
}
