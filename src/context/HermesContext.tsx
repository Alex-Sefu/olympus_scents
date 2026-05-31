import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface HermesContextType {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const HermesContext = createContext<HermesContextType | undefined>(undefined);

export function HermesProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <HermesContext.Provider value={{ open, setOpen, toggle: () => setOpen(o => !o) }}>
      {children}
    </HermesContext.Provider>
  );
}

export function useHermes() {
  const ctx = useContext(HermesContext);
  if (!ctx) throw new Error('useHermes trebuie folosit în HermesProvider');
  return ctx;
}
