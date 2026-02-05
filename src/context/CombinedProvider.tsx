// context/CombinedProvider.tsx
import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { AppProvider } from './AppContext';

interface CombinedProviderProps {
  children: ReactNode;
}

export const CombinedProvider: React.FC<CombinedProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </AuthProvider>
  );
};