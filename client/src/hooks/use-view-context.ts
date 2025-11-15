import { useState, useEffect } from 'react';

type ViewContext = 'crew' | 'gym';

export function useViewContext() {
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

  return {
    viewContext,
    setViewContext,
    toggleViewContext,
    isCrewView: viewContext === 'crew',
    isGymView: viewContext === 'gym',
  };
}
